/**
 * Unified App Messaging & Tone Constants
 * 
 * This file contains all supportive messaging used throughout the app to ensure
 * a consistent, warm, non-judgmental, and empowering tone.
 * 
 * Core Philosophy:
 * - The app is a companion on a journey of self-discovery
 * - Everyone's path is unique - no judgment, just support
 * - As users engage more, they unlock deeper insights about themselves
 * - The app evolves with users through life phases
 * - Not a replacement for professional or practitioner care
 */

// ============= Core Brand Messages =============
export const CORE_MESSAGES = {
  appTagline: "Your companion on a journey of self-discovery",
  appPurpose: "Helping women understand and embrace their uniqueness as they evolve",
  founderConnection: "Built on 30+ years of holistic expertise — Ayurvedic wisdom, yoga, nutrition, and transformational healing, lovingly translated into digital care",
  notAReplacement: "This app offers guidance and education — for deeper or complex needs, personalised practitioner support is always recommended",
  evolutionPromise: "The more you engage, the more insights you unlock about yourself",
  paceMessage: "Explore at your own pace. Your wellness journey starts when you're ready",
};

// ============= Welcome & Greeting Messages =============
export const WELCOME_MESSAGES = {
  newUser: "Welcome to your personal wellness sanctuary",
  returningUser: "Welcome back to your wellness journey",
  morningGreeting: "Good morning — a new day to nurture yourself",
  afternoonGreeting: "Good afternoon — may you find a moment of peace",
  eveningGreeting: "Good evening — time to wind down and restore",
  
  // Entry points
  entryPrompt: "How would you like to continue today?",
  quickCheckInInvite: "Tell me how you're feeling right now — it only takes a moment",
  exploreInvite: "Browse yoga, nutrition, and wellness content at your own pace",
  trackingInvite: "Begin understanding your patterns and rhythms",
  journeyUpdate: "Life has changed? Update your preferences and the app evolves with you",
};

// ============= Supportive Journey Messages =============
export const JOURNEY_MESSAGES = {
  // Life phase transitions
  phaseEvolution: "Your needs evolve, and so does this app",
  phaseReassurance: "Whether you're moving through fertility, pregnancy, perimenopause, or beyond — we're here to support your unique journey",
  phaseNatural: "Changing phases is natural — the app is designed to support you without judgment",
  phaseUpdate: "Your body may be changing, and that's okay. Update your stage anytime and the guidance adapts to meet you where you are",
  
  // Progress encouragement (non-metric based)
  progressGentle: "Every step you take is meaningful",
  progressNoJudgment: "There's no right pace — only your pace",
  progressUnlocking: "The more you explore, the more tailored your journey becomes",
  progressCelebration: "You're building a deeper understanding of yourself",
  
  // Continuity messages
  continueWhere: "Pick up right where you left off",
  savedPractices: "Your saved practices are waiting for you",
  yourRhythm: "Move at your own rhythm — there's no pressure here",
};

// ============= Check-In & Feelings Messages =============
export const CHECKIN_MESSAGES = {
  invitation: "How are you feeling today?",
  selectionPrompt: "Select what resonates with you right now",
  noJudgment: "Whatever you're feeling is valid",
  afterSelection: "Thank you for sharing — here's some gentle support",
  patternInsight: "Over time, your check-ins reveal patterns that help us guide you better",
  
  // Supportive responses
  responseGentle: "Be gentle with yourself today",
  responseRest: "Honor your body with rest — even a few minutes",
  responseBreath: "A few slow breaths can help reset your nervous system",
  responseMoment: "Take a moment for yourself — you deserve it",
};

// ============= Content Library Messages =============
export const LIBRARY_MESSAGES = {
  header: "Your Wellness Library",
  description: "Explore practices designed to support you wherever you are in your journey",
  personalizedNote: "Content recommendations adapt as you engage and grow",
  unlockMessage: "The more you explore, the more personalized your suggestions become",
  
  // Content encouragement
  startAnywhere: "Start anywhere that feels right for you",
  noRightWay: "There's no right way to do this — follow your intuition",
  gentleReminder: "Gentle practices can be just as powerful as active ones",
  
  // Premium messaging (gentle, not pushy)
  premiumTeaser: "Deeper guidance is available when you're ready",
  tierProgression: "As you grow, additional support becomes available",
};

// ============= Tracker & Insights Messages =============
export const TRACKER_MESSAGES = {
  purpose: "Tracking helps you understand your unique patterns over time",
  noRequirement: "Log what feels meaningful — there's no requirement to track everything",
  patternDiscovery: "Over time, you'll discover patterns that are uniquely yours",
  insightUnlocking: "Your data reveals insights that help personalize your experience",
  
  // Phase-specific
  cycleAwareness: "Understanding your cycle helps you work with your body, not against it",
  pregnancySupport: "Each trimester brings new needs — your guidance adapts with you",
  menopauseSupport: "This transition is natural — the app supports you through each stage",
  recoverySupport: "Healing takes time — we're here for the gentle journey back",
};

// ============= Practitioner Connection Messages =============
export const PRACTITIONER_MESSAGES = {
  invitation: "For deeper healing and personalized support, Mumtaz is here for you",
  positioning: "This app introduces you to a way of understanding yourself — and invites you to learn more with expert support when you're ready",
  services: "Consultations, workshops, retreats, and training offer deeper, practitioner-led guidance",
  founderNote: "Built from 30+ years of lived experience and professional practice",
  
  // Gentle CTAs
  deeperSupport: "Ready for more personalized guidance?",
  bookSession: "Book a session with Mumtaz",
  workshopInvite: "Join a workshop to deepen your practice",
};

// ============= Medical Disclaimer Messages =============
export const DISCLAIMER_MESSAGES = {
  standard: "This is not medical advice. Please consult your healthcare provider for medical concerns.",
  supportive: "This app offers supportive guidance — it is not a replacement for professional medical care.",
  companion: "A gentle guide for your journey — for deeper or complex needs, personalised practitioner support is always recommended.",
  encouragement: "Always seek advice from your healthcare team for medical decisions.",
  
  // Condition-specific
  pregnancyNote: "Please work closely with your midwife or doctor throughout your pregnancy journey.",
  cancerNote: "We're here for emotional and lifestyle support — please continue working with your medical team.",
  chronicNote: "Living with a chronic condition requires personalized care — this app supports but doesn't replace it.",
};

// ============= Chatbot/Wisdom Guide Messages =============
export const CHATBOT_MESSAGES = {
  greeting: (name?: string) => `Hi ${name || 'there'}, how can I support you today?`,
  role: "Your personal wellness companion",
  limitations: "I'm here to offer supportive guidance based on holistic wisdom — for medical advice, please consult a professional",
  encouragement: "You're doing wonderfully by taking time for yourself",
  noHistory: "No conversation history yet — start a chat to begin",
  newChat: "Start a new conversation",
};

// ============= Onboarding & Tour Messages =============
export const ONBOARDING_MESSAGES = {
  welcome: "Welcome to Mumtaz Health! Let me show you around your personalized wellness journey.",
  profileIntro: "Here's your wellness profile — it adapts as you share more about yourself",
  trackingIntro: "Track your wellness journey at your own pace — every entry helps personalize your experience",
  libraryIntro: "Explore content tailored to your dosha, life stage, and current needs",
  insightsIntro: "Discover patterns and insights that are uniquely yours",
  
  // Completion
  complete: "You're ready to begin! Explore at your own pace — there's no pressure here.",
  skipOption: "Skip tour — you can always explore on your own",
};

// ============= Empty State Messages =============
export const EMPTY_STATES = {
  noFavorites: "Your saved practices will appear here — save anything that resonates with you",
  noHistory: "Start tracking to see your patterns over time",
  noRecommendations: "Complete a check-in to receive personalized suggestions",
  noInsights: "Keep engaging with the app to unlock personalized insights",
  newJourney: "Your wellness journey begins here — take your first step when you're ready",
};

// ============= Success & Encouragement Messages =============
export const SUCCESS_MESSAGES = {
  saved: "Saved to your practices",
  completed: "Well done — you've completed this practice",
  checkInLogged: "Thank you for checking in — your patterns are being recorded",
  progressMade: "Every step forward is a step toward deeper self-understanding",
  profileUpdated: "Your preferences have been updated — your content will adapt accordingly",
};

// ============= Error & Recovery Messages =============
export const ERROR_MESSAGES = {
  gentle: "Something went wrong — please try again when you're ready",
  connectionIssue: "We're having trouble connecting — please check your connection",
  tryAgain: "Let's try that again",
  support: "If this continues, please reach out for support",
};

// ============= Helper Functions =============
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return WELCOME_MESSAGES.morningGreeting;
  if (hour < 17) return WELCOME_MESSAGES.afternoonGreeting;
  return WELCOME_MESSAGES.eveningGreeting;
};

export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};
