import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Send, Loader2, History, Trash2, MessageCircle, Heart, Leaf, Wind, Moon, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import mumtazAvatar from "@/assets/mumtaz-avatar.jpeg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UserProfile {
  username: string;
  primaryDosha?: string;
  secondaryDosha?: string;
  lifeStage?: string;
  lifePhases?: string[];
  primaryFocus?: string[];
  pregnancyTrimester?: number;
  spiritualPreference?: string;
}

interface Conversation {
  id: string;
  created_at: string;
  preview: string;
}

// Auth-related routes where chatbot should be hidden
const AUTH_ROUTES = ['/auth', '/reset-password', '/onboarding'];

// Quick action buttons configuration
const QUICK_ACTIONS = [
  { id: 'checkin', label: 'Quick check-in', icon: Heart, message: "I'd like to do a quick check-in with myself today." },
  { id: 'gentle', label: 'Something gentle', icon: Leaf, message: "Can you recommend something gentle and supportive for me right now?" },
  { id: 'nutrition', label: 'Nutrition help', icon: Sparkles, message: "I'd like some nutrition guidance based on Ayurveda." },
  { id: 'breathing', label: 'Breathing / calming', icon: Wind, message: "Can you guide me through a calming breathing practice?" },
  { id: 'spiritual', label: 'Spiritual support', icon: Moon, message: "I'm looking for some spiritual support or grounding today." },
];

// Storage keys for persistence
const STORAGE_KEYS = {
  CONVERSATION_ID: 'mumtaz_guide_conversation_id',
  MESSAGES: 'mumtaz_guide_messages',
  SCROLL_POSITION: 'mumtaz_guide_scroll',
  PREVIOUS_ROUTE: 'mumtaz_guide_previous_route',
};

export function MumtazWisdomGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [retryCount, setRetryCount] = useState(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on an auth page - don't render chatbot there
  const isAuthPage = AUTH_ROUTES.some(route => location.pathname.startsWith(route));

  // Load persisted state on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);
    const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const savedPreviousRoute = localStorage.getItem(STORAGE_KEYS.PREVIOUS_ROUTE);
    
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("[CHATBOT_UI_ERROR] Failed to parse saved messages:", e);
      }
    }
    if (savedPreviousRoute) {
      setPreviousRoute(savedPreviousRoute);
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, conversationId);
    }
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  }, [conversationId, messages]);

  // Save current route when opening chatbot
  useEffect(() => {
    if (open && location.pathname !== '/') {
      localStorage.setItem(STORAGE_KEYS.PREVIOUS_ROUTE, location.pathname);
      setPreviousRoute(location.pathname);
    }
  }, [open, location.pathname]);

  useEffect(() => {
    if (open && !isAuthPage) {
      fetchUserProfile();
      loadConversations();
      if (!conversationId) {
        const newId = crypto.randomUUID();
        setConversationId(newId);
      }
      
      // Restore scroll position
      const savedScroll = localStorage.getItem(STORAGE_KEYS.SCROLL_POSITION);
      if (savedScroll && scrollAreaRef.current) {
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = parseInt(savedScroll, 10);
          }
        }, 100);
      }
    } else if (!open) {
      // Save scroll position when closing
      if (scrollAreaRef.current) {
        localStorage.setItem(STORAGE_KEYS.SCROLL_POSITION, String(scrollAreaRef.current.scrollTop));
      }
    }
  }, [open, isAuthPage]);

  useEffect(() => {
    if (open && messages.length === 0 && userProfile && !isAuthPage) {
      const greeting: Message = {
        role: "assistant",
        content: `Hello ${userProfile.username}, I'm here to support you on your wellness journey. How can I help you today?\n\nYou can ask me about yoga, Ayurveda, nutrition, breathwork, or simply check in with yourself. 💜`,
      };
      setMessages([greeting]);
    }
  }, [open, userProfile, messages.length, isAuthPage]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Don't render on auth pages to avoid interference with CTAs
  if (isAuthPage) {
    return null;
  }

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
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Cast to any to access new columns that may not be in types yet
      const wp = wellnessProfile as any;
      
      setUserProfile({
        username: profile?.username || "friend",
        primaryDosha: wp?.primary_dosha || undefined,
        secondaryDosha: wp?.secondary_dosha || undefined,
        lifeStage: wp?.life_stage || undefined,
        lifePhases: wp?.life_phases || undefined,
        primaryFocus: wp?.primary_focus || undefined,
        pregnancyTrimester: wp?.current_trimester || undefined,
        spiritualPreference: wp?.spiritual_preference || undefined,
      });
    } catch (error) {
      console.error("[CHATBOT_UI_ERROR] Error fetching profile:", error);
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
      console.error("[CHATBOT_UI_ERROR] Error loading conversations:", error);
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
      console.error("[CHATBOT_UI_ERROR] Error loading conversation:", error);
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
        const newId = crypto.randomUUID();
        setConversationId(newId);
        localStorage.removeItem(STORAGE_KEYS.MESSAGES);
      }

      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    } catch (error) {
      console.error("[CHATBOT_UI_ERROR] Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    const newId = crypto.randomUUID();
    setConversationId(newId);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    setActiveTab("chat");
    setRetryCount(0);
    setLastFailedMessage(null);
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
      console.error("[CHATBOT_UI_ERROR] Error saving message:", error);
    }
  };

  const sendMessage = useCallback(async (messageText?: string, isRetry = false) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    // Validate input length
    if (textToSend.length > 2000) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 2000 characters",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: textToSend };
    
    if (!isRetry) {
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      await saveMessage(userMessage);
    }
    
    setLoading(true);
    setLastFailedMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke("mumtaz-wisdom-guide", {
        body: {
          messages: isRetry ? messages : [...messages, userMessage],
          userName: userProfile?.username,
          primaryDosha: userProfile?.primaryDosha,
          secondaryDosha: userProfile?.secondaryDosha,
          lifeStage: userProfile?.lifeStage,
          lifePhases: userProfile?.lifePhases,
          primaryFocus: userProfile?.primaryFocus,
          pregnancyTrimester: userProfile?.pregnancyTrimester,
          spiritualPreference: userProfile?.spiritualPreference,
        },
      });

      if (error) {
        console.error("[CHATBOT_API_ERROR] Function invoke error:", error);
        throw error;
      }

      if (data?.error) {
        console.error("[CHATBOT_API_ERROR] API returned error:", data.error, data.errorCode);
        
        // Check if we should auto-retry (once for transient errors)
        if (!isRetry && retryCount < 1 && data.errorCode === 'INTERNAL_ERROR') {
          console.log("[CHATBOT_API] Auto-retrying after transient error...");
          setRetryCount(prev => prev + 1);
          setTimeout(() => sendMessage(textToSend, true), 1500);
          return;
        }
        
        // Show friendly error message
        toast({
          title: "Service Notice",
          description: data.error,
          variant: "destructive",
        });
        setLastFailedMessage(textToSend);
        return;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      await saveMessage(assistantMessage);
      await loadConversations();
      setRetryCount(0);
    } catch (error: any) {
      console.error("[CHATBOT_API_ERROR] Unexpected error:", error);
      
      // Auto-retry once for network errors
      if (!isRetry && retryCount < 1) {
        console.log("[CHATBOT_API] Auto-retrying after network error...");
        setRetryCount(prev => prev + 1);
        setTimeout(() => sendMessage(textToSend, true), 1500);
        return;
      }
      
      toast({
        title: "Connection Issue",
        description: "I'm having trouble responding right now. Please try again in a moment.",
        variant: "destructive",
      });
      setLastFailedMessage(textToSend);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, userProfile, conversationId, retryCount]);

  const handleRetry = () => {
    if (lastFailedMessage) {
      setRetryCount(0);
      sendMessage(lastFailedMessage, true);
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    sendMessage(action.message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBackToRoute = () => {
    if (previousRoute) {
      navigate(previousRoute);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isMobile ? (
          <Button
            size="icon"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-wellness-lilac to-accent hover:scale-110 transition-all duration-300 z-40 animate-fade-in"
            aria-label="Ask Mumtaz a question"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <Button
            className="fixed bottom-24 right-6 rounded-full shadow-lg bg-gradient-to-br from-wellness-lilac to-accent hover:scale-105 transition-all duration-300 pl-6 pr-5 py-6 gap-2 z-40 animate-fade-in"
            aria-label="Ask Mumtaz a question"
          >
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-white font-medium text-sm">Ask me a question</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-2xl p-0 gap-0 animate-scale-in max-h-[90vh] h-[600px] flex flex-col overflow-hidden"
        aria-describedby="chatbot-description"
      >
        <VisuallyHidden>
          <DialogTitle>Mumtaz Wisdom Guide</DialogTitle>
          <DialogDescription id="chatbot-description">
            Your personal wellness companion chatbot
          </DialogDescription>
        </VisuallyHidden>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "history")} className="flex flex-col h-full min-h-0">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-wellness-lilac/10 to-wellness-sage/10 shrink-0">
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

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden">
            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pt-3 pb-2 border-b bg-muted/30 shrink-0">
                <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      disabled={loading}
                      className="text-xs h-7 px-2.5 gap-1.5 hover:bg-accent/10"
                    >
                      <action.icon className="h-3 w-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Scrollable messages area */}
            <div 
              ref={scrollAreaRef}
              className="flex-1 overflow-y-auto p-4 min-h-0"
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 border border-accent/30 shrink-0">
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
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 border border-accent/30 shrink-0">
                      <AvatarFallback className="bg-accent/20">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Retry button for failed messages */}
                {lastFailedMessage && !loading && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="gap-2 text-muted-foreground"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try again
                    </Button>
                  </div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Fixed input area at bottom */}
            <div className="p-4 border-t bg-background shrink-0 pb-safe space-y-2">
              {/* Back to route & New conversation buttons */}
              <div className="flex gap-2">
                {previousRoute && previousRoute !== location.pathname && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToRoute}
                    className="flex-1 gap-1.5"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to where I was
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewConversation}
                  className={previousRoute && previousRoute !== location.pathname ? "" : "w-full"}
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  New Conversation
                </Button>
              </div>
              
              {/* Input field */}
              <div className="flex gap-2">
                <Input
                  placeholder={`Ask Mumtaz for guidance${userProfile?.username ? `, ${userProfile.username}` : ""}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-wellness-lilac to-accent"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 min-h-0 overflow-hidden">
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
