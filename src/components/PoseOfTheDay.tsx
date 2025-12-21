import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Leaf, Moon, Sun, Activity, ChevronLeft, ChevronRight, Flame, Droplets, Mountain, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import pose images
import halfMoonPose from "@/assets/poses/half-moon-pose.jpeg";
import revolvedHeadToKnee from "@/assets/poses/revolved-head-to-knee.jpeg";
import compassPose from "@/assets/poses/compass-pose.jpeg";
import forearmReclinedHero from "@/assets/poses/forearm-reclined-hero.jpeg";
import reclinedFigureFour from "@/assets/poses/reclined-figure-four.jpeg";
import fishPoseLegsUp from "@/assets/poses/fish-pose-legs-up.jpeg";
import warriorThree from "@/assets/poses/warrior-three.jpeg";
import eagleArmsSeated from "@/assets/poses/eagle-arms-seated.jpeg";
import supportedFishPose from "@/assets/poses/supported-fish-pose.jpeg";
import locustPose from "@/assets/poses/locust-pose.jpeg";

interface PoseData {
  id: string;
  name: string;
  sanskritName: string;
  image: string;
  description: string;
  benefits: string[];
  doshaAlignment: {
    primary: string;
    effect: string;
  };
  lifePhases: string[];
  modifications: string[];
  anatomy: {
    primary: string[];
    secondary: string[];
  };
  sequenceOrder: number;
  category: string;
}

const poseLibrary: PoseData[] = [
  {
    id: "half-moon",
    name: "Half Moon Pose",
    sanskritName: "Ardha Chandrasana",
    image: halfMoonPose,
    description: "A powerful standing balance that opens the hips and strengthens the legs while cultivating focus and grace.",
    benefits: [
      "Improves balance and coordination",
      "Strengthens ankles, thighs, and spine",
      "Opens hips and chest",
      "Calms the mind and reduces anxiety"
    ],
    doshaAlignment: {
      primary: "Vata",
      effect: "Grounding practice that stabilises Vata's airy nature through focused balance work"
    },
    lifePhases: ["Menstrual (Follicular)", "Perimenopause", "Post-Menopause"],
    modifications: [
      "Use a block under the bottom hand",
      "Keep top hand on hip for stability",
      "Practice against a wall for support"
    ],
    anatomy: {
      primary: ["Gluteus medius", "Quadriceps", "Hamstrings"],
      secondary: ["Core stabilizers", "Hip flexors", "Obliques"]
    },
    sequenceOrder: 1,
    category: "Strengthening Yoga"
  },
  {
    id: "revolved-head-to-knee",
    name: "Revolved Head-to-Knee",
    sanskritName: "Parivrtta Janu Sirsasana",
    image: revolvedHeadToKnee,
    description: "A deep seated twist and side stretch that massages abdominal organs and opens the side body.",
    benefits: [
      "Stretches spine, shoulders, and hamstrings",
      "Stimulates liver and kidneys",
      "Relieves mild backache",
      "Supports digestive health"
    ],
    doshaAlignment: {
      primary: "Pitta",
      effect: "Cooling twist that releases heat from the liver and aids in Pitta's natural detoxification"
    },
    lifePhases: ["Menstrual (Luteal)", "Perimenopause", "Menopause"],
    modifications: [
      "Sit on a folded blanket to elevate hips",
      "Use a strap around extended foot",
      "Bend the extended knee slightly"
    ],
    anatomy: {
      primary: ["Latissimus dorsi", "Obliques", "Hamstrings"],
      secondary: ["Intercostals", "Hip adductors", "Spinal rotators"]
    },
    sequenceOrder: 2,
    category: "Flexibility & Mobility"
  },
  {
    id: "compass-pose",
    name: "Compass Pose",
    sanskritName: "Parivrtta Surya Yantrasana",
    image: compassPose,
    description: "An advanced seated posture that opens the hips and shoulders while developing patience and focus.",
    benefits: [
      "Deep hip and hamstring opening",
      "Shoulder and side body stretch",
      "Builds concentration",
      "Develops body awareness"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Energising pose that stimulates circulation and counters Kapha's heavy, sluggish tendencies"
    },
    lifePhases: ["Menstrual (Ovulation)", "Post-Menopause (with modifications)"],
    modifications: [
      "Use a strap around the foot",
      "Keep the bottom leg extended",
      "Practice seated leg stretch first"
    ],
    anatomy: {
      primary: ["Hamstrings", "Hip rotators", "Deltoids"],
      secondary: ["Triceps", "Core", "IT band"]
    },
    sequenceOrder: 3,
    category: "Advanced Flexibility"
  },
  {
    id: "forearm-reclined-hero",
    name: "Forearm Reclined Hero",
    sanskritName: "Supta Virasana Variation",
    image: forearmReclinedHero,
    description: "A restorative backbend that opens the front body and relieves tension in the thighs and hip flexors.",
    benefits: [
      "Stretches thighs and hip flexors",
      "Opens chest and shoulders",
      "Relieves menstrual discomfort",
      "Calms the nervous system"
    ],
    doshaAlignment: {
      primary: "Vata",
      effect: "Deeply grounding and calming, perfect for settling Vata imbalances and anxiety"
    },
    lifePhases: ["Menstrual (All phases)", "Pregnancy (1st trimester)", "Postpartum", "Menopause"],
    modifications: [
      "Place a bolster under the back",
      "Use a block under the head",
      "Keep knees together with padding between"
    ],
    anatomy: {
      primary: ["Quadriceps", "Hip flexors", "Pectorals"],
      secondary: ["Psoas", "Intercostals", "Ankle dorsiflexors"]
    },
    sequenceOrder: 4,
    category: "Restorative Yoga"
  },
  {
    id: "reclined-figure-four",
    name: "Reclined Figure Four",
    sanskritName: "Supta Kapotasana",
    image: reclinedFigureFour,
    description: "A gentle hip opener that releases tension in the piriformis and outer hip while being accessible for all levels.",
    benefits: [
      "Opens hips and glutes",
      "Relieves lower back tension",
      "Reduces sciatica discomfort",
      "Promotes relaxation"
    ],
    doshaAlignment: {
      primary: "Vata",
      effect: "Gentle grounding pose that calms the nervous system and relieves Vata-related tension"
    },
    lifePhases: ["Menstrual (All phases)", "Pregnancy (All trimesters)", "Postpartum", "Perimenopause", "Menopause", "Post-Menopause"],
    modifications: [
      "Keep head and shoulders on the floor",
      "Use a strap around the thigh",
      "Practice with elevated leg against wall"
    ],
    anatomy: {
      primary: ["Piriformis", "Gluteus maximus", "Hip rotators"],
      secondary: ["Hamstrings", "Lower back muscles", "IT band"]
    },
    sequenceOrder: 5,
    category: "Hip Opening"
  },
  {
    id: "fish-pose-legs-up",
    name: "Fish Pose with Legs Lifted",
    sanskritName: "Matsyasana Variation",
    image: fishPoseLegsUp,
    description: "An energising backbend with core activation that opens the throat and strengthens the abdominal muscles.",
    benefits: [
      "Strengthens core and hip flexors",
      "Opens chest and throat",
      "Stimulates thyroid",
      "Builds abdominal strength"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Stimulating and warming, this variation activates sluggish Kapha energy"
    },
    lifePhases: ["Menstrual (Follicular, Ovulation)", "Post-Menopause"],
    modifications: [
      "Keep one leg down at a time",
      "Place hands under hips for support",
      "Bend knees if core is fatigued"
    ],
    anatomy: {
      primary: ["Rectus abdominis", "Hip flexors", "Neck extensors"],
      secondary: ["Pectorals", "Serratus anterior", "Quadriceps"]
    },
    sequenceOrder: 6,
    category: "Core Strengthening"
  },
  {
    id: "warrior-three",
    name: "Warrior III",
    sanskritName: "Virabhadrasana III",
    image: warriorThree,
    description: "A dynamic balancing posture that strengthens the entire posterior chain while cultivating determination and focus.",
    benefits: [
      "Strengthens legs, core, and back",
      "Improves balance and posture",
      "Builds mental focus",
      "Tones abdominal organs"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Activating and energising, combats Kapha's tendency toward lethargy and stagnation"
    },
    lifePhases: ["Menstrual (Follicular, Ovulation)", "Perimenopause", "Post-Menopause"],
    modifications: [
      "Use blocks under hands",
      "Keep back toes on the floor",
      "Practice at a wall for support"
    ],
    anatomy: {
      primary: ["Hamstrings", "Glutes", "Erector spinae"],
      secondary: ["Core stabilizers", "Quadriceps", "Deltoids"]
    },
    sequenceOrder: 7,
    category: "Strengthening Yoga"
  },
  {
    id: "eagle-arms-seated",
    name: "Eagle Arms Seated",
    sanskritName: "Garudasana Arms in Vajrasana",
    image: eagleArmsSeated,
    description: "A shoulder-opening posture that releases upper back tension and encourages deep breathing.",
    benefits: [
      "Opens shoulders and upper back",
      "Releases neck tension",
      "Improves concentration",
      "Deepens breath capacity"
    ],
    doshaAlignment: {
      primary: "Pitta",
      effect: "Cooling and calming for the mind, helps release Pitta's intensity and mental heat"
    },
    lifePhases: ["Menstrual (All phases)", "Pregnancy (All trimesters)", "Postpartum", "Perimenopause", "Menopause", "Post-Menopause"],
    modifications: [
      "Hold opposite shoulders if arms don't wrap",
      "Sit on a block or cushion",
      "Keep elbows level with shoulders"
    ],
    anatomy: {
      primary: ["Rhomboids", "Trapezius", "Deltoids"],
      secondary: ["Triceps", "Rotator cuff", "Latissimus dorsi"]
    },
    sequenceOrder: 8,
    category: "Shoulder Opening"
  },
  {
    id: "supported-fish",
    name: "Supported Fish Pose",
    sanskritName: "Salamba Matsyasana",
    image: supportedFishPose,
    description: "A deeply restorative heart opener that releases chest tension and promotes emotional wellbeing.",
    benefits: [
      "Opens chest and heart space",
      "Relieves respiratory congestion",
      "Reduces fatigue and anxiety",
      "Supports emotional release"
    ],
    doshaAlignment: {
      primary: "Vata",
      effect: "Profoundly calming and grounding, ideal for Vata's anxious and scattered energy"
    },
    lifePhases: ["Menstrual (Menstruation, Luteal)", "Postpartum", "Perimenopause", "Menopause"],
    modifications: [
      "Use a bolster lengthwise under spine",
      "Place a blanket under head",
      "Support knees with bolsters"
    ],
    anatomy: {
      primary: ["Pectorals", "Intercostals", "Anterior deltoids"],
      secondary: ["Hip flexors", "Neck muscles", "Diaphragm"]
    },
    sequenceOrder: 9,
    category: "Restorative Yoga"
  },
  {
    id: "locust-pose",
    name: "Locust Pose",
    sanskritName: "Salabhasana",
    image: locustPose,
    description: "A strengthening backbend that builds posterior chain strength and prepares for deeper backbends.",
    benefits: [
      "Strengthens back muscles",
      "Tones buttocks and legs",
      "Improves posture",
      "Stimulates abdominal organs"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Heating and energising, excellent for activating sluggish Kapha and boosting metabolism"
    },
    lifePhases: ["Menstrual (Follicular, Ovulation)", "Perimenopause", "Post-Menopause"],
    modifications: [
      "Lift only upper body or legs separately",
      "Place a blanket under hip bones",
      "Keep arms alongside body"
    ],
    anatomy: {
      primary: ["Erector spinae", "Gluteus maximus", "Hamstrings"],
      secondary: ["Trapezius", "Rhomboids", "Posterior deltoids"]
    },
    sequenceOrder: 10,
    category: "Strengthening Yoga"
  }
];

const getDoshaIcon = (dosha: string) => {
  switch (dosha.toLowerCase()) {
    case "vata":
      return <Droplets className="h-4 w-4" />;
    case "pitta":
      return <Flame className="h-4 w-4" />;
    case "kapha":
      return <Mountain className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
};

const getDoshaColor = (dosha: string) => {
  switch (dosha.toLowerCase()) {
    case "vata":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
    case "pitta":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
    case "kapha":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-mumtaz-lilac/20 text-mumtaz-plum";
  }
};

export const PoseOfTheDay = () => {
  const navigate = useNavigate();
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);

  useEffect(() => {
    // Select pose based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const poseIndex = dayOfYear % poseLibrary.length;
    setCurrentPoseIndex(poseIndex);
  }, []);

  const currentPose = poseLibrary[currentPoseIndex];

  const goToPrevious = () => {
    setCurrentPoseIndex((prev) => (prev === 0 ? poseLibrary.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentPoseIndex((prev) => (prev === poseLibrary.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="bg-gradient-to-br from-mumtaz-lilac/10 via-background to-mumtaz-sage/10 border-mumtaz-lilac/30 shadow-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-accent" />
            <span className="text-xl font-semibold">Pose of the Day</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrevious} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {currentPoseIndex + 1} / {poseLibrary.length}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNext} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pose Image */}
        <div className="relative rounded-xl overflow-hidden aspect-[4/3] max-h-[300px]">
          <img
            src={currentPose.image}
            alt={currentPose.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
            <h3 className="text-2xl font-bold text-white">{currentPose.name}</h3>
            <p className="text-sm text-white/80 italic">{currentPose.sanskritName}</p>
          </div>
        </div>

        {/* Pose Description */}
        <p className="text-muted-foreground leading-relaxed">{currentPose.description}</p>

        {/* Dosha Alignment */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getDoshaColor(currentPose.doshaAlignment.primary)}`}>
            {getDoshaIcon(currentPose.doshaAlignment.primary)}
            <span className="font-medium text-sm">{currentPose.doshaAlignment.primary}</span>
          </div>
          <p className="text-sm text-muted-foreground flex-1">{currentPose.doshaAlignment.effect}</p>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-mumtaz-lilac" />
            Benefits
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {currentPose.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-3 w-3 mt-1 text-accent flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Anatomy Focus */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-mumtaz-sage" />
            Anatomy Focus
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentPose.anatomy.primary.map((muscle, index) => (
              <Badge key={index} variant="secondary" className="bg-mumtaz-sage/20 text-mumtaz-sage-dark">
                {muscle}
              </Badge>
            ))}
            {currentPose.anatomy.secondary.map((muscle, index) => (
              <Badge key={index} variant="outline" className="text-muted-foreground">
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        {/* Life Phases */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Moon className="h-4 w-4 text-mumtaz-plum" />
            Ideal Life Phases
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentPose.lifePhases.map((phase, index) => (
              <Badge key={index} className="bg-mumtaz-lilac/20 text-mumtaz-plum border-mumtaz-lilac/30">
                {phase}
              </Badge>
            ))}
          </div>
        </div>

        {/* Modifications */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-600" />
            Modifications
          </h4>
          <ul className="space-y-1">
            {currentPose.modifications.map((mod, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-mumtaz-sage mt-0.5">•</span>
                {mod}
              </li>
            ))}
          </ul>
        </div>

        {/* Sequence Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Sequence Position: {currentPose.sequenceOrder} of {poseLibrary.length}</span>
          </div>
          <Badge variant="outline" className="text-xs">{currentPose.category}</Badge>
        </div>

        {/* CTA Button */}
        <Button 
          variant="cta" 
          className="w-full"
          onClick={() => navigate("/content-library")}
        >
          Explore Full Pose Library
        </Button>
      </CardContent>
    </Card>
  );
};
