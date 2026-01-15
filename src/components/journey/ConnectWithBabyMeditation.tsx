import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Play, Pause, Wind, Sparkles, Moon, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  rounds: number;
  guidance: string[];
}

const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "gentle-connection",
    name: "Gentle Connection Breath",
    description: "A soft, nurturing breath to connect with your baby",
    inhaleSeconds: 4,
    holdSeconds: 0,
    exhaleSeconds: 6,
    rounds: 5,
    guidance: [
      "Find a comfortable position...",
      "Place your hands gently on your belly...",
      "Breathe in slowly, feeling your belly rise...",
      "Exhale softly, sending love to your baby...",
      "Continue at your own pace...",
    ]
  },
  {
    id: "calming-wave",
    name: "Calming Wave Breath",
    description: "Like gentle waves, soothing both you and baby",
    inhaleSeconds: 4,
    holdSeconds: 2,
    exhaleSeconds: 6,
    rounds: 4,
    guidance: [
      "Settle into stillness...",
      "Imagine a gentle wave of calm...",
      "Let each breath wash over you both...",
      "Feel the connection deepen...",
    ]
  },
];

interface ConnectWithBabyMeditationProps {
  className?: string;
}

export function ConnectWithBabyMeditation({ className }: ConnectWithBabyMeditationProps) {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [currentRound, setCurrentRound] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [guidanceIndex, setGuidanceIndex] = useState(0);

  const startExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setIsPlaying(true);
    setCurrentRound(1);
    setCurrentPhase("inhale");
    setGuidanceIndex(0);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setCurrentRound(1);
    setCurrentPhase("inhale");
    setGuidanceIndex(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-wellness-lilac/20 to-mumtaz-plum/10 border border-wellness-lilac/20">
          <Heart className="w-6 h-6 text-wellness-lilac" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          Connect with Your Baby
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          A gentle space for connection, calm, and presence. 
          No goals, no expectations — just you and your little one.
        </p>
      </div>

      {/* Exercise selection or active exercise */}
      <AnimatePresence mode="wait">
        {!selectedExercise ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4"
          >
            {BREATHING_EXERCISES.map((exercise) => (
              <motion.button
                key={exercise.id}
                onClick={() => startExercise(exercise)}
                className="p-4 rounded-2xl border border-wellness-lilac/20 bg-gradient-to-br from-white to-wellness-lilac/5 dark:from-card dark:to-wellness-lilac/5 text-left hover:shadow-md hover:border-wellness-lilac/40 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-wellness-lilac/10">
                    <Wind className="w-5 h-5 text-wellness-lilac" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {exercise.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exercise.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-wellness-sage/10 text-wellness-sage">
                        {exercise.rounds} rounds
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-wellness-lilac/10 text-wellness-lilac">
                        ~{Math.ceil((exercise.inhaleSeconds + exercise.holdSeconds + exercise.exhaleSeconds) * exercise.rounds / 60)} min
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Active exercise card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-wellness-lilac/10 via-white to-mumtaz-plum/5 dark:from-wellness-lilac/10 dark:via-card dark:to-mumtaz-plum/5 border border-wellness-lilac/20">
              <div className="text-center space-y-4">
                <h4 className="font-medium text-foreground">
                  {selectedExercise.name}
                </h4>

                {/* Breathing circle animation */}
                <div className="relative flex items-center justify-center h-40">
                  {/* Outer glow */}
                  <motion.div
                    className="absolute w-32 h-32 rounded-full bg-wellness-lilac/10"
                    animate={isPlaying ? {
                      scale: currentPhase === "inhale" ? [1, 1.3] : 
                             currentPhase === "hold" ? 1.3 : [1.3, 1],
                    } : {}}
                    transition={{
                      duration: currentPhase === "inhale" ? selectedExercise.inhaleSeconds :
                               currentPhase === "hold" ? selectedExercise.holdSeconds :
                               selectedExercise.exhaleSeconds,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Inner circle */}
                  <motion.div
                    className="relative w-24 h-24 rounded-full bg-gradient-to-br from-wellness-lilac to-mumtaz-plum flex items-center justify-center shadow-lg"
                    animate={isPlaying ? {
                      scale: currentPhase === "inhale" ? [1, 1.2] : 
                             currentPhase === "hold" ? 1.2 : [1.2, 1],
                    } : {}}
                    transition={{
                      duration: currentPhase === "inhale" ? selectedExercise.inhaleSeconds :
                               currentPhase === "hold" ? selectedExercise.holdSeconds :
                               selectedExercise.exhaleSeconds,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="text-white font-medium text-sm">
                      {currentPhase === "inhale" && "Breathe in"}
                      {currentPhase === "hold" && "Hold gently"}
                      {currentPhase === "exhale" && "Let go"}
                    </span>
                  </motion.div>
                </div>

                {/* Guidance text */}
                <motion.p
                  key={guidanceIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground italic min-h-[20px]"
                >
                  {selectedExercise.guidance[guidanceIndex % selectedExercise.guidance.length]}
                </motion.p>

                {/* Round indicator */}
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: selectedExercise.rounds }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        i < currentRound ? "bg-wellness-lilac" : "bg-wellness-lilac/20"
                      )}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="rounded-full w-14 h-14 bg-wellness-lilac hover:bg-wellness-lilac/90"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetExercise}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedExercise(null);
                resetExercise();
              }}
              className="w-full text-muted-foreground"
            >
              ← Choose a different practice
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gentle reminder */}
      <div className="p-3 rounded-xl bg-wellness-sage/5 border border-wellness-sage/15 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-wellness-sage" />
          <span className="text-xs font-medium text-foreground/70">A gentle note</span>
        </div>
        <p className="text-xs text-muted-foreground">
          There's no right or wrong way to do this. Simply being present with your baby is enough.
        </p>
      </div>
    </div>
  );
}

export default ConnectWithBabyMeditation;
