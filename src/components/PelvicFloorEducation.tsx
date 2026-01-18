import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, Sparkles, Leaf, Wind, Shield, Flame, Mountain } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JourneyTimeline, JourneyPhase } from "@/components/journey/JourneyTimeline";
import { JourneyPhaseCard, PhaseCardData } from "@/components/journey/JourneyPhaseCard";
import { JourneySafetyReminder } from "@/components/journey/JourneySafetyReminder";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { cn } from "@/lib/utils";

interface PelvicFloorPhase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  whatToFocus: string[];
  ayurvedicGuidance: string;
  breathworkNote: string;
  visualTheme: {
    gradient: string;
    borderColor: string;
    iconBg: string;
    accentColor: string;
  };
}

const PELVIC_FLOOR_PHASES: PelvicFloorPhase[] = [
  {
    id: "awareness",
    title: "Awareness & Reconnection",
    subtitle: "Beginning to notice and understand",
    description: "This is a time to gently reconnect with your body. There's no rush, no pressure — just soft awareness of what is, without judgement.",
    whatToFocus: [
      "Gentle body scans to notice sensations without forcing change",
      "Breath awareness — how your breath moves through your body",
      "Understanding that pelvic floor health is about balance, not just strength",
      "Releasing tension you may be holding unconsciously"
    ],
    ayurvedicGuidance: "From an Ayurvedic view, pelvic floor imbalance often relates to Vata (air) energy — the tendency to hold, tighten, or disconnect. Gentle grounding practices help restore calm and flow.",
    breathworkNote: "Simple diaphragmatic breathing can help release unconscious holding patterns.",
    visualTheme: {
      gradient: "from-wellness-sage/20 to-wellness-sage/5",
      borderColor: "border-wellness-sage/30",
      iconBg: "bg-wellness-sage/10",
      accentColor: "text-wellness-sage"
    }
  },
  {
    id: "restoration",
    title: "Gentle Restoration",
    subtitle: "Softening, releasing, rebuilding trust",
    description: "Your pelvic floor responds to how you feel emotionally as much as physically. This phase is about creating safety in your body and allowing it to soften.",
    whatToFocus: [
      "Restorative yoga poses that encourage release, not engagement",
      "Nervous system calming through slow, extended exhales",
      "Warm, grounding foods that support Vata balance",
      "Hydration and regular gentle movement throughout the day"
    ],
    ayurvedicGuidance: "Warm, oily foods like soups, stews, and ghee-rich meals support pelvic grounding. Avoid cold, dry, or raw foods that can aggravate tension.",
    breathworkNote: "Extended exhale breathing (inhale 4, exhale 6-8) activates the rest-and-restore response.",
    visualTheme: {
      gradient: "from-wellness-lilac/20 to-wellness-lilac/5",
      borderColor: "border-wellness-lilac/30",
      iconBg: "bg-wellness-lilac/10",
      accentColor: "text-wellness-lilac"
    }
  },
  {
    id: "integration",
    title: "Gentle Integration",
    subtitle: "Building sustainable support",
    description: "As awareness deepens and tension releases, your body naturally finds better balance. This phase is about integrating what you've learned into daily life.",
    whatToFocus: [
      "Gentle functional movement that includes natural pelvic floor engagement",
      "Daily routines (Dinacharya) that support hormonal and nervous system health",
      "Optional hypopressive techniques if guided by a qualified teacher",
      "Celebrating small shifts without pushing for perfection"
    ],
    ayurvedicGuidance: "Regular eating times, adequate rest, and warm self-massage (Abhyanga) continue to support pelvic and hormonal balance.",
    breathworkNote: "Integrating breath awareness into daily activities keeps your nervous system calm.",
    visualTheme: {
      gradient: "from-mumtaz-plum/15 to-mumtaz-plum/5",
      borderColor: "border-mumtaz-plum/20",
      iconBg: "bg-mumtaz-plum/10",
      accentColor: "text-mumtaz-plum"
    }
  }
];

const DOSHA_PELVIC_GUIDANCE = [
  {
    dosha: "vata",
    title: "Vata (Air & Ether)",
    icon: Wind,
    color: "text-sky-600",
    bg: "bg-sky-50/50 dark:bg-sky-900/10",
    border: "border-sky-200",
    guidance: "Vata imbalance often shows as tension, anxiety, or feeling 'disconnected' from the pelvic area. Focus on warmth, grounding, routine, and slow, steady practices. Avoid cold, rushed, or intense exercise.",
    foods: ["Warm soups and stews", "Cooked root vegetables", "Ghee and healthy oils", "Spiced warm milk"],
    practices: ["Slow, grounding yoga", "Warm oil self-massage", "Regular meal times", "Early bedtime routine"]
  },
  {
    dosha: "pitta",
    title: "Pitta (Fire & Water)",
    icon: Flame,
    color: "text-amber-600",
    bg: "bg-amber-50/50 dark:bg-amber-900/10",
    border: "border-amber-200",
    guidance: "Pitta imbalance can show as inflammation or overexertion. Avoid pushing too hard or overheating. Choose cooling, calming practices that don't create frustration or competition.",
    foods: ["Cooling vegetables", "Sweet fruits", "Coconut", "Cooling herbs like fennel"],
    practices: ["Gentle restorative yoga", "Moon breathing (left nostril)", "Time in nature", "Avoiding overexertion"]
  },
  {
    dosha: "kapha",
    title: "Kapha (Earth & Water)",
    icon: Mountain,
    color: "text-emerald-600",
    bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
    border: "border-emerald-200",
    guidance: "Kapha imbalance can show as stagnation or heaviness. Gentle, consistent movement helps, but without intensity. Focus on lightness, warmth, and uplifting practices.",
    foods: ["Light, warm meals", "Spiced foods", "Plenty of vegetables", "Avoiding heavy, oily foods"],
    practices: ["Gentle daily walks", "Energising breathwork", "Variety in movement", "Morning routines"]
  }
];

export function PelvicFloorEducation() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState("awareness");

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

  const journeyPhases: JourneyPhase[] = PELVIC_FLOOR_PHASES.map(phase => ({
    id: phase.id,
    label: phase.title.split(" ")[0],
    subtitle: phase.subtitle,
    isActive: phase.id === currentPhase
  }));

  const currentPhaseData = PELVIC_FLOOR_PHASES.find(p => p.id === currentPhase) || PELVIC_FLOOR_PHASES[0];

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

  const getDoshaGuidance = () => {
    const sorted = [...DOSHA_PELVIC_GUIDANCE];
    if (userDosha) {
      const userDoshaIndex = sorted.findIndex(d => d.dosha === userDosha);
      if (userDoshaIndex > 0) {
        const [userDoshaGuidance] = sorted.splice(userDoshaIndex, 1);
        sorted.unshift(userDoshaGuidance);
      }
    }
    return sorted;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-wellness-sage/30 bg-gradient-to-br from-wellness-sage/5 to-wellness-lilac/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-wellness-sage/15">
                  <Heart className="w-5 h-5 text-wellness-sage" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pelvic Floor Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Gentle reconnection, breath-led practices, and nervous system care
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
        <Card className="border-wellness-sage/20">
          <CardContent className="p-4 space-y-5">
            {/* Safety note */}
            <div className="p-3 rounded-xl bg-wellness-sage/5 border border-wellness-sage/20">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-wellness-sage flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This content offers supportive lifestyle and body awareness guidance. It is not pelvic floor physiotherapy or medical treatment. If you have symptoms like pain, leaking, or prolapse, please consult a pelvic health professional.
                </p>
              </div>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Your pelvic floor holds more than muscles — it holds tension, emotion, and life experience. Healing isn't about "fixing" what's broken. It's about reconnecting with your body gently, learning to release what you've been holding, and trusting your body's wisdom.
              </p>
            </div>

            {/* Phase selector */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Where are you right now?</p>
              <div className="flex flex-wrap gap-2">
                {PELVIC_FLOOR_PHASES.map(phase => (
                  <Button
                    key={phase.id}
                    variant={currentPhase === phase.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPhase(phase.id)}
                    className={cn(
                      "text-xs",
                      currentPhase === phase.id 
                        ? "bg-wellness-sage text-white hover:bg-wellness-sage/90" 
                        : "border-wellness-sage/30 hover:bg-wellness-sage/10"
                    )}
                  >
                    {phase.title.split(" ")[0]} {phase.title.split(" ").slice(1).join(" ")}
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

            {/* Breathwork highlight */}
            <div className="p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/15">
              <div className="flex items-start gap-2">
                <Wind className="w-4 h-4 text-wellness-lilac flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Breathwork note</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentPhaseData.breathworkNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Dosha guidance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-wellness-lilac" />
                <h4 className="text-sm font-medium text-foreground">Ayurvedic Support</h4>
              </div>
              
              {getDoshaGuidance().map((dosha, index) => {
                const IconComponent = dosha.icon;
                const isUserDosha = userDosha === dosha.dosha;
                
                return (
                  <div 
                    key={dosha.dosha}
                    className={cn(
                      "p-3 rounded-xl border transition-all",
                      dosha.bg,
                      dosha.border,
                      isUserDosha && "ring-2 ring-offset-2 ring-wellness-lilac/30"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={cn("p-1.5 rounded-lg", dosha.bg)}>
                        <IconComponent className={cn("w-4 h-4", dosha.color)} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h5 className={cn("text-sm font-medium", dosha.color)}>
                            {dosha.title}
                          </h5>
                          {isUserDosha && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-wellness-lilac/20 text-wellness-lilac font-medium">
                              Your dosha
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {dosha.guidance}
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                              Nourishing foods
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                              {dosha.foods.slice(0, 3).map((food, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-wellness-sage" />
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                              Supportive practices
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                              {dosha.practices.slice(0, 3).map((practice, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-wellness-lilac" />
                                  {practice}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA to Content Library */}
            <div className="pt-3 border-t border-border/50">
              <Link 
                to="/content-library?category=Mobility&concern=pelvic"
                className="block"
              >
                <Button 
                  variant="outline" 
                  className="w-full border-wellness-sage/30 text-foreground hover:bg-wellness-sage/10 hover:border-wellness-sage/50"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Explore gentle pelvic floor practices
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

export default PelvicFloorEducation;
