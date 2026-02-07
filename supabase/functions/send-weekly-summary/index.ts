import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import React from "https://esm.sh/react@18.3.1";
import { render } from "https://esm.sh/@react-email/render@1.0.0";
import { WeeklySummaryEmail } from "./_templates/weekly-summary.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

interface WellnessEntry {
  id: string;
  user_id: string;
  entry_date: string;
  yoga_practice?: Record<string, unknown>;
  nutrition_log?: Record<string, unknown>;
  spiritual_practices?: Record<string, unknown>;
  daily_practices?: Record<string, unknown>;
  emotional_score?: number;
}

interface DailyReminder {
  id: string;
  reminder_time: string;
  days_of_week: number[];
  is_active: boolean;
  wellness_content: { title: string }[] | { title: string } | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklySummaryRequest {
  userId?: string;
  userEmail?: string;
  userName?: string;
  sendToAll?: boolean;
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes.substring(0, 2)} ${ampm}`;
};

const formatDays = (daysOfWeek: number[]) => {
  if (daysOfWeek.length === 7) return "Every day";
  if (daysOfWeek.length === 5 && !daysOfWeek.includes(1) && !daysOfWeek.includes(7)) {
    return "Weekdays";
  }
  return daysOfWeek.map(d => dayNames[d - 1]).join(", ");
};

const sendSummaryForUser = async (
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  userName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Generating weekly summary for user:", userId);

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Fetch wellness entries for the past week
    const { data: entries, error } = await supabase
      .from("wellness_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_date", startDate.toISOString().split("T")[0])
      .lte("entry_date", endDate.toISOString().split("T")[0])
      .order("entry_date", { ascending: false });

    if (error) throw error;

    // Fetch daily practice reminders
    const { data: reminders } = await supabase
      .from("daily_practice_reminders")
      .select(`
        id,
        reminder_time,
        days_of_week,
        is_active,
        wellness_content (
          title
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true);

    // Fetch completed practices for the week
    const { data: completedProgress } = await supabase
      .from("user_content_progress")
      .select("id, completed_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("completed_at", startDate.toISOString())
      .lte("completed_at", endDate.toISOString());

    // Calculate practice statistics
    const completedPractices = completedProgress?.length || 0;
    
    // Calculate scheduled practices for the week
    let scheduledPractices = 0;
    const upcomingReminders: { title: string; time: string; days: string }[] = [];
    
    if (reminders) {
      reminders.forEach((reminder: DailyReminder) => {
        const daysCount = reminder.days_of_week?.length || 0;
        scheduledPractices += daysCount;
        
        const content = reminder.wellness_content;
        if (content && Array.isArray(content) && content.length > 0) {
          upcomingReminders.push({
            title: content[0].title || "Practice",
            time: formatTime(reminder.reminder_time),
            days: formatDays(reminder.days_of_week || []),
          });
        } else if (content && typeof content === 'object' && 'title' in content) {
          upcomingReminders.push({
            title: (content as { title: string }).title || "Practice",
            time: formatTime(reminder.reminder_time),
            days: formatDays(reminder.days_of_week || []),
          });
        }
      });
    }

    // Calculate statistics
    const daysTracked = entries?.length || 0;
    
    let yogaSessions = 0;
    let mealsLogged = 0;
    let meditationMinutes = 0;
    let totalMoodScore = 0;
    let moodCount = 0;
    const practicesCount: Record<string, number> = {};

    entries?.forEach((entry: WellnessEntry) => {
      if (entry.yoga_practice && typeof entry.yoga_practice === "object") {
        yogaSessions++;
      }
      if (entry.nutrition_log && typeof entry.nutrition_log === "object") {
        const meals = Object.keys(entry.nutrition_log).length;
        mealsLogged += meals;
      }
      if (entry.spiritual_practices && typeof entry.spiritual_practices === "object") {
        const practices = entry.spiritual_practices as Record<string, unknown>;
        if (practices.meditation_duration) {
          meditationMinutes += Number(practices.meditation_duration) || 0;
        }
      }
      if (entry.emotional_score) {
        totalMoodScore += entry.emotional_score;
        moodCount++;
      }
      if (entry.daily_practices && typeof entry.daily_practices === "object") {
        const practices = entry.daily_practices as Record<string, unknown>;
        Object.keys(practices).forEach((practice) => {
          practicesCount[practice] = (practicesCount[practice] || 0) + 1;
        });
      }
    });

    const avgMoodScore = moodCount > 0 ? (totalMoodScore / moodCount).toFixed(1) : "0";

    // Get top 3 practices
    const topPractices = Object.entries(practicesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([practice, count]) => `${practice} (${count}x)`);

    // Generate insights
    const insights: string[] = [];
    if (daysTracked >= 5) {
      insights.push("Excellent consistency! You tracked 5+ days this week.");
    }
    if (yogaSessions >= 3) {
      insights.push("Your yoga practice is strong this week!");
    }
    if (meditationMinutes >= 50) {
      insights.push(`Impressive! You meditated for ${meditationMinutes} minutes total.`);
    }
    if (Number(avgMoodScore) >= 4) {
      insights.push("Your emotional wellbeing is thriving!");
    }
    if (completedPractices > 0 && scheduledPractices > 0) {
      const completionRate = Math.round((completedPractices / scheduledPractices) * 100);
      if (completionRate >= 80) {
        insights.push(`Amazing dedication! You completed ${completionRate}% of your scheduled practices.`);
      }
    }
    if (insights.length === 0) {
      insights.push("Every journey begins with a single step. Keep going!");
    }

    const html = await render(
      React.createElement(WeeklySummaryEmail, {
        userName,
        weekStart: startDate.toLocaleDateString(),
        weekEnd: endDate.toLocaleDateString(),
        daysTracked,
        yogaSessions,
        mealsLogged,
        meditationMinutes,
        avgMoodScore: Number(avgMoodScore),
        topPractices,
        insights,
        completedPractices,
        scheduledPractices,
        upcomingReminders: upcomingReminders.slice(0, 5),
      })
    );

    const emailResponse = await resend.emails.send({
      from: "Mumtaz Health <onboarding@resend.dev>",
      to: [userEmail],
      subject: "🌸 Your Weekly Wellness Summary",
      html,
    });

    console.log("Weekly summary sent successfully to:", userEmail);
    return { success: true };
  } catch (error) {
    console.error("Error sending summary to user:", userId, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { userId, userEmail, userName, sendToAll } = body as WeeklySummaryRequest;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If sendToAll is true (from cron job), fetch all users and send summaries
    if (sendToAll) {
      console.log("Sending weekly summaries to all users...");

      // Get all users with notification preferences enabled
      const { data: preferences, error: prefError } = await supabase
        .from("notification_preferences")
        .select("user_id")
        .eq("enabled", true);

      if (prefError) {
        console.error("Error fetching notification preferences:", prefError);
        throw prefError;
      }

      const userIds = preferences?.map(p => p.user_id) || [];
      console.log(`Found ${userIds.length} users with notifications enabled`);

      // Get profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      if (profileError) {
        console.error("Error fetching profiles:", profileError);
      }

      // Get emails from auth.users (using service role)
      const results: { userId: string; success: boolean; error?: string }[] = [];

      for (const uid of userIds) {
        // Get user email from auth
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(uid);
        
        if (userError || !user?.email) {
          console.error("Error fetching user:", uid, userError);
          results.push({ userId: uid, success: false, error: "Could not fetch user email" });
          continue;
        }

        const profile = profiles?.find(p => p.user_id === uid);
        const name = profile?.username || "there";

        const result = await sendSummaryForUser(supabase, uid, user.email, name);
        results.push({ userId: uid, ...result });
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`Weekly summaries sent: ${successCount}/${userIds.length}`);

      return new Response(
        JSON.stringify({ 
          message: `Weekly summaries sent to ${successCount}/${userIds.length} users`,
          results 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Single user mode (original behavior)
    if (!userId || !userEmail || !userName) {
      throw new Error("userId, userEmail, and userName are required for single user mode");
    }

    const result = await sendSummaryForUser(supabase, userId, userEmail, userName);

    if (!result.success) {
      throw new Error(result.error);
    }

    return new Response(
      JSON.stringify({ message: "Weekly summary sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in send-weekly-summary function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);