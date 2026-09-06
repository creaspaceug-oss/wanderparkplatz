import { cache } from "react";
import { q } from "./db";

export interface Bild {
  url: string;
  breite: number;
  hoehe: number;
  lizenz: string | null;
  lizenz_url: string | null;
  urheber: string | null;
  quelle_url: string;
}

/**
 * Bilder zu mehreren Wikidata-Objekten auf einmal. Einzeln abgefragt wären das
 * auf der Startseite ein Dutzend Rundläufe.
 */
export const bilderFuer = cache(async (ids: (string | null)[]) => {
  const gefiltert = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!gefiltert.length) return new Map<string, Bild>();
  const rows = await q<Bild & { wikidata: string }>(
    `SELECT wikidata, url, breite, hoehe, lizenz, lizenz_url, urheber, quelle_url
       FROM bild WHERE wikidata = ANY($1)`,
    [gefiltert],
  );
  return new Map(rows.map((r) => [r.wikidata, r]));
});

export const bildFuer = cache(async (id: string | null) =>
  id ? ((await bilderFuer([id])).get(id) ?? null) : null,
);

/**
 * Urheber aufräumen. Commons liefert das Feld als freien Text — bei älteren
 * Dateien als Textbaustein "No machine-readable author provided. NAME assumed
 * (based on copyright claims)", der ungekürzt die halbe Bildunterschrift
 * füllt. Der Name darin ist die eigentliche Angabe.
 */
export function urheberKurz(u: string | null): string {
  if (!u) return "unbekannt";
  let rein = u.replace(/\s+/g, " ").trim();

  const baustein = /No machine-readable author provided\.\s*(.+?)\s+assumed\b/i.exec(rein);
  if (baustein) rein = baustein[1];

  // Benutzerkonten tragen häufig ein Wiki-Suffix, das niemanden interessiert
  rein = rein.replace(/~\w+wiki\b/gi, "").trim();

  return rein.length > 60 ? `${rein.slice(0, 57)}…` : rein || "unbekannt";
}
