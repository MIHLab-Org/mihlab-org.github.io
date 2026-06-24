// =============================================================================
// stripe-checkout — opens a Stripe Checkout session for a signed-in visitor.
//
// The game calls this when someone picks a plan at the door. It identifies the
// user from their Supabase JWT, finds (or lets Checkout create) their Stripe
// customer, and returns a hosted Checkout URL the browser redirects to. The
// actual tier flip happens later, in stripe-webhook, once payment succeeds.
//
// Tiers → price IDs come from secrets so nothing is hardcoded:
//   STRIPE_PRICE_BASE     ($5  / month)
//   STRIPE_PRICE_PLUS     ($10 / month)
//   STRIPE_PRICE_PREMIUM  ($20 / month)
//
// Deploy:  supabase functions deploy stripe-checkout
// (config.toml sets verify_jwt = true — a valid Supabase session is required.)
// =============================================================================

import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGIN    = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
// Where Stripe sends the visitor back to — your game page.
const APP_URL           = Deno.env.get("APP_URL") ?? "https://mihlab-phil.github.io/experience-machine.html";

const TIER_TO_PRICE: Record<string, string> = {
  base:    Deno.env.get("STRIPE_PRICE_BASE")    ?? "",
  plus:    Deno.env.get("STRIPE_PRICE_PLUS")    ?? "",
  premium: Deno.env.get("STRIPE_PRICE_PREMIUM") ?? "",
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  httpClient: Stripe.createFetchHttpClient(),
});

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
function admin() { return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } }); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")    return json({ error: "POST only" }, 405);
  if (!STRIPE_SECRET_KEY)       return json({ error: "Stripe not configured." }, 500);

  let payload: { tier?: string };
  try { payload = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const tier = payload.tier ?? "";
  const priceId = TIER_TO_PRICE[tier];
  if (!priceId) return json({ error: "unknown or unconfigured plan" }, 400);

  // ---- identify the caller from their Supabase JWT ----
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Sign in before subscribing." }, 401);
  const sb = admin();
  const { data: { user } } = await sb.auth.getUser(jwt);
  if (!user) return json({ error: "Sign in before subscribing." }, 401);

  // ---- reuse an existing Stripe customer if we have one ----
  let customerId: string | undefined;
  const { data: sub } = await sb.from("subscribers")
    .select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (sub?.stripe_customer_id) customerId = sub.stripe_customer_id;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // identify the user on the way back in (webhook reads these)
      client_reference_id: user.id,
      ...(customerId ? { customer: customerId } : { customer_email: user.email ?? undefined }),
      subscription_data: { metadata: { user_id: user.id, tier } },
      // also stamp the session itself, belt-and-suspenders for the webhook
      metadata: { user_id: user.id, tier },
      allow_promotion_codes: true,
      success_url: `${APP_URL}?subscribed=1`,
      cancel_url:  `${APP_URL}?subscribe=cancel`,
    });
    return json({ url: session.url });
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 502);
  }
});
