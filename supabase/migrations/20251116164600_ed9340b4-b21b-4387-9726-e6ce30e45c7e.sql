-- Add life_stage column to user_wellness_profiles
ALTER TABLE user_wellness_profiles 
ADD COLUMN life_stage text CHECK (life_stage IN ('menstrual_cycle', 'pregnancy', 'postpartum', 'perimenopause', 'menopause', 'post_menopause'));