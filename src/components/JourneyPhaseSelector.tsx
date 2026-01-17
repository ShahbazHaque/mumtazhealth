import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Heart, Sparkles, Zap, Leaf, Baby, 
  Activity, Sun, Moon, Compass, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyPhaseSelectorProps {
  onComplete: (primaryFocus: string[], lifePhases: string[]) => void;
  onBack?: () => void;
  initialPrimaryFocus?: string[];
  initialLifePhases?: string[];
}

const PRIMARY_FOCUS_OPTIONS = [
  { 
    value: "overall_health", 
    label: "Overall health & wellbeing", 
    icon: Heart,
    description: "General wellness and self-care"
  },
  { 
    value: "hormonal_balance", 
    label: "Hormonal balance", 
    icon: Activity,
    description: "Supporting your body's natural rhythms"
  },
  { 
    value: "energy_resilience", 
    label: "Energy & resilience", 
    icon: Zap,
    description: "Building sustainable vitality"
  },
  { 
    value: "recovery_healing", 
    label: "Recovery & healing", 
    icon: Leaf,
    description: "Gentle support during healing"
  },
  { 
    value: "fertility_awareness", 
    label: "Fertility awareness", 
    icon: Sparkles,
    description: "Understanding your fertile patterns"
  },
];

const LIFE_PHASE_OPTIONS = [
  { 
    value: "regular_cycle", 
    label: "Regular cycle", 
    icon: Sun,
    description: "Consistent monthly cycling"
  },
  { 
    value: "cycle_changes", 
    label: "Cycle changes / hormonal transition", 
    icon: Activity,
    description: "Experiencing shifts in your cycle"
  },
  { 
    value: "perimenopause", 
    label: "Perimenopause", 
    icon: Sparkles,
    description: "Cycles becoming irregular"
  },
  { 
    value: "menopause", 
    label: "Menopause", 
    icon: Moon,
    description: "No period for 12+ months"
  },
  { 
    value: "post_menopause", 
    label: "Post-menopause / beyond", 
    icon: Compass,
    description: "Settled into life after menopause"
  },
  { 
    value: "trying_to_conceive", 
    label: "Trying to conceive", 
    icon: Baby,
    description: "Actively working toward pregnancy"
  },
  { 
    value: "pregnancy", 
    label: "Currently pregnant", 
    icon: Baby,
    description: "Expecting a baby"
  },
  { 
    value: "postpartum", 
    label: "Postpartum recovery", 
    icon: Leaf,
    description: "Recovering after childbirth"
  },
  { 
    value: "not_sure", 
    label: "Not sure / exploring", 
    icon: Compass,
    description: "Still figuring things out"
  },
];

export function JourneyPhaseSelector({ 
  onComplete, 
  onBack,
  initialPrimaryFocus = [],
  initialLifePhases = []
}: JourneyPhaseSelectorProps) {
  const [primaryFocus, setPrimaryFocus] = useState<string[]>(initialPrimaryFocus);
  const [lifePhases, setLifePhases] = useState<string[]>(initialLifePhases);

  const togglePrimaryFocus = (value: string) => {
    setPrimaryFocus(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleLifePhase = (value: string) => {
    setLifePhases(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const canContinue = primaryFocus.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Primary Focus Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-sm sm:text-base font-semibold text-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-wellness-lilac shrink-0" />
            <span>Primary Focus</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">(select one or more)</span>
          </Label>
        </div>
        <div className="grid gap-2 sm:gap-3">
          {PRIMARY_FOCUS_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = primaryFocus.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePrimaryFocus(option.value)}
                className={cn(
                  "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected 
                    ? "border-wellness-lilac bg-wellness-lilac/10 shadow-sm" 
                    : "border-border hover:border-wellness-lilac/50 hover:bg-accent/30"
                )}
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
      </div>

      {/* Life Phase Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-sm sm:text-base font-semibold text-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-wellness-sage shrink-0" />
            <span>Life Phase</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">(optional)</span>
          </Label>
        </div>
        <div className="grid gap-2 sm:gap-3">
          {LIFE_PHASE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = lifePhases.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleLifePhase(option.value)}
                className={cn(
                  "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected 
                    ? "border-wellness-sage bg-wellness-sage/10 shadow-sm" 
                    : "border-border hover:border-wellness-sage/50 hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-lg shrink-0 transition-colors",
                  isSelected ? "bg-wellness-sage/20" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                    isSelected ? "text-wellness-sage" : "text-muted-foreground"
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
      </div>

      {/* Reassurance Text */}
      <p className="text-center text-xs sm:text-sm text-muted-foreground italic px-2 sm:px-4 leading-relaxed">
        You can update this at any time as your body and life evolve.
      </p>

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
          onClick={() => onComplete(primaryFocus, lifePhases)}
          disabled={!canContinue}
          className="flex-1 gap-1.5 sm:gap-2 h-10 sm:h-11 text-sm sm:text-base"
        >
          Continue <ArrowRight className="h-4 w-4 shrink-0" />
        </Button>
      </div>

      {/* Selected Summary */}
      {(primaryFocus.length > 0 || lifePhases.length > 0) && (
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2">
          <p className="text-xs sm:text-sm font-medium text-foreground">Your selections:</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {primaryFocus.map(value => {
              const option = PRIMARY_FOCUS_OPTIONS.find(o => o.value === value);
              return option ? (
                <span key={value} className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-wellness-lilac/20 text-wellness-lilac text-xs font-medium break-words">
                  {option.label}
                </span>
              ) : null;
            })}
            {lifePhases.map(value => {
              const option = LIFE_PHASE_OPTIONS.find(o => o.value === value);
              return option ? (
                <span key={value} className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-wellness-sage/20 text-wellness-sage text-xs font-medium break-words">
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

// Export the option arrays for use in other components
export { PRIMARY_FOCUS_OPTIONS, LIFE_PHASE_OPTIONS };
