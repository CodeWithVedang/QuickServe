-- 1. DELETE existing broken seeded users
DELETE FROM public.users CASCADE;
DELETE FROM auth.users WHERE email IN ('admin@quickserve.com', 'waiter@quickserve.com', 'kitchen@quickserve.com', 'counter@quickserve.com');
DELETE FROM public.menu_items;

-- 2. RE-INSERT valid GoTrue user structures
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false),
  ('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'waiter@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false),
  ('33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'kitchen@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false),
  ('44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'counter@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', false);

-- 3. INSERT their requisite identities to satisfy the GoTrue engine
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', format('{"sub": "11111111-1111-1111-1111-111111111111", "email": "%s"}', 'admin@quickserve.com')::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', format('{"sub": "22222222-2222-2222-2222-222222222222", "email": "%s"}', 'waiter@quickserve.com')::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', format('{"sub": "33333333-3333-3333-3333-333333333333", "email": "%s"}', 'kitchen@quickserve.com')::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', format('{"sub": "44444444-4444-4444-4444-444444444444", "email": "%s"}', 'counter@quickserve.com')::jsonb, 'email', now(), now(), now());

-- 4. INSERT the public profiles utilizing the RBAC ENUMs cleanly
INSERT INTO public.users (id, name, email, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@quickserve.com', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'John Waiter', 'waiter@quickserve.com', 'waiter'),
  ('33333333-3333-3333-3333-333333333333', 'Chef Ramsay', 'kitchen@quickserve.com', 'kitchen'),
  ('44444444-4444-4444-4444-444444444444', 'Sally Counter', 'counter@quickserve.com', 'counter');

-- 5. SEED Menu Items
INSERT INTO public.menu_items (name, price, category, image_url)
VALUES
  ('Margherita Pizza', 12.99, 'Main Course', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80'),
  ('Pepperoni Pizza', 14.99, 'Main Course', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80'),
  ('Caesar Salad', 8.99, 'Appetizer', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80'),
  ('Garlic Bread', 4.99, 'Appetizer', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80'),
  ('Coca Cola', 2.99, 'Beverage', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80'),
  ('Tiramisu', 6.99, 'Dessert', 'https://images.unsplash.com/photo-1571115177098-24c42d5e056a?w=500&q=80');
