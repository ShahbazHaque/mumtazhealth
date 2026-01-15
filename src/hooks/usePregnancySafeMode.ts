import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PregnancySafeModeState {
  isPregnancySafeMode: boolean;
  trimester: number | null;
  isLoading: boolean;
  lifeStage: string | null;
}

/**
 * Hook to detect and manage pregnancy safe mode
 * 
 * When user's life_stage is "pregnancy", this enables pregnancy_safe_mode
 * which filters content, poses, and recommendations for pregnancy safety.
 */
export function usePregnancySafeMode(): PregnancySafeModeState {
  const [isPregnancySafeMode, setIsPregnancySafeMode] = useState(false);
  const [trimester, setTrimester] = useState<number | null>(null);
  const [lifeStage, setLifeStage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPregnancyStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('user_wellness_profiles')
          .select('life_stage, current_trimester, pregnancy_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching pregnancy status:', error);
          setIsLoading(false);
          return;
        }

        if (profile) {
          const isPregnant = profile.life_stage === 'pregnancy' || 
                            profile.pregnancy_status === 'pregnant';
          
          setLifeStage(profile.life_stage);
          setIsPregnancySafeMode(isPregnant);
          setTrimester(isPregnant ? profile.current_trimester : null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error in pregnancy safe mode check:', error);
        setIsLoading(false);
      }
    };

    checkPregnancyStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkPregnancyStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isPregnancySafeMode, trimester, isLoading, lifeStage };
}

/**
 * Filter poses that are safe for pregnancy
 */
export function filterPregnancySafePoses<T extends { lifePhases?: string[] }>(
  poses: T[],
  trimester: number | null
): T[] {
  if (!trimester) return poses;

  const trimesterLabel = `${trimester}${trimester === 1 ? 'st' : trimester === 2 ? 'nd' : 'rd'} trimester`;
  
  return poses.filter(pose => {
    if (!pose.lifePhases) return false;
    
    // Check if any life phase includes pregnancy references
    return pose.lifePhases.some(phase => {
      const lowerPhase = phase.toLowerCase();
      return lowerPhase.includes('pregnancy') || 
             lowerPhase.includes('trimester') ||
             lowerPhase.includes('prenatal');
    });
  });
}

/**
 * Get poses that should be avoided during pregnancy
 */
export function getPregnancyAvoidedPoses(): string[] {
  return [
    'deep-twist',
    'full-wheel',
    'intense-backbend',
    'deep-forward-fold',
    'inversions',
    'strong-core',
    'hot-yoga',
    'belly-down'
  ];
}

/**
 * Check if a specific pose category is safe for pregnancy
 */
export function isPoseSafeForPregnancy(
  poseCategory: string,
  trimester: number | null
): boolean {
  const unsafeCategories = [
    'intense-core',
    'deep-twists',
    'strong-inversions',
    'hot-yoga',
    'power-yoga'
  ];

  // First trimester - most gentle poses
  if (trimester === 1) {
    return !unsafeCategories.includes(poseCategory.toLowerCase()) &&
           !['jumping', 'dynamic-transitions'].includes(poseCategory.toLowerCase());
  }

  // Second trimester - avoid belly pressure
  if (trimester === 2) {
    return !unsafeCategories.includes(poseCategory.toLowerCase()) &&
           !['prone-poses', 'belly-down'].includes(poseCategory.toLowerCase());
  }

  // Third trimester - most modifications needed
  if (trimester === 3) {
    return !unsafeCategories.includes(poseCategory.toLowerCase()) &&
           !['prone-poses', 'belly-down', 'balance-intensive'].includes(poseCategory.toLowerCase());
  }

  return true;
}
