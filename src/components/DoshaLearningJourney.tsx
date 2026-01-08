import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TieredDoshaContent } from "./TieredDoshaContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SubscriptionTier = "free" | "basic" | "standard" | "premium";

interface DoshaLearningJourneyProps {
  className?: string;
}

export function DoshaLearningJourney({ className }: DoshaLearningJourneyProps) {
  const [userTier, setUserTier] = useState<SubscriptionTier>("free");
  const [primaryDosha, setPrimaryDosha] = useState<string>();
  const [secondaryDosha, setSecondaryDosha] = useState<string>();
  const [lifeStage, setLifeStage] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("user_wellness_profiles")
          .select("subscription_tier, primary_dosha, secondary_dosha, life_stage")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          // Map subscription tier to our tier system
          const tierMapping: Record<string, SubscriptionTier> = {
            "free": "free",
            "basic": "basic",
            "standard": "standard",
            "premium": "premium"
          };
          setUserTier(tierMapping[profile.subscription_tier || "free"] || "free");
          setPrimaryDosha(profile.primary_dosha || undefined);
          setSecondaryDosha(profile.secondary_dosha || undefined);
          setLifeStage(profile.life_stage || undefined);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const getTierBadge = () => {
    const tierColors: Record<SubscriptionTier, string> = {
      free: "bg-muted text-muted-foreground",
      basic: "bg-wellness-sage/20 text-wellness-sage",
      standard: "bg-wellness-lilac/20 text-wellness-lilac",
      premium: "bg-mumtaz-plum/20 text-mumtaz-plum"
    };
    const tierLabels: Record<SubscriptionTier, string> = {
      free: "Free",
      basic: "Basic",
      standard: "Standard",
      premium: "Premium"
    };
    return (
      <Badge className={`${tierColors[userTier]} border-0`}>
        {tierLabels[userTier]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-wellness-lilac/20">
              <Sparkles className="h-5 w-5 text-wellness-lilac" />
            </div>
            <div>
              <CardTitle className="text-xl">Your Dosha Learning Journey</CardTitle>
              <CardDescription>
                Understanding yourself, one gentle step at a time
              </CardDescription>
            </div>
          </div>
          {getTierBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <TieredDoshaContent 
          userTier={userTier}
          primaryDosha={primaryDosha}
          secondaryDosha={secondaryDosha}
          lifeStage={lifeStage}
        />
      </CardContent>
    </Card>
  );
}

export default DoshaLearningJourney;
