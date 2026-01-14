import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Leaf, Moon, Sun, Activity, ChevronLeft, ChevronRight, Flame, Droplets, Mountain, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Import Mumtaz brand pose images
import { 
  mumtazYoga1, 
  mumtazYoga2, 
  mumtazYoga3, 
  mumtazYoga4, 
  mumtazYoga5, 
  mumtazYoga6, 
  mumtazYoga7, 
  mumtazYoga8, 
  mumtazYoga9, 
  mumtazYoga10 
} from "@/assets/brandImages";

interface UserProfile {
  primaryDosha: string | null;
  lifeStage: string | null;
}

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
    id: "dynamic-leg-lift",
    name: "Dynamic Kneeling Leg Lift",
    sanskritName: "Vyaghrasana Variation",
    image: mumtazYoga1,
    description: "A powerful dynamic movement that strengthens the core and glutes while improving balance and coordination.",
    benefits: [
      "Strengthens core and glutes",
      "Improves balance and coordination",
      "Opens hip flexors",
      "Builds leg strength"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Activating and energising practice that counters Kapha's sluggish tendencies"
    },
    lifePhases: ["Menstrual (Follicular)", "Perimenopause", "Post-Menopause"],
    modifications: [
      "Keep lower knee on a blanket",
      "Hold onto a wall for balance",
      "Reduce range of motion"
    ],
    anatomy: {
      primary: ["Gluteus maximus", "Quadriceps", "Core"],
      secondary: ["Hip flexors", "Hamstrings", "Lower back"]
    },
    sequenceOrder: 1,
    category: "Strengthening Yoga"
  },
  {
    id: "kneeling-hamstring-stretch",
    name: "Kneeling Hamstring Stretch",
    sanskritName: "Ardha Hanumanasana",
    image: mumtazYoga2,
    description: "A gentle seated stretch that opens the hamstrings and prepares for deeper forward folds.",
    benefits: [
      "Stretches hamstrings deeply",
      "Releases lower back tension",
      "Prepares for splits practice",
      "Calms the nervous system"
    ],
    doshaAlignment: {
      primary: "Vata",
      effect: "Grounding and calming, perfect for settling Vata's restless energy"
    },
    lifePhases: ["Menstrual (All phases)", "Pregnancy (1st-2nd trimester)", "Postpartum", "Perimenopause"],
    modifications: [
      "Use blocks under hands",
      "Keep back knee on a blanket",
      "Bend front knee slightly"
    ],
    anatomy: {
      primary: ["Hamstrings", "Calf muscles", "Lower back"],
      secondary: ["Hip flexors", "Glutes", "Achilles tendon"]
    },
    sequenceOrder: 2,
    category: "Flexibility & Mobility"
  },
  {
    id: "full-splits",
    name: "Full Splits with Arms Overhead",
    sanskritName: "Hanumanasana",
    image: mumtazYoga3,
    description: "An advanced hip opener that requires patience and consistent practice to achieve safely.",
    benefits: [
      "Deep hip and hamstring opening",
      "Strengthens the core",
      "Builds mental focus",
      "Develops patience and perseverance"
    ],
    doshaAlignment: {
      primary: "Pitta",
      effect: "Cooling and releasing, helps Pitta types let go of perfectionism"
    },
    lifePhases: ["Menstrual (Ovulation)", "Post-Menopause (with modifications)"],
    modifications: [
      "Use blocks under hands",
      "Keep back knee down",
      "Practice half splits first"
    ],
    anatomy: {
      primary: ["Hamstrings", "Hip flexors", "Psoas"],
      secondary: ["Quadriceps", "Glutes", "Core"]
    },
    sequenceOrder: 3,
    category: "Advanced Flexibility"
  },
  {
    id: "core-block-work",
    name: "Core Work with Block",
    sanskritName: "Navasana Variation",
    image: mumtazYoga4,
    description: "An energising core exercise that strengthens the abdominals while using props for proper alignment.",
    benefits: [
      "Strengthens core and hip flexors",
      "Improves body awareness",
      "Builds abdominal strength",
      "Enhances pelvic floor engagement"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Stimulating and warming, activates sluggish Kapha energy"
    },
    lifePhases: ["Menstrual (Follicular, Ovulation)", "Post-Menopause"],
    modifications: [
      "Keep one leg down at a time",
      "Place hands under hips for support",
      "Bend knees if core is fatigued"
    ],
    anatomy: {
      primary: ["Rectus abdominis", "Hip flexors", "Transverse abdominis"],
      secondary: ["Pectorals", "Serratus anterior", "Quadriceps"]
    },
    sequenceOrder: 4,
    category: "Core Strengthening"
  },
  {
    id: "scissors-core",
    name: "Scissors Core Exercise",
    sanskritName: "Paripurna Navasana Variation",
    image: mumtazYoga5,
    description: "A dynamic core exercise that alternates leg movements while maintaining core stability.",
    benefits: [
      "Strengthens entire core",
      "Improves hip flexor strength",
      "Builds coordination",
      "Enhances body control"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Energising and activating, excellent for boosting metabolism"
    },
    lifePhases: ["Menstrual (Follicular)", "Perimenopause", "Post-Menopause"],
    modifications: [
      "Reduce range of motion",
      "Keep head down on mat",
      "Slow down the movement"
    ],
    anatomy: {
      primary: ["Rectus abdominis", "Hip flexors", "Obliques"],
      secondary: ["Quadriceps", "Lower back", "Transverse abdominis"]
    },
    sequenceOrder: 5,
    category: "Core Strengthening"
  },
  {
    id: "reverse-warrior",
    name: "Reverse Warrior",
    sanskritName: "Viparita Virabhadrasana",
    image: mumtazYoga6,
    description: "A graceful standing pose that opens the side body while strengthening the legs.",
    benefits: [
      "Stretches the side body",
      "Strengthens legs and core",
      "Opens hips and chest",
      "Builds stamina"
    ],
    doshaAlignment: {
      primary: "Pitta",
      effect: "Cooling side stretch that releases heat and tension from the body"
    },
    lifePhases: ["Menstrual (All phases)", "Perimenopause", "Menopause", "Post-Menopause"],
    modifications: [
      "Shorten the stance",
      "Keep back hand on hip",
      "Practice against a wall"
    ],
    anatomy: {
      primary: ["Quadriceps", "Obliques", "Intercostals"],
      secondary: ["Glutes", "Hip flexors", "Latissimus dorsi"]
    },
    sequenceOrder: 6,
    category: "Standing Yoga"
  },
  {
    id: "thread-the-needle",
    name: "Thread the Needle",
    sanskritName: "Parsva Balasana",
    image: mumtazYoga7,
    description: "A gentle twist that releases tension in the shoulders and upper back while calming the mind.",
    benefits: [
      "Opens shoulders and upper back",
      "Releases neck tension",
      "Calms the nervous system",
      "Improves spinal mobility"
    ],
    doshaAlignment: {
      primary: "Vata",
      effect: "Grounding and calming, perfect for settling anxiety and restlessness"
    },
    lifePhases: ["Menstrual (All phases)", "Pregnancy (All trimesters)", "Postpartum", "Perimenopause", "Menopause"],
    modifications: [
      "Place a blanket under the head",
      "Keep the knees closer together",
      "Use a block under the shoulder"
    ],
    anatomy: {
      primary: ["Rhomboids", "Trapezius", "Deltoids"],
      secondary: ["Rotator cuff", "Latissimus dorsi", "Obliques"]
    },
    sequenceOrder: 7,
    category: "Restorative Yoga"
  },
  {
    id: "pigeon-pose-variation",
    name: "One-Legged King Pigeon",
    sanskritName: "Eka Pada Rajakapotasana",
    image: mumtazYoga8,
    description: "An advanced hip opener that combines a deep stretch with a beautiful backbend.",
    benefits: [
      "Deep hip and psoas release",
      "Opens the chest and shoulders",
      "Improves flexibility",
      "Builds focus and patience"
    ],
    doshaAlignment: {
      primary: "Vata",
      effect: "Deeply grounding and calming, releases stored tension"
    },
    lifePhases: ["Menstrual (Follicular, Ovulation)", "Post-Menopause"],
    modifications: [
      "Keep back leg straight",
      "Use a strap around the back foot",
      "Practice mermaid pose first"
    ],
    anatomy: {
      primary: ["Hip flexors", "Quadriceps", "Psoas"],
      secondary: ["Shoulders", "Chest", "Spine"]
    },
    sequenceOrder: 8,
    category: "Advanced Flexibility"
  },
  {
    id: "king-pigeon-seated",
    name: "Seated King Pigeon",
    sanskritName: "Eka Pada Rajakapotasana II",
    image: mumtazYoga9,
    description: "A beautiful seated backbend that opens the heart and stretches the entire front body.",
    benefits: [
      "Opens chest and heart space",
      "Stretches hip flexors deeply",
      "Improves posture",
      "Builds grace and poise"
    ],
    doshaAlignment: {
      primary: "Pitta",
      effect: "Heart-opening practice that releases emotional heat and tension"
    },
    lifePhases: ["Menstrual (Follicular)", "Post-Menopause"],
    modifications: [
      "Use a strap around the foot",
      "Keep the back leg extended",
      "Practice against a wall"
    ],
    anatomy: {
      primary: ["Quadriceps", "Hip flexors", "Pectorals"],
      secondary: ["Shoulders", "Triceps", "Spine"]
    },
    sequenceOrder: 9,
    category: "Advanced Flexibility"
  },
  {
    id: "extended-side-angle",
    name: "Extended Side Angle",
    sanskritName: "Utthita Parsvakonasana",
    image: mumtazYoga10,
    description: "A grounding standing pose that strengthens the legs while opening the side body and hips.",
    benefits: [
      "Strengthens legs and core",
      "Opens hips and chest",
      "Stretches the side body",
      "Builds stamina and focus"
    ],
    doshaAlignment: {
      primary: "Kapha",
      effect: "Energising and grounding, counters Kapha's heaviness with dynamic movement"
    },
    lifePhases: ["Menstrual (Follicular, Ovulation)", "Perimenopause", "Post-Menopause"],
    modifications: [
      "Place elbow on thigh instead of hand to floor",
      "Use a block under the bottom hand",
      "Keep top arm on hip"
    ],
    anatomy: {
      primary: ["Quadriceps", "Glutes", "Obliques"],
      secondary: ["Hip adductors", "Core", "Shoulders"]
    },
    sequenceOrder: 10,
    category: "Standing Yoga"
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
  const [userProfile, setUserProfile] = useState<UserProfile>({ primaryDosha: null, lifeStage: null });
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No user - use day-based selection
        selectDayBasedPose();
        return;
      }

      const { data, error } = await supabase
        .from("user_wellness_profiles")
        .select("primary_dosha, life_stage")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile for pose:", error);
        selectDayBasedPose();
        return;
      }

      if (data?.primary_dosha || data?.life_stage) {
        setUserProfile({
          primaryDosha: data.primary_dosha,
          lifeStage: data.life_stage
        });
        selectPersonalizedPose(data.primary_dosha, data.life_stage);
      } else {
        selectDayBasedPose();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      selectDayBasedPose();
    }
  };

  const selectDayBasedPose = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const poseIndex = dayOfYear % poseLibrary.length;
    setCurrentPoseIndex(poseIndex);
    setIsPersonalized(false);
  };

  const selectPersonalizedPose = (dosha: string | null, lifeStage: string | null) => {
    // Score poses based on user's dosha and life stage
    const scoredPoses = poseLibrary.map((pose, index) => {
      let score = 0;
      
      // Match dosha
      if (dosha && pose.doshaAlignment.primary.toLowerCase() === dosha.toLowerCase()) {
        score += 3;
      }
      
      // Match life stage
      if (lifeStage) {
        const stageMapping: Record<string, string[]> = {
          menstrual_cycle: ["Menstrual", "Follicular", "Ovulatory", "Luteal"],
          pregnancy: ["Pregnancy"],
          postpartum: ["Postpartum"],
          perimenopause: ["Perimenopause"],
          menopause: ["Menopause"],
          post_menopause: ["Post-Menopause"],
        };
        
        const relevantPhases = stageMapping[lifeStage] || [];
        if (pose.lifePhases.some(phase => 
          relevantPhases.some(rp => phase.toLowerCase().includes(rp.toLowerCase()))
        )) {
          score += 2;
        }
      }
      
      // Add day-based variation to break ties
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      score += ((dayOfYear + index) % 10) / 10; // Small variation
      
      return { index, score };
    });
    
    // Sort by score and pick the best match
    scoredPoses.sort((a, b) => b.score - a.score);
    setCurrentPoseIndex(scoredPoses[0].index);
    setIsPersonalized(scoredPoses[0].score > 1);
  };

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
            {isPersonalized && (
              <Badge variant="secondary" className="text-xs gap-1">
                <User className="h-3 w-3" />
                For you
              </Badge>
            )}
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
