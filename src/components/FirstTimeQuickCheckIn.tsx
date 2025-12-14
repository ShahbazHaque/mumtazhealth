import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, ArrowRight, Sparkles, Check } from "lucide-react";
import { Logo } from "@/components/Logo";

const feelingOptions = [
  { id: "tired", label: "Tired", emoji: "😴", color: "from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30" },
  { id: "in_pain", label: "In pain", emoji: "🤕", color: "from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30" },
  { id: "exhausted", label: "Exhausted", emoji: "😩", color: "from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30" },
  { id: "emotional", label: "Emotional / hormonal", emoji: "💔", color: "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30" },
  { id: "restless", label: "Restless", emoji: "🌀", color: "from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30" },
  { id: "bloated", label: "Bloated", emoji: "🎈", color: "from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30" },
  { id: "digestive", label: "Digestive issues", emoji: "🌿", color: "from-green-100 to-lime-100 dark:from-green-900/30 dark:to-lime-900/30" },
  { id: "hot_flushes", label: "Hot flushes", emoji: "🔥", color: "from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30" },
  { id: "cant_sleep", label: "Can't sleep", emoji: "🌙", color: "from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30" },
  { id: "back_ache", label: "Back ache", emoji: "🦴", color: "from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30" },
  { id: "neck_shoulder", label: "Neck + shoulder tension", emoji: "💆", color: "from-fuchsia-100 to-purple-100 dark:from-fuchsia-900/30 dark:to-purple-900/30" },
  { id: "low_mood", label: "Low mood", emoji: "😢", color: "from-slate-100 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😵", color: "from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30" },
  { id: "stressed", label: "Stressed", emoji: "😰", color: "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" },
  { id: "period_pain", label: "Period pain", emoji: "🩸", color: "from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30" },
  { id: "joint_stiffness", label: "Joint stiffness", emoji: "🦴", color: "from-stone-100 to-zinc-100 dark:from-stone-900/30 dark:to-zinc-900/30" },
  { id: "post_surgery", label: "Post-surgery discomfort", emoji: "🏥", color: "from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30" },
];

const guidanceMap: Record<string, { tips: string[]; practice: string; practiceType: string }> = {
  tired: {
    tips: ["Try a 5-minute rest with your legs up the wall", "Sip warm water with lemon to gently energise"],
    practice: "Gentle restorative yoga pose: Legs Up the Wall",
    practiceType: "yoga"
  },
  in_pain: {
    tips: ["Honour your body's signals – rest is healing", "Apply warmth to the painful area if it feels soothing"],
    practice: "Gentle breathwork: 4-7-8 breathing for pain relief",
    practiceType: "breathwork"
  },
  exhausted: {
    tips: ["Rest is not laziness – it's essential", "Consider a warm bath with Epsom salts this evening"],
    practice: "Restorative yoga: Supported Child's Pose",
    practiceType: "yoga"
  },
  emotional: {
    tips: ["Your feelings are valid – allow them space", "Place one hand on your heart and breathe slowly"],
    practice: "Heart-opening breathwork with self-compassion",
    practiceType: "breathwork"
  },
  restless: {
    tips: ["Ground yourself with bare feet on the floor", "A short walk outside can help settle restless energy"],
    practice: "Grounding yoga flow for Vata balance",
    practiceType: "yoga"
  },
  bloated: {
    tips: ["Sip warm ginger tea to aid digestion", "Avoid cold drinks and raw foods today"],
    practice: "Gentle twists and digestive massage",
    practiceType: "yoga"
  },
  digestive: {
    tips: ["Eat warm, cooked foods and chew slowly", "Fennel or cumin tea can soothe the digestive system"],
    practice: "Ayurvedic digestive reset routine",
    practiceType: "nutrition"
  },
  hot_flushes: {
    tips: ["Keep a cool cloth nearby for your forehead", "Avoid spicy foods and caffeine today"],
    practice: "Cooling breathwork: Sheetali Pranayama",
    practiceType: "breathwork"
  },
  cant_sleep: {
    tips: ["Dim lights an hour before bed", "Try a warm milk with nutmeg before sleep"],
    practice: "Evening wind-down yoga routine",
    practiceType: "yoga"
  },
  back_ache: {
    tips: ["Gentle movement is often better than staying still", "Consider heat therapy for muscle tension"],
    practice: "Chair yoga for back relief",
    practiceType: "yoga"
  },
  neck_shoulder: {
    tips: ["Drop your shoulders away from your ears", "Gentle neck rolls can release tension"],
    practice: "Neck and shoulder release sequence",
    practiceType: "yoga"
  },
  low_mood: {
    tips: ["Be gentle with yourself today", "Connection helps – reach out to someone who cares"],
    practice: "Uplifting breathwork and gentle movement",
    practiceType: "breathwork"
  },
  overwhelmed: {
    tips: ["You don't have to do everything today", "Focus on just one small thing at a time"],
    practice: "Grounding meditation for calm",
    practiceType: "meditation"
  },
  stressed: {
    tips: ["Take three slow, deep breaths right now", "Step outside for fresh air if possible"],
    practice: "Stress-relief breathing: Box Breath",
    practiceType: "breathwork"
  },
  period_pain: {
    tips: ["Gentle heat on your lower belly can ease cramps", "Rest in a comfortable position"],
    practice: "Reclining bound angle pose for menstrual relief",
    practiceType: "yoga"
  },
  joint_stiffness: {
    tips: ["Gentle morning stretches before getting out of bed", "Warm sesame oil massage supports mobility"],
    practice: "Chair yoga for joint mobility",
    practiceType: "yoga"
  },
  post_surgery: {
    tips: ["Honor your recovery – rest is healing", "Warm, nourishing soups support tissue repair"],
    practice: "Gentle breathwork for recovery",
    practiceType: "breathwork"
  }
};

interface FirstTimeQuickCheckInProps {
  onComplete: () => void;
  onStartFullOnboarding: () => void;
}

export function FirstTimeQuickCheckIn({ onComplete, onStartFullOnboarding }: FirstTimeQuickCheckInProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"choice" | "feelings" | "guidance">("choice");
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleFeeling = (id: string) => {
    setSelectedFeelings(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const handleSubmitFeelings = async () => {
    if (selectedFeelings.length === 0) {
      toast.error("Please select at least one feeling");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Log each selected feeling
        for (const feelingId of selectedFeelings) {
          const feeling = feelingOptions.find(f => f.id === feelingId);
          if (feeling) {
            await supabase.from("quick_checkin_logs").insert({
              user_id: user.id,
              feeling_id: feelingId,
              feeling_label: feeling.label
            });
          }
        }

        // Mark as quick check-in completed (but not full onboarding)
        await supabase.from("user_wellness_profiles").upsert({
          user_id: user.id,
          onboarding_completed: false, // Keep false so we can prompt for full onboarding
        }, { onConflict: 'user_id' });

        // Store in localStorage that quick check-in was done
        localStorage.setItem('mumtaz_quick_checkin_completed', 'true');
      }

      setStep("guidance");
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    onComplete();
  };

  // Step 1: Choice Screen
  if (step === "choice") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-6 pb-4 pt-10">
              <Logo size="xl" className="mx-auto" />
              <CardTitle className="text-2xl md:text-3xl font-bold text-mumtaz-plum leading-tight font-accent">
                Welcome to Mumtaz Health
              </CardTitle>
              <p className="text-muted-foreground">
                How would you like to get started?
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-10">
              <Button 
                onClick={() => setStep("feelings")}
                className="w-full h-auto py-6 flex flex-col gap-2 bg-wellness-sage hover:bg-wellness-sage/90 text-white"
                size="lg"
              >
                <Heart className="h-8 w-8" />
                <span className="text-lg font-semibold">Quick Check-In</span>
                <span className="text-sm opacity-90 font-normal">
                  Tell us how you're feeling for instant, free guidance
                </span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button 
                onClick={onStartFullOnboarding}
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 border-2 border-wellness-lilac/50 hover:bg-wellness-lilac/10"
                size="lg"
              >
                <Sparkles className="h-8 w-8 text-wellness-lilac" />
                <span className="text-lg font-semibold">Start My Personal Onboarding</span>
                <span className="text-sm opacity-70 font-normal">
                  Take the full journey to discover your dosha and receive personalized guidance
                </span>
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-4">
                You can always complete your full onboarding later from the dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Feelings Selection
  if (step === "feelings") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border-none shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-4 pt-8">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20">
                  <Heart className="h-8 w-8 text-wellness-lilac" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-mumtaz-plum leading-tight font-accent">
                How are you feeling today?
              </CardTitle>
              <p className="text-muted-foreground">
                Select one or more that resonate with you
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {feelingOptions.map((feeling) => {
                  const isSelected = selectedFeelings.includes(feeling.id);
                  return (
                    <button
                      key={feeling.id}
                      onClick={() => toggleFeeling(feeling.id)}
                      className={`p-3 rounded-xl transition-all duration-200 text-left flex items-center gap-2.5
                        bg-gradient-to-br ${feeling.color}
                        ${isSelected
                          ? "border-2 border-wellness-lilac shadow-lg scale-[1.02]"
                          : "border border-border/50 hover:border-wellness-lilac/50 hover:shadow-md hover:scale-[1.02]"
                        }`}
                    >
                      <span className="text-xl">{feeling.emoji}</span>
                      <span className={`text-sm font-medium flex-1 ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                        {feeling.label}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-wellness-lilac flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep("choice")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitFeelings}
                  disabled={selectedFeelings.length === 0 || loading}
                  className="flex-1 gap-2 bg-wellness-sage hover:bg-wellness-sage/90"
                >
                  {loading ? "Saving..." : "Get Guidance"} 
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Guidance Screen
  if (step === "guidance") {
    const primaryFeeling = selectedFeelings[0];
    const guidance = guidanceMap[primaryFeeling] || guidanceMap.tired;
    const primaryFeelingData = feelingOptions.find(f => f.id === primaryFeeling);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border-none shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-4 pt-8">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-wellness-lilac/20 to-wellness-sage/20 text-4xl">
                  {primaryFeelingData?.emoji || "💫"}
                </div>
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold text-mumtaz-plum leading-tight font-accent">
                We hear you. Here's some gentle support.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              {/* Tips */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4 text-wellness-lilac" />
                  Simple tips for you:
                </h3>
                <ul className="space-y-2">
                  {guidance.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-wellness-sage mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice Recommendation */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-wellness-lilac/10 to-wellness-sage/10 border border-wellness-lilac/20">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-wellness-lilac" />
                  Recommended practice:
                </h3>
                <p className="text-muted-foreground">{guidance.practice}</p>
              </div>

              {/* Invitation to deeper onboarding */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  If you'd like deeper guidance, personalised support, or to discover your unique Dosha, 
                  you can complete your onboarding anytime from your dashboard.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full gap-2 bg-wellness-sage hover:bg-wellness-sage/90"
                  size="lg"
                >
                  Go to My Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={onStartFullOnboarding}
                  variant="outline"
                  className="w-full border-wellness-lilac/50 hover:bg-wellness-lilac/10"
                >
                  Complete My Personal Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
