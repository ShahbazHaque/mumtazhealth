import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Sparkles, Clock, Leaf, Shield, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  description: string | null;
  duration_minutes: number | null;
  difficulty_level: string | null;
  tags: string[] | null;
}

export function ConfidenceJourney() {
  const navigate = useNavigate();
  const [starterPractices, setStarterPractices] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSection, setShowSection] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    checkUserPreference();
  }, []);

  const checkUserPreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has "confidence" as their movement preference
      const { data: profile } = await supabase
        .from("user_wellness_profiles")
        .select("preferred_yoga_style")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.preferred_yoga_style === "confidence") {
        setShowSection(true);
        await fetchStarterPractices(user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking user preference:", error);
      setLoading(false);
    }
  };

  const fetchStarterPractices = async (userId: string) => {
    try {
      // Fetch beginner-friendly, short, confidence-building content
      const { data: content, error } = await supabase
        .from("wellness_content")
        .select("id, title, content_type, description, duration_minutes, difficulty_level, tags")
        .eq("is_active", true)
        .or("difficulty_level.eq.beginner,difficulty_level.eq.gentle")
        .lte("duration_minutes", 20)
        .limit(30);

      if (error || !content) {
        setLoading(false);
        return;
      }

      // Score content for confidence-building relevance
      const confidenceTags = ["beginner", "gentle", "grounding", "calming", "chair-yoga", 
        "accessible", "restorative", "confidence", "rehabilitation", "recovery", "slow"];
      
      const scoredContent = content.map(item => {
        let score = 0;
        const itemTags = item.tags || [];
        
        // Score based on tag matches
        confidenceTags.forEach(tag => {
          if (itemTags.some(t => t.toLowerCase().includes(tag))) score += 2;
          if (item.title?.toLowerCase().includes(tag)) score += 1;
          if (item.description?.toLowerCase().includes(tag)) score += 1;
        });

        // Boost shorter sessions (more achievable)
        if (item.duration_minutes && item.duration_minutes <= 10) score += 3;
        else if (item.duration_minutes && item.duration_minutes <= 15) score += 2;

        // Boost beginner/gentle difficulty
        if (item.difficulty_level === "beginner") score += 3;
        if (item.difficulty_level === "gentle") score += 2;

        return { ...item, score };
      });

      // Sort by score and get top 4 diverse practices
      const sorted = scoredContent.sort((a, b) => b.score - a.score);
      
      // Try to get variety in content types
      const selected: ContentItem[] = [];
      const typesSeen = new Set<string>();
      
      for (const item of sorted) {
        if (selected.length >= 4) break;
        if (!typesSeen.has(item.content_type) || selected.length >= 2) {
          selected.push(item);
          typesSeen.add(item.content_type);
        }
      }

      // Fill remaining with highest scored
      if (selected.length < 4) {
        const remaining = sorted.filter(s => !selected.find(sel => sel.id === s.id));
        selected.push(...remaining.slice(0, 4 - selected.length));
      }

      setStarterPractices(selected.slice(0, 4));

      // Get completed count
      const { data: progress } = await supabase
        .from("user_content_progress")
        .select("content_id")
        .eq("user_id", userId)
        .eq("completed", true);

      const completedIds = new Set(progress?.map(p => p.content_id) || []);
      const completed = selected.filter(s => completedIds.has(s.id)).length;
      setCompletedCount(completed);

    } catch (error) {
      console.error("Error fetching starter practices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "yoga": return "🧘";
      case "meditation": return "🧘‍♀️";
      case "breathwork": return "🌬️";
      case "nutrition": return "🥗";
      default: return "📖";
    }
  };

  if (loading || !showSection || starterPractices.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-wellness-lilac/15 via-background to-wellness-sage/10 border-wellness-lilac/30 shadow-lg overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Heart className="h-6 w-6 text-wellness-lilac" />
            Your Confidence Journey
          </CardTitle>
          <Badge variant="secondary" className="bg-wellness-sage/20 text-foreground">
            <Shield className="h-3 w-3 mr-1" />
            Safe & Supportive
          </Badge>
        </div>
        <CardDescription className="text-base">
          Gentle practices designed to help you feel capable and confident in your body. 
          Start with these short, achievable sessions.
        </CardDescription>
        
        {/* Progress indicator */}
        {completedCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-wellness-lilac transition-all duration-500"
                style={{ width: `${(completedCount / starterPractices.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{starterPractices.length} completed
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Encouragement message */}
        <div className="bg-wellness-sage/10 rounded-xl p-4 border border-wellness-sage/20">
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-wellness-sage mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-foreground">You're taking a wonderful step.</strong> These practices are 
              designed for exactly where you are now. There's no rush — move at your own pace.
            </span>
          </p>
        </div>

        {/* Starter practices grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {starterPractices.map((practice) => (
            <button
              key={practice.id}
              onClick={() => navigate(`/content-library?highlight=${practice.id}`)}
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-wellness-lilac/50 
                hover:shadow-md hover:scale-[1.02] transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">
                  {getContentTypeIcon(practice.content_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {practice.content_type}
                    </Badge>
                    {practice.duration_minutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {practice.duration_minutes} min
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-foreground group-hover:text-wellness-lilac transition-colors line-clamp-2">
                    {practice.title}
                  </h4>
                  {practice.difficulty_level && (
                    <div className="flex items-center gap-1 mt-1">
                      <Leaf className="h-3 w-3 text-wellness-sage" />
                      <span className="text-xs text-wellness-sage capitalize">
                        {practice.difficulty_level}
                      </span>
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-wellness-lilac 
                  group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-wellness-lilac/50 hover:bg-wellness-lilac/10"
            onClick={() => navigate("/content-library?filter=confidence")}
          >
            <Heart className="h-4 w-4 mr-2" />
            Explore More Gentle Practices
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/content-library?mobility=chair")}
          >
            Chair-based Options
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
