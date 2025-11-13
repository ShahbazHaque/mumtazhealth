-- Create user wellness profiles table
CREATE TABLE public.user_wellness_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Dosha assessment
  primary_dosha TEXT,
  secondary_dosha TEXT,
  dosha_assessment_date TIMESTAMPTZ DEFAULT now(),
  
  -- Spiritual preferences
  spiritual_preference TEXT DEFAULT 'both',
  
  -- Pregnancy tracking
  pregnancy_status TEXT DEFAULT 'not_pregnant',
  due_date DATE,
  current_trimester INTEGER,
  conception_date DATE,
  
  -- Other preferences
  preferred_yoga_style TEXT,
  dietary_restrictions JSONB DEFAULT '[]'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_wellness_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_wellness_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_wellness_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_wellness_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_wellness_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_wellness_profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create wellness content library table
CREATE TABLE public.wellness_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content identification
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  detailed_guidance TEXT,
  
  -- Categorization
  cycle_phases TEXT[] DEFAULT '{}',
  pregnancy_trimesters INTEGER[] DEFAULT '{}',
  pregnancy_statuses TEXT[] DEFAULT '{}',
  doshas TEXT[] DEFAULT '{}',
  spiritual_path TEXT,
  
  -- Benefits & tags
  benefits TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT,
  duration_minutes INTEGER,
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wellness_content (public read)
CREATE POLICY "Anyone can view active content"
  ON public.wellness_content
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage content"
  ON public.wellness_content
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user saved content table
CREATE TABLE public.user_saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.wellness_content(id) ON DELETE CASCADE NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE public.user_saved_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_saved_content
CREATE POLICY "Users can view their own saved content"
  ON public.user_saved_content
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save content"
  ON public.user_saved_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved content"
  ON public.user_saved_content
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their saved content"
  ON public.user_saved_content
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create daily recommendations log table
CREATE TABLE public.daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_date DATE NOT NULL,
  content_ids UUID[] NOT NULL,
  cycle_phase TEXT,
  pregnancy_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recommendation_date)
);

-- Enable RLS
ALTER TABLE public.daily_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.daily_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
  ON public.daily_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all recommendations"
  ON public.daily_recommendations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on user_wellness_profiles
CREATE OR REPLACE FUNCTION public.update_wellness_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_wellness_profiles_updated_at
  BEFORE UPDATE ON public.user_wellness_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wellness_profile_updated_at();