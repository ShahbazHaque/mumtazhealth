import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VoiceNavigatorProps {
  className?: string;
}

// Voice command patterns and their navigation targets
const voiceCommands = [
  { 
    patterns: ["favorites", "my favorites", "show favorites", "show my favorites"],
    action: "/content-library?filter=favorites",
    response: "Opening your favorites"
  },
  { 
    patterns: ["dashboard", "home", "go home", "take me home"],
    action: "/",
    response: "Going to dashboard"
  },
  { 
    patterns: ["content", "content library", "library", "show content"],
    action: "/content-library",
    response: "Opening content library"
  },
  { 
    patterns: ["tracker", "daily tracker", "track", "wellness tracker"],
    action: "/tracker",
    response: "Opening daily tracker"
  },
  { 
    patterns: ["settings", "preferences", "my settings"],
    action: "/settings",
    response: "Opening settings"
  },
  { 
    patterns: ["insights", "my insights", "wellness insights"],
    action: "/insights",
    response: "Opening your insights"
  },
  { 
    patterns: ["bookings", "book", "appointments", "schedule"],
    action: "/bookings",
    response: "Opening bookings"
  },
  { 
    patterns: ["practice", "daily practice", "my practice"],
    action: "/my-daily-practice",
    response: "Opening your daily practice"
  },
  // Pregnancy trimester commands
  { 
    patterns: ["trimester 1", "first trimester", "trimester one", "pregnancy trimester 1"],
    action: "/content-library?pregnancy=trimester_1",
    response: "Showing first trimester content"
  },
  { 
    patterns: ["trimester 2", "second trimester", "trimester two", "pregnancy trimester 2"],
    action: "/content-library?pregnancy=trimester_2",
    response: "Showing second trimester content"
  },
  { 
    patterns: ["trimester 3", "third trimester", "trimester three", "pregnancy trimester 3"],
    action: "/content-library?pregnancy=trimester_3",
    response: "Showing third trimester content"
  },
  // Life stage commands
  { 
    patterns: ["menopause content", "menopause", "show menopause"],
    action: "/content-library?stage=menopause",
    response: "Showing menopause content"
  },
  { 
    patterns: ["perimenopause content", "perimenopause", "show perimenopause"],
    action: "/content-library?stage=perimenopause",
    response: "Showing perimenopause content"
  },
  { 
    patterns: ["postpartum content", "postpartum", "show postpartum"],
    action: "/content-library?stage=postpartum",
    response: "Showing postpartum content"
  },
  // Content type commands
  { 
    patterns: ["yoga", "show yoga", "yoga content"],
    action: "/content-library?type=yoga",
    response: "Showing yoga content"
  },
  { 
    patterns: ["meditation", "show meditation", "meditation content"],
    action: "/content-library?type=meditation",
    response: "Showing meditation content"
  },
  { 
    patterns: ["nutrition", "recipes", "show recipes", "food"],
    action: "/content-library?type=nutrition",
    response: "Showing nutrition content"
  },
  // Dosha-specific commands
  { 
    patterns: ["vata content", "show vata", "vata", "vata balancing", "vata practices"],
    action: "/content-library?dosha=vata",
    response: "Showing Vata balancing content"
  },
  { 
    patterns: ["pitta content", "show pitta", "pitta", "pitta balancing", "pitta practices"],
    action: "/content-library?dosha=pitta",
    response: "Showing Pitta balancing content"
  },
  { 
    patterns: ["kapha content", "show kapha", "kapha", "kapha balancing", "kapha practices"],
    action: "/content-library?dosha=kapha",
    response: "Showing Kapha balancing content"
  },
];

export function VoiceNavigator({ className }: VoiceNavigatorProps) {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Voice command:", transcript);
        handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please enable it in your browser settings.");
        } else if (event.error !== 'aborted') {
          toast.error("Could not understand. Please try again.");
        }
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const handleVoiceCommand = useCallback((transcript: string) => {
    for (const command of voiceCommands) {
      for (const pattern of command.patterns) {
        if (transcript.includes(pattern)) {
          toast.success(command.response, {
            icon: <Volume2 className="h-4 w-4" />
          });
          navigate(command.action);
          return;
        }
      }
    }

    toast.info(`Command not recognized: "${transcript}"`, {
      description: "Hold the mic button for help"
    });
  }, [navigate]);

  const handleMouseDown = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowHelp(true);
    }, 500);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress.current && !showHelp) {
      toggleListening();
    }
  }, [showHelp]);

  const handleMouseLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.abort();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast.info("Listening... Say a command", {
          description: "e.g., 'Show my favorites' or 'Vata content'",
          duration: 3000
        });
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  }, [recognition, isListening]);

  const commandCategories = [
    { 
      name: "Navigation", 
      commands: voiceCommands.filter(c => 
        c.patterns.some(p => ["dashboard", "home", "settings", "bookings", "practice", "insights", "tracker", "content", "library"].some(k => p.includes(k)))
      )
    },
    { 
      name: "Favorites", 
      commands: voiceCommands.filter(c => c.patterns.some(p => p.includes("favorite")))
    },
    { 
      name: "Dosha Content", 
      commands: voiceCommands.filter(c => c.patterns.some(p => ["vata", "pitta", "kapha"].some(d => p.includes(d))))
    },
    { 
      name: "Pregnancy", 
      commands: voiceCommands.filter(c => c.patterns.some(p => p.includes("trimester")))
    },
    { 
      name: "Life Stages", 
      commands: voiceCommands.filter(c => c.patterns.some(p => ["menopause", "perimenopause", "postpartum"].some(s => p.includes(s))))
    },
    { 
      name: "Content Types", 
      commands: voiceCommands.filter(c => c.patterns.some(p => ["yoga", "meditation", "nutrition", "recipes"].some(t => p.includes(t))))
    },
  ];

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              className={`${className} ${isListening ? "animate-pulse bg-primary" : ""}`}
              aria-label={isListening ? "Stop listening" : "Start voice command"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isListening ? "Click to stop" : "Voice commands"}</p>
            <p className="text-xs text-muted-foreground">
              Hold for help • Click to speak
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Voice Commands
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {commandCategories.map((category) => (
                category.commands.length > 0 && (
                  <div key={category.name}>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      {category.name}
                    </h4>
                    <div className="space-y-1">
                      {category.commands.map((cmd, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50 text-sm"
                        >
                          <span className="text-muted-foreground">
                            "{cmd.patterns[0]}"
                          </span>
                          <span className="text-xs text-primary font-medium">
                            {cmd.response}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Click the microphone button to start listening, then speak your command clearly.
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
