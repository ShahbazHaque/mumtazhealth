import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Sparkles, 
  Battery, 
  Brain, 
  Moon, 
  Calendar, 
  Utensils, 
  Bone,
  HelpCircle,
  ArrowRight,
  Waves
} from "lucide-react";
import { motion } from "framer-motion";

interface CycleChangesOnboardingProps {
  onComplete: (focusAreas: string[]) => void;
  onBack: () => void;
}

const FOCUS_AREAS = [
  { 
    id: "energy", 
    label: "Energy Changes", 
    description: "Fluctuating energy levels, fatigue patterns",
    icon: Battery 
  },
  { 
    id: "mood", 
    label: "Mood Shifts", 
    description: "Emotional changes, anxiety, irritability",
    icon: Brain 
  },
  { 
    id: "sleep", 
    label: "Sleep", 
    description: "Difficulty sleeping, night sweats, waking early",
    icon: Moon 
  },
  { 
    id: "cycle", 
    label: "Cycle Irregularity", 
    description: "Changes in timing, flow, or symptoms",
    icon: Calendar 
  },
  { 
    id: "digestion", 
    label: "Digestion", 
    description: "Bloating, changes in appetite, gut health",
    icon: Utensils 
  },
  { 
    id: "joints", 
    label: "Joint Discomfort", 
    description: "Stiffness, aches, mobility changes",
    icon: Bone 
  },
  { 
    id: "not_sure", 
    label: "I'm not sure yet", 
    description: "Help me notice what's changing",
    icon: HelpCircle 
  },
];

export function CycleChangesOnboarding({ onComplete, onBack }: CycleChangesOnboardingProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleArea = (areaId: string) => {
    if (areaId === "not_sure") {
      // If selecting "not sure", clear other selections
      setSelectedAreas(prev => 
        prev.includes("not_sure") ? [] : ["not_sure"]
      );
    } else {
      // If selecting something else, remove "not sure" and toggle the selection
      setSelectedAreas(prev => {
        const withoutNotSure = prev.filter(a => a !== "not_sure");
        if (withoutNotSure.includes(areaId)) {
          return withoutNotSure.filter(a => a !== areaId);
        }
        return [...withoutNotSure, areaId];
      });
    }
  };

  const handleContinue = () => {
    const areasToSave = selectedAreas.length > 0 ? selectedAreas : ["not_sure"];
    onComplete(areasToSave);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Supportive Message */}
      <Card className="bg-gradient-to-br from-teal-50/50 via-wellness-sage/10 to-wellness-lilac/10 border-teal-200/40 dark:from-teal-900/20 dark:via-wellness-sage/5 dark:to-wellness-lilac/5 dark:border-teal-800/40">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/30 flex-shrink-0">
              <Waves className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Your body is speaking to you
                <Sparkles className="w-4 h-4 text-teal-500" />
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Many women experience changes before perimenopause — sometimes years before. 
                This space is here to help you <span className="text-foreground font-medium">notice patterns gently</span>, 
                without pressure or labels.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Whatever you're experiencing is valid, and understanding your body's signals is the first step toward feeling supported.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Focus Areas Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            What would you like to focus on?
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the areas where you'd like support. You can choose multiple or update this anytime.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {FOCUS_AREAS.map((area) => {
            const Icon = area.icon;
            const isSelected = selectedAreas.includes(area.id);
            const isNotSure = area.id === "not_sure";
            
            return (
              <motion.div
                key={area.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  onClick={() => toggleArea(area.id)}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                    ${isNotSure ? 'border-dashed' : ''}
                    ${isSelected 
                      ? 'bg-primary/10 border-primary/40 shadow-sm' 
                      : 'bg-card hover:bg-accent/30 border-border/50 hover:border-primary/30'
                    }
                  `}
                >
                  <Checkbox 
                    checked={isSelected}
                    className="mt-1"
                  />
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <Label className="font-medium cursor-pointer text-foreground">
                      {area.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {area.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          className="flex-1 bg-gradient-to-r from-teal-500 to-wellness-sage hover:from-teal-600 hover:to-wellness-sage/90"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}