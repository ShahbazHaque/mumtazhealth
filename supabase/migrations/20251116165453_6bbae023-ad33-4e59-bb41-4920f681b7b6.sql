-- Add pregnancy tracking fields to wellness_entries
ALTER TABLE wellness_entries 
ADD COLUMN pregnancy_tracking jsonb DEFAULT '{}'::jsonb;