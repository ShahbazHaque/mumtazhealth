-- Add primary_focus column for multi-select wellness focus areas
ALTER TABLE public.user_wellness_profiles 
ADD COLUMN IF NOT EXISTS primary_focus text[] DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.user_wellness_profiles.primary_focus IS 'User-selected primary wellness focus areas (e.g., overall_health, hormonal_balance, energy_resilience, recovery_healing, fertility_awareness)';

-- Update life_stage to also be an array to support multi-select life phases
-- First, let's create a new column for the array version
ALTER TABLE public.user_wellness_profiles 
ADD COLUMN IF NOT EXISTS life_phases text[] DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.user_wellness_profiles.life_phases IS 'User-selected life phases array for multi-select (replaces single life_stage for new users)';