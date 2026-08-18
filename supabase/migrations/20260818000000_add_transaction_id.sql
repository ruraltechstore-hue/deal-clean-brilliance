-- Add transaction_id to orders
alter table public.orders
add column transaction_id text;

-- Create an index on transaction_id for faster lookups
create index if not exists orders_transaction_id_idx on public.orders (transaction_id);
