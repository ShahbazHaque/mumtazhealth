import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Heart, Moon, Baby, Flame, Wind, Mountain, Info, HelpCircle, Activity, ArrowLeft, ArrowRight, Leaf, Sun, BookOpen, Users, Shield, Compass } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DoshaAssessment from "@/components/DoshaAssessment";
import { Logo } from "@/components/Logo";

type OnboardingStep = 
  | "intro1" | "intro2" | "intro3" | "intro4" | "intro5" 
  | "intro6" | "intro7" | "intro8" | "intro9" | "intro10" | "intro11"
  | "welcome" | "lifeStage" | "cycle" | "dosha" | "doshaResults" 
  | "spiritual" | "pregnancy" | "preferences" | "complete";

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
      <span className="text-sm font-medium text-primary">{Math.round((currentStep / totalSteps) * 100)}%</span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-wellness-lilac to-wellness-sage transition-all duration-500 ease-out"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);

const IntroScreen = ({ 
  icon, 
  title, 
  children, 
  onNext, 
  onBack,
  onSkip,
  showBack = true,
  nextLabel = "Continue",
  animationKey
}: { 
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  showBack?: boolean;
  nextLabel?: string;
  animationKey?: string;
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
    <div 
      key={animationKey}
      className="w-full max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500"
    >
      <Card className="border-none shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-4 pt-10">
          {onSkip && (
            <div className="absolute top-4 right-4">
              <Button 
                variant="ghost" 
                onClick={onSkip} 
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Skip to Profile Setup
              </Button>
            </div>
          )}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20 transition-transform duration-300 hover:scale-105">
              {icon}
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-mumtaz-plum leading-tight font-accent">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          <div className="text-center space-y-4 text-muted-foreground leading-relaxed">
            {children}
          </div>
          <div className="flex justify-between pt-6">
            {showBack && onBack ? (
              <Button variant="ghost" onClick={onBack} className="gap-2 transition-all duration-200 hover:-translate-x-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={onNext} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 hover:translate-x-1">
              {nextLabel} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("intro1");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const getStepInfo = () => {
    const stepMap: Record<OnboardingStep, number> = {
      intro1: 0, intro2: 0, intro3: 0, intro4: 0, intro5: 0,
      intro6: 0, intro7: 0, intro8: 0, intro9: 0, intro10: 0, intro11: 0,
      welcome: 1,
      lifeStage: 2,
      cycle: 3,
      dosha: 4,
      doshaResults: 5,
      spiritual: 6,
      pregnancy: 7,
      preferences: 8,
      complete: 9,
    };
    return { current: stepMap[step], total: 9 };
  };

  // Profile data
  const [lifeStage, setLifeStage] = useState("");
  const [primaryDosha, setPrimaryDosha] = useState("");
  const [secondaryDosha, setSecondaryDosha] = useState("");
  const [spiritualPreference, setSpiritualPreference] = useState("both");
  const [pregnancyStatus, setPregnancyStatus] = useState("not_pregnant");
  const [dueDate, setDueDate] = useState("");
  const [yogaStyle, setYogaStyle] = useState("");
  const [cyclePhase, setCyclePhase] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [menstrualCondition, setMenstrualCondition] = useState("");

  const handleDoshaComplete = (primary: string, secondary: string) => {
    setPrimaryDosha(primary);
    setSecondaryDosha(secondary);
    setStep("doshaResults");
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      // Update username in profiles table
      if (userName.trim()) {
        await supabase
          .from("profiles")
          .update({ username: userName.trim() })
          .eq("user_id", user.id);
      }

      // Calculate trimester if pregnant
      let currentTrimester = null;
      if (pregnancyStatus === "pregnant" && dueDate) {
        const due = new Date(dueDate);
        const today = new Date();
        const weeksPregnant = Math.floor((40 - (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)));
        if (weeksPregnant <= 13) currentTrimester = 1;
        else if (weeksPregnant <= 27) currentTrimester = 2;
        else currentTrimester = 3;
      }

      const { error } = await supabase.from("user_wellness_profiles").upsert({
        user_id: user.id,
        life_stage: lifeStage,
        primary_dosha: primaryDosha,
        secondary_dosha: secondaryDosha,
        spiritual_preference: spiritualPreference,
        pregnancy_status: pregnancyStatus,
        due_date: pregnancyStatus === "pregnant" ? dueDate : null,
        current_trimester: currentTrimester,
        preferred_yoga_style: yogaStyle,
        onboarding_completed: true,
        dosha_assessment_date: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) throw error;

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: { 
            userEmail: user.email,
            userName: userName.trim() || undefined 
          }
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't block onboarding if email fails
      }

      toast.success("Your wellness profile is complete! Let's start tracking your journey.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const skipToProfile = () => setStep("welcome");

  // Intro Screen 1: Welcome
  if (step === "intro1") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div key="intro1" className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-card/95 backdrop-blur-sm relative">
            <div className="absolute top-4 right-4">
              <Button 
                variant="ghost" 
                onClick={skipToProfile} 
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Skip to Profile Setup
              </Button>
            </div>
            <CardHeader className="text-center space-y-8 pb-6 pt-12">
              <Logo size="xl" className="mx-auto" />
              <CardTitle className="text-3xl md:text-4xl font-bold text-mumtaz-plum leading-tight font-accent">
                Welcome to Mumtaz Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pb-12">
              <p className="text-center text-lg text-muted-foreground leading-relaxed">
                A gentle space created to support women through every phase of life — with care, compassion, and wisdom.
              </p>
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setStep("intro2")} 
                  size="lg"
                  className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8 transition-all duration-200 hover:translate-x-1"
                >
                  Begin <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Intro Screen 2: What This App Is
  if (step === "intro2") {
    return (
      <IntroScreen
        animationKey="intro2"
        icon={<Heart className="h-10 w-10 text-wellness-lilac" />}
        title="A holistic approach to women's wellbeing"
        onNext={() => setStep("intro3")}
        onBack={() => setStep("intro1")}
        onSkip={skipToProfile}
      >
        <p className="text-lg">This app brings together</p>
        <p className="text-xl font-medium text-foreground">
          Yoga · Ayurveda · Nutrition · Spiritual Support
        </p>
        <p>
          to help you understand your body, support your health, and move through life with more ease and confidence.
        </p>
        <p className="pt-4 italic">
          Everything here is designed to feel supportive, not overwhelming.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 3: Why Ayurveda
  if (step === "intro3") {
    return (
      <IntroScreen
        animationKey="intro3"
        icon={<Leaf className="h-10 w-10 text-wellness-sage" />}
        title="Your body is unique — and your care should be too"
        onNext={() => setStep("intro4")}
        onBack={() => setStep("intro2")}
        onSkip={skipToProfile}
      >
        <p>
          Ayurveda helps you understand your natural constitution, or <strong className="text-foreground">dosha</strong> (Vata, Pitta, Kapha).
        </p>
        <p>This awareness helps guide:</p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>movement that suits your body</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>food that supports you</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>routines that bring balance</span>
          </li>
        </ul>
        <p className="pt-4 italic">
          There is no "one-size-fits-all" here — only personalised support.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 4: Yoga, Movement & Care
  if (step === "intro4") {
    return (
      <IntroScreen
        animationKey="intro4"
        icon={<Activity className="h-10 w-10 text-wellness-lilac" />}
        title="Movement adapted for every stage of womanhood"
        onNext={() => setStep("intro5")}
        onBack={() => setStep("intro3")}
        onSkip={skipToProfile}
      >
        <p>
          Yoga and movement in this app are gentle, accessible, and adaptable.
        </p>
        <p>Whether you are:</p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>menstruating</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>pregnant or post-pregnancy</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>navigating menopause</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>managing arthritis or mobility challenges</span>
          </li>
        </ul>
        <p className="pt-4 italic">
          You will always find options that meet you where you are.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 5: Nutrition & Daily Support
  if (step === "intro5") {
    return (
      <IntroScreen
        animationKey="intro5"
        icon={<Sun className="h-10 w-10 text-wellness-sage" />}
        title="Nourishment for real life"
        onNext={() => setStep("intro6")}
        onBack={() => setStep("intro4")}
        onSkip={skipToProfile}
      >
        <p>Nutrition guidance here is:</p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>simple</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>nourishing</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>culturally sensitive</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>easy to prepare</span>
          </li>
        </ul>
        <p className="pt-4">
          It's designed to support digestion, strength, hormones, and long-term health — without pressure or perfection.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 6: Spiritual & Emotional Wellbeing
  if (step === "intro6") {
    return (
      <IntroScreen
        animationKey="intro6"
        icon={<Moon className="h-10 w-10 text-wellness-lilac" />}
        title="Care for the whole of you"
        onNext={() => setStep("intro7")}
        onBack={() => setStep("intro5")}
        onSkip={skipToProfile}
      >
        <p>
          Alongside the body, this app supports emotional and spiritual wellbeing through:
        </p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>breathwork & deep relaxation</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>reflection & journaling</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>grounding & mindfulness practices</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>moments of stillness & gratitude</span>
          </li>
        </ul>
        <p className="pt-4">
          Whether you find peace through <strong className="text-foreground">Islamic practices</strong> like dhikr, du'a, and Quranic reflection, or through <strong className="text-foreground">universal mindfulness</strong> and meditation — you are welcome here.
        </p>
        <p className="pt-2 italic">
          This space honours all paths to inner peace and connection.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 7: Who This App Is For
  if (step === "intro7") {
    return (
      <IntroScreen
        animationKey="intro7"
        icon={<Users className="h-10 w-10 text-wellness-sage" />}
        title="Created by a woman, for women"
        onNext={() => setStep("intro8")}
        onBack={() => setStep("intro6")}
        onSkip={skipToProfile}
      >
        <p>
          This app was created by a woman who has lived through each phase of womanhood herself.
        </p>
        <p className="pt-2">The practices you'll find here are shaped by:</p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>lived experience</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>a lifetime of study</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>decades of supporting women in healing spaces</span>
          </li>
        </ul>
        <p className="pt-4 italic">
          This is not trend-based wellbeing — it is care rooted in wisdom, understanding, and compassion.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 8: Empowerment, Not Pressure
  if (step === "intro8") {
    return (
      <IntroScreen
        animationKey="intro8"
        icon={<Sparkles className="h-10 w-10 text-wellness-lilac" />}
        title="Nothing to fix. Nothing to force."
        onNext={() => setStep("intro9")}
        onBack={() => setStep("intro7")}
        onSkip={skipToProfile}
      >
        <div className="space-y-4 text-lg">
          <p>Healing is not linear.</p>
          <p>Small, gentle steps matter.</p>
          <p>You are allowed to move at your own pace.</p>
        </div>
        <p className="pt-6 italic">
          This app exists to support you — not to judge or control you.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 9: Gentle Disclaimer
  if (step === "intro9") {
    return (
      <IntroScreen
        animationKey="intro9"
        icon={<Shield className="h-10 w-10 text-wellness-sage" />}
        title="Please read"
        onNext={() => setStep("intro10")}
        onBack={() => setStep("intro8")}
        onSkip={skipToProfile}
      >
        <p>
          This app offers guidance, education, and supportive suggestions.
          It does not replace medical advice or professional healthcare.
        </p>
        <p className="pt-4">Please:</p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>listen to your body</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>seek medical clearance from your doctor or qualified healthcare provider when needed</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-sage">•</span>
            <span>take responsibility for your own health decisions</span>
          </li>
        </ul>
        <p className="pt-4 italic">
          You are always encouraged to work alongside appropriate practitioners.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 10: Personal Journey Begins
  if (step === "intro10") {
    return (
      <IntroScreen
        animationKey="intro10"
        icon={<BookOpen className="h-10 w-10 text-wellness-lilac" />}
        title="Your journey is personal"
        onNext={() => setStep("intro11")}
        onBack={() => setStep("intro9")}
        onSkip={skipToProfile}
      >
        <p>You'll now be invited to:</p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>create your profile</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>tell us where you are in life</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-wellness-lilac">•</span>
            <span>choose what you'd like support with</span>
          </li>
        </ul>
        <p className="pt-4 italic">
          This allows the app to gently guide you with what may be most helpful for you.
        </p>
      </IntroScreen>
    );
  }

  // Intro Screen 11: Invitation (Final intro screen)
  if (step === "intro11") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div key="intro11" className="w-full max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border-none shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-6 pb-4 pt-12">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20 transition-transform duration-300 hover:scale-105">
                  <Compass className="h-10 w-10 text-mumtaz-plum" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-mumtaz-plum leading-tight font-accent">
                You are supported here
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pb-12">
              <div className="text-center space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>Move gently.</p>
                <p>Learn at your own pace.</p>
                <p className="italic">We are honoured to walk alongside you.</p>
              </div>
              <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={() => setStep("intro10")} className="gap-2 transition-all duration-200 hover:-translate-x-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button 
                  onClick={() => setStep("welcome")} 
                  size="lg"
                  className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8 transition-all duration-200 hover:translate-x-1"
                >
                  Let's begin your journey <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl border-none shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-8 pb-8 pt-12">
            <Logo size="xl" className="mx-auto" />
            <CardTitle className="text-4xl font-bold text-mumtaz-plum leading-tight font-accent">
              Empowering You Through Each Phase of Womanhood
            </CardTitle>
            {userName && (
              <p className="text-xl text-muted-foreground font-accent">
                Welcome, {userName}! 
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
            <div className="space-y-4">
              <Label htmlFor="name" className="text-base font-medium text-foreground">
                What should we call you?
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            
            <div className="text-center py-6">
              <p className="text-2xl font-semibold text-foreground mb-6">
                Where are you today?
              </p>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("intro11")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => setStep("lifeStage")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                  disabled={!userName.trim()}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "lifeStage") {
    const lifeStages = [
      { 
        value: "menstrual_cycle", 
        label: "Menstrual Cycle", 
        description: "Regular monthly cycling", 
        icon: "🌸",
        tooltip: "Experience the natural rhythm of your monthly cycle. We provide guidance for cycle tracking, managing symptoms, understanding hormonal changes, and supporting conditions like PCOS and endometriosis."
      },
      { 
        value: "pregnancy", 
        label: "Pregnancy", 
        description: "Expecting a baby", 
        icon: "🤰",
        tooltip: "Navigate your pregnancy journey trimester by trimester. Access prenatal yoga, nutrition guidance, emotional support, and preparation for childbirth tailored to your needs."
      },
      { 
        value: "postpartum", 
        label: "Postpartum", 
        description: "After childbirth", 
        icon: "👶",
        tooltip: "Support your recovery and adjustment to motherhood. Find resources for physical healing, postpartum yoga, managing emotions, breastfeeding support, and reconnecting with yourself."
      },
      { 
        value: "perimenopause", 
        label: "Perimenopause", 
        description: "Transition to menopause", 
        icon: "🌅",
        tooltip: "Navigate this transitional phase with confidence. Access tools for managing irregular cycles, hot flashes, mood changes, and hormonal fluctuations through holistic practices."
      },
      { 
        value: "menopause", 
        label: "Menopause", 
        description: "End of menstrual cycles", 
        icon: "🌙",
        tooltip: "Embrace this new chapter. Find support for managing symptoms like hot flashes, sleep issues, bone health, and rediscovering vitality through Ayurvedic wisdom and yoga."
      },
      { 
        value: "post_menopause", 
        label: "Post-Menopause", 
        description: "After menopause", 
        icon: "✨",
        tooltip: "Thrive in your wisdom years. Access practices for maintaining bone health, cardiovascular wellness, cognitive vitality, and cultivating purpose and joy in this empowered stage."
      },
    ];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">
                Your Life Stage
              </CardTitle>
              <CardDescription>
                Select the stage that best describes your current journey - hover for details about support available.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
              <div className="space-y-2">
                <Label>Which life stage are you in?</Label>
                <RadioGroup value={lifeStage} onValueChange={(value) => {
                  setLifeStage(value);
                  if (value !== "menstrual_cycle") {
                    setMenstrualCondition("");
                  }
                }}>
                  <div className="space-y-3">
                    {lifeStages.map((stage) => (
                      <Tooltip key={stage.value}>
                        <TooltipTrigger asChild>
                          <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-help">
                            <RadioGroupItem value={stage.value} id={stage.value} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={stage.value} className="font-medium cursor-pointer flex items-center gap-2">
                                <span className="text-xl">{stage.icon}</span>
                                {stage.label}
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm p-4">
                          <p className="text-sm">{stage.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {lifeStage === "menstrual_cycle" && (
                <div className="space-y-2 p-4 bg-accent/20 rounded-lg border border-border">
                  <Label className="text-sm font-medium">Do you have any specific menstrual health conditions? (Optional)</Label>
                  <RadioGroup value={menstrualCondition} onValueChange={setMenstrualCondition}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="cursor-pointer text-sm">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pcos" id="pcos" />
                        <Label htmlFor="pcos" className="cursor-pointer text-sm">PCOS (Polycystic Ovary Syndrome)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="endometriosis" id="endometriosis" />
                        <Label htmlFor="endometriosis" className="cursor-pointer text-sm">Endometriosis</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pmdd" id="pmdd" />
                        <Label htmlFor="pmdd" className="cursor-pointer text-sm">PMDD (Premenstrual Dysphoric Disorder)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="irregular" id="irregular" />
                        <Label htmlFor="irregular" className="cursor-pointer text-sm">Irregular or Heavy Periods</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep("welcome")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={() => {
                    // Skip menstrual cycle questions for non-menstrual life stages
                    if (lifeStage === 'menstrual_cycle') {
                      setStep("cycle");
                    } else {
                      setStep("dosha");
                    }
                  }}
                  disabled={!lifeStage}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>
    );
  }

  if (step === "cycle") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Understanding Your Cycle</CardTitle>
              <CardDescription>Help us understand where you are in your menstrual cycle - hover for details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
              <div className="space-y-2">
                <Label>Where are you in your cycle?</Label>
                <RadioGroup value={cyclePhase} onValueChange={setCyclePhase}>
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                          <RadioGroupItem value="menstrual" id="menstrual" />
                          <Label htmlFor="menstrual" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                Menstrual Phase (Days 1-5)
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="text-sm text-muted-foreground">Time of rest and renewal</div>
                            </div>
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4">
                        <p className="font-semibold mb-2">Menstrual Phase:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Hormone levels (estrogen & progesterone) are at their lowest</li>
                          <li>Body is shedding the uterine lining</li>
                          <li>Energy levels typically low - time for rest and reflection</li>
                          <li>May experience cramping, fatigue, or mood changes</li>
                          <li>Best practices: gentle movement, warm foods, self-care</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                          <RadioGroupItem value="follicular" id="follicular" />
                          <Label htmlFor="follicular" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                Follicular Phase (Days 6-14)
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="text-sm text-muted-foreground">Energy rising, new beginnings</div>
                            </div>
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4">
                        <p className="font-semibold mb-2">Follicular Phase:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Estrogen levels gradually rise, boosting energy and mood</li>
                          <li>Follicles in ovaries develop and prepare an egg</li>
                          <li>Increased mental clarity, creativity, and motivation</li>
                          <li>Skin often looks clearer and brighter</li>
                          <li>Best practices: start new projects, intense workouts, social activities</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                          <RadioGroupItem value="ovulation" id="ovulation" />
                          <Label htmlFor="ovulation" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                Ovulation (Days 14-16)
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="text-sm text-muted-foreground">Peak energy and confidence</div>
                            </div>
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4">
                        <p className="font-semibold mb-2">Ovulation Phase:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Estrogen peaks and triggers release of an egg</li>
                          <li>Highest energy levels and peak fertility window</li>
                          <li>Enhanced confidence, communication, and social skills</li>
                          <li>May experience mild cramping or spotting</li>
                          <li>Best practices: important meetings, challenges, high-intensity activities</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                          <RadioGroupItem value="luteal" id="luteal" />
                          <Label htmlFor="luteal" className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                Luteal Phase (Days 17-28)
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="text-sm text-muted-foreground">Energy winding down, introspection</div>
                            </div>
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-4">
                        <p className="font-semibold mb-2">Luteal Phase:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Progesterone rises to prepare body for potential pregnancy</li>
                          <li>Energy gradually decreases as hormones shift</li>
                          <li>May experience PMS symptoms: bloating, cravings, mood swings</li>
                          <li>Time for completing tasks and turning inward</li>
                          <li>Best practices: moderate exercise, nourishing foods, self-compassion</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </RadioGroup>
              </div>

            <div className="space-y-2">
              <Label>How would you describe your energy levels today?</Label>
              <RadioGroup value={energyLevel} onValueChange={setEnergyLevel}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer">Low - Need rest</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="cursor-pointer">Moderate - Balanced</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer">High - Energized</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="variable" id="variable" />
                    <Label htmlFor="variable" className="cursor-pointer">Variable - Up & down</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("lifeStage")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("dosha")}
                disabled={!cyclePhase || !energyLevel}
              >
                Continue to Dosha Check-in
              </Button>
            </div>
          </CardContent>
        </Card>
        </TooltipProvider>
      </div>
    );
  }

  if (step === "dosha") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <DoshaAssessment 
          onComplete={handleDoshaComplete} 
          onBack={() => {
            // Go back to cycle step only if life stage is menstrual_cycle
            if (lifeStage === 'menstrual_cycle') {
              setStep("cycle");
            } else {
              setStep("lifeStage");
            }
          }}
          currentStep={getStepInfo().current}
          totalSteps={getStepInfo().total}
        />
      </div>
    );
  }

  if (step === "doshaResults") {
    const getDoshaInfo = (dosha: string) => {
      switch (dosha.toLowerCase()) {
        case 'pitta':
          return {
            icon: <Flame className="h-12 w-12 text-dosha-pitta" />,
            name: 'Pitta',
            element: 'Fire & Transformation',
            description: 'Governs metabolism, digestion, and energy production. Pitta types are often focused, driven, and have strong appetites.',
            bgClass: 'bg-dosha-pitta/5 border-dosha-pitta/30',
            iconBgClass: 'bg-dosha-pitta/20',
            textClass: 'text-dosha-pitta'
          };
        case 'vata':
          return {
            icon: <Wind className="h-12 w-12 text-dosha-vata" />,
            name: 'Vata',
            element: 'Air & Movement',
            description: 'Governs circulation, breathing, and the nervous system. Vata types are creative, energetic, and adaptable.',
            bgClass: 'bg-dosha-vata/5 border-dosha-vata/30',
            iconBgClass: 'bg-dosha-vata/20',
            textClass: 'text-dosha-vata'
          };
        case 'kapha':
          return {
            icon: <Mountain className="h-12 w-12 text-dosha-kapha" />,
            name: 'Kapha',
            element: 'Earth & Stability',
            description: 'Governs structure, immunity, and fluid balance. Kapha types are calm, steady, and nurturing.',
            bgClass: 'bg-dosha-kapha/5 border-dosha-kapha/30',
            iconBgClass: 'bg-dosha-kapha/20',
            textClass: 'text-dosha-kapha'
          };
        default:
          return null;
      }
    };

    const primaryInfo = getDoshaInfo(primaryDosha);
    const secondaryInfo = getDoshaInfo(secondaryDosha);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <TooltipProvider>
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">
                  Your Dosha Profile
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Understanding your unique Ayurvedic constitution helps us personalize your wellness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
              
              {/* Primary Dosha */}
              {primaryInfo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-6 rounded-lg border ${primaryInfo.bgClass} cursor-help hover:shadow-md transition-shadow`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-full ${primaryInfo.iconBgClass}`}>
                          {primaryInfo.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-2xl font-bold mb-1 ${primaryInfo.textClass} flex items-center gap-2`}>
                            Your Primary Dosha: {primaryInfo.name}
                            <HelpCircle className="h-4 w-4 opacity-50" />
                          </h3>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            {primaryInfo.element}
                          </p>
                          <p className="text-foreground">
                            {primaryInfo.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4">
                    <p className="font-semibold mb-2">{primaryInfo.name} Dosha Traits:</p>
                    <p className="text-sm">
                      {primaryInfo.name === 'Pitta' && "Sharp intellect, warm body, strong digestion. Benefits from cooling practices and avoiding excessive heat."}
                      {primaryInfo.name === 'Vata' && "Creative mind, light build, variable energy. Benefits from grounding practices and warm, nourishing foods."}
                      {primaryInfo.name === 'Kapha' && "Calm nature, sturdy build, steady energy. Benefits from energizing practices and stimulating activities."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Secondary Dosha */}
              {secondaryInfo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-6 rounded-lg border ${secondaryInfo.bgClass} cursor-help hover:shadow-md transition-shadow`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${secondaryInfo.iconBgClass}`}>
                          {secondaryInfo.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-semibold mb-1 ${secondaryInfo.textClass} flex items-center gap-2`}>
                            Your Secondary Dosha: {secondaryInfo.name}
                            <HelpCircle className="h-4 w-4 opacity-50" />
                          </h3>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            {secondaryInfo.element}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {secondaryInfo.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm p-4">
                    <p className="font-semibold mb-2">{secondaryInfo.name} Influence:</p>
                    <p className="text-sm">
                      Your secondary dosha adds complementary qualities to your constitution and may become more prominent during different seasons or life stages.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">What this means:</strong> We'll personalize your wellness content based on your dosha profile, recommending practices, foods, and lifestyle adjustments that support your unique constitution.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep("dosha")}>
                  Retake Assessment
                </Button>
                <Button onClick={() => setStep("spiritual")} className="bg-primary hover:bg-primary/90">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>
    );
  }

  if (step === "spiritual") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Spiritual Connection</CardTitle>
            <CardDescription>How would you like to nourish your spirit?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
            <RadioGroup value={spiritualPreference} onValueChange={setSpiritualPreference}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="islamic" id="islamic" />
                  <Label htmlFor="islamic" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Islamic Prayers & Duas</div>
                      <div className="text-sm text-muted-foreground">
                        Receive Islamic prayers, duas, and guidance rooted in faith
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="universal" id="universal" />
                  <Label htmlFor="universal" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Universal Affirmations & Mantras</div>
                      <div className="text-sm text-muted-foreground">
                        Receive positive affirmations, mantras, and universal wisdom
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">Show Me Everything</div>
                      <div className="text-sm text-muted-foreground">
                        Access both Islamic and universal spiritual practices - I'll choose what resonates
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("doshaResults")}>
                Back
              </Button>
              <Button onClick={() => setStep("pregnancy")}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "pregnancy") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Journey Stage</CardTitle>
              <CardDescription>Where are you in your wellness journey? Hover for details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
              <RadioGroup value={pregnancyStatus} onValueChange={setPregnancyStatus}>
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                        <RadioGroupItem value="not_pregnant" id="not_pregnant" />
                        <Label htmlFor="not_pregnant" className="flex-1 cursor-pointer flex items-center gap-2">
                          Not currently pregnant or trying to conceive
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4">
                      <p className="font-semibold mb-2">General Wellness Focus:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Focus on cycle tracking and hormonal balance</li>
                        <li>General yoga, fitness, and movement practices</li>
                        <li>Nutrition and lifestyle for overall wellbeing</li>
                        <li>Stress management and emotional support</li>
                        <li>Expect: personalized daily routines and self-care</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                        <RadioGroupItem value="trying" id="trying" />
                        <Label htmlFor="trying" className="flex-1 cursor-pointer flex items-center gap-2">
                          Trying to conceive
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4">
                      <p className="font-semibold mb-2">Fertility Support:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Fertility-focused yoga and gentle movements</li>
                        <li>Nutrition for hormonal balance and conception</li>
                        <li>Stress reduction and emotional support</li>
                        <li>Cycle awareness and fertility window tracking</li>
                        <li>Expect: gentle practices to support your fertility journey</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                        <RadioGroupItem value="pregnant" id="pregnant" />
                        <Label htmlFor="pregnant" className="flex-1 cursor-pointer flex items-center gap-2">
                          Currently pregnant
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4">
                      <p className="font-semibold mb-2">Pregnancy Support:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Trimester-specific guidance as your body changes</li>
                        <li>Safe pregnancy yoga, movements, and exercises</li>
                        <li>Nutrition and wellness practices for you and baby</li>
                        <li>Emotional support and preparation for birth</li>
                        <li>Expect: prenatal care tips, birth preparation, and milestone tracking</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                        <RadioGroupItem value="postpartum" id="postpartum" />
                        <Label htmlFor="postpartum" className="flex-1 cursor-pointer flex items-center gap-2">
                          Postpartum recovery
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4">
                      <p className="font-semibold mb-2">Postpartum:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Gentle healing and recovery after childbirth</li>
                        <li>Support for physical recovery and core restoration</li>
                        <li>Emotional wellness during the "fourth trimester"</li>
                        <li>Navigate hormonal shifts, breastfeeding, and sleep deprivation</li>
                        <li>Expect: restorative practices, pelvic floor care, and self-compassion</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </RadioGroup>

            {pregnancyStatus === "pregnant" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll calculate your trimester and provide tailored guidance for each stage
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("spiritual")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("preferences")}
                disabled={pregnancyStatus === "pregnant" && !dueDate}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
        </TooltipProvider>
      </div>
    );
  }

  if (step === "preferences") {
    const getYogaIcon = (style: string) => {
      switch (style.toLowerCase()) {
        case "hatha":
          return <Activity className="h-5 w-5 text-primary" />;
        case "vinyasa":
          return <Wind className="h-5 w-5 text-primary" />;
        case "yin":
          return <Mountain className="h-5 w-5 text-primary" />;
        case "restorative":
          return <Heart className="h-5 w-5 text-primary" />;
        case "prenatal":
          return <Baby className="h-5 w-5 text-primary" />;
        case "gentle":
          return <Moon className="h-5 w-5 text-primary" />;
        default:
          return <Sparkles className="h-5 w-5 text-muted-foreground" />;
      }
    };

    const getYogaTooltip = (style: string) => {
      const tooltips: Record<string, string> = {
        hatha: "Hatha yoga is a gentle, foundational practice perfect for beginners. It emphasizes proper alignment, breathing techniques, and holding postures to build strength and flexibility. Great for all fitness levels.",
        vinyasa: "Vinyasa is a dynamic, flowing style that links breath with movement. Each movement flows smoothly into the next, creating a dance-like quality. Great for building cardiovascular health, strength, and maintaining focus.",
        yin: "Yin yoga targets deep connective tissues through passive, long-held poses (3-5 minutes each). This meditative practice is excellent for flexibility, joint health, and cultivating mindfulness and patience.",
        restorative: "Restorative yoga uses props to support the body in restful poses held for 5-20 minutes. Perfect for stress relief, recovery, and deep relaxation. Ideal for anyone needing gentle healing.",
        prenatal: "Prenatal yoga is specifically designed for pregnancy, focusing on poses that are safe and beneficial for expecting mothers. Helps with strength, flexibility, breathing, and preparing for childbirth.",
        gentle: "Gentle yoga is a slower-paced, nurturing practice suitable for all levels. Perfect for those new to yoga, recovering from injury, or seeking a calmer practice. Emphasizes relaxation and ease of movement.",
      };
      return tooltips[style.toLowerCase()] || "";
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <TooltipProvider>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Preferences</CardTitle>
              <CardDescription>Help us personalize your experience - hover for details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
              <div className="space-y-2">
                <Label>Preferred Yoga Style (Optional)</Label>
                <RadioGroup value={yogaStyle} onValueChange={setYogaStyle}>
                  <div className="grid grid-cols-2 gap-3">
                    {["Hatha", "Vinyasa", "Yin", "Restorative", "Prenatal", "Gentle"].map((style) => (
                      <Tooltip key={style}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-help">
                            <RadioGroupItem value={style.toLowerCase()} id={style} />
                            <div className="flex items-center gap-2 flex-1">
                              {getYogaIcon(style)}
                              <Label htmlFor={style} className="cursor-pointer flex items-center gap-1">
                                {style}
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </Label>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm p-4">
                          <p className="text-sm">{getYogaTooltip(style)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep("pregnancy")}>
                  Back
                </Button>
                <Button onClick={() => setStep("complete")}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>
    );
  }

  if (step === "complete") {
    const doshaDescription = {
      vata: "You are creative, energetic, and flexible. Focus on grounding practices and warm, nourishing foods.",
      pitta: "You are focused, driven, and warm. Focus on cooling practices and calming, hydrating foods.",
      kapha: "You are stable, nurturing, and strong. Focus on energizing practices and light, warming foods.",
    };

    const doshaRecommendations = {
      vata: {
        yoga: [
          "Gentle Hatha Yoga - Focus on slow, grounding movements",
          "Child's Pose (Balasana) - Calms the nervous system",
          "Mountain Pose (Tadasana) - Builds stability and grounding",
          "Seated Forward Bend (Paschimottanasana) - Soothes anxiety",
          "Legs Up the Wall (Viparita Karani) - Promotes rest and restoration"
        ],
        foods: [
          "Warm, cooked meals - Soups, stews, and porridges",
          "Root vegetables - Sweet potatoes, carrots, beets",
          "Warming spices - Ginger, cinnamon, cumin, cardamom",
          "Healthy fats - Ghee, sesame oil, avocado",
          "Sweet fruits - Bananas, dates, mangoes",
          "Warm herbal teas - Ginger tea, chamomile, licorice root"
        ],
        spiritual: {
          islamic: [
            "Surah Al-Fatiha for grounding and peace",
            "Dhikr: 'SubhanAllah wa bihamdihi' (100x daily) for calmness",
            "Morning and evening adhkar for routine and stability",
            "Slow, mindful prayer movements to reduce anxiety"
          ],
          universal: [
            "Grounding meditation - Connect with earth energy",
            "Body scan meditation - Build body awareness",
            "Journaling practice - Release racing thoughts",
            "Gentle breathwork - 4-7-8 breathing technique"
          ]
        }
      },
      pitta: {
        yoga: [
          "Cooling Yin Yoga - Release tension without overheating",
          "Moon Salutations - Gentle, cooling alternative to Sun Salutations",
          "Supported Bridge Pose - Opens heart without strain",
          "Seated Twist (Ardha Matsyendrasana) - Cooling and detoxifying",
          "Corpse Pose (Savasana) - Deep relaxation and surrender"
        ],
        foods: [
          "Cooling foods - Cucumbers, coconut, mint, cilantro",
          "Sweet fruits - Melons, grapes, pomegranates",
          "Leafy greens - Kale, spinach, lettuce",
          "Cooling grains - Basmati rice, barley, oats",
          "Moderate dairy - Milk, ghee, fresh cheese (paneer)",
          "Herbal teas - Peppermint, rose, fennel, coriander"
        ],
        spiritual: {
          islamic: [
            "Surah Ar-Rahman for cooling the heart",
            "Dhikr: 'Astaghfirullah' (forgiveness) to soften anger",
            "Tahajjud prayer in the cool night hours",
            "Reflect on patience (Sabr) and gratitude (Shukr)"
          ],
          universal: [
            "Cooling breath (Shitali Pranayama) - Reduce internal heat",
            "Loving-kindness meditation - Cultivate compassion",
            "Moon gazing meditation - Absorb cooling lunar energy",
            "Forgiveness practice - Release resentment and anger"
          ]
        }
      },
      kapha: {
        yoga: [
          "Dynamic Vinyasa Flow - Build heat and energy",
          "Sun Salutations (Surya Namaskar) - Energizing morning practice",
          "Warrior Poses - Build strength and determination",
          "Camel Pose (Ustrasana) - Opens chest and energizes",
          "Plow Pose (Halasana) - Stimulates metabolism"
        ],
        foods: [
          "Light, warm meals - Avoid heavy, oily foods",
          "Pungent spices - Black pepper, chili, mustard seeds",
          "Bitter greens - Arugula, dandelion, kale",
          "Legumes - Lentils, mung beans, chickpeas",
          "Astringent fruits - Apples, pomegranates, cranberries",
          "Stimulating teas - Ginger tea, green tea, tulsi (holy basil)"
        ],
        spiritual: {
          islamic: [
            "Surah Al-Asr for motivation and purpose",
            "Dhikr: 'La hawla wa la quwwata illa billah' for strength",
            "Fajr prayer to establish early morning routine",
            "Study and reflection on purposeful action"
          ],
          universal: [
            "Energizing breathwork - Kapalabhati (skull shining breath)",
            "Morning gratitude practice - Start day with intention",
            "Active meditation - Walking meditation, mindful movement",
            "Visualization practice - Envision goals and aspirations"
          ]
        }
      }
    };

    const currentRecommendations = doshaRecommendations[primaryDosha as keyof typeof doshaRecommendations];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Wellness Profile</CardTitle>
            <CardDescription>Here&apos;s what we&apos;ve discovered about your unique constitution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-medium text-foreground mb-2">Your Primary Dosha: {primaryDosha}</h4>
                <p className="text-sm text-muted-foreground">{doshaDescription[primaryDosha as keyof typeof doshaDescription]}</p>
              </div>

              {secondaryDosha && secondaryDosha !== primaryDosha && (
                <div className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="font-medium text-foreground mb-2">Secondary Dosha: {secondaryDosha}</h4>
                  <p className="text-sm text-muted-foreground">
                    You also have qualities of {secondaryDosha}, which adds depth to your constitution.
                  </p>
                </div>
              )}

              {currentRecommendations && (
                <>
                  <div className="p-4 rounded-lg border border-wellness-sage/30 bg-wellness-sage/5">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Yoga Practices for {primaryDosha}
                    </h4>
                    <ul className="space-y-2">
                      {currentRecommendations.yoga.map((pose, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-wellness-sage mt-0.5">•</span>
                          <span>{pose}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-wellness-lilac/30 bg-wellness-lilac/5">
                    <h4 className="font-medium text-foreground mb-3">Ayurvedic Nutrition</h4>
                    <ul className="space-y-2">
                      {currentRecommendations.foods.map((food, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-wellness-lilac mt-0.5">•</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Moon className="w-4 h-4" /> Spiritual Practices
                    </h4>
                    {(spiritualPreference === "islamic" || spiritualPreference === "both") && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Islamic Practices:</p>
                        <ul className="space-y-2">
                          {currentRecommendations.spiritual.islamic.map((practice, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(spiritualPreference === "universal" || spiritualPreference === "both") && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Universal Practices:</p>
                        <ul className="space-y-2">
                          {currentRecommendations.spiritual.universal.map((practice, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="grid gap-3">
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">Spiritual Practice</span>
                  <span className="text-sm text-muted-foreground capitalize">{spiritualPreference.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">Journey Stage</span>
                  <span className="text-sm text-muted-foreground capitalize">{pregnancyStatus.replace("_", " ")}</span>
                </div>
                {yogaStyle && (
                  <div className="flex justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm font-medium">Yoga Preference</span>
                    <span className="text-sm text-muted-foreground capitalize">{yogaStyle}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <p className="text-sm text-center text-foreground">
                ✨ Your personalized journey begins now. We'll provide daily guidance tailored to your unique needs.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-wellness-lilac/30 bg-wellness-lilac/5">
              <p className="text-sm text-center font-medium mb-2">Want More Personalized Guidance?</p>
              <p className="text-xs text-center text-muted-foreground mb-3">
                Book a one-on-one consultation for deeper insights into your dosha, cycle, and wellness journey
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = 'mailto:mumtazhaque07@gmail.com?subject=Booking%20Request&body=Hi%2C%20I%20would%20like%20to%20book%20a%20consultation%20or%20class.'}
              >
                Book Your Consultation
              </Button>
            </div>

            <Button
              onClick={saveProfile}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Creating Your Profile..." : "Begin Tracking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
