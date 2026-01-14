import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 50;

// Validate and sanitize input
function validateRequest(body: unknown): { 
  valid: true; 
  data: { messages: Array<{role: string; content: string}>; userName?: string; primaryDosha?: string; secondaryDosha?: string; lifeStage?: string }; 
} | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  const { messages, userName, primaryDosha, secondaryDosha, lifeStage } = body as Record<string, unknown>;
  
  // Validate messages array
  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }
  
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages (max ${MAX_MESSAGES})` };
  }
  
  const validatedMessages = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: 'Invalid message format' };
    }
    
    const { role, content } = msg as Record<string, unknown>;
    
    if (typeof role !== 'string' || !['user', 'assistant', 'system'].includes(role)) {
      return { valid: false, error: 'Invalid message role' };
    }
    
    if (typeof content !== 'string') {
      return { valid: false, error: 'Message content must be a string' };
    }
    
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` };
    }
    
    validatedMessages.push({ role, content: content.trim() });
  }
  
  // Validate optional fields
  const validDoshas = ['vata', 'pitta', 'kapha'];
  
  return {
    valid: true,
    data: {
      messages: validatedMessages,
      userName: typeof userName === 'string' ? userName.substring(0, 100) : undefined,
      primaryDosha: typeof primaryDosha === 'string' && validDoshas.includes(primaryDosha.toLowerCase()) 
        ? primaryDosha.toLowerCase() : undefined,
      secondaryDosha: typeof secondaryDosha === 'string' && validDoshas.includes(secondaryDosha.toLowerCase()) 
        ? secondaryDosha.toLowerCase() : undefined,
      lifeStage: typeof lifeStage === 'string' ? lifeStage.substring(0, 50) : undefined,
    }
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = validateRequest(body);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, userName, primaryDosha, secondaryDosha, lifeStage } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build personalized system prompt based on user's dosha and life stage
    const doshaGuidance = getDoshaGuidance(primaryDosha, secondaryDosha);
    const lifeStageGuidance = getLifeStageGuidance(lifeStage);
    
    const displayName = userName || "beautiful soul";
    const systemPrompt = `You are Mumtaz, a warm and nurturing wellness guide with 30+ years of experience in Ayurveda, Yoga, and holistic healing. You're speaking with ${displayName}.

Your approach:
- Speak with genuine warmth and compassion - "I'm here to help, not judge"
- Use the user's name naturally in conversation: "${displayName}"
- Provide practical, actionable guidance based on their unique constitution
- Keep responses concise (2-3 paragraphs max) and encouraging
- Reference specific Ayurvedic principles when relevant
- Offer gentle reminders about self-care and balance

${doshaGuidance}

${lifeStageGuidance}

Remember: Every woman's journey is unique. Honor where ${displayName} is right now, and guide with support, not pressure.`;

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
      JSON.stringify({ error: "An error occurred. Please try again." }),
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
