import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Heart, ArrowRight, Shield, Flower2, Activity, Bone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConditionsSelectorProps {
  onComplete: (conditions: string[]) => void;
  onBack?: () => void;
  onSkip?: () => void;
  initialConditions?: string[];
}

const CONDITIONS_OPTIONS = [
  { 
    value: "pelvic_floor", 
    label: "Pelvic floor support", 
    icon: Flower2,
    description: "Gentle reconnection and strengthening",
    color: "wellness-lilac"
  },
  { 
    value: "endometriosis", 
    label: "Endometriosis", 
    icon: Heart,
    description: "Pain-aware, restorative practices",
    color: "wellness-sage"
  },
  { 
    value: "pcos", 
    label: "PCOS", 
    icon: Activity,
    description: "Hormone-supportive, grounding movement",
    color: "wellness-lilac"
  },
  { 
    value: "arthritis", 
    label: "Arthritis or joint care", 
    icon: Bone,
    description: "Joint-safe mobility and comfort",
    color: "wellness-sage"
  },
];

export function ConditionsSelector({ 
  onComplete, 
  onBack,
  onSkip,
  initialConditions = []
}: ConditionsSelectorProps) {
  const [conditions, setConditions] = useState<string[]>(initialConditions);

  const toggleCondition = (value: string) => {
    setConditions(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-wellness-lilac/10">
            <Shield className="h-6 w-6 text-wellness-lilac" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            Would you like holistic support for any of these?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            These are completely optional. Select any that apply — we'll offer gentle, 
            personalised guidance alongside your main journey.
          </p>
        </div>
      </div>

      {/* Conditions Grid */}
      <div className="grid gap-2 sm:gap-3">
        {CONDITIONS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = conditions.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleCondition(option.value)}
              className={cn(
                "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200",
                isSelected 
                  ? `border-${option.color} bg-${option.color}/10 shadow-sm` 
                  : "border-border hover:border-wellness-lilac/50 hover:bg-accent/30"
              )}
              style={{
                borderColor: isSelected ? `hsl(var(--${option.color}))` : undefined,
                backgroundColor: isSelected ? `hsl(var(--${option.color}) / 0.1)` : undefined
              }}
            >
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg shrink-0 transition-colors",
                isSelected ? "bg-wellness-lilac/20" : "bg-muted"
              )}>
                <Icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                  isSelected ? "text-wellness-lilac" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm sm:text-base font-medium transition-colors break-words leading-snug",
                    isSelected ? "text-foreground" : "text-foreground/80"
                  )}>
                    {option.label}
                  </span>
                  <Checkbox 
                    checked={isSelected}
                    className="ml-auto shrink-0"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed break-words">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reassurance */}
      <div className="p-3 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
        <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
          <span className="font-medium text-foreground">A gentle reminder:</span> This app offers 
          supportive guidance, not medical treatment. Always consult your healthcare provider 
          for medical concerns.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
          >
            Back
          </Button>
        )}
        <Button 
          onClick={() => onComplete(conditions)}
          className="flex-1 gap-1.5 sm:gap-2 h-10 sm:h-11 text-sm sm:text-base"
        >
          {conditions.length > 0 ? "Continue" : "Skip for now"} 
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Button>
      </div>

      {/* Skip option */}
      {onSkip && conditions.length === 0 && (
        <p className="text-center">
          <button 
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-wellness-lilac underline-offset-4 hover:underline transition-colors"
          >
            I don't need support for these right now
          </button>
        </p>
      )}

      {/* Selected Summary */}
      {conditions.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
          <p className="text-xs sm:text-sm font-medium text-foreground">Support areas selected:</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {conditions.map(value => {
              const option = CONDITIONS_OPTIONS.find(o => o.value === value);
              return option ? (
                <span key={value} className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-wellness-lilac/20 text-wellness-lilac text-xs font-medium break-words">
                  {option.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Export the options for use in other components
export { CONDITIONS_OPTIONS };
