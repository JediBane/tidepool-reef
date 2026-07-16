// DELETE /api/account — removes the caller's actual auth login (auth.users row).
// The DB function delete_my_account() already purged their app data + marked the profile
// deleted; this finishes the job by deleting the login itself. Requires SUPABASE_SERVICE_KEY.
// If the key isn't set, this no-ops gracefully (the account is already data-wiped + blocked).

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://dhluuqpdbshvhnskyprb.supabase.co").trim();
const SUPABASE_ANON = (process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
const SUPABASE_SERVICE = (process.env.SUPABASE_SERVICE_KEY || "").trim();

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
  } catch { return null; }
}

export default async (req) => {
  if (req.method !== "DELETE" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const user = await getUser(req.headers.get("authorization"));
  if (!user) return Response.json({ error: "Not signed in." }, { status: 401 });

  if (!SUPABASE_SERVICE) {
    // Data already wiped + profile marked deleted by the DB function; login removal deferred.
    return Response.json({ ok: true, authDeleted: false, note: "service key not configured" });
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_SERVICE, Authorization: `Bearer ${SUPABASE_SERVICE}` },
    });
    if (!r.ok) {
      console.error("auth delete failed", r.status, await r.text());
      return Response.json({ ok: true, authDeleted: false }, { status: 200 });
    }
    return Response.json({ ok: true, authDeleted: true });
  } catch (e) {
    console.error("account delete error", String(e));
    return Response.json({ ok: true, authDeleted: false }, { status: 200 });
  }
};
