-- Create a table for storing pose images for each wellness content item
CREATE TABLE public.content_pose_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.wellness_content(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  pose_name TEXT,
  cue_text TEXT,
  modification_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_pose_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view pose images" 
ON public.content_pose_images 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage pose images" 
ON public.content_pose_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_content_pose_images_content_id ON public.content_pose_images(content_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_pose_images_updated_at
BEFORE UPDATE ON public.content_pose_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for pose images
INSERT INTO storage.buckets (id, name, public) VALUES ('pose-images', 'pose-images', true);

-- Storage policies for pose images bucket
CREATE POLICY "Pose images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pose-images');

CREATE POLICY "Admins can upload pose images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pose-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pose images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'pose-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pose images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pose-images' AND has_role(auth.uid(), 'admin'::app_role));