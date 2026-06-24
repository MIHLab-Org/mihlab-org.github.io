-- =============================================================================
-- Add Stripe subscription id to subscribers, so the webhook can correlate
-- subscription.updated / subscription.deleted events back to a user even when
-- they arrive without checkout-session metadata.
-- =============================================================================
alter table public.subscribers
  add column if not exists stripe_subscription_id text;

create index if not exists subscribers_stripe_customer_idx
  on public.subscribers (stripe_customer_id);
create index if not exists subscribers_stripe_subscription_idx
  on public.subscribers (stripe_subscription_id);
