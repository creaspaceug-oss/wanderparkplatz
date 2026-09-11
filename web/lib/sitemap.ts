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

export async function eintraege(typ: SitemapTyp): Promise<SitemapEintrag[]> {
  const einfach = (rows: { slug: string }[], praefix: string, frequenz: string, gewicht: string) =>
    rows.map((r) => ({ pfad: `${praefix}/${r.slug}`, frequenz, gewicht }));

  switch (typ) {
    case "seiten":
      return [
        { pfad: "/", frequenz: "weekly", gewicht: "1.0" },
        { pfad: "/regionen", frequenz: "monthly", gewicht: "0.8" },
        { pfad: "/wanderwege", frequenz: "monthly", gewicht: "0.8" },
        { pfad: "/ziele", frequenz: "monthly", gewicht: "0.8" },
        { pfad: "/bundeslaender", frequenz: "monthly", gewicht: "0.7" },
        { pfad: "/ueber-uns", frequenz: "yearly", gewicht: "0.5" },
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
      return einfach(
        await q<{ slug: string }>(
          "SELECT slug FROM bundesland WHERE poi_count > 0 ORDER BY poi_count DESC",
        ),
        "/bundesland",
        "weekly",
        "0.8",
      );
    case "kreise":
      return einfach(
        await q<{ slug: string }>(
          "SELECT slug FROM kreis WHERE poi_count > 0 ORDER BY poi_count DESC",
        ),
        "/kreis",
        "weekly",
        "0.7",
      );
    case "orte":
      return einfach(
        await q<{ slug: string }>(
          "SELECT slug FROM ort WHERE poi_count > 0 ORDER BY poi_count DESC",
        ),
        "/ort",
        "weekly",
        "0.6",
      );
    case "wanderwege":
      return einfach(
        await q<{ slug: string }>(
          "SELECT slug FROM trail WHERE eigene_seite ORDER BY parkplatz_count DESC",
        ),
        "/wanderweg",
        "monthly",
        "0.6",
      );
    case "ziele":
      return einfach(
        await q<{ slug: string }>(
          "SELECT slug FROM ziel WHERE eigene_seite ORDER BY parkplatz_count DESC",
        ),
        "/ziel",
        "monthly",
        "0.6",
      );
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
