// =============================================================================
// stripe-webhook — the ONLY thing that writes a paid tier onto a user.
//
// Stripe calls this (not the browser), so it authenticates with a Stripe
// signature instead of a Supabase JWT. config.toml MUST set verify_jwt = false
// for this function, or Supabase will reject Stripe's unsigned-by-Supabase call
// before your code runs.
//
// It maps the Stripe price back to a tier and writes public.subscribers via the
// service role. Events handled:
//   checkout.session.completed     — first payment: set tier, customer, sub id
//   customer.subscription.updated  — upgrade/downgrade/renew/past_due
//   customer.subscription.deleted  — cancel: fall back to 'free'
//
// Deploy:  supabase functions deploy stripe-webhook --no-verify-jwt
// =============================================================================

import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY    = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// price id → tier (inverse of the checkout map)
const PRICE_TO_TIER: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_BASE")    ?? "_b"]: "base",
  [Deno.env.get("STRIPE_PRICE_PLUS")    ?? "_p"]: "plus",
  [Deno.env.get("STRIPE_PRICE_PREMIUM") ?? "_x"]: "premium",
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function admin() { return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } }); }

// Pull the active tier from a subscription's first line item.
function tierFromSubscription(subscription: Stripe.Subscription): string | null {
  const priceId = subscription.items?.data?.[0]?.price?.id ?? "";
  return PRICE_TO_TIER[priceId] ?? null;
}

// Write a user's tier. active=false only when a paid sub lapses; 'free' is active.
async function setTier(opts: {
  userId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  tier: string;
  active: boolean;
}) {
  const sb = admin();
  let userId = opts.userId ?? null;

  // If we don't know the user but know the customer, look them up.
  if (!userId && opts.customerId) {
    const { data } = await sb.from("subscribers")
      .select("user_id").eq("stripe_customer_id", opts.customerId).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId) { console.error("webhook: could not resolve user", opts); return; }

  await sb.from("subscribers").upsert({
    user_id: userId,
    tier: opts.tier,
    active: opts.active,
    ...(opts.customerId     ? { stripe_customer_id: opts.customerId } : {}),
    ...(opts.subscriptionId ? { stripe_subscription_id: opts.subscriptionId } : {}),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const sig = req.headers.get("stripe-signature");
  if (!sig || !STRIPE_WEBHOOK_SECRET) return new Response("missing signature", { status: 400 });

  const body = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET, undefined, cryptoProvider);
  } catch (err) {
    return new Response(`bad signature: ${String((err as Error)?.message ?? err)}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = (s.client_reference_id ?? s.metadata?.user_id) || null;
        const customerId = (typeof s.customer === "string" ? s.customer : s.customer?.id) ?? null;
        const subId = (typeof s.subscription === "string" ? s.subscription : s.subscription?.id) ?? null;

        // metadata.tier is fastest; otherwise resolve from the live subscription.
        let tier = s.metadata?.tier ?? null;
        if (!tier && subId) {
          const subscription = await stripe.subscriptions.retrieve(subId);
          tier = tierFromSubscription(subscription);
        }
        if (tier) await setTier({ userId, customerId, subscriptionId: subId, tier, active: true });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const tier = tierFromSubscription(subscription) ?? "free";
        const active = subscription.status === "active" || subscription.status === "trialing";
        await setTier({
          userId: subscription.metadata?.user_id ?? null,
          customerId: (typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id) ?? null,
          subscriptionId: subscription.id,
          tier: active ? tier : "free",
          active: true, // 'free' is still an active row; we just removed the paid budget
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await setTier({
          userId: subscription.metadata?.user_id ?? null,
          customerId: (typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id) ?? null,
          subscriptionId: subscription.id,
          tier: "free",
          active: true,
        });
        break;
      }
    }
  } catch (err) {
    console.error("webhook handler error", err);
    return new Response("handler error", { status: 500 }); // Stripe will retry
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
