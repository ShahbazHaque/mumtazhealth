import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Heart, Sparkles, Leaf, Sun, Moon, Droplets, Wind, Flame, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const TRANSITION_PHASES = [
  {
    id: "early-perimenopause",
    title: "Early Perimenopause",
    timeframe: "Often begins in early-to-mid 40s",
    description: "Your body begins its gradual transition. Cycles may still be regular, but subtle shifts in energy, sleep, or mood might appear.",
    bodyChanges: [
      "Cycles may shorten slightly (25-28 days)",
      "Subtle changes in flow — lighter or heavier",
      "Sleep patterns may shift",
      "Energy fluctuations become more noticeable"
    ],
    ayurvedicInsight: "This is a time when Vata (air and space) begins to rise naturally. Grounding practices, warm foods, and consistent routines help ease the transition."
  },
  {
    id: "mid-perimenopause", 
    title: "Mid Perimenopause",
    timeframe: "Can last 2-8 years before menopause",
    description: "Hormone fluctuations become more pronounced. Cycles may become irregular, and symptoms like hot flashes or night sweats may appear.",
    bodyChanges: [
      "Irregular cycles — skipping months is common",
      "Hot flashes and night sweats may begin",
      "Mood changes and brain fog",
      "Joint stiffness or changes in skin/hair"
    ],
    ayurvedicInsight: "Pitta (fire) can flare during this phase, bringing heat and intensity. Cooling foods, gentle movement, and calming practices help balance this fire."
  },
  {
    id: "late-perimenopause",
    title: "Late Perimenopause", 
    timeframe: "The final 1-2 years before menopause",
    description: "Periods become increasingly rare. Your body is preparing for a new rhythm. Symptoms may peak during this time.",
    bodyChanges: [
      "Long gaps between periods (60+ days)",
      "Symptoms may intensify before easing",
      "Sleep and mood stabilizing for some",
      "Body composition changes"
    ],
    ayurvedicInsight: "This is a powerful threshold. Vata continues to rise, making self-care rituals, adequate rest, and nourishing oils (abhyanga) especially supportive."
  },
  {
    id: "menopause",
    title: "Menopause",
    timeframe: "Officially after 12 months without a period",
    description: "A single point in time marking the end of menstrual cycles. Many women feel a sense of liberation and renewed energy.",
    bodyChanges: [
      "No menstrual period for 12 consecutive months",
      "Hormone levels stabilize at new baseline",
      "Symptoms often begin to ease",
      "A new relationship with your body emerges"
    ],
    ayurvedicInsight: "In Ayurveda, this marks the transition to the 'Vata time of life' — a phase of wisdom, intuition, and spiritual growth. Embrace practices that ground and nourish."
  },
  {
    id: "post-menopause",
    title: "Post-Menopause & Beyond",
    timeframe: "The years following menopause",
    description: "Your body has found its new rhythm. Many women experience increased clarity, confidence, and freedom in this phase.",
    bodyChanges: [
      "Hormone levels remain stable",
      "Hot flashes typically decrease",
      "Bone health becomes a focus",
      "Energy often returns and stabilizes"
    ],
    ayurvedicInsight: "This is considered a sacred phase of life in Ayurveda — a time for sharing wisdom, deepening spiritual practice, and honoring your body's journey."
  }
];

interface DoshaGuidance {
  dosha: string;
  title: string;
  icon: React.ReactNode;
  guidance: string;
  practices: string[];
}

const DOSHA_TRANSITION_GUIDANCE: DoshaGuidance[] = [
  {
    dosha: "vata",
    title: "Vata During Transition",
    icon: <Wind className="w-4 h-4" />,
    guidance: "Vata types may feel transitions more acutely — anxiety, scattered energy, and sleep disruptions can intensify. Grounding is essential.",
    practices: [
      "Warm, oily foods like soups and stews",
      "Consistent daily routines (eat/sleep at same times)",
      "Gentle yoga with long holds",
      "Warm oil self-massage (abhyanga)",
      "Meditation and slow breathing"
    ]
  },
  {
    dosha: "pitta",
    title: "Pitta During Transition",
    icon: <Flame className="w-4 h-4" />,
    guidance: "Pitta types may experience more intense hot flashes, irritability, and inflammation. Cooling and calming practices help balance this fire.",
    practices: [
      "Cooling foods — cucumber, coconut, mint",
      "Avoid excessive heat and spicy foods",
      "Moon-gazing and evening walks",
      "Cooling breathwork (Sheetali)",
      "Gentle, non-competitive movement"
    ]
  },
  {
    dosha: "kapha",
    title: "Kapha During Transition",
    icon: <Droplets className="w-4 h-4" />,
    guidance: "Kapha types may notice weight changes, sluggishness, or emotional heaviness. Stimulating yet gentle practices help maintain vitality.",
    practices: [
      "Light, warm, spiced foods",
      "Regular movement — walking, dancing",
      "Dry brushing before bathing",
      "Energizing breathwork (Kapalabhati — gently)",
      "Social connection and new activities"
    ]
  }
];

export function BodyChangingEducation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [userDosha, setUserDosha] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDosha();
  }, []);

  const fetchUserDosha = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_wellness_profiles")
        .select("primary_dosha")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.primary_dosha) {
        setUserDosha(data.primary_dosha);
      }
    } catch (error) {
      console.error("Error fetching dosha:", error);
    }
  };

  const getDoshaGuidance = (): DoshaGuidance[] => {
    if (!userDosha) return DOSHA_TRANSITION_GUIDANCE;
    
    // Put user's dosha first
    const sorted = [...DOSHA_TRANSITION_GUIDANCE].sort((a, b) => {
      if (a.dosha === userDosha) return -1;
      if (b.dosha === userDosha) return 1;
      return 0;
    });
    
    return sorted;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto text-left hover:bg-accent/5 border border-accent/20 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/10">
              <Heart className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Your Body is Changing</p>
              <p className="text-sm text-muted-foreground">
                Understanding the perimenopause-to-menopause journey
              </p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 space-y-6">
        {/* Reassurance Header */}
        <div className="p-5 bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl border border-accent/10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-accent/10 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                This is a natural transition, not a medical event
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every woman's journey through perimenopause and menopause is unique. There's no "right" timeline 
                or "correct" way to experience it. What matters is listening to your body and finding what 
                supports you during this powerful phase of life.
              </p>
              <p className="text-xs text-muted-foreground italic">
                This information is educational and supportive, not medical advice. Always consult your healthcare 
                provider for personalized guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Phases */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            The Journey Through Change
          </h4>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-accent/40 via-primary/40 to-accent/40" />
            
            <div className="space-y-4">
              {TRANSITION_PHASES.map((phase, index) => (
                <div key={phase.id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-background border-2 border-accent shadow-sm" />
                  
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className="font-medium text-foreground">{phase.title}</h5>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {phase.timeframe}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {phase.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Body Changes */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">What you might notice:</p>
                        <ul className="space-y-1">
                          {phase.bodyChanges.map((change, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-accent mt-1">•</span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Ayurvedic Insight */}
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Ayurvedic Insight
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {phase.ayurvedicInsight}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dosha-Specific Guidance */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Moon className="w-4 h-4 text-accent" />
            Ayurvedic Support for Your Constitution
            {userDosha && (
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-2">
                Your dosha: {userDosha.charAt(0).toUpperCase() + userDosha.slice(1)}
              </span>
            )}
          </h4>
          
          <div className="grid gap-4">
            {getDoshaGuidance().map((guidance) => (
              <div 
                key={guidance.dosha}
                className={`p-4 rounded-lg border transition-colors ${
                  guidance.dosha === userDosha 
                    ? "bg-accent/5 border-accent/30" 
                    : "bg-background/50 border-border/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-full ${
                    guidance.dosha === userDosha ? "bg-accent/20" : "bg-muted/50"
                  }`}>
                    {guidance.icon}
                  </div>
                  <h5 className="font-medium text-foreground">{guidance.title}</h5>
                  {guidance.dosha === userDosha && (
                    <span className="text-xs text-accent">✦ Your type</span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {guidance.guidance}
                </p>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Supportive practices:</p>
                  <div className="flex flex-wrap gap-2">
                    {guidance.practices.map((practice, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full"
                      >
                        {practice}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">
                Explore practices that support you
              </h4>
              <p className="text-sm text-muted-foreground">
                Find yoga, nutrition, and lifestyle content tailored for your journey.
              </p>
            </div>
            <Button
              onClick={() => navigate("/content-library?tags=menopause,perimenopause,hormonal")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Content
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
