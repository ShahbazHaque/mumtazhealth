import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Power, Keyboard } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

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
    patterns: ["content", "content library", "library", "show content", "take me to my library"],
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
  {
    patterns: ["resume", "resume where i left off", "continue", "continue where i left off"],
    action: "resume",
    response: "Resuming your last activity"
  },
  // Pregnancy trimester commands
  {
    patterns: ["trimester 1", "first trimester", "trimester one", "pregnancy trimester 1", "open pregnancy trimester 1 content"],
    action: "/content-library?pregnancy=trimester_1",
    response: "Showing first trimester content"
  },
  {
    patterns: ["trimester 2", "second trimester", "trimester two", "pregnancy trimester 2", "open pregnancy trimester 2 content"],
    action: "/content-library?pregnancy=trimester_2",
    response: "Showing second trimester content"
  },
  {
    patterns: ["trimester 3", "third trimester", "trimester three", "pregnancy trimester 3", "open pregnancy trimester 3 content"],
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
    patterns: ["yoga", "show yoga", "yoga content", "yoga for back pain", "find yoga"],
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
    patterns: ["vata content", "show vata", "vata", "vata balancing", "vata practices", "show me vata content"],
    action: "/content-library?dosha=vata",
    response: "Showing Vata balancing content"
  },
  {
    patterns: ["pitta content", "show pitta", "pitta", "pitta balancing", "pitta practices", "show me pitta content"],
    action: "/content-library?dosha=pitta",
    response: "Showing Pitta balancing content"
  },
  {
    patterns: ["kapha content", "show kapha", "kapha", "kapha balancing", "kapha practices", "show me kapha content"],
    action: "/content-library?dosha=kapha",
    response: "Showing Kapha balancing content"
  },
];

// Haptic feedback utility
const triggerHapticFeedback = (type: 'success' | 'light' | 'medium' = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'success':
        navigator.vibrate([50, 30, 50]);
        break;
      case 'medium':
        navigator.vibrate(50);
        break;
      case 'light':
      default:
        navigator.vibrate(25);
    }
  }
};

export function VoiceNavigator({ className }: VoiceNavigatorProps) {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(() => {
    return localStorage.getItem('voiceModeEnabled') === 'true';
  });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // Save voice mode preference
  useEffect(() => {
    localStorage.setItem('voiceModeEnabled', voiceModeEnabled.toString());
  }, [voiceModeEnabled]);

  // Keyboard shortcut handler (Ctrl/Cmd + M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (voiceModeEnabled && recognition && !isListening) {
          toggleListening();
          triggerHapticFeedback('light');
        } else if (!voiceModeEnabled) {
          toast.info("Enable Voice Mode first", {
            description: "Toggle voice mode to use keyboard shortcuts"
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceModeEnabled, recognition, isListening]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Voice command:", transcript);
        triggerHapticFeedback('success');
        handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoiceCommand = useCallback((transcript: string) => {
    for (const command of voiceCommands) {
      for (const pattern of command.patterns) {
        if (transcript.includes(pattern)) {
          triggerHapticFeedback('success');
          toast.success(command.response, {
            icon: <Volume2 className="h-4 w-4" />
          });

          // Handle special "resume" command
          if (command.action === "resume") {
            const lastActivity = localStorage.getItem('lastActivity');
            if (lastActivity) {
              const activity = JSON.parse(lastActivity);
              navigate(activity.path || '/');
            } else {
              toast.info("No previous activity found");
            }
            return;
          }

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
      triggerHapticFeedback('medium');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        triggerHapticFeedback('light');
        toast.info("Listening... Say a command", {
          description: "e.g., 'Show my favorites' or 'Vata content'",
          duration: 3000
        });
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  }, [recognition, isListening]);

  const toggleVoiceMode = useCallback(() => {
    const newState = !voiceModeEnabled;
    setVoiceModeEnabled(newState);
    triggerHapticFeedback('medium');
    toast.success(newState ? "Voice Mode Activated" : "Voice Mode Deactivated", {
      description: newState ? "Press Ctrl+M or tap the mic to speak" : "Voice commands disabled"
    });
  }, [voiceModeEnabled]);

  const commandCategories = [
    {
      name: "Navigation",
      commands: voiceCommands.filter(c =>
        c.patterns.some(p => ["dashboard", "home", "settings", "bookings", "practice", "insights", "tracker", "content", "library"].some(k => p.includes(k)))
      )
    },
    {
      name: "Favorites & Resume",
      commands: voiceCommands.filter(c => c.patterns.some(p => p.includes("favorite") || p.includes("resume") || p.includes("continue")))
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
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Voice Mode Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={voiceModeEnabled}
                  onCheckedChange={toggleVoiceMode}
                  className="data-[state=checked]:bg-primary"
                  aria-label="Toggle voice mode"
                />
                {voiceModeEnabled && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Voice
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{voiceModeEnabled ? "Voice Mode Active" : "Activate Voice Mode"}</p>
              <p className="text-xs text-muted-foreground">Navigate hands-free</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Microphone Button */}
        {voiceModeEnabled && (
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
                  className={`relative ${isListening ? "animate-pulse bg-primary ring-4 ring-primary/30" : ""}`}
                  aria-label={isListening ? "Stop listening" : "Start voice command"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      {/* Listening indicator rings */}
                      <span className="absolute inset-0 rounded-md animate-ping bg-primary/40" />
                    </>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListening ? "Listening... Click to stop" : "Click to speak"}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Keyboard className="h-3 w-3" />
                  Ctrl+M • Hold for help
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Voice Commands Help Dialog */}
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
              {/* Keyboard shortcut info */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Keyboard className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">Ctrl+M</kbd> to activate voice
                </span>
              </div>

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
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Tips:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Click the microphone button to start listening</li>
                  <li>Speak clearly after the listening indicator appears</li>
                  <li>Use keyboard shortcut Ctrl+M (or Cmd+M on Mac)</li>
                  <li>Haptic feedback confirms command recognition</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}