import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Star, Sparkles, Sun, Flower2, 
  CheckCircle2, Trophy, Leaf, Shield, Moon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, format, differenceInDays, isWithinInterval } from "date-fns";

interface Milestone {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  achieved: boolean;
  celebrationMessage: string;
  threshold: number;
  type: "practices" | "days" | "checkins" | "streak" | "first";
}

interface WeeklyStats {
  practicesCompleted: number;
  uniqueDaysPracticed: number;
  checkinsLogged: number;
  firstPracticeEver: boolean;
  consecutiveDays: number;
}

export function ConfidenceMilestones() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSection, setShowSection] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  useEffect(() => {
    checkUserAndLoadStats();
  }, []);

  const checkUserAndLoadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has "confidence" preference
      const { data: profile } = await supabase
        .from("user_wellness_profiles")
        .select("preferred_yoga_style")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.preferred_yoga_style !== "confidence") {
        setLoading(false);
        return;
      }

      setShowSection(true);
      await loadWeeklyStats(user.id);
    } catch (error) {
      console.error("Error loading milestones:", error);
      setLoading(false);
    }
  };

  const loadWeeklyStats = async (userId: string) => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      // Get practices completed this week
      const { data: progress } = await supabase
        .from("user_content_progress")
        .select("completed_at, content_id")
        .eq("user_id", userId)
        .eq("completed", true)
        .gte("completed_at", weekStart.toISOString())
        .lte("completed_at", weekEnd.toISOString());

      // Get all-time practices to check for first ever
      const { data: allProgress } = await supabase
        .from("user_content_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("completed", true)
        .limit(1);

      // Get check-ins this week
      const { data: checkins } = await supabase
        .from("quick_checkin_logs")
        .select("created_at")
        .eq("user_id", userId)
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString());

      // Calculate unique days practiced
      const uniqueDays = new Set<string>();
      progress?.forEach(p => {
        if (p.completed_at) {
          uniqueDays.add(format(new Date(p.completed_at), "yyyy-MM-dd"));
        }
      });

      // Calculate consecutive days (simple version)
      let consecutiveDays = 0;
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = format(checkDate, "yyyy-MM-dd");
        if (uniqueDays.has(dateStr)) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      const weeklyStats: WeeklyStats = {
        practicesCompleted: progress?.length || 0,
        uniqueDaysPracticed: uniqueDays.size,
        checkinsLogged: checkins?.length || 0,
        firstPracticeEver: (allProgress?.length || 0) > 0 && (allProgress?.length || 0) <= (progress?.length || 0),
        consecutiveDays,
      };

      setStats(weeklyStats);

      // Check for newly unlocked milestones
      const previouslyUnlocked = JSON.parse(
        localStorage.getItem("mumtaz_confidence_milestones") || "[]"
      );
      const currentlyUnlocked = getMilestones(weeklyStats)
        .filter(m => m.achieved)
        .map(m => m.id);
      
      const newUnlocks = currentlyUnlocked.filter(id => !previouslyUnlocked.includes(id));
      setNewlyUnlocked(newUnlocks);
      
      // Save current state
      localStorage.setItem("mumtaz_confidence_milestones", JSON.stringify(currentlyUnlocked));

    } catch (error) {
      console.error("Error loading weekly stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestones = (weekStats: WeeklyStats): Milestone[] => [
    {
      id: "first-step",
      icon: <Flower2 className="h-5 w-5" />,
      title: "First Step",
      description: "Complete your first practice",
      achieved: weekStats.practicesCompleted >= 1,
      celebrationMessage: "You've taken your first beautiful step. This is exactly where you need to be.",
      threshold: 1,
      type: "practices",
    },
    {
      id: "gentle-start",
      icon: <Leaf className="h-5 w-5" />,
      title: "Gentle Beginning",
      description: "Complete 3 practices this week",
      achieved: weekStats.practicesCompleted >= 3,
      celebrationMessage: "Three practices! Your body is learning to trust movement again.",
      threshold: 3,
      type: "practices",
    },
    {
      id: "showing-up",
      icon: <Sun className="h-5 w-5" />,
      title: "Showing Up",
      description: "Practice on 2 different days",
      achieved: weekStats.uniqueDaysPracticed >= 2,
      celebrationMessage: "Showing up for yourself, even twice, is a gift. Well done.",
      threshold: 2,
      type: "days",
    },
    {
      id: "building-rhythm",
      icon: <Heart className="h-5 w-5" />,
      title: "Building Rhythm",
      description: "Practice on 4 different days",
      achieved: weekStats.uniqueDaysPracticed >= 4,
      celebrationMessage: "A gentle rhythm is forming. Your body remembers this kindness.",
      threshold: 4,
      type: "days",
    },
    {
      id: "self-awareness",
      icon: <Moon className="h-5 w-5" />,
      title: "Self-Awareness",
      description: "Check in with how you're feeling 3 times",
      achieved: weekStats.checkinsLogged >= 3,
      celebrationMessage: "Listening to your body is a practice in itself. You're doing beautifully.",
      threshold: 3,
      type: "checkins",
    },
    {
      id: "steady-ground",
      icon: <Shield className="h-5 w-5" />,
      title: "Steady Ground",
      description: "Practice 2 days in a row",
      achieved: weekStats.consecutiveDays >= 2,
      celebrationMessage: "Two days of showing up. You're building trust with your body.",
      threshold: 2,
      type: "streak",
    },
    {
      id: "inner-strength",
      icon: <Star className="h-5 w-5" />,
      title: "Inner Strength",
      description: "Complete 5 practices this week",
      achieved: weekStats.practicesCompleted >= 5,
      celebrationMessage: "Five practices! You're proving to yourself what you're capable of.",
      threshold: 5,
      type: "practices",
    },
    {
      id: "confident-week",
      icon: <Trophy className="h-5 w-5" />,
      title: "Confident Week",
      description: "Practice on 5 different days",
      achieved: weekStats.uniqueDaysPracticed >= 5,
      celebrationMessage: "A whole week of showing up for yourself. You should be so proud.",
      threshold: 5,
      type: "days",
    },
  ];

  if (loading || !showSection || !stats) {
    return null;
  }

  const milestones = getMilestones(stats);
  const achievedCount = milestones.filter(m => m.achieved).length;
  const nextMilestone = milestones.find(m => !m.achieved);

  // Get the most recently achieved milestone for celebration
  const celebrateMilestone = newlyUnlocked.length > 0 
    ? milestones.find(m => newlyUnlocked.includes(m.id))
    : null;

  return (
    <Card className="bg-gradient-to-br from-wellness-sage/10 via-background to-wellness-lilac/10 border-wellness-sage/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-wellness-sage" />
            Weekly Milestones
          </CardTitle>
          <Badge variant="secondary" className="bg-wellness-lilac/20 text-foreground">
            {achievedCount}/{milestones.length} this week
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Celebration message for newly unlocked milestone */}
        {celebrateMilestone && (
          <div className="bg-gradient-to-r from-wellness-lilac/20 to-wellness-sage/20 rounded-xl p-4 border border-wellness-lilac/30 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-wellness-lilac/30 text-wellness-lilac">
                {celebrateMilestone.icon}
              </div>
              <div>
                <p className="font-medium text-foreground flex items-center gap-2">
                  {celebrateMilestone.title}
                  <Sparkles className="h-4 w-4 text-wellness-lilac" />
                </p>
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{celebrateMilestone.celebrationMessage}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Encouragement when no milestones yet */}
        {achievedCount === 0 && (
          <div className="bg-wellness-sage/10 rounded-xl p-4 border border-wellness-sage/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Every journey begins with a single step.</span>
              {" "}Complete your first practice whenever you're ready — there's no rush.
            </p>
          </div>
        )}

        {/* Milestones grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                milestone.achieved
                  ? "bg-wellness-lilac/20 border border-wellness-lilac/40"
                  : "bg-muted/30 border border-border/50 opacity-60"
              } ${newlyUnlocked.includes(milestone.id) ? "ring-2 ring-wellness-lilac ring-offset-2 ring-offset-background" : ""}`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  milestone.achieved
                    ? "bg-wellness-lilac/30 text-wellness-lilac"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {milestone.achieved ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  milestone.icon
                )}
              </div>
              <p className={`text-xs text-center font-medium ${
                milestone.achieved ? "text-foreground" : "text-muted-foreground"
              }`}>
                {milestone.title}
              </p>
              {milestone.achieved && (
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-wellness-lilac" />
              )}
            </div>
          ))}
        </div>

        {/* Next milestone hint */}
        {nextMilestone && achievedCount > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">Next:</span>{" "}
              {nextMilestone.description}
            </p>
          </div>
        )}

        {/* Weekly summary */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-card border border-border/50">
            <p className="text-2xl font-bold text-foreground">{stats.practicesCompleted}</p>
            <p className="text-xs text-muted-foreground">Practices</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card border border-border/50">
            <p className="text-2xl font-bold text-foreground">{stats.uniqueDaysPracticed}</p>
            <p className="text-xs text-muted-foreground">Days Active</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card border border-border/50">
            <p className="text-2xl font-bold text-foreground">{stats.checkinsLogged}</p>
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </div>
        </div>

        {/* Gentle reminder */}
        <p className="text-xs text-muted-foreground text-center italic pt-2">
          These milestones reset each week — every week is a fresh start.
        </p>
      </CardContent>
    </Card>
  );
}
