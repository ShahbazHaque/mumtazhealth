-- Create condition symptom tracking table
CREATE TABLE IF NOT EXISTS public.condition_symptom_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('pcos', 'endometriosis', 'pmdd', 'irregular', 'other')),
  entry_date DATE NOT NULL,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  symptoms JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, condition_type, entry_date)
);

-- Enable RLS
ALTER TABLE public.condition_symptom_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own symptom tracking"
  ON public.condition_symptom_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom tracking"
  ON public.condition_symptom_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom tracking"
  ON public.condition_symptom_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom tracking"
  ON public.condition_symptom_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_condition_symptom_tracking_updated_at
  BEFORE UPDATE ON public.condition_symptom_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_condition_symptom_tracking_user_date 
  ON public.condition_symptom_tracking(user_id, entry_date DESC);

CREATE INDEX idx_condition_symptom_tracking_condition 
  ON public.condition_symptom_tracking(user_id, condition_type, entry_date DESC);