-- Create storage bucket for wellness videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wellness-videos',
  'wellness-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for wellness videos bucket
CREATE POLICY "Anyone can view wellness videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'wellness-videos');

CREATE POLICY "Admins can upload wellness videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wellness-videos' 
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can update wellness videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wellness-videos' 
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can delete wellness videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wellness-videos' 
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);