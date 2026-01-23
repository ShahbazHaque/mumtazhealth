import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronDown, ChevronUp, Heart, Sparkles, Leaf, Wind, Shield, 
  Sun, Cloud, Moon, Feather, Brain, Coffee, Bed, 
  MessageCircle, PenLine, Check, Flower2, Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JourneyTimeline, JourneyPhase } from "@/components/journey/JourneyTimeline";
import { JourneySafetyReminder } from "@/components/journey/JourneySafetyReminder";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { EmotionalWhatWorked } from "@/components/EmotionalWhatWorked";
import { cn } from "@/lib/utils";

// Emotional states users can identify with
const EMOTIONAL_STATES = [
  { id: "stress", label: "Stress or overwhelm", emoji: "😮‍💨", description: "Feeling stretched thin or under pressure" },
  { id: "anxiety", label: "Anxiety or restlessness", emoji: "💭", description: "Racing thoughts, worry, or unease" },
  { id: "low-mood", label: "Low mood or heaviness", emoji: "🌧️", description: "Feeling down, flat, or emotionally heavy" },
  { id: "burnout", label: "Burnout or exhaustion", emoji: "🔋", description: "Depleted energy, difficulty coping" },
  { id: "sleep", label: "Difficulty sleeping", emoji: "🌙", description: "Trouble falling or staying asleep" },
  { id: "sensitivity", label: "Emotional sensitivity", emoji: "💐", description: "Feeling more reactive or tender" },
  { id: "unsure", label: "Not sure / just need support", emoji: "🤍", description: "Something feels off, but unclear what" }
];

// Phase-based emotional support structure
interface EmotionalPhase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  whatMayHelp: string[];
  ayurvedicGuidance: string;
  doshaNote: {
    vata: string;
    pitta: string;
    kapha: string;
  };
  visualTheme: {
    gradient: string;
    borderColor: string;
    iconBg: string;
    accentColor: string;
  };
}

const EMOTIONAL_PHASES: EmotionalPhase[] = [
  {
    id: "overwhelmed",
    title: "Feeling Overwhelmed",
    subtitle: "Gentle grounding and calming support",
    description: "When life feels like too much, the priority is to slow down, ground yourself, and reduce demands. This isn't about pushing through — it's about creating small pockets of calm.",
    whatMayHelp: [
      "Step away from screens and stimulation when possible",
      "Simple, warm, nourishing meals that require little effort",
      "Gentle breathing — even three deep breaths can shift your state",
      "Permission to lower expectations today"
    ],
    ayurvedicGuidance: "Overwhelm often reflects Vata imbalance — too much movement, change, or stimulation. Warmth, routine, and grounding practices help settle the nervous system.",
    doshaNote: {
      vata: "Focus on warmth, routine, and reducing cold/dry/irregular patterns. Warm drinks, steady meals, early rest.",
      pitta: "Reduce intensity and self-criticism. Cool the mind with gentle walks, soft music, and forgiveness.",
      kapha: "Gentle movement helps prevent stagnation during overwhelm. Light walks, simple stretches, staying connected."
    },
    visualTheme: {
      gradient: "from-sky-100/40 to-sky-50/20",
      borderColor: "border-sky-200/50",
      iconBg: "bg-sky-100/50",
      accentColor: "text-sky-600"
    }
  },
  {
    id: "restless",
    title: "Feeling Restless",
    subtitle: "Calming the mind and body",
    description: "When thoughts race or the body feels jittery, the nervous system needs soothing. Grounding practices, breath awareness, and reducing stimulants can help restore calm.",
    whatMayHelp: [
      "Slow, grounding yoga or gentle stretching",
      "Breath practices that extend the exhale",
      "Reducing caffeine and stimulating activities",
      "Nature connection — even looking at greenery helps"
    ],
    ayurvedicGuidance: "Restlessness often relates to elevated Vata or Pitta. Cooling, grounding, and calming practices help settle agitation and restore peace.",
    doshaNote: {
      vata: "Ground with warm oil massage, steady routine, and avoiding multitasking. Warmth calms erratic energy.",
      pitta: "Cool with moonlit walks, gentle cooling foods, and releasing the need to control outcomes.",
      kapha: "Restlessness can actually help move stagnant energy — channel it gently into walking or light activity."
    },
    visualTheme: {
      gradient: "from-wellness-sage/20 to-wellness-sage/5",
      borderColor: "border-wellness-sage/30",
      iconBg: "bg-wellness-sage/10",
      accentColor: "text-wellness-sage"
    }
  },
  {
    id: "heavy",
    title: "Feeling Heavy",
    subtitle: "Gentle lightening and encouragement",
    description: "When emotions feel heavy or low, forcing energy often backfires. Instead, focus on small, gentle actions — one soft step at a time. It's okay to go slowly.",
    whatMayHelp: [
      "Very gentle movement — even just standing or stretching",
      "Light, warm foods that are easy to digest",
      "Brief contact with others — a message, a call",
      "Reducing isolation without overwhelming yourself"
    ],
    ayurvedicGuidance: "Heaviness often relates to Kapha imbalance or accumulated Ama (stagnation). Light, warm, gently stimulating practices help restore flow.",
    doshaNote: {
      vata: "Heaviness with anxiety needs warmth and routine. Don't push too hard — steady, small steps.",
      pitta: "Heaviness with frustration needs softness and self-compassion. Reduce pressure and expectations.",
      kapha: "Heaviness naturally calls for gentle movement, lightness in food, and connection with others."
    },
    visualTheme: {
      gradient: "from-wellness-lilac/20 to-wellness-lilac/5",
      borderColor: "border-wellness-lilac/30",
      iconBg: "bg-wellness-lilac/10",
      accentColor: "text-wellness-lilac"
    }
  },
  {
    id: "tender",
    title: "Feeling Tender",
    subtitle: "Honouring sensitivity with care",
    description: "Sometimes we feel more open, more reactive, more easily touched by things. This isn't weakness — it's part of being human. Tenderness needs gentleness.",
    whatMayHelp: [
      "Reducing exposure to harsh content or news",
      "Creating quiet, soft spaces in your day",
      "Self-compassion practices and kind self-talk",
      "Honouring tears or emotions without judging them"
    ],
    ayurvedicGuidance: "Sensitivity often indicates the nervous system is working to process something. Rest, nourishment, and reducing stimulation support natural healing.",
    doshaNote: {
      vata: "Tenderness with fragility needs extra warmth, grounding, and protection from chaos.",
      pitta: "Tenderness with irritation needs cooling, softness, and releasing perfectionism.",
      kapha: "Tenderness with heaviness needs gentle movement and connection to lift the spirit."
    },
    visualTheme: {
      gradient: "from-rose-100/30 to-rose-50/15",
      borderColor: "border-rose-200/40",
      iconBg: "bg-rose-100/40",
      accentColor: "text-rose-500"
    }
  }
];

// Support pillars for emotional wellbeing
const SUPPORT_PILLARS = [
  {
    title: "Calming Movement",
    icon: Feather,
    color: "text-sky-600",
    description: "Gentle, grounding yoga and movement that settles the nervous system.",
    suggestions: ["Restorative yoga", "Gentle stretches", "Slow, mindful walks"]
  },
  {
    title: "Nourishing Nutrition",
    icon: Flower2,
    color: "text-wellness-sage",
    description: "Warm, simple, steadying foods that support emotional balance.",
    suggestions: ["Warm soups and stews", "Cooked vegetables", "Gentle spices like ginger"]
  },
  {
    title: "Daily Rhythm",
    icon: Sun,
    color: "text-amber-600",
    description: "Regular routines create safety and predictability for the nervous system.",
    suggestions: ["Consistent wake time", "Regular meals", "Evening wind-down"]
  },
  {
    title: "Reflective Practice",
    icon: Moon,
    color: "text-wellness-lilac",
    description: "Spiritual and mindful practices that bring peace and perspective.",
    suggestions: ["Gratitude moments", "Breath awareness", "Prayer or dhikr"]
  }
];

// Reflection prompts
const REFLECTION_PROMPTS = [
  "What feels heavy right now?",
  "What feels supportive today?",
  "What helped, even a little?",
  "What do I need most right now?"
];

export function MentalWellbeingEducation() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState("overwhelmed");
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState({
    whatFeelsHeavy: "",
    whatHelped: "",
    whatINeed: ""
  });
  const [spiritualPreference, setSpiritualPreference] = useState<"islamic" | "universal">("universal");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("user_wellness_profiles")
            .select("primary_dosha, spiritual_preference")
            .eq("user_id", user.id)
            .single();
          if (profile?.primary_dosha) {
            setUserDosha(profile.primary_dosha.toLowerCase());
          }
          if (profile?.spiritual_preference === "islamic") {
            setSpiritualPreference("islamic");
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleStateSelect = (stateId: string) => {
    setCurrentState(stateId);
    // Map emotional states to phases
    const stateToPhase: Record<string, string> = {
      "stress": "overwhelmed",
      "anxiety": "restless",
      "low-mood": "heavy",
      "burnout": "overwhelmed",
      "sleep": "restless",
      "sensitivity": "tender",
      "unsure": "tender"
    };
    setCurrentPhase(stateToPhase[stateId] || "overwhelmed");
  };

  const journeyPhases: JourneyPhase[] = EMOTIONAL_PHASES.map(phase => ({
    id: phase.id,
    label: phase.title.split(" ")[1] || phase.title,
    subtitle: phase.subtitle,
    isActive: phase.id === currentPhase
  }));

  const currentPhaseData = EMOTIONAL_PHASES.find(p => p.id === currentPhase) || EMOTIONAL_PHASES[0];

  const handlePractitionerAction = () => {
    window.location.href = "/bookings";
  };

  const getDoshaGuidance = () => {
    if (!userDosha || !currentPhaseData.doshaNote) return null;
    const doshaKey = userDosha as keyof typeof currentPhaseData.doshaNote;
    return currentPhaseData.doshaNote[doshaKey] || null;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-all duration-300 border-wellness-lilac/30 bg-gradient-to-br from-wellness-lilac/10 to-sky-50/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-wellness-lilac/15">
                  <Brain className="w-5 h-5 text-wellness-lilac" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Mental & Emotional Wellbeing</h3>
                  <p className="text-sm text-muted-foreground">
                    Gentle support for stress, mood, and emotional balance
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
            {/* Safety & Boundaries Note - Prominent */}
            <div className="p-3 rounded-xl bg-wellness-sage/10 border border-wellness-sage/20">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-wellness-sage flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-foreground font-medium mb-1">A gentle space for support</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This section offers supportive, educational guidance — not mental health care or medical advice. 
                    If you're struggling, please reach out to a mental health professional. 
                    You deserve qualified support.
                  </p>
                </div>
              </div>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Your emotional wellbeing matters. This space is here to help you feel seen, grounded, 
                and supported — not diagnosed or fixed. Take what helps, leave what doesn't.
              </p>
            </div>

            {/* Emotional State Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-wellness-lilac" />
                <h4 className="text-sm font-medium text-foreground">How are you feeling right now?</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Select what resonates — you can change this anytime.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {EMOTIONAL_STATES.map(state => (
                  <button
                    key={state.id}
                    onClick={() => handleStateSelect(state.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200",
                      currentState === state.id
                        ? "border-wellness-lilac bg-wellness-lilac/10 ring-1 ring-wellness-lilac/30"
                        : "border-border/50 hover:border-wellness-lilac/30 hover:bg-wellness-lilac/5"
                    )}
                  >
                    <span className="text-lg">{state.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        currentState === state.id ? "text-foreground" : "text-foreground/80"
                      )}>
                        {state.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {state.description}
                      </p>
                    </div>
                    {currentState === state.id && (
                      <Check className="w-4 h-4 text-wellness-lilac flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Show content once state is selected */}
            {currentState && (
              <>
                {/* Visual Timeline */}
                <JourneyTimeline 
                  phases={journeyPhases}
                  currentPhase={currentPhase}
                  journeyType="recovery"
                />

                {/* Phase Card */}
                <div className={cn(
                  "rounded-2xl border overflow-hidden",
                  currentPhaseData.visualTheme.borderColor
                )}>
                  <div className={cn(
                    "p-4 bg-gradient-to-br",
                    currentPhaseData.visualTheme.gradient
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2.5 rounded-xl flex-shrink-0",
                        currentPhaseData.visualTheme.iconBg
                      )}>
                        <Cloud className={cn("w-5 h-5", currentPhaseData.visualTheme.accentColor)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base">
                          {currentPhaseData.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {currentPhaseData.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 bg-card">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {currentPhaseData.description}
                    </p>

                    {/* What may help */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Leaf className="w-3.5 h-3.5 text-wellness-sage" />
                        What may help
                      </h4>
                      <ul className="space-y-1.5 pl-5">
                        {currentPhaseData.whatMayHelp.map((item, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground leading-relaxed list-disc">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ayurvedic insight */}
                    <div className="p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/15">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-wellness-lilac flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                            Holistic insight
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {currentPhaseData.ayurvedicGuidance}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dosha-specific guidance (if user has dosha) */}
                    {getDoshaGuidance() && (
                      <div className={cn(
                        "p-3 rounded-xl border",
                        userDosha === "vata" ? "bg-sky-50/50 border-sky-200 dark:bg-sky-900/10" :
                        userDosha === "pitta" ? "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10" :
                        "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10"
                      )}>
                        <div className="flex items-start gap-2">
                          <Wind className="w-3.5 h-3.5 text-wellness-sage flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                              For your {userDosha} nature
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {getDoshaGuidance()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Support Pillars */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-wellness-lilac" />
                    <h4 className="text-sm font-medium text-foreground">Gentle Support Practices</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUPPORT_PILLARS.map((pillar) => {
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
                            {pillar.suggestions.map((tip, i) => (
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

                {/* Spiritual Support - Inclusive Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-wellness-lilac" />
                      <h4 className="text-sm font-medium text-foreground">Spiritual & Reflective Support</h4>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant={spiritualPreference === "islamic" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSpiritualPreference("islamic")}
                        className="text-xs h-7 px-2"
                      >
                        Islamic
                      </Button>
                      <Button
                        variant={spiritualPreference === "universal" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSpiritualPreference("universal")}
                        className="text-xs h-7 px-2"
                      >
                        Universal
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/15">
                    {spiritualPreference === "islamic" ? (
                      <div className="space-y-2">
                        <p className="text-xs text-foreground font-medium">Practices that may bring peace:</p>
                        <ul className="space-y-1.5">
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Dhikr</strong> — Remembrance of Allah through simple repetition</span>
                          </li>
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Du'a</strong> — Personal prayer and supplication in your own words</span>
                          </li>
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Quranic reflection</strong> — Reading or listening to bring comfort</span>
                          </li>
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Gratitude</strong> — Acknowledging blessings, even small ones</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-foreground font-medium">Practices that may bring peace:</p>
                        <ul className="space-y-1.5">
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Breath awareness</strong> — Simply noticing your breath, without changing it</span>
                          </li>
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Gratitude practice</strong> — Naming small things you appreciate</span>
                          </li>
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Self-compassion</strong> — Speaking to yourself as you would a friend</span>
                          </li>
                          <li className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-wellness-lilac mt-1.5 flex-shrink-0" />
                            <span><strong>Nature connection</strong> — Mindful time outdoors, even briefly</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reflection Section */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReflection(!showReflection)}
                    className="w-full border-wellness-lilac/30 hover:bg-wellness-lilac/10"
                  >
                    <PenLine className="w-3.5 h-3.5 mr-2" />
                    {showReflection ? "Close reflection" : "Add a gentle reflection"}
                  </Button>

                  {showReflection && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-wellness-sage/5 to-wellness-lilac/5 border border-wellness-sage/20 space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-wellness-lilac" />
                        <h4 className="text-sm font-medium text-foreground">Gentle reflections</h4>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        No pressure — just space to check in with yourself. There are no right answers.
                      </p>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-foreground/80">
                            {REFLECTION_PROMPTS[0]}
                          </label>
                          <Textarea
                            placeholder="Whatever comes to mind..."
                            value={reflection.whatFeelsHeavy}
                            onChange={(e) => setReflection(prev => ({ ...prev, whatFeelsHeavy: e.target.value }))}
                            className="min-h-[60px] text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-foreground/80">
                            {REFLECTION_PROMPTS[2]}
                          </label>
                          <Textarea
                            placeholder="Even small things count..."
                            value={reflection.whatHelped}
                            onChange={(e) => setReflection(prev => ({ ...prev, whatHelped: e.target.value }))}
                            className="min-h-[60px] text-sm resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-foreground/80">
                            {REFLECTION_PROMPTS[3]}
                          </label>
                          <Textarea
                            placeholder="Rest, connection, space..."
                            value={reflection.whatINeed}
                            onChange={(e) => setReflection(prev => ({ ...prev, whatINeed: e.target.value }))}
                            className="min-h-[60px] text-sm resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Encouraging quote */}
                <div className="p-3 rounded-xl bg-wellness-lilac/5 border border-wellness-lilac/15 text-center">
                  <p className="text-sm text-foreground italic">
                    "You don't have to be strong all the time. Softness is its own kind of strength."
                  </p>
                </div>

                {/* What Worked Tracker - Integrated */}
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-wellness-sage" />
                    <h4 className="text-sm font-medium text-foreground">Track What Helps</h4>
                  </div>
                  <EmotionalWhatWorked />
                </div>

                {/* CTA to Content Library */}
                <div className="pt-3 border-t border-border/50">
                  <Link 
                    to="/content-library?category=Mindfulness&concern=emotional-wellbeing"
                    className="block"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-wellness-lilac/30 text-foreground hover:bg-wellness-lilac/10 hover:border-wellness-lilac/50"
                    >
                      <Leaf className="w-4 h-4 mr-2" />
                      Explore calming practices
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Safety reminder - always visible */}
            <JourneySafetyReminder 
              journeyType="mental"
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

export default MentalWellbeingEducation;
