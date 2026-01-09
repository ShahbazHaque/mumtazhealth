import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Heart, Sparkles, Leaf, Shield } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export function CancerSupportEducation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-wellness-lilac/10 border border-wellness-lilac/20 hover:bg-wellness-lilac/15 transition-colors text-left">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-wellness-lilac" />
              <span className="font-medium text-wellness-taupe text-sm">
                Supportive care during and after treatment
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
          {/* Important disclaimer */}
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800">
                  Please read before continuing
                </p>
                <p className="text-sm text-amber-700">
                  This content offers lifestyle and emotional support rooted in Ayurvedic wisdom. 
                  It does not replace medical treatment, diagnosis, or advice from your oncology team. 
                  Always work alongside your medical professionals.
                </p>
              </div>
            </div>
          </div>

          {/* Compassionate intro */}
          <div className="p-4 rounded-lg bg-wellness-lilac/10 border border-wellness-lilac/20">
            <p className="text-sm text-wellness-taupe/90 italic">
              If you're navigating cancer — whether currently in treatment, recovering, or supporting someone you love — 
              we honour the courage and strength this journey requires. This space offers gentle support for your wellbeing.
            </p>
          </div>

          {/* What this section offers */}
          <div className="space-y-2">
            <h4 className="font-medium text-wellness-taupe text-sm">What you'll find here</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Supportive practices that may help with quality of life, emotional resilience, and overall wellbeing 
              during and after treatment. These are rooted in Ayurvedic lifestyle principles, yoga, breathwork, 
              and nourishment — never medical claims or promises.
            </p>
          </div>

          {/* Lifestyle support areas */}
          <div className="space-y-3">
            <h4 className="font-medium text-wellness-taupe text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-wellness-lilac" />
              Areas of supportive care
            </h4>
            
            <div className="grid gap-2">
              <div className="p-3 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
                <p className="text-sm font-medium text-wellness-taupe">Gentle Movement</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chair yoga, restorative poses, and mobility practices that can be adapted to your energy levels 
                  and may support circulation and comfort.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
                <p className="text-sm font-medium text-wellness-taupe">Breathwork & Rest</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Calming breathing techniques and guided relaxation that may help with stress, sleep, 
                  and emotional regulation during challenging times.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
                <p className="text-sm font-medium text-wellness-taupe">Nourishment</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ayurvedic-inspired food wisdom focused on easily digestible, warming, and comforting foods 
                  that may support strength and recovery. Always discuss dietary changes with your care team.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-wellness-sage/10 border border-wellness-sage/20">
                <p className="text-sm font-medium text-wellness-taupe">Emotional & Spiritual Support</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Meditation, reflection practices, and gentle spiritual support to nurture hope, 
                  connection, and inner peace during your journey.
                </p>
              </div>
            </div>
          </div>

          {/* What we don't offer */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <h4 className="font-medium text-wellness-taupe text-sm mb-2">What this section does not offer</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Medical advice, treatment recommendations, or cures</li>
              <li>• Herbal remedies or supplements (these should be discussed with your doctor)</li>
              <li>• Promises of specific outcomes or healing</li>
              <li>• Replacement for your medical team's guidance</li>
            </ul>
          </div>

          {/* Practitioner support */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-wellness-lilac/10 to-mumtaz-plum/10 border border-wellness-lilac/20">
            <h4 className="font-medium text-wellness-taupe text-sm mb-2">Personalised practitioner support</h4>
            <p className="text-xs text-muted-foreground mb-3">
              For one-to-one guidance during or after treatment, Mumtaz offers compassionate consultations 
              that work alongside your medical care — focusing on lifestyle, emotional support, and holistic wellbeing.
            </p>
            <Link to="/bookings">
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-wellness-lilac/30 text-wellness-lilac hover:bg-wellness-lilac/10"
              >
                <Heart className="w-4 h-4 mr-2" />
                Explore practitioner support
              </Button>
            </Link>
          </div>

          {/* CTA to Content Library */}
          <div className="pt-3 border-t border-wellness-sage/20">
            <Link 
              to="/content-library?tags=restorative,gentle,breathwork"
              className="block"
            >
              <Button 
                variant="outline" 
                className="w-full border-wellness-sage/30 text-wellness-taupe hover:bg-wellness-sage/10 hover:border-wellness-sage/50"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Browse supportive practices
              </Button>
            </Link>
          </div>

          {/* Final reassurance */}
          <p className="text-xs text-center text-muted-foreground italic">
            You are not alone. This app is here to support your wellbeing, gently and without pressure.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default CancerSupportEducation;
