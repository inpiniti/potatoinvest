-- Brokerage accounts table (idempotent setup)
create table if not exists public.brokerage_accounts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_no text not null,
  api_key text not null,
  secret_key_hash text not null,
  alias text null,
  created_at timestamptz default now(),
  unique(user_id, account_no)
);

alter table public.brokerage_accounts enable row level security;

-- Optional helpful indexes
create index if not exists idx_brokerage_accounts_user on public.brokerage_accounts(user_id);

-- Drop existing policies if present (CREATE POLICY does NOT support IF NOT EXISTS)
drop policy if exists brokerage_accounts_select on public.brokerage_accounts;
drop policy if exists brokerage_accounts_insert on public.brokerage_accounts;
drop policy if exists brokerage_accounts_update on public.brokerage_accounts;
drop policy if exists brokerage_accounts_delete on public.brokerage_accounts;

-- Recreate policies
create policy brokerage_accounts_select on public.brokerage_accounts
  for select using (auth.uid() = user_id);

create policy brokerage_accounts_insert on public.brokerage_accounts
  for insert with check (auth.uid() = user_id);

create policy brokerage_accounts_update on public.brokerage_accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy brokerage_accounts_delete on public.brokerage_accounts
  for delete using (auth.uid() = user_id);
