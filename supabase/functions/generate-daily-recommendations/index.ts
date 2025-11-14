import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating recommendations for user:', user.id);

    // Get user's wellness profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_wellness_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return new Response(
        JSON.stringify({ error: 'User wellness profile not found. Please complete onboarding.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's most recent wellness entry to determine cycle phase
    const { data: recentEntry } = await supabaseClient
      .from('wellness_entries')
      .select('cycle_phase')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(1)
      .single();

    const cyclePhase = recentEntry?.cycle_phase || 'follicular';
    const pregnancyStatus = profile.pregnancy_status || 'not_pregnant';
    const primaryDosha = profile.primary_dosha;
    const secondaryDosha = profile.secondary_dosha;

    console.log('User profile:', { cyclePhase, pregnancyStatus, primaryDosha, secondaryDosha });

    // Build query for matching content
    let contentQuery = supabaseClient
      .from('wellness_content')
      .select('*')
      .eq('is_active', true);

    // Filter by pregnancy status
    if (pregnancyStatus) {
      contentQuery = contentQuery.contains('pregnancy_statuses', [pregnancyStatus]);
    }

    // Filter by cycle phase (only if not pregnant)
    if (pregnancyStatus === 'not_pregnant' || pregnancyStatus === 'trying_to_conceive') {
      contentQuery = contentQuery.contains('cycle_phases', [cyclePhase]);
    }

    const { data: allContent, error: contentError } = await contentQuery;

    if (contentError) {
      console.error('Content query error:', contentError);
      return new Response(JSON.stringify({ error: 'Failed to fetch content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found matching content:', allContent?.length || 0);

    // Score content based on dosha match
    const scoredContent = (allContent || []).map((content) => {
      let score = 0;
      const doshas = content.doshas || [];

      // Higher score for primary dosha match
      if (primaryDosha && doshas.includes(primaryDosha)) {
        score += 3;
      }

      // Lower score for secondary dosha match
      if (secondaryDosha && doshas.includes(secondaryDosha)) {
        score += 1;
      }

      // Bonus for matching all doshas (universal content)
      if (doshas.length === 3) {
        score += 0.5;
      }

      return { ...content, score };
    });

    // Sort by score and select diverse content types
    const sortedContent = scoredContent.sort((a, b) => b.score - a.score);

    // Select recommendations with diversity
    const recommendations: any[] = [];
    const contentTypes = ['yoga', 'meditation', 'nutrition', 'article'];

    // Try to get at least one of each type
    for (const type of contentTypes) {
      const contentOfType = sortedContent.find(
        (c) => c.content_type === type && !recommendations.includes(c)
      );
      if (contentOfType) {
        recommendations.push(contentOfType);
      }
    }

    // Fill remaining slots with highest scored content
    const remaining = sortedContent.filter((c) => !recommendations.includes(c));
    while (recommendations.length < 6 && remaining.length > 0) {
      recommendations.push(remaining.shift()!);
    }

    console.log('Selected recommendations:', recommendations.length);

    // Check if recommendations already exist for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabaseClient
      .from('daily_recommendations')
      .select('id')
      .eq('user_id', user.id)
      .eq('recommendation_date', today)
      .single();

    const contentIds = recommendations.map((r) => r.id);

    if (existing) {
      // Update existing recommendations
      const { error: updateError } = await supabaseClient
        .from('daily_recommendations')
        .update({
          content_ids: contentIds,
          cycle_phase: cyclePhase,
          pregnancy_status: pregnancyStatus,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
    } else {
      // Insert new recommendations
      const { error: insertError } = await supabaseClient
        .from('daily_recommendations')
        .insert({
          user_id: user.id,
          content_ids: contentIds,
          cycle_phase: cyclePhase,
          pregnancy_status: pregnancyStatus,
          recommendation_date: today,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    console.log('Recommendations saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        metadata: {
          cycle_phase: cyclePhase,
          pregnancy_status: pregnancyStatus,
          primary_dosha: primaryDosha,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
