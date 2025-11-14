-- Drop existing policies to recreate them with stricter rules
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_wellness_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_wellness_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_wellness_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_wellness_profiles;

-- Create stricter policies for profiles table
-- Require authentication for ALL operations
CREATE POLICY "Authenticated users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Create stricter policies for user_wellness_profiles table
CREATE POLICY "Authenticated users can view own wellness profile"
ON public.user_wellness_profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Admins can view all wellness profiles"
ON public.user_wellness_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can insert own wellness profile"
ON public.user_wellness_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own wellness profile"
ON public.user_wellness_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Ensure user_id columns are NOT NULL to prevent security bypasses
ALTER TABLE public.profiles 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.user_wellness_profiles 
  ALTER COLUMN user_id SET NOT NULL;

-- Add constraints to ensure user_id matches a real user
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
  ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE public.user_wellness_profiles
  DROP CONSTRAINT IF EXISTS user_wellness_profiles_user_id_fkey,
  ADD CONSTRAINT user_wellness_profiles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;