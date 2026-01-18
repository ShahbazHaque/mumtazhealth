import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Heart, Sparkles, Leaf, Wind, Shield, Flame, Mountain, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JourneyTimeline, JourneyPhase } from "@/components/journey/JourneyTimeline";
import { JourneyPhaseCard, PhaseCardData } from "@/components/journey/JourneyPhaseCard";
import { JourneySafetyReminder } from "@/components/journey/JourneySafetyReminder";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { cn } from "@/lib/utils";

interface PCOSFocusArea {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  whatToFocus: string[];
  ayurvedicGuidance: string;
  lifestyleNote: string;
  visualTheme: {
    gradient: string;
    borderColor: string;
    iconBg: string;
    accentColor: string;
  };
}

const PCOS_FOCUS_AREAS: PCOSFocusArea[] = [
  {
    id: "stress",
    title: "Stress & Nervous System",
    subtitle: "Calming cortisol, supporting hormones",
    description: "Chronic stress directly impacts hormonal balance. Your nervous system is the foundation — when it feels safe, your hormones can find their rhythm more easily.",
    whatToFocus: [
      "Prioritising rest and downtime without guilt",
      "Gentle, grounding movement rather than intense exercise",
      "Breathwork practices that activate your calm response",
      "Reducing overstimulation from screens and busyness"
    ],
    ayurvedicGuidance: "From an Ayurvedic perspective, PCOS often involves Kapha stagnation with Vata or Pitta disturbance. Stress reduction helps calm Vata, which in turn supports all other systems.",
    lifestyleNote: "Consistency matters more than intensity. Small, daily calming practices add up over time.",
    visualTheme: {
      gradient: "from-sky-100/40 to-sky-50/20",
      borderColor: "border-sky-200/50",
      iconBg: "bg-sky-100/50",
      accentColor: "text-sky-600"
    }
  },
  {
    id: "nourishment",
    title: "Nourishment & Blood Sugar",
    subtitle: "Steady energy, no restriction",
    description: "Supporting blood sugar isn't about dieting or deprivation. It's about nourishing your body consistently so your energy stays stable throughout the day.",
    whatToFocus: [
      "Regular meal times to support metabolism",
      "Protein, healthy fats, and fibre at each meal",
      "Reducing refined sugars gently, not restrictively",
      "Warm, cooked foods that support digestion"
    ],
    ayurvedicGuidance: "Kapha-balancing foods (light, warm, spiced) can help, while avoiding heavy, cold, or overly sweet foods. But balance matters — no extreme restrictions.",
    lifestyleNote: "Eating regularly is more important than eating 'perfectly'. Skip the guilt, not the meals.",
    visualTheme: {
      gradient: "from-emerald-100/40 to-emerald-50/20",
      borderColor: "border-emerald-200/50",
      iconBg: "bg-emerald-100/50",
      accentColor: "text-emerald-600"
    }
  },
  {
    id: "movement",
    title: "Movement & Energy",
    subtitle: "Gentle strength, not punishment",
    description: "Movement for PCOS isn't about burning calories or 'earning' food. It's about supporting circulation, mood, and hormonal balance through consistent, enjoyable activity.",
    whatToFocus: [
      "Gentle yoga, walking, swimming — movement you enjoy",
      "Avoiding excessive high-intensity training",
      "Strength-building through slow, mindful practices",
      "Listening to your energy — rest when you need it"
    ],
    ayurvedicGuidance: "Regular, moderate movement helps balance Kapha without aggravating Vata. Aim for consistency over intensity, and include rest days.",
    lifestyleNote: "The best exercise is the one you'll actually do. Find what feels good, not what feels punishing.",
    visualTheme: {
      gradient: "from-wellness-sage/20 to-wellness-sage/5",
      borderColor: "border-wellness-sage/30",
      iconBg: "bg-wellness-sage/10",
      accentColor: "text-wellness-sage"
    }
  },
  {
    id: "sleep",
    title: "Sleep & Restoration",
    subtitle: "Hormones heal during rest",
    description: "Quality sleep is non-negotiable for hormonal health. Your body does its deepest healing and hormone regulation while you sleep.",
    whatToFocus: [
      "Consistent sleep and wake times, even on weekends",
      "A calming wind-down routine before bed",
      "Reducing screens 1-2 hours before sleep",
      "A cool, dark, quiet sleep environment"
    ],
    ayurvedicGuidance: "Ayurveda emphasises sleeping before 10pm when Kapha energy is highest for rest. Late nights aggravate Pitta and disrupt hormonal rhythms.",
    lifestyleNote: "Sleep isn't laziness. It's medicine. Protect it fiercely.",
    visualTheme: {
      gradient: "from-wellness-lilac/20 to-wellness-lilac/5",
      borderColor: "border-wellness-lilac/30",
      iconBg: "bg-wellness-lilac/10",
      accentColor: "text-wellness-lilac"
    }
  }
];

const PCOS_AFFIRMATIONS = [
  "My body is not broken. It's communicating with me.",
  "I deserve care, not punishment.",
  "Healing happens in small, consistent steps.",
  "I am more than my symptoms.",
  "Rest is productive. Nourishment is medicine."
];

export function PCOSEducation() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);
  const [currentFocus, setCurrentFocus] = useState("stress");

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

  const journeyPhases: JourneyPhase[] = PCOS_FOCUS_AREAS.map(area => ({
    id: area.id,
    label: area.title.split(" ")[0],
    subtitle: area.subtitle,
    isActive: area.id === currentFocus
  }));

  const currentFocusData = PCOS_FOCUS_AREAS.find(a => a.id === currentFocus) || PCOS_FOCUS_AREAS[0];

  const phaseCardData: PhaseCardData = {
    phaseId: currentFocusData.id,
    title: currentFocusData.title,
    subtitle: currentFocusData.subtitle,
    description: currentFocusData.description,
    whatYouMayNotice: currentFocusData.whatToFocus,
    holisticNote: currentFocusData.ayurvedicGuidance,
    visualTheme: currentFocusData.visualTheme
  };

  const handlePractitionerAction = () => {
    window.location.href = "/bookings";
  };

  const randomAffirmation = PCOS_AFFIRMATIONS[Math.floor(Math.random() * PCOS_AFFIRMATIONS.length)];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-emerald-200/50 bg-gradient-to-br from-emerald-50/30 to-wellness-sage/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100/50">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">PCOS Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Hormone-supportive movement, stress care, and nourishing guidance
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
        <Card className="border-emerald-200/30">
          <CardContent className="p-4 space-y-5">
            {/* Safety note */}
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This content offers supportive lifestyle guidance. It does not replace medical care. PCOS management works best with a healthcare team — these practices complement, not replace, that support.
                </p>
              </div>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed">
                PCOS is complex, and so are you. There's no one-size-fits-all approach, and there's certainly no 'quick fix'. What helps is consistency, self-compassion, and finding what works for your unique body — without shame or blame.
              </p>
            </div>

            {/* Affirmation */}
            <div className="p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/15 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Today's reminder</p>
              <p className="text-sm text-foreground italic font-medium">
                "{randomAffirmation}"
              </p>
            </div>

            {/* Focus area selector */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">What would you like to focus on?</p>
              <div className="flex flex-wrap gap-2">
                {PCOS_FOCUS_AREAS.map(area => (
                  <Button
                    key={area.id}
                    variant={currentFocus === area.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentFocus(area.id)}
                    className={cn(
                      "text-xs",
                      currentFocus === area.id 
                        ? "bg-emerald-600 text-white hover:bg-emerald-600/90" 
                        : "border-emerald-200/50 hover:bg-emerald-50/50"
                    )}
                  >
                    {area.title.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Visual Timeline */}
            <JourneyTimeline 
              phases={journeyPhases}
              currentPhase={currentFocus}
              journeyType="recovery"
            />

            {/* Focus Card */}
            <JourneyPhaseCard 
              phaseData={phaseCardData}
              journeyType="recovery"
              userDosha={userDosha}
            />

            {/* Lifestyle note */}
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50">
              <div className="flex items-start gap-2">
                <Sun className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Lifestyle note</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentFocusData.lifestyleNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Key principles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-wellness-lilac" />
                <h4 className="text-sm font-medium text-foreground">PCOS-Supportive Principles</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 text-sky-600" />
                    <h5 className="text-sm font-medium text-foreground">Consistency</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Small daily actions matter more than occasional perfection. Show up gently, again and again.
                  </p>
                </div>
                
                <div className="p-3 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-4 h-4 text-wellness-lilac" />
                    <h5 className="text-sm font-medium text-foreground">Rest</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your body heals during rest. Prioritise sleep, downtime, and nervous system care.
                  </p>
                </div>
                
                <div className="p-3 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <h5 className="text-sm font-medium text-foreground">Nourishment</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Feed yourself regularly with whole, warm, satisfying foods. No restriction, no punishment.
                  </p>
                </div>
                
                <div className="p-3 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h5 className="text-sm font-medium text-foreground">Compassion</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You're not failing. You're navigating something complex. Be kind to yourself.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA to Content Library */}
            <div className="pt-3 border-t border-border/50">
              <Link 
                to="/content-library?concern=pcos"
                className="block"
              >
                <Button 
                  variant="outline" 
                  className="w-full border-emerald-200/50 text-foreground hover:bg-emerald-50/50 hover:border-emerald-300/50"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Explore PCOS-supportive practices
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

export default PCOSEducation;
