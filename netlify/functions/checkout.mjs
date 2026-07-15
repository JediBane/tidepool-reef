// POST /api/checkout  { plan: "monthly"|"annual", uid, handle }
// Creates a Stripe Checkout session for Tidepool Pro.
// Required env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, APP_URL
export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
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
