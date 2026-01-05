import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Sparkles, Leaf, Heart } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PostpartumInfo {
  meaning: string;
  energyMood: string;
  bodyResponse: string;
  recoveryGuidance: string;
  doshaGuidance: {
    vata: string;
    pitta: string;
    kapha: string;
  };
  libraryTags: string[];
}

const POSTPARTUM_EDUCATION: PostpartumInfo = {
  meaning: "The postpartum period is sometimes called the 'fourth trimester.' Your body has just accomplished something extraordinary, and now it's in a sacred time of healing and adjustment.",
  energyMood: "Exhaustion is normal — you're recovering while caring for a newborn. Emotions may swing widely due to hormonal shifts, sleep deprivation, and the profound life change. All of this is valid.",
  bodyResponse: "Your body is healing from birth while producing milk (if breastfeeding). Gentle movement, rest, and nourishing foods are essential. There is no rush to 'bounce back.'",
  recoveryGuidance: "In Ayurveda, the postpartum period is traditionally a time of deep rest and nourishment — ideally 40 days of minimal activity. Warm, oily foods, gentle self-care, and accepting support are encouraged.",
  doshaGuidance: {
    vata: "Vata is naturally elevated postpartum. Warmth, oiling (abhyanga), warm foods, and quiet rest are essential. Avoid cold, raw foods and overstimulation.",
    pitta: "Any heat or inflammation benefits from cooling, calming practices. Prioritise rest and gentle, cooling foods while supporting healing.",
    kapha: "Light, warm foods and gentle movement when ready help prevent stagnation. Allow yourself deep rest while gradually building energy.",
  },
  libraryTags: ["postpartum", "recovery", "restorative"],
};

export function PostpartumEducation() {
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
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20 hover:bg-wellness-sage/15 transition-colors text-left">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-wellness-sage" />
              <span className="font-medium text-wellness-taupe text-sm">
                Understanding your postpartum journey
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
          <div className="p-4 rounded-lg bg-wellness-lilac/10 border border-wellness-lilac/20">
            <p className="text-sm text-wellness-taupe/90 italic">
              This is a time for healing and bonding, not for pressure or expectations. 
              You are doing an incredible job, even when it doesn't feel like it.
            </p>
          </div>

          {/* What postpartum means */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">What postpartum means</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {POSTPARTUM_EDUCATION.meaning}
            </p>
          </div>

          {/* Energy & Mood */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How energy and mood may feel</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {POSTPARTUM_EDUCATION.energyMood}
            </p>
          </div>

          {/* Body Response */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">How your body may respond</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {POSTPARTUM_EDUCATION.bodyResponse}
            </p>
          </div>

          {/* Recovery Guidance */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">Traditional recovery wisdom</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {POSTPARTUM_EDUCATION.recoveryGuidance}
            </p>
          </div>

          {/* Ayurvedic Insight */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wellness-lilac" />
              <h4 className="font-medium text-wellness-taupe text-sm">Ayurvedic insight</h4>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Each body is unique. These are gentle suggestions based on Ayurvedic wisdom for postpartum recovery.
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
                    {POSTPARTUM_EDUCATION.doshaGuidance[dosha as keyof typeof POSTPARTUM_EDUCATION.doshaGuidance]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Support Note */}
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-wellness-taupe/90">
              <strong>A gentle reminder:</strong> If you're feeling persistently sad, anxious, or overwhelmed, 
              please reach out to a healthcare provider. Postpartum mood changes are common and treatable — 
              seeking help is a sign of strength, not weakness.
            </p>
          </div>

          {/* CTA to Content Library */}
          <div className="pt-3 border-t border-wellness-sage/20">
            <Link 
              to="/content-library?category=Pregnancy"
              className="block"
            >
              <Button 
                variant="outline" 
                className="w-full border-wellness-sage/30 text-wellness-taupe hover:bg-wellness-sage/10 hover:border-wellness-sage/50"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Explore practices that support your recovery
              </Button>
            </Link>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
