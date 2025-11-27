-- Add subscription tier to user wellness profiles
ALTER TABLE public.user_wellness_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium'));

-- Add tier requirement and preview fields to wellness content
ALTER TABLE public.wellness_content
ADD COLUMN IF NOT EXISTS tier_requirement text DEFAULT 'free' CHECK (tier_requirement IN ('free', 'basic', 'premium')),
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preview_content text;

-- Add completion requirement (number of completed items needed to unlock)
ALTER TABLE public.wellness_content
ADD COLUMN IF NOT EXISTS unlock_after_completions integer DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_wellness_content_tier ON public.wellness_content(tier_requirement);
CREATE INDEX IF NOT EXISTS idx_user_wellness_profiles_tier ON public.user_wellness_profiles(subscription_tier);

-- Update existing content to have varied tier requirements
-- This is just a sample - you can adjust based on your content strategy
UPDATE public.wellness_content 
SET tier_requirement = 'free', 
    unlock_after_completions = 0,
    is_premium = false
WHERE difficulty_level = 'beginner' OR difficulty_level IS NULL;

UPDATE public.wellness_content 
SET tier_requirement = 'basic', 
    unlock_after_completions = 3,
    is_premium = false
WHERE difficulty_level = 'intermediate';

UPDATE public.wellness_content 
SET tier_requirement = 'premium', 
    unlock_after_completions = 10,
    is_premium = true
WHERE difficulty_level = 'advanced';