// =============================================================================
// stripe-portal — lets a member manage or cancel their subscription.
//
// Returns a Stripe Billing Portal URL for the signed-in user's customer record.
// Wire this to a "Manage membership" link once someone is subscribed.
//
// Deploy:  supabase functions deploy stripe-portal
// (config.toml: verify_jwt = true)
// =============================================================================

import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ALLOWED_ORIGIN    = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const APP_URL           = Deno.env.get("APP_URL") ?? "https://mihlab-phil.github.io/experience-machine.html";

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

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Sign in first." }, 401);
  const sb = admin();
  const { data: { user } } = await sb.auth.getUser(jwt);
  if (!user) return json({ error: "Sign in first." }, 401);

  const { data: sub } = await sb.from("subscribers")
    .select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.stripe_customer_id) return json({ error: "No billing record yet." }, 400);

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: APP_URL,
    });
    return json({ url: portal.url });
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 502);
  }
});
