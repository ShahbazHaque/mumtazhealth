import { Shield, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JourneySafetyReminderProps {
  journeyType: "pregnancy" | "menopause" | "recovery" | "general" | "mental";
  showPractitionerCTA?: boolean;
  onPractitionerClick?: () => void;
  variant?: "default" | "compact" | "card";
  className?: string;
}

const SAFETY_MESSAGES = {
  pregnancy: "This content is supportive and educational only. It does not replace medical advice or a qualified teacher. Always listen to your body and seek medical guidance if unsure.",
  menopause: "This content offers supportive guidance for your wellbeing journey. It does not replace medical advice. Please consult your healthcare provider for any concerns.",
  recovery: "This content provides gentle support during your recovery. Always follow your medical team's guidance and listen to your body's signals.",
  general: "This app offers supportive, educational guidance only. It does not replace medical advice or qualified practitioner support.",
  mental: "This app offers supportive, educational guidance and does not replace mental health care or medical advice. If you're struggling, please reach out to a mental health professional.",
};

const PRACTITIONER_MESSAGES = {
  pregnancy: "If you'd like personalised pregnancy support, you're welcome to connect with Mumtaz or a qualified professional.",
  menopause: "For deeper, personalised menopause support, Mumtaz offers one-to-one consultations.",
  recovery: "For personalised recovery guidance, you're welcome to connect with a qualified practitioner.",
  general: "For deeper support, consider connecting with a qualified wellness practitioner.",
  mental: "For deeper emotional support, you're welcome to connect with Mumtaz for holistic guidance, and please also consider speaking with a mental health professional.",
};

export function JourneySafetyReminder({ 
  journeyType, 
  showPractitionerCTA = true,
  onPractitionerClick,
  variant = "default",
  className 
}: JourneySafetyReminderProps) {
  const safetyMessage = SAFETY_MESSAGES[journeyType];
  const practitionerMessage = PRACTITIONER_MESSAGES[journeyType];

  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2.5 rounded-lg bg-wellness-sage/5 border border-wellness-sage/15",
        className
      )}>
        <Shield className="w-3.5 h-3.5 text-wellness-sage flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Supportive guidance only — not a replacement for medical advice.
        </p>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "p-4 rounded-2xl bg-gradient-to-br from-wellness-sage/5 to-wellness-lilac/5 border border-wellness-sage/20",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-wellness-sage/10 flex-shrink-0">
            <Shield className="w-5 h-5 text-wellness-sage" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Your wellbeing companion
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {safetyMessage}
              </p>
            </div>

            {showPractitionerCTA && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-wellness-lilac flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">
                      {practitionerMessage}
                    </p>
                    {onPractitionerClick && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onPractitionerClick}
                        className="text-xs border-wellness-lilac/30 hover:bg-wellness-lilac/10"
                      >
                        <MessageCircle className="w-3 h-3 mr-1.5" />
                        Connect with Mumtaz
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-wellness-sage/5 border border-wellness-sage/20">
        <Shield className="w-4 h-4 text-wellness-sage flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {safetyMessage}
        </p>
      </div>

      {showPractitionerCTA && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/15">
          <Heart className="w-4 h-4 text-wellness-lilac flex-shrink-0" />
          <div className="flex-1 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {practitionerMessage}
            </p>
            {onPractitionerClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPractitionerClick}
                className="text-xs text-wellness-lilac hover:text-wellness-lilac hover:bg-wellness-lilac/10 flex-shrink-0"
              >
                Connect →
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JourneySafetyReminder;
