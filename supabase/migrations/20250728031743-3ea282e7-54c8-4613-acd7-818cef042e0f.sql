-- Create admin user using Supabase auth functions
SELECT auth.create_user(
  '{"email": "admin@mavericks.com", "password": "admin123", "email_confirm": true, "user_metadata": {"role": "admin", "full_name": "Administrator"}}'::jsonb
);