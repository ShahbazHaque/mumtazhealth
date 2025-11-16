-- Add trimester field to wellness_entries for pregnancy tracking
ALTER TABLE wellness_entries 
ADD COLUMN trimester integer CHECK (trimester >= 1 AND trimester <= 3);