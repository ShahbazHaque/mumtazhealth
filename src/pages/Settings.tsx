import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Heart, User } from "lucide-react";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";

const lifeStages = [
  { value: "menstrual_cycle", label: "Menstrual Cycle", description: "Regular monthly cycling" },
  { value: "pregnancy", label: "Pregnancy", description: "Expecting a baby" },
  { value: "postpartum", label: "Postpartum", description: "After childbirth" },
  { value: "perimenopause", label: "Perimenopause", description: "Transition to menopause" },
  { value: "menopause", label: "Menopause", description: "End of menstrual cycles" },
  { value: "post_menopause", label: "Post-Menopause", description: "After menopause" },
];

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lifeStage, setLifeStage] = useState("");
  const [initialLifeStage, setInitialLifeStage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

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

  const hasChanges = lifeStage !== initialLifeStage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-wellness-lilac-light via-background to-wellness-sage-light p-4">
      <div className="max-w-4xl mx-auto py-8">
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
              <p className="text-sm text-muted-foreground">
                Select the life stage that best describes your current journey. This helps us provide
                personalized recommendations tailored to your needs.
              </p>
              <RadioGroup value={lifeStage} onValueChange={setLifeStage}>
                <div className="space-y-3">
                  {lifeStages.map((stage) => (
                    <div
                      key={stage.value}
                      className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <RadioGroupItem value={stage.value} id={stage.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={stage.value} className="font-medium cursor-pointer">
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
              onClick={updateLifeStage}
              disabled={loading || !hasChanges || !lifeStage}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
