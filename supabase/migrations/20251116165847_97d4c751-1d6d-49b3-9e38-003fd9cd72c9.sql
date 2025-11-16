-- Add menopause tracking fields to wellness_entries
ALTER TABLE wellness_entries 
ADD COLUMN menopause_tracking jsonb DEFAULT '{}'::jsonb;