import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import Brotkrumen from "@/components/Brotkrumen";
import SammlungLd from "@/components/SammlungLd";
import {
  parkplaetzeIn, umkreis, alleSlugs, wanderwegeImOrt, umfeldImOrt, zieleImOrt,
} from "@/lib/db";
import { ortBySlug } from "@/lib/queries";
import { nf, km } from "@/lib/format";
import { bildFuer } from "@/lib/bild";
import CommonsBild from "@/components/CommonsBild";
import Umfeld from "@/components/Umfeld";
import Block from "@/components/Block";
import Karte from "@/components/Karte";
import Faktenkarte from "@/components/Faktenkarte";
import WegeListe from "@/components/WegeListe";
import ZieleListe from "@/components/ZieleListe";
import { ortstext } from "@/lib/ortstext";
import { titel, beschreibung } from "@/lib/meta";
import { VORRENDERN } from "@/lib/vorrendern";
import Link from "next/link";

export const revalidate = 604800;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await alleSlugs("ort", VORRENDERN.ort)).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ort/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const o = await ortBySlug(slug);
  if (!o) return { title: "Ort nicht gefunden" };
  return {
    // Ortsnamen wiederholen sich: 74 Namen kommen mehrfach vor. Ohne den
    // Kreis im Titel hätten diese Seiten byte-identische Titel und
    // konkurrierten miteinander um dieselbe Anfrage.
    title: titel(
      `Wanderparkplatz ${o.name}${o.kreis_name ? ` (${o.kreis_name})` : ""}` +
        `: ${nf.format(o.poi_count)} ${o.poi_count === 1 ? "Ausgangspunkt" : "Ausgangspunkte"}`,
    ),
    description: beschreibung(
      `Wanderparkplätze in und um ${o.name}${o.kreis_name ? ` (${o.kreis_name})` : ""}: Wanderwege ab dem Platz, Stellplätze, Gebühren und Anfahrt.`,
    ),
    alternates: { canonical: `/ort/${o.slug}` },
  };
}

export default async function OrtSeite({ params }: PageProps<"/ort/[slug]">) {
  const { slug } = await params;
  const o = await ortBySlug(slug);
  if (!o) notFound();

  const [zugeordnet, weitere, bild, wege, umfeld, ziele] = await Promise.all([
    parkplaetzeIn("ort_id", o.id, 60),
    umkreis(o.lat, o.lon, 15, 30),
    bildFuer(o.wikidata ?? null),
    wanderwegeImOrt(o.id),
    umfeldImOrt(o.id),
    zieleImOrt(o.id),
  ]);
  const eigene = new Set(zugeordnet.map((p) => p.id));
  const umgebung = weitere.filter((p) => !eigene.has(p.id)).slice(0, 12);

  const pfad = [{ name: "Startseite", url: "/" }];
  if (o.bl_slug) pfad.push({ name: o.bl_name!, url: `/bundesland/${o.bl_slug}` });
  if (o.kreis_slug) pfad.push({ name: o.kreis_name!, url: `/kreis/${o.kreis_slug}` });

  const koord = `${o.lat.toFixed(5)}, ${o.lon.toFixed(5)}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SammlungLd
        name={`Wanderparkplätze in ${o.name}`}
        pfad={`/ort/${o.slug}`}
        art="Place"
        ueber={o.name}
        anzahl={o.poi_count}
        lat={o.lat}
        lon={o.lon}
      />

      <Brotkrumen pfad={pfad} aktuell={o.name} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Wanderparkplätze in {o.name}</h1>

      {/* Wie auf den Parkplatzseiten: Lage und harte Zahlen in einer eigenen
          Spalte, auf dem Handy vor dem Fließtext. */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <aside className="order-1 space-y-6 lg:order-2">
          <section className="rounded-xl border border-line bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Lage</h2>
            <Karte lat={o.lat} lon={o.lon} titel={o.name} hoeheKm={4} />
            <p className="mt-3 text-sm text-muted">
              Ortsmitte, <span className="tabular-nums text-foreground">{koord}</span>. Die
              Parkplätze liegen im Umkreis.
            </p>
          </section>

          <Faktenkarte
            titel={`Daten zu ${o.name}`}
            eintraege={[
              ["Wanderparkplätze", nf.format(o.poi_count)],
              ["Landkreis", o.kreis_name ?? null],
              ["Bundesland", o.bl_name ?? null],
              ["Einwohner", o.einwohner ? nf.format(o.einwohner) : null],
            ]}
          />
        </aside>

        <div className="order-2 space-y-6 lg:order-1">
          {bild && (
            <CommonsBild bild={bild} alt={`Ansicht von ${o.name}`} breite={1200} hoehe={675} prioritaet />
          )}

          <div className="space-y-4 text-lg leading-relaxed text-muted">
            {ortstext(o, zugeordnet, wege, ziele).map((a) => (
              <p key={a.slice(0, 40)}>{a}</p>
            ))}
          </div>

          <Block titel={`Wanderparkplätze bei ${o.name}`}>
            <ParkplatzListe items={zugeordnet} />
          </Block>

          {wege.length > 0 && (
            <Block titel={`Wanderwege ab ${o.name}`}>
              <WegeListe items={wege} maxSichtbar={10} />
            </Block>
          )}

          {ziele.length > 0 && (
            <Block
              titel="Wanderziele in Reichweite"
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz."
            >
              <ZieleListe items={ziele} />
            </Block>
          )}

          {umfeld.length > 0 && (
            <Block
              titel="In Laufweite"
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz. Öffnungszeiten und Fahrpläne sind nicht erfasst."
            >
              <Umfeld items={umfeld} />
            </Block>
          )}

          {umgebung.length > 0 && (
            <Block titel="Weitere Ausgangspunkte im Umkreis">
              <ul className="divide-y divide-line">
                {umgebung.map((pl) => (
                  <li key={pl.slug} className="flex items-start justify-between gap-4 py-3">
                    <span className="min-w-0">
                      <Link
                        href={`/wanderparkplatz/${pl.slug}`}
                        className="font-medium hover:text-accent"
                      >
                        {pl.name}
                      </Link>
                      {pl.ort_name && pl.ort_name !== o.name && (
                        <span className="block text-sm text-muted">{pl.ort_name}</span>
                      )}
                    </span>
                    <span className="shrink-0 pt-0.5 text-sm tabular-nums text-muted">
                      {km(pl.km)} km
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
