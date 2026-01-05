import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface DailyRhythmProps {
  lifeStage?: string;
}

interface TimeOfDayGuidance {
  icon: React.ReactNode;
  title: string;
  time: string;
  doshaGuidance: {
    vata: string;
    pitta: string;
    kapha: string;
  };
  lifeStageAdjustments?: Record<string, string>;
}

const DAILY_RHYTHMS: TimeOfDayGuidance[] = [
  {
    icon: <Sunrise className="w-4 h-4 text-amber-500" />,
    title: "Morning Ritual",
    time: "6am - 10am",
    doshaGuidance: {
      vata: "Begin gently. Warm water with lemon, self-massage with warm oil, and grounding breathwork set a calm foundation for your day.",
      pitta: "Start with cooling practices. Gentle stretches, calming breath, and a nourishing breakfast help balance your natural intensity.",
      kapha: "Invigorate your morning. Dry brushing, movement, and lighter foods help shake off morning heaviness and build energy.",
    },
    lifeStageAdjustments: {
      pregnancy: "Take your time waking. Gentle stretches in bed and a warm, nourishing breakfast support you and baby.",
      postpartum: "Rest as much as possible. Accept help. A warm, oily breakfast eaten in peace is deeply healing.",
      perimenopause: "Grounding morning routines help balance hormonal fluctuations. Warm oil massage can be especially soothing.",
      menopause: "Gentle, consistent morning rituals support your new rhythms. Warm foods and calming practices set the tone.",
      post_menopause: "Warm oil massage and gentle movement support joint health and vitality. Keep mornings calm and nourishing.",
    },
  },
  {
    icon: <Sun className="w-4 h-4 text-yellow-500" />,
    title: "Midday Focus",
    time: "10am - 2pm",
    doshaGuidance: {
      vata: "This is your strongest digestive time. Eat your main meal now. Take breaks to ground yourself and avoid over-stimulation.",
      pitta: "Your digestive fire peaks now. Enjoy your largest meal. Avoid competitive or heated activities — channel your focus productively.",
      kapha: "Energy is naturally higher. This is a good time for your main meal and for focused, productive work.",
    },
    lifeStageAdjustments: {
      pregnancy: "Eat your main meal when digestion is strongest. Rest after eating if you need to. Stay hydrated.",
      postpartum: "Nourish yourself alongside baby's feeding schedule. Ask others to prepare warm, oily meals for you.",
      perimenopause: "A nourishing midday meal supports stable energy. Take short breaks to manage any heat symptoms.",
      menopause: "Regular meal times support your body's new rhythms. A satisfying lunch prevents afternoon energy dips.",
      post_menopause: "Consistent meal times and staying active support digestion and vitality.",
    },
  },
  {
    icon: <Sunset className="w-4 h-4 text-orange-500" />,
    title: "Evening Wind-Down",
    time: "2pm - 6pm",
    doshaGuidance: {
      vata: "Energy may naturally dip. A warm drink and short rest or gentle walk can help. Avoid stimulants and start winding down.",
      pitta: "Transition from intensity to calm. Gentle movement, time in nature, and creative pursuits support balance.",
      kapha: "Stay gently active to maintain energy. A light walk or gentle stretching prevents sluggishness.",
    },
    lifeStageAdjustments: {
      pregnancy: "Rest when you need to. Gentle walks and quiet activities support your energy. Keep snacks light and nourishing.",
      postpartum: "This may be a challenging time of day. Accept that rest is productive. Gentle movement when possible.",
      perimenopause: "Afternoon energy shifts are common. Gentle movement and staying hydrated help maintain balance.",
      menopause: "A restorative break can help with afternoon fatigue. Light snacks and gentle movement support you.",
      post_menopause: "Stay gently active. Light stretching or a short walk supports energy and joint mobility.",
    },
  },
  {
    icon: <Moon className="w-4 h-4 text-indigo-400" />,
    title: "Night Restoration",
    time: "6pm - 10pm",
    doshaGuidance: {
      vata: "Create calm. Eat dinner early and keep it warm and simple. Warm milk, gentle stretches, and early sleep support deep rest.",
      pitta: "Allow the day's intensity to fade. Light dinner, calming activities, and avoiding screens help you wind down peacefully.",
      kapha: "A light, early dinner supports better sleep. Gentle evening walks and avoiding heavy foods prevent morning sluggishness.",
    },
    lifeStageAdjustments: {
      pregnancy: "Eat early to reduce heartburn. Warm milk or calming tea before bed. Prop yourself comfortably for sleep.",
      postpartum: "Sleep when baby sleeps when possible. Keep evenings calm. Warm, nourishing foods support milk production.",
      perimenopause: "Cool sleeping environment helps with night sweats. Calming evening routines support better sleep.",
      menopause: "Keep bedroom cool. Avoid stimulating foods and screens before bed. Calming rituals prepare you for rest.",
      post_menopause: "Regular sleep times support your body's rhythms. Warm milk and gentle stretches prepare you for rest.",
    },
  },
];

export function DailyRhythm({ lifeStage }: DailyRhythmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);

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

  const doshaLabels: Record<string, string> = {
    vata: 'Vata',
    pitta: 'Pitta',
    kapha: 'Kapha',
  };

  const doshaColors: Record<string, string> = {
    vata: 'text-sky-600',
    pitta: 'text-amber-600',
    kapha: 'text-emerald-600',
  };

  const getCurrentTimeBlock = (): number => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return 0; // Morning
    if (hour >= 10 && hour < 14) return 1; // Midday
    if (hour >= 14 && hour < 18) return 2; // Evening
    return 3; // Night
  };

  const currentBlock = getCurrentTimeBlock();

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-wellness-lilac/10 to-wellness-sage/10 border border-wellness-lilac/20 hover:from-wellness-lilac/15 hover:to-wellness-sage/15 transition-colors text-left">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-wellness-lilac" />
              <span className="font-medium text-wellness-taupe text-sm">
                Daily rhythm — what supports you now
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-wellness-taupe/70" />
            ) : (
              <ChevronDown className="w-4 h-4 text-wellness-taupe/70" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-4">
          {/* Intro */}
          <div className="p-4 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
            <p className="text-sm text-wellness-taupe/90 italic">
              Ayurveda teaches that our energy naturally shifts throughout the day. 
              These are gentle suggestions to help you flow with your body's rhythms.
            </p>
          </div>

          {/* Time blocks */}
          <div className="space-y-3">
            {DAILY_RHYTHMS.map((rhythm, index) => (
              <div 
                key={rhythm.title}
                className={`p-4 rounded-lg border transition-all ${
                  currentBlock === index 
                    ? 'bg-wellness-lilac/15 border-wellness-lilac/40 ring-2 ring-wellness-lilac/20' 
                    : 'bg-background/50 border-wellness-taupe/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {rhythm.icon}
                  <span className="font-medium text-wellness-taupe text-sm">
                    {rhythm.title}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {rhythm.time}
                  </span>
                  {currentBlock === index && (
                    <span className="text-xs bg-wellness-lilac/20 text-wellness-lilac px-2 py-0.5 rounded-full">
                      Now
                    </span>
                  )}
                </div>

                {/* Dosha guidance - show user's dosha first or all if none set */}
                <div className="space-y-2">
                  {userDosha ? (
                    <p className="text-sm text-muted-foreground">
                      <span className={`font-medium ${doshaColors[userDosha]}`}>
                        For {doshaLabels[userDosha]}:
                      </span>{' '}
                      {rhythm.doshaGuidance[userDosha as keyof typeof rhythm.doshaGuidance]}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {(['vata', 'pitta', 'kapha'] as const).map((dosha) => (
                        <p key={dosha} className="text-sm text-muted-foreground">
                          <span className={`font-medium ${doshaColors[dosha]}`}>
                            {doshaLabels[dosha]}:
                          </span>{' '}
                          {rhythm.doshaGuidance[dosha]}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Life stage specific adjustment */}
                  {lifeStage && rhythm.lifeStageAdjustments?.[lifeStage] && (
                    <div className="mt-2 pt-2 border-t border-wellness-sage/20">
                      <p className="text-sm text-wellness-sage italic">
                        {rhythm.lifeStageAdjustments[lifeStage]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Gentle reminder */}
          <p className="text-xs text-muted-foreground text-center italic">
            These are suggestions, not rules. Listen to your body and do what feels right for you.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
