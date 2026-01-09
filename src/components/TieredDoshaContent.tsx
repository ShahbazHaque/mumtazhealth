import { useState } from "react";
import { Wind, Flame, Mountain, Lock, Sparkles, Heart, BookOpen, Video, Headphones, Users, Moon, Sun, Leaf, Star, Calendar, Brain, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionTier = "free" | "basic" | "standard" | "premium";

interface TieredDoshaContentProps {
  userTier: SubscriptionTier;
  primaryDosha?: string;
  secondaryDosha?: string;
  lifeStage?: string;
}

const tierOrder: SubscriptionTier[] = ["free", "basic", "standard", "premium"];

const getTierLabel = (tier: SubscriptionTier): string => {
  const labels: Record<SubscriptionTier, string> = {
    free: "Free",
    basic: "Basic",
    standard: "Standard",
    premium: "Premium"
  };
  return labels[tier];
};

const isContentAvailable = (requiredTier: SubscriptionTier, userTier: SubscriptionTier): boolean => {
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
};

// Comprehensive dosha data
const doshaData = {
  vata: {
    name: "Vata",
    element: "Air & Space",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-200 dark:border-blue-800/50",
    qualities: "Light, dry, cool, mobile, subtle, clear",
    // FREE tier content
    simpleDesc: "Connected to movement, creativity, and the nervous system. Light, quick, and changeable — like the wind.",
    energyMood: "When balanced, Vata brings creativity, enthusiasm, and mental agility. You may feel light, inspired, and quick-thinking.",
    digestionStress: "Vata influences irregular appetite and digestion. Under stress, you might feel anxious, scattered, or have trouble sleeping.",
    reassurance: "Your Vata patterns are not fixed — they shift with seasons, life phases, and how you care for yourself. What you notice today may be different tomorrow.",
    // BASIC tier content
    imbalanceSigns: "Anxiety or racing thoughts • Difficulty sleeping • Dry skin, hair, or joints • Cold hands and feet • Constipation or irregular digestion • Feeling scattered or overwhelmed",
    lifestyleSuggestions: {
      movement: "Gentle, grounding movement like slow yoga, walking, or tai chi. Avoid overly stimulating or exhausting exercise.",
      food: "Warm, moist, grounding foods. Cooked grains, soups, healthy oils. Avoid cold, dry, or raw foods when feeling imbalanced.",
      rhythm: "Regular daily routines are essential. Consistent sleep, meals, and rest times create stability."
    },
    cycleShifts: "During menstruation, Vata naturally rises — you may feel more sensitive, tired, or scattered. Extra warmth and rest are supportive.",
    stressShifts: "Under stress, Vata increases quickly. You might notice racing thoughts, insomnia, or digestive changes.",
    menopauseShifts: "During perimenopause and menopause, Vata often becomes dominant. Dryness, anxiety, and sleep disturbances are common Vata patterns.",
    // STANDARD tier content
    lifePhaseGuidance: {
      menstrual: "During your period, Vata is naturally elevated. Prioritise rest, warmth, and gentle nourishment. This is not the time for intense activity.",
      perimenopause: "As hormones shift, Vata often rises. You may notice dryness, anxiety, or irregular sleep. Grounding practices become essential.",
      menopause: "Vata tends to be dominant in menopause. Focus on warmth, oil massage (abhyanga), regular routines, and nervous system support.",
      postMenopause: "Supporting Vata through nourishing practices helps maintain vitality, bone health, and mental clarity."
    },
    emotionalPatterns: "Vata emotions are quick to arise and quick to pass. You may experience excitement and enthusiasm, but also anxiety and fear. The nervous system is sensitive.",
    seasonalInfluence: "Autumn and early winter are Vata seasons — cold, dry, windy. Extra grounding is needed during these months.",
    nervousSystemSupport: "Vata-dominant individuals benefit from nervous system regulation: slow breathing, meditation, warm baths, and oil massage.",
    // PREMIUM tier content
    practitionerInsights: "In my 30+ years of practice, I've seen how Vata women often push through exhaustion, disconnecting from their body's signals. The invitation is always to slow down before your body forces you to. Vata imbalance is the root of so many modern health challenges — but it responds beautifully to consistent, gentle care.",
    deeperPatterns: "Long-term Vata imbalance can affect bone density, hormonal health, and cognitive function. Early intervention through lifestyle is key. The goal is not to suppress Vata, but to nourish and stabilise it.",
    spiritualReflection: "Vata connects us to the unseen, to intuition and creativity. When grounded, Vata energy supports spiritual practice and inner listening. In Islamic tradition, the qualities of Vata — the movement of breath, the seeking of the soul — align with practices of dhikr and contemplation.",
    recordedGuidance: "Access guided meditations and teachings specifically for Vata support."
  },
  pitta: {
    name: "Pitta",
    element: "Fire & Water",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-200 dark:border-orange-800/50",
    qualities: "Hot, sharp, light, oily, liquid, spreading",
    simpleDesc: "Connected to digestion, focus, and transformation. Warm, sharp, and driven — like fire.",
    energyMood: "When balanced, Pitta brings clarity, confidence, and focus. You may feel warm, motivated, and capable.",
    digestionStress: "Pitta governs strong digestion but can cause inflammation or acidity when imbalanced. Under stress, irritability and frustration arise.",
    reassurance: "Your Pitta patterns respond well to cooling and calming practices. What feels intense now can soften with the right care.",
    imbalanceSigns: "Irritability or anger • Inflammation or skin issues • Acid reflux or heartburn • Overheating or excessive sweating • Perfectionism or being overly critical • Impatience with self or others",
    lifestyleSuggestions: {
      movement: "Cooling, moderate exercise. Swimming, walking in nature, or yoga without competitive intensity.",
      food: "Cooling, sweet, bitter foods. Fresh vegetables, coconut, cucumber. Avoid spicy, sour, or fermented foods when inflamed.",
      rhythm: "Balance work with rest. Avoid overcommitting. Schedule time for pleasure and relaxation."
    },
    cycleShifts: "Around ovulation and before menstruation, Pitta can rise — you may feel more driven but also more irritable.",
    stressShifts: "Under stress, Pitta becomes sharp and critical. You might push harder, overheat, or experience digestive issues.",
    menopauseShifts: "Hot flushes are a classic Pitta pattern. Cooling foods, calming practices, and avoiding overheating help during this transition.",
    lifePhaseGuidance: {
      menstrual: "Pitta can rise just before your period (PMS). Cooling, calming practices help — avoid intensity and competition.",
      perimenopause: "Hot flushes, night sweats, and irritability are Pitta patterns. Cooling foods and calming herbs support this transition.",
      menopause: "If hot flushes are prominent, focus on Pitta-calming practices. Avoid overheating, spicy foods, and excessive stress.",
      postMenopause: "Pitta tends to settle after menopause. Continue with balanced, anti-inflammatory practices."
    },
    emotionalPatterns: "Pitta emotions are intense and transformative. You may experience passion and determination, but also anger and frustration. The heart can feel on fire.",
    seasonalInfluence: "Summer is Pitta season — hot and intense. Avoid midday sun, favour cooling activities, and stay hydrated.",
    nervousSystemSupport: "Pitta benefits from practices that release heat: moon gazing, swimming, time in nature, and cooling breathwork.",
    practitionerInsights: "Pitta women are often the ones holding everything together — at home, at work, in community. The invitation is to soften, to let go of perfection, and to allow others to support you. True strength includes vulnerability.",
    deeperPatterns: "Long-term Pitta imbalance can affect the liver, skin, eyes, and heart. Inflammatory conditions often have a Pitta root. Cooling the internal fire is essential for long-term health.",
    spiritualReflection: "Pitta connects us to purpose, justice, and transformation. When balanced, Pitta energy fuels devotion and service. In Islamic tradition, the fire of Pitta can be channelled into the warmth of compassion and the light of seeking knowledge.",
    recordedGuidance: "Access guided meditations and teachings specifically for Pitta support."
  },
  kapha: {
    name: "Kapha",
    element: "Earth & Water",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
    borderColor: "border-green-200 dark:border-green-800/50",
    qualities: "Heavy, slow, cool, oily, smooth, stable",
    simpleDesc: "Connected to stability, nourishment, and calm. Grounding, steady, and nurturing — like the earth.",
    energyMood: "When balanced, Kapha brings strength, patience, and a loving nature. You may feel grounded, calm, and content.",
    digestionStress: "Kapha digestion is slow but steady. Under stress, you might feel heavy, sluggish, or emotionally stuck.",
    reassurance: "Your Kapha patterns provide stability and resilience. With gentle movement and stimulation, heaviness can lift.",
    imbalanceSigns: "Heaviness or lethargy • Weight gain or water retention • Congestion or mucus • Resistance to change • Low motivation • Emotional attachment or sadness",
    lifestyleSuggestions: {
      movement: "Stimulating, energising movement. Brisk walking, dancing, or dynamic yoga. Avoid too much sitting or sleeping.",
      food: "Light, warming, spicy foods. Vegetables, legumes, warming spices. Avoid heavy, cold, or oily foods.",
      rhythm: "Variety and stimulation help. Wake early, stay active, and embrace new experiences."
    },
    cycleShifts: "After menstruation, Kapha rebuilds — you may feel heavier or more tired. Gentle movement helps.",
    stressShifts: "Under stress, Kapha tends to withdraw or comfort-eat. Emotional heaviness can settle in.",
    menopauseShifts: "Weight gain and sluggishness are common Kapha patterns during menopause. Regular movement and lighter eating help.",
    lifePhaseGuidance: {
      menstrual: "After your period, Kapha rebuilds the body. Gentle, nourishing practices support recovery without creating heaviness.",
      perimenopause: "Weight gain and emotional heaviness may increase. Regular movement and connection with others help keep Kapha balanced.",
      menopause: "If weight gain or low energy are prominent, focus on Kapha-reducing practices. Stay active and embrace change.",
      postMenopause: "Kapha provides stability in later life. Maintain movement and mental stimulation to avoid stagnation."
    },
    emotionalPatterns: "Kapha emotions are deep and lasting. You may experience love and contentment, but also attachment and grief. The heart holds on.",
    seasonalInfluence: "Late winter and spring are Kapha seasons — cold and wet. Extra movement and warmth are needed during these months.",
    nervousSystemSupport: "Kapha benefits from practices that stimulate: invigorating breathwork, early rising, and social connection.",
    practitionerInsights: "Kapha women are the caretakers, the nurturers, the steady presence in their families and communities. The invitation is to also receive care, to prioritise your own needs, and to embrace change as growth rather than loss.",
    deeperPatterns: "Long-term Kapha imbalance can affect metabolism, respiratory health, and emotional wellbeing. Depression and obesity often have Kapha components. Movement and variety are medicine.",
    spiritualReflection: "Kapha connects us to devotion, love, and the enduring. When balanced, Kapha energy supports deep practice and faithful commitment. In Islamic tradition, the stability of Kapha aligns with sabr (patience) and the steadfast heart that remembers Allah in all circumstances.",
    recordedGuidance: "Access guided meditations and teachings specifically for Kapha support."
  }
};

// FREE tier content - Simple introduction
const FreeTierContent = ({ primaryDosha }: { primaryDosha?: string }) => (
  <div className="space-y-4">
    <div className="bg-wellness-lilac/10 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-wellness-lilac" />
        Beginning Your Dosha Journey
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Ayurveda is an ancient system of understanding yourself — not a set of rules to follow, 
        but a gentle way of noticing what your body and mind need at different times.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        The three doshas — <strong className="text-foreground">Vata</strong>, <strong className="text-foreground">Pitta</strong>, 
        and <strong className="text-foreground">Kapha</strong> — are simply natural patterns of energy. 
        Everyone has all three; they just show up differently in each of us.
      </p>
    </div>
    
    <div className="grid gap-3">
      {(["vata", "pitta", "kapha"] as const).map((dosha) => (
        <FreeDoshaCard 
          key={dosha}
          dosha={dosha}
          isHighlighted={primaryDosha === dosha}
        />
      ))}
    </div>
    
    <div className="bg-muted/30 rounded-xl p-4 text-center">
      <p className="text-sm italic text-muted-foreground">
        Nothing is fixed or permanent. Your balance changes as you move through life.
      </p>
    </div>
  </div>
);

const FreeDoshaCard = ({ dosha, isHighlighted }: { dosha: "vata" | "pitta" | "kapha"; isHighlighted: boolean }) => {
  const data = doshaData[dosha];
  const icons = {
    vata: <Wind className="h-5 w-5" />,
    pitta: <Flame className="h-5 w-5" />,
    kapha: <Mountain className="h-5 w-5" />
  };

  return (
    <Collapsible className={`bg-background border ${data.borderColor} rounded-xl overflow-hidden ${isHighlighted ? 'ring-2 ring-wellness-lilac' : ''}`}>
      <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${data.bg}`}>
              <span className={data.color}>{icons[dosha]}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">{data.name}</span>
              <span className="text-muted-foreground text-sm ml-2">— {data.element}</span>
              {isHighlighted && (
                <Badge variant="secondary" className="ml-2 bg-wellness-lilac/20 text-wellness-lilac border-0">
                  Your primary
                </Badge>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3 border-t border-border/20 pt-3">
          <p>{data.simpleDesc}</p>
          <div className="space-y-2">
            <p><strong className="text-foreground">Energy & Mood:</strong> {data.energyMood}</p>
            <p><strong className="text-foreground">Digestion & Stress:</strong> {data.digestionStress}</p>
          </div>
          <p className="italic text-xs pt-2">{data.reassurance}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// BASIC tier content - Signs of imbalance and lifestyle suggestions
const BasicTierContent = ({ primaryDosha }: { primaryDosha?: string }) => {
  const handleSaveInsight = async (doshaName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save insights");
        return;
      }
      
      // Save to localStorage for now (could be extended to database)
      const savedInsights = JSON.parse(localStorage.getItem('mumtaz_saved_dosha_insights') || '[]');
      if (!savedInsights.includes(doshaName)) {
        savedInsights.push(doshaName);
        localStorage.setItem('mumtaz_saved_dosha_insights', JSON.stringify(savedInsights));
        toast.success(`${doshaName} insights saved to your collection`);
      } else {
        toast.info(`${doshaName} insights already saved`);
      }
    } catch (error) {
      toast.error("Could not save insight");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-wellness-sage/10 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-wellness-sage" />
          Deeper Understanding
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Learn to recognise signs of imbalance in each dosha, and discover supportive 
          lifestyle practices for movement, food, and daily rhythm.
        </p>
      </div>
      
      {(["vata", "pitta", "kapha"] as const).map((dosha) => (
        <BasicDoshaCard 
          key={dosha}
          dosha={dosha}
          isHighlighted={primaryDosha === dosha}
          onSave={() => handleSaveInsight(doshaData[dosha].name)}
        />
      ))}
      
      <div className="bg-muted/30 rounded-xl p-4">
        <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          How Doshas Shift
        </h4>
        <p className="text-sm text-muted-foreground">
          Your dosha patterns naturally shift during your menstrual cycle, times of stress, 
          and as you move through life phases like perimenopause and menopause. 
          Understanding these shifts helps you adapt your self-care.
        </p>
      </div>
    </div>
  );
};

const BasicDoshaCard = ({ 
  dosha, 
  isHighlighted,
  onSave 
}: { 
  dosha: "vata" | "pitta" | "kapha"; 
  isHighlighted: boolean;
  onSave: () => void;
}) => {
  const data = doshaData[dosha];
  const icons = {
    vata: <Wind className="h-5 w-5" />,
    pitta: <Flame className="h-5 w-5" />,
    kapha: <Mountain className="h-5 w-5" />
  };

  return (
    <Collapsible className={`bg-background border ${data.borderColor} rounded-xl overflow-hidden ${isHighlighted ? 'ring-2 ring-wellness-lilac' : ''}`}>
      <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${data.bg}`}>
              <span className={data.color}>{icons[dosha]}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">{data.name}</span>
              {isHighlighted && (
                <Badge variant="secondary" className="ml-2 bg-wellness-lilac/20 text-wellness-lilac border-0">
                  Your primary
                </Badge>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="px-4 pb-4 text-sm space-y-4 border-t border-border/20 pt-3">
          {/* Signs of imbalance */}
          <div>
            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Signs You May Be Out of Balance
            </h5>
            <p className="text-muted-foreground text-xs leading-relaxed">{data.imbalanceSigns}</p>
          </div>
          
          {/* Lifestyle suggestions */}
          <div className="space-y-2">
            <h5 className="font-medium text-foreground">Supportive Lifestyle</h5>
            <div className="grid gap-2">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs"><strong className="text-foreground">Movement:</strong> {data.lifestyleSuggestions.movement}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs"><strong className="text-foreground">Food qualities:</strong> {data.lifestyleSuggestions.food}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs"><strong className="text-foreground">Daily rhythm:</strong> {data.lifestyleSuggestions.rhythm}</p>
              </div>
            </div>
          </div>
          
          {/* Cycle and stress shifts */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">During your cycle:</strong> {data.cycleShifts}</p>
            <p><strong className="text-foreground">Under stress:</strong> {data.stressShifts}</p>
            <p><strong className="text-foreground">In menopause:</strong> {data.menopauseShifts}</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-wellness-sage/30 hover:bg-wellness-sage/10"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            <Heart className="h-4 w-4 mr-2" />
            Save to Favourites
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// STANDARD tier content - Life phase combinations and personalised recommendations
const StandardTierContent = ({ primaryDosha, lifeStage }: { primaryDosha?: string; lifeStage?: string }) => {
  const navigate = useNavigate();
  
  const getLifePhaseLabel = (stage?: string) => {
    const labels: Record<string, string> = {
      menstrual_cycle: "Menstrual Cycle",
      perimenopause: "Perimenopause",
      menopause: "Menopause",
      post_menopause: "Post-Menopause",
      pregnancy: "Pregnancy",
      postpartum: "Postpartum"
    };
    return stage ? labels[stage] || stage : "your current phase";
  };

  return (
    <div className="space-y-4">
      <div className="bg-wellness-lilac/10 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-wellness-lilac" />
          Personalised Guidance
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Explore how your dosha patterns interact with your life phase, emotions, and the seasons. 
          Receive tailored recommendations across yoga, mobility, nutrition, and spirituality.
        </p>
        {primaryDosha && lifeStage && (
          <Badge className="bg-wellness-lilac/20 text-wellness-lilac border-0">
            {doshaData[primaryDosha as keyof typeof doshaData]?.name || primaryDosha} in {getLifePhaseLabel(lifeStage)}
          </Badge>
        )}
      </div>
      
      {/* Dosha + Life Phase Combinations */}
      {primaryDosha && (
        <Card className="border-wellness-lilac/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-wellness-lilac" />
              Your Dosha Across Life Phases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(doshaData[primaryDosha as keyof typeof doshaData]?.lifePhaseGuidance || {}).map(([phase, guidance]) => (
              <Collapsible key={phase} className="bg-muted/30 rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-sm capitalize">{phase.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground">{guidance}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Emotional & Nervous System Patterns */}
      <Collapsible className="bg-background border border-border/30 rounded-xl overflow-hidden">
        <CollapsibleTrigger className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
          <span className="font-medium text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Emotional & Nervous System Patterns
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-accordion-down">
          <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3">
            {(["vata", "pitta", "kapha"] as const).map((dosha) => (
              <div key={dosha} className={`p-3 rounded-lg ${doshaData[dosha].bg}`}>
                <p className="font-medium text-foreground mb-1">{doshaData[dosha].name}</p>
                <p className="text-xs">{doshaData[dosha].emotionalPatterns}</p>
                <p className="text-xs mt-2 italic">{doshaData[dosha].nervousSystemSupport}</p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Seasonal Influences */}
      <Collapsible className="bg-background border border-border/30 rounded-xl overflow-hidden">
        <CollapsibleTrigger className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
          <span className="font-medium text-foreground flex items-center gap-2">
            <Sun className="h-4 w-4 text-orange-500" />
            <Moon className="h-4 w-4 text-blue-500" />
            <Leaf className="h-4 w-4 text-green-600" />
            Seasonal & Lifestyle Influences
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-accordion-down">
          <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3">
            <p><strong className="text-foreground">Spring (Kapha season):</strong> Light, warming foods and energising movement help counter heaviness.</p>
            <p><strong className="text-foreground">Summer (Pitta season):</strong> Cooling foods, time in nature, and calming practices prevent overheating.</p>
            <p><strong className="text-foreground">Autumn/Winter (Vata season):</strong> Warm, grounding foods and gentle routines support stability.</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Personalised Recommendations CTA */}
      <Card className="border-wellness-sage/30 bg-wellness-sage/5">
        <CardContent className="p-4">
          <h4 className="font-medium text-foreground mb-2">Explore Practices for You</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Based on your {primaryDosha ? doshaData[primaryDosha as keyof typeof doshaData]?.name : "dosha"} patterns and 
            {lifeStage ? ` ${getLifePhaseLabel(lifeStage)}` : " current phase"}.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/content-library?category=yoga&dosha=${primaryDosha || 'all'}`)}
            >
              Yoga
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/content-library?category=mobility&dosha=${primaryDosha || 'all'}`)}
            >
              Mobility
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/content-library?category=nutrition&dosha=${primaryDosha || 'all'}`)}
            >
              Nutrition
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/content-library?category=spiritual&dosha=${primaryDosha || 'all'}`)}
            >
              Spirituality
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// PREMIUM tier content - Practitioner-led insights
const PremiumTierContent = ({ primaryDosha }: { primaryDosha?: string }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20 rounded-xl p-5 space-y-3 border border-wellness-lilac/20">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-mumtaz-plum" />
          Practitioner-Led Wisdom
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In-depth dosha education from Mumtaz — drawing on over 30 years of holistic practice, 
          clinical experience, and lived wisdom as an Ayurvedic Practitioner and Yoga Teacher Trainer.
        </p>
      </div>
      
      {/* Practitioner Insights for each dosha */}
      {(["vata", "pitta", "kapha"] as const).map((dosha) => (
        <PremiumDoshaCard 
          key={dosha}
          dosha={dosha}
          isHighlighted={primaryDosha === dosha}
        />
      ))}
      
      {/* Recorded Guidance */}
      <div className="grid gap-3">
        <Card className="border-wellness-lilac/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-wellness-lilac/20">
              <Video className="h-5 w-5 text-wellness-lilac" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Video Teachings</h4>
              <p className="text-xs text-muted-foreground">In-depth dosha education from the founder</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/content-library?tier=premium&type=video')}>
              Watch
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-wellness-sage/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-wellness-sage/20">
              <Headphones className="h-5 w-5 text-wellness-sage" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Audio Guidance</h4>
              <p className="text-xs text-muted-foreground">Meditations and teachings for your dosha</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/content-library?tier=premium&type=audio')}>
              Listen
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Live Group Session */}
      <Card className="border-mumtaz-plum/30 bg-mumtaz-plum/5">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-mumtaz-plum/20">
              <Users className="h-5 w-5 text-mumtaz-plum" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">1 Live Group Session Monthly</h4>
              <p className="text-xs text-muted-foreground">Connect with Mumtaz and the community</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-mumtaz-plum/30 hover:bg-mumtaz-plum/10"
            onClick={() => navigate("/bookings")}
          >
            View Upcoming Sessions
          </Button>
        </CardContent>
      </Card>
      
      {/* One-to-one care disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Important:</strong> This app offers general wellness education and does not replace 
          one-to-one Ayurvedic consultations. For personalised health guidance, 
          consider booking a private session with Mumtaz.
        </p>
        <Button 
          variant="link" 
          size="sm" 
          className="text-amber-700 dark:text-amber-300 p-0 h-auto mt-2"
          onClick={() => navigate("/bookings")}
        >
          Book a Private Consultation →
        </Button>
      </div>
    </div>
  );
};

const PremiumDoshaCard = ({ dosha, isHighlighted }: { dosha: "vata" | "pitta" | "kapha"; isHighlighted: boolean }) => {
  const data = doshaData[dosha];
  const icons = {
    vata: <Wind className="h-5 w-5" />,
    pitta: <Flame className="h-5 w-5" />,
    kapha: <Mountain className="h-5 w-5" />
  };

  return (
    <Collapsible className={`bg-background border ${data.borderColor} rounded-xl overflow-hidden ${isHighlighted ? 'ring-2 ring-mumtaz-plum' : ''}`}>
      <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${data.bg}`}>
              <span className={data.color}>{icons[dosha]}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">{data.name}</span>
              <span className="text-muted-foreground text-sm ml-2">— Deep Insights</span>
              {isHighlighted && (
                <Badge variant="secondary" className="ml-2 bg-mumtaz-plum/20 text-mumtaz-plum border-0">
                  Your primary
                </Badge>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="px-4 pb-4 text-sm space-y-4 border-t border-border/20 pt-3">
          {/* Practitioner insights */}
          <div className="bg-mumtaz-plum/5 rounded-lg p-4 border border-mumtaz-plum/20">
            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-mumtaz-plum" />
              From Mumtaz's Practice
            </h5>
            <p className="text-muted-foreground text-xs italic leading-relaxed">"{data.practitionerInsights}"</p>
          </div>
          
          {/* Deeper patterns */}
          <div>
            <h5 className="font-medium text-foreground mb-2">Long-term Considerations</h5>
            <p className="text-muted-foreground text-xs">{data.deeperPatterns}</p>
          </div>
          
          {/* Spiritual reflections */}
          <div className="bg-wellness-sage/5 rounded-lg p-4 border border-wellness-sage/20">
            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-wellness-sage" />
              Spiritual Reflection
            </h5>
            <p className="text-muted-foreground text-xs">{data.spiritualReflection}</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Locked content preview
const LockedContentPreview = ({ 
  tier, 
  currentTier,
  title,
  description,
  features
}: { 
  tier: SubscriptionTier;
  currentTier: SubscriptionTier;
  title: string;
  description: string;
  features?: string[];
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/30 bg-muted/10">
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent z-10" />
      <div className="p-5 opacity-40">
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        {features && (
          <ul className="mt-3 space-y-1">
            {features.map((feature, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4">
        <div className="p-3 rounded-full bg-wellness-lilac/10 mb-3">
          <Lock className="h-5 w-5 text-wellness-lilac" />
        </div>
        <p className="text-sm font-medium text-foreground text-center">
          Unlock more support
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1 max-w-[200px]">
          Available with {getTierLabel(tier)} plan
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 border-wellness-lilac/30 hover:bg-wellness-lilac/10"
          onClick={() => navigate("/settings")}
        >
          Explore when ready
        </Button>
      </div>
    </div>
  );
};

export function TieredDoshaContent({ userTier, primaryDosha, secondaryDosha, lifeStage }: TieredDoshaContentProps) {
  return (
    <div className="space-y-6">
      {/* FREE tier - Always visible */}
      <FreeTierContent primaryDosha={primaryDosha} />
      
      {/* BASIC tier */}
      {isContentAvailable("basic", userTier) ? (
        <BasicTierContent primaryDosha={primaryDosha} />
      ) : (
        <LockedContentPreview 
          tier="basic"
          currentTier={userTier}
          title="Deeper Understanding"
          description="Signs of imbalance and supportive lifestyle practices."
          features={[
            "Common signs of imbalance for each dosha",
            "Movement, food, and daily rhythm suggestions",
            "How doshas shift during stress and hormonal changes",
            "Save insights to your favourites"
          ]}
        />
      )}
      
      {/* STANDARD tier */}
      {isContentAvailable("standard", userTier) ? (
        <StandardTierContent primaryDosha={primaryDosha} lifeStage={lifeStage} />
      ) : (
        <LockedContentPreview 
          tier="standard"
          currentTier={userTier}
          title="Personalised Guidance"
          description="Dosha + life phase combinations and tailored recommendations."
          features={[
            "Your dosha in perimenopause, menopause, and more",
            "Emotional and nervous system patterns",
            "Seasonal and lifestyle influences",
            "Personalised yoga, nutrition, and spirituality"
          ]}
        />
      )}
      
      {/* PREMIUM tier */}
      {isContentAvailable("premium", userTier) ? (
        <PremiumTierContent primaryDosha={primaryDosha} />
      ) : (
        <LockedContentPreview 
          tier="premium"
          currentTier={userTier}
          title="Practitioner-Led Wisdom"
          description="In-depth guidance from Mumtaz's 30+ years of practice."
          features={[
            "Practitioner insights in Mumtaz's voice",
            "Deeper pattern awareness and long-term considerations",
            "Spiritual reflections (universal + Islamic)",
            "Video and audio teachings",
            "1 live group session per month"
          ]}
        />
      )}
      
      {/* Practitioner relationship messaging - App as companion, not replacement */}
      <Card className="border-wellness-sage/30 bg-wellness-sage/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-wellness-sage/20 flex-shrink-0">
              <Shield className="h-4 w-4 text-wellness-sage" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Your wellness companion — not a replacement for care
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This app offers educational content and supportive guidance to help you understand your body. 
                It is designed to complement — not replace — qualified practitioners, medical professionals, or personalised treatment plans.
              </p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-wellness-lilac/10 border border-wellness-lilac/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Ready for deeper support?</strong> For personalised Ayurvedic consultations, 
              tailored herbal remedies, workshops, retreats, or teacher training — work directly with Mumtaz as your practitioner.
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground italic text-center">
            Guided by 30+ years of holistic expertise. Human wisdom, gently delivered through digital care.
          </p>
          
          <p className="text-xs text-center text-muted-foreground">
            This is not medical advice. Please seek doctor clearance when needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default TieredDoshaContent;
