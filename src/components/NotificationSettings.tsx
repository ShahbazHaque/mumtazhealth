import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  requestNotificationPermission,
  subscribeUserToPush,
  saveSubscription,
  unsubscribeFromPush,
} from "@/utils/pushNotifications";

interface NotificationPreferences {
  enabled: boolean;
  morning_reminder: boolean;
  morning_time: string;
  evening_reminder: boolean;
  evening_time: string;
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    morning_reminder: true,
    morning_time: "08:00",
    evening_reminder: true,
    evening_time: "20:00",
  });

  useEffect(() => {
    checkNotificationStatus();
    fetchPreferences();
  }, []);

  const checkNotificationStatus = () => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          enabled: data.enabled,
          morning_reminder: data.morning_reminder,
          morning_time: data.morning_time.substring(0, 5),
          evening_reminder: data.evening_reminder,
          evening_time: data.evening_time.substring(0, 5),
        });
      }
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      await requestNotificationPermission();
      const subscription = await subscribeUserToPush();
      await saveSubscription(subscription);
      
      setNotificationsEnabled(true);
      toast({
        title: "Notifications enabled!",
        description: "You'll receive wellness reminders from Mumtaz.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to enable notifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await unsubscribeFromPush();
      setNotificationsEnabled(false);
      toast({
        title: "Notifications disabled",
        description: "You won't receive push notifications anymore.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to disable notifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        ...preferences,
      });

      if (error) throw error;

      toast({
        title: "Preferences saved!",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!notificationsEnabled) {
      toast({
        title: "Enable notifications first",
        description: "Please enable notifications before testing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user profile for personalization
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();

      const { data: wellnessProfile } = await supabase
        .from("user_wellness_profiles")
        .select("primary_dosha, life_stage")
        .eq("user_id", user.id)
        .single();

      // Generate personalized test message
      const userName = profile?.username || "beautiful";
      const dosha = wellnessProfile?.primary_dosha;
      
      let doshaAdvice = "Remember to honor your wellness journey today. I'm here to help, not judge. You are not alone.";
      
      if (dosha) {
        const doshaMessages: Record<string, string> = {
          vata: "Ground yourself with warm, nourishing foods and gentle movement. Your journey is sacred.",
          pitta: "Balance your energy with cooling practices and self-compassion. You're doing beautifully.",
          kapha: "Energize with invigorating movement and lighter foods. Embrace your natural rhythm.",
        };
        doshaAdvice = doshaMessages[dosha.toLowerCase()] || doshaAdvice;
      }

      // Send test notification
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(
        `Good morning, ${userName}! 🌸`,
        {
          body: doshaAdvice,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: { url: "/tracker" },
          tag: "test-notification",
        }
      );

      toast({
        title: "Test notification sent!",
        description: "Check your notifications to see how it looks.",
      });
    } catch (error: any) {
      console.error("Test notification error:", error);
      toast({
        title: "Failed to send test notification",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {notificationsEnabled ? <Bell className="h-5 w-5 text-accent" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive personalized wellness reminders from Mumtaz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!notificationsEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive dosha-specific encouragement and wellness reminders throughout your day.
            </p>
            <Button onClick={handleEnableNotifications} disabled={loading} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  You're receiving wellness reminders
                </p>
              </div>
              <Switch
                checked={preferences.enabled}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, enabled: checked })
                }
              />
            </div>

            {preferences.enabled && (
              <>
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="morning">Morning Reminder</Label>
                    <Switch
                      id="morning"
                      checked={preferences.morning_reminder}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, morning_reminder: checked })
                      }
                    />
                  </div>
                  {preferences.morning_reminder && (
                    <Input
                      type="time"
                      value={preferences.morning_time}
                      onChange={(e) =>
                        setPreferences({ ...preferences, morning_time: e.target.value })
                      }
                    />
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="evening">Evening Reminder</Label>
                    <Switch
                      id="evening"
                      checked={preferences.evening_reminder}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, evening_reminder: checked })
                      }
                    />
                  </div>
                  {preferences.evening_reminder && (
                    <Input
                      type="time"
                      value={preferences.evening_time}
                      onChange={(e) =>
                        setPreferences({ ...preferences, evening_time: e.target.value })
                      }
                    />
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button onClick={savePreferences} disabled={loading} className="flex-1">
                  Save Preferences
                </Button>
                <Button
                  onClick={handleDisableNotifications}
                  disabled={loading}
                  variant="outline"
                >
                  Disable
                </Button>
              </div>
              
              <Button
                onClick={sendTestNotification}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
