-- Drop the existing constraint and add updated life_stage options
ALTER TABLE user_wellness_profiles 
DROP CONSTRAINT IF EXISTS user_wellness_profiles_life_stage_check;

ALTER TABLE user_wellness_profiles 
ADD CONSTRAINT user_wellness_profiles_life_stage_check 
CHECK (life_stage IN (
  'menstrual_cycle',
  'cycle_changes',
  'perimenopause',
  'peri_menopause_transition',
  'menopause',
  'post_menopause',
  'not_sure',
  'pregnancy',
  'postpartum'
));