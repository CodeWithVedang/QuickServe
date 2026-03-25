-- Add 'paid' to order_status enum
-- Note: PostgreSQL does not support simple ALTER TYPE ADD VALUE in a transaction with other commands easily in some versions, 
-- but Supabase supports it.

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';
