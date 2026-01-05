import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Sparkles, Leaf } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CyclePhaseEducationProps {
  selectedPhase: string;
  lifeStage?: string;
}

interface PhaseInfo {
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

const PHASE_EDUCATION: Record<string, PhaseInfo> = {
  Menstrual: {
    meaning: "Your body is gently releasing and renewing. This is nature's invitation to slow down and honour your need for rest.",
    energyMood: "You may notice energy feeling lower than usual. Some women experience a desire for quiet time and reflection.",
    bodyResponse: "This can be a supportive time for restorative rest, warm nourishing foods, and gentle movement. Digestion may feel more sensitive.",
    doshaGuidance: {
      vata: "Warmth and grounding are especially supportive now. Consider warm broths, gentle self-massage, and cosy rest.",
      pitta: "Cooling, calming practices may feel soothing. Allow yourself to step back from intense activity.",
      kapha: "Gentle movement can help with any heaviness. Light, warm foods may feel most nourishing.",
    },
    libraryTags: ["menstrual", "restorative", "gentle"],
  },
  Follicular: {
    meaning: "A time of renewal and fresh energy. Your body is building up again, often bringing a sense of optimism.",
    energyMood: "Some women notice rising energy and motivation. You may feel more open to new ideas and social connection.",
    bodyResponse: "Your body may respond well to more active movement, creative pursuits, and lighter, fresh foods.",
    doshaGuidance: {
      vata: "Channel rising energy with intention. Routine and grounding practices help balance natural enthusiasm.",
      pitta: "A wonderful time to direct your focus. Balance activity with moments of calm to avoid overheating.",
      kapha: "Embrace the natural lift in energy. This is a supportive time for invigorating movement and new beginnings.",
    },
    libraryTags: ["follicular", "energising", "building"],
  },
  Ovulatory: {
    meaning: "Your body is at its most vibrant. This is often a time of heightened communication and connection.",
    energyMood: "You may feel more confident, social, and expressive. Energy is typically at its peak.",
    bodyResponse: "Your body may enjoy more dynamic movement and activity. Digestion is often strong during this phase.",
    doshaGuidance: {
      vata: "Stay grounded amidst the heightened energy. Enjoy connection while maintaining your routines.",
      pitta: "Your natural warmth may be amplified. Balance outward energy with cooling practices.",
      kapha: "Embrace this natural vitality. A beautiful time for movement and meaningful connection.",
    },
    libraryTags: ["ovulatory", "dynamic", "confident"],
  },
  Luteal: {
    meaning: "A time of turning inward. Your body is preparing for the next cycle, naturally inviting reflection.",
    energyMood: "Energy often begins to wind down. Some women notice emotions feeling more heightened or tender.",
    bodyResponse: "This can be a supportive time for warming, grounding foods and gentler movement. Self-care becomes especially important.",
    doshaGuidance: {
      vata: "Extra warmth and nourishment are key. Establish calm routines and prioritise rest as the cycle winds down.",
      pitta: "Allow intensity to soften. Cooling foods and calming practices help maintain balance.",
      kapha: "Light movement prevents stagnation. Warming spices and gentle activity support wellbeing.",
    },
    libraryTags: ["luteal", "grounding", "restorative"],
  },
};

export function CyclePhaseEducation({ selectedPhase, lifeStage }: CyclePhaseEducationProps) {
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

  const phaseInfo = PHASE_EDUCATION[selectedPhase];
  
  if (!phaseInfo) return null;

  // Check if user is in a non-cycling life stage
  const isNonCycling = ['perimenopause', 'menopause', 'post_menopause', 'pregnancy', 'postpartum'].includes(lifeStage || '');

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
              <Leaf className="w-4 h-4 text-wellness-sage" />
              <span className="font-medium text-wellness-taupe text-sm">
                Learn about this phase
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
          {/* Non-cycling life stage message */}
          {isNonCycling && (
            <div className="p-4 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
              <p className="text-sm text-wellness-taupe/90 italic">
                Even without a monthly cycle, your body still moves through natural energetic rhythms. 
                These insights can help you tune into what feels supportive right now.
              </p>
            </div>
          )}

          {/* What this phase means */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">What this phase means</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {phaseInfo.meaning}
            </p>
          </div>

          {/* Energy & Mood */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How energy and mood may feel</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {phaseInfo.energyMood}
            </p>
          </div>

          {/* Body Response */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How your body may respond</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {phaseInfo.bodyResponse}
            </p>
          </div>

          {/* Ayurvedic Insight */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wellness-lilac" />
              <h4 className="font-medium text-wellness-taupe text-sm">Ayurvedic insight</h4>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Each body is unique. These are gentle suggestions based on Ayurvedic wisdom.
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
                    {phaseInfo.doshaGuidance[dosha as keyof typeof phaseInfo.doshaGuidance]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA to Content Library */}
          <div className="pt-3 border-t border-wellness-sage/20">
            <Link 
              to={`/content-library?phase=${selectedPhase.toLowerCase()}`}
              className="block"
            >
              <Button 
                variant="outline" 
                className="w-full border-wellness-sage/30 text-wellness-taupe hover:bg-wellness-sage/10 hover:border-wellness-sage/50"
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