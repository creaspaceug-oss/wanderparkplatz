import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import Brotkrumen from "@/components/Brotkrumen";
import {
  trailBySlug, parkplaetzeAmTrail, kreiseAmTrail, trailSeiten, verwandteTrails,
  zieleAmTrail, orteAmTrail, umfeldAmTrail,
} from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titelVariante, kuerzeMitte, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";
import ZieleListe from "@/components/ZieleListe";
import Umfeld from "@/components/Umfeld";
import Block from "@/components/Block";
import Faktenkarte from "@/components/Faktenkarte";
import RegionListe from "@/components/RegionListe";
import { wegtext } from "@/lib/detailtext";

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
    //
    // Passt der volle Titel nicht, fällt zuerst die Zahl der Ausgangspunkte
    // weg und der Name bekommt den ganzen Platz. Gekürzt wird dann in der
    // Mitte: Bei Etappen und Teilstücken steht die Unterscheidung hinten.
    title: titelVariante(
      `Wanderparkplatz ${t.name} – ${punkte}`,
      `Wanderparkplatz ${kuerzeMitte(t.name, 60 - "Wanderparkplatz ".length)}`,
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

  const [plaetze, kreise, verwandt, ziele, orte, umfeld] = await Promise.all([
    parkplaetzeAmTrail(t.id),
    kreiseAmTrail(t.id),
    verwandteTrails(t.id),
    zieleAmTrail(t.id),
    orteAmTrail(t.id),
    umfeldAmTrail(t.id),
  ]);
  if (!plaetze.length) notFound();

  const laender = [...new Set(plaetze.map((p) => p.bl_name).filter(Boolean))] as string[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
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

      {/* Keine Karte: Ein Punktmarker für einen Weg über 180 Kilometer sagt
          nichts. Die Seitenspalte trägt hier die harten Angaben und die
          Landkreise, durch die der Weg führt. */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <aside className="order-1 space-y-6 lg:order-2">
          <Faktenkarte
            titel="Daten zum Weg"
            eintraege={[
              ["Einordnung", t.netz ? NETZ[t.netz] : null],
              ["Länge", km(t.laenge_km)],
              ["Markierung", t.markierung],
              ["Kürzel", t.ref],
              ["Wanderparkplätze", nf.format(t.parkplatz_count)],
              ["Bundesländer", laender.length ? laender.join(", ") : null],
            ]}
          />

          {kreise.length > 0 && (
            <Block titel="Landkreise am Weg">
              <RegionListe
                items={kreise.map((k) => ({
                  slug: k.slug,
                  name: k.name,
                  poi_count: k.poi_count,
                }))}
                basis="kreis"
                spalten={1}
              />
            </Block>
          )}
        </aside>

        <div className="order-2 space-y-6 lg:order-1">
          <div className="space-y-4 text-lg leading-relaxed text-muted">
            {wegtext(t, plaetze, ziele, orte, laender, umfeld).map((a) => (
              <p key={a.slice(0, 40)}>{a}</p>
            ))}
          </div>

          <Block
            titel="Parkplätze am Weg"
            fussnote="Sortiert nach Vollständigkeit der Angaben, nicht nach Wegverlauf. Der Verlauf des Weges selbst ist hier nicht abgebildet — maßgeblich ist die Markierung vor Ort."
          >
            <ParkplatzListe items={plaetze} />
          </Block>

          {ziele.length > 0 && (
            <Block
              titel="Wanderziele am Weg"
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz am Weg, nicht ab dem Wegverlauf."
            >
              <ZieleListe items={ziele} />
            </Block>
          )}

          {umfeld.length > 0 && (
            <Block
              titel="In Laufweite der Parkplätze"
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz am Weg. Öffnungszeiten und Fahrpläne sind nicht erfasst."
            >
              <Umfeld items={umfeld} />
            </Block>
          )}

          {orte.length > 1 && (
            <Block titel="Orte am Weg">
              <RegionListe
                items={orte.map((o) => ({ slug: o.slug, name: o.name, poi_count: o.poi_count }))}
                basis="ort"
                spalten={2}
              />
            </Block>
          )}

          {verwandt.length > 0 && (
            <Block titel="Wege an denselben Parkplätzen">
              <ul className="divide-y divide-line">
                {verwandt.map((v) => (
                  <li key={v.slug} className="py-3">
                    <Link href={`/wanderweg/${v.slug}`} className="font-medium hover:text-accent">
                      {v.name}
                    </Link>
                    <span className="block text-sm text-muted">
                      {[
                        v.netz ? NETZ[v.netz] : null,
                        km(v.laenge_km),
                        `${v.parkplatz_count} Parkplätze`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      </div>
    </div>
  );
}
