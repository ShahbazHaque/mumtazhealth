-- Add focus_areas column to user_wellness_profiles for tracking user's areas of focus
ALTER TABLE user_wellness_profiles 
ADD COLUMN IF NOT EXISTS focus_areas text[] DEFAULT '{}'::text[];

-- Add comment for documentation
COMMENT ON COLUMN user_wellness_profiles.focus_areas IS 'User-selected focus areas for personalized tracking (energy, mood, sleep, cycle, digestion, joints, etc.)';