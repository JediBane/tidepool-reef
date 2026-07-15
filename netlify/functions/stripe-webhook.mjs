// POST /api/stripe-webhook — Stripe events → profiles.plan
// Required env: STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
import crypto from "node:crypto";

function verify(payload, sigHeader, secret) {
  // Stripe-Signature: t=timestamp,v1=hex
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const signed = `${parts.t}.${payload}`;
  const expect = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  const ok = crypto.timingSafeEqual(Buffer.from(expect), Buffer.from(parts.v1 || ""));
  const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < 300; // 5 min tolerance
  return ok && fresh;
}

async function uidFromCustomer(customer, key) {
  // Fallback when subscription event lacks metadata.uid — read it off the Customer.
  try {
    const r = await fetch(`https://api.stripe.com/v1/customers/${customer}`, { headers: { Authorization: `Bearer ${key}` } });
    const c = await r.json();
    return (c && c.metadata && c.metadata.uid) || null;
  } catch { return null; }
}

async function setPlan(uid, plan, customer) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(customer ? { plan, stripe_customer: customer } : { plan }),
  });
  if (!r.ok) console.error("supabase plan update failed:", r.status, await r.text());
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  try {
    if (!verify(payload, sig, secret)) return new Response("Bad signature", { status: 400 });
  } catch { return new Response("Bad signature", { status: 400 }); }

  const event = JSON.parse(payload);
  const obj = event.data && event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const uid = (obj.metadata && obj.metadata.uid) || obj.client_reference_id;
      if (uid) await setPlan(uid, "pro", obj.customer);
      break;
    }
    case "customer.subscription.updated": {
      let uid = obj.metadata && obj.metadata.uid;
      if (!uid && obj.customer) uid = await uidFromCustomer(obj.customer, stripeKey);
      if (uid) {
        const active = ["active", "trialing", "past_due"].includes(obj.status);
        await setPlan(uid, active ? "pro" : "free");
      }
      break;
    }
    case "customer.subscription.deleted": {
      let uid = obj.metadata && obj.metadata.uid;
      if (!uid && obj.customer) uid = await uidFromCustomer(obj.customer, stripeKey);
      if (uid) await setPlan(uid, "free");
      break;
    }
    default: break; // ignore everything else
  }
  return Response.json({ received: true });
};
