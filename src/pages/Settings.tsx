import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Heart, HelpCircle, Settings as SettingsIcon, Crown } from "lucide-react";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { NotificationSettings } from "@/components/NotificationSettings";
import { Navigation } from "@/components/Navigation";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { AccountSettings } from "@/components/AccountSettings";
import { SubscriptionManagement } from "@/components/SubscriptionManagement";
import { JourneyPhaseSelector, PRIMARY_FOCUS_OPTIONS, LIFE_PHASE_OPTIONS } from "@/components/JourneyPhaseSelector";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lifeStage, setLifeStage] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState<string[]>([]);
  const [lifePhases, setLifePhases] = useState<string[]>([]);
  const [initialPrimaryFocus, setInitialPrimaryFocus] = useState<string[]>([]);
  const [initialLifePhases, setInitialLifePhases] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isEditingJourney, setIsEditingJourney] = useState(false);

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
        .select("life_stage, primary_focus, life_phases")
        .eq("user_id", user.id)
        .single();

      if (wellnessError) throw wellnessError;

      if (wellnessData) {
        setLifeStage(wellnessData.life_stage || "");
        
        // Handle new multi-select fields
        const fetchedPrimaryFocus = (wellnessData.primary_focus as string[]) || [];
        const fetchedLifePhases = (wellnessData.life_phases as string[]) || [];
        
        setPrimaryFocus(fetchedPrimaryFocus);
        setLifePhases(fetchedLifePhases);
        setInitialPrimaryFocus(fetchedPrimaryFocus);
        setInitialLifePhases(fetchedLifePhases);
        
        // If no new fields but has legacy life_stage, pre-populate life_phases
        if (fetchedLifePhases.length === 0 && wellnessData.life_stage) {
          const legacyPhase = wellnessData.life_stage;
          // Map legacy values to new values
          const mappedPhase = legacyPhase === "menstrual_cycle" ? "regular_cycle" : legacyPhase;
          setLifePhases([mappedPhase]);
        }
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

  const updateJourneyPhase = async (newPrimaryFocus: string[], newLifePhases: string[]) => {
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

      // Derive legacy life_stage from new selections
      const derivedLifeStage = newLifePhases.length > 0 ? newLifePhases[0] : lifeStage;

      const { error } = await supabase
        .from("user_wellness_profiles")
        .update({ 
          life_stage: derivedLifeStage,
          primary_focus: newPrimaryFocus.length > 0 ? newPrimaryFocus : null,
          life_phases: newLifePhases.length > 0 ? newLifePhases : null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setPrimaryFocus(newPrimaryFocus);
      setLifePhases(newLifePhases);
      setInitialPrimaryFocus(newPrimaryFocus);
      setInitialLifePhases(newLifePhases);
      setIsEditingJourney(false);
      toast.success("Journey phase updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update journey phase");
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

  const hasChanges = 
    JSON.stringify(primaryFocus) !== JSON.stringify(initialPrimaryFocus) ||
    JSON.stringify(lifePhases) !== JSON.stringify(initialLifePhases);

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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-semibold">Your Journey</Label>
                </div>
                {!isEditingJourney && (primaryFocus.length > 0 || lifePhases.length > 0) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingJourney(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can choose more than one option. Many women experience overlapping phases.
              </p>
              
              {isEditingJourney ? (
                <div className="space-y-4">
                  <JourneyPhaseSelector
                    onComplete={(newPrimaryFocus, newLifePhases) => {
                      updateJourneyPhase(newPrimaryFocus, newLifePhases);
                    }}
                    onBack={() => setIsEditingJourney(false)}
                    initialPrimaryFocus={primaryFocus}
                    initialLifePhases={lifePhases}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display current selections */}
                  {primaryFocus.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Primary Focus</Label>
                      <div className="flex flex-wrap gap-2">
                        {primaryFocus.map(value => {
                          const option = PRIMARY_FOCUS_OPTIONS.find(o => o.value === value);
                          return option ? (
                            <span key={value} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-wellness-lilac/20 text-wellness-lilac text-sm font-medium">
                              {option.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {lifePhases.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Life Phase</Label>
                      <div className="flex flex-wrap gap-2">
                        {lifePhases.map(value => {
                          const option = LIFE_PHASE_OPTIONS.find(o => o.value === value);
                          return option ? (
                            <span key={value} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-wellness-sage/20 text-wellness-sage text-sm font-medium">
                              {option.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {primaryFocus.length === 0 && lifePhases.length === 0 && (
                    <div className="text-center py-6 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground mb-3">No journey phase selected yet</p>
                      <Button onClick={() => setIsEditingJourney(true)}>
                        Set Your Journey
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-center text-sm text-muted-foreground italic">
                You can update this at any time as your body and life evolve.
              </p>
            </div>
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
