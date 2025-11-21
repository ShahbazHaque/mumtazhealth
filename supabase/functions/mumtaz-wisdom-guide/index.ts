import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userName, primaryDosha, secondaryDosha, lifeStage } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build personalized system prompt based on user's dosha and life stage
    const doshaGuidance = getDoshaGuidance(primaryDosha, secondaryDosha);
    const lifeStageGuidance = getLifeStageGuidance(lifeStage);
    
    const systemPrompt = `You are Mumtaz, a warm and nurturing wellness guide with 30+ years of experience in Ayurveda, Yoga, and holistic healing. You're speaking with ${userName || "a beautiful soul"}.

Your approach:
- Speak with genuine warmth and compassion - "I'm here to help, not judge"
- Use the user's name naturally in conversation: "${userName}"
- Provide practical, actionable guidance based on their unique constitution
- Keep responses concise (2-3 paragraphs max) and encouraging
- Reference specific Ayurvedic principles when relevant
- Offer gentle reminders about self-care and balance

${doshaGuidance}

${lifeStageGuidance}

Remember: Every woman's journey is unique. Honor where ${userName} is right now, and guide with support, not pressure.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in mumtaz-wisdom-guide:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getDoshaGuidance(primary?: string, secondary?: string): string {
  if (!primary) return "";
  
  const doshaInfo: Record<string, string> = {
    vata: `${primary === "vata" ? "Primary" : "Secondary"} Vata constitution means ${primary === "vata" ? "they need" : "some attention to"} grounding, warmth, and routine. Encourage warm foods, oil massage (abhyanga), and calming practices. Watch for signs of anxiety, dry skin, or scattered energy.`,
    pitta: `${primary === "pitta" ? "Primary" : "Secondary"} Pitta constitution means ${primary === "pitta" ? "they need" : "some attention to"} cooling, moderation, and balance. Suggest cooling foods, moon salutations, and practices that release intensity. Watch for signs of inflammation, irritability, or burnout.`,
    kapha: `${primary === "kapha" ? "Primary" : "Secondary"} Kapha constitution means ${primary === "kapha" ? "they need" : "some attention to"} movement, stimulation, and lightness. Encourage energizing practices, lighter foods, and activities that create momentum. Watch for signs of sluggishness, heaviness, or emotional stagnation.`,
  };
  
  let guidance = doshaInfo[primary.toLowerCase()] || "";
  if (secondary && secondary !== primary) {
    guidance += " " + (doshaInfo[secondary.toLowerCase()] || "");
  }
  
  return guidance;
}

function getLifeStageGuidance(lifeStage?: string): string {
  if (!lifeStage) return "";
  
  const stageInfo: Record<string, string> = {
    menstrual_cycle: "They're tracking their menstrual cycle. Offer guidance on cycle-syncing practices, honoring different phases (menstrual, follicular, ovulation, luteal), and managing symptoms naturally.",
    pregnancy: "They're pregnant - what a sacred time! Focus on gentle prenatal yoga, nourishing foods for both mother and baby, and emotional support. Always emphasize safety and consulting healthcare providers.",
    postpartum: "They're in the postpartum phase. Prioritize rest, nourishment, gentle movement, and emotional healing. This is a time for deep care and patience with the body's recovery.",
    perimenopause: "They're navigating perimenopause. Offer support for hormonal transitions, cooling practices for hot flashes, and emotional grounding during this powerful transformation.",
    menopause: "They're in menopause. Celebrate this as a time of wisdom and freedom. Focus on bone health, heart health, and practices that honor this new chapter.",
    post_menopause: "They're post-menopause. Support their ongoing wellness with practices that maintain vitality, flexibility, and joy in this season of life.",
  };
  
  return stageInfo[lifeStage] || "";
}
