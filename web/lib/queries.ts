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
  mit_stellplatzangabe: number;
  orte: number;
  kreise: number;
}

export const kennzahlen = async (): Promise<Kennzahlen> =>
  (
    await q<Kennzahlen>(
      `SELECT (SELECT count(*) FROM parkplatz)::int                        AS gesamt,
              (SELECT count(*) FROM parkplatz WHERE gebuehr = false)::int  AS kostenfrei,
              (SELECT count(*) FROM parkplatz WHERE stellplaetze IS NOT NULL)::int AS mit_stellplatzangabe,
              (SELECT count(*) FROM ort   WHERE poi_count > 0)::int        AS orte,
              (SELECT count(*) FROM kreis WHERE poi_count > 0)::int        AS kreise`,
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
    `SELECT o.id, o.slug, o.name, o.typ, o.lat, o.lon, o.poi_count, o.einwohner,
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
