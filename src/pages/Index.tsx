import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sprout, Calendar, BookOpen, BarChart3, User, Sparkles, TrendingUp, Flame, Trophy, Award, Download, Users, Flower2, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format, subDays, parseISO, differenceInCalendarDays } from "date-fns";
import founderPortrait from "@/assets/founder-portrait.jpeg";

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
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const calculateStreak = (entries: WellnessEntry[]) => {
    if (entries.length === 0) return { current: 0, longest: 0 };

    // Sort entries by date descending
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );

    // Calculate current streak
    let currentStreakCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's an entry for today or yesterday (to keep streak alive)
    const mostRecentDate = parseISO(sortedEntries[0].entry_date);
    const daysDiff = differenceInCalendarDays(today, mostRecentDate);

    if (daysDiff <= 1) {
      // Start counting from the most recent entry
      let expectedDate = mostRecentDate;
      
      for (const entry of sortedEntries) {
        const entryDate = parseISO(entry.entry_date);
        const diff = differenceInCalendarDays(expectedDate, entryDate);
        
        if (diff === 0) {
          currentStreakCount++;
          expectedDate = subDays(expectedDate, 1);
        } else if (diff === 1) {
          // Skip a day but check if it continues
          expectedDate = subDays(expectedDate, diff);
        } else {
          // Streak broken
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreakCount = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const currentDate = parseISO(sortedEntries[i].entry_date);
      const nextDate = parseISO(sortedEntries[i + 1].entry_date);
      const diff = differenceInCalendarDays(currentDate, nextDate);
      
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreakCount = Math.max(longestStreakCount, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreakCount = Math.max(longestStreakCount, tempStreak);

    return { current: currentStreakCount, longest: longestStreakCount };
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

      // Calculate streaks
      if (allEntries && allEntries.length > 0) {
        const streaks = calculateStreak(allEntries);
        setCurrentStreak(streaks.current);
        setLongestStreak(streaks.longest);
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
      { days: 7, label: "Week Warrior", icon: Award, achieved: currentStreak >= 7 || longestStreak >= 7 },
      { days: 30, label: "Monthly Master", icon: Trophy, achieved: currentStreak >= 30 || longestStreak >= 30 },
      { days: 90, label: "Quarter Champion", icon: Flame, achieved: currentStreak >= 90 || longestStreak >= 90 },
    ];
    return milestones;
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

          {/* Streak Counter */}
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-accent/20 to-primary/20 border-accent/40 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-3 text-2xl">
                <Flame className="h-7 w-7 text-orange-500" />
                Your Wellness Streak
              </CardTitle>
              <CardDescription className="text-center">
                Keep up the momentum and build lasting habits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                    <p className="text-5xl font-bold text-foreground">{currentStreak}</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Current Streak</p>
                  <p className="text-xs text-muted-foreground">
                    {currentStreak === 1 ? "day" : "days"} in a row
                  </p>
                </div>
                
                <div className="h-16 w-px bg-border" />
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-7 w-7 text-accent" />
                    <p className="text-4xl font-bold text-foreground">{longestStreak}</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Longest Streak</p>
                  <p className="text-xs text-muted-foreground">
                    Personal best
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
                        key={milestone.days}
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
                            {milestone.days} Days
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

              {currentStreak === 0 && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    Start your streak today by tracking your wellness! 🌟
                  </p>
                  <Button
                    onClick={() => navigate("/tracker")}
                    className="mt-3 bg-accent hover:bg-accent/90"
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
                I am a 50-year-old woman who has navigated fertility issues, postpartum mental health, 
                peri-menopause, cancer, and hysterectomy rehab. For over 30 years, I've dedicated myself 
                to the holistic wellness industry—studying, practicing, and teaching Yoga, Ayurveda, and 
                spiritual guidance.
              </p>
              <p className="text-2xl font-semibold text-foreground italic">
                "I am here to help, not judge. You are not alone."
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
