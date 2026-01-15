import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Leaf, ChevronDown, ChevronUp, PenLine, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface PhaseCardData {
  phaseId: string;
  title: string;
  subtitle: string;
  description: string;
  babySize?: {
    metaphor: string;
    emoji: string;
    description: string;
  };
  whatYouMayNotice: string[];
  holisticNote?: string;
  visualTheme: {
    gradient: string;
    borderColor: string;
    iconBg: string;
    accentColor: string;
  };
}

interface ReflectionData {
  bodyNoticing: string;
  feelsSupporting: string;
  wantMore: string;
  checkedItems: string[];
}

interface JourneyPhaseCardProps {
  phaseData: PhaseCardData;
  journeyType: "pregnancy" | "menopause" | "recovery";
  userDosha?: string | null;
  onSaveReflection?: (reflection: ReflectionData) => void;
  className?: string;
}

const REFLECTION_CHECKBOXES = [
  { id: "rest", label: "I'm honouring rest when I need it" },
  { id: "nourishment", label: "I'm nourishing myself with care" },
  { id: "movement", label: "I'm moving gently when it feels right" },
  { id: "connection", label: "I'm staying connected to my body" },
];

export function JourneyPhaseCard({ 
  phaseData, 
  journeyType,
  userDosha,
  onSaveReflection,
  className 
}: JourneyPhaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState<ReflectionData>({
    bodyNoticing: "",
    feelsSupporting: "",
    wantMore: "",
    checkedItems: [],
  });

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setReflection(prev => ({
      ...prev,
      checkedItems: checked 
        ? [...prev.checkedItems, id]
        : prev.checkedItems.filter(item => item !== id)
    }));
  };

  const handleSaveReflection = () => {
    onSaveReflection?.(reflection);
    setShowReflection(false);
  };

  const { visualTheme } = phaseData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border overflow-hidden transition-all duration-300",
        visualTheme.borderColor,
        className
      )}
    >
      {/* Header with gradient background */}
      <div className={cn(
        "p-4 bg-gradient-to-br",
        visualTheme.gradient
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-xl flex-shrink-0",
            visualTheme.iconBg
          )}>
            {journeyType === "pregnancy" ? (
              <Heart className={cn("w-5 h-5", visualTheme.accentColor)} />
            ) : (
              <Sparkles className={cn("w-5 h-5", visualTheme.accentColor)} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {phaseData.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {phaseData.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4 bg-card">
        {/* Description */}
        <p className="text-sm text-foreground/80 leading-relaxed">
          {phaseData.description}
        </p>

        {/* Baby size metaphor (pregnancy only) */}
        {journeyType === "pregnancy" && phaseData.babySize && (
          <motion.div 
            className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-wellness-lilac/5 to-wellness-sage/5 border border-wellness-lilac/15"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-card flex items-center justify-center text-2xl shadow-sm border border-wellness-lilac/10">
              {phaseData.babySize.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/90">
                {phaseData.babySize.metaphor}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {phaseData.babySize.description}
              </p>
            </div>
          </motion.div>
        )}

        {/* What you may notice */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-wellness-sage" />
            What you may notice
          </h4>
          <ul className="space-y-1.5 pl-5">
            {phaseData.whatYouMayNotice.map((item, idx) => (
              <li key={idx} className="text-xs text-muted-foreground leading-relaxed list-disc">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Holistic note (dosha-aware) */}
        {phaseData.holisticNote && (
          <div className={cn(
            "p-3 rounded-xl border",
            userDosha === "vata" ? "bg-sky-50/50 border-sky-200 dark:bg-sky-900/10" :
            userDosha === "pitta" ? "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10" :
            userDosha === "kapha" ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10" :
            "bg-wellness-lilac/5 border-wellness-lilac/20"
          )}>
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-wellness-lilac flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                  Holistic insight {userDosha && `• ${userDosha}`}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {phaseData.holisticNote}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expandable section */}
        <div className="pt-2 border-t border-border/50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left py-2 group"
          >
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              More about this phase
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="py-3 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {journeyType === "pregnancy" 
                      ? "Remember, every pregnancy is unique. These are gentle observations, not expectations."
                      : "Your experience is unique. Trust what your body tells you."
                    }
                  </p>

                  {/* Reflection section toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReflection(!showReflection)}
                    className="w-full border-wellness-lilac/30 hover:bg-wellness-lilac/10"
                  >
                    <PenLine className="w-3.5 h-3.5 mr-2" />
                    {showReflection ? "Close reflection" : "Add a personal reflection"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reflection prompts (journal-style) */}
        <AnimatePresence>
          {showReflection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-wellness-sage/5 to-wellness-lilac/5 border border-wellness-sage/20 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-wellness-lilac" />
                  <h4 className="text-sm font-medium text-foreground">
                    Gentle reflections
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  No pressure — just space to check in with yourself.
                </p>

                {/* Reflection questions */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">
                      What are you noticing in your body this phase?
                    </label>
                    <Textarea
                      placeholder="Whatever comes to mind..."
                      value={reflection.bodyNoticing}
                      onChange={(e) => setReflection(prev => ({ ...prev, bodyNoticing: e.target.value }))}
                      className="min-h-[60px] text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">
                      What feels supportive right now?
                    </label>
                    <Textarea
                      placeholder="Rest, movement, connection..."
                      value={reflection.feelsSupporting}
                      onChange={(e) => setReflection(prev => ({ ...prev, feelsSupporting: e.target.value }))}
                      className="min-h-[60px] text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">
                      What would you like more of this week?
                    </label>
                    <Textarea
                      placeholder="Gentleness, patience, space..."
                      value={reflection.wantMore}
                      onChange={(e) => setReflection(prev => ({ ...prev, wantMore: e.target.value }))}
                      className="min-h-[60px] text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Gentle check-in checkboxes */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground">Gentle check-ins (optional)</p>
                  {REFLECTION_CHECKBOXES.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        id={item.id}
                        checked={reflection.checkedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                      />
                      <label 
                        htmlFor={item.id}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Save button */}
                {onSaveReflection && (
                  <Button
                    size="sm"
                    onClick={handleSaveReflection}
                    className="w-full bg-wellness-sage hover:bg-wellness-sage/90"
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Save reflection
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default JourneyPhaseCard;
