import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface WellnessContent {
  id: string;
  title: string;
  content_type: string;
  difficulty_level?: string;
  doshas?: string[];
  tags?: string[];
  description?: string;
  content_url?: string;
}

interface ScoredContent extends WellnessContent {
  score: number;
}

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
    const lifeStage = profile.life_stage || null;
    const primaryDosha = profile.primary_dosha;
    const secondaryDosha = profile.secondary_dosha;
    const focusAreas = profile.focus_areas || [];
    
    // Determine special modes
    const isPregnancySafeMode = lifeStage === 'pregnancy' || pregnancyStatus === 'pregnant';
    const isInBetweenPhase = lifeStage === 'cycle_changes' || lifeStage === 'peri_menopause_transition';

    console.log('User profile:', { 
      cyclePhase, pregnancyStatus, lifeStage, primaryDosha, secondaryDosha, 
      isPregnancySafeMode, isInBetweenPhase, focusAreas 
    });

    // Keywords for in-between phase content prioritization
    const GENTLE_KEYWORDS = [
      'gentle', 'restorative', 'calming', 'grounding', 'stabilizing',
      'soothing', 'nurturing', 'supportive', 'relaxing', 'balancing',
      'nervous system', 'rest', 'restore', 'ease', 'soft',
      'slow', 'mindful', 'breathwork', 'meditation', 'yin',
      'chair', 'supported', 'accessible', 'beginner'
    ];

    const INTENSITY_KEYWORDS = [
      'intense', 'advanced', 'power', 'hot', 'heating',
      'vigorous', 'dynamic', 'challenging', 'weight loss', 'burn',
      'sculpt', 'tone', 'strength training', 'high intensity'
    ];

    // Build query for matching content
    let contentQuery = supabaseClient
      .from('wellness_content')
      .select('*')
      .eq('is_active', true);

    // Filter by pregnancy status - prioritize pregnancy-safe content when in pregnancy safe mode
    if (isPregnancySafeMode) {
      // In pregnancy safe mode, filter for pregnancy-safe content
      contentQuery = contentQuery.contains('pregnancy_statuses', ['pregnant']);
    } else if (pregnancyStatus) {
      contentQuery = contentQuery.contains('pregnancy_statuses', [pregnancyStatus]);
    }

    // Filter by cycle phase (only if not in pregnancy safe mode or in-between phase)
    if (!isPregnancySafeMode && !isInBetweenPhase && (pregnancyStatus === 'not_pregnant' || pregnancyStatus === 'trying_to_conceive')) {
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

    // Score content based on dosha match and in-between phase preferences
    const scoredContent = (allContent || []).map((content) => {
      let score = 0;
      const doshas = content.doshas || [];
      const tags = content.tags || [];
      const searchText = `${content.title || ''} ${content.description || ''} ${tags.join(' ')}`.toLowerCase();

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

      // IN-BETWEEN PHASE SCORING
      if (isInBetweenPhase) {
        // Boost gentle, stabilizing content
        for (const keyword of GENTLE_KEYWORDS) {
          if (searchText.includes(keyword)) {
            score += 2;
          }
        }

        // Strong penalty for intensity/heat content
        for (const keyword of INTENSITY_KEYWORDS) {
          if (searchText.includes(keyword)) {
            score -= 8; // Strong penalty to effectively exclude
          }
        }

        // Boost beginner/gentle difficulty
        if (content.difficulty_level === 'beginner' || content.difficulty_level === 'gentle') {
          score += 4;
        }

        // Boost restorative content types
        if (content.content_type === 'meditation' || searchText.includes('restorative')) {
          score += 3;
        }

        // Penalty for advanced difficulty
        if (content.difficulty_level === 'advanced') {
          score -= 5;
        }
        if (content.difficulty_level === 'intermediate') {
          score -= 2;
        }

        // Boost for nervous system support
        if (searchText.includes('nervous system') || searchText.includes('calming') || searchText.includes('grounding')) {
          score += 4;
        }

        // Boost for focus areas if user has selected them
        for (const area of focusAreas) {
          if (searchText.includes(area) || tags.includes(area)) {
            score += 3;
          }
        }
      }

      return { ...content, score };
    });

    // Sort by score and select diverse content types
    const sortedContent = scoredContent.sort((a, b) => b.score - a.score);

    // Select recommendations with diversity
    const recommendations: ScoredContent[] = [];
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
          life_stage: lifeStage,
          pregnancy_safe_mode: isPregnancySafeMode,
          in_between_phase: isInBetweenPhase,
          focus_areas: focusAreas,
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
