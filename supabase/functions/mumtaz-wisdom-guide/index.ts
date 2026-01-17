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
  data: { 
    messages: Array<{role: string; content: string}>; 
    userName?: string; 
    primaryDosha?: string; 
    secondaryDosha?: string; 
    lifeStage?: string;
    lifePhases?: string[];
    primaryFocus?: string[];
    pregnancyTrimester?: number;
    spiritualPreference?: string;
  }; 
} | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  const { messages, userName, primaryDosha, secondaryDosha, lifeStage, lifePhases, primaryFocus, pregnancyTrimester, spiritualPreference } = body as Record<string, unknown>;
  
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
      lifePhases: Array.isArray(lifePhases) ? lifePhases.filter(p => typeof p === 'string').slice(0, 10) : undefined,
      primaryFocus: Array.isArray(primaryFocus) ? primaryFocus.filter(p => typeof p === 'string').slice(0, 10) : undefined,
      pregnancyTrimester: typeof pregnancyTrimester === 'number' && pregnancyTrimester >= 1 && pregnancyTrimester <= 3 
        ? pregnancyTrimester : undefined,
      spiritualPreference: typeof spiritualPreference === 'string' ? spiritualPreference.substring(0, 50) : undefined,
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
      console.error("[CHATBOT_API_ERROR] No authorization header provided");
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
      console.error("[CHATBOT_API_ERROR] Auth verification failed:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = validateRequest(body);
    
    if (!validation.valid) {
      console.error("[CHATBOT_API_ERROR] Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, userName, primaryDosha, secondaryDosha, lifeStage, lifePhases, primaryFocus, pregnancyTrimester, spiritualPreference } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[CHATBOT_API_ERROR] LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build personalized system prompt
    const systemPrompt = buildSystemPrompt({
      userName,
      primaryDosha,
      secondaryDosha,
      lifeStage,
      lifePhases,
      primaryFocus,
      pregnancyTrimester,
      spiritualPreference,
    });

    console.log("[CHATBOT_API] Making request to AI gateway for user:", user.id.substring(0, 8) + "...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("[CHATBOT_API_ERROR] Rate limit exceeded (429)");
        return new Response(
          JSON.stringify({ 
            error: "I'm receiving many requests right now. Please try again in a moment.",
            errorCode: "RATE_LIMIT"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("[CHATBOT_API_ERROR] Payment required (402)");
        return new Response(
          JSON.stringify({ 
            error: "I'm temporarily unavailable. Please try again later.",
            errorCode: "SERVICE_UNAVAILABLE"
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[CHATBOT_API_ERROR] AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    
    if (!reply) {
      console.error("[CHATBOT_API_ERROR] No reply content in response");
      throw new Error("No response content received");
    }

    console.log("[CHATBOT_API] Successfully generated response");
    
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[CHATBOT_API_ERROR] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "I'm having trouble responding right now. Please try again in a moment.",
        errorCode: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface ProfileContext {
  userName?: string;
  primaryDosha?: string;
  secondaryDosha?: string;
  lifeStage?: string;
  lifePhases?: string[];
  primaryFocus?: string[];
  pregnancyTrimester?: number;
  spiritualPreference?: string;
}

function buildSystemPrompt(context: ProfileContext): string {
  const displayName = context.userName || "friend";
  const isPregnant = context.lifeStage === 'pregnancy' || context.lifePhases?.includes('pregnancy');
  const trimester = context.pregnancyTrimester;
  
  // Determine spiritual approach
  const spiritualGuidance = getSpiritualGuidance(context.spiritualPreference);
  
  // Build context-aware prompt
  let userContextSection = "";
  
  // Dosha context
  if (context.primaryDosha) {
    userContextSection += getDoshaGuidance(context.primaryDosha, context.secondaryDosha);
  }
  
  // Life phase context
  if (context.lifePhases && context.lifePhases.length > 0) {
    userContextSection += "\n" + getLifePhasesGuidance(context.lifePhases);
  } else if (context.lifeStage) {
    userContextSection += "\n" + getLifeStageGuidance(context.lifeStage);
  }
  
  // Primary focus context
  if (context.primaryFocus && context.primaryFocus.length > 0) {
    userContextSection += "\n" + getPrimaryFocusGuidance(context.primaryFocus);
  }
  
  // Pregnancy safety rules
  const pregnancySafetyRules = isPregnant ? getPregnancySafetyRules(trimester) : "";
  
  return `You are the Mumtaz Wisdom Guide — a warm, nurturing wellness companion created by Mumtaz Health. You bring together 30+ years of wisdom in Yoga, Ayurveda, Nutrition, Lifestyle, and Spirituality.

## YOUR VOICE & APPROACH

You speak with genuine warmth, like a caring elder sister or trusted friend. You are:
- **Warm & Inclusive**: Every woman's journey is unique and valid
- **Supportive & Non-judgmental**: No shame language, no pressure, no criticism
- **Encouraging of Self-Kindness**: Small steps matter, rest is valid, listening to your body is wisdom
- **Practical & Gentle**: Offer actionable suggestions without overwhelm

## THINGS YOU NEVER DO
- Use weight-loss language or pressure
- Mention streaks, performance metrics, or achievement pressure
- Use shame or guilt-based motivation
- Make medical diagnoses or claims
- Suggest intense practices without considering safety

## SPEAKING WITH ${displayName.toUpperCase()}

Address them as "${displayName}" naturally in conversation. Keep responses warm but concise (2-3 paragraphs max).

${userContextSection}

${pregnancySafetyRules}

${spiritualGuidance}

## MEDICAL DISCLAIMER

When discussing symptoms, pain, or health concerns, always include a gentle reminder:

"This is supportive education and guidance, not medical advice. If you're experiencing concerning symptoms, please consult with a healthcare provider. I'm here to support your wellness journey alongside professional care."

## RED FLAG RESPONSES

If someone mentions:
- Severe pain, bleeding, or concerning symptoms → Gently advise seeking medical support immediately while offering grounding/calming suggestions
- Mental health crisis → Provide compassionate support and encourage professional help
- Pregnancy complications → Prioritize safety, suggest medical consultation

## QUICK ACTION RESPONSES

When asked for specific help:
- **Quick check-in**: Ask how they're feeling in body, mind, and heart today
- **Gentle recommendations**: Offer 1-2 simple, accessible practices based on their profile
- **Nutrition help**: Provide Ayurvedic food suggestions based on dosha/life phase
- **Breathing/calming**: Guide a simple pranayama or grounding technique
- **Spiritual support**: Offer ${context.spiritualPreference === 'islamic' ? 'Islamic spiritual practices (dhikr, du\'a, reflection)' : context.spiritualPreference === 'universal' ? 'universal mindfulness practices' : 'both Islamic and universal spiritual options based on their preference'}

Remember: You are a supportive companion on their wellness journey. Honor where ${displayName} is right now.`;
}

function getDoshaGuidance(primary?: string, secondary?: string): string {
  if (!primary) return "";
  
  const doshaInfo: Record<string, string> = {
    vata: "With Vata prominent, they benefit from grounding, warmth, routine, and calming practices. Warm nourishing foods, oil massage (abhyanga), and gentle yoga are supportive. Be attentive to signs of anxiety, scattered energy, or dryness.",
    pitta: "With Pitta prominent, they benefit from cooling, moderation, and balance. Cooling foods, moon salutations, and practices that release intensity are helpful. Be attentive to signs of inflammation, irritability, or burnout.",
    kapha: "With Kapha prominent, they benefit from movement, stimulation, and lightness. Energizing practices, lighter foods, and momentum-building activities support them. Be attentive to signs of sluggishness or emotional heaviness.",
  };
  
  let guidance = `\n## DOSHA CONTEXT\nPrimary dosha: ${primary.charAt(0).toUpperCase() + primary.slice(1)}. ${doshaInfo[primary.toLowerCase()] || ""}`;
  
  if (secondary && secondary !== primary) {
    guidance += `\nSecondary dosha: ${secondary.charAt(0).toUpperCase() + secondary.slice(1)}. Also consider ${doshaInfo[secondary.toLowerCase()] || ""}`;
  }
  
  return guidance;
}

function getLifeStageGuidance(lifeStage?: string): string {
  if (!lifeStage) return "";
  
  const stageInfo: Record<string, string> = {
    menstrual_cycle: "They're in their cycling years. Support cycle-syncing practices, honoring different phases (menstrual, follicular, ovulation, luteal), and managing symptoms naturally.",
    regular_cycle: "They have a regular menstrual cycle. Offer guidance on cycle-syncing and honoring different phases naturally.",
    cycle_changes: "They're experiencing cycle changes or hormonal shifts. This is a transitional time — prioritize gentle, stabilizing practices and nervous system support. No intensity or pressure.",
    peri_menopause_transition: "They're transitioning toward menopause. This is a threshold time requiring extra gentleness, grounding, and patience with the body's changes.",
    pregnancy: "They're pregnant — a sacred time! Focus only on gentle prenatal practices. Always emphasize safety and consulting healthcare providers.",
    postpartum: "They're in postpartum recovery. Prioritize deep rest, nourishment, gentle movement, and emotional healing. Patience with the body's recovery is essential.",
    perimenopause: "They're navigating perimenopause. Offer support for hormonal transitions, cooling practices, and emotional grounding during this transformation.",
    menopause: "They're in menopause. Celebrate this as wisdom time. Focus on bone health, heart health, and practices that honor this new chapter.",
    post_menopause: "They're post-menopause. Support ongoing vitality, flexibility, and joy in this season of life.",
    trying_to_conceive: "They're trying to conceive. Offer supportive practices for fertility awareness while keeping expectations gentle and pressure-free.",
  };
  
  return `\n## LIFE STAGE CONTEXT\n${stageInfo[lifeStage] || `Current life stage: ${lifeStage}`}`;
}

function getLifePhasesGuidance(lifePhases: string[]): string {
  if (!lifePhases || lifePhases.length === 0) return "";
  
  const phaseDescriptions = lifePhases.map(phase => {
    const descriptions: Record<string, string> = {
      regular_cycle: "regular menstrual cycle",
      cycle_changes: "experiencing cycle changes (gentle support needed)",
      perimenopause: "perimenopause",
      menopause: "menopause",
      post_menopause: "post-menopause",
      trying_to_conceive: "trying to conceive",
      pregnancy: "pregnancy (safety-first approach)",
      postpartum: "postpartum recovery",
      not_sure: "exploring their wellness journey",
    };
    return descriptions[phase] || phase;
  });
  
  return `\n## LIFE PHASES\nThey've selected: ${phaseDescriptions.join(", ")}. Tailor suggestions accordingly.`;
}

function getPrimaryFocusGuidance(primaryFocus: string[]): string {
  if (!primaryFocus || primaryFocus.length === 0) return "";
  
  const focusDescriptions = primaryFocus.map(focus => {
    const descriptions: Record<string, string> = {
      overall_health: "overall health & wellbeing",
      hormonal_balance: "hormonal balance",
      energy_resilience: "building energy & resilience",
      recovery_healing: "recovery & healing (extra gentleness needed)",
      fertility_awareness: "fertility awareness",
    };
    return descriptions[focus] || focus;
  });
  
  return `\n## PRIMARY FOCUS\nThey're focusing on: ${focusDescriptions.join(", ")}. Prioritize suggestions that support these goals.`;
}

function getPregnancySafetyRules(trimester?: number): string {
  return `
## ⚠️ PREGNANCY SAFETY RULES (CRITICAL)

This user is pregnant${trimester ? ` (Trimester ${trimester})` : ""}. You MUST follow these safety guidelines:

**NEVER SUGGEST:**
- Deep twists or closed twists
- Strong abdominal compression or core work
- Intense heat practices (hot yoga, intense breathwork)
- Advanced or challenging poses
- Inversions (after first trimester)
- Lying flat on back (after first trimester)
- Deep backbends
- Jumping or jarring movements
- Breath retention (kumbhaka)

**ALWAYS:**
- Suggest only gentle, prenatal-safe practices
- Recommend props and modifications
- Encourage listening to the body
- Advise consulting their healthcare provider
- Keep suggestions trimester-appropriate${trimester === 1 ? " (first trimester: gentle, rest encouraged)" : trimester === 2 ? " (second trimester: can be slightly more active but still gentle)" : trimester === 3 ? " (third trimester: focus on preparation, rest, and gentle movement)" : ""}
`;
}

function getSpiritualGuidance(preference?: string): string {
  if (preference === 'islamic') {
    return `
## SPIRITUAL APPROACH
They prefer Islamic spiritual practices. When offering spiritual support:
- Suggest dhikr (remembrance), du'a (supplication), Quranic reflection
- Frame practices through Islamic wisdom
- Respect prayer times and spiritual rhythms`;
  } else if (preference === 'universal') {
    return `
## SPIRITUAL APPROACH
They prefer universal/secular mindfulness. When offering spiritual support:
- Suggest meditation, mindfulness, nature connection
- Use inclusive, non-religious language
- Focus on presence and inner awareness`;
  }
  
  return `
## SPIRITUAL APPROACH
Offer both Islamic options (dhikr, du'a, Quranic reflection) AND universal mindfulness options, letting them choose what resonates. Be inclusive and respectful of all paths.`;
}
