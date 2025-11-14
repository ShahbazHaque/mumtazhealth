-- Add new columns to wellness_entries for enhanced tracking
ALTER TABLE wellness_entries
ADD COLUMN IF NOT EXISTS yoga_practice jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS nutrition_log jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS spiritual_practices jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN wellness_entries.yoga_practice IS 'Stores yoga practice details: {style, duration_minutes, poses, notes}';
COMMENT ON COLUMN wellness_entries.nutrition_log IS 'Stores nutrition details: {meals: [{name, time, dosha_notes}]}';
COMMENT ON COLUMN wellness_entries.spiritual_practices IS 'Stores spiritual practice details: {fajr, dhuhr, asr, maghrib, isha, mantras, meditation_minutes, notes}';