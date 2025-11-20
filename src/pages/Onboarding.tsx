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

type OnboardingStep = "welcome" | "lifeStage" | "cycle" | "dosha" | "spiritual" | "pregnancy" | "preferences" | "complete";

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

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const getStepInfo = () => {
    const stepMap: Record<OnboardingStep, number> = {
      welcome: 0,
      lifeStage: 1,
      cycle: 2,
      dosha: 3,
      spiritual: 4,
      pregnancy: 5,
      preferences: 6,
      complete: 7,
    };
    return { current: stepMap[step], total: 7 };
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

      toast.success("Your wellness profile is complete! Let's start tracking your journey.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <Card className="w-full max-w-2xl border-none shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex justify-center">
              <Sparkles className="w-20 h-20 text-accent" />
            </div>
            <CardTitle className="text-4xl font-bold text-foreground leading-tight">
              Empowering You Through Each Phase of Womanhood
            </CardTitle>
            {userName && (
              <p className="text-xl text-muted-foreground">
                Welcome, {userName}! 
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
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
              <Button
                onClick={() => setStep("lifeStage")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
                disabled={!userName.trim()}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "lifeStage") {
    const lifeStages = [
      { value: "menstrual_cycle", label: "Menstrual Cycle", description: "Regular monthly cycling", icon: "🌸" },
      { value: "pregnancy", label: "Pregnancy", description: "Expecting a baby", icon: "🤰" },
      { value: "postpartum", label: "Postpartum", description: "After childbirth", icon: "👶" },
      { value: "perimenopause", label: "Perimenopause", description: "Transition to menopause", icon: "🌅" },
      { value: "menopause", label: "Menopause", description: "End of menstrual cycles", icon: "🌙" },
      { value: "post_menopause", label: "Post-Menopause", description: "After menopause", icon: "✨" },
    ];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">
              Your Life Stage
            </CardTitle>
            <CardDescription>
              Select the stage that best describes your current journey. This helps us provide personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
            <div className="space-y-2">
              <Label>Which life stage are you in?</Label>
              <RadioGroup value={lifeStage} onValueChange={setLifeStage}>
                <div className="space-y-3">
                  {lifeStages.map((stage) => (
                    <div
                      key={stage.value}
                      className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <RadioGroupItem value={stage.value} id={stage.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={stage.value} className="font-medium cursor-pointer flex items-center gap-2">
                          <span className="text-xl">{stage.icon}</span>
                          {stage.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
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
              className="w-full"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "cycle") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Understanding Your Cycle</CardTitle>
            <CardDescription>Help us understand where you are in your menstrual cycle and energy levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Journey Stage</CardTitle>
            <CardDescription>Where are you in your wellness journey?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-sage-light">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">Your Preferences</CardTitle>
            <CardDescription>Help us personalize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressIndicator currentStep={getStepInfo().current} totalSteps={getStepInfo().total} />
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
