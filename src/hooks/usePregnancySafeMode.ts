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
 * Pregnancy exclusion criteria - poses to avoid during pregnancy
 */
export const PREGNANCY_EXCLUDED_CRITERIA = {
  // Pose IDs to explicitly exclude
  excludedPoseIds: [
    'full-splits',           // Hanumanasana - splits
    'scissors-core',         // Strong core compression
    'core-block-work',       // Strong core compression
    'king-pigeon-seated',    // Deep backbend + hip opener
    'pigeon-pose-variation', // Advanced flexibility, deep hip opener
  ],
  
  // Categories to exclude
  excludedCategories: [
    'Advanced Flexibility',
    'Core Strengthening',
    'Power Yoga',
    'Hot Yoga',
  ],
  
  // Keywords in pose names/descriptions that indicate exclusion
  excludedKeywords: [
    'splits',
    'hanumanasana',
    'deep twist',
    'closed twist',
    'deep lunge',
    'intense core',
    'core compression',
    'strong core',
    'supine', // lying flat on back - exclude after 1st trimester
    'flat on back',
    'inversions',
    'headstand',
    'handstand',
    'wheel pose',
    'intense backbend',
  ],
  
  // Sanskrit names to exclude
  excludedSanskritNames: [
    'hanumanasana',          // Full splits
    'parivrtta',             // Revolved/twisted poses
    'navasana',              // Boat pose (core)
    'urdhva dhanurasana',    // Wheel pose
    'sirsasana',             // Headstand
    'adho mukha vrksasana',  // Handstand
  ],
};

/**
 * Check if a pose should be excluded during pregnancy
 */
export function isPoseExcludedForPregnancy(
  pose: {
    id: string;
    name: string;
    sanskritName: string;
    category: string;
    description?: string;
    lifePhases?: string[];
  },
  trimester: number | null
): boolean {
  const criteria = PREGNANCY_EXCLUDED_CRITERIA;
  const lowerName = pose.name.toLowerCase();
  const lowerSanskrit = pose.sanskritName.toLowerCase();
  const lowerCategory = pose.category.toLowerCase();
  const lowerDescription = (pose.description || '').toLowerCase();
  
  // Check explicit pose ID exclusion
  if (criteria.excludedPoseIds.includes(pose.id)) {
    return true;
  }
  
  // Check category exclusion
  if (criteria.excludedCategories.some(cat => lowerCategory.includes(cat.toLowerCase()))) {
    return true;
  }
  
  // Check keyword exclusion in name or description
  if (criteria.excludedKeywords.some(keyword => 
    lowerName.includes(keyword) || lowerDescription.includes(keyword)
  )) {
    return true;
  }
  
  // Check Sanskrit name exclusion
  if (criteria.excludedSanskritNames.some(sanskrit => 
    lowerSanskrit.includes(sanskrit)
  )) {
    return true;
  }
  
  // After first trimester, exclude poses lying flat on the back
  if (trimester && trimester > 1) {
    const supineKeywords = ['supine', 'lying on back', 'flat on back', 'reclined'];
    if (supineKeywords.some(keyword => 
      lowerName.includes(keyword) || lowerDescription.includes(keyword)
    )) {
      return true;
    }
  }
  
  // Check if pose explicitly doesn't support pregnancy in lifePhases
  if (pose.lifePhases && pose.lifePhases.length > 0) {
    const hasAnyPregnancySupport = pose.lifePhases.some(phase => {
      const lowerPhase = phase.toLowerCase();
      return lowerPhase.includes('pregnancy') || lowerPhase.includes('trimester') || lowerPhase.includes('prenatal');
    });
    
    // If the pose has lifePhases defined but none include pregnancy, it's likely not suitable
    if (!hasAnyPregnancySupport) {
      // Check if it's a gentle/restorative pose that might still be safe
      const safeCategories = ['restorative', 'gentle', 'stretching', 'breathing'];
      const isSafeCategory = safeCategories.some(safe => lowerCategory.includes(safe));
      if (!isSafeCategory) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Filter poses that are safe for pregnancy - comprehensive filtering
 */
export function filterPregnancySafePoses<T extends { 
  id: string;
  name: string;
  sanskritName: string;
  category: string;
  description?: string;
  lifePhases?: string[];
}>(
  poses: T[],
  trimester: number | null
): T[] {
  return poses.filter(pose => !isPoseExcludedForPregnancy(pose, trimester));
}

/**
 * Get list of excluded pose types for UI display
 */
export function getPregnancyExclusionReasons(): string[] {
  return [
    'Advanced poses',
    'Splits (Hanumanasana)',
    'Deep twists',
    'Closed twists',
    'Deep lunges',
    'Strong core compression',
    'Poses lying flat on back (after 1st trimester)',
  ];
}

/**
 * Get poses that should be avoided during pregnancy (legacy support)
 */
export function getPregnancyAvoidedPoses(): string[] {
  return PREGNANCY_EXCLUDED_CRITERIA.excludedPoseIds;
}

/**
 * Check if a specific pose category is safe for pregnancy
 */
export function isPoseSafeForPregnancy(
  poseCategory: string,
  trimester: number | null
): boolean {
  const unsafeCategories = PREGNANCY_EXCLUDED_CRITERIA.excludedCategories;
  return !unsafeCategories.some(cat => 
    poseCategory.toLowerCase().includes(cat.toLowerCase())
  );
}
