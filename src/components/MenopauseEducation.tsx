import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Sparkles, Leaf, Sun } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface MenopauseEducationProps {
  lifeStage: 'perimenopause' | 'menopause' | 'post_menopause';
}

interface StageInfo {
  title: string;
  meaning: string;
  energyMood: string;
  bodyResponse: string;
  doshaGuidance: {
    vata: string;
    pitta: string;
    kapha: string;
  };
  libraryTags: string[];
}

const STAGE_EDUCATION: Record<string, StageInfo> = {
  perimenopause: {
    title: "Perimenopause",
    meaning: "Your body is beginning a beautiful transition. This phase can last several years as your hormones naturally shift and adjust — it's a sign of wisdom unfolding.",
    energyMood: "You may notice energy levels fluctuating more than before. Some days feel vibrant, others call for rest. Emotions may feel more intense or unpredictable.",
    bodyResponse: "Your body may respond differently to food, sleep, and movement than it used to. Hot flashes, sleep changes, and cycle irregularities are all part of this natural journey.",
    doshaGuidance: {
      vata: "Warmth, routine, and grounding practices are especially nourishing now. Prioritise warm foods, regular sleep, and calming self-care rituals.",
      pitta: "Cooling practices can help balance any heat symptoms. Gentle, non-competitive movement and cooling foods may feel soothing.",
      kapha: "Gentle stimulating movement helps prevent stagnation. Light, warm foods and invigorating practices support your transition.",
    },
    libraryTags: ["perimenopause", "hormonal", "grounding"],
  },
  menopause: {
    title: "Menopause",
    meaning: "You have arrived at a significant milestone — 12 months without a period marks this natural threshold. This is a time of profound inner wisdom and transformation.",
    energyMood: "Energy may feel more settled compared to perimenopause, though some women still experience fluctuations. This can be a deeply reflective and spiritually rich time.",
    bodyResponse: "Hot flashes and sleep patterns may continue to shift. Your body is finding its new rhythm — honouring rest and gentle movement supports this adjustment.",
    doshaGuidance: {
      vata: "This transition naturally increases Vata. Extra warmth, oiling practices (abhyanga), and grounding routines are deeply supportive.",
      pitta: "Any lingering heat symptoms benefit from cooling foods and calming practices. Avoid overexertion and embrace gentleness.",
      kapha: "Keep energy moving with gentle, regular activity. Warming spices and light foods help maintain vitality.",
    },
    libraryTags: ["menopause", "hormonal", "restorative"],
  },
  post_menopause: {
    title: "Post-Menopause",
    meaning: "You are now in a stage traditionally honoured as the 'wisdom years.' Your body has completed its transition, and this can be a time of deep inner peace and clarity.",
    energyMood: "Many women find their mood stabilises and a new sense of calm emerges. Energy may feel more consistent, though gentle self-care remains important.",
    bodyResponse: "Focus shifts to maintaining bone health, joint mobility, and heart wellness. Your body thrives with nourishing movement, warm foods, and self-massage practices.",
    doshaGuidance: {
      vata: "Vata naturally increases with age. Warm, oily foods, regular routines, and gentle yoga help maintain balance and vitality.",
      pitta: "Continue with cooling, calming practices. This is a beautiful time to channel your wisdom into meaningful pursuits.",
      kapha: "Stay active with gentle movement to maintain strength and flexibility. Warming practices and light foods support your wellbeing.",
    },
    libraryTags: ["post-menopause", "joint-care", "grounding"],
  },
};

export function MenopauseEducation({ lifeStage }: MenopauseEducationProps) {
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

  const stageInfo = STAGE_EDUCATION[lifeStage];
  
  if (!stageInfo) return null;

  const getDoshaOrder = () => {
    const doshas = ['vata', 'pitta', 'kapha'];
    if (userDosha && doshas.includes(userDosha)) {
      return [userDosha, ...doshas.filter(d => d !== userDosha)];
    }
    return doshas;
  };

  const doshaLabels: Record<string, string> = {
    vata: 'Vata (Air & Ether)',
    pitta: 'Pitta (Fire & Water)',
    kapha: 'Kapha (Earth & Water)',
  };

  const doshaColors: Record<string, string> = {
    vata: 'bg-sky-50 border-sky-200',
    pitta: 'bg-amber-50 border-amber-200',
    kapha: 'bg-emerald-50 border-emerald-200',
  };

  const getLibraryLink = () => {
    const stageParam = lifeStage.replace('_', '-');
    return `/content-library?stage=${stageParam}`;
  };

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-wellness-lilac/10 border border-wellness-lilac/20 hover:bg-wellness-lilac/15 transition-colors text-left">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-wellness-lilac" />
              <span className="font-medium text-wellness-taupe text-sm">
                Understanding your {stageInfo.title.toLowerCase()} journey
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-wellness-taupe/70" />
            ) : (
              <ChevronDown className="w-4 h-4 text-wellness-taupe/70" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-5">
          {/* Reassuring intro */}
          <div className="p-4 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
            <p className="text-sm text-wellness-taupe/90 italic">
              This is here to help you understand your body, not to track perfection. 
              Every woman's experience is unique and valid.
            </p>
          </div>

          {/* What this stage means */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">What {stageInfo.title.toLowerCase()} means</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stageInfo.meaning}
            </p>
          </div>

          {/* Energy & Mood */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How energy and mood may feel</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stageInfo.energyMood}
            </p>
          </div>

          {/* Body Response */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How your body may respond</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stageInfo.bodyResponse}
            </p>
          </div>

          {/* Ayurvedic Insight */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wellness-lilac" />
              <h4 className="font-medium text-wellness-taupe text-sm">Ayurvedic insight</h4>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Each body is unique. These are gentle suggestions based on Ayurvedic wisdom for this life stage.
            </p>
            
            <div className="space-y-2">
              {getDoshaOrder().map((dosha) => (
                <div 
                  key={dosha}
                  className={`p-3 rounded-lg border ${doshaColors[dosha]} ${
                    userDosha === dosha ? 'ring-2 ring-wellness-lilac/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-wellness-taupe/80">
                      {doshaLabels[dosha]}
                      {userDosha === dosha && (
                        <span className="ml-2 text-wellness-lilac">(Your dosha)</span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stageInfo.doshaGuidance[dosha as keyof typeof stageInfo.doshaGuidance]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA to Content Library */}
          <div className="pt-3 border-t border-wellness-sage/20">
            <Link 
              to={getLibraryLink()}
              className="block"
            >
              <Button 
                variant="outline" 
                className="w-full border-wellness-lilac/30 text-wellness-taupe hover:bg-wellness-lilac/10 hover:border-wellness-lilac/50"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Explore practices that support you right now
              </Button>
            </Link>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}