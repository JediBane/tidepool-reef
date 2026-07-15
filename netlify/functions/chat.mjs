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
    return Response.json(data, { status: r.status });
  } catch (err) {
    return Response.json({ error: { message: "Upstream request failed: " + String(err) } }, { status: 502 });
  }
};
