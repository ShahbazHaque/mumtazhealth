import { motion } from "framer-motion";
import { Heart, Leaf, Info, Baby, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Import founder's pose images
import { 
  mumtazYoga4, 
  mumtazYoga5, 
  mumtazYoga6,
  mumtazYoga7,
  mumtazYoga8,
} from "@/assets/brandImages";

export interface PregnancyPoseData {
  id: string;
  name: string;
  image: string;
  caption: string;
  trimesterSafe: number[];
  benefits: string[];
  modifications?: string;
  avoidIf?: string;
  duration?: string;
}

// Curated pregnancy-safe poses using founder's images
export const PREGNANCY_SAFE_POSES: PregnancyPoseData[] = [
  {
    id: "supported-side-stretch",
    name: "Supported Side Stretch",
    image: mumtazYoga4,
    caption: "A gentle pose to create space and ease in the body",
    trimesterSafe: [1, 2, 3],
    benefits: ["Opens the side body", "Eases tension in the ribs", "Supports comfortable breathing"],
    modifications: "Use a bolster or pillow for extra support",
    duration: "5-8 breaths each side",
  },
  {
    id: "gentle-hip-opener",
    name: "Gentle Hip Opening",
    image: mumtazYoga5,
    caption: "Creating ease and openness in the hips",
    trimesterSafe: [1, 2, 3],
    benefits: ["Releases hip tension", "Supports pelvic floor health", "Calms the nervous system"],
    modifications: "Elevate hips on a blanket if knees are high",
    duration: "1-3 minutes",
  },
  {
    id: "supported-heart-opener",
    name: "Supported Heart Opening",
    image: mumtazYoga6,
    caption: "A nurturing pose to open the chest and heart",
    trimesterSafe: [1, 2],
    benefits: ["Opens the chest", "Supports emotional release", "Eases upper back tension"],
    modifications: "Use blocks or pillows behind the back",
    avoidIf: "Avoid lying flat in late pregnancy",
    duration: "5-10 breaths",
  },
  {
    id: "grounding-forward-fold",
    name: "Grounding Forward Fold",
    image: mumtazYoga7,
    caption: "A calming pose to encourage rest and grounding",
    trimesterSafe: [1, 2],
    benefits: ["Calms the mind", "Stretches the back", "Encourages surrender"],
    modifications: "Widen knees to make room for belly",
    avoidIf: "Modify or avoid if uncomfortable in later pregnancy",
    duration: "1-3 minutes",
  },
  {
    id: "restorative-rest",
    name: "Restorative Rest Pose",
    image: mumtazYoga8,
    caption: "A deeply supportive pose for complete relaxation",
    trimesterSafe: [1, 2, 3],
    benefits: ["Full body relaxation", "Supports nervous system", "Encourages deep rest"],
    modifications: "Use side-lying position in third trimester",
    duration: "5-15 minutes",
  },
];

interface PregnancySafePoseCardProps {
  pose: PregnancyPoseData;
  currentTrimester?: number;
  className?: string;
}

export function PregnancySafePoseCard({ pose, currentTrimester = 1, className }: PregnancySafePoseCardProps) {
  const isSafeForCurrentTrimester = pose.trimesterSafe.includes(currentTrimester);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border overflow-hidden bg-card shadow-sm transition-all duration-300 hover:shadow-md",
        isSafeForCurrentTrimester ? "border-wellness-sage/30" : "border-amber-200",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-wellness-sage/10 to-wellness-lilac/10">
        <img
          src={pose.image}
          alt={pose.name}
          className="w-full h-full object-cover"
        />
        
        {/* Trimester badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {pose.trimesterSafe.map((tri) => (
            <Badge
              key={tri}
              variant="secondary"
              className={cn(
                "text-[10px] px-2 py-0.5",
                currentTrimester === tri 
                  ? "bg-wellness-sage text-white" 
                  : "bg-white/80 text-foreground/70"
              )}
            >
              T{tri}
            </Badge>
          ))}
        </div>

        {/* Duration */}
        {pose.duration && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/80 text-foreground/70 text-[10px]">
              <Clock className="w-3 h-3 mr-1" />
              {pose.duration}
            </Badge>
          </div>
        )}

        {/* Warning if not safe for current trimester */}
        {!isSafeForCurrentTrimester && (
          <div className="absolute inset-0 bg-amber-50/80 dark:bg-amber-900/60 flex items-center justify-center">
            <div className="text-center p-4">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-xs text-amber-700 dark:text-amber-200 font-medium">
                Not recommended for Trimester {currentTrimester}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-medium text-foreground text-sm leading-tight">
            {pose.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 italic">
            {pose.caption}
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-wellness-lilac" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Benefits
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {pose.benefits.map((benefit, idx) => (
              <span 
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-wellness-lilac/10 text-foreground/70"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Modifications */}
        {pose.modifications && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-wellness-sage/5 border border-wellness-sage/10">
            <Leaf className="w-3.5 h-3.5 text-wellness-sage flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pose.modifications}
            </p>
          </div>
        )}

        {/* Avoid if note */}
        {pose.avoidIf && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-200 leading-relaxed">
              {pose.avoidIf}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Pose grid component for displaying multiple poses
interface PregnancySafePoseGridProps {
  trimester?: number;
  maxPoses?: number;
  className?: string;
}

export function PregnancySafePoseGrid({ trimester = 1, maxPoses = 4, className }: PregnancySafePoseGridProps) {
  const safePoses = PREGNANCY_SAFE_POSES.filter(pose => 
    pose.trimesterSafe.includes(trimester)
  ).slice(0, maxPoses);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Baby className="w-4 h-4 text-wellness-lilac" />
        <h3 className="text-sm font-medium text-foreground">
          Pregnancy-safe practices for Trimester {trimester}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {safePoses.map((pose) => (
          <PregnancySafePoseCard 
            key={pose.id} 
            pose={pose} 
            currentTrimester={trimester} 
          />
        ))}
      </div>

      {safePoses.length === 0 && (
        <div className="p-6 text-center rounded-xl bg-muted/50 border border-border">
          <Leaf className="w-8 h-8 text-wellness-sage/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Practices for this trimester coming soon
          </p>
        </div>
      )}
    </div>
  );
}

export default PregnancySafePoseCard;
