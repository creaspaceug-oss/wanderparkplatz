import { q } from "./db";
import { SITE } from "./site";
import { MIN_AUSSAGEN } from "./inhalt";
import { WANDERREGIONEN } from "./wanderregionen";
import { regionBestaende } from "./db";

export interface SitemapEintrag {
  pfad: string;
  geaendert?: Date;
  frequenz: string;
  gewicht: string;
}

/**
 * Sitemaps nach Seitentyp getrennt.
 *
 * Eine einzelne Datei mit 16.000 Adressen wäre zulässig, aber in der Search
 * Console nur eine Sammelzahl. Getrennt zeigt sie, welcher Seitentyp indexiert
 * wird und welcher nicht — bei einem Verzeichnis die entscheidende Frage.
 */
export const SITEMAP_TYPEN = [
  "seiten",
  "regionen",
  "bundeslaender",
  "kreise",
  "orte",
  "wanderwege",
  "ziele",
  "parkplaetze",
] as const;

export type SitemapTyp = (typeof SITEMAP_TYPEN)[number];

/**
 * lastmod ist das einzige Signal dieser Datei, das Google auswertet —
 * changefreq und priority ignoriert es seit Jahren. Regionen, Wege und Ziele
 * führen keinen eigenen Änderungsstand: Sie werden bei jedem Import neu
 * aufgebaut, ein Datum von dort hieße "heute" und wäre wertlos. Ihr Inhalt
 * ändert sich aber genau dann, wenn sich einer ihrer Parkplätze ändert, und
 * deren Stand rückt nur bei echter inhaltlicher Änderung vor. Das jüngste
 * dieser Daten ist damit ein ehrliches lastmod.
 */
export async function eintraege(typ: SitemapTyp): Promise<SitemapEintrag[]> {
  const einfach = (
    rows: { slug: string; aktualisiert?: Date }[],
    praefix: string,
    frequenz: string,
    gewicht: string,
  ) =>
    rows.map((r) => ({
      pfad: `${praefix}/${r.slug}`,
      geaendert: r.aktualisiert,
      frequenz,
      gewicht,
    }));

  /** Jüngster Stand der Parkplätze einer Region. */
  const region = (tabelle: string, spalte: string) =>
    q<{ slug: string; aktualisiert: Date }>(
      `SELECT r.slug, max(p.aktualisiert) AS aktualisiert
         FROM ${tabelle} r JOIN parkplatz p ON p.${spalte} = r.id AND p.aktiv
        WHERE r.poi_count > 0
        GROUP BY r.id, r.slug, r.poi_count
        ORDER BY r.poi_count DESC`,
    );

  /** Jüngster Stand der Parkplätze an einem Weg oder Ziel. */
  const verknuepft = (tabelle: string, brueckentabelle: string, spalte: string) =>
    q<{ slug: string; aktualisiert: Date }>(
      `SELECT e.slug, max(p.aktualisiert) AS aktualisiert
         FROM ${tabelle} e
         JOIN ${brueckentabelle} v ON v.${spalte} = e.id
         JOIN parkplatz p ON p.id = v.parkplatz_id AND p.aktiv
        WHERE e.eigene_seite
        GROUP BY e.id, e.slug, e.parkplatz_count
        ORDER BY e.parkplatz_count DESC`,
    );

  switch (typ) {
    case "seiten":
      return [
        { pfad: "/", frequenz: "weekly", gewicht: "1.0" },
        { pfad: "/regionen", frequenz: "monthly", gewicht: "0.8" },
        { pfad: "/wanderwege", frequenz: "monthly", gewicht: "0.8" },
        { pfad: "/ziele", frequenz: "monthly", gewicht: "0.8" },
        { pfad: "/bundeslaender", frequenz: "monthly", gewicht: "0.7" },
        { pfad: "/ueber-uns", frequenz: "yearly", gewicht: "0.5" },
        { pfad: "/wandern-ohne-auto", frequenz: "monthly", gewicht: "0.9" },
        { pfad: "/toilette-am-wanderparkplatz", frequenz: "monthly", gewicht: "0.9" },
        { pfad: "/ausruestung", frequenz: "monthly", gewicht: "0.6" },
        { pfad: "/ausruestung/wanderstoecke", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/trinkblase", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/wanderrucksack", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/groedel", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/huettenschlafsack", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/erste-hilfe-set", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/stirnlampe", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/gamaschen", frequenz: "weekly", gewicht: "0.8" },
      ];
    case "regionen": {
      const bestaende = await regionBestaende(WANDERREGIONEN);
      const mitBestand = new Set(bestaende.filter((b) => b.n > 0).map((b) => b.slug));
      return WANDERREGIONEN.filter((r) => mitBestand.has(r.slug)).map((r) => ({
        pfad: `/region/${r.slug}`,
        frequenz: "weekly",
        gewicht: "0.8",
      }));
    }
    case "bundeslaender":
      return einfach(await region("bundesland", "bundesland_id"), "/bundesland", "weekly", "0.8");
    case "kreise":
      return einfach(await region("kreis", "kreis_id"), "/kreis", "weekly", "0.7");
    case "orte":
      return einfach(await region("ort", "ort_id"), "/ort", "weekly", "0.6");
    case "wanderwege":
      return einfach(
        await verknuepft("trail", "parkplatz_trail", "trail_id"),
        "/wanderweg",
        "monthly",
        "0.6",
      );
    case "ziele":
      return einfach(await verknuepft("ziel", "parkplatz_ziel", "ziel_id"), "/ziel", "monthly", "0.6");
    case "parkplaetze":
      return (
        await q<{ slug: string; aktualisiert: Date }>(
          `SELECT slug, aktualisiert FROM parkplatz
            WHERE aktiv AND aussagen >= ${MIN_AUSSAGEN}
            ORDER BY aussagen DESC, id`,
        )
      ).map((r) => ({
        pfad: `/wanderparkplatz/${r.slug}`,
        geaendert: r.aktualisiert,
        frequenz: "monthly",
        gewicht: "0.5",
      }));
  }
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function alsXml(liste: SitemapEintrag[]): string {
  const zeilen = liste
    .map(
      (e) =>
        `<url><loc>${escape(SITE + e.pfad)}</loc>` +
        (e.geaendert ? `<lastmod>${new Date(e.geaendert).toISOString()}</lastmod>` : "") +
        `<changefreq>${e.frequenz}</changefreq><priority>${e.gewicht}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${zeilen}\n</urlset>\n`;
}
