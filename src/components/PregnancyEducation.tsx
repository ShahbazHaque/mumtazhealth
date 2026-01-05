import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Sparkles, Leaf, Baby } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PregnancyEducationProps {
  trimester: string;
}

interface TrimesterInfo {
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

const TRIMESTER_EDUCATION: Record<string, TrimesterInfo> = {
  "1": {
    title: "First Trimester",
    meaning: "Your body is doing remarkable, invisible work right now. The first weeks are a time of profound creation, even when it doesn't feel like much is happening outwardly.",
    energyMood: "Fatigue is very common — your body is using tremendous energy for growth. Emotions may feel heightened as hormones shift. Be gentle with yourself.",
    bodyResponse: "Nausea, breast tenderness, and digestive changes are all normal responses. Rest when you need to. Your appetite may fluctuate, and that's perfectly okay.",
    doshaGuidance: {
      vata: "Warmth and grounding are essential now. Focus on regular, small meals and calming routines. Avoid cold foods and overstimulation.",
      pitta: "Cooling, nourishing foods help balance any heat or intensity. Gentle movement and calming practices support your wellbeing.",
      kapha: "Light, easily digestible meals may feel most supportive. Gentle movement helps with any heaviness or sluggishness.",
    },
    libraryTags: ["pregnancy", "first-trimester", "gentle"],
  },
  "2": {
    title: "Second Trimester",
    meaning: "Often called the 'golden trimester,' many women find renewed energy during this time. Your baby is growing rapidly, and you may start to feel those first precious movements.",
    energyMood: "Energy often returns, and many women feel more balanced emotionally. You may feel a beautiful sense of connection as your bump becomes visible.",
    bodyResponse: "Your body is adapting beautifully. Back discomfort may begin, and your center of gravity shifts. Gentle movement and stretching can be very supportive.",
    doshaGuidance: {
      vata: "Continue with grounding practices. Warm oil massage (avoiding the belly) and regular routines support your growing body.",
      pitta: "Stay cool and avoid overheating. Gentle swimming or walking in nature can be wonderfully balancing.",
      kapha: "This is a lovely time for gentle, invigorating movement. Keep meals light and warming to support digestion.",
    },
    libraryTags: ["pregnancy", "second-trimester", "energising"],
  },
  "3": {
    title: "Third Trimester",
    meaning: "The final stretch of your pregnancy journey. Your body is preparing for birth, and your baby is getting ready to meet you. This is a sacred time of anticipation.",
    energyMood: "Energy may dip again as your body works hard. Rest becomes increasingly important. Emotions may include excitement, anxiety, and nesting instincts.",
    bodyResponse: "Discomfort may increase as baby grows. Sleep can be challenging. Focus on rest, gentle stretches, and preparing your body and mind for birth.",
    doshaGuidance: {
      vata: "Extra rest, warmth, and grounding are vital now. Calm environments and gentle breathing practices prepare you for birth.",
      pitta: "Stay cool and patient. Avoid pushing yourself. Cooling foods and calming practices help maintain balance.",
      kapha: "Light movement prevents stagnation. Gentle walking and breathing practices support your energy and prepare you for birth.",
    },
    libraryTags: ["pregnancy", "third-trimester", "restorative"],
  },
};

export function PregnancyEducation({ trimester }: PregnancyEducationProps) {
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

  const trimesterInfo = TRIMESTER_EDUCATION[trimester];
  
  if (!trimesterInfo) return null;

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

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-wellness-lilac/10 border border-wellness-lilac/20 hover:bg-wellness-lilac/15 transition-colors text-left">
            <div className="flex items-center gap-2">
              <Baby className="w-4 h-4 text-wellness-lilac" />
              <span className="font-medium text-wellness-taupe text-sm">
                Understanding your {trimesterInfo.title.toLowerCase()}
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
              This is here to support you, not to add pressure. Every pregnancy is unique, 
              and your body knows what it's doing.
            </p>
          </div>

          {/* What this trimester means */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">What this trimester means</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {trimesterInfo.meaning}
            </p>
          </div>

          {/* Energy & Mood */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How energy and mood may feel</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {trimesterInfo.energyMood}
            </p>
          </div>

          {/* Body Response */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How your body may respond</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {trimesterInfo.bodyResponse}
            </p>
          </div>

          {/* Ayurvedic Insight */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wellness-lilac" />
              <h4 className="font-medium text-wellness-taupe text-sm">Ayurvedic insight</h4>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Each body is unique. These are gentle suggestions based on Ayurvedic wisdom for pregnancy.
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
                    {trimesterInfo.doshaGuidance[dosha as keyof typeof trimesterInfo.doshaGuidance]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA to Content Library */}
          <div className="pt-3 border-t border-wellness-sage/20">
            <Link 
              to={`/content-library?category=Pregnancy&trimester=${trimester}`}
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
