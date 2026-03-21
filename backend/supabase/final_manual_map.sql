-- ONLY RUN THIS AFTER CREATING THE USERS VIA SUPABASE DASHBOARD 'ADD USER' BUTTON
INSERT INTO public.users (id, name, email, role)
SELECT id, 'Admin', email, 'admin'::user_role FROM auth.users WHERE email = 'admin@quickserve.com' ON CONFLICT DO NOTHING;

INSERT INTO public.users (id, name, email, role)
SELECT id, 'Waiter', email, 'waiter'::user_role FROM auth.users WHERE email = 'waiter@quickserve.com' ON CONFLICT DO NOTHING;

INSERT INTO public.users (id, name, email, role)
SELECT id, 'Kitchen', email, 'kitchen'::user_role FROM auth.users WHERE email = 'kitchen@quickserve.com' ON CONFLICT DO NOTHING;

INSERT INTO public.users (id, name, email, role)
SELECT id, 'Counter', email, 'counter'::user_role FROM auth.users WHERE email = 'counter@quickserve.com' ON CONFLICT DO NOTHING;

-- Seed Menus if they are missing
INSERT INTO public.menu_items (name, price, category)
VALUES
  ('Margherita Pizza', 12.99, 'Main Course'),
  ('Pepperoni Pizza', 14.99, 'Main Course'),
  ('Caesar Salad', 8.99, 'Appetizer'),
  ('Garlic Bread', 4.99, 'Appetizer')
ON CONFLICT DO NOTHING;
