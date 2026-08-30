/**
 * Kanonische Adresse der Website.
 *
 * Muss exakt der Variante entsprechen, die am Ende der Weiterleitungskette
 * mit HTTP 200 antwortet — hier www. Zeigt sie auf die falsche Variante,
 * verweist jedes Canonical, jede Sitemap-URL und jedes Vorschaubild auf eine
 * Adresse, die weiterleitet: ein widersprüchliches Signal an Suchmaschinen
 * und verschenktes Crawl-Budget.
 */
const KANONISCH = "https://www.wanderparkplatz.info";

export const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? KANONISCH).replace(/\/$/, "");
export const SITE_NAME = "Wanderparkplatz-Verzeichnis";

/**
 * Abgleich mit der von Vercel gemeldeten Produktionsdomain. Ein Fehler hier
 * ist im Betrieb unsichtbar und fällt erst auf, wenn die Indexierung stockt —
 * deshalb wenigstens deutlich im Build-Protokoll.
 */
if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  const erwartet = process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, "");
  const gesetzt = SITE.replace(/^https?:\/\//, "");
  if (erwartet !== gesetzt) {
    console.warn(
      `\n⚠ Adressen stimmen nicht überein.\n` +
        `  Produktionsdomain laut Vercel: ${erwartet}\n` +
        `  In Canonicals und Sitemap:     ${gesetzt}\n` +
        `  Solange beide auseinanderlaufen, zeigen alle Canonicals und alle\n` +
        `  Sitemap-URLs auf eine weiterleitende Adresse. NEXT_PUBLIC_SITE_URL\n` +
        `  in den Projekteinstellungen anpassen oder ganz entfernen.\n`,
    );
  }
}
