-- Fix PUBLIC_DATA_EXPOSURE: Replace the permissive wellness_content policy with tier-aware access

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active content" ON public.wellness_content;

-- Create a new tier-aware policy that:
-- 1. Allows everyone to see free tier content
-- 2. Requires authentication and subscription tier check for premium content
CREATE POLICY "Users can view content based on tier" 
ON public.wellness_content 
FOR SELECT
USING (
  is_active = true 
  AND (
    -- Free content is accessible to everyone (including unauthenticated users)
    tier_requirement = 'free'
    OR tier_requirement IS NULL
    OR (
      -- Standard and premium content requires authentication and appropriate subscription
      auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.user_wellness_profiles
        WHERE user_id = auth.uid()
        AND (
          (tier_requirement = 'standard' AND subscription_tier IN ('standard', 'premium'))
          OR (tier_requirement = 'premium' AND subscription_tier = 'premium')
        )
      )
    )
  )
);

-- Fix STORAGE_EXPOSURE: Make premium content buckets private
-- Note: wellness-videos bucket should be private to protect premium content
UPDATE storage.buckets SET public = false WHERE id = 'wellness-videos';

-- Note: pose-images can stay public as they are instructional content
-- If you want to make pose-images private too, uncomment the line below:
-- UPDATE storage.buckets SET public = false WHERE id = 'pose-images';

-- Create storage policies for authenticated access to private buckets
-- Policy for wellness-videos: Only authenticated users can view
CREATE POLICY "Authenticated users can view wellness videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'wellness-videos' 
  AND auth.uid() IS NOT NULL
);

-- Policy for admins to manage wellness videos
CREATE POLICY "Admins can manage wellness videos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'wellness-videos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);