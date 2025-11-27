-- Update tier_requirement constraint to include 'standard' tier
ALTER TABLE wellness_content 
DROP CONSTRAINT IF EXISTS wellness_content_tier_requirement_check;

ALTER TABLE wellness_content 
ADD CONSTRAINT wellness_content_tier_requirement_check 
CHECK (tier_requirement IN ('free', 'basic', 'standard', 'premium'));

-- Update user_wellness_profiles subscription_tier constraint to include 'standard'
ALTER TABLE user_wellness_profiles 
DROP CONSTRAINT IF EXISTS user_wellness_profiles_subscription_tier_check;

ALTER TABLE user_wellness_profiles 
ADD CONSTRAINT user_wellness_profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'basic', 'standard', 'premium'));