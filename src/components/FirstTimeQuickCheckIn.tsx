import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, ArrowRight, Sparkles, Check } from "lucide-react";
import { Logo } from "@/components/Logo";

const feelingOptions = [
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "in_pain", label: "In pain", emoji: "🤕" },
  { id: "exhausted", label: "Exhausted", emoji: "😩" },
  { id: "emotional", label: "Emotional / hormonal", emoji: "💔" },
  { id: "restless", label: "Restless", emoji: "🌀" },
  { id: "bloated", label: "Bloated", emoji: "🎈" },
  { id: "digestive", label: "Digestive issues", emoji: "🌿" },
  { id: "hot_flushes", label: "Hot flushes", emoji: "🔥" },
  { id: "cant_sleep", label: "Can't sleep", emoji: "🌙" },
  { id: "back_ache", label: "Back ache", emoji: "🦴" },
  { id: "neck_shoulder", label: "Neck + shoulder tension", emoji: "💆" },
  { id: "low_mood", label: "Low mood", emoji: "😢" },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "😵" },
  { id: "stressed", label: "Stressed", emoji: "😰" },
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
              <div className="grid grid-cols-2 gap-3">
                {feelingOptions.map((feeling) => {
                  const isSelected = selectedFeelings.includes(feeling.id);
                  return (
                    <button
                      key={feeling.id}
                      onClick={() => toggleFeeling(feeling.id)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-3 ${
                        isSelected
                          ? "border-wellness-lilac bg-wellness-lilac/10 shadow-md"
                          : "border-border hover:border-wellness-lilac/50 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-2xl">{feeling.emoji}</span>
                      <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {feeling.label}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-wellness-lilac ml-auto" />
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
