import pg from "pg";
import { datenbankUrl } from "./db-url.ts";

/**
 * Bilder für Ziele und Orte beschaffen.
 *
 * Zwei Schritte: Wikidata liefert über die Eigenschaft P18 den Dateinamen des
 * kuratierten Bildes, Commons liefert dazu Vorschaubild, Maße, Lizenz und
 * Urheber. Die Geosuche wäre einfacher, liefert aber irgendein Foto in der
 * Nähe — bei der Burg Hohenzollern ein Gemälde, beim Wasserfall eine Kirche.
 *
 * Beide Schnittstellen nehmen 50 Objekte je Anfrage; bei rund 7.000 Objekten
 * sind das etwa 280 Anfragen.
 */
const DB = datenbankUrl();
const AGENT = "wanderparkplatz.info/1.0 (Bildrecherche; info@wu-socialmedia.de)";
const BLOCK = 50;

const schlafe = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function jsonHolen(url: URL, versuche = 3): Promise<any> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": AGENT },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i >= versuche) throw err;
      await schlafe(i * 1500);
    }
  }
}

/** Wikidata-ID → Dateiname des Bildes (Eigenschaft P18). */
async function p18(ids: string[]): Promise<Map<string, string>> {
  const u = new URL("https://www.wikidata.org/w/api.php");
  u.search = new URLSearchParams({
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "claims",
    format: "json",
  }).toString();
  const d = await jsonHolen(u);
  const raus = new Map<string, string>();
  for (const [id, e] of Object.entries<any>(d.entities ?? {})) {
    const datei = e?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (typeof datei === "string") raus.set(id, datei);
  }
  return raus;
}

interface Bildinfo {
  datei: string;
  url: string;
  breite: number;
  hoehe: number;
  lizenz: string | null;
  lizenzUrl: string | null;
  urheber: string | null;
  quelleUrl: string;
}

const text = (md: any, k: string): string | null => {
  const v = md?.[k]?.value;
  if (typeof v !== "string") return null;
  const rein = v.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return rein || null;
};

/** Dateiname → Vorschaubild, Maße, Lizenz, Urheber. */
async function commons(dateien: string[]): Promise<Map<string, Bildinfo>> {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.search = new URLSearchParams({
    action: "query",
    titles: dateien.map((d) => `File:${d}`).join("|"),
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1200",
    format: "json",
  }).toString();
  const d = await jsonHolen(u);
  const raus = new Map<string, Bildinfo>();
  for (const p of Object.values<any>(d?.query?.pages ?? {})) {
    const ii = p?.imageinfo?.[0];
    if (!ii?.thumburl) continue;
    // Nur Rasterbilder: Karten und Wappen liegen häufig als SVG vor
    if (ii.mime !== "image/jpeg" && ii.mime !== "image/png") continue;
    const md = ii.extmetadata ?? {};
    raus.set(String(p.title).replace(/^File:/, ""), {
      datei: String(p.title).replace(/^File:/, ""),
      url: ii.thumburl,
      breite: ii.thumbwidth,
      hoehe: ii.thumbheight,
      lizenz: text(md, "LicenseShortName"),
      lizenzUrl: md.LicenseUrl?.value ?? null,
      urheber: text(md, "Artist"),
      quelleUrl: ii.descriptionurl,
    });
  }
  return raus;
}

const client = new pg.Client({ connectionString: DB });
await client.connect();

// Nur was auch eine Seite hat — für alles andere brauchen wir kein Bild.
// Die Wanderregionen kommen dazu: ihre Wikidata-IDs stehen im kuratierten
// Datensatz der Anwendung, nicht in einer Tabelle.
const { WANDERREGIONEN } = await import("../../web/lib/wanderregionen.ts");
const regionIds = WANDERREGIONEN.map((r) => r.wikidata);

const { rows } = await client.query<{ wikidata: string }>(
  `SELECT DISTINCT wikidata FROM (
     SELECT wikidata FROM ziel WHERE eigene_seite AND wikidata IS NOT NULL
     UNION
     SELECT wikidata FROM ort  WHERE poi_count > 0 AND wikidata IS NOT NULL
     UNION
     SELECT unnest($1::text[])
   ) x
   WHERE wikidata NOT IN (SELECT wikidata FROM bild)`,
  [regionIds],
);

const offen = rows.map((r) => r.wikidata);
console.log(`${offen.length} Objekte ohne Bild — hole in ${Math.ceil(offen.length / BLOCK)} Blöcken`);

let gefunden = 0;
let ohneP18 = 0;
for (let i = 0; i < offen.length; i += BLOCK) {
  const block = offen.slice(i, i + BLOCK);
  let dateien: Map<string, string>;
  try {
    dateien = await p18(block);
  } catch (err) {
    console.warn(`  Block ${i / BLOCK + 1}: Wikidata fehlgeschlagen — ${(err as Error).message}`);
    continue;
  }
  ohneP18 += block.length - dateien.size;
  if (!dateien.size) continue;

  let infos: Map<string, Bildinfo>;
  try {
    infos = await commons([...new Set(dateien.values())]);
  } catch (err) {
    console.warn(`  Block ${i / BLOCK + 1}: Commons fehlgeschlagen — ${(err as Error).message}`);
    continue;
  }

  for (const [id, datei] of dateien) {
    const b = infos.get(datei);
    if (!b) continue;
    await client.query(
      `INSERT INTO bild (wikidata, datei, url, breite, hoehe, lizenz, lizenz_url, urheber, quelle_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (wikidata) DO UPDATE SET
         datei = EXCLUDED.datei, url = EXCLUDED.url, breite = EXCLUDED.breite,
         hoehe = EXCLUDED.hoehe, lizenz = EXCLUDED.lizenz, lizenz_url = EXCLUDED.lizenz_url,
         urheber = EXCLUDED.urheber, quelle_url = EXCLUDED.quelle_url, geholt = now()`,
      [id, b.datei, b.url, b.breite, b.hoehe, b.lizenz, b.lizenzUrl, b.urheber, b.quelleUrl],
    );
    gefunden++;
  }

  if ((i / BLOCK) % 10 === 0)
    console.log(`  ${i + block.length}/${offen.length} geprüft, ${gefunden} Bilder`);
  await schlafe(250); // freundlich zu den Wikimedia-Servern
}

const { rows: z } = await client.query(`
  SELECT (SELECT count(*) FROM bild)::int AS bilder,
         (SELECT count(*) FROM ziel WHERE eigene_seite AND wikidata IN (SELECT wikidata FROM bild))::int AS ziele,
         (SELECT count(*) FROM ort  WHERE poi_count > 0 AND wikidata IN (SELECT wikidata FROM bild))::int AS orte`);
console.log(`
Fertig.
  Bilder gespeichert  ${z[0].bilder}   (neu: ${gefunden}, ohne P18: ${ohneP18})
  Zielseiten mit Bild ${z[0].ziele}
  Ortsseiten mit Bild ${z[0].orte}`);
await client.end();
