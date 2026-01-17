import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Heart, HelpCircle, Settings as SettingsIcon, Sparkles, Crown } from "lucide-react";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { NotificationSettings } from "@/components/NotificationSettings";
import { Navigation } from "@/components/Navigation";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { AccountSettings } from "@/components/AccountSettings";
import { LifeStageHelper } from "@/components/LifeStageHelper";
import { SubscriptionManagement } from "@/components/SubscriptionManagement";

const lifeStages = [
  { value: "menstrual_cycle", label: "Regular Menstrual Cycle", description: "Consistent monthly cycling" },
  { value: "cycle_changes", label: "In-between: Cycle Changes / Hormonal Shifts", description: "Experiencing changes in your cycle" },
  { value: "perimenopause", label: "Perimenopause", description: "Cycles becoming irregular, symptoms beginning" },
  { value: "peri_menopause_transition", label: "In-between: Peri → Menopause Transition", description: "Moving from perimenopause toward menopause" },
  { value: "menopause", label: "Menopause", description: "No period for 12 months or more" },
  { value: "post_menopause", label: "Post-Menopause", description: "Settled into life after menopause" },
  { value: "pregnancy", label: "Pregnancy", description: "Expecting a baby" },
  { value: "postpartum", label: "Postpartum", description: "After childbirth" },
  { value: "not_sure", label: "Not sure / Exploring", description: "Get gentle guidance to find what fits" },
];

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lifeStage, setLifeStage] = useState("");
  const [initialLifeStage, setInitialLifeStage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      // Fetch wellness profile
      const { data: wellnessData, error: wellnessError } = await supabase
        .from("user_wellness_profiles")
        .select("life_stage")
        .eq("user_id", user.id)
        .single();

      if (wellnessError) throw wellnessError;

      if (wellnessData?.life_stage) {
        setLifeStage(wellnessData.life_stage);
        setInitialLifeStage(wellnessData.life_stage);
      }

      // Fetch profile (username and avatar)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setUsername(profileData.username || "");
        setAvatarUrl(profileData.avatar_url || null);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  };

  const updateLifeStage = async () => {
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

      const { error } = await supabase
        .from("user_wellness_profiles")
        .update({ life_stage: lifeStage })
        .eq("user_id", user.id);

      if (error) throw error;

      setInitialLifeStage(lifeStage);
      toast.success("Life stage updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update life stage");
    } finally {
      setLoading(false);
    }
  };

  const handleRestartTour = () => {
    localStorage.setItem('mumtaz_trigger_tour', 'true');
    localStorage.removeItem('mumtaz_tour_completed');
    toast.success("Tour will start when you return to the dashboard");
    navigate("/");
  };

  const hasChanges = lifeStage !== initialLifeStage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light p-4">
      <Navigation />
      <div className="max-w-4xl mx-auto py-8 pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate("/tracker")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tracker
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-wellness-lilac to-wellness-sage bg-clip-text text-transparent">
              Settings
            </CardTitle>
            <CardDescription>Manage your wellness profile preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center pb-6 border-b border-border">
              <ProfilePhotoUpload
                currentAvatarUrl={avatarUrl}
                username={username}
                onAvatarUpdate={setAvatarUrl}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">Life Stage</Label>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select the life stage that best describes your current journey. 
                Your body may be in transition — that's completely normal, and you can update this anytime.
              </p>
              
              {showHelper ? (
                <LifeStageHelper 
                  onSelectStage={(stage) => {
                    setLifeStage(stage);
                    setShowHelper(false);
                  }}
                  onCancel={() => setShowHelper(false)}
                />
              ) : (
                <RadioGroup 
                  value={lifeStage} 
                  onValueChange={(value) => {
                    if (value === "not_sure") {
                      setShowHelper(true);
                    } else {
                      setLifeStage(value);
                    }
                  }}
                >
                  <div className="space-y-3">
                    {lifeStages.map((stage) => (
                      <div
                        key={stage.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                          stage.value === "not_sure" 
                            ? "border-wellness-lilac/30 bg-wellness-lilac/5 hover:bg-wellness-lilac/10" 
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <RadioGroupItem value={stage.value} id={stage.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={stage.value} className="font-medium cursor-pointer flex items-center gap-2">
                            {stage.label}
                            {stage.value === "not_sure" && (
                              <Sparkles className="w-4 h-4 text-wellness-lilac" />
                            )}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>

            <Button
              onClick={updateLifeStage}
              disabled={loading || !hasChanges || !lifeStage}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <NotificationSettings />
        
        <DarkModeToggle />

        {/* Subscription Management Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Subscription
          </h2>
          <SubscriptionManagement />
        </div>

        {/* Account Settings Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Account Settings
          </h2>
          <AccountSettings />
        </div>

        {/* Tour Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              App Tour
            </CardTitle>
            <CardDescription>
              Retake the guided tour to learn about app features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={handleRestartTour}
              className="w-full"
            >
              Restart App Tour
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
