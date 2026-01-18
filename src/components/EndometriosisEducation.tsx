import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, Sparkles, Leaf, Wind, Shield, Flame, Mountain, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JourneyTimeline, JourneyPhase } from "@/components/journey/JourneyTimeline";
import { JourneyPhaseCard, PhaseCardData } from "@/components/journey/JourneyPhaseCard";
import { JourneySafetyReminder } from "@/components/journey/JourneySafetyReminder";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { cn } from "@/lib/utils";

interface EndoPhase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  whatToFocus: string[];
  ayurvedicGuidance: string;
  emotionalNote: string;
  visualTheme: {
    gradient: string;
    borderColor: string;
    iconBg: string;
    accentColor: string;
  };
}

const ENDO_PHASES: EndoPhase[] = [
  {
    id: "flare",
    title: "During a Flare",
    subtitle: "Rest, compassion, and nervous system care",
    description: "When pain is present, the only priority is comfort and care. This is not the time to push, fix, or achieve. Your body needs you to slow down completely.",
    whatToFocus: [
      "Complete rest — there's nothing wrong with doing nothing",
      "Warmth on your belly or lower back if it feels good",
      "Very gentle breathing — no forcing, no deep practices",
      "Asking for help if you need it, without guilt"
    ],
    ayurvedicGuidance: "Flares often involve aggravated Vata (pain, tension) and Pitta (inflammation). Warmth, stillness, and calming presence are your medicine. Avoid cold foods, screens, and stimulation.",
    emotionalNote: "Pain is exhausting. It's okay to feel angry, sad, or frustrated. Those feelings are valid. You don't have to be positive.",
    visualTheme: {
      gradient: "from-rose-100/40 to-rose-50/20",
      borderColor: "border-rose-200/50",
      iconBg: "bg-rose-100/50",
      accentColor: "text-rose-600"
    }
  },
  {
    id: "recovery",
    title: "Recovery Days",
    subtitle: "Slowly emerging, gently rebuilding",
    description: "The days after a flare are for gentle recovery. Energy may be low, emotions may be fragile. There's no rush to 'bounce back'. Take what you need.",
    whatToFocus: [
      "Gentle, restorative movement only if it feels good",
      "Nourishing, easy-to-digest meals — soups, stews, warm foods",
      "Reconnecting with your body without judgement",
      "Continuing to prioritise rest even when pain eases"
    ],
    ayurvedicGuidance: "Focus on rebuilding Ojas (vitality) with nourishing foods, adequate sleep, and avoiding overexertion. Your body has been through a lot — treat it tenderly.",
    emotionalNote: "It's common to feel relief mixed with exhaustion. Be patient with yourself as your energy slowly returns.",
    visualTheme: {
      gradient: "from-wellness-lilac/20 to-wellness-lilac/5",
      borderColor: "border-wellness-lilac/30",
      iconBg: "bg-wellness-lilac/10",
      accentColor: "text-wellness-lilac"
    }
  },
  {
    id: "stable",
    title: "Stable Days",
    subtitle: "Building resilience with care",
    description: "On better days, you can gently support your body with movement, nourishment, and lifestyle practices. But 'better' doesn't mean 'push harder'. Consistency matters more than intensity.",
    whatToFocus: [
      "Gentle, low-impact movement — yoga, walking, stretching",
      "Anti-inflammatory nutrition without restriction or stress",
      "Stress management and nervous system regulation",
      "Building routines that support you without pressure"
    ],
    ayurvedicGuidance: "Daily routines (Dinacharya), regular meals, gentle movement, and adequate sleep help maintain balance. Avoid extremes — in diet, exercise, or emotions.",
    emotionalNote: "Living with endo is a marathon, not a sprint. Celebrate small wins. Be proud of yourself for showing up.",
    visualTheme: {
      gradient: "from-wellness-sage/20 to-wellness-sage/5",
      borderColor: "border-wellness-sage/30",
      iconBg: "bg-wellness-sage/10",
      accentColor: "text-wellness-sage"
    }
  }
];

const ENDO_SUPPORT_AREAS = [
  {
    title: "Movement",
    icon: Heart,
    color: "text-wellness-sage",
    points: [
      "Restorative yoga and gentle stretching",
      "Walking when energy allows",
      "Avoiding high-impact or intense exercise",
      "Stopping immediately if pain increases"
    ]
  },
  {
    title: "Nutrition",
    icon: Leaf,
    color: "text-emerald-600",
    points: [
      "Anti-inflammatory foods: turmeric, ginger, leafy greens",
      "Warm, cooked, easy-to-digest meals",
      "Avoiding processed foods when possible",
      "No extreme diets or restriction"
    ]
  },
  {
    title: "Nervous System",
    icon: Wind,
    color: "text-sky-600",
    points: [
      "Extended exhale breathing for calm",
      "Body scans without forcing relaxation",
      "Vagal toning practices when tolerated",
      "Permission to rest without guilt"
    ]
  },
  {
    title: "Emotional Care",
    icon: Moon,
    color: "text-wellness-lilac",
    points: [
      "Acknowledging grief, anger, and frustration",
      "Connecting with supportive community",
      "Journaling or creative expression",
      "Professional support when needed"
    ]
  }
];

export function EndometriosisEducation() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState("stable");

  useEffect(() => {
    const fetchUserDosha = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("user_wellness_profiles")
            .select("primary_dosha")
            .eq("user_id", user.id)
            .single();
          if (profile?.primary_dosha) {
            setUserDosha(profile.primary_dosha.toLowerCase());
          }
        }
      } catch (error) {
        console.log("Error fetching dosha:", error);
      }
    };
    fetchUserDosha();
  }, []);

  const journeyPhases: JourneyPhase[] = ENDO_PHASES.map(phase => ({
    id: phase.id,
    label: phase.title.split(" ")[0],
    subtitle: phase.subtitle,
    isActive: phase.id === currentPhase
  }));

  const currentPhaseData = ENDO_PHASES.find(p => p.id === currentPhase) || ENDO_PHASES[2];

  const phaseCardData: PhaseCardData = {
    phaseId: currentPhaseData.id,
    title: currentPhaseData.title,
    subtitle: currentPhaseData.subtitle,
    description: currentPhaseData.description,
    whatYouMayNotice: currentPhaseData.whatToFocus,
    holisticNote: currentPhaseData.ayurvedicGuidance,
    visualTheme: currentPhaseData.visualTheme
  };

  const handlePractitionerAction = () => {
    window.location.href = "/bookings";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-wellness-lilac/30 bg-gradient-to-br from-wellness-lilac/5 to-wellness-sage/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-wellness-lilac/15">
                  <Heart className="w-5 h-5 text-wellness-lilac" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Endometriosis Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Pain-aware movement, nervous system care, and compassionate guidance
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3">
        <Card className="border-wellness-lilac/20">
          <CardContent className="p-4 space-y-5">
            {/* Safety note */}
            <div className="p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/20">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-wellness-lilac flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This content offers supportive lifestyle guidance alongside your medical care. It does not replace medical treatment. Always work with your healthcare team and listen to your body.
                </p>
              </div>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Living with endometriosis is hard. The pain, the unpredictability, the emotional weight — it's all real. This space is here to offer gentle support, not to fix you. There's nothing wrong with you. You're navigating something difficult, and you deserve compassion.
              </p>
            </div>

            {/* Phase selector */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Where are you today?</p>
              <div className="flex flex-wrap gap-2">
                {ENDO_PHASES.map(phase => (
                  <Button
                    key={phase.id}
                    variant={currentPhase === phase.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPhase(phase.id)}
                    className={cn(
                      "text-xs",
                      currentPhase === phase.id 
                        ? "bg-wellness-lilac text-white hover:bg-wellness-lilac/90" 
                        : "border-wellness-lilac/30 hover:bg-wellness-lilac/10"
                    )}
                  >
                    {phase.title}
                  </Button>
                ))}
              </div>
            </div>

            {/* Visual Timeline */}
            <JourneyTimeline 
              phases={journeyPhases}
              currentPhase={currentPhase}
              journeyType="recovery"
            />

            {/* Phase Card */}
            <JourneyPhaseCard 
              phaseData={phaseCardData}
              journeyType="recovery"
              userDosha={userDosha}
            />

            {/* Emotional note */}
            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200/50">
              <div className="flex items-start gap-2">
                <Moon className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Emotional care reminder</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {currentPhaseData.emotionalNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Support areas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-wellness-lilac" />
                <h4 className="text-sm font-medium text-foreground">Areas of Support</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ENDO_SUPPORT_AREAS.map((area) => {
                  const IconComponent = area.icon;
                  return (
                    <div 
                      key={area.title}
                      className="p-3 rounded-xl bg-card border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={cn("w-4 h-4", area.color)} />
                        <h5 className="text-sm font-medium text-foreground">{area.title}</h5>
                      </div>
                      <ul className="space-y-1">
                        {area.points.map((point, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-wellness-sage mt-1.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Important reminder */}
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Remember:</strong> You don't have to push through pain. Resting is not giving up. Asking for help is strength. Your body is doing its best, and so are you.
              </p>
            </div>

            {/* CTA to Content Library */}
            <div className="pt-3 border-t border-border/50">
              <Link 
                to="/content-library?concern=endometriosis"
                className="block"
              >
                <Button 
                  variant="outline" 
                  className="w-full border-wellness-lilac/30 text-foreground hover:bg-wellness-lilac/10 hover:border-wellness-lilac/50"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Explore gentle, pain-aware practices
                </Button>
              </Link>
            </div>

            {/* Safety reminder */}
            <JourneySafetyReminder 
              journeyType="recovery" 
              showPractitionerCTA={true}
              onPractitionerClick={handlePractitionerAction}
              variant="card"
            />

            {/* App disclaimer */}
            <AppCompanionDisclaimer variant="subtle" className="pt-2" />
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default EndometriosisEducation;
