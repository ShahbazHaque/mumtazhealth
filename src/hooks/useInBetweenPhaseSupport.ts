import { useMemo } from "react";

/**
 * In-Between Phase Support Configuration
 * 
 * For users in transitional life phases (cycle_changes, peri_menopause_transition),
 * this hook provides configuration for:
 * - Prioritizing gentle, stabilizing practices
 * - Avoiding extremes of intensity or heat
 * - Disabling weight loss language
 * - Disabling streak/achievement language
 * - Prioritizing nervous system support
 */

export interface InBetweenPhaseConfig {
  isInBetweenPhase: boolean;
  phaseType: 'cycle_changes' | 'peri_menopause_transition' | null;
  
  // Content preferences
  prioritizeGentle: boolean;
  prioritizeNervousSystemSupport: boolean;
  avoidIntensity: boolean;
  avoidHeat: boolean;
  
  // Messaging flags
  disableWeightLossLanguage: boolean;
  disableStreakLanguage: boolean;
  disableAchievementMetrics: boolean;
  
  // Content scoring boosts
  contentBoosts: string[];
  contentAvoid: string[];
  
  // Supportive messaging
  supportiveMessage: string;
  gentleReminder: string;
}

// Keywords that indicate gentle, stabilizing content
const GENTLE_CONTENT_KEYWORDS = [
  'gentle', 'restorative', 'calming', 'grounding', 'stabilizing',
  'soothing', 'nurturing', 'supportive', 'relaxing', 'balancing',
  'nervous system', 'rest', 'restore', 'ease', 'soft',
  'slow', 'mindful', 'breathwork', 'meditation', 'yin',
  'chair', 'supported', 'accessible', 'beginner'
];

// Keywords that indicate intensity or heat (to avoid for in-between phases)
const INTENSITY_KEYWORDS = [
  'intense', 'advanced', 'power', 'hot', 'heating',
  'vigorous', 'dynamic', 'challenging', 'weight loss', 'burn',
  'sculpt', 'tone', 'strength training', 'high intensity', 'HIIT',
  'cardio', 'fat burning', 'detox', 'cleanse'
];

// Keywords for nervous system support
const NERVOUS_SYSTEM_KEYWORDS = [
  'nervous system', 'vagus', 'parasympathetic', 'calming',
  'anxiety', 'stress relief', 'relaxation', 'sleep',
  'grounding', 'centering', 'breathing', 'pranayama',
  'restorative', 'yin', 'meditation', 'mindfulness'
];

export const IN_BETWEEN_PHASES = ['cycle_changes', 'peri_menopause_transition'] as const;

export function isInBetweenPhase(lifeStage: string | null | undefined): boolean {
  if (!lifeStage) return false;
  return IN_BETWEEN_PHASES.includes(lifeStage as typeof IN_BETWEEN_PHASES[number]);
}

export function getInBetweenPhaseType(lifeStage: string | null | undefined): 'cycle_changes' | 'peri_menopause_transition' | null {
  if (!lifeStage) return null;
  if (lifeStage === 'cycle_changes') return 'cycle_changes';
  if (lifeStage === 'peri_menopause_transition') return 'peri_menopause_transition';
  return null;
}

export function useInBetweenPhaseSupport(lifeStage: string | null | undefined): InBetweenPhaseConfig {
  return useMemo(() => {
    const inBetween = isInBetweenPhase(lifeStage);
    const phaseType = getInBetweenPhaseType(lifeStage);
    
    if (!inBetween) {
      return {
        isInBetweenPhase: false,
        phaseType: null,
        prioritizeGentle: false,
        prioritizeNervousSystemSupport: false,
        avoidIntensity: false,
        avoidHeat: false,
        disableWeightLossLanguage: false,
        disableStreakLanguage: false,
        disableAchievementMetrics: false,
        contentBoosts: [],
        contentAvoid: [],
        supportiveMessage: '',
        gentleReminder: '',
      };
    }

    const supportiveMessages = {
      cycle_changes: "Your body is in a natural transition. Gentle, stabilizing practices support you as patterns shift.",
      peri_menopause_transition: "You're moving through a threshold time. Nurturing practices help your nervous system find its new rhythm.",
    };

    const gentleReminders = {
      cycle_changes: "Focus on what feels supportive today — there's no need to push.",
      peri_menopause_transition: "Honor your body's wisdom. Rest is productive during this transition.",
    };

    return {
      isInBetweenPhase: true,
      phaseType,
      prioritizeGentle: true,
      prioritizeNervousSystemSupport: true,
      avoidIntensity: true,
      avoidHeat: true,
      disableWeightLossLanguage: true,
      disableStreakLanguage: true,
      disableAchievementMetrics: true,
      contentBoosts: [...GENTLE_CONTENT_KEYWORDS, ...NERVOUS_SYSTEM_KEYWORDS],
      contentAvoid: INTENSITY_KEYWORDS,
      supportiveMessage: phaseType ? supportiveMessages[phaseType] : '',
      gentleReminder: phaseType ? gentleReminders[phaseType] : '',
    };
  }, [lifeStage]);
}

/**
 * Score content for in-between phase users
 * Returns a boost/penalty score based on content suitability
 */
export function scoreContentForInBetweenPhase(
  content: {
    title?: string;
    description?: string;
    tags?: string[];
    difficulty_level?: string;
    content_type?: string;
  },
  config: InBetweenPhaseConfig
): number {
  if (!config.isInBetweenPhase) return 0;

  let score = 0;
  const searchText = `${content.title || ''} ${content.description || ''} ${(content.tags || []).join(' ')}`.toLowerCase();

  // Boost for gentle content
  for (const keyword of config.contentBoosts) {
    if (searchText.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  // Penalty for intensity/heat content
  for (const keyword of config.contentAvoid) {
    if (searchText.includes(keyword.toLowerCase())) {
      score -= 5; // Strong penalty
    }
  }

  // Boost for beginner/gentle difficulty
  if (content.difficulty_level === 'beginner' || content.difficulty_level === 'gentle') {
    score += 3;
  }

  // Boost for restorative content types
  if (content.content_type === 'meditation' || content.content_type === 'breathwork') {
    score += 2;
  }

  // Penalty for advanced difficulty
  if (content.difficulty_level === 'advanced' || content.difficulty_level === 'intermediate') {
    score -= 3;
  }

  return score;
}

/**
 * Filter text to remove weight loss and achievement language
 * for in-between phase users
 */
export function sanitizeMessagingForInBetweenPhase(
  text: string,
  config: InBetweenPhaseConfig
): string {
  if (!config.isInBetweenPhase) return text;

  let sanitized = text;

  if (config.disableWeightLossLanguage) {
    // Replace weight loss language with supportive alternatives
    const weightLossReplacements: [RegExp, string][] = [
      [/weight loss/gi, 'wellbeing'],
      [/burn (fat|calories)/gi, 'support your body'],
      [/lose weight/gi, 'feel balanced'],
      [/slim(ming)?/gi, 'supportive'],
      [/tone your/gi, 'nurture your'],
      [/sculpt/gi, 'strengthen gently'],
    ];

    for (const [pattern, replacement] of weightLossReplacements) {
      sanitized = sanitized.replace(pattern, replacement);
    }
  }

  if (config.disableStreakLanguage) {
    // Replace streak/achievement language
    const streakReplacements: [RegExp, string][] = [
      [/(\d+)[- ]day streak/gi, 'your ongoing practice'],
      [/streak/gi, 'journey'],
      [/don't break your/gi, 'continue'],
      [/keep your streak/gi, 'honor your practice'],
      [/consecutive days/gi, 'regular practice'],
    ];

    for (const [pattern, replacement] of streakReplacements) {
      sanitized = sanitized.replace(pattern, replacement);
    }
  }

  return sanitized;
}

/**
 * Get phase-appropriate encouragement message
 */
export function getInBetweenPhaseEncouragement(config: InBetweenPhaseConfig): string[] {
  if (!config.isInBetweenPhase) return [];

  const messages = [
    "Your body knows what it needs — trust its wisdom.",
    "Gentle practices can be profoundly healing.",
    "There's no pressure to perform. Rest is productive.",
    "Every small act of self-care matters.",
    "Your nervous system thrives with consistency, not intensity.",
    "This transition is temporary. You are supported.",
    "Honor whatever pace feels right today.",
    "Stability comes from within — not from pushing harder.",
  ];

  return messages;
}

export default useInBetweenPhaseSupport;