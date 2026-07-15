// POST /api/checkout  { plan: "monthly"|"annual", uid, handle }
// Creates a Stripe Checkout session for Tidepool Pro.
// Required env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, APP_URL
const SUPABASE_URL = (process.env.SUPABASE_URL || "https://dhluuqpdbshvhnskyprb.supabase.co").trim();
const SUPABASE_ANON = (process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
async function getUser(authHeader) {
  const token = (authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON || token } });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? u : null;
  } catch { return null; }
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const authedUser = await getUser(req.headers.get("authorization"));
  if (!authedUser) return Response.json({ error: "Sign in to subscribe." }, { status: 401 });
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key) return Response.json({ error: "Payments are launching soon — hang tight!" }, { status: 503 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }
  const { plan, uid, handle } = body || {};
  const price = plan === "annual" ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
  if (!price || !uid) return Response.json({ error: "Missing price or user" }, { status: 400 });

  const app = process.env.APP_URL || "https://reefpulse-app.netlify.app";
  const form = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    client_reference_id: uid,
    "metadata[uid]": uid,
    "metadata[handle]": handle || "",
    "subscription_data[metadata][uid]": uid,
    success_url: `${app}/?upgraded=1`,
    cancel_url: `${app}/?upgrade=cancelled`,
    allow_promotion_codes: "true",
  });

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = await r.json();
  if (!r.ok) {
    console.error("stripe checkout error:", session.error && session.error.message);
    return Response.json({ error: "Could not start checkout" }, { status: 502 });
  }
  return Response.json({ url: session.url });
};
