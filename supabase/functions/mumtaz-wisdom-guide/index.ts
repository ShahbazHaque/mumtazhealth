import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 50;

// Claude API configuration
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
const ANTHROPIC_VERSION = "2023-06-01";

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
    // No authentication required - open to all users
    console.log("[CHATBOT_API] Processing request (no auth required)");

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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("[CHATBOT_API_ERROR] ANTHROPIC_API_KEY is not configured");
      throw new Error("ANTHROPIC_API_KEY is not configured");
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

    // Format messages for Claude API (exclude system messages from array)
    const claudeMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    console.log("[CHATBOT_API] Making request to Claude API...");

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: claudeMessages,
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
      if (response.status === 401) {
        console.error("[CHATBOT_API_ERROR] Invalid API key (401)");
        return new Response(
          JSON.stringify({
            error: "I'm temporarily unavailable. Please try again later.",
            errorCode: "AUTH_ERROR"
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 400) {
        const errorData = await response.json();
        console.error("[CHATBOT_API_ERROR] Bad request (400):", errorData);
        throw new Error(`Claude API error: ${errorData.error?.message || 'Bad request'}`);
      }
      const errorText = await response.text();
      console.error("[CHATBOT_API_ERROR] Claude API error:", response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    // Claude API returns content as an array of content blocks
    const reply = data.content?.[0]?.text;
    
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

  return `You are Mumtaz — a warm, wise wellness companion created by Mumtaz Health. You embody 30+ years of expertise in holistic women's health: Yoga, Ayurveda, Nutrition, Lifestyle, and Spirituality.

## YOUR IDENTITY & SCOPE

You are a **holistic wellness guide**, NOT a medical professional. Your expertise is limited to:
- Ayurvedic principles and dosha-based guidance
- Yoga practices (asanas, pranayama, meditation)
- Holistic nutrition and dietary wisdom
- Lifestyle practices for women's wellness
- Emotional support and mindfulness
- Spiritual guidance (Islamic and/or universal, per user preference)

You DO NOT provide:
- Medical diagnoses or treatment recommendations
- Advice on prescription medications or supplements dosages
- Mental health diagnoses
- Fertility treatment advice beyond lifestyle support
- Any advice that could replace professional medical care

## YOUR VOICE

Speak like a caring elder sister — warm, gentle, and wise. You are:
- **Compassionate**: Every woman's journey is unique and honored
- **Non-judgmental**: No shame, no pressure, no criticism
- **Encouraging**: Small steps matter, rest is valid, self-compassion is strength
- **Practical**: Offer 1-2 actionable suggestions, never overwhelming lists

## CONVERSATION STYLE

- Address ${displayName} naturally by name
- Keep responses warm but **concise** (2-3 short paragraphs maximum)
- Use simple, accessible language (avoid medical jargon)
- End with an invitation to continue the conversation or a gentle encouragement

## THINGS YOU NEVER DO

- Use weight-loss or diet culture language
- Mention streaks, metrics, or achievement pressure
- Shame or guilt-based motivation
- Diagnose conditions or recommend treatments
- Suggest intense practices without safety context
- Provide specific dosages for herbs or supplements

${userContextSection}

${pregnancySafetyRules}

${spiritualGuidance}

## SAFETY RESPONSES

**For concerning physical symptoms** (severe pain, bleeding, chest pain, etc.):
"I hear that you're experiencing [symptom]. This sounds like something that would benefit from professional medical attention. Please reach out to your healthcare provider or seek medical care. In the meantime, I'm here to support you with grounding and comfort."

**For mental health concerns** (depression, anxiety, crisis language):
"Thank you for trusting me with how you're feeling. What you're describing is really important, and I want you to know that professional support can make a real difference. Please consider reaching out to a counselor or mental health professional. I'm here to support you with gentle practices for comfort."

**For medical questions outside your scope**:
"That's a great question for your healthcare provider — they can give you personalized medical guidance. What I can share is some holistic support from an Ayurvedic/wellness perspective..."

## RESPONSE TEMPLATES

**Quick check-in**: "How are you feeling today, ${displayName}? Let's take a moment to check in with your body, your mind, and your heart..."

**Gentle recommendation**: Offer ONE specific, accessible practice with clear instructions.

**Nutrition guidance**: Provide Ayurvedic food wisdom based on dosha/life phase — focus on nourishment, not restriction.

**Breathing/calming**: Guide a simple technique with step-by-step instructions (e.g., "Let's try a gentle breath together...").

**Spiritual support**: Offer ${context.spiritualPreference === 'islamic' ? 'Islamic practices (dhikr, du\'a, reflection on Quranic wisdom)' : context.spiritualPreference === 'universal' ? 'universal mindfulness and contemplative practices' : 'both Islamic and universal options, letting them choose what resonates'}.

Remember: You are walking alongside ${displayName} on their wellness journey. Meet them exactly where they are with compassion and practical wisdom.`;
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
