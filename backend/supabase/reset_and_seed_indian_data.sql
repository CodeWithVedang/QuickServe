-- Completely wipe any existing orders from the system test runs
DELETE FROM public.orders CASCADE;
DELETE FROM public.payments CASCADE;
DELETE FROM public.order_items CASCADE;

-- Clear testing menu items
DELETE FROM public.menu_items;

-- Insert Premium Indian Restaurant Menu Items
INSERT INTO public.menu_items (name, price, category, image_url)
VALUES
  -- Starters
  ('Paneer Tikka', 250.00, 'Starters', 'https://images.unsplash.com/photo-1599487405270-45052009aa22?w=500&q=80'),
  ('Samosa Chaat', 120.00, 'Starters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80'),
  ('Chicken 65', 320.00, 'Starters', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&q=80'),
  
  -- Main Course
  ('Butter Chicken', 450.00, 'Main Course', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&q=80'),
  ('Dal Makhani', 280.00, 'Main Course', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80'),
  ('Mutton Biryani', 550.00, 'Main Course', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80'),
  ('Palak Paneer', 350.00, 'Main Course', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=80'),
  
  -- Breads
  ('Garlic Naan', 75.00, 'Breads', 'https://images.unsplash.com/photo-1606214306041-3b7c936b13ed?w=500&q=80'),
  ('Tandoori Roti', 30.00, 'Breads', 'https://images.unsplash.com/photo-1565557613262-b9b5f543dcda?w=500&q=80'),
  
  -- Beverages
  ('Masala Chai', 50.00, 'Beverages', 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=500&q=80'),
  ('Sweet Lassi', 110.00, 'Beverages', 'https://images.unsplash.com/photo-1626082929543-5b801456d61f?w=500&q=80'),
  
  -- Desserts
  ('Gulab Jamun', 150.00, 'Desserts', 'https://images.unsplash.com/photo-1593179515024-118820c85c07?w=500&q=80'),
  ('Rasmalai', 180.00, 'Desserts', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&q=80');
