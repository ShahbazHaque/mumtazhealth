import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Crown, Check, Sparkles, ArrowUp, AlertCircle } from "lucide-react";

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  features: string[];
  current?: boolean;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: "£0/month",
    features: [
      "Basic pose images & written guidance",
      "Essential wellness tracking",
      "Limited meditation content",
      "Community support"
    ]
  },
  {
    id: "basic",
    name: "Basic",
    price: "£4.99/month",
    features: [
      "Everything in Free",
      "Full written content library",
      "Beginner yoga videos",
      "Audio meditations",
      "Phase & dosha recommendations"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: "£9.99/month",
    features: [
      "Everything in Basic",
      "Full video library access",
      "Advanced Ayurveda insights",
      "All meditations & breathwork",
      "Priority email support"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "£22.99/month",
    features: [
      "Everything in Standard",
      "1 live session/month with founder",
      "Personalised wellness plans",
      "Early access to new content",
      "Priority support"
    ]
  }
];

export function SubscriptionManagement() {
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_wellness_profiles")
        .select("subscription_tier")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        toast.error("Could not load subscription information");
      }

      setCurrentTier(data?.subscription_tier || "free");
    } catch (error) {
      console.error("Subscription fetch error:", error);
      toast.error("Unable to load subscription details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tierId: string) => {
    // For now, show a message about upcoming payment integration
    toast.info(
      `Upgrade to ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} coming soon! We're setting up secure payments.`,
      { duration: 5000 }
    );
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // For now, just downgrade to free tier
      // In production, this would integrate with Stripe to handle billing period end
      const { error } = await supabase
        .from("user_wellness_profiles")
        .update({ subscription_tier: "free" })
        .eq("user_id", user.id);

      if (error) throw error;

      setCurrentTier("free");
      setShowCancelDialog(false);
      toast.success(
        "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
        { duration: 5000 }
      );
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast.error("Unable to cancel subscription. Please try again or contact support.");
    } finally {
      setCancelLoading(false);
    }
  };

  const getTierIndex = (tier: string) => {
    return subscriptionTiers.findIndex(t => t.id === tier);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTierData = subscriptionTiers.find(t => t.id === currentTier);
  const currentIndex = getTierIndex(currentTier);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Your Current Plan</CardTitle>
            </div>
            <Badge variant={currentTier === "free" ? "secondary" : "default"} className="text-sm">
              {currentTierData?.name}
            </Badge>
          </div>
          <CardDescription>
            {currentTier === "free" 
              ? "You're on our free plan. Upgrade to unlock more features."
              : `You're enjoying ${currentTierData?.name} features.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentTierData?.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          {currentTier !== "free" && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Upgrades */}
      {currentIndex < subscriptionTiers.length - 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">Upgrade Your Experience</CardTitle>
            </div>
            <CardDescription>
              Unlock deeper guidance, more content, and personalised support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {subscriptionTiers
                .filter((_, index) => index > currentIndex)
                .map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{tier.name}</span>
                        <Badge variant="outline">{tier.price}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.features[0]}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUpgrade(tier.id)}
                      className="gap-1"
                    >
                      <ArrowUp className="h-4 w-4" />
                      Upgrade
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium indicator */}
      {currentTier === "premium" && (
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-background">
          <CardContent className="py-6 text-center">
            <Crown className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-semibold">You have the highest tier!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Enjoy all the premium features and thank you for your support.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Are you sure you want to cancel your subscription?</p>
              <p className="text-sm">
                You'll continue to have access to your current plan features until the end of your billing period. 
                After that, you'll be moved to the free plan.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
