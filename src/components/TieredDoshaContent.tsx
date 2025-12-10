import { useState } from "react";
import { Wind, Flame, Mountain, Lock, Sparkles, Heart, BookOpen, Video, Headphones, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SubscriptionTier = "free" | "basic" | "standard" | "premium";

interface TieredDoshaContentProps {
  userTier: SubscriptionTier;
  primaryDosha?: string;
  secondaryDosha?: string;
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

// Free tier content - simple introduction
const FreeTierContent = () => (
  <div className="space-y-4">
    <div className="bg-wellness-lilac/10 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-wellness-lilac" />
        Beginning Your Journey
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
      <p className="text-sm italic text-muted-foreground pt-2">
        Nothing is fixed or permanent. Your balance changes as you move through life.
      </p>
    </div>
    
    <div className="grid gap-3">
      <DoshaCard 
        dosha="vata" 
        icon={<Wind className="h-5 w-5" />}
        simple
      />
      <DoshaCard 
        dosha="pitta" 
        icon={<Flame className="h-5 w-5" />}
        simple
      />
      <DoshaCard 
        dosha="kapha" 
        icon={<Mountain className="h-5 w-5" />}
        simple
      />
    </div>
  </div>
);

// Basic tier content - deeper explanations
const BasicTierContent = ({ primaryDosha }: { primaryDosha?: string }) => (
  <div className="space-y-4">
    <div className="bg-wellness-sage/10 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-wellness-sage" />
        Understanding Your Constitution
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your dosha influences how you experience energy, digestion, rest, and emotions. 
        Understanding these patterns can help you make choices that feel supportive.
      </p>
    </div>
    
    <div className="space-y-3">
      <DoshaCard 
        dosha="vata" 
        icon={<Wind className="h-5 w-5" />}
        expanded
        highlighted={primaryDosha === "vata"}
      />
      <DoshaCard 
        dosha="pitta" 
        icon={<Flame className="h-5 w-5" />}
        expanded
        highlighted={primaryDosha === "pitta"}
      />
      <DoshaCard 
        dosha="kapha" 
        icon={<Mountain className="h-5 w-5" />}
        expanded
        highlighted={primaryDosha === "kapha"}
      />
    </div>
    
    {/* Practical everyday suggestions */}
    <div className="bg-muted/30 rounded-xl p-5 space-y-3">
      <h4 className="font-medium text-foreground">Everyday Support</h4>
      <ul className="text-sm text-muted-foreground space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-wellness-sage">•</span>
          <span><strong className="text-foreground">Movement:</strong> Gentle, rhythmic movement supports all doshas — find what feels good for you today.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-wellness-sage">•</span>
          <span><strong className="text-foreground">Food:</strong> Warm, nourishing meals support digestion and calm the nervous system.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-wellness-sage">•</span>
          <span><strong className="text-foreground">Routine:</strong> Simple daily rhythms create stability and reduce overwhelm.</span>
        </li>
      </ul>
    </div>
  </div>
);

// Standard tier content - lifestyle and seasonal guidance
const StandardTierContent = ({ primaryDosha, lifeStage }: { primaryDosha?: string; lifeStage?: string }) => (
  <div className="space-y-4">
    <div className="bg-wellness-lilac/10 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Heart className="h-5 w-5 text-wellness-lilac" />
        Personalised Guidance
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your dosha patterns can shift during stress, hormonal changes, perimenopause, menopause, or recovery. 
        Understanding these shifts helps you adapt your self-care.
      </p>
    </div>
    
    {/* Seasonal Guidance */}
    <Collapsible className="bg-background border border-border/30 rounded-xl overflow-hidden">
      <CollapsibleTrigger className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
        <span className="font-medium text-foreground">Seasonal Balance</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3">
          <p><strong className="text-foreground">Spring (Kapha season):</strong> Light, warming foods and energising movement help counter heaviness.</p>
          <p><strong className="text-foreground">Summer (Pitta season):</strong> Cooling foods, time in nature, and calming practices prevent overheating.</p>
          <p><strong className="text-foreground">Autumn/Winter (Vata season):</strong> Warm, grounding foods and gentle routines support stability.</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
    
    {/* Life Stage Shifts */}
    <Collapsible className="bg-background border border-border/30 rounded-xl overflow-hidden">
      <CollapsibleTrigger className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
        <span className="font-medium text-foreground">How Doshas Shift Through Life</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3">
          <p><strong className="text-foreground">During menstruation:</strong> Vata naturally increases — rest and warmth are especially supportive.</p>
          <p><strong className="text-foreground">During pregnancy:</strong> All doshas can fluctuate — gentle, adaptable practices work best.</p>
          <p><strong className="text-foreground">Perimenopause & Menopause:</strong> Vata often rises as hormones shift — grounding becomes essential.</p>
          <p><strong className="text-foreground">Post-menopause:</strong> Supporting Vata through warmth, routine, and nourishment helps maintain vitality.</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
    
    {/* Stress Response */}
    <Collapsible className="bg-background border border-border/30 rounded-xl overflow-hidden">
      <CollapsibleTrigger className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors">
        <span className="font-medium text-foreground">Managing Stress by Dosha</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3">
          <p><strong className="text-foreground">Vata stress response:</strong> Anxiety, racing thoughts, difficulty sleeping → grounding, warmth, routine</p>
          <p><strong className="text-foreground">Pitta stress response:</strong> Irritability, frustration, inflammation → cooling, calming, time in nature</p>
          <p><strong className="text-foreground">Kapha stress response:</strong> Withdrawal, heaviness, emotional eating → gentle movement, stimulation, connection</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
);

// Premium tier content - in-depth practitioner-led education
const PremiumTierContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20 rounded-xl p-5 space-y-3 border border-wellness-lilac/20">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-mumtaz-plum" />
          Expert-Led Learning
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In-depth dosha education from Mumtaz — drawing on over 30 years of holistic practice, 
          clinical experience, and lived wisdom as an Ayurvedic Practitioner and Yoga Teacher Trainer.
        </p>
      </div>
      
      {/* Video Content */}
      <div className="bg-background border border-border/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-wellness-lilac/20">
            <Video className="h-5 w-5 text-wellness-lilac" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Video Teachings</h4>
            <p className="text-xs text-muted-foreground">In-depth dosha education from the founder</p>
          </div>
        </div>
      </div>
      
      {/* Audio Content */}
      <div className="bg-background border border-border/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-wellness-sage/20">
            <Headphones className="h-5 w-5 text-wellness-sage" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Audio Guidance</h4>
            <p className="text-xs text-muted-foreground">Meditations and teachings for your dosha</p>
          </div>
        </div>
      </div>
      
      {/* Direct Work Invitation */}
      <div className="bg-mumtaz-plum/10 rounded-xl p-5 space-y-3 border border-mumtaz-plum/20">
        <h4 className="font-medium text-foreground">Work Directly with Mumtaz</h4>
        <p className="text-sm text-muted-foreground">
          Ready for deeper, personalised support? Explore one-to-one consultations, 
          workshops, retreats, and teacher training opportunities.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/bookings")}
          className="border-mumtaz-plum/30 hover:bg-mumtaz-plum/10 text-foreground"
        >
          View Services & Bookings
        </Button>
      </div>
    </div>
  );
};

// Individual dosha card component
const DoshaCard = ({ 
  dosha, 
  icon, 
  simple = false, 
  expanded = false,
  highlighted = false 
}: { 
  dosha: "vata" | "pitta" | "kapha";
  icon: React.ReactNode;
  simple?: boolean;
  expanded?: boolean;
  highlighted?: boolean;
}) => {
  const doshaData = {
    vata: {
      name: "Vata",
      element: "Air & Space",
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      simpleDesc: "Connected to movement, creativity, and the nervous system. Light, quick, and changeable.",
      expandedDesc: "Vata governs all movement in body and mind — from breathing to nerve impulses to thoughts. When balanced, Vata brings creativity, flexibility, and vitality.",
      balanced: "Creative, enthusiastic, flexible, quick-thinking, joyful, good circulation",
      imbalanced: "Anxious, scattered, difficulty sleeping, dry skin, cold hands/feet, constipation",
      support: "Warm, grounding foods • Regular routines • Gentle yoga • Warm baths • Rest and stillness"
    },
    pitta: {
      name: "Pitta",
      element: "Fire & Water",
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      simpleDesc: "Connected to digestion, focus, and transformation. Warm, sharp, and driven.",
      expandedDesc: "Pitta governs digestion, metabolism, and how we process experiences. When balanced, Pitta brings clarity, confidence, and strong digestion.",
      balanced: "Focused, confident, good digestion, warm, natural leaders, sharp intellect",
      imbalanced: "Irritable, inflammation, heartburn, overheating, impatient, critical",
      support: "Cooling foods • Time in nature • Swimming • Avoiding excess heat • Calming breathwork"
    },
    kapha: {
      name: "Kapha",
      element: "Earth & Water",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
      simpleDesc: "Connected to stability, nourishment, and calm. Grounding, steady, and nurturing.",
      expandedDesc: "Kapha provides structure, stability, and lubrication in the body. When balanced, Kapha brings strength, endurance, and a loving nature.",
      balanced: "Calm, loving, strong, steady, excellent memory, patient, nurturing",
      imbalanced: "Sluggish, heavy, congestion, resistant to change, low motivation, attachment",
      support: "Light, warming foods • Regular movement • Stimulating activities • Variety in routine"
    }
  };

  const data = doshaData[dosha];

  if (simple) {
    return (
      <div className={`p-4 rounded-xl border border-border/30 ${highlighted ? 'ring-2 ring-wellness-lilac' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${data.bg}`}>
            <span className={data.color}>{icon}</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">{data.name}</span>
            <span className="text-muted-foreground text-sm ml-2">— {data.element}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{data.simpleDesc}</p>
      </div>
    );
  }

  return (
    <Collapsible className={`bg-background border border-border/30 rounded-xl overflow-hidden ${highlighted ? 'ring-2 ring-wellness-lilac' : ''}`}>
      <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${data.bg}`}>
              <span className={data.color}>{icon}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">{data.name}</span>
              <span className="text-muted-foreground text-sm ml-2">— {data.element}</span>
              {highlighted && <span className="ml-2 text-xs bg-wellness-lilac/20 text-wellness-lilac px-2 py-0.5 rounded-full">Your primary</span>}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{expanded ? data.expandedDesc : data.simpleDesc}</p>
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-accordion-down">
        <div className="px-4 pb-4 text-sm text-muted-foreground space-y-2 border-t border-border/20 pt-3">
          <p><strong className="text-foreground">When balanced:</strong> {data.balanced}</p>
          <p><strong className="text-foreground">When out of balance:</strong> {data.imbalanced}</p>
          <p><strong className="text-foreground">Supportive practices:</strong> {data.support}</p>
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
  description 
}: { 
  tier: SubscriptionTier;
  currentTier: SubscriptionTier;
  title: string;
  description: string;
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/30 bg-muted/20">
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-10" />
      <div className="p-5 opacity-50">
        <h4 className="font-medium text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4">
        <div className="p-3 rounded-full bg-wellness-lilac/10 mb-3">
          <Lock className="h-5 w-5 text-wellness-lilac" />
        </div>
        <p className="text-sm font-medium text-foreground text-center">
          Unlock deeper insight
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
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

export function TieredDoshaContent({ userTier, primaryDosha, secondaryDosha }: TieredDoshaContentProps) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      {/* Always show free tier content */}
      <FreeTierContent />
      
      {/* Basic tier content */}
      {isContentAvailable("basic", userTier) ? (
        <BasicTierContent primaryDosha={primaryDosha} />
      ) : (
        <LockedContentPreview 
          tier="basic"
          currentTier={userTier}
          title="Understanding Your Constitution"
          description="Deeper explanations of how doshas influence your energy, digestion, rest, and emotions."
        />
      )}
      
      {/* Standard tier content */}
      {isContentAvailable("standard", userTier) ? (
        <StandardTierContent primaryDosha={primaryDosha} />
      ) : (
        <LockedContentPreview 
          tier="standard"
          currentTier={userTier}
          title="Personalised Lifestyle Guidance"
          description="Seasonal guidance and how dosha patterns shift during stress, hormones, and life transitions."
        />
      )}
      
      {/* Premium tier content */}
      {isContentAvailable("premium", userTier) ? (
        <PremiumTierContent />
      ) : (
        <LockedContentPreview 
          tier="premium"
          currentTier={userTier}
          title="Expert-Led Education"
          description="In-depth video and audio teachings from Mumtaz, plus invitations to work directly with the practitioner."
        />
      )}
      
      {/* Practitioner relationship messaging */}
      <Card className="border-wellness-sage/30 bg-wellness-sage/5">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">This app doesn't replace personal guidance.</strong> It introduces you to a way of understanding yourself — and invites you to learn more with expert support when you're ready.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Knowledge builds over time — there is no rush.
          </p>
        </CardContent>
      </Card>
      
      {/* Tagline */}
      <p className="text-center text-sm text-muted-foreground italic">
        Guided by experience. Supported by technology.
      </p>
    </div>
  );
}

export default TieredDoshaContent;
