import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sprout, Calendar, BookOpen, BarChart3, User, Sparkles, TrendingUp, Flame, Trophy, Award, Download, Users, Flower2, Activity, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format, subDays, parseISO, differenceInCalendarDays } from "date-fns";
import founderPortrait from "@/assets/founder-portrait.jpeg";
import { Logo } from "@/components/Logo";
import { Navigation } from "@/components/Navigation";
import { OnboardingTour } from "@/components/OnboardingTour";
import { QuickCheckIn } from "@/components/QuickCheckIn";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { PoseOfTheDay } from "@/components/PoseOfTheDay";
import { ReturningUserWelcome } from "@/components/ReturningUserWelcome";
import { FavoritesQuickAccess } from "@/components/FavoritesQuickAccess";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ConfidenceJourney } from "@/components/ConfidenceJourney";
import { ConfidenceMilestones } from "@/components/ConfidenceMilestones";

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

interface WellnessEntry {
  id: string;
  entry_date: string;
  emotional_score: number | null;
  emotional_state: string | null;
  pain_level: number | null;
  cycle_phase: string | null;
  daily_practices: any;
}

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wellnessProfile, setWellnessProfile] = useState<WellnessProfile | null>(null);
  const [recentEntries, setRecentEntries] = useState<WellnessEntry[]>([]);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkUserProfile();
    
    // Check if tour was triggered from Settings
    const triggerTour = localStorage.getItem('mumtaz_trigger_tour');
    if (triggerTour === 'true') {
      localStorage.removeItem('mumtaz_trigger_tour');
      setTimeout(() => setShowTour(true), 500);
    }
    
    // Check if returning user should see welcome dialog
    const lastVisit = localStorage.getItem('mumtaz_last_visit');
    const welcomeShownToday = localStorage.getItem('mumtaz_welcome_shown_today');
    const today = new Date().toDateString();
    
    if (lastVisit && welcomeShownToday !== today) {
      // User has visited before and hasn't seen welcome today
      setIsReturningUser(true);
      // Show welcome dialog after a short delay
      setTimeout(() => setShowWelcomeDialog(true), 800);
      localStorage.setItem('mumtaz_welcome_shown_today', today);
    }
    
    // Update last visit
    localStorage.setItem('mumtaz_last_visit', new Date().toISOString());
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('mumtaz_tour_completed', 'true');
  };

  const calculateTotals = (entries: WellnessEntry[]) => {
    if (entries.length === 0) return { checkIns: 0, visits: 0 };

    // Total check-ins is simply the count of all entries
    const checkIns = entries.length;

    // Total visits is the count of unique dates
    const uniqueDates = new Set(entries.map(entry => entry.entry_date));
    const visits = uniqueDates.size;

    return { checkIns, visits };
  };

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

      // Fetch ALL wellness entries for streak calculation
      const { data: allEntries } = await supabase
        .from("wellness_entries")
        .select("id, entry_date, emotional_score, emotional_state, pain_level, cycle_phase, daily_practices")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false });

      // Calculate totals
      if (allEntries && allEntries.length > 0) {
        const totals = calculateTotals(allEntries);
        setTotalCheckIns(totals.checkIns);
        setTotalVisits(totals.visits);
        setRecentEntries(allEntries.slice(0, 5));
      }

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

  const getEmotionalScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-orange-600";
  };

  const getPainLevelColor = (level: number | null) => {
    if (!level) return "text-muted-foreground";
    if (level <= 3) return "text-green-600";
    if (level <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getMilestones = () => {
    const milestones = [
      { count: 7, label: "Getting Started", icon: Award, achieved: totalCheckIns >= 7 },
      { count: 30, label: "Making Progress", icon: Trophy, achieved: totalCheckIns >= 30 },
      { count: 90, label: "Wellness Champion", icon: Flower2, achieved: totalCheckIns >= 90 },
    ];
    return milestones;
  };

  // Check if user did quick check-in
  const didQuickCheckIn = typeof window !== 'undefined' && localStorage.getItem('mumtaz_quick_checkin_completed') === 'true';
  const showDashboard = wellnessProfile?.onboarding_completed || (userProfile && didQuickCheckIn);

  // If user has completed onboarding OR quick check-in, show dashboard
  if (!loading && showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <OnboardingTour run={showTour} onComplete={handleTourComplete} />
        
        {/* Returning User Welcome Dialog */}
        {showWelcomeDialog && isReturningUser && (
          <ReturningUserWelcome onClose={() => setShowWelcomeDialog(false)} />
        )}
        
        {/* Favorites Quick Access Button */}
        <FavoritesQuickAccess />
        
        {/* Watermark */}
        <div className="watermark-lotus">
          <Logo size="xl" showText={false} />
        </div>
        
        <div className="container mx-auto px-6 py-12 pt-24 space-y-8">
          {/* Logo and Welcome Header with Parallax */}
          <div 
            className="text-center space-y-6 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${scrollY * 0.15}px)`
            }}
          >
            <Logo size="md" className="mx-auto animate-fade-in-up" />
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl font-bold text-foreground">
                Welcome back, {userProfile?.username || "Friend"}!
              </h1>
              <p className="text-lg text-muted-foreground font-accent">
                Your personalized wellness journey continues today
              </p>
            </div>
          </div>

          {/* Profile Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" data-tour="profile-summary">
            <Card className="bg-card backdrop-blur-sm border-mumtaz-lilac/20 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-mumtaz-plum">
                  <User className="h-5 w-5 text-mumtaz-lilac" />
                  Life Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">
                  {getLifeStageDisplay(wellnessProfile.life_stage)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card backdrop-blur-sm border-mumtaz-lilac/20 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-mumtaz-plum">
                  <Sparkles className="h-5 w-5 text-mumtaz-lilac" />
                  Dosha Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-foreground">
                    {getDoshaDisplay(wellnessProfile.primary_dosha)}
                  </p>
                  {wellnessProfile.secondary_dosha && (
                    <Badge variant="secondary" className="text-xs bg-mumtaz-sand text-mumtaz-plum">
                      Secondary: {getDoshaDisplay(wellnessProfile.secondary_dosha)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card backdrop-blur-sm border-mumtaz-lilac/20 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-mumtaz-plum">
                  <Heart className="h-5 w-5 text-mumtaz-lilac" />
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

          {/* Complete Onboarding Prompt - Show if quick check-in done but not full onboarding */}
          {!wellnessProfile?.onboarding_completed && didQuickCheckIn && (
            <Card className="max-w-5xl mx-auto bg-gradient-to-r from-wellness-lilac/20 to-wellness-sage/20 border-wellness-lilac/40">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-foreground mb-1">Ready for deeper guidance?</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete your personal onboarding to discover your dosha and receive tailored recommendations
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/onboarding?full=true")}
                    className="bg-wellness-lilac hover:bg-wellness-lilac/90 text-white whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Complete My Personal Onboarding
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Check-In */}
          <div className="max-w-5xl mx-auto">
            <QuickCheckIn username={userProfile?.username} />
          </div>

          {/* Confidence Journey - for users building confidence */}
          <div className="max-w-5xl mx-auto">
            <ConfidenceJourney />
          </div>

          {/* Confidence Milestones - weekly progress */}
          <div className="max-w-5xl mx-auto">
            <ConfidenceMilestones />
          </div>

          {/* Pose of the Day */}
          <div className="max-w-5xl mx-auto" data-tour="pose-of-day">
            <PoseOfTheDay />
          </div>

          {/* Personalized Recommendations */}
          <div className="max-w-5xl mx-auto">
            <PersonalizedRecommendations />
          </div>

          {/* Recently Viewed */}
          <div className="max-w-5xl mx-auto">
            <RecentlyViewed />
          </div>

          {/* Progress Tracker */}
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-mumtaz-lilac/20 to-mumtaz-sage/20 border-mumtaz-lilac/40 shadow-lg" data-tour="progress-tracker">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-3 text-2xl">
                <Activity className="h-7 w-7 text-accent" />
                Your Wellness Journey
              </CardTitle>
              <CardDescription className="text-center">
                Track your progress and celebrate your commitment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-8 w-8 text-primary" />
                    <p className="text-5xl font-bold text-foreground">{totalCheckIns}</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Total Check-Ins</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCheckIns === 1 ? "entry" : "entries"} logged
                  </p>
                </div>
                
                <div className="h-16 w-px bg-border" />
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-7 w-7 text-accent" />
                    <p className="text-4xl font-bold text-foreground">{totalVisits}</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Total Visits</p>
                  <p className="text-xs text-muted-foreground">
                    {totalVisits === 1 ? "day" : "days"} tracked
                  </p>
                </div>
              </div>

              {/* Milestones */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3 text-center">
                  Milestone Achievements
                </p>
                <div className="flex items-center justify-center gap-4">
                  {getMilestones().map((milestone) => {
                    const Icon = milestone.icon;
                    return (
                      <div
                        key={milestone.count}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                          milestone.achieved
                            ? "bg-accent/30 border-2 border-accent"
                            : "bg-muted/30 border border-border opacity-50"
                        }`}
                      >
                        <Icon
                          className={`h-8 w-8 ${
                            milestone.achieved ? "text-accent" : "text-muted-foreground"
                          }`}
                        />
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">
                            {milestone.count} Check-Ins
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {milestone.label}
                          </p>
                        </div>
                        {milestone.achieved && (
                          <Badge variant="secondary" className="text-xs bg-accent/20">
                            Unlocked!
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {totalCheckIns === 0 && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    Start your wellness journey today by logging your first check-in! 🌟
                  </p>
                  <Button
                    onClick={() => navigate("/tracker")}
                    variant="cta"
                    className="mt-3"
                    size="sm"
                  >
                    Begin Tracking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Access Section */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Quick Access
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate("/tracker")}
                variant="cta"
                className="h-32 flex-col gap-3"
                size="lg"
                data-tour="daily-tracker"
              >
                <Calendar className="h-8 w-8" />
                <span className="text-lg font-semibold">Daily Tracker</span>
                <span className="text-xs opacity-80">Log today's wellness</span>
              </Button>

              <Button
                onClick={() => navigate("/condition-tracker")}
                className="h-32 flex-col gap-3 bg-mumtaz-sage hover:bg-mumtaz-sage/90 text-white"
                size="lg"
                data-tour="symptom-tracker"
              >
                <Activity className="h-8 w-8" />
                <span className="text-lg font-semibold">Symptom Tracker</span>
                <span className="text-xs opacity-80">Track PCOS & Endo</span>
              </Button>

              <Button
                onClick={() => navigate("/insights")}
                className="h-32 flex-col gap-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                data-tour="insights"
              >
                <BarChart3 className="h-8 w-8" />
                <span className="text-lg font-semibold">Insights</span>
                <span className="text-xs opacity-80">View your progress</span>
              </Button>

              <Button
                onClick={() => navigate("/content-library")}
                variant="cta"
                className="h-32 flex-col gap-3"
                size="lg"
                data-tour="content-library"
              >
                <BookOpen className="h-8 w-8" />
                <span className="text-lg font-semibold">Content Library</span>
                <span className="text-xs opacity-80">Explore practices</span>
              </Button>

              <Button
                onClick={() => navigate("/my-daily-practice")}
                className="h-32 flex-col gap-3 bg-mumtaz-sage hover:bg-mumtaz-sage/90 text-white"
                size="lg"
              >
                <Clock className="h-8 w-8" />
                <span className="text-lg font-semibold">My Practice</span>
                <span className="text-xs opacity-80">Daily reminders</span>
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

          {/* Recent Wellness Entries */}
          {recentEntries.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-accent" />
                  Recent Wellness Entries
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/insights")}
                  className="text-accent border-accent hover:bg-accent/10"
                >
                  View All
                </Button>
              </div>
              <div className="grid gap-4">
                {recentEntries.map((entry) => (
                  <Card key={entry.id} className="bg-card/95 backdrop-blur-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-foreground">
                              {format(new Date(entry.entry_date), "EEEE, MMMM d, yyyy")}
                            </span>
                            {entry.cycle_phase && (
                              <Badge variant="secondary" className="capitalize">
                                {entry.cycle_phase.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Emotional Score</p>
                              <p className={`text-2xl font-bold ${getEmotionalScoreColor(entry.emotional_score)}`}>
                                {entry.emotional_score ? `${entry.emotional_score}/10` : "N/A"}
                              </p>
                            </div>
                            {entry.emotional_state && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Emotional State</p>
                                <p className="text-sm font-medium text-foreground capitalize">
                                  {entry.emotional_state}
                                </p>
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Pain Level</p>
                              <p className={`text-2xl font-bold ${getPainLevelColor(entry.pain_level)}`}>
                                {entry.pain_level ? `${entry.pain_level}/10` : "N/A"}
                              </p>
                            </div>
                            {entry.daily_practices && Object.keys(entry.daily_practices).length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Daily Practices</p>
                                <p className="text-sm font-medium text-foreground">
                                  {Object.values(entry.daily_practices).filter((p: any) => p?.status).length} completed
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-wellness-sage-light via-background to-wellness-lilac-light py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left: Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Mumtaz Health: Your Sanctuary for Holistic Wellness
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Built on 30+ years of personal experience in Yoga, Ayurveda, and spiritual guidance. 
                Support for every woman, in every phase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Now
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-2 border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 py-6"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Join the Community
                </Button>
              </div>
            </div>

            {/* Right: Founder Portrait */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur-3xl"></div>
                <img 
                  src={founderPortrait} 
                  alt="Founder portrait - A warm, welcoming guide on your wellness journey" 
                  className="relative rounded-3xl shadow-2xl w-full max-w-md object-cover aspect-[3/4]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Story Section */}
      <section className="py-20 md:py-32 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
              Guided by Experience, Not Judgment
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Built on 30+ years of holistic expertise. I am an <strong>Ayurvedic Practitioner</strong> (focusing 
                on holistic lifestyle, nutrition, and tailored herbal remedies), an <strong>International Yoga 
                Teacher Trainer</strong>, and a specialist in <strong>transformational work</strong> including inner 
                child healing and hands-on rehabilitation.
              </p>
              <p>
                I created Mumtaz Health because I understand the journey—having navigated fertility challenges, 
                postpartum mental health, peri-menopause, and recovery through hysterectomy rehab. This app introduces 
                my personalized, one-size-does-not-fit-all approach to women's holistic wellness.
              </p>
              <p className="text-2xl font-semibold text-foreground italic">
                "I'm here to help, not judge. You are not alone."
              </p>
              <p>
                Every challenge you face, I've walked through myself. This isn't just knowledge from books—
                it's wisdom earned through lived experience, deep study, and decades of supporting women 
                just like you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-background to-wellness-lilac-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Integrated Support for Your Unique Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive guidance that honors the complexity of your life, your body, and your spirit
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: Life-Phase Tracker */}
            <Card className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">Life-Phase Tracker</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Track symptoms, mood, and health goals specific to your current phase (Fertility, 
                  Postpartum, Peri-Menopause). Understand your patterns and honor your body's wisdom.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: Holistic Guidance */}
            <Card className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flower2 className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl mb-3">Holistic Guidance</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Tap into curated guidance across Yoga, Ayurvedic Nutrition, and Spiritual Wisdom—
                  available on demand for every challenge you face on your journey.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Movement & Rehab */}
            <Card className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">Movement & Rehab</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Access video flows and mobility work designed for sensitive life moments, like 
                  hysterectomy rehab or postpartum recovery. Gentle, therapeutic, and deeply nurturing.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: The Mumtaz Community */}
            <Card className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl mb-3">The Mumtaz Community</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Connect, study, and share with like-minded women in a non-judgmental space. 
                  Feel valued, supported, and inspired on your wellness journey.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8">
              Deepen Your Connection
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Your life, your journey is a privilege. Let us help you celebrate it.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/onboarding')}
                className="border-2 border-primary/50 hover:bg-primary/10 h-auto py-6 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span className="font-semibold">Join Our Online<br />Study Groups</span>
              </Button>

              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/bookings')}
                className="border-2 border-accent/50 hover:bg-accent/10 h-auto py-6 flex flex-col gap-2"
              >
                <Sparkles className="h-6 w-6" />
                <span className="font-semibold">Explore Wellness<br />Retreats</span>
              </Button>

              <Button 
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-auto py-6 flex flex-col gap-2 shadow-lg"
              >
                <Download className="h-6 w-6" />
                <span className="font-semibold">Download the<br />Mumtaz Health App</span>
              </Button>
            </div>

            <p className="text-lg text-foreground italic font-medium">
              Your life, your journey is a privilege. Let us help you celebrate it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
