import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Send, Loader2, History, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import mumtazAvatar from "@/assets/mumtaz-avatar.jpeg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UserProfile {
  username: string;
  primaryDosha?: string;
  secondaryDosha?: string;
  lifeStage?: string;
}

interface Conversation {
  id: string;
  created_at: string;
  preview: string;
}

export function MumtazWisdomGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchUserProfile();
      loadConversations();
      if (!conversationId) {
        // Start a new conversation
        setConversationId(crypto.randomUUID());
      }
    }
  }, [open]);

  useEffect(() => {
    if (open && messages.length === 0 && userProfile) {
      // Add initial greeting with user's name
      const greeting = {
        role: "assistant" as const,
        content: `Hi ${userProfile.username}, how can I support you today?`,
      };
      setMessages([greeting]);
    }
  }, [open, userProfile]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();

      const { data: wellnessProfile } = await supabase
        .from("user_wellness_profiles")
        .select("primary_dosha, secondary_dosha, life_stage")
        .eq("user_id", user.id)
        .single();

      setUserProfile({
        username: profile?.username || "friend",
        primaryDosha: wellnessProfile?.primary_dosha || undefined,
        secondaryDosha: wellnessProfile?.secondary_dosha || undefined,
        lifeStage: wellnessProfile?.life_stage || undefined,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("conversation_id, content, created_at")
        .eq("user_id", user.id)
        .eq("role", "user")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by conversation_id and get the first message as preview
      const conversationMap = new Map<string, Conversation>();
      data?.forEach((msg) => {
        if (!conversationMap.has(msg.conversation_id)) {
          conversationMap.set(msg.conversation_id, {
            id: msg.conversation_id,
            created_at: msg.created_at,
            preview: msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages((data || []).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })));
      setConversationId(convId);
      setActiveTab("chat");
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const deleteConversation = async (convId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", user.id)
        .eq("conversation_id", convId);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== convId));
      
      if (conversationId === convId) {
        setMessages([]);
        setConversationId(crypto.randomUUID());
      }

      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(crypto.randomUUID());
    setActiveTab("chat");
  };

  const saveMessage = async (message: Message) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !conversationId) return;

      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Save user message
    await saveMessage(userMessage);

    try {
      const { data, error } = await supabase.functions.invoke("mumtaz-wisdom-guide", {
        body: {
          messages: [...messages, userMessage],
          userName: userProfile?.username,
          primaryDosha: userProfile?.primaryDosha,
          secondaryDosha: userProfile?.secondaryDosha,
          lifeStage: userProfile?.lifeStage,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Service Notice",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message
      await saveMessage(assistantMessage);
      
      // Reload conversations list to show new conversation
      await loadConversations();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-24 right-6 rounded-full shadow-lg bg-gradient-to-br from-wellness-lilac to-accent hover:scale-105 transition-transform pl-6 pr-5 py-6 gap-2 z-40"
        >
          <Sparkles className="h-5 w-5 text-white" />
          <span className="text-white font-medium text-sm">Ask me a question</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl h-[600px] p-0 gap-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "history")} className="h-full flex flex-col">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-wellness-lilac/10 to-wellness-sage/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-accent">
                  <AvatarImage src={mumtazAvatar} />
                  <AvatarFallback className="bg-accent/20 text-accent">
                    <Sparkles className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">
                    Mumtaz Wisdom Guide
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Your personal wellness companion</p>
                </div>
              </div>
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="chat" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 h-[calc(600px-80px)]">
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 border border-accent/30">
                        <AvatarImage src={mumtazAvatar} />
                        <AvatarFallback className="bg-accent/20">
                          <Sparkles className="h-4 w-4 text-accent" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 border border-accent/30">
                      <AvatarFallback className="bg-accent/20">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewConversation}
                  className="w-full"
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  New Conversation
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={`Ask Mumtaz for guidance${userProfile?.username ? `, ${userProfile.username}` : ""}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-wellness-lilac to-accent"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 h-[calc(600px-80px)]">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversation history yet</p>
                    <p className="text-sm">Start a chat to save your conversations</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-start gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => loadConversation(conv.id)}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-medium">{conv.preview}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.created_at).toLocaleDateString()} at{" "}
                          {new Date(conv.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteConversation(conv.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
