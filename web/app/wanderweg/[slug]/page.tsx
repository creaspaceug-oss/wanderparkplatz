import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import Brotkrumen from "@/components/Brotkrumen";
import {
  trailBySlug, parkplaetzeAmTrail, kreiseAmTrail, trailSeiten, verwandteTrails,
} from "@/lib/db";
import { jsonLd, nf, aufzaehlung } from "@/lib/format";
import { titelVariante, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

export const revalidate = 604800;
export const dynamicParams = true;

/** Die überregionalen Wege vorab; der Rest entsteht bei Abruf. */
export async function generateStaticParams() {
  return (await trailSeiten(400)).map((t) => ({ slug: t.slug }));
}

const NETZ: Record<string, string> = {
  iwn: "internationaler Fernwanderweg",
  nwn: "nationaler Fernwanderweg",
  rwn: "regionaler Wanderweg",
  lwn: "örtlicher Wanderweg",
};

const km = (v: string | null) =>
  v ? `${Number(v).toLocaleString("de-DE", { maximumFractionDigits: 1 })} km` : null;

export async function generateMetadata({
  params,
}: PageProps<"/wanderweg/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = await trailBySlug(slug);
  if (!t) return { title: "Wanderweg nicht gefunden" };
  const punkte = `${nf.format(t.parkplatz_count)} ${t.parkplatz_count === 1 ? "Ausgangspunkt" : "Ausgangspunkte"}`;
  return {
    // Gesucht wird "Wanderparkplatz <Wegname>" — der Wegname allein vorn
    // ließ die Seite bei dieser Formulierung auf Position 21 stehen.
    title: titelVariante(
      `Wanderparkplatz ${t.name} – ${punkte}`,
      `Wanderparkplatz ${t.name}`,
    ),
    description: beschreibung(
      `${nf.format(t.parkplatz_count)} ${t.parkplatz_count === 1 ? "Wanderparkplatz" : "Wanderparkplätze"} am ${t.name}` +
        `${km(t.laenge_km) ? `, ${km(t.laenge_km)} lang` : ""}` +
        `${t.markierung ? `, Markierung ${t.markierung}` : ""}. Stellplätze, Gebühren und Anfahrt.`,
    ),
    alternates: { canonical: `/wanderweg/${t.slug}` },
  };
}

export default async function WanderwegSeite({ params }: PageProps<"/wanderweg/[slug]">) {
  const { slug } = await params;
  const t = await trailBySlug(slug);
  if (!t) notFound();

  const [plaetze, kreise, verwandt] = await Promise.all([
    parkplaetzeAmTrail(t.id),
    kreiseAmTrail(t.id),
    verwandteTrails(t.id),
  ]);
  if (!plaetze.length) notFound();

  const laender = [...new Set(plaetze.map((p) => p.bl_name).filter(Boolean))] as string[];
  const kostenfrei = plaetze.filter((p) => p.gebuehr === false).length;

  const merkmale = [
    t.netz ? NETZ[t.netz] : null,
    km(t.laenge_km),
    t.markierung ? `Markierung: ${t.markierung}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Wanderparkplätze am ${t.name}`,
          url: `${SITE}/wanderweg/${t.slug}`,
          about: {
            "@type": "Place",
            name: t.name,
            ...(t.laenge_km
              ? {
                  additionalProperty: {
                    "@type": "PropertyValue",
                    name: "Länge",
                    value: `${t.laenge_km} km`,
                  },
                }
              : {}),
          },
        })}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Wanderwege", url: "/wanderwege" },
        ]}
        aktuell={t.name}
      />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze am {t.name}
      </h1>

      {merkmale.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-muted">
          {t.ref && (
            <span className="rounded border border-line px-1.5 py-0.5 text-sm tabular-nums">
              {t.ref}
            </span>
          )}
          <span>{merkmale.join(" · ")}</span>
        </p>
      )}

      <p className="mt-4 text-lg leading-relaxed text-muted">
        {`Am ${t.name} sind ${nf.format(t.parkplatz_count)} ` +
          `${t.parkplatz_count === 1 ? "Wanderparkplatz" : "Wanderparkplätze"} erfasst` +
          `${kostenfrei > 0 ? `, davon ${nf.format(kostenfrei)} nachweislich kostenfrei` : ""}.` +
          `${laender.length ? ` Der Weg berührt ${aufzaehlung(laender)}.` : ""}` +
          ` Alle Plätze liegen höchstens 200 Meter vom Wegverlauf entfernt — sie eignen sich` +
          ` als Ausgangspunkt für eine Runde oder als Ein- und Ausstieg einer Etappe.`}
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Parkplätze am Weg</h2>
        <div className="mt-4">
          <ParkplatzListe items={plaetze} />
        </div>
        <p className="mt-3 text-sm text-muted">
          Sortiert nach Vollständigkeit der Angaben, nicht nach Wegverlauf. Der Verlauf des
          Weges selbst ist hier nicht abgebildet — maßgeblich ist die Markierung vor Ort.
        </p>
      </section>

      {kreise.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Landkreise am Weg</h2>
          <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
            {kreise.map((k) => (
              <li
                key={k.slug}
                className="flex items-baseline justify-between gap-2 border-b border-line py-2"
              >
                <Link href={`/kreis/${k.slug}`} className="truncate hover:text-accent">
                  {k.name}
                </Link>
                <span className="shrink-0 text-sm tabular-nums text-muted">{k.poi_count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {verwandt.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Wege an denselben Parkplätzen</h2>
          <ul className="mt-4 divide-y divide-line">
            {verwandt.map((v) => (
              <li key={v.slug} className="py-2.5">
                <Link href={`/wanderweg/${v.slug}`} className="font-medium hover:text-accent">
                  {v.name}
                </Link>
                <span className="block text-sm text-muted">
                  {[v.netz ? NETZ[v.netz] : null, km(v.laenge_km), `${v.parkplatz_count} Parkplätze`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
