-- Add new admin user
INSERT INTO public.admin_users (email, password_hash, name, role) 
VALUES (
  'naiduban006@gmail.com', 
  'AdminMonkey123!', 
  'Naidu Ban', 
  'super_admin'
);