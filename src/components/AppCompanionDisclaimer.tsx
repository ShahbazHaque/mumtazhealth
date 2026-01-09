import { Heart, Shield } from "lucide-react";

interface AppCompanionDisclaimerProps {
  variant?: "inline" | "card" | "subtle";
  showMedicalNote?: boolean;
  className?: string;
}

export function AppCompanionDisclaimer({ 
  variant = "inline", 
  showMedicalNote = true,
  className = "" 
}: AppCompanionDisclaimerProps) {
  if (variant === "subtle") {
    return (
      <p className={`text-xs text-muted-foreground italic ${className}`}>
        This app is a companion for your wellness journey — not a replacement for professional care.
        {showMedicalNote && " Please consult your healthcare provider for medical guidance."}
      </p>
    );
  }

  if (variant === "card") {
    return (
      <div className={`p-4 rounded-lg bg-wellness-sage/5 border border-wellness-sage/20 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-wellness-sage/10 flex-shrink-0">
            <Shield className="w-4 h-4 text-wellness-sage" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-wellness-taupe font-medium">
              Your wellness companion
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This app offers educational content and supportive guidance to help you understand your body 
              and wellbeing. It is designed to complement — not replace — the care of qualified practitioners, 
              medical professionals, or personalised treatment plans.
            </p>
            {showMedicalNote && (
              <p className="text-xs text-muted-foreground italic">
                Always seek advice from your healthcare team for medical concerns.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg bg-wellness-lilac/5 border border-wellness-lilac/15 ${className}`}>
      <Heart className="w-4 h-4 text-wellness-lilac flex-shrink-0" />
      <p className="text-xs text-muted-foreground">
        A gentle guide for your journey — for deeper or complex needs, 
        personalised practitioner support is always recommended.
      </p>
    </div>
  );
}

export default AppCompanionDisclaimer;
