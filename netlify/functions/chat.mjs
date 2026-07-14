// Netlify Function (v2) — proxies DeepDive + Reef ID requests to the Anthropic API.
// The API key is read from an environment variable so it never reaches the browser.
//
// Required Netlify env var:  ANTHROPIC_API_KEY
// Optional Netlify env var:  ANTHROPIC_MODEL   (defaults to claude-sonnet-4-6)

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const key = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
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

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const payload = {
    model,
    max_tokens: body.max_tokens || 1000,
    ...(body.system ? { system: body.system } : {}),
    messages: Array.isArray(body.messages) ? body.messages : [],
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
