-- First, disable trigger if it exists so we can manual seed smoothly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Delete any existing data first to prevent conflict errors
DELETE FROM public.users CASCADE;
DELETE FROM auth.users CASCADE;

-- Re-insert authentic GoTrue structures
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false),
  ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'waiter@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false),
  ('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'kitchen@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false),
  ('44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'counter@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false);

-- Insert Identity records required by Supabase Auth v2
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', format('{"sub": "11111111-1111-1111-1111-111111111111", "email": "%s"}', 'admin@quickserve.com')::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', format('{"sub": "22222222-2222-2222-2222-222222222222", "email": "%s"}', 'waiter@quickserve.com')::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', format('{"sub": "33333333-3333-3333-3333-333333333333", "email": "%s"}', 'kitchen@quickserve.com')::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', format('{"sub": "44444444-4444-4444-4444-444444444444", "email": "%s"}', 'counter@quickserve.com')::jsonb, 'email', now(), now(), now());

-- Insert their specific profiles & roles natively in our table
INSERT INTO public.users (id, name, email, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@quickserve.com', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'John Waiter', 'waiter@quickserve.com', 'waiter'),
  ('33333333-3333-3333-3333-333333333333', 'Chef Ramsay', 'kitchen@quickserve.com', 'kitchen'),
  ('44444444-4444-4444-4444-444444444444', 'Sally Counter', 'counter@quickserve.com', 'counter');
