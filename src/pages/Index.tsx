import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, BookOpen, BarChart3, User, Sparkles, TrendingUp, Download, Users, Flower2, Activity, Clock, ArrowRight, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import founderPortrait from "@/assets/founder-portrait.jpeg";
import { Logo } from "@/components/Logo";
import { HomeNavigation } from "@/components/HomeNavigation";
import { OnboardingTour } from "@/components/OnboardingTour";
import { QuickCheckIn } from "@/components/QuickCheckIn";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { PoseOfTheDay } from "@/components/PoseOfTheDay";
import { ReturningUserWelcome } from "@/components/ReturningUserWelcome";
import { FavoritesQuickAccess } from "@/components/FavoritesQuickAccess";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ConfidenceJourney } from "@/components/ConfidenceJourney";
import { ConfidenceMilestones } from "@/components/ConfidenceMilestones";
import { LifeStageCheckInPrompt } from "@/components/LifeStageCheckInPrompt";
import { WelcomeEntryDialog } from "@/components/WelcomeEntryDialog";
import { InBetweenPhaseBanner } from "@/components/InBetweenPhaseBanner";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";

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
  primary_focus: string[] | null;
  life_phases: string[] | null;
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
  const [showTour, setShowTour] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);

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

      // Fetch wellness profile including new multi-select fields
      const { data: wellness } = await supabase
        .from("user_wellness_profiles")
        .select("life_stage, primary_dosha, secondary_dosha, onboarding_completed, pregnancy_status, spiritual_preference, primary_focus, life_phases")
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
      menstrual_cycle: "Regular Menstrual Cycle",
      cycle_changes: "Cycle Changes / Hormonal Shifts",
      perimenopause: "Perimenopause",
      peri_menopause_transition: "Peri → Menopause Transition",
      menopause: "Menopause",
      post_menopause: "Post-Menopause",
      pregnancy: "Pregnancy",
      postpartum: "Postpartum",
      not_sure: "Exploring",
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


  // Check if user did quick check-in
  const didQuickCheckIn = typeof window !== 'undefined' && localStorage.getItem('mumtaz_quick_checkin_completed') === 'true';
  const showDashboard = wellnessProfile?.onboarding_completed || (userProfile && didQuickCheckIn);

  // Show loading skeleton while fetching data
  if (loading) {
    return <PageLoadingSkeleton variant="dashboard" />;
  }

  // If user has completed onboarding OR quick check-in, show dashboard
  if (showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <HomeNavigation username={userProfile?.username} />
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
          {/* Welcome Header - Simple and Warm */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Hello, {userProfile?.username || "Friend"}
            </h1>
            <p className="text-lg text-muted-foreground font-accent max-w-xl mx-auto">
              What feels right for you today? No pressure — just gentle options.
            </p>
          </div>

          {/* Hormonal Transition Quick Access - for in-between phase users */}
          {(wellnessProfile?.life_stage === 'cycle_changes' || 
            wellnessProfile?.life_stage === 'peri_menopause_transition' ||
            wellnessProfile?.life_phases?.includes('cycle_changes') ||
            wellnessProfile?.life_phases?.includes('peri_menopause_transition')) && (
            <Card 
              className="max-w-3xl mx-auto bg-gradient-to-br from-teal-50/60 to-teal-100/30 dark:from-teal-900/20 dark:to-teal-800/10 border-teal-200/50 dark:border-teal-800/50 hover:shadow-lg hover:border-teal-300/60 transition-all cursor-pointer group active:scale-[0.99]"
              onClick={() => navigate("/hormonal-transition")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/hormonal-transition")}
            >
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Waves className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Your Transition Tracker
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gently observe your hormonal journey with supportive tools
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gentle Entry Cards - 4 Maximum */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto" data-tour="entry-cards">
            {/* Card 1: Check in with yourself */}
            <Card 
              className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-lg hover:border-accent/40 transition-all cursor-pointer group active:scale-[0.98]"
              onClick={() => navigate("/tracker")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/tracker")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                      Check in with yourself
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      A moment to notice how you're feeling — body, mind, and heart.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Support for your body */}
            <Card 
              className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group active:scale-[0.98]"
              onClick={() => navigate("/content-library?category=mobility")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/content-library?category=mobility")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Support for your body
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gentle movement, mobility, and confidence-building practices.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Learn & explore */}
            <Card 
              className="bg-gradient-to-br from-mumtaz-sage/10 to-mumtaz-sage/5 border-mumtaz-sage/20 hover:shadow-lg hover:border-mumtaz-sage/40 transition-all cursor-pointer group active:scale-[0.98]"
              onClick={() => navigate("/content-library")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/content-library")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-mumtaz-sage/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Learn & explore
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Yoga, nutrition, Ayurveda, and spiritual wisdom — at your pace.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Card 4: My saved practices */}
            <Card 
              className="bg-gradient-to-br from-mumtaz-lilac/10 to-mumtaz-lilac/5 border-mumtaz-lilac/20 hover:shadow-lg hover:border-mumtaz-lilac/40 transition-all cursor-pointer group active:scale-[0.98]"
              onClick={() => navigate("/content-library?filter=favorites")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/content-library?filter=favorites")}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-mumtaz-lilac/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                      My saved practices
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Return to what you've saved and what feels familiar.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complete Onboarding Prompt - Gentle, non-pressuring */}
          {!wellnessProfile?.onboarding_completed && didQuickCheckIn && (
            <Card className="max-w-3xl mx-auto bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
              <CardContent className="py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-foreground mb-1">Would you like deeper guidance?</h3>
                    <p className="text-sm text-muted-foreground">
                      When you're ready, share a bit more about yourself for personalized recommendations.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/onboarding?full=true")}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10 whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tell me more
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Life Stage Check-In Prompt */}
          {wellnessProfile?.life_stage && (
            <div className="max-w-3xl mx-auto">
              <LifeStageCheckInPrompt currentStage={wellnessProfile.life_stage} />
            </div>
          )}

          {/* In-Between Phase Support Banner */}
          {wellnessProfile?.life_stage && (
            <div className="max-w-3xl mx-auto">
              <InBetweenPhaseBanner lifeStage={wellnessProfile.life_stage} />
            </div>
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

          {/* Your Wellness Space - Gentle, non-pressure language */}
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-accent/5 to-primary/5 border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-center flex items-center justify-center gap-3 text-xl">
                <Flower2 className="h-6 w-6 text-accent" />
                Your Wellness Space
              </CardTitle>
              <CardDescription className="text-center">
                A gentle reflection of your journey — no pressure, just awareness.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Calendar className="h-5 w-5 text-primary" />
                    <p className="text-3xl font-bold text-foreground">{totalCheckIns}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Check-ins</p>
                </div>
                
                <div className="h-12 w-px bg-border/50" />
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-accent" />
                    <p className="text-3xl font-bold text-foreground">{totalVisits}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Days visited</p>
                </div>
              </div>

              {totalCheckIns === 0 && (
                <div className="text-center pt-4 mt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground mb-3">
                    When you're ready, your first check-in is waiting.
                  </p>
                  <Button
                    onClick={() => navigate("/tracker")}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10"
                    size="sm"
                  >
                    Start when ready
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Tools - Compact row */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => navigate("/condition-tracker")}
                variant="outline"
                size="sm"
                className="border-primary/30 text-foreground hover:bg-primary/10 gap-2"
              >
                <Activity className="h-4 w-4 text-primary" />
                Symptom Tracker
              </Button>
              <Button
                onClick={() => navigate("/insights")}
                variant="outline"
                size="sm"
                className="border-accent/30 text-foreground hover:bg-accent/10 gap-2"
              >
                <BarChart3 className="h-4 w-4 text-accent" />
                View Insights
              </Button>
              <Button
                onClick={() => navigate("/bookings")}
                variant="outline"
                size="sm"
                className="border-primary/30 text-foreground hover:bg-primary/10 gap-2"
              >
                <Calendar className="h-4 w-4 text-primary" />
                Book a Session
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

  const openEntryDialog = () => setShowEntryDialog(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Entry Dialog */}
      <WelcomeEntryDialog open={showEntryDialog} onOpenChange={setShowEntryDialog} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-wellness-sage-light via-background to-wellness-lilac-light py-16 md:py-28">
        <div className="container mx-auto px-4">
          {/* Logo at top */}
          <div className="flex justify-center mb-12 md:mb-16">
            <Logo size="2xl" className="opacity-95" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left: Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                A Safe Space for Your Wellness Journey
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Every woman's journey is unique. Built on 30+ years of holistic expertise in Yoga, Ayurveda, and 
                spiritual guidance — this app evolves with you through every phase of life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={openEntryDialog}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={openEntryDialog}
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
              A Safe Space Without Judgment
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Built on 30+ years of holistic expertise. I am an <strong>Ayurvedic Practitioner</strong> (focusing 
                on holistic lifestyle, nutrition, and tailored herbal remedies), an <strong>International Yoga 
                Teacher Trainer</strong>, and a specialist in <strong>transformational work</strong> including inner 
                child healing and hands-on rehabilitation.
              </p>
              <p>
                I created Mumtaz Health because I have faced many challenges myself and have been honoured to 
                support countless women through their unique journeys — fertility, pregnancy, postpartum, 
                menopause, recovery, and beyond. This app reflects my personalized, one-size-does-not-fit-all 
                approach to women's holistic wellness.
              </p>
              <p className="text-2xl font-semibold text-foreground italic">
                "I'm here to support, not judge. Your journey is yours, and you are not alone."
              </p>
              <p>
                This isn't just knowledge from books — it's wisdom earned through lived experience, deep study, 
                and decades of walking alongside women just like you. While I may not have experienced everything 
                personally, I have held space for many who have.
              </p>
              <p className="text-base text-muted-foreground/80 italic">
                This app offers supportive guidance and is not a substitute for professional medical advice. 
                Please consult your healthcare provider for medical concerns.
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
              An App That Evolves With You
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The more you engage, the more you unlock tailored guidance suited to your current needs. 
              Changing phases is natural — this app is designed to support you without pressure or comparison.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: Life-Phase Tracker */}
            <Card 
              className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98] hover:border-primary/30"
              onClick={openEntryDialog}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openEntryDialog()}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">Life-Phase Tracker</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Track symptoms, mood, and wellness goals specific to your current phase — fertility, 
                  pregnancy, postpartum, menopause, recovery, and more. Understand your patterns and 
                  unlock insights that grow with you.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: Holistic Guidance */}
            <Card 
              className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98] hover:border-accent/30"
              onClick={openEntryDialog}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openEntryDialog()}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flower2 className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl mb-3 group-hover:text-accent transition-colors">Holistic Guidance</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Explore curated guidance across Yoga, Ayurveda-inspired nutrition, and spiritual wellness — 
                  at your own pace, with no pressure. The more you explore, the more personalized it becomes.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Movement & Rehab */}
            <Card 
              className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98] hover:border-primary/30"
              onClick={openEntryDialog}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openEntryDialog()}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">Movement & Recovery</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Access gentle movement flows and supportive practices designed for sensitive life moments — 
                  whether you're building confidence, recovering, or simply seeking nurturing movement.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: The Mumtaz Community */}
            <Card 
              className="bg-card/90 backdrop-blur-sm border-border hover:shadow-xl transition-all group cursor-pointer active:scale-[0.98] hover:border-accent/30"
              onClick={openEntryDialog}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openEntryDialog()}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl mb-3 group-hover:text-accent transition-colors">A Supportive Community</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Connect with like-minded women in a safe, non-judgmental space. Share, learn, and 
                  feel supported — without comparison or pressure. Everyone's path is unique.
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
              Begin Your Journey — At Your Own Pace
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              This app is here to support your understanding, self-compassion, and growth. 
              Explore at your own pace — there's no rush, no comparison, just gentle guidance.
            </p>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              As you continue using the app, you'll unlock more tailored insights suited to where you are right now. 
              Changing phases is natural and not a failure — it's simply the next chapter of your story.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <Button 
                size="lg"
                variant="outline"
                onClick={openEntryDialog}
                className="border-2 border-primary/50 hover:bg-primary/10 h-auto py-6 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span className="font-semibold">Join Our Online<br />Study Groups</span>
              </Button>

              <Button 
                size="lg"
                variant="outline"
                onClick={openEntryDialog}
                className="border-2 border-accent/50 hover:bg-accent/10 h-auto py-6 flex flex-col gap-2"
              >
                <Sparkles className="h-6 w-6" />
                <span className="font-semibold">Explore Wellness<br />Retreats</span>
              </Button>

              <Button 
                size="lg"
                onClick={openEntryDialog}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-auto py-6 flex flex-col gap-2 shadow-lg"
              >
                <Download className="h-6 w-6" />
                <span className="font-semibold">Get Started<br />with Mumtaz Health</span>
              </Button>
            </div>

            <p className="text-lg text-foreground italic font-medium">
              Your journey is unique and worthy of celebration. I'm here to walk alongside you.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
