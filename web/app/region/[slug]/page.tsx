import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import Brotkrumen from "@/components/Brotkrumen";
import { parkplaetzeInRegion, kreiseInRegion, regionBestaende } from "@/lib/db";
import { WANDERREGIONEN, regionBySlug } from "@/lib/wanderregionen";
import { jsonLd, nf, aufzaehlung } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Bewusst kürzer als bei Kreis- und Ortsseiten: ob eine Region Bestand hat,
 * ändert sich mit jedem Datenimport. Eine Region, die neu Parkplätze bekommt,
 * soll binnen eines Tages erscheinen und nicht erst nach einer Woche.
 */
export const revalidate = 86400;

const MAX_LISTE = 120;

/**
 * Nur Regionen mit Bestand vorrendern.
 *
 * Sonst wird für leere Regionen ein notFound() fest ins Build geschrieben und
 * als 404 zwischengespeichert — auch dann noch, wenn längst Daten vorliegen.
 * Regionen ohne Bestand entstehen stattdessen bei Abruf und liefern ein 404,
 * das sich mit der nächsten Revalidierung von selbst korrigiert.
 */
export async function generateStaticParams() {
  const bestaende = await regionBestaende(WANDERREGIONEN);
  const mitBestand = new Set(bestaende.filter((b) => b.n > 0).map((b) => b.slug));
  return WANDERREGIONEN.filter((r) => mitBestand.has(r.slug)).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/region/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = regionBySlug(slug);
  if (!r) return { title: "Region nicht gefunden" };
  const [bestand] = await regionBestaende([r]);
  return {
    title: titel(`Wanderparkplatz ${r.name} (${nf.format(bestand?.n ?? 0)})`),
    description: beschreibung(
      `${nf.format(bestand?.n ?? 0)} Wanderparkplätze im ${r.name}: Wanderwege ab dem Platz, Stellplätze, Gebühren und Anfahrt. ${r.kurz}.`,
    ),
    alternates: { canonical: `/region/${r.slug}` },
  };
}

export default async function RegionSeite({ params }: PageProps<"/region/[slug]">) {
  const { slug } = await params;
  const r = regionBySlug(slug);
  if (!r) notFound();

  const [plaetze, kreise, bestaende] = await Promise.all([
    parkplaetzeInRegion(r.lat, r.lon, r.radiusKm, MAX_LISTE),
    kreiseInRegion(r.lat, r.lon, r.radiusKm),
    regionBestaende([r]),
  ]);
  const bestand = bestaende[0];

  // Ohne Bestand hat die Seite keinen Inhalt, der eine Indexierung rechtfertigt.
  if (!bestand || bestand.n === 0) notFound();

  const anteilFrei = Math.round((bestand.kostenfrei / bestand.n) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Wanderparkplätze im ${r.name}`,
          description: r.text,
          url: `${SITE}/region/${r.slug}`,
          about: {
            "@type": "Place",
            name: r.name,
            geo: {
              "@type": "GeoCircle",
              geoMidpoint: { "@type": "GeoCoordinates", latitude: r.lat, longitude: r.lon },
              geoRadius: r.radiusKm * 1000,
            },
          },
        })}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Wanderregionen", url: "/regionen" },
        ]}
        aktuell={r.name}
      />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze im {r.name}
      </h1>

      <p className="mt-4 text-lg leading-relaxed">{r.text}</p>

      {/* Als ein String zusammengesetzt: in JSX getrennte Teile erzeugen sonst
          Leerzeichen vor Komma und Punkt. */}
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Im Umkreis von {r.radiusKm} Kilometern um die Mitte der Region sind{" "}
        <strong className="text-foreground">{nf.format(bestand.n)} Wanderparkplätze</strong>
        {`${
          bestand.kostenfrei > 0
            ? ` erfasst, davon ${nf.format(bestand.kostenfrei)} nachweislich kostenfrei (${anteilFrei} %).`
            : " erfasst."
        } Die Region liegt in ${aufzaehlung(r.laender)}.`}
      </p>

      {r.fernwege.length > 0 && (
        <div className="mt-6 rounded-xl border border-line bg-card p-5">
          <h2 className="text-base font-semibold">Fernwanderwege in der Region</h2>
          <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-muted">
            {r.fernwege.map((w, i) => (
              <li key={w}>
                {w}
                {i < r.fernwege.length - 1 && " ·"}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Auf den Parkplatzseiten steht, welche markierten Wege unmittelbar am jeweiligen
            Platz vorbeiführen.
          </p>
        </div>
      )}

      {kreise.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Landkreise im {r.name}</h2>
          <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
            {kreise.map((k) => (
              <li
                key={k.slug}
                className="flex items-baseline justify-between gap-2 border-b border-line py-2"
              >
                <Link href={`/kreis/${k.slug}`} className="truncate hover:text-accent">
                  {k.name}
                </Link>
                <span className="shrink-0 text-sm tabular-nums text-muted">
                  {nf.format(k.poi_count)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Die Region überschneidet sich mit Verwaltungsgrenzen — ein Landkreis kann teils
            innerhalb, teils außerhalb liegen.
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          {plaetze.length >= MAX_LISTE
            ? `Wanderparkplätze im ${r.name}`
            : `Alle Wanderparkplätze im ${r.name}`}
        </h2>
        {plaetze.length >= MAX_LISTE && (
          <p className="mt-2 text-sm text-muted">
            Angezeigt werden die {nf.format(MAX_LISTE)} Plätze mit den vollständigsten Angaben.
            Über die Landkreise oben kommst du an den vollständigen Bestand.
          </p>
        )}
        <div className="mt-4">
          <ParkplatzListe items={plaetze} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Weitere Wanderregionen</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {WANDERREGIONEN.filter((x) => x.slug !== r.slug)
            .slice(0, 12)
            .map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/region/${x.slug}`}
                  className="inline-block rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-accent"
                >
                  {x.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
