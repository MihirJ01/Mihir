
-- Disable Row Level Security on fee_payments table to allow payments without authentication
ALTER TABLE public.fee_payments DISABLE ROW LEVEL SECURITY;
