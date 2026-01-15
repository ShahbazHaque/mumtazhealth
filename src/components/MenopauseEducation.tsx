import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Leaf, 
  Sun,
  Flame,
  Moon,
  Wind,
  Droplets,
  Mountain,
  Heart,
  TreeDeciduous,
  CloudSun,
  Flower2
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  JourneyTimeline, 
  JourneyPhaseCard,
  JourneySafetyReminder 
} from "@/components/journey";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { PractitionerSupportCTA } from "@/components/PractitionerSupportCTA";

interface MenopauseEducationProps {
  lifeStage: 'perimenopause' | 'menopause' | 'post_menopause';
}

interface StageInfo {
  title: string;
  subtitle: string;
  meaning: string;
  energyMood: string;
  bodyResponse: string;
  visualTheme: {
    gradient: string;
    borderColor: string;
    iconBg: string;
    accentColor: string;
  };
  doshaGuidance: {
    vata: { text: string; suggestions: string[] };
    pitta: { text: string; suggestions: string[] };
    kapha: { text: string; suggestions: string[] };
  };
  lifestyleSuggestions: {
    yoga: string;
    rhythm: string;
    breath: string;
  };
  libraryTags: string[];
}

const STAGE_EDUCATION: Record<string, StageInfo> = {
  perimenopause: {
    title: "Perimenopause",
    subtitle: "The transition begins",
    meaning: "Your body is beginning a beautiful transition. This phase can last several years as your hormones naturally shift and adjust — it's a sign of wisdom unfolding.",
    energyMood: "You may notice energy levels fluctuating more than before. Some days feel vibrant, others call for rest. Emotions may feel more intense or unpredictable.",
    bodyResponse: "Your body may respond differently to food, sleep, and movement than it used to. Hot flashes, sleep changes, and cycle irregularities are all part of this natural journey.",
    visualTheme: {
      gradient: "from-amber-100/40 via-amber-50/20 to-wellness-lilac/10",
      borderColor: "border-amber-300/40",
      iconBg: "bg-amber-100",
      accentColor: "text-amber-600"
    },
    doshaGuidance: {
      vata: { 
        text: "Warmth, routine, and grounding practices are especially nourishing now. Prioritise warm foods, regular sleep, and calming self-care rituals.",
        suggestions: ["Warm, grounding meals", "Consistent sleep routine", "Self-massage with warm oil"]
      },
      pitta: { 
        text: "Cooling practices can help balance any heat symptoms. Gentle, non-competitive movement and cooling foods may feel soothing.",
        suggestions: ["Cooling foods and drinks", "Time in nature", "Gentle, cooling breath"]
      },
      kapha: { 
        text: "Gentle stimulating movement helps prevent stagnation. Light, warm foods and invigorating practices support your transition.",
        suggestions: ["Morning movement", "Light, spiced meals", "Energising breathwork"]
      },
    },
    lifestyleSuggestions: {
      yoga: "Balancing practices that combine gentle strength with restorative poses. Focus on hip openers and heart space.",
      rhythm: "Honour your body's changing needs. Some days call for activity, others for rest. Listen without judgment.",
      breath: "Cooling breaths for hot moments, grounding breaths for restless energy. Always gentle, never forced."
    },
    libraryTags: ["perimenopause", "hormonal", "grounding"],
  },
  menopause: {
    title: "Menopause",
    subtitle: "A threshold of wisdom",
    meaning: "You have arrived at a significant milestone — 12 months without a period marks this natural threshold. This is a time of profound inner wisdom and transformation.",
    energyMood: "Energy may feel more settled compared to perimenopause, though some women still experience fluctuations. This can be a deeply reflective and spiritually rich time.",
    bodyResponse: "Hot flashes and sleep patterns may continue to shift. Your body is finding its new rhythm — honouring rest and gentle movement supports this adjustment.",
    visualTheme: {
      gradient: "from-wellness-lilac/20 via-mumtaz-plum/10 to-wellness-sage/10",
      borderColor: "border-wellness-lilac/40",
      iconBg: "bg-wellness-lilac/20",
      accentColor: "text-wellness-lilac"
    },
    doshaGuidance: {
      vata: { 
        text: "This transition naturally increases Vata. Extra warmth, oiling practices (abhyanga), and grounding routines are deeply supportive.",
        suggestions: ["Daily abhyanga", "Warm, oily foods", "Steady daily rhythms"]
      },
      pitta: { 
        text: "Any lingering heat symptoms benefit from cooling foods and calming practices. Avoid overexertion and embrace gentleness.",
        suggestions: ["Cool, sweet foods", "Moonlight walks", "Restorative practices"]
      },
      kapha: { 
        text: "Keep energy moving with gentle, regular activity. Warming spices and light foods help maintain vitality.",
        suggestions: ["Daily gentle walks", "Warming spices", "Uplifting movement"]
      },
    },
    lifestyleSuggestions: {
      yoga: "Restorative and supported practices with focus on nervous system regulation. Gentle inversions may support hormone balance.",
      rhythm: "Create rituals that honour this transition. Morning routines, evening wind-down, and sacred pauses throughout the day.",
      breath: "Calming, balancing breaths. Alternate nostril breathing can be particularly supportive for hormonal balance."
    },
    libraryTags: ["menopause", "hormonal", "restorative"],
  },
  post_menopause: {
    title: "Post-Menopause",
    subtitle: "The wisdom years",
    meaning: "You are now in a stage traditionally honoured as the 'wisdom years.' Your body has completed its transition, and this can be a time of deep inner peace and clarity.",
    energyMood: "Many women find their mood stabilises and a new sense of calm emerges. Energy may feel more consistent, though gentle self-care remains important.",
    bodyResponse: "Focus shifts to maintaining bone health, joint mobility, and heart wellness. Your body thrives with nourishing movement, warm foods, and self-massage practices.",
    visualTheme: {
      gradient: "from-wellness-sage/20 via-wellness-sage/10 to-wellness-lilac/5",
      borderColor: "border-wellness-sage/40",
      iconBg: "bg-wellness-sage/20",
      accentColor: "text-wellness-sage"
    },
    doshaGuidance: {
      vata: { 
        text: "Vata naturally increases with age. Warm, oily foods, regular routines, and gentle yoga help maintain balance and vitality.",
        suggestions: ["Warm, nourishing soups", "Regular abhyanga", "Gentle, grounding yoga"]
      },
      pitta: { 
        text: "Continue with cooling, calming practices. This is a beautiful time to channel your wisdom into meaningful pursuits.",
        suggestions: ["Creative expression", "Nature connection", "Mindful service"]
      },
      kapha: { 
        text: "Stay active with gentle movement to maintain strength and flexibility. Warming practices and light foods support your wellbeing.",
        suggestions: ["Daily walking", "Joint mobility work", "Light, warm meals"]
      },
    },
    lifestyleSuggestions: {
      yoga: "Gentle strength-building for bone health, joint mobility practices, and restorative poses. Chair yoga can be wonderfully supportive.",
      rhythm: "Embrace a slower, more intentional pace. This is your time to rest, reflect, and share your wisdom.",
      breath: "Gentle, nourishing breaths. Focus on softness and ease rather than technique."
    },
    libraryTags: ["post-menopause", "joint-care", "grounding"],
  },
};

// Phase-specific icons
const PhaseIcon = ({ phase }: { phase: string }) => {
  switch (phase) {
    case "perimenopause":
      return <Flame className="w-5 h-5" />;
    case "menopause":
      return <Sun className="w-5 h-5" />;
    case "post_menopause":
      return <Moon className="w-5 h-5" />;
    default:
      return <Heart className="w-5 h-5" />;
  }
};

// Dosha visual component
const DoshaVisual = ({ dosha, isUserDosha }: { dosha: string; isUserDosha: boolean }) => {
  const config = {
    vata: {
      icon: Wind,
      colors: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800",
      iconColor: "text-sky-500",
      label: "Vata (Air & Ether)",
      visualCue: "Grounding • Warmth • Stillness"
    },
    pitta: {
      icon: Droplets,
      colors: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
      iconColor: "text-amber-500",
      label: "Pitta (Fire & Water)",
      visualCue: "Cooling • Soothing • Patience"
    },
    kapha: {
      icon: Mountain,
      colors: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
      iconColor: "text-emerald-600",
      label: "Kapha (Earth & Water)",
      visualCue: "Lightness • Movement • Vitality"
    }
  };

  const { icon: Icon, colors, iconColor, label, visualCue } = config[dosha as keyof typeof config];

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${colors} ${isUserDosha ? 'ring-2 ring-wellness-lilac/40' : ''}`}>
      <div className={`p-1.5 rounded-full bg-white/50 dark:bg-black/20 ${iconColor}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground/80 truncate">
            {label}
          </span>
          {isUserDosha && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-wellness-lilac/20 text-wellness-lilac whitespace-nowrap">
              Your dosha
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">{visualCue}</p>
      </div>
    </div>
  );
};

// Lifestyle suggestion card
const LifestyleSuggestionCard = ({ 
  type, 
  suggestion 
}: { 
  type: "yoga" | "rhythm" | "breath"; 
  suggestion: string;
}) => {
  const config = {
    yoga: {
      icon: Flower2,
      title: "Gentle movement",
      bgColor: "bg-wellness-sage/10",
      borderColor: "border-wellness-sage/20",
      iconColor: "text-wellness-sage"
    },
    rhythm: {
      icon: CloudSun,
      title: "Daily rhythm",
      bgColor: "bg-wellness-lilac/10",
      borderColor: "border-wellness-lilac/20",
      iconColor: "text-wellness-lilac"
    },
    breath: {
      icon: Wind,
      title: "Breath practice",
      bgColor: "bg-sky-50 dark:bg-sky-900/20",
      borderColor: "border-sky-200 dark:border-sky-800",
      iconColor: "text-sky-500"
    }
  };

  const { icon: Icon, title, bgColor, borderColor, iconColor } = config[type];

  return (
    <div className={`p-3 rounded-lg ${bgColor} border ${borderColor}`}>
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded-full bg-white/50 dark:bg-black/20 ${iconColor} flex-shrink-0 mt-0.5`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground/80 mb-1">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{suggestion}</p>
        </div>
      </div>
    </div>
  );
};

export function MenopauseEducation({ lifeStage }: MenopauseEducationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDosha();
  }, []);

  const fetchUserDosha = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_wellness_profiles')
      .select('primary_dosha')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.primary_dosha) {
      setUserDosha(data.primary_dosha.toLowerCase());
    }
  };

  const stageInfo = STAGE_EDUCATION[lifeStage];
  
  if (!stageInfo) return null;

  // Define journey phases for timeline
  const journeyPhases = [
    { id: "perimenopause", label: "Perimenopause", subtitle: "Transition", isActive: lifeStage === "perimenopause" },
    { id: "menopause", label: "Menopause", subtitle: "Threshold", isActive: lifeStage === "menopause" },
    { id: "post_menopause", label: "Post-Menopause", subtitle: "Wisdom", isActive: lifeStage === "post_menopause" },
  ];

  // Phase card data for current stage
  const phaseCardData = {
    phaseId: lifeStage,
    title: `This phase of your journey`,
    subtitle: stageInfo.subtitle,
    description: stageInfo.meaning,
    whatYouMayNotice: [
      stageInfo.energyMood,
      stageInfo.bodyResponse,
    ],
    holisticNote: userDosha ? stageInfo.doshaGuidance[userDosha as keyof typeof stageInfo.doshaGuidance]?.text : undefined,
    visualTheme: stageInfo.visualTheme,
  };

  const getDoshaOrder = () => {
    const doshas = ['vata', 'pitta', 'kapha'];
    if (userDosha && doshas.includes(userDosha)) {
      return [userDosha, ...doshas.filter(d => d !== userDosha)];
    }
    return doshas;
  };

  const getLibraryLink = () => {
    const stageParam = lifeStage.replace('_', '-');
    return `/content-library?stage=${stageParam}`;
  };

  const handlePractitionerAction = () => {
    navigate('/bookings');
  };

  return (
    <div className="space-y-6">
      {/* Safety Reminder - Compact version always visible */}
      <JourneySafetyReminder 
        journeyType="menopause" 
        showPractitionerCTA={false}
        variant="compact"
      />

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className={`w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${stageInfo.visualTheme.gradient} border ${stageInfo.visualTheme.borderColor} hover:shadow-md transition-all text-left`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stageInfo.visualTheme.iconBg} ${stageInfo.visualTheme.accentColor}`}>
                <PhaseIcon phase={lifeStage} />
              </div>
              <div>
                <span className="font-medium text-foreground text-sm block">
                  {stageInfo.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stageInfo.subtitle}
                </span>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-6">
          {/* Visual Timeline */}
          <JourneyTimeline 
            phases={journeyPhases}
            currentPhase={lifeStage}
            journeyType="menopause"
          />

          {/* Phase Card with reflection */}
          <JourneyPhaseCard 
            phaseData={phaseCardData}
            journeyType="menopause"
            userDosha={userDosha}
          />

          {/* Lifestyle Suggestions with visuals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TreeDeciduous className="w-4 h-4 text-wellness-sage" />
              <h4 className="font-medium text-foreground text-sm">Gentle support suggestions</h4>
            </div>
            <p className="text-xs text-muted-foreground italic">
              These are optional ideas — always listen to your body first.
            </p>
            <div className="grid gap-2">
              <LifestyleSuggestionCard type="yoga" suggestion={stageInfo.lifestyleSuggestions.yoga} />
              <LifestyleSuggestionCard type="rhythm" suggestion={stageInfo.lifestyleSuggestions.rhythm} />
              <LifestyleSuggestionCard type="breath" suggestion={stageInfo.lifestyleSuggestions.breath} />
            </div>
          </div>

          {/* Ayurvedic/Dosha Insight with visual cues */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wellness-lilac" />
              <h4 className="font-medium text-foreground text-sm">Holistic insight by dosha</h4>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Each body is unique. These are gentle suggestions based on Ayurvedic wisdom for this life stage.
            </p>
            
            {/* Dosha visual indicators */}
            <div className="flex flex-wrap gap-2 pb-2">
              {getDoshaOrder().map((dosha) => (
                <DoshaVisual 
                  key={dosha} 
                  dosha={dosha} 
                  isUserDosha={userDosha === dosha} 
                />
              ))}
            </div>
            
            {/* Detailed dosha guidance */}
            <div className="space-y-3">
              {getDoshaOrder().map((dosha) => {
                const guidance = stageInfo.doshaGuidance[dosha as keyof typeof stageInfo.doshaGuidance];
                const isUser = userDosha === dosha;
                
                return (
                  <div 
                    key={dosha}
                    className={`p-4 rounded-xl border transition-all ${
                      dosha === 'vata' ? 'bg-sky-50/50 border-sky-200 dark:bg-sky-900/10 dark:border-sky-800' :
                      dosha === 'pitta' ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' :
                      'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800'
                    } ${isUser ? 'ring-2 ring-wellness-lilac/40 shadow-sm' : ''}`}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {guidance.text}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {guidance.suggestions.map((suggestion, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] px-2 py-1 rounded-full bg-white/60 dark:bg-black/20 text-foreground/70 border border-black/5"
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA to Content Library */}
          <div className="pt-3 border-t border-border/50">
            <Link 
              to={getLibraryLink()}
              className="block"
            >
              <Button 
                variant="outline" 
                className="w-full border-wellness-lilac/30 text-foreground hover:bg-wellness-lilac/10 hover:border-wellness-lilac/50"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Explore practices that support you right now
              </Button>
            </Link>
          </div>

          {/* Full safety reminder with practitioner CTA */}
          <JourneySafetyReminder 
            journeyType="menopause" 
            showPractitionerCTA={true}
            onPractitionerClick={handlePractitionerAction}
            variant="card"
          />

          {/* App Companion Disclaimer */}
          <AppCompanionDisclaimer variant="subtle" className="pt-2" />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
