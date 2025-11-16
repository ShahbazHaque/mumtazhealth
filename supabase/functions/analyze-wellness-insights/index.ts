import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching wellness entries for user:', user.id);

    // Fetch wellness entries from the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: entries, error: entriesError } = await supabaseClient
      .from('wellness_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('entry_date', { ascending: false });

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch wellness entries' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ 
        insights: [],
        predictions: [],
        correlations: [],
        message: 'Not enough data yet. Start tracking to unlock insights!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${entries.length} entries, analyzing with AI...`);

    // Prepare data summary for AI analysis
    const dataSummary = entries.map(e => ({
      date: e.entry_date,
      cycle_phase: e.cycle_phase,
      pain_level: e.pain_level,
      emotional_score: e.emotional_score,
      emotional_state: e.emotional_state,
      physical_symptoms: e.physical_symptoms,
      yoga_practice: e.yoga_practice,
      daily_practices: e.daily_practices,
      spiritual_practices: e.spiritual_practices,
    }));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a holistic wellness AI analyst specializing in women's health, Ayurveda, and cycle tracking. 
Analyze wellness data and provide actionable insights about patterns, correlations, and predictions.
Return your response as valid JSON only with this structure:
{
  "insights": [{"title": "string", "description": "string", "severity": "info|warning|positive"}],
  "predictions": [{"title": "string", "description": "string", "timing": "string"}],
  "correlations": [{"factor1": "string", "factor2": "string", "relationship": "string", "strength": "weak|moderate|strong"}]
}`
          },
          {
            role: 'user',
            content: `Analyze this wellness data from the last 90 days and provide insights:

${JSON.stringify(dataSummary, null, 2)}

Focus on:
1. Patterns in cycle phases and symptoms
2. Correlations between practices (yoga, meditation, sleep) and wellbeing (pain, emotional state)
3. Predictions for upcoming cycle phases based on historical patterns
4. Recommendations for practices that correlate with better outcomes`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'AI rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response from AI
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    console.log('Analysis complete, returning results');

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-wellness-insights:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
