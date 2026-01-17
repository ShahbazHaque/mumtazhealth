import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart, Sparkles, ArrowRight, RotateCcw } from "lucide-react";

interface LifeStageHelperProps {
  onSelectStage: (stage: string) => void;
  onCancel: () => void;
}

export function LifeStageHelper({ onSelectStage, onCancel }: LifeStageHelperProps) {
  const [periodStatus, setPeriodStatus] = useState<string>("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const getSuggestedStage = (): { stage: string; label: string } => {
    switch (periodStatus) {
      case "yes":
        return { stage: "menstrual_cycle", label: "Regular Menstrual Cycle" };
      case "changing":
        return { stage: "cycle_changes", label: "Cycle Changes / Hormonal Shifts" };
      case "sometimes":
        return { stage: "perimenopause", label: "Perimenopause" };
      case "rarely":
        return { stage: "peri_menopause_transition", label: "Peri → Menopause Transition" };
      case "no":
        return { stage: "menopause", label: "Menopause or Post-Menopause" };
      default:
        return { stage: "cycle_changes", label: "Cycle Changes / Hormonal Shifts" };
    }
  };

  const handleContinue = () => {
    if (periodStatus) {
      setShowSuggestion(true);
    }
  };

  const handleAcceptSuggestion = () => {
    const suggestion = getSuggestedStage();
    // If they said "no" to periods, let them choose between menopause and post-menopause
    if (periodStatus === "no") {
      onSelectStage("menopause");
    } else {
      onSelectStage(suggestion.stage);
    }
  };

  if (showSuggestion) {
    const suggestion = getSuggestedStage();
    
    return (
      <div className="space-y-6 p-6 bg-wellness-lilac/5 rounded-xl border border-wellness-lilac/20">
        {/* Suggestion */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-wellness-lilac/10">
              <Sparkles className="w-6 h-6 text-wellness-lilac" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-wellness-taupe font-medium">
              Based on what you shared, content for
            </p>
            <p className="text-lg font-semibold text-wellness-lilac">
              {suggestion.label}
            </p>
            <p className="text-wellness-taupe font-medium">
              may feel most supportive right now.
            </p>
          </div>
        </div>

        {/* Reassurance */}
        <div className="p-4 bg-wellness-sage/10 rounded-lg border border-wellness-sage/20">
          <p className="text-sm text-muted-foreground italic text-center">
            This is just a gentle guide. Your body is unique, and you can always change this later.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleAcceptSuggestion}
            className="w-full bg-wellness-lilac hover:bg-wellness-lilac/90 text-white"
          >
            <Heart className="w-4 h-4 mr-2" />
            Use this suggestion
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full border-wellness-sage/30 text-wellness-taupe hover:bg-wellness-sage/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Choose a different phase
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-wellness-lilac/5 rounded-xl border border-wellness-lilac/20">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-wellness-sage/10">
            <Heart className="w-6 h-6 text-wellness-sage" />
          </div>
        </div>
        <h3 className="font-medium text-wellness-taupe">
          That's completely okay
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Many women move through phases gradually. You can choose what feels closest for now — 
          this can be updated anytime in Settings.
        </p>
      </div>

      {/* Optional Question */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-wellness-taupe">
            Are you still having periods? <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          
          <RadioGroup value={periodStatus} onValueChange={setPeriodStatus}>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-wellness-sage/5 transition-colors">
                <RadioGroupItem value="yes" id="periods-yes" />
                <Label htmlFor="periods-yes" className="cursor-pointer text-sm flex-1">
                  Yes, regularly
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-wellness-sage/5 transition-colors">
                <RadioGroupItem value="changing" id="periods-changing" />
                <Label htmlFor="periods-changing" className="cursor-pointer text-sm flex-1">
                  Yes, but changing (shorter, longer, heavier, lighter)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-wellness-sage/5 transition-colors">
                <RadioGroupItem value="sometimes" id="periods-sometimes" />
                <Label htmlFor="periods-sometimes" className="cursor-pointer text-sm flex-1">
                  Sometimes / Irregular
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-wellness-sage/5 transition-colors">
                <RadioGroupItem value="rarely" id="periods-rarely" />
                <Label htmlFor="periods-rarely" className="cursor-pointer text-sm flex-1">
                  Rarely / Very infrequent
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:bg-wellness-sage/5 transition-colors">
                <RadioGroupItem value="no" id="periods-no" />
                <Label htmlFor="periods-no" className="cursor-pointer text-sm flex-1">
                  No
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 border-wellness-sage/30 text-wellness-taupe hover:bg-wellness-sage/10"
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!periodStatus}
          className="flex-1 bg-wellness-lilac hover:bg-wellness-lilac/90 text-white"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Skip option */}
      <p className="text-center">
        <button 
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-wellness-lilac underline-offset-4 hover:underline transition-colors"
        >
          Skip and choose manually instead
        </button>
      </p>
    </div>
  );
}
