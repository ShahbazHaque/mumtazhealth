import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Lock, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

interface GentleSignInPromptProps {
  open: boolean;
  onClose: () => void;
  feature?: "track" | "save" | "personalise" | "general";
  returnPath?: string;
}

const featureMessages = {
  track: {
    title: "Save Your Progress",
    description: "To track your wellness journey and see your patterns over time, we'll need to save your entries.",
    benefit: "Your check-ins, insights, and progress will be safely stored and available whenever you return."
  },
  save: {
    title: "Keep Your Favorites",
    description: "To save practices and content you love, we'll need a place to keep them for you.",
    benefit: "Build your personal collection of practices that resonate with you."
  },
  personalise: {
    title: "Personalised Just for You",
    description: "To give you recommendations based on your dosha and life stage, we'll need to remember your preferences.",
    benefit: "Get content and guidance tailored to your unique needs."
  },
  general: {
    title: "Continue Your Journey",
    description: "Create a free account to save your progress and access personalised recommendations.",
    benefit: "Pick up right where you left off, every time you return."
  }
};

export function GentleSignInPrompt({ open, onClose, feature = "general", returnPath }: GentleSignInPromptProps) {
  const navigate = useNavigate();
  const message = featureMessages[feature];

  const handleSignIn = () => {
    // Store where user wanted to go
    if (returnPath) {
      localStorage.setItem('mumtaz_return_path', returnPath);
    }
    localStorage.setItem('mumtaz_signin_intent', feature);
    onClose();
    navigate("/auth");
  };

  const handleContinueWithout = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-mumtaz-lilac/30">
        <DialogHeader className="text-center space-y-4 pt-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {message.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefit highlight */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">
                {message.benefit}
              </p>
            </div>
          </div>

          {/* Privacy note */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Lock className="h-3.5 w-3.5" />
            <span>Your information stays private and secure</span>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleSignIn}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <button
                onClick={handleSignIn}
                className="text-sm text-primary hover:underline"
              >
                Already have an account? Sign in
              </button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleContinueWithout}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Continue exploring first
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility function to check if user is signed in
import { SupabaseClient } from "@supabase/supabase-js";

export async function checkAuthAndPrompt(
  supabaseClient: SupabaseClient,
  setShowPrompt: (show: boolean) => void,
  feature?: "track" | "save" | "personalise" | "general"
): Promise<boolean> {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    setShowPrompt(true);
    return false;
  }
  return true;
}

// Hook for easier usage
import { supabase } from "@/integrations/supabase/client";

export function useSignInPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptFeature, setPromptFeature] = useState<"track" | "save" | "personalise" | "general">("general");
  const [returnPath, setReturnPath] = useState<string>();

  const requireAuth = async (
    feature: "track" | "save" | "personalise" | "general" = "general",
    path?: string
  ): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPromptFeature(feature);
      setReturnPath(path);
      setShowPrompt(true);
      return false;
    }
    return true;
  };

  const PromptDialog = () => (
    <GentleSignInPrompt
      open={showPrompt}
      onClose={() => setShowPrompt(false)}
      feature={promptFeature}
      returnPath={returnPath}
    />
  );

  return { requireAuth, PromptDialog, showPrompt, setShowPrompt };
}
