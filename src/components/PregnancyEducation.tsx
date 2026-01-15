import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Leaf, 
  Baby, 
  Heart,
  Droplets,
  Wind,
  Mountain,
  Moon,
  Sun,
  CloudSun,
  Flower2,
  TreeDeciduous,
  Shield,
  CircleDot
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppCompanionDisclaimer } from "@/components/AppCompanionDisclaimer";
import { PractitionerSupportCTA } from "@/components/PractitionerSupportCTA";

interface PregnancyEducationProps {
  trimester: string;
}

interface TrimesterInfo {
  title: string;
  subtitle: string;
  meaning: string;
  energyMood: string;
  bodyResponse: string;
  babySize: {
    metaphor: string;
    description: string;
  };
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

const TRIMESTER_EDUCATION: Record<string, TrimesterInfo> = {
  "1": {
    title: "First Trimester",
    subtitle: "A time of quiet beginnings",
    meaning: "Your body is doing remarkable, invisible work right now. The first weeks are a time of profound creation, even when it doesn't feel like much is happening outwardly.",
    energyMood: "Fatigue is very common — your body is using tremendous energy for growth. Emotions may feel heightened as hormones shift. Be gentle with yourself.",
    bodyResponse: "Nausea, breast tenderness, and digestive changes are all normal responses. Rest when you need to. Your appetite may fluctuate, and that's perfectly okay.",
    babySize: {
      metaphor: "From a tiny seed to a sweet raspberry",
      description: "In these early weeks, your little one grows from a single cell to about the size of a raspberry. A beautiful beginning."
    },
    visualTheme: {
      gradient: "from-wellness-sage/10 via-wellness-lilac/5 to-wellness-sage/10",
      borderColor: "border-wellness-sage/30",
      iconBg: "bg-wellness-sage/15",
      accentColor: "text-wellness-sage"
    },
    doshaGuidance: {
      vata: { 
        text: "Warmth and grounding are essential now. Focus on regular, small meals and calming routines. Avoid cold foods and overstimulation.",
        suggestions: ["Warm, nourishing soups", "Gentle walking", "Early bedtime"]
      },
      pitta: { 
        text: "Cooling, nourishing foods help balance any heat or intensity. Gentle movement and calming practices support your wellbeing.",
        suggestions: ["Cool, sweet foods", "Time in nature", "Calming breathwork"]
      },
      kapha: { 
        text: "Light, easily digestible meals may feel most supportive. Gentle movement helps with any heaviness or sluggishness.",
        suggestions: ["Light, warm meals", "Morning walks", "Gentle stretching"]
      },
    },
    lifestyleSuggestions: {
      yoga: "Restorative and gentle floor-based practices. Supported poses help conserve energy while maintaining connection to your body.",
      rhythm: "Rest is your priority. Honor afternoon naps, early evenings, and slow mornings. Your body is working hard.",
      breath: "Gentle belly breathing and calming exhales. No breath holds. Simply observe and soften."
    },
    libraryTags: ["pregnancy", "first-trimester", "gentle"],
  },
  "2": {
    title: "Second Trimester",
    subtitle: "Finding your rhythm",
    meaning: "Often called the 'golden trimester,' many women find renewed energy during this time. Your baby is growing rapidly, and you may start to feel those first precious movements.",
    energyMood: "Energy often returns, and many women feel more balanced emotionally. You may feel a beautiful sense of connection as your bump becomes visible.",
    bodyResponse: "Your body is adapting beautifully. Back discomfort may begin, and your center of gravity shifts. Gentle movement and stretching can be very supportive.",
    babySize: {
      metaphor: "From a lemon to a mango",
      description: "Your baby grows from about the size of a lemon to a lovely mango. You may start feeling those first gentle flutters."
    },
    visualTheme: {
      gradient: "from-wellness-lilac/10 via-amber-50/30 to-wellness-lilac/10",
      borderColor: "border-wellness-lilac/30",
      iconBg: "bg-wellness-lilac/15",
      accentColor: "text-wellness-lilac"
    },
    doshaGuidance: {
      vata: { 
        text: "Continue with grounding practices. Warm oil massage (avoiding the belly) and regular routines support your growing body.",
        suggestions: ["Warm oil self-massage", "Steady daily routines", "Grounding foods"]
      },
      pitta: { 
        text: "Stay cool and avoid overheating. Gentle swimming or walking in nature can be wonderfully balancing.",
        suggestions: ["Swimming or water time", "Shade and cool spaces", "Cooling coconut oil"]
      },
      kapha: { 
        text: "This is a lovely time for gentle, invigorating movement. Keep meals light and warming to support digestion.",
        suggestions: ["Daily gentle walks", "Light, spiced meals", "Morning movement"]
      },
    },
    lifestyleSuggestions: {
      yoga: "Modified standing poses and hip-openers. Gentle strength-building to support your changing center of gravity.",
      rhythm: "A balanced pace — gentle activity paired with rest. Connect with your baby through quiet moments.",
      breath: "Cooling breaths if feeling warm, grounding breaths for stability. Always gentle, never forced."
    },
    libraryTags: ["pregnancy", "second-trimester", "energising"],
  },
  "3": {
    title: "Third Trimester",
    subtitle: "Preparing for arrival",
    meaning: "The final stretch of your pregnancy journey. Your body is preparing for birth, and your baby is getting ready to meet you. This is a sacred time of anticipation.",
    energyMood: "Energy may dip again as your body works hard. Rest becomes increasingly important. Emotions may include excitement, anxiety, and nesting instincts.",
    bodyResponse: "Discomfort may increase as baby grows. Sleep can be challenging. Focus on rest, gentle stretches, and preparing your body and mind for birth.",
    babySize: {
      metaphor: "From a papaya to a watermelon",
      description: "Your baby grows from about the size of a papaya to a full watermelon. They're getting ready to meet you, practicing breathing and moving."
    },
    visualTheme: {
      gradient: "from-mumtaz-plum/5 via-wellness-lilac/10 to-mumtaz-plum/5",
      borderColor: "border-mumtaz-plum/20",
      iconBg: "bg-mumtaz-plum/10",
      accentColor: "text-mumtaz-plum"
    },
    doshaGuidance: {
      vata: { 
        text: "Extra rest, warmth, and grounding are vital now. Calm environments and gentle breathing practices prepare you for birth.",
        suggestions: ["Warm baths", "Soft music and calm spaces", "Nurturing support"]
      },
      pitta: { 
        text: "Stay cool and patient. Avoid pushing yourself. Cooling foods and calming practices help maintain balance.",
        suggestions: ["Cool compresses", "Patience with yourself", "Release perfectionism"]
      },
      kapha: { 
        text: "Light movement prevents stagnation. Gentle walking and breathing practices support your energy and prepare you for birth.",
        suggestions: ["Short, gentle walks", "Uplifting essential oils", "Light, warm meals"]
      },
    },
    lifestyleSuggestions: {
      yoga: "Supported yin and restorative practices. Focus on hip-openers and relaxation to prepare body and mind for birth.",
      rhythm: "Prioritize rest and nesting. Create calm, supportive spaces. This is a time for gentleness and preparation.",
      breath: "Birth-preparation breathing — long, slow exhales. Practice relaxing your body with each breath."
    },
    libraryTags: ["pregnancy", "third-trimester", "restorative"],
  },
};

// Trimester-specific visual icons
const TrimesterIcon = ({ trimester }: { trimester: string }) => {
  switch (trimester) {
    case "1":
      return <Leaf className="w-5 h-5" />;
    case "2":
      return <Sun className="w-5 h-5" />;
    case "3":
      return <Moon className="w-5 h-5" />;
    default:
      return <Baby className="w-5 h-5" />;
  }
};

// Dosha visual cues
const DoshaVisual = ({ dosha, isUserDosha }: { dosha: string; isUserDosha: boolean }) => {
  const config = {
    vata: {
      icon: Wind,
      colors: "bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800",
      iconColor: "text-sky-500",
      label: "Vata (Air & Ether)",
      visualCue: "Grounding • Stillness • Warmth"
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
      visualCue: "Lightness • Movement • Energy"
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

// Baby size visual with gentle fruit/nature metaphor
const BabySizeVisual = ({ trimester, babySize }: { trimester: string; babySize: { metaphor: string; description: string } }) => {
  const sizeIcons = {
    "1": "🫘", // seed/bean
    "2": "🍋", // lemon to mango
    "3": "🍈", // papaya to watermelon
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-wellness-lilac/5 to-wellness-sage/5 border border-wellness-lilac/15">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-card flex items-center justify-center text-2xl shadow-sm">
        {sizeIcons[trimester as keyof typeof sizeIcons] || "🌱"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground/90 mb-1">
          {babySize.metaphor}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {babySize.description}
        </p>
      </div>
    </div>
  );
};

// Lifestyle suggestion card with icon
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
      title: "Gentle yoga",
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

export function PregnancyEducation({ trimester }: PregnancyEducationProps) {
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

  const trimesterInfo = TRIMESTER_EDUCATION[trimester];
  
  if (!trimesterInfo) return null;

  const getDoshaOrder = () => {
    const doshas = ['vata', 'pitta', 'kapha'];
    if (userDosha && doshas.includes(userDosha)) {
      return [userDosha, ...doshas.filter(d => d !== userDosha)];
    }
    return doshas;
  };

  const handlePractitionerAction = () => {
    navigate('/bookings');
  };

  return (
    <div className="space-y-4">
      {/* Safety Reminder - Always visible */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-wellness-sage/5 border border-wellness-sage/20">
        <Shield className="w-4 h-4 text-wellness-sage flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This app offers supportive, educational guidance only. It does not replace medical advice 
          or a qualified teacher. If unsure, please seek medical guidance.
        </p>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className={`w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${trimesterInfo.visualTheme.gradient} border ${trimesterInfo.visualTheme.borderColor} hover:shadow-md transition-all text-left`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${trimesterInfo.visualTheme.iconBg} ${trimesterInfo.visualTheme.accentColor}`}>
                <TrimesterIcon trimester={trimester} />
              </div>
              <div>
                <span className="font-medium text-foreground text-sm block">
                  {trimesterInfo.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {trimesterInfo.subtitle}
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

        <CollapsibleContent className="pt-4 space-y-5">
          {/* Reassuring intro */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-wellness-lilac/5 to-wellness-sage/5 border border-wellness-sage/20">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-wellness-lilac flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 italic leading-relaxed">
                This is here to support you, not to add pressure. Every pregnancy is unique, 
                and your body knows what it's doing.
              </p>
            </div>
          </div>

          {/* Baby size metaphor with visual */}
          <BabySizeVisual trimester={trimester} babySize={trimesterInfo.babySize} />

          {/* Where you are in your journey */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-wellness-lilac" />
              Where you are in your journey
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              {trimesterInfo.meaning}
            </p>
          </div>

          {/* Energy & Mood */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground text-sm">How energy and mood may feel</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {trimesterInfo.energyMood}
            </p>
          </div>

          {/* Body Response */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground text-sm">How your body may respond</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {trimesterInfo.bodyResponse}
            </p>
          </div>

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
              <LifestyleSuggestionCard type="yoga" suggestion={trimesterInfo.lifestyleSuggestions.yoga} />
              <LifestyleSuggestionCard type="rhythm" suggestion={trimesterInfo.lifestyleSuggestions.rhythm} />
              <LifestyleSuggestionCard type="breath" suggestion={trimesterInfo.lifestyleSuggestions.breath} />
            </div>
          </div>

          {/* Ayurvedic/Dosha Insight with visual cues */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wellness-lilac" />
              <h4 className="font-medium text-foreground text-sm">Holistic insight by dosha</h4>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Each body is unique. These are gentle suggestions based on Ayurvedic wisdom for pregnancy.
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
                const guidance = trimesterInfo.doshaGuidance[dosha as keyof typeof trimesterInfo.doshaGuidance];
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
              to={`/content-library?category=Pregnancy&trimester=${trimester}`}
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

          {/* Practitioner CTA */}
          <div className="pt-2">
            <PractitionerSupportCTA 
              variant="inline"
              serviceType="consultation"
              lifeStage="pregnancy"
              onAction={handlePractitionerAction}
            />
          </div>

          {/* App Companion Disclaimer */}
          <AppCompanionDisclaimer variant="subtle" className="pt-2" />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
