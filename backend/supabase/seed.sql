-- Initial seed data
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'waiter@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kitchen@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'counter@quickserve.com', crypt('password123', gen_salt('bf')), now(), now(), now());

INSERT INTO public.users (id, name, email, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@quickserve.com', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'John Waiter', 'waiter@quickserve.com', 'waiter'),
  ('33333333-3333-3333-3333-333333333333', 'Chef Ramsay', 'kitchen@quickserve.com', 'kitchen'),
  ('44444444-4444-4444-4444-444444444444', 'Sally Counter', 'counter@quickserve.com', 'counter');

INSERT INTO public.menu_items (name, price, category, image_url)
VALUES
  ('Margherita Pizza', 12.99, 'Main Course', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80'),
  ('Pepperoni Pizza', 14.99, 'Main Course', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80'),
  ('Caesar Salad', 8.99, 'Appetizer', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80'),
  ('Garlic Bread', 4.99, 'Appetizer', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80'),
  ('Coca Cola', 2.99, 'Beverage', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80'),
  ('Tiramisu', 6.99, 'Dessert', 'https://images.unsplash.com/photo-1571115177098-24c42d5e056a?w=500&q=80');
