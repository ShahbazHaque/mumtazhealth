import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID keys for Web Push (you'll need to generate these)
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "BNxW7xZ8vH_qK9yC3mL4nR5pT6vX8wY9zA1bC2dE3fG4hJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8k";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with notification preferences
    const { data: preferences, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("enabled", true);

    if (prefsError) throw prefsError;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const currentHour = now.getHours();
    const isMorning = currentHour >= 6 && currentHour < 12;

    for (const pref of preferences || []) {
      // Check if we should send a notification now
      const shouldSendMorning = pref.morning_reminder && 
        isMorning && 
        currentTime >= pref.morning_time.substring(0, 5) &&
        currentTime < addMinutes(pref.morning_time.substring(0, 5), 5);
        
      const shouldSendEvening = pref.evening_reminder && 
        !isMorning && 
        currentTime >= pref.evening_time.substring(0, 5) &&
        currentTime < addMinutes(pref.evening_time.substring(0, 5), 5);

      if (!shouldSendMorning && !shouldSendEvening) continue;

      // Get user profile for personalization
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", pref.user_id)
        .single();

      const { data: wellnessProfile } = await supabase
        .from("user_wellness_profiles")
        .select("primary_dosha, life_stage")
        .eq("user_id", pref.user_id)
        .single();

      // Get push subscriptions
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", pref.user_id);

      if (!subscriptions || subscriptions.length === 0) continue;

      // Generate personalized message
      const message = generateMessage(
        profile?.username || "beautiful",
        wellnessProfile?.primary_dosha,
        wellnessProfile?.life_stage,
        isMorning
      );

      // Send notifications to all user's devices
      for (const sub of subscriptions) {
        try {
          await sendPushNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            message
          );
        } catch (error) {
          console.error("Failed to send to subscription:", error);
          // Remove invalid subscription
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateMessage(userName: string, dosha?: string, lifeStage?: string, isMorning: boolean = true): PushMessage {
  const timeOfDay = isMorning ? "morning" : "evening";
  let doshaAdvice = "";

  if (dosha) {
    const doshaMessages: Record<string, { morning: string; evening: string }> = {
      vata: {
        morning: "Ground yourself with warm, nourishing foods and gentle movement.",
        evening: "Wind down with calming practices and warm herbal tea.",
      },
      pitta: {
        morning: "Start your day with cooling practices and balanced energy.",
        evening: "Release the day's intensity with moon salutations and rest.",
      },
      kapha: {
        morning: "Energize with invigorating movement and lighter foods.",
        evening: "Reflect on your day and prepare for restorative sleep.",
      },
    };

    doshaAdvice = doshaMessages[dosha.toLowerCase()]?.[timeOfDay] || "";
  }

  const title = `Good ${timeOfDay}, ${userName}! 🌸`;
  const body = doshaAdvice || 
    `Remember to honor your wellness journey today. I'm here to help, not judge. You are not alone.`;

  return {
    title,
    body,
    data: { url: "/tracker" },
  };
}

async function sendPushNotification(subscription: PushSubscription, message: PushMessage) {
  const vapidDetails = {
    subject: "mailto:mumtazhaque07@gmail.com",
    publicKey: VAPID_PUBLIC_KEY,
    privateKey: VAPID_PRIVATE_KEY,
  };

  // Use web-push library (you'll need to import this)
  // For now, this is a placeholder - you'll need to set up VAPID keys
  console.log("Would send notification:", { subscription, message, vapidDetails });
  
  // In production, use: await webpush.sendNotification(subscription, JSON.stringify(message), vapidDetails);
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
}
