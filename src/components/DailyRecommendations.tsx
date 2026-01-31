import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Clock, Heart } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { ContentSkeleton } from "@/components/ContentSkeleton";
import { User } from "@supabase/supabase-js";

type WellnessContent = Tables<"wellness_content">;

export const DailyRecommendations = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Fetch today's recommendations
  const { data: recommendationData, isLoading } = useQuery({
    queryKey: ["daily-recommendations", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .eq("recommendation_date", today)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch the actual content items
  const { data: recommendations } = useQuery({
    queryKey: ["recommendation-content", recommendationData?.content_ids],
    queryFn: async () => {
      if (!recommendationData?.content_ids?.length) return [];

      const { data, error } = await supabase
        .from("wellness_content")
        .select("*")
        .in("id", recommendationData.content_ids);

      if (error) throw error;

      // Preserve the order from content_ids
      return recommendationData.content_ids
        .map((id: string) => data?.find((item) => item.id === id))
        .filter(Boolean) as WellnessContent[];
    },
    enabled: !!recommendationData?.content_ids?.length,
  });

  // Generate recommendations mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "generate-daily-recommendations"
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-recommendations"] });
      toast.success("Daily recommendations generated!");
    },
    onError: (error: Error) => {
      console.error("Error generating recommendations:", error);
      toast.error(error.message || "Failed to generate recommendations");
    },
  });

  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      yoga: "🧘‍♀️",
      meditation: "🧘",
      nutrition: "🥗",
      article: "📖",
    };
    return icons[type] || "✨";
  };

  const getContentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      yoga: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      meditation: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      nutrition: "bg-green-500/10 text-green-700 dark:text-green-300",
      article: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    };
    return colors[type] || "bg-primary/10";
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Daily Recommendations
          </CardTitle>
          <CardDescription>Please log in to see personalized recommendations</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Your Daily Recommendations
              </CardTitle>
              <CardDescription>
                Personalized wellness content based on your dosha, cycle phase, and journey
              </CardDescription>
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateMutation.isPending ? "animate-spin" : ""}`} />
              {generateMutation.isPending ? "Generating..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <ContentSkeleton key={i} />
          ))}
        </div>
      ) : !recommendations?.length ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your personalized daily recommendations based on your wellness profile.
              </p>
              <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((content) => (
            <Card key={content.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{getContentTypeIcon(content.content_type)}</span>
                      {content.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="secondary" className={getContentTypeColor(content.content_type)}>
                        {content.content_type}
                      </Badge>
                      {content.difficulty_level && (
                        <Badge variant="outline">{content.difficulty_level}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {content.description}
                </p>

                {content.duration_minutes && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {content.duration_minutes} minutes
                  </div>
                )}

                {content.benefits && content.benefits.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Benefits:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {content.benefits.slice(0, 3).map((benefit, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="secondary" className="w-full" size="sm" asChild>
                  <a href="/content">View Details</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendationData && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium">Cycle Phase:</span>{" "}
                <Badge variant="outline">{recommendationData.cycle_phase || "N/A"}</Badge>
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <Badge variant="outline">
                  {recommendationData.pregnancy_status?.replace(/_/g, " ") || "N/A"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
