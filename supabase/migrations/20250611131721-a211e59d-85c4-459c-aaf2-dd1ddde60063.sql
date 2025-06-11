
-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default admin user (password: AdminMonkey123!)
INSERT INTO public.admin_users (email, password_hash, name, role) 
VALUES (
  'admin@monkeyoffers.com', 
  '$2b$10$rQvz9gzGzGzGzGzGzGzGzOzGzGzGzGzGzGzGzGzGzGzGzGzGzGzGz2', 
  'System Administrator', 
  'super_admin'
);

-- Enable RLS for admin users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users (only accessible via backend functions)
CREATE POLICY "Admin users access policy" ON public.admin_users
  FOR ALL USING (false);

-- Create admin sessions table
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for admin sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin sessions
CREATE POLICY "Admin sessions access policy" ON public.admin_sessions
  FOR ALL USING (false);

-- Create function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(
  admin_id UUID,
  admin_name TEXT,
  admin_email TEXT,
  admin_role TEXT,
  session_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_admin_name TEXT;
  v_admin_email TEXT;
  v_admin_role TEXT;
  v_session_token TEXT;
BEGIN
  -- For demo purposes, we'll use simple password comparison
  -- In production, you'd want proper password hashing
  SELECT id, name, email, role INTO v_admin_id, v_admin_name, v_admin_email, v_admin_role
  FROM public.admin_users
  WHERE email = p_email 
    AND is_active = true
    AND (p_password = 'AdminMonkey123!' AND email = 'admin@monkeyoffers.com');

  IF v_admin_id IS NULL THEN
    RETURN;
  END IF;

  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');

  -- Insert session
  INSERT INTO public.admin_sessions (admin_id, token, expires_at)
  VALUES (v_admin_id, v_session_token, now() + interval '24 hours');

  -- Return admin info and token
  RETURN QUERY SELECT v_admin_id, v_admin_name, v_admin_email, v_admin_role, v_session_token;
END;
$$;

-- Create function to verify admin session
CREATE OR REPLACE FUNCTION public.verify_admin_session(p_token TEXT)
RETURNS TABLE(
  admin_id UUID,
  admin_name TEXT,
  admin_email TEXT,
  admin_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.name, au.email, au.role
  FROM public.admin_sessions ads
  JOIN public.admin_users au ON au.id = ads.admin_id
  WHERE ads.token = p_token
    AND ads.expires_at > now()
    AND au.is_active = true;
END;
$$;

-- Create function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_offers', (SELECT COUNT(*) FROM "Offers_data"),
    'total_cuelink_offers', (SELECT COUNT(*) FROM "Cuelink_data"),
    'total_categories', (SELECT COUNT(*) FROM categories),
    'total_saved_offers', (SELECT COUNT(*) FROM saved_offers),
    'active_users_today', (SELECT COUNT(DISTINCT user_id) FROM saved_offers WHERE created_at::date = CURRENT_DATE)
  ) INTO result;
  
  RETURN result;
END;
$$;
