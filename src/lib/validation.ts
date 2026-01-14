import { z } from "zod";

// ============================================
// Input Validation Schemas for Security
// ============================================

// Maximum lengths for text fields
const MAX_SHORT_TEXT = 100;
const MAX_MEDIUM_TEXT = 500;
const MAX_LONG_TEXT = 2000;
const MAX_MESSAGE = 2000;

// Common schemas
export const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
export const usernameSchema = z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(50);
export const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

// Chat message validation
export const chatMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(MAX_MESSAGE, { message: `Message must be less than ${MAX_MESSAGE} characters` }),
});

// Booking validation
export const bookingSchema = z.object({
  service_id: z.string().uuid({ message: "Invalid service ID" }),
  booking_date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, { message: "Booking date must be a valid future date" }),
  notes: z.string()
    .max(MAX_MEDIUM_TEXT, { message: `Notes must be less than ${MAX_MEDIUM_TEXT} characters` })
    .optional()
    .nullable(),
});

// Wellness entry validation
export const wellnessEntrySchema = z.object({
  emotional_state: z.string()
    .max(MAX_SHORT_TEXT, { message: `Emotional state must be less than ${MAX_SHORT_TEXT} characters` })
    .optional()
    .nullable(),
  physical_symptoms: z.string()
    .max(MAX_MEDIUM_TEXT, { message: `Physical symptoms must be less than ${MAX_MEDIUM_TEXT} characters` })
    .optional()
    .nullable(),
  spiritual_anchor: z.string()
    .max(MAX_MEDIUM_TEXT, { message: `Spiritual anchor must be less than ${MAX_MEDIUM_TEXT} characters` })
    .optional()
    .nullable(),
  vata_crash: z.string()
    .max(MAX_MEDIUM_TEXT, { message: `Notes must be less than ${MAX_MEDIUM_TEXT} characters` })
    .optional()
    .nullable(),
  tweak_plan: z.string()
    .max(MAX_LONG_TEXT, { message: `Plan must be less than ${MAX_LONG_TEXT} characters` })
    .optional()
    .nullable(),
  monthly_reflection: z.string()
    .max(MAX_LONG_TEXT, { message: `Reflection must be less than ${MAX_LONG_TEXT} characters` })
    .optional()
    .nullable(),
  pain_level: z.number().int().min(0).max(10).optional().nullable(),
  emotional_score: z.number().int().min(1).max(10).optional().nullable(),
  trimester: z.number().int().min(1).max(3).optional().nullable(),
});

// Condition symptom tracking validation
export const symptomTrackingSchema = z.object({
  condition_type: z.enum(["pcos", "endometriosis", "pmdd", "irregular", "arthritis", "general"], {
    message: "Invalid condition type",
  }),
  pain_level: z.number().int().min(0).max(10, { message: "Pain level must be between 0 and 10" }),
  notes: z.string()
    .max(MAX_LONG_TEXT, { message: `Notes must be less than ${MAX_LONG_TEXT} characters` })
    .optional()
    .nullable(),
  symptoms: z.array(z.string().max(100)).max(50).optional().nullable(),
});

// Support plan log validation
export const supportPlanLogSchema = z.object({
  recommendation_title: z.string()
    .min(1, { message: "Title is required" })
    .max(MAX_SHORT_TEXT, { message: `Title must be less than ${MAX_SHORT_TEXT} characters` }),
  recommendation_type: z.string()
    .min(1, { message: "Type is required" })
    .max(50, { message: "Type must be less than 50 characters" }),
  recommendation_description: z.string()
    .max(MAX_MEDIUM_TEXT, { message: `Description must be less than ${MAX_MEDIUM_TEXT} characters` })
    .optional()
    .nullable(),
  notes: z.string()
    .max(MAX_LONG_TEXT, { message: `Notes must be less than ${MAX_LONG_TEXT} characters` })
    .optional()
    .nullable(),
  action_taken: z.string()
    .max(MAX_MEDIUM_TEXT, { message: `Action must be less than ${MAX_MEDIUM_TEXT} characters` })
    .optional()
    .nullable(),
  support_rating: z.number().int().min(1).max(5).optional().nullable(),
});

// Wisdom guide request validation (for edge function)
export const wisdomGuideRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().max(MAX_MESSAGE, { message: "Message too long" }),
  })).max(50, { message: "Too many messages in conversation" }),
  userName: z.string().max(100).optional(),
  primaryDosha: z.enum(["vata", "pitta", "kapha"]).optional().nullable(),
  secondaryDosha: z.enum(["vata", "pitta", "kapha"]).optional().nullable(),
  lifeStage: z.string().max(50).optional().nullable(),
});

// Booking email request validation (for edge function)
export const bookingEmailRequestSchema = z.object({
  type: z.enum(["confirmed", "cancelled", "admin_notification"]),
  bookingId: z.string().uuid({ message: "Invalid booking ID" }),
  userEmail: z.string().email({ message: "Invalid email" }),
  userName: z.string().max(100).optional(),
  serviceTitle: z.string().max(200).optional(),
  bookingDate: z.string().max(100).optional(),
  duration: z.string().max(50).optional(),
  price: z.string().max(50).optional(),
  notes: z.string().max(MAX_MEDIUM_TEXT).optional(),
  adminEmail: z.string().email().optional(),
});

// Helper function to safely validate and return errors
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Validation failed" };
  }
}

// Helper to truncate text to max length for safety
export function truncateText(text: string | null | undefined, maxLength: number): string | null {
  if (!text) return null;
  return text.length > maxLength ? text.substring(0, maxLength) : text;
}
