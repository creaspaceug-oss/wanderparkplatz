import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import Brotkrumen from "@/components/Brotkrumen";
import { zielBySlug, parkplaetzeAmZiel, zielSeiten, nahegelegeneZiele } from "@/lib/db";
import { zielTitel } from "@/lib/zielart";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

export const revalidate = 604800;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await zielSeiten(400)).map((z) => ({ slug: z.slug }));
}

const meter = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

export async function generateMetadata({ params }: PageProps<"/ziel/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const z = await zielBySlug(slug);
  if (!z) return { title: "Ziel nicht gefunden" };
  return {
    title: titel(`Parkplatz ${z.name} – ${nf.format(z.parkplatz_count)} Wanderparkplätze`),
    description: beschreibung(
      `Wanderparkplätze am ${z.name}` +
        `${z.hoehe_m ? ` (${nf.format(z.hoehe_m)} m)` : ""}` +
        `${z.bl_name ? ` in ${z.bl_name}` : ""}: ${nf.format(z.parkplatz_count)} Ausgangspunkte` +
        ` mit Stellplätzen, Gebühren und Entfernung zum Ziel.`,
    ),
    alternates: { canonical: `/ziel/${z.slug}` },
  };
}

export default async function ZielSeite({ params }: PageProps<"/ziel/[slug]">) {
  const { slug } = await params;
  const z = await zielBySlug(slug);
  if (!z) notFound();

  const [plaetze, nahe] = await Promise.all([
    parkplaetzeAmZiel(z.id),
    nahegelegeneZiele(z.id),
  ]);
  if (!plaetze.length) notFound();

  const naechster = plaetze[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Wanderparkplätze am ${z.name}`,
          url: `${SITE}/ziel/${z.slug}`,
          about: {
            "@type": z.art === "burg" ? "LandmarksOrHistoricalBuildings" : "Landform",
            name: z.name,
            geo: { "@type": "GeoCoordinates", latitude: z.lat, longitude: z.lon },
            ...(z.hoehe_m ? { elevation: `${z.hoehe_m} m` } : {}),
          },
        })}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Wanderziele", url: "/ziele" },
        ]}
        aktuell={z.name}
      />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze am {z.name}
      </h1>

      <p className="mt-3 text-muted">
        {[
          zielTitel(z.art),
          z.hoehe_m ? `${nf.format(z.hoehe_m)} m über dem Meeresspiegel` : null,
          z.bl_name,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <p className="mt-4 text-lg leading-relaxed text-muted">
        {/* Ohne Artikel formuliert: "für den Großer Waxenstein" wäre falsch,
            und Eigennamen lassen sich nicht zuverlässig beugen. */}
        {`Als Ausgangspunkt sind ${nf.format(z.parkplatz_count)} ` +
          `${z.parkplatz_count === 1 ? "Wanderparkplatz" : "Wanderparkplätze"} erfasst. ` +
          `Der nächstgelegene liegt ${meter(naechster.distanz_m)} entfernt` +
          `${naechster.gebuehr === false ? " und ist kostenfrei" : ""}. ` +
          `Die Entfernungen sind Luftlinie — der tatsächliche Weg ist je nach Gelände ` +
          `deutlich länger.`}
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Parkplätze, nach Entfernung</h2>
        <ul className="mt-4 divide-y divide-line">
          {plaetze.map((p) => (
            <li key={p.slug} className="flex items-baseline gap-3 py-3">
              <span className="w-20 shrink-0 tabular-nums text-sm text-muted">
                {meter(p.distanz_m)}
              </span>
              <span className="min-w-0">
                <Link
                  href={`/wanderparkplatz/${p.slug}`}
                  className="font-medium hover:text-accent"
                >
                  {p.name}
                </Link>
                <span className="block text-sm text-muted">
                  {[
                    p.ort_name,
                    p.stellplaetze ? `${p.stellplaetze} Stellplätze` : null,
                    p.gebuehr === false
                      ? "kostenfrei"
                      : p.gebuehr === true
                        ? "gebührenpflichtig"
                        : null,
                    p.oberflaeche,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {nahe.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Weitere Ziele in der Umgebung</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {nahe.map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/ziel/${n.slug}`}
                  className="inline-block rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-accent"
                >
                  {n.name}
                  {n.hoehe_m && (
                    <span className="ml-1 tabular-nums text-muted">{n.hoehe_m} m</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
