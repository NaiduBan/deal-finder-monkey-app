
-- Create a table for banners
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Policy for public users to view active banners
CREATE POLICY "Public can view active banners"
ON public.banners
FOR SELECT
USING (is_active = true);

-- Policy for admins to manage banners
CREATE POLICY "Admins can manage banners"
ON public.banners
FOR ALL
USING (true); -- For now, this is open. We can restrict it to admins later.

