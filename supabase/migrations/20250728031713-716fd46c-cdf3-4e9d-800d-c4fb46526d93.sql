-- Create admin user with email and password
-- Note: This creates the user directly in auth.users with admin role

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@mavericks.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "full_name": "Administrator"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create profile for the admin user
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  role
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@mavericks.com'),
  'admin@mavericks.com',
  'Administrator',
  'admin'
);