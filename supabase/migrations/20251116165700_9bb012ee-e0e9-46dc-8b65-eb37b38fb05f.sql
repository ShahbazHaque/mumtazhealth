-- Add postpartum tracking fields to wellness_entries
ALTER TABLE wellness_entries 
ADD COLUMN postpartum_tracking jsonb DEFAULT '{}'::jsonb;