
-- Create a table to log notifications sent for preference matches
CREATE TABLE public.preference_notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT preference_notification_log_user_id_offer_id_key UNIQUE (user_id, offer_id)
);

-- Enable Row Level Security for the new table
ALTER TABLE public.preference_notification_log ENABLE ROW LEVEL SECURITY;

-- Note: No specific RLS policies are needed. By enabling RLS without policies,
-- we ensure that this table can only be accessed by backend services using the
-- service_role key, which is exactly what we need for our new edge function.

