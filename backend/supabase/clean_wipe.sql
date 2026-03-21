-- THE ULTIMATE RESET SCRIPT
-- Run this in your Supabase SQL Editor to completely wipe any corruption

-- 1. Drop the Postgres Trigger that might be crashing your database behind the scenes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Cleanly delete any orphaned internal identity tokens in Supabase
DELETE FROM auth.identities 
WHERE provider = 'email' 
AND identity_data->>'email' IN ('admin@quickserve.com', 'waiter@quickserve.com', 'kitchen@quickserve.com', 'counter@quickserve.com');

-- 3. Ensure the base Users are definitively purged
DELETE FROM auth.users 
WHERE email IN ('admin@quickserve.com', 'waiter@quickserve.com', 'kitchen@quickserve.com', 'counter@quickserve.com');

-- 4. Purge our public.users safely via CASCADE to destroy any foreign key locks
DELETE FROM public.users CASCADE;
