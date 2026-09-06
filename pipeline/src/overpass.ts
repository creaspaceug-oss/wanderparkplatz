import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname } from "node:path";
import { raw as rawPath } from "./paths.ts";

/** Overpass weist Requests ohne UA/Accept mit HTTP 406 ab. */
const HEADERS = {
  "User-Agent": "wanderparkplatz.info Datenpipeline (OSM-Import; info@wu-socialmedia.de)",
  Accept: "*/*",
};

/**
 * Nur die Hauptinstanz plus ein Fallback: die übrigen öffentlichen Mirrors
 * antworten derzeit überwiegend mit 5xx und kosten nur Backoff-Zeit.
 */
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wait until the main instance reports a free execution slot. */
async function waitForSlot(maxWaitMs = 240_000): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch("https://overpass-api.de/api/status", {
        headers: HEADERS,
        signal: AbortSignal.timeout(15_000),
      });
      const txt = await res.text();
      const free = /(\d+) slots? available now/.exec(txt);
      if (free && Number(free[1]) > 0) return;
      // "Slot available after: 2026-08-30T16:40:00Z, in 42 seconds."
      const inSecs = /in (\d+) seconds/.exec(txt);
      const waitMs = Math.min(inSecs ? (Number(inSecs[1]) + 2) * 1000 : 20_000, 60_000);
      console.log(`   … kein freier Slot, warte ${Math.round(waitMs / 1000)}s`);
      await sleep(waitMs);
    } catch {
      await sleep(10_000);
    }
  }
}

export interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
  nodes?: number[];
  members?: { type: string; ref: number; role: string }[];
}

/**
 * Runs an Overpass query, caching the raw response under data/raw/<name>.json.
 * Cached results are reused unless they are older than maxAgeDays.
 */
export async function overpass(
  name: string,
  ql: string,
  opts: { maxAgeDays?: number; timeoutMs?: number; versuche?: number } = {},
): Promise<OsmElement[]> {
  const { maxAgeDays = 14, timeoutMs = 900_000, versuche = MIRRORS.length * 3 } = opts;
  const path = rawPath(`${name}.json`);

  try {
    const s = await stat(path);
    const ageDays = (Date.now() - s.mtimeMs) / 86_400_000;
    if (ageDays < maxAgeDays) {
      const cached = JSON.parse(await readFile(path, "utf8"));
      console.log(`✓ ${name}: ${cached.elements.length} Objekte (Cache, ${ageDays.toFixed(1)}d alt)`);
      return cached.elements;
    }
  } catch {
    /* no cache yet */
  }

  let lastErr: unknown;
  for (let attempt = 0; attempt < versuche; attempt++) {
    const url = MIRRORS[attempt % MIRRORS.length];
    if (url.includes("overpass-api.de")) await waitForSlot();
    console.log(`→ ${name}: Abfrage an ${new URL(url).host} (Versuch ${attempt + 1})`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" },
        body: ql,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.trim().startsWith("{")) throw new Error(`Keine JSON-Antwort: ${text.slice(0, 160)}`);
      const json = JSON.parse(text);
      if (json.remark && /error|timed out|out of memory/i.test(json.remark)) {
        throw new Error(`Overpass-Remark: ${json.remark}`);
      }
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, JSON.stringify(json));
      console.log(`✓ ${name}: ${json.elements.length} Objekte geladen`);
      return json.elements as OsmElement[];
    } catch (err) {
      lastErr = err;
      console.log(`   ✗ ${(err as Error).message}`);
      await sleep(4_000);
    }
  }
  throw new Error(`${name} fehlgeschlagen: ${(lastErr as Error)?.message}`);
}

/** Representative point for a node / way / relation. */
export function coordOf(el: OsmElement): [number, number] | null {
  if (el.lat != null && el.lon != null) return [el.lon, el.lat];
  if (el.center) return [el.center.lon, el.center.lat];
  return null;
}
