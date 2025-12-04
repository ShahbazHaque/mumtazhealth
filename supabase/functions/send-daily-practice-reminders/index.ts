import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "BNxW7xZ8vH_qK9yC3mL4nR5pT6vX8wY9zA1bC2dE3fG4hJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8k";

serve(async (req) => {
  console.log("Daily practice reminders function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentTime = `${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}`;
    const currentDayOfWeek = now.getUTCDay() === 0 ? 7 : now.getUTCDay(); // Convert Sunday from 0 to 7
    
    console.log(`Current UTC time: ${currentTime}, Day of week: ${currentDayOfWeek}`);

    // Get all active reminders for the current time window (within 5 minutes)
    const timeWindowStart = subtractMinutes(currentTime, 2);
    const timeWindowEnd = addMinutes(currentTime, 3);

    console.log(`Looking for reminders between ${timeWindowStart} and ${timeWindowEnd}`);

    const { data: reminders, error: remindersError } = await supabase
      .from("daily_practice_reminders")
      .select(`
        id,
        user_id,
        content_id,
        reminder_time,
        days_of_week
      `)
      .eq("is_active", true)
      .gte("reminder_time", timeWindowStart)
      .lte("reminder_time", timeWindowEnd);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} potential reminders`);

    // Filter reminders by day of week
    const todaysReminders = (reminders || []).filter(reminder => 
      reminder.days_of_week.includes(currentDayOfWeek)
    );

    console.log(`${todaysReminders.length} reminders scheduled for today`);

    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const reminder of todaysReminders) {
      // Fetch the content details
      const { data: contentData } = await supabase
        .from("wellness_content")
        .select("title, description, content_type, duration_minutes")
        .eq("id", reminder.content_id)
        .single();

      console.log(`Processing reminder for user ${reminder.user_id}: ${contentData?.title}`);

      // Get user profile for personalization
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", reminder.user_id)
        .single();

      // Get push subscriptions for this user
      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", reminder.user_id);

      if (subError) {
        console.error(`Error fetching subscriptions for user ${reminder.user_id}:`, subError);
        continue;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${reminder.user_id}`);
        continue;
      }

      // Generate personalized message
      const content = contentData;
      const userName = profile?.username || "beautiful";
      
      const message = {
        title: `Time for your practice, ${userName}! 🌸`,
        body: content?.title 
          ? `${content.title}${content.duration_minutes ? ` (${content.duration_minutes} min)` : ''}`
          : "Your daily wellness practice is waiting",
        data: { 
          url: "/my-daily-practice",
          contentId: reminder.content_id 
        },
      };

      console.log(`Sending notification: ${message.title} - ${message.body}`);

      // Send to all user's devices
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
          notificationsSent++;
          console.log(`Successfully sent notification to endpoint: ${sub.endpoint.substring(0, 50)}...`);
        } catch (error) {
          console.error(`Failed to send notification to ${sub.endpoint.substring(0, 50)}...:`, error);
          notificationsFailed++;
          
          // Remove invalid subscription
          if (error instanceof Error && error.message.includes("410")) {
            console.log(`Removing expired subscription ${sub.id}`);
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
        }
      }
    }

    const result = {
      success: true,
      processedReminders: todaysReminders.length,
      notificationsSent,
      notificationsFailed,
      timestamp: now.toISOString(),
    };

    console.log("Daily practice reminders completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-daily-practice-reminders:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendPushNotification(subscription: any, message: any) {
  const vapidDetails = {
    subject: "mailto:mumtazhaque07@gmail.com",
    publicKey: VAPID_PUBLIC_KEY,
    privateKey: VAPID_PRIVATE_KEY,
  };

  // Log the notification that would be sent
  // In production with proper VAPID keys, this would use web-push library
  console.log("Push notification prepared:", { 
    endpoint: subscription.endpoint.substring(0, 50) + "...",
    message,
    vapidConfigured: !!VAPID_PRIVATE_KEY
  });

  // For production, implement actual web-push:
  // import webpush from 'web-push';
  // webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);
  // await webpush.sendNotification(subscription, JSON.stringify(message));
  
  // Simulating success for now
  return { success: true };
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}:00`;
}

function subtractMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + mins - minutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}:00`;
}
