// =============================================================================
// philosopher — Experience Machine backend (Supabase Edge Function)
//
// Logged-in users ride YOUR Anthropic key, metered by their subscription tier:
//   free    — 1 question / month
//   base    — up to $2.50 of tokens / month   ($5 tier, half to tokens)
//   plus    — up to $5.00 of tokens / month    ($10 tier)
//   premium — up to $10.00 of tokens / month   ($20 tier)
// Tiers are set on public.subscribers by the Stripe webhook; new users are 'free'.
//
// (BYOK and DEV_OPEN remain for testing — see below.)
// Deploy:  supabase functions deploy philosopher --no-verify-jwt
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildSystemPrompt, PERSONAS } from "./personas.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL   = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DEV_OPEN          = (Deno.env.get("DEV_OPEN") ?? "false") === "true";
const ALLOWED_ORIGIN    = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

// token price in MICROS (millionths of a dollar) per token — VERIFY against current
// Anthropic pricing and override via secrets if it changes.
const PRICE_IN_MICROS  = Number(Deno.env.get("PRICE_IN_MICROS")  ?? "3");   // $3 / 1M input tokens
const PRICE_OUT_MICROS = Number(Deno.env.get("PRICE_OUT_MICROS") ?? "15");  // $15 / 1M output tokens

// tier → monthly token budget in micros (half the price). free uses a question cap instead.
const TIER_BUDGET_MICROS: Record<string, number> = {
  free: 0, base: 2_500_000, plus: 5_000_000, premium: 10_000_000,
};
const FREE_QUESTIONS = Number(Deno.env.get("FREE_QUESTIONS") ?? "1");

const MAX_MESSAGES = 40, MAX_CHARS = 60_000, MAX_TOKENS = 1000;

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-byok-key, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
function period(): string { return new Date().toISOString().slice(0, 7); } // 'YYYY-MM' UTC

function admin() { return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } }); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")    return json({ error: "POST only" }, 405);

  let payload: { personaKey?: string; mode?: string; messages?: unknown };
  try { payload = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const { personaKey, mode, messages } = payload;

  if (!personaKey || !(personaKey in PERSONAS)) return json({ error: "unknown persona" }, 400);
  if (!Array.isArray(messages) || messages.length === 0) return json({ error: "no messages" }, 400);
  if (messages.length > MAX_MESSAGES) return json({ error: "too many messages" }, 400);
  const totalChars = messages.reduce((n: number, m: { content?: unknown }) =>
    n + (typeof m?.content === "string" ? m.content.length : 0), 0);
  if (totalChars > MAX_CHARS) return json({ error: "conversation too long" }, 400);

  // ---- identify the caller ----
  let userId: string | null = null, tier = "free";
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (jwt && SUPABASE_URL && SERVICE_ROLE) {
    const sb = admin();
    const { data: { user } } = await sb.auth.getUser(jwt);
    if (user) {
      userId = user.id;
      const { data: sub } = await sb.from("subscribers").select("tier, active").eq("user_id", user.id).maybeSingle();
      if (sub && sub.active) tier = sub.tier ?? "free";
    }
  }

  // ---- choose the credential + enforce quota ----
  let apiKey = "", metered = false, p = period();
  let usageRow = { questions: 0, cost_micros: 0 };

  if (userId) {
    // logged-in: ride the server key, metered by tier
    const sb = admin();
    const { data: u } = await sb.from("usage").select("questions, cost_micros").eq("user_id", userId).eq("period", p).maybeSingle();
    if (u) usageRow = u as typeof usageRow;

    if (tier === "free") {
      if (usageRow.questions >= FREE_QUESTIONS)
        return json({ error: "Your free question is used up. Support the project to keep talking.", needsUpgrade: true, tier }, 402);
    } else {
      const budget = TIER_BUDGET_MICROS[tier] ?? 0;
      if (usageRow.cost_micros >= budget)
        return json({ error: "You've reached this month's token budget for your tier.", needsUpgrade: true, tier }, 402);
    }
    apiKey = ANTHROPIC_API_KEY; metered = true;
  } else {
    // not logged in: BYOK (own key, unmetered) or dev-open for local testing
    const byok = req.headers.get("x-byok-key") ?? "";
    if (byok.startsWith("sk-ant-")) apiKey = byok;
    else if (DEV_OPEN) apiKey = ANTHROPIC_API_KEY;
    else return json({ error: "Please sign in to begin.", needsKey: true }, 401);
  }
  if (metered && !ANTHROPIC_API_KEY) return json({ error: "Server key not configured." }, 500);

  // ---- call Anthropic ----
  const system = buildSystemPrompt(personaKey, mode);
  let data: { content?: { type?: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } };
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: MAX_TOKENS, system, messages }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); return json({ error: e?.error?.message ?? `anthropic ${r.status}` }, 502); }
    data = await r.json();
  } catch (err) { return json({ error: String((err as Error)?.message ?? err) }, 502); }

  const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");

  // ---- record usage for logged-in users ----
  if (metered && userId) {
    const inTok = data.usage?.input_tokens ?? 0, outTok = data.usage?.output_tokens ?? 0;
    const cost = inTok * PRICE_IN_MICROS + outTok * PRICE_OUT_MICROS;
    const sb = admin();
    await sb.from("usage").upsert({
      user_id: userId,
      period: p,
      questions: usageRow.questions + 1,
      cost_micros: usageRow.cost_micros + cost,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,period" });
  }

  return json({ text, tier });
});
