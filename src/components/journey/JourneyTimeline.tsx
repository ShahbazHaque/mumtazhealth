import { motion } from "framer-motion";
import { Leaf, Sun, Moon, Sparkles, Heart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JourneyPhase {
  id: string;
  label: string;
  subtitle?: string;
  isActive: boolean;
  isCompleted?: boolean;
}

interface JourneyTimelineProps {
  phases: JourneyPhase[];
  currentPhase: string;
  journeyType: "pregnancy" | "menopause" | "recovery" | "cycle" | "mental";
  className?: string;
}

// Phase-specific icons based on journey type
const getPhaseIcon = (journeyType: string, phaseIndex: number, isActive: boolean) => {
  const iconClass = cn(
    "w-4 h-4 transition-all duration-300",
    isActive ? "scale-110" : "scale-100"
  );

  if (journeyType === "pregnancy") {
    switch (phaseIndex) {
      case 0: return <Leaf className={iconClass} />;
      case 1: return <Sun className={iconClass} />;
      case 2: return <Moon className={iconClass} />;
      default: return <Heart className={iconClass} />;
    }
  }
  
  if (journeyType === "menopause") {
    switch (phaseIndex) {
      case 0: return <Sparkles className={iconClass} />;
      case 1: return <Sun className={iconClass} />;
      case 2: return <Moon className={iconClass} />;
      default: return <Heart className={iconClass} />;
    }
  }

  return <Heart className={iconClass} />;
};

// Visual theme based on journey type and phase
const getPhaseTheme = (journeyType: string, phaseIndex: number, isActive: boolean) => {
  const themes = {
    pregnancy: [
      { // Trimester 1 - Grounding, restful
        gradient: "from-wellness-sage/20 via-wellness-sage/10 to-transparent",
        border: isActive ? "border-wellness-sage ring-2 ring-wellness-sage/30" : "border-wellness-sage/30",
        bg: isActive ? "bg-wellness-sage/15" : "bg-wellness-sage/5",
        text: "text-wellness-sage",
        dotBg: isActive ? "bg-wellness-sage" : "bg-wellness-sage/40",
      },
      { // Trimester 2 - Balanced, steady
        gradient: "from-wellness-lilac/20 via-wellness-lilac/10 to-transparent",
        border: isActive ? "border-wellness-lilac ring-2 ring-wellness-lilac/30" : "border-wellness-lilac/30",
        bg: isActive ? "bg-wellness-lilac/15" : "bg-wellness-lilac/5",
        text: "text-wellness-lilac",
        dotBg: isActive ? "bg-wellness-lilac" : "bg-wellness-lilac/40",
      },
      { // Trimester 3 - Nurturing, spacious
        gradient: "from-mumtaz-plum/15 via-mumtaz-plum/8 to-transparent",
        border: isActive ? "border-mumtaz-plum ring-2 ring-mumtaz-plum/30" : "border-mumtaz-plum/20",
        bg: isActive ? "bg-mumtaz-plum/12" : "bg-mumtaz-plum/5",
        text: "text-mumtaz-plum",
        dotBg: isActive ? "bg-mumtaz-plum" : "bg-mumtaz-plum/40",
      },
    ],
    menopause: [
      { gradient: "from-amber-100/30 to-transparent", border: isActive ? "border-amber-400 ring-2 ring-amber-200" : "border-amber-200", bg: isActive ? "bg-amber-50" : "bg-amber-50/30", text: "text-amber-600", dotBg: isActive ? "bg-amber-500" : "bg-amber-300" },
      { gradient: "from-wellness-lilac/20 to-transparent", border: isActive ? "border-wellness-lilac ring-2 ring-wellness-lilac/30" : "border-wellness-lilac/30", bg: isActive ? "bg-wellness-lilac/15" : "bg-wellness-lilac/5", text: "text-wellness-lilac", dotBg: isActive ? "bg-wellness-lilac" : "bg-wellness-lilac/40" },
      { gradient: "from-wellness-sage/20 to-transparent", border: isActive ? "border-wellness-sage ring-2 ring-wellness-sage/30" : "border-wellness-sage/30", bg: isActive ? "bg-wellness-sage/15" : "bg-wellness-sage/5", text: "text-wellness-sage", dotBg: isActive ? "bg-wellness-sage" : "bg-wellness-sage/40" },
    ],
    recovery: [
      { gradient: "from-sky-100/30 to-transparent", border: isActive ? "border-sky-400 ring-2 ring-sky-200" : "border-sky-200", bg: isActive ? "bg-sky-50" : "bg-sky-50/30", text: "text-sky-600", dotBg: isActive ? "bg-sky-500" : "bg-sky-300" },
      { gradient: "from-wellness-sage/20 to-transparent", border: isActive ? "border-wellness-sage ring-2 ring-wellness-sage/30" : "border-wellness-sage/30", bg: isActive ? "bg-wellness-sage/15" : "bg-wellness-sage/5", text: "text-wellness-sage", dotBg: isActive ? "bg-wellness-sage" : "bg-wellness-sage/40" },
      { gradient: "from-wellness-lilac/20 to-transparent", border: isActive ? "border-wellness-lilac ring-2 ring-wellness-lilac/30" : "border-wellness-lilac/30", bg: isActive ? "bg-wellness-lilac/15" : "bg-wellness-lilac/5", text: "text-wellness-lilac", dotBg: isActive ? "bg-wellness-lilac" : "bg-wellness-lilac/40" },
    ],
    cycle: [
      { gradient: "from-rose-100/30 to-transparent", border: isActive ? "border-rose-400 ring-2 ring-rose-200" : "border-rose-200", bg: isActive ? "bg-rose-50" : "bg-rose-50/30", text: "text-rose-600", dotBg: isActive ? "bg-rose-500" : "bg-rose-300" },
      { gradient: "from-amber-100/30 to-transparent", border: isActive ? "border-amber-400 ring-2 ring-amber-200" : "border-amber-200", bg: isActive ? "bg-amber-50" : "bg-amber-50/30", text: "text-amber-600", dotBg: isActive ? "bg-amber-500" : "bg-amber-300" },
      { gradient: "from-wellness-sage/20 to-transparent", border: isActive ? "border-wellness-sage ring-2 ring-wellness-sage/30" : "border-wellness-sage/30", bg: isActive ? "bg-wellness-sage/15" : "bg-wellness-sage/5", text: "text-wellness-sage", dotBg: isActive ? "bg-wellness-sage" : "bg-wellness-sage/40" },
      { gradient: "from-wellness-lilac/20 to-transparent", border: isActive ? "border-wellness-lilac ring-2 ring-wellness-lilac/30" : "border-wellness-lilac/30", bg: isActive ? "bg-wellness-lilac/15" : "bg-wellness-lilac/5", text: "text-wellness-lilac", dotBg: isActive ? "bg-wellness-lilac" : "bg-wellness-lilac/40" },
    ],
  };

  const journeyThemes = themes[journeyType as keyof typeof themes] || themes.pregnancy;
  return journeyThemes[phaseIndex % journeyThemes.length];
};

export function JourneyTimeline({ phases, currentPhase, journeyType, className }: JourneyTimelineProps) {
  const currentIndex = phases.findIndex(p => p.id === currentPhase);

  return (
    <div className={cn("w-full", className)}>
      {/* Visual timeline header */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <Heart className="w-3.5 h-3.5 text-wellness-lilac/60" />
        <span className="text-xs text-muted-foreground font-medium">
          Where you are in your journey
        </span>
      </div>

      {/* Timeline container */}
      <div className="relative flex items-center justify-between px-2">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0" />
        
        {/* Progress line */}
        <motion.div 
          className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-wellness-sage via-wellness-lilac to-mumtaz-plum -translate-y-1/2 z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentIndex + 1) / phases.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Phase markers */}
        {phases.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isCompleted = index < currentIndex;
          const theme = getPhaseTheme(journeyType, index, isActive);

          return (
            <motion.div
              key={phase.id}
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
            >
              {/* Phase dot/marker */}
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  theme.border,
                  theme.bg,
                  isActive && "shadow-lg"
                )}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {isCompleted ? (
                  <Check className={cn("w-4 h-4", theme.text)} />
                ) : (
                  <span className={theme.text}>
                    {getPhaseIcon(journeyType, index, isActive)}
                  </span>
                )}
              </motion.div>

              {/* Phase label */}
              <div className="mt-2 text-center max-w-[80px]">
                <p className={cn(
                  "text-xs font-medium leading-tight",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {phase.label}
                </p>
                {phase.subtitle && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-tight">
                    {phase.subtitle}
                  </p>
                )}
              </div>

              {/* Active indicator glow */}
              {isActive && (
                <motion.div
                  className={cn(
                    "absolute -inset-1 rounded-full opacity-20",
                    `bg-gradient-to-r ${theme.gradient}`
                  )}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current phase description */}
      <motion.div 
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-muted-foreground italic">
          {journeyType === "pregnancy" && "Every step of this journey is beautiful. Take it gently."}
          {journeyType === "menopause" && "Honour each phase as your body finds its new rhythm."}
          {journeyType === "recovery" && "Healing takes time. Trust your body's wisdom."}
          {journeyType === "cycle" && "Your body moves through natural rhythms. Listen with kindness."}
          {journeyType === "mental" && "Your feelings are valid. There's no rush to feel different."}
        </p>
      </motion.div>
    </div>
  );
}

export default JourneyTimeline;
