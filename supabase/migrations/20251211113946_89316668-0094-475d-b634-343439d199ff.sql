-- Create table for quick check-in tracking
CREATE TABLE public.quick_checkin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feeling_id TEXT NOT NULL,
  feeling_label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for favorite feelings
CREATE TABLE public.user_favorite_feelings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feeling_id TEXT NOT NULL,
  feeling_label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feeling_id)
);

-- Enable RLS
ALTER TABLE public.quick_checkin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_feelings ENABLE ROW LEVEL SECURITY;

-- RLS policies for quick_checkin_logs
CREATE POLICY "Users can insert their own check-in logs"
ON public.quick_checkin_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own check-in logs"
ON public.quick_checkin_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-in logs"
ON public.quick_checkin_logs FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for user_favorite_feelings
CREATE POLICY "Users can insert their own favorites"
ON public.user_favorite_feelings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorites"
ON public.user_favorite_feelings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.user_favorite_feelings FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_quick_checkin_logs_user_date ON public.quick_checkin_logs(user_id, created_at DESC);
CREATE INDEX idx_user_favorite_feelings_user ON public.user_favorite_feelings(user_id);