/**
 * Build-time image fetcher for Reefpedia.
 *
 * Downloads one freely-licensed photo per species from Wikimedia Commons into
 * public/species/, and writes src/species-images.json with the photographer and
 * license for each (which is what the CC licenses require us to display).
 *
 * Runs on Netlify's build servers, so the deployed app has NO runtime dependency
 * on Wikipedia — the images ship inside the site.
 *
 * FAIL-SAFE: this script never fails the build. Any species it can't fetch simply
 * falls back to the app's gradient placeholder.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "species");
const MANIFEST = path.join(ROOT, "src", "species-images.json");

// Wikimedia asks all API clients to identify themselves.
const UA = "TidepoolReef/1.0 (reef aquarium reference app; contact via github.com/JediBane/tidepool-reef)";
const HEADERS = { "User-Agent": UA, "Api-User-Agent": UA };
const WIDTH = 1024; // plenty for retina cards + detail sheets; keeps the bundle lean

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch with timeout + retry/backoff — Wikimedia occasionally throttles or stalls. */
async function tryFetch(url, tries = 4) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
      clearTimeout(timer);
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r;
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      await sleep(400 * Math.pow(2, i));   // 0.4s, 0.8s, 1.6s, 3.2s
    }
  }
  throw lastErr;
}

async function getJSON(url) {
  const r = await tryFetch(url);
  return r.json();
}

/** Find the Commons File: title for a page's lead image. */
async function leadFileTitle(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=name&format=json&origin=*&titles=${encodeURIComponent(title)}`;
  const d = await getJSON(url);
  const pages = d?.query?.pages || {};
  for (const k of Object.keys(pages)) {
    if (k !== "-1" && pages[k].pageimage) return "File:" + pages[k].pageimage;
  }
  return null;
}

/** Search Wikipedia for a better-matching page if the direct title has no image. */
async function searchTitle(q) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`;
  const d = await getJSON(url);
  return (d?.query?.search || []).map((s) => s.title);
}

/** Get the scaled image URL + attribution metadata for a Commons file. */
async function fileInfo(fileTitle) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}` +
    `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${WIDTH}&format=json&origin=*`;
  const d = await getJSON(url);
  const pages = d?.query?.pages || {};
  for (const k of Object.keys(pages)) {
    const ii = pages[k]?.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata || {};
    const strip = (s) => (s ? String(s).replace(/<[^>]*>/g, "").trim() : "");
    return {
      url: ii.thumburl || ii.url,
      artist: strip(m.Artist?.value) || "Unknown",
      license: strip(m.LicenseShortName?.value) || "See Commons",
      descUrl: ii.descriptionurl || "",
    };
  }
  return null;
}

async function resolve(entry) {
  const candidates = [entry.wiki];
  try {
    const direct = await leadFileTitle(entry.wiki);
    if (direct) {
      const info = await fileInfo(direct);
      if (info?.url) return info;
    }
    // Fall back to a search on the scientific name.
    for (const t of await searchTitle(entry.sci || entry.name)) {
      if (candidates.includes(t)) continue;
      const f = await leadFileTitle(t);
      if (!f) continue;
      const info = await fileInfo(f);
      if (info?.url) return info;
    }
  } catch (e) { /* fall through to null */ }
  return null;
}

async function download(url, dest) {
  const r = await tryFetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) throw new Error("suspiciously small image");
  fs.writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  // Read the species list straight out of the source file.
  const raw = fs.readFileSync(path.join(ROOT, "src", "reefpedia.js"), "utf8");
  const entries = [...raw.matchAll(/id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)",\s*sci:\s*"([^"]+)",\s*wiki:\s*"([^"]+)"/g)]
    .map((m) => ({ id: m[1], name: m[2], sci: m[3], wiki: m[4] }));

  console.log(`[reefpedia] resolving photos for ${entries.length} entries…`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {};
  let ok = 0, miss = 0;

  // Modest concurrency — be a good Wikimedia citizen.
  const queue = [...entries];
  const workers = Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const e = queue.shift();
      await sleep(120);                       // be a polite Wikimedia client
      const file = `${e.id}.jpg`;
      const dest = path.join(OUT_DIR, file);
      try {
        const info = await resolve(e);
        if (!info) { miss++; console.log(`  – ${e.name}: no image found`); continue; }
        await download(info.url, dest);
        manifest[e.id] = {
          src: `/species/${file}`,
          artist: info.artist,
          license: info.license,
          source: info.descUrl,
        };
        ok++;
      } catch (err) {
        miss++;
        console.log(`  – ${e.name}: ${err.message}`);
      }
    }
  });
  await Promise.all(workers);

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`[reefpedia] ${ok}/${entries.length} photos bundled, ${miss} missing.`);
  if (miss > 0) console.log("[reefpedia] missing entries will fall back to a runtime Wikipedia lookup in the app.");

  // Human-readable credits for the repo.
  const credits = Object.entries(manifest)
    .map(([id, m]) => `- **${id}** — ${m.artist} (${m.license}) — ${m.source}`)
    .join("\n");
  fs.writeFileSync(path.join(ROOT, "ATTRIBUTION.md"),
    `# Photo attribution\n\nReefpedia species photos come from Wikimedia Commons and are used under their respective free licenses.\nEach photo's author and license is listed below and is also shown in-app on every species detail page.\n\n${credits}\n`);
}

// Never fail the build over images.
main().catch((e) => {
  console.log("[reefpedia] image fetch skipped:", e.message);
  if (!fs.existsSync(MANIFEST)) fs.writeFileSync(MANIFEST, "{}");
});
