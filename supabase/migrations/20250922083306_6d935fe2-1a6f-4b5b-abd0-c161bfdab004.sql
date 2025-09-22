-- Enable RLS on remaining tables that need it
ALTER TABLE public.daily_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fix the CreateAdminUser function that doesn't have search_path set
CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_name text, p_role text DEFAULT 'admin'::text)
RETURNS TABLE(admin_id uuid, admin_name text, admin_email text, admin_role text, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- For demo purposes, using simple password storage
  -- In production, you'd want proper password hashing
  INSERT INTO public.admin_users (email, password_hash, name, role)
  VALUES (p_email, p_password, p_name, p_role)
  RETURNING id INTO v_admin_id;

  -- Return admin info
  RETURN QUERY SELECT v_admin_id, p_name, p_email, p_role, true;
EXCEPTION
  WHEN unique_violation THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, false;
END;
$$;