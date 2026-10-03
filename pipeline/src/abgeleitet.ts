/**
 * Abgeleitete Felder: Was sich allein aus dem Bestand ergibt.
 *
 * Diese drei Anweisungen entscheiden, welche Seiten es gibt und welche in den
 * Index gehören. Sie laufen am Ende jedes Imports — stehen aber hier, damit
 * sie sich auch einzeln ausführen lassen (siehe ableiten.ts). Ändert sich eine
 * Schwelle im Code, muss sie neu berechnet werden; ohne diesen Weg bliebe nur,
 * einen vollständigen Import abzuwarten.
 */

/**
 * Wanderwege: Ein Parkplatz genügt, sofern der Weg darüber hinaus etwas
 * vorzuweisen hat — eine Netzstufe oberhalb "örtlich" oder eine bekannte
 * Länge. Gegen dünne Seiten schützt die Aussagenzählung in
 * web/lib/inhalt.ts, nicht diese Schwelle.
 */
export const WEGESEITEN = `
  UPDATE trail t SET
    parkplatz_count = c.n,
    -- COALESCE ist nötig: bei netz = NULL liefert IN (...) weder wahr noch
    -- falsch, sondern NULL, und "true AND NULL" ist NULL.
    eigene_seite = COALESCE(
      c.n >= 1 AND (t.netz IN ('iwn','nwn','rwn') OR t.laenge_km IS NOT NULL),
      false)
  FROM (SELECT trail_id, count(*)::int AS n FROM parkplatz_trail GROUP BY trail_id) c
  WHERE c.trail_id = t.id`;

/**
 * Ziele: zwei Parkplätze und ein Grund, warum jemand danach sucht — ein
 * Wikipedia- oder Wikidata-Eintrag oder eine Art, die für sich genommen ein
 * Ausflugsziel ist.
 */
export const ZIELSEITEN = `
  UPDATE ziel z SET
    parkplatz_count = c.n,
    eigene_seite = c.n >= 2
      AND (z.bekannt OR z.art IN ('burg','wasserfall','hoehle','turm'))
  FROM (SELECT ziel_id, count(*)::int AS n FROM parkplatz_ziel GROUP BY ziel_id) c
  WHERE c.ziel_id = z.id`;

/** Inhaltsumfang je Parkplatz; steuert, welche Seiten indexiert werden. */
export const AUSSAGEN = `
  UPDATE parkplatz p SET aussagen =
      (p.stellplaetze IS NOT NULL)::int + (p.gebuehr IS NOT NULL)::int
    + (p.oberflaeche IS NOT NULL)::int + (p.zugang IS NOT NULL)::int
    + (p.oeffnungszeiten IS NOT NULL)::int + (p.beleuchtet IS NOT NULL)::int
    + (p.barrierefrei IS NOT NULL)::int + (p.max_hoehe_m IS NOT NULL)::int
    + (p.wohnmobil IS NOT NULL)::int + (p.wc IS NOT NULL)::int
    + (p.betreiber IS NOT NULL)::int + (p.hoehe_m IS NOT NULL)::int
    + (SELECT count(*) FROM parkplatz_trail t  WHERE t.parkplatz_id = p.id)
    + (SELECT count(*) FROM parkplatz_nearby n WHERE n.parkplatz_id = p.id)`;
