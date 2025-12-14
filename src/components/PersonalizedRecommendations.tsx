import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Lightbulb, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Map feelings to content search terms and categories
const feelingToContentMap: Record<string, { tags: string[]; types: string[]; description: string }> = {
  tired: {
    tags: ["restorative", "gentle", "relaxation", "vata-balance"],
    types: ["yoga", "meditation"],
    description: "Restorative practices to restore your energy"
  },
  pain: {
    tags: ["pain-relief", "gentle", "therapeutic", "chronic-pain"],
    types: ["yoga", "article"],
    description: "Gentle practices for pain relief"
  },
  exhausted: {
    tags: ["restorative", "vata-balance", "self-care", "relaxation"],
    types: ["yoga", "meditation", "article"],
    description: "Deeply restoring practices for exhaustion"
  },
  hormonal: {
    tags: ["hormone-balance", "cycle", "menstrual", "moon"],
    types: ["yoga", "article", "nutrition"],
    description: "Hormone-balancing support"
  },
  emotional: {
    tags: ["emotional", "heart-opening", "meditation", "breathwork"],
    types: ["meditation", "breathwork"],
    description: "Emotional release and heart-opening practices"
  },
  restless: {
    tags: ["grounding", "vata-balance", "calm", "evening"],
    types: ["yoga", "meditation"],
    description: "Grounding practices for restlessness"
  },
  bloated: {
    tags: ["digestion", "twist", "digestive", "nutrition"],
    types: ["yoga", "nutrition", "article"],
    description: "Digestive support and gentle movements"
  },
  "cant-sleep": {
    tags: ["sleep", "evening", "relaxation", "wind-down"],
    types: ["yoga", "meditation"],
    description: "Evening routines for better sleep"
  },
  "hot-flushes": {
    tags: ["menopause", "cooling", "pitta-balance", "perimenopause"],
    types: ["yoga", "article", "breathwork"],
    description: "Cooling practices for hot flushes"
  },
  digestive: {
    tags: ["digestion", "nutrition", "ayurveda", "twist"],
    types: ["nutrition", "article", "yoga"],
    description: "Ayurvedic digestive support"
  },
  "back-ache": {
    tags: ["back", "spine", "mobility", "joint-care", "gentle"],
    types: ["yoga", "article"],
    description: "Spine care and back relief"
  },
  "neck-shoulder": {
    tags: ["neck", "shoulder", "chair-yoga", "gentle", "tension"],
    types: ["yoga"],
    description: "Neck and shoulder release"
  },
  "period-pain": {
    tags: ["menstrual", "cramp", "cycle", "womb"],
    types: ["yoga", "article"],
    description: "Menstrual comfort practices"
  },
  "joint-stiffness": {
    tags: ["joint-care", "mobility", "arthritis", "gentle", "chair-yoga"],
    types: ["yoga", "article"],
    description: "Joint mobility and care"
  },
  "post-surgery": {
    tags: ["rehabilitation", "gentle", "recovery", "cancer_support"],
    types: ["yoga", "article"],
    description: "Gentle recovery practices"
  },
  "low-mood": {
    tags: ["uplifting", "heart-opening", "morning", "energy"],
    types: ["yoga", "meditation"],
    description: "Mood-lifting practices"
  },
  overwhelmed: {
    tags: ["grounding", "calm", "meditation", "breathwork", "stress"],
    types: ["meditation", "breathwork"],
    description: "Calming practices for overwhelm"
  },
  stressed: {
    tags: ["stress", "relaxation", "breathwork", "calm"],
    types: ["breathwork", "meditation", "yoga"],
    description: "Stress relief and relaxation"
  },
  // Handle underscore versions from FirstTimeQuickCheckIn
  in_pain: {
    tags: ["pain-relief", "gentle", "therapeutic"],
    types: ["yoga", "article"],
    description: "Gentle practices for pain relief"
  },
  hot_flushes: {
    tags: ["menopause", "cooling", "pitta-balance"],
    types: ["yoga", "article", "breathwork"],
    description: "Cooling practices for hot flushes"
  },
  cant_sleep: {
    tags: ["sleep", "evening", "relaxation"],
    types: ["yoga", "meditation"],
    description: "Evening routines for better sleep"
  },
  back_ache: {
    tags: ["back", "spine", "mobility", "joint-care"],
    types: ["yoga", "article"],
    description: "Spine care and back relief"
  },
  neck_shoulder: {
    tags: ["neck", "shoulder", "chair-yoga"],
    types: ["yoga"],
    description: "Neck and shoulder release"
  },
  period_pain: {
    tags: ["menstrual", "cramp", "cycle"],
    types: ["yoga", "article"],
    description: "Menstrual comfort practices"
  },
  joint_stiffness: {
    tags: ["joint-care", "mobility", "arthritis"],
    types: ["yoga", "article"],
    description: "Joint mobility and care"
  },
  post_surgery: {
    tags: ["rehabilitation", "gentle", "recovery"],
    types: ["yoga", "article"],
    description: "Gentle recovery practices"
  },
  low_mood: {
    tags: ["uplifting", "heart-opening", "morning"],
    types: ["yoga", "meditation"],
    description: "Mood-lifting practices"
  },
};

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  description: string | null;
  tags: string[] | null;
}

interface TopFeeling {
  feeling_id: string;
  count: number;
}

export function PersonalizedRecommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [topFeeling, setTopFeeling] = useState<TopFeeling | null>(null);
  const [loading, setLoading] = useState(true);
  const [feelingLabel, setFeelingLabel] = useState("");

  useEffect(() => {
    fetchPersonalizedContent();
  }, []);

  const fetchPersonalizedContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get top feelings from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: checkinLogs, error: logsError } = await supabase
        .from("quick_checkin_logs")
        .select("feeling_id, feeling_label")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (logsError || !checkinLogs || checkinLogs.length === 0) {
        setLoading(false);
        return;
      }

      // Count occurrences and find top feeling
      const counts: Record<string, { count: number; label: string }> = {};
      checkinLogs.forEach(log => {
        if (!counts[log.feeling_id]) {
          counts[log.feeling_id] = { count: 0, label: log.feeling_label };
        }
        counts[log.feeling_id].count++;
      });

      const sorted = Object.entries(counts)
        .map(([feeling_id, data]) => ({ feeling_id, count: data.count, label: data.label }))
        .sort((a, b) => b.count - a.count);

      if (sorted.length === 0) {
        setLoading(false);
        return;
      }

      const top = sorted[0];
      setTopFeeling({ feeling_id: top.feeling_id, count: top.count });
      setFeelingLabel(top.label);

      // Get content mapping for this feeling
      const mapping = feelingToContentMap[top.feeling_id];
      if (!mapping) {
        setLoading(false);
        return;
      }

      // Fetch relevant content
      const { data: content, error: contentError } = await supabase
        .from("wellness_content")
        .select("id, title, content_type, description, tags")
        .eq("is_active", true)
        .in("content_type", mapping.types)
        .limit(20);

      if (contentError || !content) {
        setLoading(false);
        return;
      }

      // Score and filter content based on tag matches
      const scoredContent = content.map(item => {
        let score = 0;
        const itemTags = item.tags || [];
        mapping.tags.forEach(tag => {
          if (itemTags.some(t => t.toLowerCase().includes(tag.toLowerCase()))) {
            score += 2;
          }
          if (item.title.toLowerCase().includes(tag.toLowerCase())) {
            score += 1;
          }
          if (item.description?.toLowerCase().includes(tag.toLowerCase())) {
            score += 1;
          }
        });
        return { ...item, score };
      });

      // Sort by score and take top 3
      const topContent = scoredContent
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // If not enough matches, add some from the right content types
      if (topContent.length < 3) {
        const remaining = content
          .filter(c => !topContent.find(tc => tc.id === c.id))
          .slice(0, 3 - topContent.length);
        topContent.push(...remaining.map(c => ({ ...c, score: 0 })));
      }

      setRecommendations(topContent);
    } catch (error) {
      console.error("Error fetching personalized content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show loading state, just hide
  }

  if (!topFeeling || recommendations.length === 0) {
    return null; // No data to show
  }

  const mapping = feelingToContentMap[topFeeling.feeling_id];

  return (
    <Card className="bg-gradient-to-br from-wellness-lilac/10 via-background to-wellness-sage/10 border-wellness-lilac/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-wellness-lilac" />
            Recommended For You
          </CardTitle>
          <Badge variant="secondary" className="bg-wellness-lilac/20 text-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Personalized
          </Badge>
        </div>
        <CardDescription>
          Based on how you've been feeling lately — you've logged "{feelingLabel}" {topFeeling.count} times this month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapping && (
          <p className="text-sm text-muted-foreground italic">
            {mapping.description}
          </p>
        )}

        <div className="grid gap-3">
          {recommendations.map((content) => (
            <button
              key={content.id}
              onClick={() => navigate(`/content-library`)}
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-wellness-lilac/50 
                hover:shadow-md hover:scale-[1.01] transition-all duration-200 text-left group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {content.content_type}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground group-hover:text-wellness-lilac transition-colors line-clamp-1">
                    {content.title}
                  </h4>
                  {content.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {content.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-wellness-lilac 
                  group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full border-wellness-lilac/50 hover:bg-wellness-lilac/10"
          onClick={() => navigate("/content-library")}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Explore Full Content Library
        </Button>
      </CardContent>
    </Card>
  );
}
