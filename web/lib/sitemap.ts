import { q } from "./db";
import { FREIGABE, sichtbar } from "./ausruestung/freigabe";
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
/**
 * Letzter inhaltlicher Stand der redaktionellen Seiten.
 *
 * Die Verzeichnisseiten führen ihr lastmod über den Änderungsstand ihrer
 * Parkplätze; redaktionelle Seiten haben keine solche Quelle. Hier steht es
 * deshalb von Hand — beim nächsten echten Eingriff an einer Seite mitziehen.
 * Nicht mitziehen, wenn sich nur Preise oder Bilder von Amazon ändern: Das
 * ist kein inhaltlicher Stand, und ein täglich neues Datum entwertet das
 * Signal. Für zeitgesteuerte Seiten gilt ohnehin der Freigabezeitpunkt, denn
 * vorher gab es für Suchmaschinen nichts zu sehen.
 */
const STAND: Record<string, string> = {
  "/ueber-uns": "2026-09-19T08:51:07+02:00",
  "/toilette-am-wanderparkplatz": "2026-09-19T09:00:23+02:00",
  "/wandern-ohne-auto": "2026-09-19T09:07:57+02:00",
  "/ausruestung": "2026-10-03T12:00:00+02:00",
  "/ausruestung/wanderstoecke": "2026-09-19T18:11:37+02:00",
  "/ausruestung/wanderrucksack": "2026-09-19T18:11:37+02:00",
  "/ausruestung/huettenschlafsack": "2026-09-19T18:11:37+02:00",
  "/ausruestung/erste-hilfe-set": "2026-09-19T18:28:41+02:00",
  "/ausruestung/stirnlampe": "2026-09-19T18:28:41+02:00",
  "/ausruestung/gamaschen": "2026-09-19T18:40:28+02:00",
  "/ausruestung/groedel": "2026-09-19T18:40:28+02:00",
  "/ausruestung/trinkblase": "2026-09-19T18:57:52+02:00",
};

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
  const verknuepft = (tabelle: string, brueckentabelle: string, spalte: string, zusatz = "") =>
    q<{ slug: string; aktualisiert: Date }>(
      `SELECT e.slug, max(p.aktualisiert) AS aktualisiert
         FROM ${tabelle} e
         JOIN ${brueckentabelle} v ON v.${spalte} = e.id
         JOIN parkplatz p ON p.id = v.parkplatz_id AND p.aktiv
        WHERE e.eigene_seite${zusatz}
        GROUP BY e.id, e.slug, e.parkplatz_count
        ORDER BY e.parkplatz_count DESC`,
    );

  switch (typ) {
    case "seiten": {
      // Startseite und Übersichten ändern sich mit den Daten, nicht mit dem
      // Code: Ihr lastmod ist der jüngste Parkplatz-Stand.
      const [daten] = await q<{ stand: Date | null }>(
        "SELECT max(aktualisiert) AS stand FROM parkplatz WHERE aktiv",
      );
      const DATENSEITEN = new Set(["/", "/regionen", "/wanderwege", "/ziele", "/bundeslaender"]);
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
        { pfad: "/ausruestung/wasserfilter", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/wandersocken", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/schuhe-impraegnieren", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/regenhose", frequenz: "weekly", gewicht: "0.8" },
        { pfad: "/ausruestung/regenjacke", frequenz: "weekly", gewicht: "0.8" },
      ]
        .filter((e) => sichtbar(e.pfad))
        // Freigegebene Seiten tragen den Freigabezeitpunkt, alle anderen ihren
        // handgepflegten Stand; wo beides fehlt, bleibt lastmod weg.
        .map((e) => {
          const datum = FREIGABE[e.pfad] ?? STAND[e.pfad];
          if (datum) return { ...e, geaendert: new Date(datum) };
          if (DATENSEITEN.has(e.pfad) && daten?.stand) return { ...e, geaendert: daten.stand };
          return e;
        });
    }
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
        // Nur Wege, die auch indexiert werden: dieselbe Schwelle wie in
        // generateMetadata der Wegeseite (siehe lib/inhalt.ts).
        await verknuepft(
          "trail",
          "parkplatz_trail",
          "trail_id",
          ` AND (CASE WHEN e.laenge_km IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN e.markierung IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN e.netz IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN e.ref IS NOT NULL THEN 1 ELSE 0 END
               + CASE WHEN e.parkplatz_count >= 2 THEN 1 ELSE 0 END) >= ${MIN_AUSSAGEN}`,
        ),
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
