-- Add animation_url field to wellness_content table for animated instructional videos
-- This allows animations to be displayed for all users while live videos remain Premium-only

ALTER TABLE public.wellness_content 
ADD COLUMN IF NOT EXISTS animation_url TEXT;

-- Add a comment to clarify the distinction
COMMENT ON COLUMN public.wellness_content.animation_url IS 'URL for animated instructional videos (available to all tiers). video_url is reserved for live recorded sessions (Premium only).';
COMMENT ON COLUMN public.wellness_content.video_url IS 'URL for live recorded video sessions (Premium tier only).';