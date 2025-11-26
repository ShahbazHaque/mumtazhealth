import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Send, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import mumtazAvatar from "@/assets/mumtaz-avatar.jpg";

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

export function MumtazWisdomGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchUserProfile();
      if (messages.length === 0) {
        // Add initial greeting
        setMessages([
          {
            role: "assistant",
            content: "Hello beautiful! I'm here to support you on your wellness journey. How can I help you today?",
          },
        ]);
      }
    }
  }, [open]);

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

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
          className="fixed bottom-6 right-6 rounded-full shadow-lg bg-gradient-to-br from-wellness-lilac to-accent hover:scale-105 transition-transform pl-6 pr-5 py-6 gap-2"
        >
          <Sparkles className="h-5 w-5 text-white" />
          <span className="text-white font-medium text-sm">Ask me a question</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl h-[600px] p-0 gap-0">
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
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(600px-80px)] p-0">
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
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
