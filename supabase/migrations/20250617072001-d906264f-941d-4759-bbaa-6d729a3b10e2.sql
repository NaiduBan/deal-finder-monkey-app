
-- Insert a new admin user for manual admin access
INSERT INTO public.admin_users (email, password_hash, name, role) 
VALUES (
  'newadmin@monkeyoffers.com', 
  '$2b$10$rQvz9gzGzGzGzGzGzGzGzOzGzGzGzGzGzGzGzGzGzGzGzGzGzGzGz2', 
  'New Administrator', 
  'admin'
);

-- Add function to create new admin users
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'admin'
)
RETURNS TABLE(
  admin_id UUID,
  admin_name TEXT,
  admin_email TEXT,
  admin_role TEXT,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add function to list all admin users
CREATE OR REPLACE FUNCTION public.get_all_admin_users()
RETURNS TABLE(
  admin_id UUID,
  admin_name TEXT,
  admin_email TEXT,
  admin_role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.name, au.email, au.role, au.is_active, au.created_at
  FROM public.admin_users au
  ORDER BY au.created_at DESC;
END;
$$;
