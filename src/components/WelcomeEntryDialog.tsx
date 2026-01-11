import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, BookOpen, Activity, Sparkles, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CORE_MESSAGES, WELCOME_MESSAGES, JOURNEY_MESSAGES } from "@/constants/appMessaging";

interface WelcomeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeEntryDialog({ open, onOpenChange }: WelcomeEntryDialogProps) {
  const navigate = useNavigate();

  const handleOptionClick = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const entryOptions = [
    {
      id: "quick-checkin",
      title: "Quick check-in",
      description: WELCOME_MESSAGES.quickCheckInInvite,
      icon: Heart,
      color: "accent",
      path: "/onboarding?mode=quick",
    },
    {
      id: "explore-library",
      title: "Explore the library",
      description: WELCOME_MESSAGES.exploreInvite,
      icon: BookOpen,
      color: "primary",
      path: "/auth?redirect=content-library",
    },
    {
      id: "begin-tracking",
      title: "Begin tracking",
      description: WELCOME_MESSAGES.trackingInvite,
      icon: Activity,
      color: "primary",
      path: "/onboarding",
    },
    {
      id: "update-journey",
      title: "Update my journey",
      description: WELCOME_MESSAGES.journeyUpdate,
      icon: Sparkles,
      color: "accent",
      path: "/auth",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 overflow-hidden"
        aria-describedby="welcome-dialog-description"
      >
        <VisuallyHidden>
          <DialogTitle>Welcome to Mumtaz Health</DialogTitle>
        </VisuallyHidden>
        <DialogDescription id="welcome-dialog-description" className="sr-only">
          Choose how you'd like to get started with your wellness journey
        </DialogDescription>
        
        <div className="bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20 p-6 text-center border-b">
          <Logo size="lg" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {WELCOME_MESSAGES.newUser}
          </h2>
          <p className="text-muted-foreground">
            {WELCOME_MESSAGES.entryPrompt}
          </p>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {entryOptions.map((option) => {
            const Icon = option.icon;
            const isAccent = option.color === "accent";
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.path)}
                className={`w-full p-4 rounded-xl border text-left transition-all hover:shadow-md active:scale-[0.98] group ${
                  isAccent 
                    ? "bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20 hover:border-accent/40" 
                    : "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                    isAccent ? "bg-accent/20" : "bg-primary/20"
                  }`}>
                    <Icon className={`w-6 h-6 ${isAccent ? "text-accent" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-foreground mb-1 transition-colors ${
                      isAccent ? "group-hover:text-accent" : "group-hover:text-primary"
                    }`}>
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:translate-x-1 transition-all ${
                    isAccent ? "group-hover:text-accent" : "group-hover:text-primary"
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 pt-2 border-t bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            {CORE_MESSAGES.paceMessage}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
