import { SITE } from "@/lib/site";
import { SITEMAP_TYPEN } from "@/lib/sitemap";

export const revalidate = 86400;

/** Sitemap-Index: verweist auf die nach Seitentyp getrennten Dateien. */
export async function GET() {
  const heute = new Date().toISOString();
  const eintraege = SITEMAP_TYPEN.map(
    (t) => `<sitemap><loc>${SITE}/sitemaps/${t}.xml</loc><lastmod>${heute}</lastmod></sitemap>`,
  ).join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</sitemapindex>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
