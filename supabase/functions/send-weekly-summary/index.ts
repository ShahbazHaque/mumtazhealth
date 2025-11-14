import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { render } from "npm:@react-email/render@0.0.12";
import { WeeklySummaryEmail } from "./_templates/weekly-summary.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklySummaryRequest {
  userId: string;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userEmail, userName }: WeeklySummaryRequest = await req.json();

    console.log("Generating weekly summary for user:", userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    if (error) {
      throw error;
    }

    // Calculate statistics
    const daysTracked = entries?.length || 0;
    
    let yogaSessions = 0;
    let mealsLogged = 0;
    let meditationMinutes = 0;
    let totalMoodScore = 0;
    let moodCount = 0;
    const practicesCount: Record<string, number> = {};

    entries?.forEach((entry) => {
      if (entry.yoga_practice && typeof entry.yoga_practice === "object") {
        yogaSessions++;
      }
      if (entry.nutrition_log && typeof entry.nutrition_log === "object") {
        const meals = Object.keys(entry.nutrition_log).length;
        mealsLogged += meals;
      }
      if (entry.spiritual_practices && typeof entry.spiritual_practices === "object") {
        const practices = entry.spiritual_practices as Record<string, any>;
        if (practices.meditation_duration) {
          meditationMinutes += Number(practices.meditation_duration) || 0;
        }
      }
      if (entry.emotional_score) {
        totalMoodScore += entry.emotional_score;
        moodCount++;
      }
      if (entry.daily_practices && typeof entry.daily_practices === "object") {
        const practices = entry.daily_practices as Record<string, any>;
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
    if (insights.length === 0) {
      insights.push("Every journey begins with a single step. Keep going!");
    }

    const html = render(
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
      })
    );

    const emailResponse = await resend.emails.send({
      from: "Holistic Wellness <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Your Weekly Wellness Summary 🌟",
      html,
    });

    console.log("Weekly summary sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-weekly-summary function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
