import { mkdir, writeFile, stat } from "node:fs/promises";
import { overpass } from "./overpass.ts";
import {
  tiles, viertel, poisQuery, placesQuery, trailsQuery, plzQuery, umfeldQuery, zieleQuery, type Tile,
} from "../queries.ts";
import { RAW, raw } from "./paths.ts";

const GEOJSON = {
  bundeslaender:
    "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/2_hoch.geo.json",
  kreise:
    "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/4_kreise/2_hoch.geo.json",
};

async function fetchGeojson(name: string, url: string) {
  const path = raw(`${name}.geo.json`);
  try {
    const s = await stat(path);
    if ((Date.now() - s.mtimeMs) / 86_400_000 < 30) {
      console.log(`✓ ${name}: Cache`);
      return;
    }
  } catch {}
  console.log(`→ ${name}: lade Verwaltungsgrenzen`);
  const res = await fetch(url, { signal: AbortSignal.timeout(180_000) });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const body = await res.text();
  await mkdir(RAW, { recursive: true });
  await writeFile(path, body);
  console.log(`✓ ${name}: ${(body.length / 1e6).toFixed(1)} MB`);
}

/**
 * Kacheln abarbeiten. Scheitert eine Kachel (meist Zeitlimit in dicht
 * kartierten Regionen), wird sie geviertelt und erneut eingereiht — bis zu
 * MAX_TIEFE Mal. Ein Worker: die Hauptinstanz quittiert zwei parallele
 * Abfragen mit HTTP 429.
 */
const MAX_TIEFE = 3;

async function tiled(prefix: string, build: (t: Tile) => string, concurrency = 1) {
  const queue: { t: Tile; tiefe: number }[] = tiles().map((t) => ({ t, tiefe: 0 }));
  const gesamt = queue.length;
  let done = 0;
  let leer = 0;
  let geteilt = 0;
  const gescheitert: string[] = [];

  const worker = async () => {
    while (queue.length) {
      const { t, tiefe } = queue.shift()!;
      try {
        const els = await overpass(`${prefix}-${t.id}`, build(t), {
          timeoutMs: 330_000,
          versuche: 2,
        });
        if (els.length === 0) leer++;
        console.log(`   [${++done}/${gesamt}+${geteilt}] ${prefix} ${t.id}: ${els.length}`);
      } catch (err) {
        if (tiefe < MAX_TIEFE) {
          const teile = viertel(t);
          queue.unshift(...teile.map((x) => ({ t: x, tiefe: tiefe + 1 })));
          geteilt += teile.length;
          console.log(`   ⟂ ${prefix} ${t.id} zu dicht — geviertelt (Tiefe ${tiefe + 1})`);
        } else {
          gescheitert.push(t.id);
          console.log(`   ✗ ${prefix} ${t.id} aufgegeben: ${(err as Error).message}`);
        }
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(
    `✓ ${prefix}: ${done} Kacheln geladen (${leer} leer, ${geteilt} durch Teilung entstanden, ${gescheitert.length} aufgegeben)`,
  );
  if (gescheitert.length) console.log(`  Aufgegeben: ${gescheitert.join(" ")}`);
}

const jobs: Record<string, () => Promise<unknown>> = {
  admin: async () => {
    for (const [name, url] of Object.entries(GEOJSON)) await fetchGeojson(name, url);
  },
  pois: () => tiled("pois", poisQuery),
  places: () => tiled("places", placesQuery),
  trails: () => tiled("trails", trailsQuery),
  plz: () => tiled("plz", plzQuery),
  umfeld: () => tiled("umfeld", umfeldQuery),
  ziele: () => tiled("ziele", zieleQuery),
};

const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const todo = requested.length ? requested : Object.keys(jobs);
for (const name of todo) {
  const job = jobs[name];
  if (!job) {
    console.error(`Unbekannter Job: ${name}. Verfügbar: ${Object.keys(jobs).join(", ")}`);
    process.exit(1);
  }
  await job();
}
console.log("Fertig.");
