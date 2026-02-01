import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Mood options with large, easy-to-tap emojis
const MOOD_OPTIONS = [
  { value: 2, emoji: "😔", label: "Struggling" },
  { value: 4, emoji: "😐", label: "Low" },
  { value: 6, emoji: "🙂", label: "Okay" },
  { value: 8, emoji: "😊", label: "Good" },
  { value: 10, emoji: "🥰", label: "Great" },
];

// Comfort options
const COMFORT_OPTIONS = [
  { value: 0, label: "No discomfort", color: "bg-green-100 border-green-300 text-green-700" },
  { value: 3, label: "Mild", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
  { value: 6, label: "Moderate", color: "bg-orange-100 border-orange-300 text-orange-700" },
  { value: 9, label: "Significant", color: "bg-red-100 border-red-300 text-red-700" },
];

// Suggested activities based on mood and comfort
const SUGGESTIONS = {
  low_energy: [
    { id: "rest", label: "Rest & restore", icon: "🛋️" },
    { id: "gentle", label: "Gentle stretching", icon: "🌸" },
    { id: "breathe", label: "Breathing exercise", icon: "🌬️" },
  ],
  moderate_energy: [
    { id: "yoga", label: "Gentle yoga", icon: "🧘" },
    { id: "walk", label: "Short walk", icon: "🚶‍♀️" },
    { id: "meditate", label: "Meditation", icon: "🕯️" },
  ],
  high_energy: [
    { id: "practice", label: "Full practice", icon: "✨" },
    { id: "learn", label: "Learn something new", icon: "📚" },
    { id: "explore", label: "Explore content", icon: "🔍" },
  ],
};

interface SimpleCheckInProps {
  onComplete?: () => void;
  onSwitchToFull?: () => void;
}

/**
 * SimpleCheckIn - A streamlined 3-step check-in for non-technical users.
 *
 * Design principles:
 * - Large touch targets (minimum 56px)
 * - Clear visual feedback
 * - Minimal text, maximum clarity
 * - Progressive disclosure (one question at a time)
 */
export function SimpleCheckIn({ onComplete, onSwitchToFull }: SimpleCheckInProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<number | null>(null);
  const [comfort, setComfort] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const getSuggestions = () => {
    if (mood === null) return SUGGESTIONS.moderate_energy;
    if (mood <= 4 || (comfort !== null && comfort >= 6)) return SUGGESTIONS.low_energy;
    if (mood >= 8 && (comfort === null || comfort <= 3)) return SUGGESTIONS.high_energy;
    return SUGGESTIONS.moderate_energy;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.info("Sign in to save your check-ins");
        navigate("/auth");
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Check if entry exists for today
      const { data: existing } = await supabase
        .from("wellness_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle();

      const entryData = {
        user_id: user.id,
        entry_date: today,
        emotional_score: mood,
        pain_level: comfort,
        emotional_state: MOOD_OPTIONS.find(m => m.value === mood)?.label || null,
        daily_practices: selectedActivity ? { quick_activity: { status: true, choice: selectedActivity } } : null,
      };

      if (existing) {
        await supabase
          .from("wellness_entries")
          .update(entryData)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("wellness_entries")
          .insert(entryData);
      }

      toast.success("Check-in saved! 💜");
      onComplete?.();

      // Navigate based on selected activity
      if (selectedActivity === "yoga" || selectedActivity === "gentle") {
        navigate("/content-library?category=mobility");
      } else if (selectedActivity === "learn" || selectedActivity === "explore") {
        navigate("/content-library");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast.error("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all duration-300",
                  s <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Step {step} of 3
          </p>
        </div>

        <CardContent className="p-6 pt-4">
          {/* Step 1: Mood */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  How are you feeling?
                </h2>
                <p className="text-muted-foreground">
                  Tap the emoji that best matches your mood
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-2xl transition-all",
                      "min-w-[64px] min-h-[80px]",
                      "hover:scale-105 active:scale-95",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      mood === option.value
                        ? "bg-primary/20 ring-2 ring-primary scale-110"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                    aria-label={option.label}
                    aria-pressed={mood === option.value}
                  >
                    <span className="text-4xl mb-1">{option.emoji}</span>
                    <span className="text-xs text-muted-foreground">{option.label}</span>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={mood === null}
                className="w-full h-14 text-lg font-medium"
                size="lg"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Comfort level */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Any physical discomfort?
                </h2>
                <p className="text-muted-foreground">
                  It's okay if there is — we'll adjust suggestions
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {COMFORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setComfort(option.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      "min-h-[60px] text-base font-medium",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      comfort === option.value
                        ? `${option.color} ring-2 ring-offset-2 ring-primary`
                        : "bg-background border-border hover:border-primary/50"
                    )}
                    aria-pressed={comfort === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-14"
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={comfort === null}
                  className="flex-1 h-14 text-lg font-medium"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Suggestions */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  What feels right today?
                </h2>
                <p className="text-muted-foreground">
                  Choose one, or skip to explore on your own
                </p>
              </div>

              <div className="space-y-3">
                {getSuggestions().map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => setSelectedActivity(suggestion.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all",
                      "flex items-center gap-4",
                      "min-h-[64px] text-left",
                      "hover:scale-[1.01] active:scale-[0.99]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      selectedActivity === suggestion.id
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    )}
                    aria-pressed={selectedActivity === suggestion.id}
                  >
                    <span className="text-3xl">{suggestion.icon}</span>
                    <span className="text-lg font-medium">{suggestion.label}</span>
                    {selectedActivity === suggestion.id && (
                      <Check className="ml-auto h-6 w-6 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 h-14"
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-14 text-lg font-medium"
                  size="lg"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      Done
                      <Sparkles className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Link to full tracker */}
          {onSwitchToFull && (
            <button
              onClick={onSwitchToFull}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Want to track more details? Use full tracker →
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
