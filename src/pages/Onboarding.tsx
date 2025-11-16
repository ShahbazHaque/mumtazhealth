import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Heart, Moon, Baby } from "lucide-react";
import DoshaAssessment from "@/components/DoshaAssessment";

type OnboardingStep = "welcome" | "cycle" | "dosha" | "spiritual" | "pregnancy" | "preferences" | "complete";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);

  // Profile data
  const [primaryDosha, setPrimaryDosha] = useState("");
  const [secondaryDosha, setSecondaryDosha] = useState("");
  const [spiritualPreference, setSpiritualPreference] = useState("both");
  const [pregnancyStatus, setPregnancyStatus] = useState("not_pregnant");
  const [dueDate, setDueDate] = useState("");
  const [yogaStyle, setYogaStyle] = useState("");
  const [cyclePhase, setCyclePhase] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");

  const handleDoshaComplete = (primary: string, secondary: string) => {
    setPrimaryDosha(primary);
    setSecondaryDosha(secondary);
    setStep("spiritual");
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
        primary_dosha: primaryDosha,
        secondary_dosha: secondaryDosha,
        spiritual_preference: spiritualPreference,
        pregnancy_status: pregnancyStatus,
        due_date: pregnancyStatus === "pregnant" ? dueDate : null,
        current_trimester: currentTrimester,
        preferred_yoga_style: yogaStyle,
        onboarding_completed: true,
        dosha_assessment_date: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Your wellness profile is complete!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Welcome to Your Wellness Journey</CardTitle>
            <CardDescription className="text-base">
              Let's create your personalized holistic wellness experience. We'll guide you through understanding your
              unique constitution (dosha), spiritual preferences, and current life stage to provide tailored
              recommendations for yoga, nutrition, and daily practices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start space-x-3">
                <Heart className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Personalized Guidance</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive daily recommendations based on your cycle phase, dosha, and life stage
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Moon className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Spiritual Nourishment</h4>
                  <p className="text-sm text-muted-foreground">
                    Access prayers, duas, and affirmations that resonate with your beliefs
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Baby className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Journey Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your cycle, prepare for pregnancy, or navigate each trimester with wisdom
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setStep("cycle")}
              className="w-full"
              size="lg"
            >
              Begin Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "cycle") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Understanding Your Cycle</CardTitle>
            <CardDescription>Help us understand where you are in your menstrual cycle and energy levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Where are you in your cycle?</Label>
              <RadioGroup value={cyclePhase} onValueChange={setCyclePhase}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="menstrual" id="menstrual" />
                    <Label htmlFor="menstrual" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Menstrual Phase (Days 1-5)</div>
                        <div className="text-sm text-muted-foreground">Time of rest and renewal</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="follicular" id="follicular" />
                    <Label htmlFor="follicular" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Follicular Phase (Days 6-14)</div>
                        <div className="text-sm text-muted-foreground">Energy rising, new beginnings</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="ovulation" id="ovulation" />
                    <Label htmlFor="ovulation" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Ovulation (Days 14-16)</div>
                        <div className="text-sm text-muted-foreground">Peak energy and confidence</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="luteal" id="luteal" />
                    <Label htmlFor="luteal" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Luteal Phase (Days 17-28)</div>
                        <div className="text-sm text-muted-foreground">Energy winding down, introspection</div>
                      </div>
                    </Label>
                  </div>
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
              <Button variant="outline" onClick={() => setStep("welcome")}>
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
      </div>
    );
  }

  if (step === "dosha") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light">
        <DoshaAssessment onComplete={handleDoshaComplete} onBack={() => setStep("cycle")} />
      </div>
    );
  }

  if (step === "spiritual") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Spiritual Connection</CardTitle>
            <CardDescription>How would you like to nourish your spirit?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <Button variant="outline" onClick={() => setStep("dosha")}>
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Journey Stage</CardTitle>
            <CardDescription>Where are you in your wellness journey?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={pregnancyStatus} onValueChange={setPregnancyStatus}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="not_pregnant" id="not_pregnant" />
                  <Label htmlFor="not_pregnant" className="flex-1 cursor-pointer">
                    Tracking my cycle for wellness
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="trying_to_conceive" id="trying_to_conceive" />
                  <Label htmlFor="trying_to_conceive" className="flex-1 cursor-pointer">
                    Preparing for pregnancy
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="pregnant" id="pregnant" />
                  <Label htmlFor="pregnant" className="flex-1 cursor-pointer">
                    Currently pregnant
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="postpartum" id="postpartum" />
                  <Label htmlFor="postpartum" className="flex-1 cursor-pointer">
                    Postpartum recovery
                  </Label>
                </div>
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
      </div>
    );
  }

  if (step === "preferences") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Preferences</CardTitle>
            <CardDescription>Help us personalize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Preferred Yoga Style (Optional)</Label>
              <RadioGroup value={yogaStyle} onValueChange={setYogaStyle}>
                <div className="grid grid-cols-2 gap-3">
                  {["Hatha", "Vinyasa", "Yin", "Restorative", "Prenatal", "Gentle"].map((style) => (
                    <div
                      key={style}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <RadioGroupItem value={style.toLowerCase()} id={style} />
                      <Label htmlFor={style} className="cursor-pointer">
                        {style}
                      </Label>
                    </div>
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
      </div>
    );
  }

  if (step === "complete") {
    const doshaDescription = {
      vata: "You are creative, energetic, and flexible. Focus on grounding practices and warm, nourishing foods.",
      pitta: "You are focused, driven, and warm. Focus on cooling practices and calming, hydrating foods.",
      kapha: "You are stable, nurturing, and strong. Focus on energizing practices and light, warming foods.",
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Wellness Profile</CardTitle>
            <CardDescription>Here's what we've discovered about your unique constitution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                onClick={() => navigate("/bookings")}
              >
                Book a Consultation
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
