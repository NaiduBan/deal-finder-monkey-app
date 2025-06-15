
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('offer', 'expiry', 'system', 'preference')),
  offer_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own notifications and system-wide notifications
CREATE POLICY "Allow users to view their own and system notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update the 'read' status of their own notifications
CREATE POLICY "Allow users to mark their own notifications as read"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add a comment to the table and columns for clarity
COMMENT ON TABLE public.notifications IS 'Stores user notifications for various events.';
COMMENT ON COLUMN public.notifications.user_id IS 'The user this notification is for. NULL for system-wide notifications.';
