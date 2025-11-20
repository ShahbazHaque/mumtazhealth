import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sprout, Calendar, BookOpen, BarChart3, User, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  username: string;
}

interface WellnessProfile {
  life_stage: string | null;
  primary_dosha: string | null;
  secondary_dosha: string | null;
  onboarding_completed: boolean | null;
  pregnancy_status: string | null;
  spiritual_preference: string | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wellnessProfile, setWellnessProfile] = useState<WellnessProfile | null>(null);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch wellness profile
      const { data: wellness } = await supabase
        .from("user_wellness_profiles")
        .select("life_stage, primary_dosha, secondary_dosha, onboarding_completed, pregnancy_status, spiritual_preference")
        .eq("user_id", user.id)
        .maybeSingle();

      setUserProfile(profile);
      setWellnessProfile(wellness);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLifeStageDisplay = (stage: string | null) => {
    if (!stage) return "Not set";
    const stages: Record<string, string> = {
      menstrual_cycle: "Menstrual Cycle",
      pregnancy: "Pregnancy",
      postpartum: "Postpartum",
      perimenopause: "Perimenopause",
      menopause: "Menopause",
      post_menopause: "Post-Menopause",
    };
    return stages[stage] || stage;
  };

  const getDoshaDisplay = (dosha: string | null) => {
    if (!dosha) return "Not assessed";
    return dosha.charAt(0).toUpperCase() + dosha.slice(1);
  };

  // If user has completed onboarding, show dashboard
  if (!loading && wellnessProfile?.onboarding_completed) {
    return (
      <div className="min-h-screen bg-wellness-sage-light">
        <div className="container mx-auto px-6 py-12 space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sprout className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                Welcome back, {userProfile?.username || "Friend"}!
              </h1>
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <p className="text-lg text-muted-foreground">
              Your personalized wellness journey continues today
            </p>
          </div>

          {/* Profile Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-card/95 backdrop-blur-sm border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  Life Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">
                  {getLifeStageDisplay(wellnessProfile.life_stage)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Dosha Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-foreground">
                    {getDoshaDisplay(wellnessProfile.primary_dosha)}
                  </p>
                  {wellnessProfile.secondary_dosha && (
                    <Badge variant="secondary" className="text-xs">
                      Secondary: {getDoshaDisplay(wellnessProfile.secondary_dosha)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/95 backdrop-blur-sm border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" />
                  Spiritual Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground capitalize">
                  {wellnessProfile.spiritual_preference === "both" 
                    ? "Integrated" 
                    : wellnessProfile.spiritual_preference || "Not set"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Section */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Quick Access
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate("/tracker")}
                className="h-32 flex-col gap-3 bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                <Calendar className="h-8 w-8" />
                <span className="text-lg font-semibold">Daily Tracker</span>
                <span className="text-xs opacity-80">Log today's wellness</span>
              </Button>

              <Button
                onClick={() => navigate("/insights")}
                className="h-32 flex-col gap-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <BarChart3 className="h-8 w-8" />
                <span className="text-lg font-semibold">Insights</span>
                <span className="text-xs opacity-80">View your progress</span>
              </Button>

              <Button
                onClick={() => navigate("/content-library")}
                className="h-32 flex-col gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                size="lg"
              >
                <BookOpen className="h-8 w-8" />
                <span className="text-lg font-semibold">Content Library</span>
                <span className="text-xs opacity-80">Explore practices</span>
              </Button>

              <Button
                onClick={() => navigate("/settings")}
                className="h-32 flex-col gap-3 bg-muted hover:bg-muted/90 text-muted-foreground"
                size="lg"
              >
                <User className="h-8 w-8" />
                <span className="text-lg font-semibold">Profile</span>
                <span className="text-xs opacity-80">Update settings</span>
              </Button>
            </div>
          </div>

          {/* Daily Inspiration */}
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Today's Intention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-lg text-foreground italic">
                "Honor your body's wisdom and embrace each phase of your journey with grace and self-compassion."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show welcome screen for non-authenticated or non-onboarded users

  return (
    <div className="min-h-screen bg-wellness-sage-light">
      <div className="container mx-auto px-6 py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sprout className="h-10 w-10 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">
              Sacred Cycle Wellness
            </h1>
            <Heart className="h-10 w-10 text-accent" />
          </div>
          
          <p className="text-2xl font-medium text-foreground leading-relaxed">
            Welcome to Your Holistic Journey
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose Your Path to Balance and Empowerment
          </p>
        </div>

        {/* Main CTA */}
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full h-24 text-xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all shadow-lg"
            onClick={() => navigate("/onboarding")}
          >
            <Heart className="mr-3 h-6 w-6" />
            Begin Your Journey
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Personalized guidance for every stage of womanhood
          </p>
        </div>

        {/* Supporting Info */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">🧘‍♀️</div>
            <h3 className="font-semibold mb-2">Yoga & Movement</h3>
            <p className="text-sm text-muted-foreground">
              Practices aligned with your cycle and dosha
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">🌿</div>
            <h3 className="font-semibold mb-2">Ayurvedic Wisdom</h3>
            <p className="text-sm text-muted-foreground">
              Nutrition and lifestyle guidance for balance
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-semibold mb-2">Spiritual Support</h3>
            <p className="text-sm text-muted-foreground">
              Optional Islamic and holistic practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
