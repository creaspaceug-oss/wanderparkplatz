import { readFile } from "node:fs/promises";
import pg from "pg";
import { out } from "./paths.ts";
import { suchform } from "./geo.ts";
import { kennung } from "./ident.ts";

const DB = process.env.DATABASE_URL ?? "postgres://localhost:5432/wanderparkplatz";
const readJson = async (p: string) => JSON.parse(await readFile(p, "utf8"));

const client = new pg.Client({ connectionString: DB });
await client.connect();

/** Mehrzeiliges INSERT in Blöcken; `zusatz` hängt die ON-CONFLICT-Klausel an. */
async function insertMany(
  table: string,
  cols: string[],
  rows: unknown[][],
  zusatz = "",
  chunk = 500,
) {
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const values: unknown[] = [];
    const tuples = slice.map((row) => {
      const ph = row.map((v) => {
        values.push(v);
        return `$${values.length}`;
      });
      return `(${ph.join(",")})`;
    });
    await client.query(
      `INSERT INTO ${table} (${cols.join(",")}) VALUES ${tuples.join(",")} ${zusatz}`,
      values,
    );
  }
}

/** ON CONFLICT ... DO UPDATE über alle Spalten außer den Schlüsselspalten. */
const upsert = (konflikt: string[], cols: string[]) =>
  `ON CONFLICT (${konflikt.join(",")}) DO UPDATE SET ${cols
    .filter((c) => !konflikt.includes(c))
    .map((c) => `${c} = EXCLUDED.${c}`)
    .join(", ")}`;

/**
 * Wie oben, aber `aktualisiert` rückt nur vor, wenn sich inhaltlich etwas
 * geändert hat. Sonst bekäme jede URL bei jedem Import ein neues lastmod in
 * der Sitemap — ein Signal, dem Suchmaschinen dann zu Recht nicht mehr trauen.
 */
const upsertMitStand = (konflikt: string[], cols: string[], inhalt: string[], tabelle: string) => {
  const gesetzt = cols
    .filter((c) => !konflikt.includes(c) && c !== "aktualisiert")
    .map((c) => `${c} = EXCLUDED.${c}`);
  const alt = inhalt.map((c) => `${tabelle}.${c}`).join(", ");
  const neu = inhalt.map((c) => `EXCLUDED.${c}`).join(", ");
  gesetzt.push(
    `aktualisiert = CASE WHEN (${alt}) IS DISTINCT FROM (${neu})` +
      ` THEN EXCLUDED.aktualisiert ELSE ${tabelle}.aktualisiert END`,
  );
  return `ON CONFLICT (${konflikt.join(",")}) DO UPDATE SET ${gesetzt.join(", ")}`;
};

await client.query("BEGIN");

// ------------------------------------------------------------ Regionen
const blCols = ["slug", "name", "iso", "lat", "lon", "poi_count"];
const bundeslaender = await readJson(out("bundeslaender.json"));
await insertMany(
  "bundesland",
  blCols,
  bundeslaender.map((b: any) => [b.slug, b.name, b.iso, b.lat, b.lon, b.poi_count]),
  upsert(["slug"], blCols),
);
const blIds = new Map<string, number>(
  (await client.query("SELECT id, slug FROM bundesland")).rows.map((r) => [r.slug, r.id]),
);

const kreisCols = ["slug", "name", "typ", "bundesland_id", "lat", "lon", "poi_count"];
const kreise = await readJson(out("kreise.json"));
await insertMany(
  "kreis",
  kreisCols,
  kreise
    .filter((k: any) => blIds.has(k.bl_slug))
    .map((k: any) => [k.slug, k.name, k.typ, blIds.get(k.bl_slug), k.lat, k.lon, k.poi_count]),
  upsert(["slug"], kreisCols),
);
const kreisIds = new Map<string, number>(
  (await client.query("SELECT id, slug FROM kreis")).rows.map((r) => [r.slug, r.id]),
);

const ortCols = ["slug", "name", "typ", "einwohner", "kreis_id", "bundesland_id", "lat", "lon", "poi_count"];
const orte = await readJson(out("orte.json"));
await insertMany(
  "ort",
  ortCols,
  orte.map((o: any) => [
    o.slug, o.name, o.typ, o.einwohner,
    kreisIds.get(o.kreis_slug) ?? null, blIds.get(o.bl_slug) ?? null,
    o.lat, o.lon, o.poi_count,
  ]),
  upsert(["slug"], ortCols),
);
const ortIds = new Map<string, number>(
  (await client.query("SELECT id, slug FROM ort")).rows.map((r) => [r.slug, r.id]),
);

// ---------------------------------------------------------- Parkplätze
// Upsert statt Neuaufbau: an parkplatz.id hängen Bewertungen, die einen
// Datenimport überleben müssen.
const ppCols = [
  "osm_type", "osm_id", "slug", "name", "lat", "lon",
  "bundesland_id", "kreis_id", "ort_id", "ort_km", "ort_richtung",
  "stellplaetze", "gebuehr", "gebuehr_info", "oberflaeche", "zugang",
  "oeffnungszeiten", "beleuchtet", "barrierefrei", "max_hoehe_m",
  "wohnmobil", "wc", "betreiber", "hoehe_m", "tier", "daten_score", "tags",
  "aktiv", "aktualisiert",
];
const parkplaetze = await readJson(out("parkplaetze.json"));

// Slug-Stabilität: ein einmal veröffentlichter Slug bleibt an seinem Objekt.
// Bestehende Objekte behalten ihren Slug (er steht nicht in der UPDATE-Liste);
// neue Objekte, deren berechneter Slug schon vergeben ist, bekommen die
// stabile Kennung angehängt.
const belegt = new Map<string, string>(
  (await client.query("SELECT slug, osm_type, osm_id FROM parkplatz")).rows.map(
    (r) => [r.slug, `${r.osm_type}/${r.osm_id}`],
  ),
);
let umbenannt = 0;
for (const p of parkplaetze) {
  const inhaber = belegt.get(p.slug);
  const ich = `${p.osm_type}/${p.osm_id}`;
  if (inhaber && inhaber !== ich) {
    p.slug = `${p.slug}-${kennung(p.osm_type, p.osm_id)}`;
    umbenannt++;
  }
  belegt.set(p.slug, ich);
}

await insertMany(
  "parkplatz",
  ppCols,
  parkplaetze.map((p: any) => [
    p.osm_type, p.osm_id, p.slug, p.name, p.lat, p.lon,
    blIds.get(p.bl_slug) ?? null, kreisIds.get(p.kreis_slug) ?? null,
    ortIds.get(p.ort_slug) ?? null, p.ort_km, p.ort_richtung,
    p.stellplaetze, p.gebuehr, p.gebuehr_info, p.oberflaeche, p.zugang,
    p.oeffnungszeiten, p.beleuchtet, p.barrierefrei, p.max_hoehe_m,
    p.wohnmobil, p.wc, p.betreiber, p.hoehe_m, p.tier, p.daten_score,
    JSON.stringify(p.tags), true, new Date(),
  ]),
  // slug bewusst ausgenommen: bestehende URLs bleiben bestehen.
  upsertMitStand(
    ["osm_type", "osm_id"],
    ppCols.filter((c) => c !== "slug"),
    // Nur auf der Seite sichtbare Felder gelten als inhaltliche Änderung.
    [
      "name", "lat", "lon", "stellplaetze", "gebuehr", "gebuehr_info", "oberflaeche",
      "zugang", "oeffnungszeiten", "beleuchtet", "barrierefrei", "max_hoehe_m",
      "wohnmobil", "wc", "betreiber", "hoehe_m", "ort_id", "kreis_id", "aktiv",
    ],
    "parkplatz",
  ),
);

// Verschwundene Objekte nicht löschen — sie könnten Bewertungen tragen.
await client.query("CREATE TEMP TABLE importiert (osm_type text, osm_id bigint) ON COMMIT DROP");
await insertMany(
  "importiert",
  ["osm_type", "osm_id"],
  parkplaetze.map((p: any) => [p.osm_type, p.osm_id]),
);
const { rowCount: stillgelegt } = await client.query(
  `UPDATE parkplatz p SET aktiv = false
    WHERE p.aktiv
      AND NOT EXISTS (
        SELECT 1 FROM importiert i
         WHERE i.osm_type = p.osm_type AND i.osm_id = p.osm_id)`,
);

// Regionen ohne Bestand entfernen; auf sie verweist dann nichts mehr.
await client.query("DELETE FROM ort   WHERE id NOT IN (SELECT ort_id   FROM parkplatz WHERE ort_id   IS NOT NULL)");
await client.query("DELETE FROM kreis WHERE id NOT IN (SELECT kreis_id FROM parkplatz WHERE kreis_id IS NOT NULL)");

// -------------------------------------------------------- Wanderwege
// Rein abgeleitet — wird bei jedem Import neu aufgebaut.
const trails = await readJson(out("trails.json")).catch(() => []);
const zuordnung = await readJson(out("parkplatz_trail.json")).catch(() => []);
if (trails.length) {
  await client.query("TRUNCATE parkplatz_trail, trail RESTART IDENTITY CASCADE");
  await insertMany(
    "trail",
    ["osm_id", "name", "slug", "netz", "ref", "markierung", "laenge_km"],
    trails.map((t: any) => [t.osm_id, t.name, t.slug, t.netz, t.ref, t.markierung, t.laenge_km]),
  );
  const trailIds = new Map<string, number>(
    (await client.query("SELECT id, osm_id FROM trail")).rows.map((r) => [String(r.osm_id), r.id]),
  );
  const ppIds = new Map<string, number>(
    (await client.query("SELECT id, osm_type, osm_id FROM parkplatz")).rows.map((r) => [
      `${r.osm_type}/${r.osm_id}`,
      r.id,
    ]),
  );
  const paare = zuordnung
    .map((z: any) => [
      ppIds.get(`${z.osm_type}/${z.osm_id}`),
      trailIds.get(String(z.trail_osm_id)),
      z.distanz_m,
    ])
    .filter((r: any[]) => r[0] && r[1]);
  await insertMany(
    "parkplatz_trail",
    ["parkplatz_id", "trail_id", "distanz_m"],
    paare,
    "ON CONFLICT (parkplatz_id, trail_id) DO UPDATE SET distanz_m = EXCLUDED.distanz_m",
  );
}

// ------------------------------------------------------------ Umfeld
// Rein abgeleitet — bei jedem Import neu aufgebaut.
const umfeld = await readJson(out("umfeld.json")).catch(() => []);
if (umfeld.length) {
  await client.query("TRUNCATE parkplatz_nearby RESTART IDENTITY");
  const ppIds2 = new Map<string, number>(
    (await client.query("SELECT id, osm_type, osm_id FROM parkplatz")).rows.map((r) => [
      `${r.osm_type}/${r.osm_id}`,
      r.id,
    ]),
  );
  const zeilen = umfeld
    .map((u: any) => [
      ppIds2.get(`${u.platz_osm_type}/${u.platz_osm_id}`),
      u.kategorie, u.name, u.distanz_m, u.lat, u.lon,
    ])
    .filter((r: any[]) => r[0]);
  await insertMany(
    "parkplatz_nearby",
    ["parkplatz_id", "kategorie", "name", "distanz_m", "lat", "lon"],
    zeilen,
  );
}

// --------------------------------------------------- Standortsuche
const standorte = await readJson(out("standorte.json")).catch(() => []);
await client.query("TRUNCATE standort RESTART IDENTITY");
await insertMany(
  "standort",
  ["typ", "name", "zusatz", "lat", "lon", "einwohner", "gewicht", "such_text"],
  standorte.map((o: any) => [
    o.typ, o.name, o.zusatz, o.lat, o.lon, o.einwohner, Math.round(o.gewicht), o.such_text,
  ]),
);

// -------------------------------------------------------------- Suche
// Vollständig neu aufgebaut — rein abgeleitet, enthält keine Nutzerdaten.
await client.query("TRUNCATE suchindex RESTART IDENTITY");
const suchZeilen: unknown[][] = [];
for (const r of (
  await client.query(
    `SELECT p.slug, p.name, p.daten_score,
            o.name AS ort, k.name AS kreis, b.name AS bl
       FROM parkplatz p
       LEFT JOIN ort o        ON o.id = p.ort_id
       LEFT JOIN kreis k      ON k.id = p.kreis_id
       LEFT JOIN bundesland b ON b.id = p.bundesland_id
      WHERE p.aktiv`,
  )
).rows) {
  const unter = [r.ort, r.kreis, r.bl].filter(Boolean).join(" · ");
  suchZeilen.push([
    "parkplatz", r.slug, r.name, unter, r.daten_score,
    suchform([r.name, r.ort, r.kreis, r.bl].filter(Boolean).join(" ")),
  ]);
}
for (const [typ, sql] of [
  ["ort", "SELECT o.slug, o.name, o.poi_count, k.name AS zusatz FROM ort o LEFT JOIN kreis k ON k.id = o.kreis_id WHERE o.poi_count > 0"],
  ["kreis", "SELECT k.slug, k.name, k.poi_count, b.name AS zusatz FROM kreis k LEFT JOIN bundesland b ON b.id = k.bundesland_id WHERE k.poi_count > 0"],
  ["bundesland", "SELECT slug, name, poi_count, NULL AS zusatz FROM bundesland WHERE poi_count > 0"],
] as const) {
  for (const r of (await client.query(sql)).rows) {
    const label = typ === "ort" ? "Ort" : typ === "kreis" ? "Landkreis" : "Bundesland";
    suchZeilen.push([
      typ, r.slug, r.name,
      [label, r.zusatz].filter(Boolean).join(" · "),
      // Regionen ranken über der Einzelseite: 200 liegt über jedem daten_score
      200 + Math.min(r.poi_count, 500),
      suchform([r.name, r.zusatz].filter(Boolean).join(" ")),
    ]);
  }
}
await insertMany(
  "suchindex",
  ["typ", "slug", "titel", "untertitel", "gewicht", "such_text"],
  suchZeilen,
  "ON CONFLICT (typ, slug) DO NOTHING",
);

/*
 * Wanderwege: Zahl der Parkplätze und ob eine eigene Seite gerechtfertigt ist.
 *
 * Ein Weg mit nur einem Parkplatz ergäbe eine Seite mit einem Listeneintrag —
 * 5.330 der 7.441 Wege fallen darunter. Zwei Parkplätze genügen, sofern die
 * Seite darüber hinaus etwas zu sagen hat: eine Netzstufe oberhalb "örtlich"
 * oder eine bekannte Weglänge.
 */
await client.query(`
  UPDATE trail t SET
    parkplatz_count = c.n,
    -- COALESCE ist nötig: bei netz = NULL liefert IN (...) weder wahr noch
    -- falsch, sondern NULL, und "true AND NULL" ist NULL.
    eigene_seite = COALESCE(
      c.n >= 2 AND (t.netz IN ('iwn','nwn','rwn') OR t.laenge_km IS NOT NULL),
      false)
  FROM (SELECT trail_id, count(*)::int AS n FROM parkplatz_trail GROUP BY trail_id) c
  WHERE c.trail_id = t.id`);

/*
 * Inhaltsumfang neu berechnen — erst hier, wenn Wege und Umfeld geladen sind.
 * Er steuert, welche Seiten indexiert werden; daten_score allein wäre dafür
 * seit der Anreicherung ein falscher Maßstab.
 */
await client.query(`
  UPDATE parkplatz p SET aussagen =
      (p.stellplaetze IS NOT NULL)::int + (p.gebuehr IS NOT NULL)::int
    + (p.oberflaeche IS NOT NULL)::int + (p.zugang IS NOT NULL)::int
    + (p.oeffnungszeiten IS NOT NULL)::int + (p.beleuchtet IS NOT NULL)::int
    + (p.barrierefrei IS NOT NULL)::int + (p.max_hoehe_m IS NOT NULL)::int
    + (p.wohnmobil IS NOT NULL)::int + (p.wc IS NOT NULL)::int
    + (p.betreiber IS NOT NULL)::int + (p.hoehe_m IS NOT NULL)::int
    + (SELECT count(*) FROM parkplatz_trail t  WHERE t.parkplatz_id = p.id)
    + (SELECT count(*) FROM parkplatz_nearby n WHERE n.parkplatz_id = p.id)`);

await client.query("COMMIT");
await client.query("ANALYZE");

const z = (
  await client.query(
    `SELECT (SELECT count(*) FROM parkplatz WHERE aktiv)::int   AS aktiv,
            (SELECT count(*) FROM parkplatz WHERE NOT aktiv)::int AS inaktiv,
            (SELECT count(*) FROM ort)::int                     AS orte,
            (SELECT count(*) FROM kreis)::int                   AS kreise,
            (SELECT count(*) FROM suchindex)::int               AS such,
            (SELECT count(*) FROM bewertung)::int               AS bewertungen,
            (SELECT count(*) FROM standort)::int                 AS standorte,
            (SELECT count(*) FROM trail)::int                    AS trails,
            (SELECT count(*) FROM parkplatz_trail)::int          AS wegpaare,
            (SELECT count(*) FROM parkplatz_nearby)::int         AS umfeld,
            (SELECT count(*) FROM parkplatz WHERE aktiv AND aussagen <= 2)::int AS duenn,
            (SELECT count(*) FROM trail WHERE eigene_seite)::int AS wegseiten`,
  )
).rows[0];
console.log(`Import fertig.
  Parkplätze aktiv   ${z.aktiv}${z.inaktiv ? `  (${z.inaktiv} stillgelegt, davon neu: ${stillgelegt})` : ""}
  Kreise / Orte      ${z.kreise} / ${z.orte}
  Sucheinträge       ${z.such}
  Slug-Kollisionen   ${umbenannt} (Kennung angehängt)
  Standortziele      ${z.standorte}
  Wanderwege         ${z.trails} (${z.wegpaare} Zuordnungen)
  Umfeld-Einträge    ${z.umfeld}
  zu dünn für Index  ${z.duenn}
  Wanderweg-Seiten   ${z.wegseiten}
  Bewertungen erhalten ${z.bewertungen}`);
await client.end();
