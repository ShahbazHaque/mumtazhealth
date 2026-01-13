-- Create table for support plan logs (what users tried and how it helped)
CREATE TABLE public.support_plan_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recommendation_id TEXT,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('yoga', 'nutrition', 'lifestyle', 'spiritual')),
  recommendation_title TEXT NOT NULL,
  recommendation_description TEXT,
  action_taken TEXT CHECK (action_taken IN ('saved', 'tried', 'added_to_plan')),
  helped_mood BOOLEAN DEFAULT FALSE,
  helped_pain BOOLEAN DEFAULT FALSE,
  helped_sleep BOOLEAN DEFAULT FALSE,
  helped_digestion BOOLEAN DEFAULT FALSE,
  helped_energy BOOLEAN DEFAULT FALSE,
  support_rating INTEGER CHECK (support_rating >= 1 AND support_rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for saved practices
CREATE TABLE public.saved_practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice_type TEXT NOT NULL CHECK (practice_type IN ('yoga', 'nutrition', 'lifestyle', 'spiritual')),
  practice_title TEXT NOT NULL,
  practice_description TEXT,
  practice_data JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, practice_type, practice_title)
);

-- Create table for tracking what works patterns over time
CREATE TABLE public.wellness_effectiveness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  life_stage TEXT,
  current_symptoms TEXT[],
  practices_tried TEXT[],
  overall_effectiveness INTEGER CHECK (overall_effectiveness >= 1 AND overall_effectiveness <= 5),
  mood_improvement BOOLEAN,
  pain_improvement BOOLEAN,
  sleep_improvement BOOLEAN,
  energy_improvement BOOLEAN,
  digestion_improvement BOOLEAN,
  reflections TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Enable Row Level Security
ALTER TABLE public.support_plan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_effectiveness ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support_plan_logs
CREATE POLICY "Users can view their own support plan logs" 
ON public.support_plan_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support plan logs" 
ON public.support_plan_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support plan logs" 
ON public.support_plan_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own support plan logs" 
ON public.support_plan_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for saved_practices
CREATE POLICY "Users can view their own saved practices" 
ON public.saved_practices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved practices" 
ON public.saved_practices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved practices" 
ON public.saved_practices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved practices" 
ON public.saved_practices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for wellness_effectiveness
CREATE POLICY "Users can view their own wellness effectiveness" 
ON public.wellness_effectiveness 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wellness effectiveness" 
ON public.wellness_effectiveness 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness effectiveness" 
ON public.wellness_effectiveness 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wellness effectiveness" 
ON public.wellness_effectiveness 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_support_plan_logs_user_date ON public.support_plan_logs(user_id, entry_date);
CREATE INDEX idx_saved_practices_user ON public.saved_practices(user_id);
CREATE INDEX idx_wellness_effectiveness_user_date ON public.wellness_effectiveness(user_id, entry_date);

-- Create trigger for updating timestamps
CREATE TRIGGER update_support_plan_logs_updated_at
BEFORE UPDATE ON public.support_plan_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_practices_updated_at
BEFORE UPDATE ON public.saved_practices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wellness_effectiveness_updated_at
BEFORE UPDATE ON public.wellness_effectiveness
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();