import { motion } from "framer-motion";
import { Waves, Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useInBetweenPhaseSupport } from "@/hooks/useInBetweenPhaseSupport";
import { JOURNEY_MESSAGES } from "@/constants/appMessaging";

interface InBetweenPhaseBannerProps {
  lifeStage: string | null | undefined;
  compact?: boolean;
  className?: string;
}

/**
 * A supportive banner for users in "in-between" life phases
 * (cycle_changes, peri_menopause_transition)
 * 
 * Displays gentle, stabilizing messaging and nervous system support focus
 */
export function InBetweenPhaseBanner({ lifeStage, compact = false, className = "" }: InBetweenPhaseBannerProps) {
  const config = useInBetweenPhaseSupport(lifeStage);

  if (!config.isInBetweenPhase) {
    return null;
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50/50 dark:bg-teal-900/20 border border-teal-200/40 dark:border-teal-800/40 ${className}`}
      >
        <Waves className="w-4 h-4 text-teal-500 flex-shrink-0" />
        <p className="text-xs text-teal-700 dark:text-teal-300">
          {config.gentleReminder}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-teal-50/60 via-wellness-sage/10 to-wellness-lilac/10 dark:from-teal-900/20 dark:via-wellness-sage/5 dark:to-wellness-lilac/5 border-teal-200/40 dark:border-teal-800/40 overflow-hidden">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-full bg-teal-100 dark:bg-teal-900/40 flex-shrink-0">
              <Waves className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground text-sm">
                  {config.phaseType === 'cycle_changes' 
                    ? 'Cycle Changes' 
                    : 'Transition Phase'
                  }
                </h3>
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {config.supportiveMessage}
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-teal-100/60 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  <Heart className="w-3 h-3" />
                  Gentle practices prioritized
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-wellness-sage/20 text-wellness-sage dark:text-wellness-sage">
                  Nervous system support
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * A simple badge indicating in-between phase status
 */
export function InBetweenPhaseBadge({ lifeStage }: { lifeStage: string | null | undefined }) {
  const config = useInBetweenPhaseSupport(lifeStage);

  if (!config.isInBetweenPhase) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50">
      <Waves className="w-3 h-3" />
      {config.phaseType === 'cycle_changes' ? 'Cycle Changes' : 'Transition'}
    </span>
  );
}

export default InBetweenPhaseBanner;