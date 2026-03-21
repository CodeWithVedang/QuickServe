-- 1. FIX THE REVOKE ORDER BUG BY ADDING DELETE POLICIES
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON public.orders;
CREATE POLICY "Authenticated users can delete orders" ON public.orders FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete order_items" ON public.order_items;
CREATE POLICY "Authenticated users can delete order_items" ON public.order_items FOR DELETE USING (auth.role() = 'authenticated');

-- 2. ADD NEW DEEP CATEGORIZATION COLUMNS TO MENU_ITEMS
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS meal_time TEXT DEFAULT 'Lunch';
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS food_type TEXT DEFAULT 'North Indian';

-- 3. WIPE ALL OLD MESSY TEST DATA
DELETE FROM public.payments;
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.menu_items;

-- 4. INSERT HIGHLY ORGANIZED, PREMIUM RESTAURANT DATA
INSERT INTO public.menu_items (name, price, category, meal_time, food_type, image_url) VALUES
-- BREAKFAST
('Idli Sambar', 60.00, 'Breakfast', 'Breakfast', 'South Indian', 'https://images.unsplash.com/photo-1589301760014-d929f39ce9ec?auto=format&fit=crop&w=800&q=80'),
('Masala Dosa', 90.00, 'Breakfast', 'Breakfast', 'South Indian', 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80'),
('Aloo Paratha', 70.00, 'Breakfast', 'Breakfast', 'Punjabi', 'https://images.unsplash.com/photo-1626779875150-f808722a5fb0?auto=format&fit=crop&w=800&q=80'),
('Chole Bhature', 110.00, 'Breakfast', 'Breakfast', 'Punjabi', 'https://images.unsplash.com/photo-1626779875150-f808722a5fb1?auto=format&fit=crop&w=800&q=80'),

-- LUNCH / MAIN COURSES
('Butter Chicken', 350.00, 'Main Course', 'Lunch', 'Punjabi', 'https://images.unsplash.com/photo-1603894584373-b3c9886ed02c?auto=format&fit=crop&w=800&q=80'),
('Paneer Tikka Masala', 280.00, 'Main Course', 'Lunch', 'Punjabi', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80'),
('Dal Makhani', 220.00, 'Main Course', 'Lunch', 'Punjabi', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'),
('Mutton Biryani', 450.00, 'Main Course', 'Lunch', 'Mughlai', 'https://images.unsplash.com/photo-1563379091339-03b2184f4f43?auto=format&fit=crop&w=800&q=80'),
('Veg Hakka Noodles', 180.00, 'Main Course', 'Lunch', 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80'),
('Chicken Fried Rice', 210.00, 'Main Course', 'Lunch', 'Chinese', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'),
('Veg Manchurian', 190.00, 'Main Course', 'Lunch', 'Chinese', 'https://images.unsplash.com/photo-1540114948842-1598f1f72591?auto=format&fit=crop&w=800&q=80'),

-- DINNER (Adding breads)
('Garlic Naan', 60.00, 'Breads', 'Dinner', 'North Indian', 'https://images.unsplash.com/photo-1605333333333-e1d5d2973710?auto=format&fit=crop&w=800&q=80'),
('Butter Roti', 25.00, 'Breads', 'Dinner', 'North Indian', 'https://images.unsplash.com/photo-1605333333334-e1d5d2973710?auto=format&fit=crop&w=800&q=80'),

-- SNACKS / STARTERS
('Chicken Tikka', 250.00, 'Starters', 'Snacks', 'Punjabi', 'https://images.unsplash.com/photo-1599487405270-45814cc5a153?auto=format&fit=crop&w=800&q=80'),
('Samosa (2 pcs)', 40.00, 'Starters', 'Snacks', 'North Indian', 'https://images.unsplash.com/photo-1605333333335-e1d5d2973710?auto=format&fit=crop&w=800&q=80'),
('Spring Rolls', 150.00, 'Starters', 'Snacks', 'Chinese', 'https://images.unsplash.com/photo-1582885934674-ff4f7ff168ce?auto=format&fit=crop&w=800&q=80'),

-- BEVERAGES
('Sweet Lassi', 80.00, 'Beverages', 'Breakfast', 'Punjabi', 'https://images.unsplash.com/photo-1605333333336-e1d5d2973710?auto=format&fit=crop&w=800&q=80'),
('Masala Chai', 30.00, 'Beverages', 'Breakfast', 'Indian', 'https://images.unsplash.com/photo-1576092762791-dd9e2220cad1?auto=format&fit=crop&w=800&q=80'),
('Cold Coffee', 120.00, 'Beverages', 'Snacks', 'Continental', 'https://images.unsplash.com/photo-1461023058943-07fcbe168735?auto=format&fit=crop&w=800&q=80');
