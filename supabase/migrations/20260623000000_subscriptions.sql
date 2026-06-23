-- =============================================================================
-- Subscriptions & usage metering for the Experience Machine
-- Tiers:  free | base ($5) | plus ($10) | premium ($20)
-- Half of each paid tier is a token budget; the function meters spend against it.
-- =============================================================================

-- One row per user. `tier` is set by the Stripe webhook; everyone starts 'free'.
create table if not exists public.subscribers (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  tier               text not null default 'free' check (tier in ('free','base','plus','premium')),
  active             boolean not null default true,
  stripe_customer_id text,
  updated_at         timestamptz not null default now(),
  created_at         timestamptz not null default now()
);
alter table public.subscribers enable row level security;
-- a user may read their own tier (for the UI); only the service role writes it
drop policy if exists "read own subscriber" on public.subscribers;
create policy "read own subscriber" on public.subscribers
  for select using (auth.uid() = user_id);

-- Accumulated usage per user per calendar month (period = 'YYYY-MM', UTC).
create table if not exists public.usage (
  user_id     uuid not null references auth.users(id) on delete cascade,
  period      text not null,
  questions   int not null default 0,
  cost_micros bigint not null default 0,   -- token cost in millionths of a dollar
  updated_at  timestamptz not null default now(),
  primary key (user_id, period)
);
alter table public.usage enable row level security;
drop policy if exists "read own usage" on public.usage;
create policy "read own usage" on public.usage
  for select using (auth.uid() = user_id);

-- Every new account gets a free subscriber row automatically.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscribers (user_id, tier) values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
