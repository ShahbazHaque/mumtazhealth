import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, Sparkles, Leaf, Wind, Shield, Flame, Mountain, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JourneyTimeline, JourneyPhase } from "@/components/journey/JourneyTimeline";
import { JourneyPhaseCard, PhaseCardData } from "@/components/journey/JourneyPhaseCard";
import { JourneySafetyReminder } from "@/components/journey/JourneySafetyReminder";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { cn } from "@/lib/utils";

interface ArthritisPhase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  whatToFocus: string[];
  ayurvedicGuidance: string;
  movementNote: string;
  visualTheme: {
    gradient: string;
    borderColor: string;
    iconBg: string;
    accentColor: string;
  };
}

const ARTHRITIS_PHASES: ArthritisPhase[] = [
  {
    id: "stiff",
    title: "Stiff Days",
    subtitle: "Gentle warmth and careful movement",
    description: "On days when stiffness is high, the goal is warmth, gentle circulation, and patience. There's no need to push through — just meet your body where it is.",
    whatToFocus: [
      "Warm compresses or gentle heat before any movement",
      "Very slow, careful range-of-motion exercises",
      "Warm, anti-inflammatory meals — soups, stews, golden milk",
      "Rest between activities without guilt"
    ],
    ayurvedicGuidance: "Stiffness relates to Vata and Ama (toxin buildup). Warmth, gentle movement, and easy-to-digest foods help clear stagnation and restore flow.",
    movementNote: "Start with the gentlest movements — even just flexing and pointing toes or rotating wrists counts.",
    visualTheme: {
      gradient: "from-amber-100/40 to-amber-50/20",
      borderColor: "border-amber-200/50",
      iconBg: "bg-amber-100/50",
      accentColor: "text-amber-600"
    }
  },
  {
    id: "moderate",
    title: "Moderate Days",
    subtitle: "Building gentle strength and mobility",
    description: "On days with less stiffness, you can explore a bit more movement — always gently, always listening. This is about maintaining function and confidence, not pushing limits.",
    whatToFocus: [
      "Chair yoga or wall-supported stretches",
      "Gentle walking if joints allow",
      "Warm self-massage (Abhyanga) with sesame oil",
      "Continuing anti-inflammatory nutrition"
    ],
    ayurvedicGuidance: "Regular warm oil massage is one of the most powerful Vata-balancing practices. Sesame oil especially supports joint lubrication and circulation.",
    movementNote: "Movement should feel good, not painful. Stop before fatigue sets in, not after.",
    visualTheme: {
      gradient: "from-wellness-sage/20 to-wellness-sage/5",
      borderColor: "border-wellness-sage/30",
      iconBg: "bg-wellness-sage/10",
      accentColor: "text-wellness-sage"
    }
  },
  {
    id: "good",
    title: "Good Days",
    subtitle: "Maintaining momentum with care",
    description: "On better days, it's tempting to do more. But pacing matters. Enjoy the freedom, build on it gently, and avoid overexertion that might trigger a flare.",
    whatToFocus: [
      "Slightly longer walks or movement sessions",
      "Gentle strength-building — nothing high-impact",
      "Daily routines that support overall wellbeing",
      "Celebrating good days without overdoing"
    ],
    ayurvedicGuidance: "Good days are for building Ojas (vitality) through rest, nourishment, and joyful activity. Don't spend all your energy at once.",
    movementNote: "The best approach on good days is doing a bit less than you think you can — to avoid payback later.",
    visualTheme: {
      gradient: "from-wellness-lilac/20 to-wellness-lilac/5",
      borderColor: "border-wellness-lilac/30",
      iconBg: "bg-wellness-lilac/10",
      accentColor: "text-wellness-lilac"
    }
  }
];

const ARTHRITIS_SUPPORT_PILLARS = [
  {
    title: "Warmth",
    icon: Sun,
    color: "text-amber-600",
    description: "Heat supports circulation and reduces stiffness. Warm foods, warm baths, warm oil massage.",
    tips: ["Warm compresses on stiff joints", "Warm (not hot) showers in morning", "Sesame oil self-massage"]
  },
  {
    title: "Gentle Movement",
    icon: Heart,
    color: "text-wellness-sage",
    description: "Consistent, gentle movement maintains joint function better than sporadic intense exercise.",
    tips: ["Chair yoga for accessibility", "Range-of-motion exercises daily", "Walking when possible"]
  },
  {
    title: "Anti-Inflammatory Nutrition",
    icon: Leaf,
    color: "text-emerald-600",
    description: "Foods that reduce inflammation and support digestion are key to joint health.",
    tips: ["Turmeric, ginger, garlic", "Warm, cooked vegetables", "Reducing processed foods"]
  },
  {
    title: "Daily Rhythm",
    icon: Wind,
    color: "text-sky-600",
    description: "Regular routines stabilise Vata dosha, which is often disturbed in joint conditions.",
    tips: ["Regular meal times", "Consistent sleep schedule", "Morning self-care routine"]
  }
];

export function ArthritisEducation() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState("moderate");

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

  const journeyPhases: JourneyPhase[] = ARTHRITIS_PHASES.map(phase => ({
    id: phase.id,
    label: phase.title.split(" ")[0],
    subtitle: phase.subtitle,
    isActive: phase.id === currentPhase
  }));

  const currentPhaseData = ARTHRITIS_PHASES.find(p => p.id === currentPhase) || ARTHRITIS_PHASES[1];

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
        <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-amber-200/50 bg-gradient-to-br from-amber-50/30 to-wellness-sage/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100/50">
                  <Mountain className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Arthritis & Joint Care</h3>
                  <p className="text-sm text-muted-foreground">
                    Joint-safe movement, warmth, and long-term wellbeing support
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
        <Card className="border-amber-200/30">
          <CardContent className="p-4 space-y-5">
            {/* Safety note */}
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This content offers supportive lifestyle guidance. It does not replace medical care, rheumatology advice, or physiotherapy. Always work with your healthcare team and listen to your body.
                </p>
              </div>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Living with arthritis means navigating good days and difficult days. This space offers gentle support for both — helping you maintain mobility, manage stiffness, and feel confident in your body without pushing through pain.
              </p>
            </div>

            {/* Phase selector */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">How are your joints today?</p>
              <div className="flex flex-wrap gap-2">
                {ARTHRITIS_PHASES.map(phase => (
                  <Button
                    key={phase.id}
                    variant={currentPhase === phase.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPhase(phase.id)}
                    className={cn(
                      "text-xs",
                      currentPhase === phase.id 
                        ? "bg-amber-600 text-white hover:bg-amber-600/90" 
                        : "border-amber-200/50 hover:bg-amber-50/50"
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

            {/* Movement note */}
            <div className="p-3 rounded-xl bg-wellness-sage/5 border border-wellness-sage/15">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-wellness-sage flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Movement guidance</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentPhaseData.movementNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Support pillars */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-wellness-lilac" />
                <h4 className="text-sm font-medium text-foreground">Pillars of Joint Support</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ARTHRITIS_SUPPORT_PILLARS.map((pillar) => {
                  const IconComponent = pillar.icon;
                  return (
                    <div 
                      key={pillar.title}
                      className="p-3 rounded-xl bg-card border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={cn("w-4 h-4", pillar.color)} />
                        <h5 className="text-sm font-medium text-foreground">{pillar.title}</h5>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pillar.description}
                      </p>
                      <ul className="space-y-1">
                        {pillar.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-wellness-sage mt-1.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Encouragement */}
            <div className="p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/15 text-center">
              <p className="text-sm text-foreground italic">
                "Every gentle movement is a victory. Every warm meal is medicine. Every rest is earned."
              </p>
            </div>

            {/* CTA to Content Library */}
            <div className="pt-3 border-t border-border/50">
              <Link 
                to="/content-library?category=Mobility&concern=arthritis"
                className="block"
              >
                <Button 
                  variant="outline" 
                  className="w-full border-amber-200/50 text-foreground hover:bg-amber-50/50 hover:border-amber-300/50"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Explore joint-safe practices
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

export default ArthritisEducation;
