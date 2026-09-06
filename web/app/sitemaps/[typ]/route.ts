import { notFound } from "next/navigation";
import { SITEMAP_TYPEN, eintraege, alsXml, type SitemapTyp } from "@/lib/sitemap";

export const revalidate = 86400;

export function generateStaticParams() {
  return SITEMAP_TYPEN.map((t) => ({ typ: `${t}.xml` }));
}

export async function GET(_: Request, { params }: RouteContext<"/sitemaps/[typ]">) {
  const { typ } = await params;
  const name = typ.replace(/\.xml$/, "") as SitemapTyp;
  if (!SITEMAP_TYPEN.includes(name)) notFound();

  return new Response(alsXml(await eintraege(name)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
