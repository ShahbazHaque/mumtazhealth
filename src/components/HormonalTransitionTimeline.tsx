import { motion } from "framer-motion";
import { 
  Flower2, 
  Waves, 
  Flame, 
  CloudSun, 
  Sun, 
  Moon,
  Check,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HormonalTransitionTimelineProps {
  currentPhase: string;
  compact?: boolean;
}

const TIMELINE_PHASES = [
  {
    id: "menstrual_cycle",
    label: "Regular Cycle",
    shortLabel: "Cycle",
    icon: Flower2,
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    borderColor: "border-pink-300 dark:border-pink-700",
    description: "Consistent monthly patterns"
  },
  {
    id: "cycle_changes",
    label: "Cycle Changes",
    shortLabel: "Changes",
    icon: Waves,
    color: "text-teal-500",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    borderColor: "border-teal-300 dark:border-teal-700",
    description: "Noticing shifts"
  },
  {
    id: "perimenopause",
    label: "Perimenopause",
    shortLabel: "Peri",
    icon: Flame,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    description: "Active transition"
  },
  {
    id: "peri_menopause_transition",
    label: "Peri → Meno",
    shortLabel: "Threshold",
    icon: CloudSun,
    color: "text-rose-500",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    borderColor: "border-rose-300 dark:border-rose-700",
    description: "Approaching menopause"
  },
  {
    id: "menopause",
    label: "Menopause",
    shortLabel: "Meno",
    icon: Sun,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700",
    description: "12+ months without period"
  },
  {
    id: "post_menopause",
    label: "Post-Menopause",
    shortLabel: "Post",
    icon: Moon,
    color: "text-wellness-sage",
    bgColor: "bg-wellness-sage/20 dark:bg-wellness-sage/10",
    borderColor: "border-wellness-sage/40 dark:border-wellness-sage/30",
    description: "Wisdom years"
  },
];

export function HormonalTransitionTimeline({ currentPhase, compact = false }: HormonalTransitionTimelineProps) {
  const currentIndex = TIMELINE_PHASES.findIndex(p => p.id === currentPhase);
  
  return (
    <div className="w-full">
      {/* Header */}
      {!compact && (
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Your Hormonal Journey
          </h3>
          <p className="text-sm text-muted-foreground">
            Every woman's path is unique — this is simply a gentle map
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-200 via-amber-200 to-wellness-sage/40 dark:from-pink-800 dark:via-amber-800 dark:to-wellness-sage/20" />
        
        {/* Progress Line */}
        <motion.div 
          className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-pink-400 via-teal-400 to-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentIndex / (TIMELINE_PHASES.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Phase Nodes */}
        <div className="relative flex justify-between">
          {TIMELINE_PHASES.map((phase, index) => {
            const Icon = phase.icon;
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex flex-col items-center"
                style={{ width: compact ? 'auto' : `${100 / TIMELINE_PHASES.length}%` }}
              >
                {/* Node Circle */}
                <div
                  className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                    isCurrent && `${phase.bgColor} ${phase.borderColor} ring-4 ring-offset-2 ring-offset-background`,
                    isCurrent && phase.id === "cycle_changes" && "ring-teal-200 dark:ring-teal-800",
                    isPast && "bg-primary/20 border-primary/40",
                    isFuture && "bg-muted border-border/50"
                  )}
                >
                  {isPast ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : isCurrent ? (
                    <Icon className={cn("w-5 h-5", phase.color)} />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/50" />
                  )}
                  
                  {/* Pulse animation for current */}
                  {isCurrent && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-full",
                        phase.bgColor
                      )}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Labels */}
                <div className={cn(
                  "mt-3 text-center",
                  compact ? "max-w-[60px]" : "max-w-[100px]"
                )}>
                  <p className={cn(
                    "text-xs font-medium truncate",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {compact ? phase.shortLabel : phase.label}
                  </p>
                  {!compact && isCurrent && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-muted-foreground mt-0.5"
                    >
                      {phase.description}
                    </motion.p>
                  )}
                </div>

                {/* Current indicator */}
                {isCurrent && !compact && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      phase.bgColor, phase.color
                    )}>
                      You are here
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Supportive Note */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground italic">
            This journey unfolds at your own pace. There's no rush, no timeline — only your body's wisdom.
          </p>
        </motion.div>
      )}
    </div>
  );
}