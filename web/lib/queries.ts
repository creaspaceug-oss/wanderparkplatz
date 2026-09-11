import { cache } from "react";
import { q } from "./db";

export interface RegionZeile {
  slug: string;
  name: string;
  poi_count: number;
  typ?: string;
  bl_name?: string;
  bl_slug?: string;
}

export const bundeslaender = () =>
  q<RegionZeile>(
    `SELECT slug, name, poi_count FROM bundesland
     WHERE poi_count > 0 ORDER BY poi_count DESC`,
  );

export const topKreise = (limit = 24) =>
  q<RegionZeile>(
    `SELECT k.slug, k.name, k.typ, k.poi_count, b.name AS bl_name, b.slug AS bl_slug
     FROM kreis k JOIN bundesland b ON b.id = k.bundesland_id
     WHERE k.poi_count > 0 ORDER BY k.poi_count DESC LIMIT $1`,
    [limit],
  );

export const kreiseIn = (bundeslandId: number) =>
  q<RegionZeile>(
    `SELECT slug, name, typ, poi_count FROM kreis
     WHERE bundesland_id = $1 AND poi_count > 0 ORDER BY poi_count DESC, name`,
    [bundeslandId],
  );

export const orteIn = (kreisId: number) =>
  q<RegionZeile>(
    `SELECT slug, name, poi_count FROM ort
     WHERE kreis_id = $1 AND poi_count > 0 ORDER BY poi_count DESC, name`,
    [kreisId],
  );

export const gesamtzahl = async () =>
  (await q<{ n: number }>("SELECT count(*)::int AS n FROM parkplatz"))[0]?.n ?? 0;

export interface Kennzahlen {
  gesamt: number;
  kostenfrei: number;
  mit_gebuehrenangabe: number;
  mit_stellplatzangabe: number;
  stellplaetze_median: number | null;
  stellplaetze_summe: number | null;
  mit_oberflaeche: number;
  unbefestigt: number;
  barrierefrei: number;
  orte: number;
  kreise: number;
  laender: number;
}

/**
 * Kennzahlen des Gesamtbestands. Bewusst mit den Nennern: "2.855 kostenfrei"
 * ist ohne "von 2.935 mit Gebuehrenangabe" eine irrefuehrende Zahl.
 */
export const kennzahlen = async (): Promise<Kennzahlen> =>
  (
    await q<Kennzahlen>(
      `SELECT (SELECT count(*) FROM parkplatz WHERE aktiv)::int AS gesamt,
              (SELECT count(*) FROM parkplatz WHERE aktiv AND gebuehr = false)::int AS kostenfrei,
              (SELECT count(*) FROM parkplatz WHERE aktiv AND gebuehr IS NOT NULL)::int AS mit_gebuehrenangabe,
              (SELECT count(*) FROM parkplatz WHERE aktiv AND stellplaetze IS NOT NULL)::int AS mit_stellplatzangabe,
              (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY stellplaetze)::int
                 FROM parkplatz WHERE aktiv AND stellplaetze IS NOT NULL) AS stellplaetze_median,
              (SELECT sum(stellplaetze)::int FROM parkplatz WHERE aktiv AND stellplaetze IS NOT NULL) AS stellplaetze_summe,
              (SELECT count(*) FROM parkplatz WHERE aktiv AND oberflaeche IS NOT NULL)::int AS mit_oberflaeche,
              (SELECT count(*) FROM parkplatz
                WHERE aktiv AND oberflaeche ~ 'Schotter|Kies|Naturboden|Erde|Wiese|unbefestigt|Sand|Rasengitter|Hackschnitzel')::int AS unbefestigt,
              (SELECT count(*) FROM parkplatz WHERE aktiv AND barrierefrei)::int AS barrierefrei,
              (SELECT count(*) FROM ort   WHERE poi_count > 0)::int AS orte,
              (SELECT count(*) FROM kreis WHERE poi_count > 0)::int AS kreise,
              (SELECT count(*) FROM bundesland WHERE poi_count > 0)::int AS laender`,
    )
  )[0];

export interface Region {
  id: number;
  slug: string;
  name: string;
  typ: string | null;
  lat: number;
  lon: number;
  poi_count: number;
  bl_name?: string;
  bl_slug?: string;
  kreis_name?: string;
  kreis_slug?: string;
  bundesland_id?: number;
  einwohner?: number | null;
  wikidata?: string | null;
}

import { one } from "./db";

export const bundeslandBySlug = cache((slug: string) =>
  one<Region>(
    `SELECT id, slug, name, NULL::text AS typ, lat, lon, poi_count
     FROM bundesland WHERE slug = $1`,
    [slug],
  ),
);

export const kreisBySlug = cache((slug: string) =>
  one<Region>(
    `SELECT k.id, k.slug, k.name, k.typ, k.lat, k.lon, k.poi_count,
            k.bundesland_id, b.name AS bl_name, b.slug AS bl_slug
     FROM kreis k JOIN bundesland b ON b.id = k.bundesland_id
     WHERE k.slug = $1`,
    [slug],
  ),
);

export const ortBySlug = cache((slug: string) =>
  one<Region>(
    `SELECT o.id, o.slug, o.name, o.typ, o.lat, o.lon, o.poi_count, o.einwohner, o.wikidata,
            k.name AS kreis_name, k.slug AS kreis_slug,
            b.name AS bl_name,  b.slug AS bl_slug
     FROM ort o
     LEFT JOIN kreis k      ON k.id = o.kreis_id
     LEFT JOIN bundesland b ON b.id = o.bundesland_id
     WHERE o.slug = $1`,
    [slug],
  ),
);

/** Nachbarregionen für interne Verlinkung — hält verwaiste Seiten aus dem Index. */
export const nachbarKreise = (kreisId: number, bundeslandId: number, limit = 8) =>
  q<RegionZeile>(
    `SELECT slug, name, typ, poi_count FROM kreis
     WHERE bundesland_id = $1 AND id <> $2 AND poi_count > 0
     ORDER BY poi_count DESC LIMIT $3`,
    [bundeslandId, kreisId, limit],
  );

export interface Bestand {
  ziele: number;
  wanderwege: number;
  bewertungen: number;
  stand: string | null;
}

/**
 * Umfang des Bestands für die Seite "Über uns". Gezählt werden nur Ziele und
 * Wege mit eigener Seite — die übrigen sind erfasst, aber zu dünn belegt, um
 * eine eigene Seite zu tragen.
 */
export const bestand = cache(
  async (): Promise<Bestand> =>
    (
      await q<Bestand>(
        `SELECT (SELECT count(*) FROM ziel  WHERE eigene_seite)::int   AS ziele,
                (SELECT count(*) FROM trail WHERE eigene_seite)::int   AS wanderwege,
                (SELECT count(*) FROM bewertung WHERE status = 'frei')::int AS bewertungen,
                (SELECT max(aktualisiert)::date::text FROM parkplatz)   AS stand`,
      )
    )[0],
);
