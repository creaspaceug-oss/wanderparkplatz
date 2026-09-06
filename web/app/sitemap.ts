import type { MetadataRoute } from "next";
import { q, regionBestaende, trailSeiten } from "@/lib/db";
import { SITE } from "@/lib/site";
import { WANDERREGIONEN } from "@/lib/wanderregionen";
import { MIN_AUSSAGEN } from "@/lib/inhalt";

export const revalidate = 86400;

/**
 * Eine einzelne Sitemap. Das Protokoll erlaubt 50.000 URLs je Datei; der
 * Bestand liegt deutlich darunter. Wächst er darüber hinaus, auf
 * `generateSitemaps` umstellen — dann liegen die Teile unter /sitemap/<n>.xml
 * und robots.txt braucht eine Sitemap-Index-Datei.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [statisch, laender, kreise, orte, plaetze, bestaende, wege] = await Promise.all([
    Promise.resolve([
      // Ohne Schrägstrich — so lautet auch das Canonical der Startseite.
      { url: SITE, changeFrequency: "weekly" as const, priority: 1 },
      { url: `${SITE}/bundeslaender`, changeFrequency: "monthly" as const, priority: 0.7 },
      { url: `${SITE}/regionen`, changeFrequency: "monthly" as const, priority: 0.8 },
      { url: `${SITE}/wanderwege`, changeFrequency: "monthly" as const, priority: 0.8 },
    ]),
    q<{ slug: string }>("SELECT slug FROM bundesland WHERE poi_count > 0 ORDER BY poi_count DESC"),
    q<{ slug: string }>("SELECT slug FROM kreis WHERE poi_count > 0 ORDER BY poi_count DESC"),
    q<{ slug: string }>("SELECT slug FROM ort WHERE poi_count > 0 ORDER BY poi_count DESC"),
    q<{ slug: string; aktualisiert: Date }>(
      // Nicht indexierbare Seiten gehören nicht in die Sitemap.
      `SELECT slug, aktualisiert FROM parkplatz
        WHERE aktiv AND aussagen >= ${MIN_AUSSAGEN}
        ORDER BY aussagen DESC, id`,
    ),
    regionBestaende(WANDERREGIONEN),
    trailSeiten(),
  ]);
  const bestandProRegion = new Map(bestaende.map((b) => [b.slug, b.n]));

  return [
    ...statisch,
    // Regionen ohne Bestand liefern 404 und gehören deshalb nicht hinein.
    ...WANDERREGIONEN.filter((r) => (bestandProRegion.get(r.slug) ?? 0) > 0).map((r) => ({
      url: `${SITE}/region/${r.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...laender.map((r) => ({
      url: `${SITE}/bundesland/${r.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...kreise.map((r) => ({
      url: `${SITE}/kreis/${r.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...orte.map((r) => ({
      url: `${SITE}/ort/${r.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...wege.map((t) => ({
      url: `${SITE}/wanderweg/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...plaetze.map((r) => ({
      url: `${SITE}/wanderparkplatz/${r.slug}`,
      lastModified: r.aktualisiert,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
