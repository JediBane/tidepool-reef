// Netlify Function (v2) — proxies DeepDive + Reef ID requests to the Anthropic API.
// The API key is read from an environment variable so it never reaches the browser.
//
// Required Netlify env vars:
//   ANTHROPIC_API_KEY (or ANTHROPIC_KEY)
//   SUPABASE_URL              — e.g. https://dhluuqpdbshvhnskyprb.supabase.co
//   SUPABASE_PUBLISHABLE_KEY  — the client-safe publishable/anon key (validates user tokens)
// Optional:
//   ANTHROPIC_MODEL (defaults to claude-sonnet-4-6)

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://dhluuqpdbshvhnskyprb.supabase.co").trim();
const SUPABASE_ANON = (process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
const SUPABASE_SERVICE = (process.env.SUPABASE_SERVICE_KEY || "").trim();

// Authoritative usage gate — runs in the DB, cannot be bypassed by the client.
async function consumeGate(uid, kind) {
  if (!SUPABASE_SERVICE) return { allowed: true, skipped: true }; // not configured → fail open (logged)
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ai_gate_consume`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE,
        Authorization: `Bearer ${SUPABASE_SERVICE}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target: uid, kind }),
    });
    if (!r.ok) { console.error("ai_gate_consume http", r.status, await r.text()); return { allowed: true, skipped: true }; }
    return await r.json();
  } catch (e) {
    console.error("ai_gate_consume failed:", String(e));
    return { allowed: true, skipped: true }; // don't hard-fail paying users on a gate hiccup
  }
}

// Validate the caller's Supabase access token. Returns the user object or null.
async function getUser(authHeader) {
  const token = (authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON || token },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? u : null;
  } catch {
    return null;
  }
}

export default async (req) => {
  // Lightweight status probe: tells the client whether the server-side gate is active
  // (SUPABASE_SERVICE_KEY present). Lets the client decide whether IT should count, with
  // no double-counting on the first call. No auth needed — reveals no secrets.
  if (req.method === "GET") {
    return Response.json({ gateActive: !!SUPABASE_SERVICE });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // --- Gatekeeping: no valid Supabase session, no AI. ---
  const user = await getUser(req.headers.get("authorization"));
  if (!user) {
    return Response.json(
      { error: { message: "You must be signed in to use AI features." } },
      { status: 401 }
    );
  }

  const key = (process.env.ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!key) {
    return Response.json(
      { error: { message: "Server missing ANTHROPIC_API_KEY (or ANTHROPIC_KEY). Set it in Netlify → Site settings → Environment variables." } },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: { message: "Invalid JSON body" } }, { status: 400 });
  }

  // --- Basic payload sanity limits (cheap abuse guard). ---
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0 || messages.length > 40) {
    return Response.json({ error: { message: "Bad request." } }, { status: 400 });
  }
  const maxTokens = Math.min(Math.max(Number(body.max_tokens) || 1000, 1), 1500);

  // --- Authoritative free-limit enforcement (server-side; client cannot bypass). ---
  const kind = body.kind === "reefid" ? "reefid" : "deepdive";
  const gate = await consumeGate(user.id, kind);
  if (!gate.allowed) {
    return Response.json(
      { error: { message: "You've used all your free AI previews. Upgrade to Tidepool Pro for unlimited access.", code: "limit_reached" } },
      { status: 402 }
    );
  }
  const serverCounted = !!(gate && gate.counted && !gate.skipped);

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const payload = {
    model,
    max_tokens: maxTokens,
    ...(body.system ? { system: String(body.system).slice(0, 8000) } : {}),
    messages,
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (data && typeof data === "object" && !Array.isArray(data)) data._serverCounted = serverCounted;
    return Response.json(data, { status: r.status });
  } catch (err) {
    return Response.json({ error: { message: "Upstream request failed: " + String(err) } }, { status: 502 });
  }
};
