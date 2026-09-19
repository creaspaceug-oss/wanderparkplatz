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

/*
 * Ähnlichkeitsschwelle der Suche. Die Vorgabe von word_similarity ist 0.6 und
 * damit zu streng für Eingaben ohne Umlaut: "koeln" findet bei 0.6 noch drei
 * Einträge, bei 0.42 dreiundvierzig; "schwaebisch" 26 gegenüber 221.
 *
 * Hier stand als Begründung das Beispiel "abtskuche". Das trägt nicht — der
 * Wert liegt dort bei 0.615 und damit über beiden Schwellen, der Eintrag wird
 * also ohnehin gefunden. Die obigen Zahlen sind gemessen.
 *
 * Sie gilt für den Operator <% in der WHERE-Klausel. Ohne ihn ginge auch der
 * GIN-Index verloren: word_similarity() ausgeschrieben kostet bei standort
 * 177 statt 20 Millisekunden, und das ist die Abfrage hinter der
 * Vervollständigung im Standortfeld.
 *
 * Gesetzt wird sie je Verbindung, siehe mitSchwelle() weiter unten.
 */
export const AEHNLICHKEIT = 0.42;
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

/**
 * Verbindungen, auf denen die Suchschwelle schon gesetzt ist.
 *
 * Der Wert gehört zur Verbindung, nicht zur Abfrage. Hier stand dafür ein
 * Handler auf "connect", der das SET absetzte, ohne es abzuwarten. Die
 * Reihenfolge stimmte dabei — pg reiht Abfragen einer Verbindung ein, das SET
 * war zuerst dran —, aber die Bibliothek verwarnt zwei gleichzeitige Aufrufe
 * seit Version 8 und lehnt sie ab Version 9 ab.
 *
 * Als Vorgabe der Datenbank ginge es auch, aber nur mit Rechten, die der
 * Benutzer im automatischen Lauf nicht hat: ALTER DATABASE scheitert dort mit
 * 42501. Also einmal je Verbindung, abgewartet, vor der ersten Abfrage.
 *
 * Ein WeakSet: Der Pool verwirft eine ausgefallene Verbindung und ersetzt sie.
 * Die neue steht nicht darin und wird gesetzt, die alte wird eingesammelt.
 */
const geeicht = new WeakSet<object>();

async function mitSchwelle(sql: string, params: unknown[]) {
  const c = await pool.connect();
  try {
    if (!geeicht.has(c)) {
      await c.query(`SET pg_trgm.word_similarity_threshold = ${AEHNLICHKEIT}`);
      geeicht.add(c);
    }
    const res = await c.query(sql, params);
    c.release();
    return res;
  } catch (err) {
    // Wie pool.query: mit Fehler freigeben, damit eine kaputte Verbindung
    // verworfen und nicht weitergereicht wird.
    c.release(err as Error);
    throw err;
  }
}

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
      const res = await mitSchwelle(sql, params);
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
  typ: "parkplatz" | "ort" | "kreis" | "bundesland" | "region";
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
  region: "/region",
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
  wikidata: string | null;
  kreis_name: string | null;
  kreis_slug: string | null;
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
    `SELECT z.id, z.wikidata, z.slug, z.name, z.art, z.hoehe_m, z.lat, z.lon,
            z.parkplatz_count, b.name AS bl_name, b.slug AS bl_slug,
            k.name AS kreis_name, k.slug AS kreis_slug
       FROM ziel z
       LEFT JOIN bundesland b ON b.id = z.bundesland_id
       LEFT JOIN kreis k      ON k.id = z.kreis_id
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

/**
 * Auswahl für die Startseite: die inhaltsreichsten Plätze, aber über die
 * Bundesländer gestreut.
 *
 * Ohne Streuung kämen fast alle aus Baden-Württemberg und Nordrhein-Westfalen,
 * wo der Bestand am dichtesten ist — die Seite sähe dann regional aus, obwohl
 * sie ganz Deutschland abdeckt.
 */
export const vorzeigeParkplaetze = (limit = 24) =>
  q<Parkplatz>(
    `SELECT * FROM (
       ${selectParkplatz("row_number() OVER (PARTITION BY p.bundesland_id ORDER BY p.aussagen DESC, p.id) AS rang")}
       WHERE p.aktiv AND p.name NOT LIKE 'Wanderparkplatz bei %'
     ) x
     WHERE rang <= 2
     ORDER BY rang, bl_name
     LIMIT $1`,
    [limit],
  );

export interface VorzeigePlatz extends Parkplatz {
  ziel_name: string;
  ziel_slug: string;
  ziel_distanz_m: number;
  bild_url: string;
  bild_lizenz: string | null;
  bild_lizenz_url: string | null;
  bild_urheber: string | null;
  bild_quelle: string;
}

/**
 * Bebilderte Auswahl für die Startseite.
 *
 * Von Parkplätzen selbst gibt es keine Fotos — gezeigt wird deshalb das
 * nächstgelegene Wanderziel mit Bild. Auf der Karte steht ausdrücklich dabei,
 * dass es das Ziel zeigt und nicht den Platz; alles andere führte in die Irre.
 *
 * Die Streuung über die Bundesländer bleibt: ohne sie käme die Auswahl fast
 * vollständig aus Baden-Württemberg und Nordrhein-Westfalen.
 */
export const vorzeigeMitBild = (proLand = 4, limit = 56) =>
  q<VorzeigePlatz>(
    `SELECT * FROM (
       SELECT p.*, o.name AS ort_name, o.slug AS ort_slug,
              k.name AS kreis_name, k.slug AS kreis_slug, k.typ AS kreis_typ,
              bl.name AS bl_name, bl.slug AS bl_slug,
              z.name AS ziel_name, z.slug AS ziel_slug, z.distanz_m AS ziel_distanz_m,
              z.url AS bild_url, z.lizenz AS bild_lizenz, z.lizenz_url AS bild_lizenz_url,
              z.urheber AS bild_urheber, z.quelle_url AS bild_quelle,
              row_number() OVER (PARTITION BY p.bundesland_id ORDER BY p.aussagen DESC, p.id) AS rang
         FROM parkplatz p
         LEFT JOIN ort o         ON o.id = p.ort_id
         LEFT JOIN kreis k       ON k.id = p.kreis_id
         LEFT JOIN bundesland bl ON bl.id = p.bundesland_id
         JOIN LATERAL (
           SELECT zi.name, zi.slug, pz.distanz_m,
                  b.url, b.lizenz, b.lizenz_url, b.urheber, b.quelle_url
             FROM parkplatz_ziel pz
             JOIN ziel zi ON zi.id = pz.ziel_id
             JOIN bild b  ON b.wikidata = zi.wikidata
            WHERE pz.parkplatz_id = p.id
            ORDER BY pz.distanz_m
            LIMIT 1
         ) z ON true
        WHERE p.aktiv AND p.name NOT LIKE 'Wanderparkplatz bei %'
     ) x
     WHERE rang <= $1
     ORDER BY rang, bl_name, name
     LIMIT $2`,
    [proLand, limit],
  );

// ------------------------------------------------- Anreicherung Ortsseiten
/**
 * 73 % der Ortsseiten haben genau einen Parkplatz und trugen damit rund 136
 * Wörter — sie wiederholten im Kern die Detailseite dieses einen Platzes.
 * Die folgenden Abfragen holen zusammen, was an den Parkplätzen eines Orts
 * hängt: Wanderwege, Umfeld und erreichbare Ziele.
 */

export interface OrtTrail {
  name: string;
  slug: string;
  eigene_seite: boolean;
  netz: string | null;
  ref: string | null;
  markierung: string | null;
  laenge_km: string | null;
  distanz_m: number;
}

/** Wanderwege an allen Parkplätzen des Orts, je Weg der nächste Abstand. */
/** Spalte, über die ein Parkplatz seiner Region zugeordnet ist. */
type Bezug = "ort_id" | "kreis_id" | "bundesland_id";

/**
 * Wanderwege, Umfeld und Ziele einer Region — gebaut je Bezugsspalte.
 *
 * Orts- und Kreisseiten brauchen dieselben drei Abfragen, nur mit einem
 * anderen Bezug des Parkplatzes. Die Spalte kommt aus dieser Datei, nie von
 * außen; sie wandert deshalb gefahrlos in den Abfragetext.
 */
const WEGE_SQL = (wo: string, lim: string) => `
  SELECT t.name, t.slug, t.eigene_seite, t.netz, t.ref, t.markierung, t.laenge_km,
         min(pt.distanz_m)::int AS distanz_m
    FROM parkplatz p
    JOIN parkplatz_trail pt ON pt.parkplatz_id = p.id
    JOIN trail t            ON t.id = pt.trail_id
   WHERE ${wo}
   GROUP BY t.id, t.name, t.slug, t.eigene_seite, t.netz, t.ref, t.markierung, t.laenge_km
   ORDER BY CASE t.netz WHEN 'iwn' THEN 1 WHEN 'nwn' THEN 2 WHEN 'rwn' THEN 3 ELSE 4 END,
            min(pt.distanz_m), t.name
   LIMIT ${lim}`;

const wegeInRegion = (spalte: Bezug) =>
  cache((id: number, limit = 12) =>
    q<OrtTrail>(WEGE_SQL(`p.${spalte} = $1 AND p.aktiv`, "$2"), [id, limit]),
  );

export const wanderwegeImOrt = wegeInRegion("ort_id");
export const wanderwegeImKreis = wegeInRegion("kreis_id");
export const wanderwegeImLand = wegeInRegion("bundesland_id");

/** Umfeld aller Parkplätze der Region, je Kategorie und Name der nächste Eintrag. */
// Spalten qualifizieren: parkplatz und parkplatz_nearby haben beide eine
// Spalte "name".
const UMFELD_SQL = (wo: string, lim: string) => `
  SELECT n.kategorie, n.name, min(n.distanz_m)::int AS distanz_m
    FROM parkplatz p
    JOIN parkplatz_nearby n ON n.parkplatz_id = p.id
   WHERE ${wo}
   GROUP BY n.kategorie, n.name
   ORDER BY n.kategorie, min(n.distanz_m)
   LIMIT ${lim}`;

const umfeldInRegion = (spalte: Bezug) =>
  cache((id: number, limit = 14) =>
    q<UmfeldEintrag>(UMFELD_SQL(`p.${spalte} = $1 AND p.aktiv`, "$2"), [id, limit]),
  );

export const umfeldImOrt = umfeldInRegion("ort_id");
export const umfeldImKreis = umfeldInRegion("kreis_id");
export const umfeldImLand = umfeldInRegion("bundesland_id");

export interface OrtZiel {
  name: string;
  slug: string;
  art: string;
  hoehe_m: number | null;
  eigene_seite: boolean;
  distanz_m: number;
}

/** Wanderziele, die von den Parkplätzen der Region aus erreichbar sind. */
// Ausgewählt wird nach Bekanntheit, angezeigt nach Entfernung — sonst springt
// die Liste von 4,9 km zurück auf 297 m, weil erst die bekannten und dann die
// unbekannten Ziele kämen.
const ZIELE_SQL = (wo: string, lim: string) => `
  SELECT name, slug, art, hoehe_m, eigene_seite, distanz_m FROM (
    SELECT z.name, z.slug, z.art, z.hoehe_m, z.eigene_seite, z.bekannt,
           min(pz.distanz_m)::int AS distanz_m
      FROM parkplatz p
      JOIN parkplatz_ziel pz ON pz.parkplatz_id = p.id
      JOIN ziel z            ON z.id = pz.ziel_id
     WHERE ${wo}
     GROUP BY z.id, z.name, z.slug, z.art, z.hoehe_m, z.eigene_seite, z.bekannt
     ORDER BY z.bekannt DESC, min(pz.distanz_m)
     LIMIT ${lim}
  ) x
  ORDER BY distanz_m`;

const zieleInRegion = (spalte: Bezug) =>
  cache((id: number, limit = 10) =>
    q<OrtZiel>(ZIELE_SQL(`p.${spalte} = $1 AND p.aktiv`, "$2"), [id, limit]),
  );

export const zieleImOrt = zieleInRegion("ort_id");
export const zieleImKreis = zieleInRegion("kreis_id");
export const zieleImLand = zieleInRegion("bundesland_id");

/*
 * Dieselben drei Abfragen für Wanderregionen.
 *
 * Eine Region ist keine Verwaltungseinheit, sondern Mittelpunkt und Radius —
 * es gibt keine Spalte, über die ein Parkplatz ihr zugeordnet wäre. Nur das
 * WHERE unterscheidet sich, der Rest ist derselbe Abfragetext.
 */
export const wanderwegeImUmkreis = cache(
  (lat: number, lon: number, radiusKm: number, limit = 14) =>
    q<OrtTrail>(WEGE_SQL(IM_UMKREIS("$1", "$2", "$3"), "$4"), [lat, lon, radiusKm, limit]),
);

export const zieleImUmkreis = cache(
  (lat: number, lon: number, radiusKm: number, limit = 12) =>
    q<OrtZiel>(ZIELE_SQL(IM_UMKREIS("$1", "$2", "$3"), "$4"), [lat, lon, radiusKm, limit]),
);

export const umfeldImUmkreis = cache(
  (lat: number, lon: number, radiusKm: number, limit = 14) =>
    q<UmfeldEintrag>(UMFELD_SQL(IM_UMKREIS("$1", "$2", "$3"), "$4"), [lat, lon, radiusKm, limit]),
);

/** Die Anbindungszahl einer Wanderregion — wie oepnvFuerRegion, nur geografisch. */
export const oepnvImUmkreis = cache(
  async (lat: number, lon: number, radiusKm: number) =>
    (
      await q<{ plaetze: number; mit: number; prozent: string; median: number | null }>(
        `WITH n AS (
           SELECT p.id, min(x.distanz_m) AS m
             FROM parkplatz p
             LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id AND x.kategorie = 'oepnv'
            WHERE ${IM_UMKREIS("$1", "$2", "$3")}
            GROUP BY p.id)
         SELECT count(*)::int AS plaetze, count(m)::int AS mit,
                round(100.0 * count(m) / NULLIF(count(*), 0), 0)::text AS prozent,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY m)::int AS median
           FROM n`,
        [lat, lon, radiusKm],
      )
    )[0],
);

// ------------------------------ Ziel ↔ Wanderweg, über gemeinsame Parkplätze
//
// Beide Seitentypen sind für sich dünn: eine Zielseite kam auf 177 Wörter,
// eine Wegseite auf 192. Die Substanz lag längst in der Datenbank, nur nicht
// auf der Seite — wer an einem Gipfel parkt, steht meist auch an einem
// markierten Weg, und umgekehrt. Die Verknüpfung läuft über den Parkplatz,
// der beide kennt. Kein zusätzlicher Abruf nötig.

/** Markierte Wege, die an den Parkplätzen dieses Ziels vorbeiführen. */
export const wegeZumZiel = cache((zielId: number, limit = 12) =>
  q<OrtTrail>(
    `SELECT t.name, t.slug, t.eigene_seite, t.netz, t.ref, t.markierung, t.laenge_km,
            min(pt.distanz_m)::int AS distanz_m
       FROM parkplatz_ziel pz
       JOIN parkplatz p        ON p.id = pz.parkplatz_id AND p.aktiv
       JOIN parkplatz_trail pt ON pt.parkplatz_id = p.id
       JOIN trail t            ON t.id = pt.trail_id
      WHERE pz.ziel_id = $1
      GROUP BY t.id, t.name, t.slug, t.eigene_seite, t.netz, t.ref, t.markierung, t.laenge_km
      ORDER BY CASE t.netz WHEN 'iwn' THEN 1 WHEN 'nwn' THEN 2 WHEN 'rwn' THEN 3 ELSE 4 END,
               min(pt.distanz_m), t.name
      LIMIT $2`,
    [zielId, limit],
  ),
);

/** Umfeld aller Parkplätze am Ziel, je Kategorie und Name der nächste Eintrag. */
export const umfeldAmZiel = cache((zielId: number, limit = 14) =>
  q<UmfeldEintrag>(
    // Spalten qualifizieren: parkplatz und parkplatz_nearby haben beide
    // eine Spalte "name".
    `SELECT n.kategorie, n.name, min(n.distanz_m)::int AS distanz_m
       FROM parkplatz_ziel pz
       JOIN parkplatz p        ON p.id = pz.parkplatz_id AND p.aktiv
       JOIN parkplatz_nearby n ON n.parkplatz_id = p.id
      WHERE pz.ziel_id = $1
      GROUP BY n.kategorie, n.name
      ORDER BY n.kategorie, min(n.distanz_m)
      LIMIT $2`,
    [zielId, limit],
  ),
);

/** Wanderziele, die von den Parkplätzen am Weg aus erreichbar sind. */
export const zieleAmTrail = cache((trailId: number, limit = 12) =>
  q<OrtZiel>(
    // Ausgewählt wird nach Bekanntheit, angezeigt nach Entfernung — sonst
    // stünden erst die bekannten und dann die nahen Ziele, und die Liste
    // spränge in der Entfernung hin und her.
    `SELECT name, slug, art, hoehe_m, eigene_seite, distanz_m FROM (
       SELECT z.name, z.slug, z.art, z.hoehe_m, z.eigene_seite, z.bekannt,
              min(pz.distanz_m)::int AS distanz_m
         FROM parkplatz_trail pt
         JOIN parkplatz p       ON p.id = pt.parkplatz_id AND p.aktiv
         JOIN parkplatz_ziel pz ON pz.parkplatz_id = p.id
         JOIN ziel z            ON z.id = pz.ziel_id
        WHERE pt.trail_id = $1
        GROUP BY z.id, z.name, z.slug, z.art, z.hoehe_m, z.eigene_seite, z.bekannt
        ORDER BY z.bekannt DESC, min(pz.distanz_m)
        LIMIT $2
     ) x
     ORDER BY distanz_m`,
    [trailId, limit],
  ),
);

/** Orte, in denen Parkplätze dieses Wegs liegen. */
export const orteAmTrail = (trailId: number, limit = 12) =>
  q<{ slug: string; name: string; poi_count: number }>(
    `SELECT o.slug, o.name, count(*)::int AS poi_count
       FROM parkplatz_trail pt
       JOIN parkplatz p ON p.id = pt.parkplatz_id AND p.aktiv
       JOIN ort o       ON o.id = p.ort_id
      WHERE pt.trail_id = $1
      GROUP BY o.slug, o.name
      ORDER BY count(*) DESC, o.name
      LIMIT $2`,
    [trailId, limit],
  );

export interface PlatzBild {
  url: string;
  breite: number;
  hoehe: number;
  lizenz: string | null;
  lizenz_url: string | null;
  urheber: string | null;
  quelle_url: string;
  ziel_name: string;
  ziel_slug: string;
  ziel_distanz_m: number;
}

/**
 * Bild für eine Parkplatzseite — das nächstgelegene bebilderte Wanderziel.
 *
 * Von Parkplätzen selbst gibt es praktisch keine Fotos, von den Zielen
 * dahinter schon. Zwei Drittel der indexierbaren Plätze haben eines in
 * Reichweite. Die Beschriftung muss sagen, was zu sehen ist: Ein Gipfelfoto
 * über einer Parkplatzseite wäre sonst schlicht irreführend.
 */
export const bildZumPlatz = cache((parkplatzId: number) =>
  one<PlatzBild>(
    `SELECT b.url, b.breite, b.hoehe, b.lizenz, b.lizenz_url, b.urheber, b.quelle_url,
            z.name AS ziel_name, z.slug AS ziel_slug, pz.distanz_m AS ziel_distanz_m
       FROM parkplatz_ziel pz
       JOIN ziel z ON z.id = pz.ziel_id
       JOIN bild b ON b.wikidata = z.wikidata
      WHERE pz.parkplatz_id = $1
      ORDER BY pz.distanz_m
      LIMIT 1`,
    [parkplatzId],
  ),
);

/**
 * Blätterbare Vollverzeichnisse für Ziele und Wege.
 *
 * Die Übersichtsseiten zeigen je Gruppe nur die stärksten Einträge — /ziele
 * verlinkte so 767 von 7.062 Zielen, /wanderwege 464 von 1.634. Der Rest war
 * intern überhaupt nicht verlinkt und nur über die Sitemap auffindbar.
 *
 * Sortiert wird nach Namen, nicht nach Bestand: Eine blätterbare Liste muss
 * stabil bleiben, sonst wandern Einträge bei jedem Import zwischen den
 * Seiten hin und her.
 */
export const zieleBlatt = cache((versatz: number, anzahl: number) =>
  q<Ziel & { bl_name: string | null }>(
    `SELECT z.id, z.slug, z.name, z.art, z.hoehe_m, z.lat, z.lon, z.parkplatz_count,
            b.name AS bl_name
       FROM ziel z LEFT JOIN bundesland b ON b.id = z.bundesland_id
      WHERE z.eigene_seite
      ORDER BY z.name, z.id
      LIMIT $2 OFFSET $1`,
    [versatz, anzahl],
  ),
);

export const wegeBlatt = cache((versatz: number, anzahl: number) =>
  q<Trail>(
    `SELECT id, osm_id, slug, name, netz, ref, markierung, laenge_km, parkplatz_count
       FROM trail WHERE eigene_seite
      ORDER BY name, id
      LIMIT $2 OFFSET $1`,
    [versatz, anzahl],
  ),
);

export const anzahlZiele = cache(async () =>
  (await q<{ n: number }>("SELECT count(*)::int AS n FROM ziel WHERE eigene_seite"))[0].n,
);

export const anzahlWege = cache(async () =>
  (await q<{ n: number }>("SELECT count(*)::int AS n FROM trail WHERE eigene_seite"))[0].n,
);

/** Umfeld aller Parkplätze an einem Weg, je Kategorie und Name der nächste Eintrag. */
export const umfeldAmTrail = cache((trailId: number, limit = 14) =>
  q<UmfeldEintrag>(
    // Spalten qualifizieren: parkplatz und parkplatz_nearby haben beide
    // eine Spalte "name".
    `SELECT n.kategorie, n.name, min(n.distanz_m)::int AS distanz_m
       FROM parkplatz_trail pt
       JOIN parkplatz p        ON p.id = pt.parkplatz_id AND p.aktiv
       JOIN parkplatz_nearby n ON n.parkplatz_id = p.id
      WHERE pt.trail_id = $1
      GROUP BY n.kategorie, n.name
      ORDER BY n.kategorie, min(n.distanz_m)
      LIMIT $2`,
    [trailId, limit],
  ),
);

// --------------------------------------------- Auswertung: Anbindung an ÖPNV
//
// Grundlage ist parkplatz_nearby mit der Kategorie "oepnv". Erfasst werden
// dort Haltestellen im Umkreis von 1.000 Metern um den Parkplatz; je Platz
// zählt die nächstgelegene. Ein LEFT JOIN ist Absicht — Plätze ohne jede
// Haltestelle sind der halbe Befund und dürfen nicht herausfallen.

const NAECHSTES_UMFELD = (kategorie: string) => `
  SELECT p.id, p.bundesland_id, p.kreis_id, min(x.distanz_m) AS m
    FROM parkplatz p
    LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id AND x.kategorie = '${kategorie}'
   WHERE p.aktiv
   GROUP BY p.id, p.bundesland_id, p.kreis_id`;

const NAECHSTE_HALTESTELLE = NAECHSTES_UMFELD("oepnv");

// ------------------------------------------------- Toiletten am Parkplatz
//
// Dieselbe Mechanik wie oben, andere Kategorie — und ein wichtiger
// Unterschied im Suchradius: Haltestellen zählen bis 1.000 Meter, Toiletten
// nur bis 500. Zu einem Klo geht man keinen Kilometer.
const NAECHSTE_TOILETTE = NAECHSTES_UMFELD("wc");

export interface WcGesamt {
  plaetze: number;
  mit: number;
  prozent: string;
  median: number;
  b50: number;
  b150: number;
  ohne_alles: number;
}

export const wcGesamt = cache(
  async (): Promise<WcGesamt> =>
    (
      await q<WcGesamt>(
        `WITH n AS (${NAECHSTE_TOILETTE})
         SELECT count(*)::int AS plaetze,
                count(m)::int AS mit,
                round(100.0 * count(m) / count(*), 1)::text AS prozent,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY m)::int AS median,
                count(*) FILTER (WHERE m <= 50)::int  AS b50,
                count(*) FILTER (WHERE m <= 150)::int AS b150,
                -- Weder Toilette noch Gaststätte: der Fall, um den es geht.
                --
                -- coalesce ist nötig: Bei einem Platz ganz ohne Umfeldeintrag
                -- liefert der LEFT JOIN eine Zeile voller NULL, bool_or darüber
                -- ergibt NULL, und "NOT NULL" ist wieder NULL — der Platz fiele
                -- aus der Zählung, obwohl er der Musterfall ist.
                (SELECT count(*)::int FROM (
                   SELECT p.id
                     FROM parkplatz p
                     LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id
                    WHERE p.aktiv
                    GROUP BY p.id
                   HAVING NOT coalesce(bool_or(x.kategorie IN ('wc', 'einkehr')), false)) z
                ) AS ohne_alles
           FROM n`,
      )
    )[0],
);

/**
 * Die Einträge selbst, nicht die Plätze.
 *
 * Für die Einordnung der Datenqualität: Ein Eintrag ohne Namen ist ein
 * gesetzter Punkt und sonst nichts. Der Anteil sagt, wie beiläufig diese
 * Kategorie kartiert wird — im Text steht das als Einschränkung, und fest
 * eingetragen veraltete es mit dem nächsten Abgleich.
 */
export const wcEintraege = cache(
  async () =>
    (
      await q<{ gesamt: number; ohne_namen: number }>(
        `SELECT count(*)::int AS gesamt,
                count(*) FILTER (WHERE x.name IS NULL)::int AS ohne_namen
           FROM parkplatz_nearby x
           JOIN parkplatz p ON p.id = x.parkplatz_id AND p.aktiv
          WHERE x.kategorie = 'wc'`,
      )
    )[0],
);

export interface WcRegion {
  name: string;
  slug: string;
  plaetze: number;
  mit: number;
  prozent: string;
  median: number | null;
}

const wcNachBezug = (tabelle: "bundesland" | "kreis", spalte: string) =>
  cache((mindestens = 1) =>
    q<WcRegion>(
      `WITH n AS (${NAECHSTE_TOILETTE})
       SELECT r.name, r.slug, count(*)::int AS plaetze, count(n.m)::int AS mit,
              round(100.0 * count(n.m) / count(*), 1)::text AS prozent,
              percentile_cont(0.5) WITHIN GROUP (ORDER BY n.m)::int AS median
         FROM n JOIN ${tabelle} r ON r.id = n.${spalte}
        GROUP BY r.name, r.slug
       HAVING count(*) >= $1
        ORDER BY count(n.m)::numeric / count(*) DESC, count(*) DESC`,
      [mindestens],
    ),
  );

export const wcNachLand = wcNachBezug("bundesland", "bundesland_id");
export const wcNachKreis = wcNachBezug("kreis", "kreis_id");

/**
 * Anteil nach Größe des Platzes.
 *
 * Der Kern der Auswertung — und bewusst nur auf Plätzen mit Stellplatzangabe
 * gerechnet. Das ist zugleich die Gegenprobe: Wer die Stellplätze gezählt
 * hat, hat den Platz genau angesehen. Der Anstieg über die Größenklassen
 * lässt sich damit nicht allein als Kartierungsfleiß wegerklären.
 */
export const wcNachGroesse = cache(() =>
  q<{ klasse: string; ab: number; plaetze: number; mit: number; prozent: string }>(
    `WITH n AS (
       SELECT p.id, p.stellplaetze, min(x.distanz_m) AS m
         FROM parkplatz p
         LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id AND x.kategorie = 'wc'
        WHERE p.aktiv AND p.stellplaetze IS NOT NULL
        GROUP BY p.id, p.stellplaetze)
     SELECT CASE WHEN stellplaetze < 10 THEN 'unter 10'
                 WHEN stellplaetze < 25 THEN '10 bis 24'
                 WHEN stellplaetze < 50 THEN '25 bis 49'
                 WHEN stellplaetze < 100 THEN '50 bis 99'
                 ELSE '100 und mehr' END AS klasse,
            min(stellplaetze)::int AS ab,
            count(*)::int AS plaetze, count(m)::int AS mit,
            round(100.0 * count(m) / count(*), 1)::text AS prozent
       FROM n GROUP BY 1 ORDER BY min(stellplaetze)`,
  ),
);

/** Anteil mit Toilette, aufgeteilt danach, was sonst in der Nähe liegt. */
export const wcNachNachbarschaft = cache(() =>
  q<{ merkmal: string; ohne: string; mit_merkmal: string }>(
    `WITH f AS (
       SELECT p.id,
              bool_or(x.kategorie = 'wc')       AS wc,
              bool_or(x.kategorie = 'einkehr')  AS einkehr,
              bool_or(x.kategorie = 'aussicht') AS aussicht
         FROM parkplatz p
         LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id
        WHERE p.aktiv
        GROUP BY p.id)
     SELECT 'Gaststätte in der Nähe' AS merkmal,
            round(100.0 * count(*) FILTER (WHERE wc AND NOT coalesce(einkehr,false))
                  / NULLIF(count(*) FILTER (WHERE NOT coalesce(einkehr,false)),0), 1)::text AS ohne,
            round(100.0 * count(*) FILTER (WHERE wc AND einkehr)
                  / NULLIF(count(*) FILTER (WHERE einkehr),0), 1)::text AS mit_merkmal
       FROM f
     UNION ALL
     SELECT 'Aussichtspunkt in der Nähe',
            round(100.0 * count(*) FILTER (WHERE wc AND NOT coalesce(aussicht,false))
                  / NULLIF(count(*) FILTER (WHERE NOT coalesce(aussicht,false)),0), 1)::text,
            round(100.0 * count(*) FILTER (WHERE wc AND aussicht)
                  / NULLIF(count(*) FILTER (WHERE aussicht),0), 1)::text
       FROM f`,
  ),
);

export interface UmfeldPlatz {
  name: string;
  slug: string;
  kreis: string;
  kreis_slug: string;
  land: string;
  distanz_m: number;
  /** Name des Eintrags, zu dem die Entfernung gilt — bei Toiletten meist leer. */
  zusatz: string | null;
}

/**
 * Plätze mit einem Eintrag dieser Kategorie in Reichweite — die eigentlich
 * brauchbare Liste.
 *
 * Je Platz der nächstgelegene Eintrag, samt dessen Namen: Bei Haltestellen
 * ist der fast immer gesetzt und die eigentliche Auskunft ("Forbach Bahnhof,
 * 40 m"), bei Toiletten fast nie. DISTINCT ON statt GROUP BY, weil der Name
 * aus derselben Zeile kommen muss wie das Minimum — ein min() über die
 * Entfernung und ein beliebiger Name daneben wären nicht zwingend derselbe
 * Eintrag.
 */
const plaetzeMitUmfeld = (kategorie: string) =>
  cache((maxM = 100000) =>
    q<UmfeldPlatz>(
      `SELECT * FROM (
         SELECT DISTINCT ON (p.id)
                p.name, p.slug, k.name AS kreis, k.slug AS kreis_slug,
                b.name AS land, x.distanz_m, x.name AS zusatz
           FROM parkplatz p
           JOIN parkplatz_nearby x ON x.parkplatz_id = p.id AND x.kategorie = '${kategorie}'
           LEFT JOIN kreis k      ON k.id = p.kreis_id
           LEFT JOIN bundesland b ON b.id = p.bundesland_id
          WHERE p.aktiv AND p.name IS NOT NULL AND x.distanz_m <= $1
          ORDER BY p.id, x.distanz_m
       ) z
       ORDER BY kreis, name`,
      [maxM],
    ),
  );

export const wcPlaetze = plaetzeMitUmfeld("wc");

/**
 * Wie viele Ausgangspunkte einen Gipfel in Reichweite haben.
 *
 * Für die Ausrüstungsseiten: Ob Stöcke etwas bringen, hängt am Höhenunterschied,
 * und der ist in Deutschland die Regel, nicht die Ausnahme. Eine Zahl aus dem
 * eigenen Bestand statt einer Behauptung.
 */
/**
 * Wo man am Ausgangspunkt nichts nachfüllen kann.
 *
 * Für die Trinkblasenseite: Gezählt wird, an wie vielen Wanderparkplätzen im
 * erfassten Umkreis keine Einkehr liegt — und wie viele davon trotzdem einen
 * Gipfel in Reichweite haben, also Aufstieg ohne Nachschub. Der Umkreis ist
 * der der Aufbereitung (UMFELD_MAX_M in pipeline/src/build.ts): 1.200 Meter.
 * Eine Einkehr unterwegs auf der Tour erfasst diese Zahl nicht; sie sagt
 * nur, was am Start fehlt.
 */
export const einkehrLuecke = cache(
  async () =>
    (
      await q<{ gesamt: number; ohne: number; gipfelOhne: number }>(
        `WITH e AS (
           SELECT p.id,
                  bool_or(x.kategorie = 'einkehr') AS einkehr,
                  EXISTS (SELECT 1 FROM parkplatz_ziel pz JOIN ziel z ON z.id = pz.ziel_id
                           WHERE pz.parkplatz_id = p.id AND z.art = 'gipfel') AS gipfel
             FROM parkplatz p
             LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id
            WHERE p.aktiv
            GROUP BY p.id)
         SELECT count(*)::int AS gesamt,
                count(*) FILTER (WHERE einkehr IS NOT TRUE)::int AS ohne,
                count(*) FILTER (WHERE einkehr IS NOT TRUE AND gipfel)::int AS "gipfelOhne"
           FROM e`,
      )
    )[0],
);

export const gipfelReichweite = cache(
  async () =>
    (
      await q<{ plaetze: number; gesamt: number }>(
        `SELECT (SELECT count(DISTINCT p.id)
                   FROM parkplatz p
                   JOIN parkplatz_ziel pz ON pz.parkplatz_id = p.id
                   JOIN ziel z            ON z.id = pz.ziel_id
                  WHERE p.aktiv AND z.art = 'gipfel')::int AS plaetze,
                (SELECT count(*) FROM parkplatz WHERE aktiv)::int AS gesamt`,
      )
    )[0],
);

/**
 * Plätze, an denen die Haltestelle praktisch danebensteht.
 *
 * Das Gegenstück zur Toilettenliste: Der Gesamtanteil beantwortet eine Frage
 * über Deutschland, diese Liste die Frage, mit der die meisten ankommen —
 * wohin komme ich ohne Auto, ohne einen Fußmarsch einzuplanen.
 */
export const oepnvNahePlaetze = plaetzeMitUmfeld("oepnv");

/** Kreise mit den meisten Plätzen ohne Toilette — absolut, nicht anteilig. */
export const wcLuecken = cache((limit = 10) =>
  q<{ name: string; slug: string; plaetze: number; ohne: number }>(
    `WITH n AS (${NAECHSTE_TOILETTE})
     SELECT k.name, k.slug, count(*)::int AS plaetze,
            count(*) FILTER (WHERE n.m IS NULL)::int AS ohne
       FROM n JOIN kreis k ON k.id = n.kreis_id
      GROUP BY k.name, k.slug
      ORDER BY count(*) FILTER (WHERE n.m IS NULL) DESC
      LIMIT $1`,
    [limit],
  ),
);

/** Die Zahl einer einzelnen Region, für den Hinweis auf Kreis- und Landseiten. */
export const wcFuerRegion = cache(
  async (spalte: "kreis_id" | "bundesland_id", id: number) =>
    (
      await q<{ plaetze: number; mit: number; prozent: string; median: number | null }>(
        `WITH n AS (
           SELECT p.id, min(x.distanz_m) AS m
             FROM parkplatz p
             LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id AND x.kategorie = 'wc'
            WHERE p.aktiv AND p.${spalte} = $1
            GROUP BY p.id)
         SELECT count(*)::int AS plaetze, count(m)::int AS mit,
                round(100.0 * count(m) / NULLIF(count(*), 0), 0)::text AS prozent,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY m)::int AS median
           FROM n`,
        [id],
      )
    )[0],
);

export interface OepnvGesamt {
  plaetze: number;
  mit: number;
  prozent: string;
  median: number;
  b300: number;
  b500: number;
  mit_bahnhof: number;
}

export const oepnvGesamt = cache(
  async (): Promise<OepnvGesamt> =>
    (
      await q<OepnvGesamt>(
        `WITH n AS (${NAECHSTE_HALTESTELLE})
         SELECT count(*)::int AS plaetze,
                count(m)::int AS mit,
                round(100.0 * count(m) / count(*), 1)::text AS prozent,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY m)::int AS median,
                count(*) FILTER (WHERE m <= 300)::int AS b300,
                count(*) FILTER (WHERE m <= 500)::int AS b500,
                (SELECT count(DISTINCT y.parkplatz_id)::int
                   FROM parkplatz_nearby y JOIN parkplatz p2 ON p2.id = y.parkplatz_id AND p2.aktiv
                  WHERE y.kategorie = 'oepnv' AND y.name ILIKE '%bahnhof%') AS mit_bahnhof
           FROM n`,
      )
    )[0],
);

export interface OepnvRegion {
  name: string;
  slug: string;
  plaetze: number;
  mit: number;
  prozent: string;
  median: number | null;
}

export const oepnvNachLand = cache(() =>
  q<OepnvRegion>(
    `WITH n AS (${NAECHSTE_HALTESTELLE})
     SELECT b.name, b.slug, count(*)::int AS plaetze, count(n.m)::int AS mit,
            round(100.0 * count(n.m) / count(*), 1)::text AS prozent,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY n.m)::int AS median
       FROM n JOIN bundesland b ON b.id = n.bundesland_id
      GROUP BY b.name, b.slug
      ORDER BY count(n.m)::numeric / count(*) DESC, count(*) DESC`,
  ),
);

/** Kreise ab einer Mindestzahl — unter fünf Plätzen ist ein Anteil Zufall. */
export const oepnvNachKreis = cache((mindestens = 5) =>
  q<OepnvRegion>(
    `WITH n AS (${NAECHSTE_HALTESTELLE})
     SELECT k.name, k.slug, count(*)::int AS plaetze, count(n.m)::int AS mit,
            round(100.0 * count(n.m) / count(*), 1)::text AS prozent,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY n.m)::int AS median
       FROM n JOIN kreis k ON k.id = n.kreis_id
      GROUP BY k.name, k.slug
     HAVING count(*) >= $1
      ORDER BY count(n.m)::numeric / count(*) DESC, count(*) DESC`,
    [mindestens],
  ),
);

/** Entfernungen in Körben zu je 200 Metern, für das Säulenbild. */
export const oepnvVerteilung = cache(() =>
  q<{ von: number; anzahl: number }>(
    `WITH n AS (${NAECHSTE_HALTESTELLE})
     SELECT (floor(m / 200) * 200)::int AS von, count(*)::int AS anzahl
       FROM n WHERE m IS NOT NULL
      GROUP BY 1 ORDER BY 1`,
  ),
);

export interface OepnvBeispiel {
  platz: string;
  slug: string;
  ort: string | null;
  land: string;
  halt: string;
  distanz_m: number;
}

/** Plätze, an denen die Haltestelle praktisch danebensteht. */
export const oepnvBeispiele = cache((limit = 8) =>
  q<OepnvBeispiel>(
    `SELECT p.name AS platz, p.slug, o.name AS ort, b.name AS land,
            x.name AS halt, x.distanz_m
       FROM parkplatz p
       JOIN parkplatz_nearby x ON x.parkplatz_id = p.id AND x.kategorie = 'oepnv'
       LEFT JOIN ort o        ON o.id = p.ort_id
       JOIN bundesland b      ON b.id = p.bundesland_id
      WHERE p.aktiv AND x.name IS NOT NULL AND x.distanz_m <= 60 AND p.aussagen >= 5
      ORDER BY x.distanz_m, p.aussagen DESC
      LIMIT $1`,
    [limit],
  ),
);

/** Kreisfreie Städte gegen Landkreise — die Erklärung hinter dem Gefälle. */
export const oepnvStadtLand = cache(() =>
  q<{ art: string; plaetze: number; mit: number; prozent: string; median: number }>(
    `WITH n AS (${NAECHSTE_HALTESTELLE})
     SELECT CASE WHEN k.typ = 'Kreisfreie Stadt' THEN 'kreisfreie Städte' ELSE 'Landkreise' END AS art,
            count(*)::int AS plaetze, count(n.m)::int AS mit,
            round(100.0 * count(n.m) / count(*), 1)::text AS prozent,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY n.m)::int AS median
       FROM n JOIN kreis k ON k.id = n.kreis_id
      GROUP BY 1 ORDER BY 3 DESC`,
  ),
);

/**
 * Wo die meisten Ausgangspunkte ohne Haltestelle liegen — absolut, nicht
 * anteilig. Ein Kreis mit 42 unerschlossenen Plätzen ist für eine
 * Verkehrsplanung interessanter als einer mit drei bei schlechterer Quote.
 */
export const oepnvLuecken = cache((limit = 10) =>
  q<{ name: string; slug: string; plaetze: number; ohne_halt: number }>(
    `WITH n AS (${NAECHSTE_HALTESTELLE})
     SELECT k.name, k.slug, count(*)::int AS plaetze,
            count(*) FILTER (WHERE n.m IS NULL)::int AS ohne_halt
       FROM n JOIN kreis k ON k.id = n.kreis_id
      GROUP BY k.name, k.slug
      ORDER BY count(*) FILTER (WHERE n.m IS NULL) DESC, count(*) DESC
      LIMIT $1`,
    [limit],
  ),
);

/**
 * Die Anbindungszahl einer einzelnen Region.
 *
 * Damit trägt jede Kreis- und Bundeslandseite ihren eigenen Wert aus der
 * Auswertung und verweist von dort darauf — ein Verweis, der etwas sagt,
 * statt nur zu verlinken.
 */
export const oepnvFuerRegion = cache(
  async (spalte: "kreis_id" | "bundesland_id", id: number) =>
    (
      await q<{ plaetze: number; mit: number; prozent: string; median: number | null }>(
        `WITH n AS (
           SELECT p.id, min(x.distanz_m) AS m
             FROM parkplatz p
             LEFT JOIN parkplatz_nearby x ON x.parkplatz_id = p.id AND x.kategorie = 'oepnv'
            WHERE p.aktiv AND p.${spalte} = $1
            GROUP BY p.id)
         SELECT count(*)::int AS plaetze, count(m)::int AS mit,
                round(100.0 * count(m) / NULLIF(count(*), 0), 0)::text AS prozent,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY m)::int AS median
           FROM n`,
        [id],
      )
    )[0],
);

/**
 * Wo es vom Parkplatz aus hoch hinaufgeht.
 *
 * Für die Grödelseite: Der DAV warnt vor Altschneefeldern auf 1.300 bis 1.600
 * Metern, die im Frühjahr noch liegen, wenn unten längst Frühling ist. Gezählt
 * wird, an wie vielen Ausgangspunkten ein Gipfel ab einer Höhe im erfassten
 * Umkreis liegt (höchstens 5 km, siehe pipeline/src/build.ts) — und je
 * Landkreis, wo solche Ausgangspunkte liegen. Die Höhe des Parkplatzes
 * selbst ist in OpenStreetMap fast nie eingetragen; die des Gipfels meistens.
 */
export const hoheGipfel = cache(async () => {
  const [stufen, kreise] = await Promise.all([
    q<{ schwelle: number; plaetze: number }>(
      `SELECT s.schwelle, count(DISTINCT p.id)::int AS plaetze
         FROM (VALUES (1000), (1300), (1500)) s(schwelle)
         JOIN ziel z            ON z.art = 'gipfel' AND z.hoehe_m >= s.schwelle
         JOIN parkplatz_ziel pz ON pz.ziel_id = z.id
         JOIN parkplatz p       ON p.id = pz.parkplatz_id AND p.aktiv
        GROUP BY 1 ORDER BY 1`,
    ),
    // Je Kreis: wie viele Ausgangspunkte einen Gipfel ab 1.300 m in Reichweite
    // haben, und welcher der höchste ist. Eine Liste einzelner Parkplätze wäre
    // zwölfmal Garmisch-Partenkirchen.
    q<{ kreis: string; slug: string; plaetze: number; gipfel: string; hoehe_m: number }>(
      `WITH t AS (
         SELECT p.id, p.kreis_id, z.name, z.hoehe_m
           FROM parkplatz p
           JOIN parkplatz_ziel pz ON pz.parkplatz_id = p.id
           JOIN ziel z            ON z.id = pz.ziel_id AND z.art = 'gipfel' AND z.hoehe_m >= 1300
          WHERE p.aktiv AND p.kreis_id IS NOT NULL
       )
       SELECT k.name AS kreis, k.slug, count(DISTINCT t.id)::int AS plaetze,
              (array_agg(t.name ORDER BY t.hoehe_m DESC))[1] AS gipfel,
              max(t.hoehe_m)::int AS hoehe_m
         FROM t JOIN kreis k ON k.id = t.kreis_id
        GROUP BY k.id, k.name, k.slug
        ORDER BY plaetze DESC, hoehe_m DESC`,
    ),
  ]);
  return { stufen, kreise };
});
