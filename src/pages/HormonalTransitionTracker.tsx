import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { HormonalTransitionTimeline } from "@/components/HormonalTransitionTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Battery,
  Brain,
  Moon,
  Calendar,
  Utensils,
  Bone,
  HelpCircle,
  TrendingUp,
  BookOpen,
  Settings,
  Sparkles,
  Heart,
  Waves,
  CheckCircle2
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FOCUS_AREA_CONFIG: Record<string, { icon: LucideIcon; label: string; color: string; bgColor: string; libraryTag: string }> = {
  energy: {
    icon: Battery,
    label: "Energy Changes",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    libraryTag: "energy"
  },
  mood: {
    icon: Brain,
    label: "Mood Shifts",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    libraryTag: "mood"
  },
  sleep: {
    icon: Moon,
    label: "Sleep",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    libraryTag: "sleep"
  },
  cycle: {
    icon: Calendar,
    label: "Cycle Irregularity",
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    libraryTag: "cycle"
  },
  digestion: {
    icon: Utensils,
    label: "Digestion",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    libraryTag: "digestion"
  },
  joints: {
    icon: Bone,
    label: "Joint Discomfort",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    libraryTag: "joint-care"
  },
  not_sure: {
    icon: HelpCircle,
    label: "Exploring",
    color: "text-teal-600",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    libraryTag: "gentle"
  },
};

export default function HormonalTransitionTracker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lifeStage, setLifeStage] = useState<string | null>(null);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [primaryDosha, setPrimaryDosha] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_wellness_profiles")
        .select("life_stage, focus_areas, primary_dosha")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setLifeStage(data?.life_stage || "cycle_changes");
      setFocusAreas(data?.focus_areas || []);
      setPrimaryDosha(data?.primary_dosha);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load your profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-background to-wellness-sage-light p-4">
        <Navigation />
        <div className="max-w-4xl mx-auto py-8 pt-24 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-background to-wellness-sage-light dark:from-teal-950/20 dark:via-background dark:to-wellness-sage/5 p-4">
      <Navigation />
      <div className="max-w-4xl mx-auto py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-wellness-sage bg-clip-text text-transparent">
              Hormonal Transition Tracker
            </h1>
            <p className="text-muted-foreground text-sm">
              Gently observe your body's changes over time
            </p>
          </div>
        </div>

        {/* Timeline Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50/50 to-wellness-sage/10 dark:from-teal-900/20 dark:to-wellness-sage/5 border-b border-teal-100 dark:border-teal-800/30">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Waves className="w-5 h-5 text-teal-500" />
                Your Journey Map
              </CardTitle>
              <CardDescription>
                Every woman's path is unique — this is your personal timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-4 md:px-6">
              <HormonalTransitionTimeline currentPhase={lifeStage || "cycle_changes"} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Focus Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-primary" />
                  Your Focus Areas
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/settings")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              <CardDescription>
                We'll personalize your experience based on these areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {focusAreas.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No focus areas selected yet</p>
                  <Button variant="outline" onClick={() => navigate("/settings")}>
                    Select Focus Areas
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {focusAreas.map((areaId) => {
                    const config = FOCUS_AREA_CONFIG[areaId];
                    if (!config) return null;
                    const Icon = config.icon;

                    return (
                      <Link
                        key={areaId}
                        to={`/content-library?tag=${config.libraryTag}`}
                        className="block"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            flex items-center gap-3 p-4 rounded-xl border border-border/50
                            hover:border-primary/30 hover:shadow-sm transition-all
                            ${config.bgColor}
                          `}
                        >
                          <div className={`p-2 rounded-lg bg-white/60 dark:bg-black/20`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{config.label}</p>
                            <p className="text-xs text-muted-foreground">Tap to explore content</p>
                          </div>
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Personalized For You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Track Today */}
              <Link to="/tracker" className="block">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-wellness-sage/10 border border-primary/20 hover:border-primary/40 transition-all"
                >
                  <div className="p-3 rounded-full bg-primary/20">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Track Today's Experience</p>
                    <p className="text-sm text-muted-foreground">Log how you're feeling and what you notice</p>
                  </div>
                </motion.div>
              </Link>

              {/* View Patterns */}
              <Link to="/insights" className="block">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="p-3 rounded-full bg-muted">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">View Your Patterns</p>
                    <p className="text-sm text-muted-foreground">Discover insights from your tracking data</p>
                  </div>
                </motion.div>
              </Link>

              {/* Explore Content */}
              <Link to="/content-library?category=hormonal" className="block">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="p-3 rounded-full bg-muted">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Explore Hormonal Support</p>
                    <p className="text-sm text-muted-foreground">Practices for your transition journey</p>
                  </div>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supportive Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-6"
        >
          <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
            Your body's wisdom is unfolding. This tracker is here to help you listen,
            understand, and support yourself through whatever comes next.
          </p>
        </motion.div>
      </div>
    </div>
  );
}