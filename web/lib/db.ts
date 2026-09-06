import pg from "pg";
import { cache } from "react";

// Ein Pool pro Prozess; im Dev-Modus über Hot Reloads hinweg wiederverwenden.
const globalForPg = globalThis as unknown as { pgPool?: pg.Pool };

const LOKAL = "postgres://localhost:5432/wanderparkplatz";

/**
 * Ohne DATABASE_URL fiele die Anwendung auf localhost zurück und der Build
 * bräche mit "ECONNREFUSED 127.0.0.1:5432" ab — einer Meldung, die die
 * eigentliche Ursache verschweigt. Deshalb hier früh und deutlich abbrechen.
 */
if (!process.env.DATABASE_URL && process.env.VERCEL) {
  throw new Error(
    "DATABASE_URL ist nicht gesetzt.\n\n" +
      "Die Seiten werden zur Bauzeit aus der Datenbank vorgerendert; ohne\n" +
      "Verbindung kann der Build nicht laufen. In den Projekteinstellungen\n" +
      "unter Environment Variables setzen — für Production, Preview und\n" +
      "Development. Vorlage: .env.example im Repository.",
  );
}

const IST_BUILD = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Verbindungen sparsam halten.
 *
 * Serverless: jede Funktionsinstanz hat einen eigenen Pool, ein hoher max-Wert
 * erschöpft schnell das Limit der Datenbank.
 *
 * Build: Next rendert mit mehreren Worker-Prozessen parallel, jeder mit
 * eigenem Pool. Bei einer Datenbank, die aus dem Ruhezustand aufwacht (Neon
 * & Co. pausieren nach kurzer Untätigkeit), treffen dann dutzende
 * Verbindungsversuche gleichzeitig auf eine noch startende Instanz — das war
 * die Ursache für "Connection terminated due to connection timeout".
 * Deshalb: kleiner Pool und großzügige Wartezeit beim Verbindungsaufbau.
 */
export const pool =
  globalForPg.pgPool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL ?? LOKAL,
    max: Number(process.env.PG_POOL_MAX ?? (IST_BUILD ? 4 : process.env.VERCEL ? 3 : 10)),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 30_000,
  });

// Ein Verbindungsfehler im Hintergrund darf den Prozess nicht beenden.
pool.on("error", (err) => console.error("Postgres-Pool:", err.message));

// Standardschwelle von word_similarity ist 0.6 — zu streng für deutsche
// Ortsnamen mit Umlauten ("abtskuche" statt "abtskueche"). Pro Verbindung
// gesetzt statt per ALTER DATABASE, damit jede Deployment-Datenbank
// dasselbe Verhalten zeigt.
export const AEHNLICHKEIT = 0.42;
pool.on("connect", (c) => {
  void c.query(`SET pg_trgm.word_similarity_threshold = ${AEHNLICHKEIT}`);
});
if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;

/**
 * Fehler, die eine kalt startende oder kurz gestörte Datenbank erzeugt und die
 * ein zweiter Versuch löst.
 */
function istVoruebergehend(err: unknown): boolean {
  const e = err as NodeJS.ErrnoException & { code?: string };
  if (["ECONNRESET", "ETIMEDOUT", "EPIPE", "57P01", "08006", "08003"].includes(e.code ?? ""))
    return true;
  return /Connection terminated|timeout exceeded|Client has encountered a connection error/i.test(
    e.message ?? "",
  );
}

const schlafe = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function q<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  // Nur Lesezugriffe wiederholen: bei einem abgebrochenen Schreibvorgang ist
  // nicht sicher, ob er die Datenbank erreicht hat.
  const lesend = /^\s*(select|with)\b/i.test(sql);
  const versuche = lesend ? 3 : 1;

  for (let i = 1; ; i++) {
    try {
      const res = await pool.query(sql, params);
      return res.rows as T[];
    } catch (err) {
      if (i < versuche && istVoruebergehend(err)) {
        await schlafe(i * 750);
        continue;
      }
      throw uebersetze(err);
    }
  }
}

function uebersetze(err: unknown): Error {
  {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ECONNREFUSED" || e.code === "ENOTFOUND") {
      return new Error(
        `Die Datenbank ist nicht erreichbar (${e.code}). Prüfe DATABASE_URL — ` +
          `bei verwalteten Anbietern den gepoolten Endpunkt verwenden.`,
        { cause: err },
      );
    }
    if (e.code === "42P01") {
      return new Error(
        "Die Tabellen fehlen. Erst die Dateien aus pipeline/sql/ einspielen, " +
          "dann `npm run data:load` gegen dieselbe Datenbank ausführen.",
        { cause: err },
      );
    }
    return err as Error;
  }
}

export async function one<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------- Typen
export interface Parkplatz {
  id: number;
  osm_type: string;
  osm_id: string;
  aktualisiert: string;
  slug: string;
  name: string;
  lat: number;
  lon: number;
  stellplaetze: number | null;
  gebuehr: boolean | null;
  gebuehr_info: string | null;
  oberflaeche: string | null;
  zugang: string | null;
  oeffnungszeiten: string | null;
  beleuchtet: boolean | null;
  barrierefrei: boolean | null;
  max_hoehe_m: string | null;
  wohnmobil: boolean | null;
  wc: boolean | null;
  betreiber: string | null;
  hoehe_m: number | null;
  daten_score: number;
  aussagen: number;
  bewertung_anzahl: number;
  bewertung_schnitt: string | null;
  ort_km: number | null;
  ort_richtung: string | null;
  ort_name: string | null;
  ort_slug: string | null;
  kreis_name: string | null;
  kreis_typ: string | null;
  kreis_slug: string | null;
  bl_name: string | null;
  bl_slug: string | null;
}

export interface ParkplatzMitDistanz extends Parkplatz {
  km: number;
}

/**
 * Auswahl eines Parkplatzes samt Gebietsnamen.
 *
 * `zusatz` nimmt Spalten aus mitverknüpften Tabellen auf — etwa den Abstand
 * aus parkplatz_ziel. Ohne diesen Weg fehlte die Spalte still im Ergebnis und
 * tauchte erst als "NaN" auf der Seite auf.
 */
const selectParkplatz = (zusatz = "") => `
  SELECT p.*,${zusatz ? ` ${zusatz},` : ""}
         o.name AS ort_name, o.slug AS ort_slug,
         k.name AS kreis_name, k.slug AS kreis_slug, k.typ AS kreis_typ,
         b.name AS bl_name, b.slug AS bl_slug
  FROM parkplatz p
  LEFT JOIN ort o        ON o.id = p.ort_id
  LEFT JOIN kreis k      ON k.id = p.kreis_id
  LEFT JOIN bundesland b ON b.id = p.bundesland_id`;

const SELECT_PARKPLATZ = selectParkplatz();

/**
 * Umkreissuche ohne PostGIS: Bounding-Box grenzt über den B-Tree-Index auf
 * (lat, lon) vor, die exakte Haversine-Distanz läuft nur auf der Restmenge.
 */
export function umkreis(lat: number, lon: number, radiusKm = 25, limit = 24) {
  return q<ParkplatzMitDistanz>(
    `WITH kandidaten AS (
       ${SELECT_PARKPLATZ}
       WHERE p.aktiv
         AND p.lat BETWEEN $1 - ($3 / 111.32) AND $1 + ($3 / 111.32)
         AND p.lon BETWEEN $2 - ($3 / (111.32 * cos(radians($1))))
                       AND $2 + ($3 / (111.32 * cos(radians($1))))
     )
     SELECT *, 6371 * acos(LEAST(1, GREATEST(-1,
              cos(radians($1)) * cos(radians(lat)) * cos(radians(lon) - radians($2))
              + sin(radians($1)) * sin(radians(lat))))) AS km
     FROM kandidaten
     WHERE 6371 * acos(LEAST(1, GREATEST(-1,
              cos(radians($1)) * cos(radians(lat)) * cos(radians(lon) - radians($2))
              + sin(radians($1)) * sin(radians(lat))))) <= $3
     ORDER BY km
     LIMIT $4`,
    [lat, lon, radiusKm, limit],
  );
}

/**
 * Über React.cache gebündelt: generateMetadata und die Seite selbst brauchen
 * dieselben Daten. Ohne Bündelung sind das zwei Abfragen je Seitenaufruf — bei
 * einer Datenbank in einer anderen Region kostet jede rund 90 ms.
 */
export const parkplatzBySlug = cache((slug: string) =>
  one<Parkplatz>(`${SELECT_PARKPLATZ} WHERE p.slug = $1 AND p.aktiv`, [slug]),
);

export const parkplaetzeIn = (
  spalte: "bundesland_id" | "kreis_id" | "ort_id",
  id: number,
  limit = 200,
) =>
  q<Parkplatz>(
    `${SELECT_PARKPLATZ} WHERE p.${spalte} = $1 AND p.aktiv
     ORDER BY p.daten_score DESC, p.name LIMIT $2`,
    [id, limit],
  );

/** Weitere Wanderparkplätze rund um einen Platz — ohne ihn selbst. */
export async function inDerNaehe(id: number, lat: number, lon: number, radiusKm = 20, limit = 8) {
  const rows = await umkreis(lat, lon, radiusKm, limit + 1);
  return rows.filter((r) => r.id !== id).slice(0, limit);
}

/** Slugs für generateStaticParams / Sitemaps. */
export const alleSlugs = (tabelle: "parkplatz" | "bundesland" | "kreis" | "ort", limit?: number) =>
  q<{ slug: string; aktualisiert?: Date }>(
    `SELECT slug${tabelle === "parkplatz" ? ", aktualisiert" : ""} FROM ${tabelle}
     ${tabelle === "parkplatz" ? "WHERE aktiv" : "WHERE poi_count > 0"}
     ORDER BY ${tabelle === "parkplatz" ? "daten_score DESC, id" : "poi_count DESC, id"}
     ${limit ? `LIMIT ${Number(limit)}` : ""}`,
  );

export interface Suchtreffer {
  typ: "parkplatz" | "ort" | "kreis" | "bundesland";
  slug: string;
  titel: string;
  untertitel: string | null;
  score: number;
}

export const PFAD: Record<Suchtreffer["typ"], string> = {
  parkplatz: "/wanderparkplatz",
  ort: "/ort",
  kreis: "/kreis",
  bundesland: "/bundesland",
};

/**
 * Tippfehlertolerante Suche über alle Seitentypen.
 *
 * word_similarity statt similarity: such_text enthält Name, Ort, Kreis und
 * Bundesland, gegen diesen langen String bliebe die Ähnlichkeit einer kurzen
 * Eingabe immer unter der Schwelle. word_similarity vergleicht gegen die am
 * besten passende Wortfolge im Text. Die LIKE-Zweige sichern zusätzlich
 * Präfixeingaben, für die die Schwelle ebenfalls nicht greift.
 */
export function suche(begriff: string, limit = 10) {
  // Lokale Variable bewusst nicht "q" — das ist der Query-Helfer oben.
  const term = begriff.trim();
  return q<Suchtreffer>(
    `SELECT * FROM (
       SELECT typ, slug, titel, untertitel, gewicht,
              GREATEST(
                word_similarity($1, such_text),
                CASE WHEN such_text LIKE $2 THEN 0.98 ELSE 0 END,
                CASE WHEN such_text LIKE $3 THEN 0.85 ELSE 0 END
              ) AS score
         FROM suchindex
        WHERE $1 <% such_text
           OR such_text LIKE $2
           OR such_text LIKE $3
     ) t
      WHERE score >= ${AEHNLICHKEIT}
      ORDER BY score DESC, gewicht DESC, titel
      LIMIT $4`,
    [term, `${term}%`, `% ${term}%`, limit],
  );
}

export interface Standort {
  typ: "ort" | "plz";
  name: string;
  zusatz: string | null;
  lat: number;
  lon: number;
  score: number;
}

/**
 * Geocoder für die Standorteingabe. Reine Ziffernfolgen sind Postleitzahlen —
 * dort zählt der Präfix, nicht die Ähnlichkeit: "790" soll 79098 finden,
 * aber nicht das ähnlich geschriebene 79908.
 */
export function standorte(begriff: string, limit = 8) {
  const term = begriff.trim();
  const istZiffern = /^\d+$/.test(term);
  if (istZiffern) {
    return q<Standort>(
      `SELECT typ, name, zusatz, lat, lon, 1.0 AS score
         FROM standort
        WHERE typ = 'plz' AND name LIKE $1
        ORDER BY name
        LIMIT $2`,
      [`${term}%`, limit],
    );
  }
  return q<Standort>(
    `SELECT * FROM (
       SELECT typ, name, zusatz, lat, lon, gewicht,
              GREATEST(
                word_similarity($1, such_text),
                CASE WHEN such_text LIKE $2 THEN 0.98 ELSE 0 END,
                CASE WHEN such_text LIKE $3 THEN 0.85 ELSE 0 END
              ) AS score
         FROM standort
        WHERE typ = 'ort'
          AND ($1 <% such_text OR such_text LIKE $2 OR such_text LIKE $3)
     ) t
      WHERE score >= ${AEHNLICHKEIT}
      ORDER BY score DESC, gewicht DESC, name
      LIMIT $4`,
    [term, `${term}%`, `% ${term}%`, limit],
  );
}

export interface TrailAmPlatz {
  name: string;
  slug: string;
  eigene_seite: boolean;
  netz: string | null;
  ref: string | null;
  markierung: string | null;
  laenge_km: string | null;
  distanz_m: number;
}

export const trailsAmPlatz = cache((parkplatzId: number) =>
  q<TrailAmPlatz>(
    `SELECT t.name, t.slug, t.eigene_seite, t.netz, t.ref, t.markierung, t.laenge_km, pt.distanz_m
       FROM parkplatz_trail pt JOIN trail t ON t.id = pt.trail_id
      WHERE pt.parkplatz_id = $1
      ORDER BY
        CASE t.netz WHEN 'iwn' THEN 1 WHEN 'nwn' THEN 2 WHEN 'rwn' THEN 3 ELSE 4 END,
        pt.distanz_m,
        t.name`,
    [parkplatzId],
  ),
);


// ------------------------------------------------------- Wanderregionen
/** Bbox-Vorfilter plus exakte Distanz, als Textbaustein wiederverwendet. */
const IM_UMKREIS = (lat: string, lon: string, r: string) => `
  p.aktiv
  AND p.lat BETWEEN ${lat} - (${r} / 111.32) AND ${lat} + (${r} / 111.32)
  AND p.lon BETWEEN ${lon} - (${r} / (111.32 * cos(radians(${lat}))))
                AND ${lon} + (${r} / (111.32 * cos(radians(${lat}))))
  AND 6371 * acos(LEAST(1, GREATEST(-1,
        cos(radians(${lat})) * cos(radians(p.lat)) * cos(radians(p.lon) - radians(${lon}))
        + sin(radians(${lat})) * sin(radians(p.lat))))) <= ${r}`;

export interface RegionBestand {
  slug: string;
  n: number;
  kostenfrei: number;
}

/**
 * Bestand aller Regionen in einer Abfrage. Einzeln abgefragt wären das
 * dreißig Rundläufe zur Datenbank — auf der Startseite spürbar.
 */
export function regionBestaende(
  regionen: { slug: string; lat: number; lon: number; radiusKm: number }[],
) {
  const werte = regionen
    .map((r, i) => `($${i * 4 + 1}, $${i * 4 + 2}::float8, $${i * 4 + 3}::float8, $${i * 4 + 4}::float8)`)
    .join(",");
  const params = regionen.flatMap((r) => [r.slug, r.lat, r.lon, r.radiusKm]);
  return q<RegionBestand>(
    `WITH g(slug, lat, lon, r) AS (VALUES ${werte})
     SELECT g.slug,
            count(p.id)::int                              AS n,
            count(p.id) FILTER (WHERE p.gebuehr = false)::int AS kostenfrei
       FROM g
       LEFT JOIN parkplatz p ON ${IM_UMKREIS("g.lat", "g.lon", "g.r")}
      GROUP BY g.slug`,
    params,
  );
}

/** Parkplätze einer Region, die am besten belegten zuerst. */
export const parkplaetzeInRegion = (lat: number, lon: number, radiusKm: number, limit = 120) =>
  q<Parkplatz>(
    `${SELECT_PARKPLATZ} WHERE ${IM_UMKREIS("$1", "$2", "$3")}
     ORDER BY p.daten_score DESC, p.name
     LIMIT $4`,
    [lat, lon, radiusKm, limit],
  );

/** Landkreise mit Bestand innerhalb einer Region — für die Binnenverlinkung. */
export const kreiseInRegion = (lat: number, lon: number, radiusKm: number, limit = 12) =>
  q<{ slug: string; name: string; typ: string | null; poi_count: number }>(
    `SELECT k.slug, k.name, k.typ, count(p.id)::int AS poi_count
       FROM parkplatz p JOIN kreis k ON k.id = p.kreis_id
      WHERE ${IM_UMKREIS("$1", "$2", "$3")}
      GROUP BY k.slug, k.name, k.typ
      ORDER BY count(p.id) DESC
      LIMIT $4`,
    [lat, lon, radiusKm, limit],
  );

/** Auffälligste Plätze für die Startseite: die größten mit Stellplatzangabe. */
export const groessteParkplaetze = (limit = 8) =>
  q<Parkplatz>(
    `${SELECT_PARKPLATZ} WHERE p.aktiv AND p.stellplaetze IS NOT NULL
     ORDER BY p.stellplaetze DESC LIMIT $1`,
    [limit],
  );

export interface UmfeldEintrag {
  kategorie: string;
  name: string | null;
  distanz_m: number;
}

/** Was in Laufweite des Parkplatzes liegt, nach Kategorie gebündelt. */
export const umfeldAmPlatz = cache((parkplatzId: number) =>
  q<UmfeldEintrag>(
    `SELECT kategorie, name, distanz_m
       FROM parkplatz_nearby
      WHERE parkplatz_id = $1
      ORDER BY kategorie, distanz_m`,
    [parkplatzId],
  ),
);

// -------------------------------------------------------- Wanderwege
export interface Trail {
  id: number;
  osm_id: string;
  slug: string;
  name: string;
  netz: string | null;
  ref: string | null;
  markierung: string | null;
  laenge_km: string | null;
  parkplatz_count: number;
}

export const trailBySlug = cache((slug: string) =>
  one<Trail>(
    `SELECT id, osm_id, slug, name, netz, ref, markierung, laenge_km, parkplatz_count
       FROM trail WHERE slug = $1 AND eigene_seite`,
    [slug],
  ),
);

/** Parkplätze am Weg, die inhaltsreichsten zuerst. */
export const parkplaetzeAmTrail = (trailId: number, limit = 150) =>
  q<Parkplatz & { distanz_m: number }>(
    `${selectParkplatz("pt.distanz_m")}
     JOIN parkplatz_trail pt ON pt.parkplatz_id = p.id
     WHERE pt.trail_id = $1 AND p.aktiv
     ORDER BY p.aussagen DESC, pt.distanz_m, p.name
     LIMIT $2`,
    [trailId, limit],
  );

/** Landkreise, die der Weg berührt — für die Binnenverlinkung. */
export const kreiseAmTrail = (trailId: number, limit = 10) =>
  q<{ slug: string; name: string; typ: string | null; poi_count: number }>(
    `SELECT k.slug, k.name, k.typ, count(*)::int AS poi_count
       FROM parkplatz_trail pt
       JOIN parkplatz p ON p.id = pt.parkplatz_id AND p.aktiv
       JOIN kreis k ON k.id = p.kreis_id
      WHERE pt.trail_id = $1
      GROUP BY k.slug, k.name, k.typ
      ORDER BY count(*) DESC, k.name
      LIMIT $2`,
    [trailId, limit],
  );

/** Wege mit eigener Seite, für Übersicht, Sitemap und Vorrendern. */
export const trailSeiten = (limit?: number) =>
  q<Trail>(
    `SELECT id, osm_id, slug, name, netz, ref, markierung, laenge_km, parkplatz_count
       FROM trail WHERE eigene_seite
      ORDER BY CASE netz WHEN 'iwn' THEN 1 WHEN 'nwn' THEN 2 WHEN 'rwn' THEN 3 ELSE 4 END,
               parkplatz_count DESC, name
      ${limit ? `LIMIT ${Number(limit)}` : ""}`,
  );

/** Weitere Wege an denselben Parkplätzen — thematisch nächstliegende Nachbarn. */
export const verwandteTrails = (trailId: number, limit = 8) =>
  q<Trail>(
    `SELECT DISTINCT t.id, t.osm_id, t.slug, t.name, t.netz, t.ref, t.markierung,
            t.laenge_km, t.parkplatz_count
       FROM parkplatz_trail a
       JOIN parkplatz_trail b ON b.parkplatz_id = a.parkplatz_id AND b.trail_id <> a.trail_id
       JOIN trail t ON t.id = b.trail_id
      WHERE a.trail_id = $1 AND t.eigene_seite
      ORDER BY t.parkplatz_count DESC, t.name
      LIMIT $2`,
    [trailId, limit],
  );

// ------------------------------------------------------------- Ziele
export interface Ziel {
  id: number;
  slug: string;
  name: string;
  art: string;
  hoehe_m: number | null;
  lat: number;
  lon: number;
  parkplatz_count: number;
  bl_name?: string | null;
  bl_slug?: string | null;
}

export const zielBySlug = cache((slug: string) =>
  one<Ziel>(
    `SELECT z.id, z.slug, z.name, z.art, z.hoehe_m, z.lat, z.lon, z.parkplatz_count,
            b.name AS bl_name, b.slug AS bl_slug
       FROM ziel z LEFT JOIN bundesland b ON b.id = z.bundesland_id
      WHERE z.slug = $1 AND z.eigene_seite`,
    [slug],
  ),
);

/** Parkplätze am Ziel, die nächstgelegenen zuerst. */
export const parkplaetzeAmZiel = (zielId: number, limit = 40) =>
  q<Parkplatz & { distanz_m: number }>(
    `${selectParkplatz("pz.distanz_m")}
     JOIN parkplatz_ziel pz ON pz.parkplatz_id = p.id
     WHERE pz.ziel_id = $1 AND p.aktiv
     ORDER BY pz.distanz_m, p.aussagen DESC
     LIMIT $2`,
    [zielId, limit],
  );

/** Ziele in Reichweite eines Parkplatzes — für den Block auf der Detailseite. */
export const zieleAmPlatz = cache((parkplatzId: number, limit = 8) =>
  q<Ziel & { distanz_m: number; eigene_seite: boolean }>(
    `SELECT z.id, z.slug, z.name, z.art, z.hoehe_m, z.lat, z.lon,
            z.parkplatz_count, z.eigene_seite, pz.distanz_m
       FROM parkplatz_ziel pz JOIN ziel z ON z.id = pz.ziel_id
      WHERE pz.parkplatz_id = $1
      ORDER BY pz.distanz_m
      LIMIT $2`,
    [parkplatzId, limit],
  ),
);

export const zielSeiten = (limit?: number) =>
  q<Ziel>(
    `SELECT z.id, z.slug, z.name, z.art, z.hoehe_m, z.lat, z.lon, z.parkplatz_count,
            b.name AS bl_name, b.slug AS bl_slug
       FROM ziel z LEFT JOIN bundesland b ON b.id = z.bundesland_id
      WHERE z.eigene_seite
      ORDER BY z.parkplatz_count DESC, z.hoehe_m DESC NULLS LAST, z.name
      ${limit ? `LIMIT ${Number(limit)}` : ""}`,
  );

/** Weitere Ziele in der Umgebung — über gemeinsame Parkplätze verknüpft. */
export const nahegelegeneZiele = (zielId: number, limit = 8) =>
  q<Ziel>(
    `SELECT DISTINCT z.id, z.slug, z.name, z.art, z.hoehe_m, z.lat, z.lon, z.parkplatz_count
       FROM parkplatz_ziel a
       JOIN parkplatz_ziel b ON b.parkplatz_id = a.parkplatz_id AND b.ziel_id <> a.ziel_id
       JOIN ziel z ON z.id = b.ziel_id
      WHERE a.ziel_id = $1 AND z.eigene_seite
      ORDER BY z.parkplatz_count DESC, z.name
      LIMIT $2`,
    [zielId, limit],
  );
