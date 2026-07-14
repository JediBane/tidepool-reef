# Tidepool Reef

A reef-aquarium app — parameter tracker, coral/fish library, marketplace, community feed,
maintenance tasks, plus an AI advisor (DeepDive) and photo species ID (Reef ID).

Built with Vite + React. Deploys on Netlify. The AI features run through a Netlify
serverless function so your Anthropic API key never touches the browser.

---

## Deploy on Netlify (recommended: GitHub-connected)

1. **Push this folder to a GitHub repo.**
   ```bash
   git init
   git add .
   git commit -m "Tidepool Reef v1"
   git branch -M main
   git remote add origin https://github.com/JediBane/tidepool-reef.git
   git push -u origin main
   ```

2. **Connect it in Netlify** → "Add new site" → "Import an existing project" → pick the repo.
   Netlify reads `netlify.toml`, so the build settings are automatic:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Add your API key** in Netlify → Site settings → Environment variables:
   | Key | Value |
   |-----|-------|
   | `ANTHROPIC_API_KEY` | your Anthropic API key |
   | `ANTHROPIC_MODEL` | *(optional)* defaults to `claude-sonnet-4-6` |

4. **Deploy.** Done. The site loads immediately; DeepDive and Reef ID start working
   once the key is set.

### Alternative: Netlify CLI (no GitHub)
```bash
npm install
npm install -g netlify-cli
netlify deploy --build --prod
```
Then set `ANTHROPIC_API_KEY` with `netlify env:set ANTHROPIC_API_KEY sk-ant-...`.

---

## Local development
```bash
npm install
npm run dev          # UI only
# For AI features locally, use the Netlify dev server (runs the function too):
npm install -g netlify-cli
netlify dev
```

## Notes
- **Backend is Supabase** (project ref `dhluuqpdbshvhnskyprb`, us-east-1). Auth (email +
  password), profiles, tanks, parameters, livestock, tasks, tank log, marketplace
  listings, posts, and likes are all live tables with row-level security. The
  publishable key in `src/App.jsx` is safe to ship (RLS enforces access); override with
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` env vars if you ever move projects.
- **Sign-up email confirmation** is ON by default in Supabase. For instant signups while
  testing, turn it off: Supabase Dashboard -> Authentication -> Sign In / Up ->
  Email -> disable "Confirm email".
- **Pearls** are awarded server-side via the `award_pearls` SQL function (capped 25/call).
- **Free-tier note**: Supabase pauses inactive free projects after ~1 week. Wake it from
  the dashboard if the app can't connect after sitting idle.
- **AI proxy** is `netlify/functions/chat.mjs`. Both DeepDive (text) and Reef ID (vision)
  POST to `/api/chat`, which forwards to Anthropic with your `ANTHROPIC_API_KEY`.
- Community seed content (sample questions, tanks, a few listings/posts) still shows
  alongside real data so the app doesn't feel empty at launch; remove the SEED_* arrays
  in `src/App.jsx` when you have real users.
