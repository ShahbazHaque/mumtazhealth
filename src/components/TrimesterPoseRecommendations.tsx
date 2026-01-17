import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Baby, Leaf, Wind, Sun, Moon, ChevronRight, Heart, Shield, Sparkles } from "lucide-react";
import { usePregnancySafeMode } from "@/hooks/usePregnancySafeMode";

interface TrimesterRecommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  focus: string[];
  modifications: string[];
  imageHint: string; // For visual representation
}

interface TrimesterConfig {
  name: string;
  description: string;
  theme: {
    gradient: string;
    border: string;
    accent: string;
    icon: React.ReactNode;
  };
  generalGuidance: string[];
  recommendedPractices: TrimesterRecommendation[];
  avoidances: string[];
}

const TRIMESTER_CONFIGS: Record<number, TrimesterConfig> = {
  1: {
    name: "First Trimester",
    description: "Weeks 1-12: Foundation & Gentle Beginnings",
    theme: {
      gradient: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
      border: "border-rose-200 dark:border-rose-800",
      accent: "text-rose-600 dark:text-rose-400",
      icon: <Leaf className="h-5 w-5" />
    },
    generalGuidance: [
      "Listen to fatigue signals and rest when needed",
      "Stay hydrated throughout practice",
      "Avoid overheating - practice in cool spaces",
      "Gentle movements are perfectly sufficient"
    ],
    recommendedPractices: [
      {
        id: "t1-gentle-flow",
        title: "Gentle Morning Flow",
        description: "Ease into your day with calming stretches that honor your changing body",
        duration: "10-15 min",
        focus: ["Gentle stretching", "Hip opening", "Shoulder release"],
        modifications: ["Use blocks for support", "Take child's pose when needed"],
        imageHint: "gentle-yoga"
      },
      {
        id: "t1-nausea-relief",
        title: "Nausea Relief Breathing",
        description: "Calming breathwork to ease morning sickness and settle digestion",
        duration: "5-10 min",
        focus: ["Diaphragmatic breathing", "Cooling breath", "Grounding"],
        modifications: ["Practice seated or reclined", "Keep movements minimal"],
        imageHint: "breathing"
      },
      {
        id: "t1-restorative",
        title: "Supported Restorative Rest",
        description: "Deeply relaxing poses with full prop support for rest and recovery",
        duration: "15-20 min",
        focus: ["Complete relaxation", "Stress relief", "Energy restoration"],
        modifications: ["Bolsters under knees", "Eye pillow for relaxation"],
        imageHint: "restorative"
      },
      {
        id: "t1-hip-opener",
        title: "Gentle Hip Opening",
        description: "Prepare your hips for the journey ahead with soft, supported stretches",
        duration: "10 min",
        focus: ["Hip flexibility", "Lower back relief", "Pelvic awareness"],
        modifications: ["Pillows for support", "Wall for balance"],
        imageHint: "hip-opener"
      }
    ],
    avoidances: [
      "Hot yoga or overheating",
      "Intense core work",
      "Jumping or jarring movements",
      "Holding breath during poses"
    ]
  },
  2: {
    name: "Second Trimester",
    description: "Weeks 13-26: Energy & Gentle Expansion",
    theme: {
      gradient: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
      border: "border-amber-200 dark:border-amber-800",
      accent: "text-amber-600 dark:text-amber-400",
      icon: <Sun className="h-5 w-5" />
    },
    generalGuidance: [
      "Avoid lying flat on your back for extended periods",
      "Use props to accommodate your growing belly",
      "Balance work should include wall or chair support",
      "Wide-legged stances for comfort"
    ],
    recommendedPractices: [
      {
        id: "t2-standing-strength",
        title: "Supported Standing Poses",
        description: "Build strength and stability with wall-supported standing sequences",
        duration: "15-20 min",
        focus: ["Leg strength", "Balance with support", "Posture alignment"],
        modifications: ["Hand on wall for balance", "Wide stance", "Blocks for forward folds"],
        imageHint: "standing-yoga"
      },
      {
        id: "t2-side-lying",
        title: "Side-Lying Stretches",
        description: "Comfortable stretches that avoid back pressure while opening hips and shoulders",
        duration: "10-15 min",
        focus: ["Hip release", "Shoulder opening", "Spinal comfort"],
        modifications: ["Pillow between knees", "Support under belly"],
        imageHint: "side-lying"
      },
      {
        id: "t2-chair-yoga",
        title: "Chair-Based Practice",
        description: "Fully accessible yoga using a chair for support and stability",
        duration: "15 min",
        focus: ["Upper body strength", "Seated stretches", "Breathing"],
        modifications: ["Sturdy chair without wheels", "Cushion for comfort"],
        imageHint: "chair-yoga"
      },
      {
        id: "t2-pelvic-floor",
        title: "Pelvic Floor Awareness",
        description: "Gentle exercises to strengthen and prepare your pelvic floor",
        duration: "10 min",
        focus: ["Kegel exercises", "Breath coordination", "Core connection"],
        modifications: ["Seated or supported positions", "Focus on release as well as engagement"],
        imageHint: "pelvic-floor"
      }
    ],
    avoidances: [
      "Lying flat on back (use incline or side-lying)",
      "Deep twists that compress the belly",
      "Jumping or high-impact movements",
      "Unsupported balance poses"
    ]
  },
  3: {
    name: "Third Trimester",
    description: "Weeks 27-40: Gentle Preparation & Rest",
    theme: {
      gradient: "from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20",
      border: "border-purple-200 dark:border-purple-800",
      accent: "text-purple-600 dark:text-purple-400",
      icon: <Moon className="h-5 w-5" />
    },
    generalGuidance: [
      "Prioritize rest and gentle movement",
      "Full prop support for all positions",
      "Focus on breathing and relaxation",
      "Short, frequent practices over long sessions"
    ],
    recommendedPractices: [
      {
        id: "t3-birth-prep",
        title: "Birth Preparation Breathing",
        description: "Calming breathing techniques to prepare for labor and delivery",
        duration: "10 min",
        focus: ["Labor breathing", "Relaxation", "Surrender techniques"],
        modifications: ["Any comfortable position", "Partner support welcome"],
        imageHint: "breathing"
      },
      {
        id: "t3-gentle-stretch",
        title: "Very Gentle Stretches",
        description: "Minimal movement stretches focusing on comfort and relief",
        duration: "10 min",
        focus: ["Lower back relief", "Hip comfort", "Shoulder release"],
        modifications: ["All props available", "Seated or side-lying only", "Skip any uncomfortable movement"],
        imageHint: "gentle-stretch"
      },
      {
        id: "t3-wall-supported",
        title: "Wall-Supported Poses",
        description: "Safe, stable stretches using the wall for full support",
        duration: "10-15 min",
        focus: ["Leg stretches", "Hip opening", "Stability"],
        modifications: ["Wall for all balance", "Wide stance", "Frequent breaks"],
        imageHint: "wall-yoga"
      },
      {
        id: "t3-meditation",
        title: "Bonding Meditation",
        description: "Connect with your baby through guided visualization and breath",
        duration: "10-15 min",
        focus: ["Baby connection", "Calm nervous system", "Positive visualization"],
        modifications: ["Comfortable seated or reclined with support", "Blankets for warmth"],
        imageHint: "meditation"
      },
      {
        id: "t3-bed-mobility",
        title: "Bed-Based Movements",
        description: "Gentle movements you can do lying on your side in bed",
        duration: "5-10 min",
        focus: ["Circulation", "Comfort", "Easy stretches"],
        modifications: ["Pillows for full support", "Move slowly", "Rest between movements"],
        imageHint: "bed-yoga"
      }
    ],
    avoidances: [
      "Any lying flat on back",
      "Deep squats (unless comfortable)",
      "Inversions of any kind",
      "Intense stretching",
      "Extended standing",
      "Any movement causing discomfort"
    ]
  }
};

interface TrimesterPoseRecommendationsProps {
  onSelectPractice?: (practiceId: string) => void;
}

export function TrimesterPoseRecommendations({ onSelectPractice }: TrimesterPoseRecommendationsProps) {
  const { isPregnancySafeMode, trimester, isLoading } = usePregnancySafeMode();
  const [selectedTrimester, setSelectedTrimester] = useState<number>(trimester || 1);
  
  if (!isPregnancySafeMode || isLoading) {
    return null;
  }
  
  const currentConfig = TRIMESTER_CONFIGS[selectedTrimester];
  
  return (
    <Card className={`overflow-hidden border-2 ${currentConfig.theme.border}`}>
      <div className={`bg-gradient-to-r ${currentConfig.theme.gradient} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-white/80 dark:bg-black/20 ${currentConfig.theme.accent}`}>
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pregnancy-Safe Recommendations</h3>
              <p className="text-sm text-muted-foreground">Practices tailored for your journey</p>
            </div>
          </div>
          <Badge variant="outline" className={currentConfig.theme.accent}>
            {currentConfig.theme.icon}
            <span className="ml-1">{currentConfig.name}</span>
          </Badge>
        </div>
        
        {/* Trimester Selector */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((t) => (
            <Button
              key={t}
              size="sm"
              variant={selectedTrimester === t ? "default" : "outline"}
              className={`flex-1 ${
                selectedTrimester === t 
                  ? 'bg-primary' 
                  : 'bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/30'
              }`}
              onClick={() => setSelectedTrimester(t)}
            >
              {t === 1 && <Leaf className="h-3.5 w-3.5 mr-1.5" />}
              {t === 2 && <Sun className="h-3.5 w-3.5 mr-1.5" />}
              {t === 3 && <Moon className="h-3.5 w-3.5 mr-1.5" />}
              Trimester {t}
              {trimester === t && <span className="ml-1 text-xs">(You)</span>}
            </Button>
          ))}
        </div>
        
        {/* General Guidance */}
        <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">General Guidance</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {currentConfig.generalGuidance.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-green-600 mt-0.5">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommended Practices
        </h4>
        
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-3">
            {currentConfig.recommendedPractices.map((practice) => (
              <Card 
                key={practice.id}
                className="flex-shrink-0 w-64 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectPractice?.(practice.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {practice.duration}
                    </Badge>
                    <Heart className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </div>
                  <CardTitle className="text-sm sm:text-base leading-snug break-words hyphens-auto">{practice.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed mt-1">
                    {practice.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {practice.focus.slice(0, 2).map((f, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Pregnancy-safe
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        {/* Avoidances */}
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <h5 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Avoid During {currentConfig.name}
          </h5>
          <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
            {currentConfig.avoidances.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-red-500">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Third trimester special note */}
        {selectedTrimester === 3 && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Third Trimester Focus
              </span>
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-400">
              As you approach your due date, prioritize rest and very gentle movement. 
              Short practices (5-10 minutes) are ideal. Focus on breathing, relaxation, 
              and bonding with your baby. Every body is different—honor what feels right for you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
