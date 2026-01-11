import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  RefreshCw, 
  Heart, 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Calendar,
  Flower2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WELCOME_MESSAGES, JOURNEY_MESSAGES, PRACTITIONER_MESSAGES } from "@/constants/appMessaging";

interface ReturningUserWelcomeProps {
  onClose: () => void;
}

interface LastActivity {
  type: 'content' | 'tracker' | 'practice' | 'insights';
  title: string;
  path: string;
  timestamp: string;
}

const lifeStageLabels: Record<string, string> = {
  menstrual_cycle: "Menstrual Cycle",
  pregnancy: "Pregnancy",
  postpartum: "Postpartum",
  perimenopause: "Perimenopause",
  menopause: "Menopause",
  post_menopause: "Post-Menopause",
};

export function ReturningUserWelcome({ onClose }: ReturningUserWelcomeProps) {
  const navigate = useNavigate();
  const [currentLifeStage, setCurrentLifeStage] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch wellness profile
      const { data: wellness } = await supabase
        .from("user_wellness_profiles")
        .select("life_stage")
        .eq("user_id", user.id)
        .maybeSingle();

      if (wellness?.life_stage) {
        setCurrentLifeStage(wellness.life_stage);
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.username) {
        setUsername(profile.username);
      }

      // Fetch favorites count
      const { count } = await supabase
        .from("user_saved_content")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setFavoritesCount(count || 0);

      // Get last activity from localStorage
      const storedActivity = localStorage.getItem("mumtaz_last_activity");
      if (storedActivity) {
        try {
          setLastActivity(JSON.parse(storedActivity));
        } catch (e) {
          console.error("Error parsing last activity:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleContinue = () => {
    if (lastActivity?.path) {
      navigate(lastActivity.path);
    } else {
      navigate("/");
    }
    onClose();
  };

  const handleUpdatePreferences = () => {
    navigate("/settings");
    onClose();
  };

  const handleViewFavorites = () => {
    navigate("/content-library?filter=favorites");
    onClose();
  };

  const handleGoToDashboard = () => {
    navigate("/");
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Flower2 className="h-6 w-6 text-primary" />
            {WELCOME_MESSAGES.returningUser}{username ? `, ${username}` : ""}!
          </DialogTitle>
          <DialogDescription className="text-base">
            {JOURNEY_MESSAGES.phaseEvolution} {WELCOME_MESSAGES.entryPrompt}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Life Stage Badge */}
          {currentLifeStage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Current stage:</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {lifeStageLabels[currentLifeStage] || currentLifeStage}
              </Badge>
            </div>
          )}

          {/* Continue Option */}
          <Card 
            className="cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-all"
            onClick={handleContinue}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Continue Your Journey</h3>
                <p className="text-sm text-muted-foreground">
                  {lastActivity 
                    ? `Resume: ${lastActivity.title}`
                    : "Go to your dashboard"
                  }
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Update Preferences Option */}
          <Card 
            className="cursor-pointer hover:border-accent/50 hover:bg-accent/50 transition-all"
            onClick={handleUpdatePreferences}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Update My Stage</h3>
                <p className="text-sm text-muted-foreground">
                  {JOURNEY_MESSAGES.phaseUpdate}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* View Favorites Option */}
          {favoritesCount > 0 && (
            <Card 
              className="cursor-pointer hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-all"
              onClick={handleViewFavorites}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">My Favorites</h3>
                  <p className="text-sm text-muted-foreground">
                    {favoritesCount} saved {favoritesCount === 1 ? "item" : "items"} in your library
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Supportive Message */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">
                {JOURNEY_MESSAGES.phaseEvolution}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {JOURNEY_MESSAGES.phaseReassurance}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleGoToDashboard} className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => { navigate("/content-library"); onClose(); }} className="flex-1">
            <BookOpen className="h-4 w-4 mr-2" />
            Content Library
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility to track last activity
export function trackLastActivity(activity: LastActivity) {
  localStorage.setItem("mumtaz_last_activity", JSON.stringify({
    ...activity,
    timestamp: new Date().toISOString()
  }));
}
