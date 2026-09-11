import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import Brotkrumen from "@/components/Brotkrumen";
import {
  parkplaetzeIn, umkreis, alleSlugs, wanderwegeImOrt, umfeldImOrt, zieleImOrt,
} from "@/lib/db";
import { ortBySlug } from "@/lib/queries";
import { nf, km } from "@/lib/format";
import { bildFuer } from "@/lib/bild";
import CommonsBild from "@/components/CommonsBild";
import Umfeld from "@/components/Umfeld";
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen pfad={pfad} aktuell={o.name} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Wanderparkplätze in {o.name}</h1>
      {bild && (
        <CommonsBild
          bild={bild}
          alt={`Ansicht von ${o.name}`}
          breite={1200}
          hoehe={675}
          prioritaet
          klasse="mt-5"
        />
      )}
      <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
        {ortstext(o, zugeordnet, wege, ziele).map((a) => (
          <p key={a.slice(0, 40)}>{a}</p>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Wanderparkplätze bei {o.name}</h2>
        <div className="mt-4">
          <ParkplatzListe items={zugeordnet} />
        </div>
      </section>

      {wege.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Wanderwege ab {o.name}</h2>
          <WegeListe items={wege} />
        </section>
      )}

      {ziele.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Wanderziele in Reichweite</h2>
          <ZieleListe items={ziele} />
          <p className="mt-3 text-sm text-muted">
            Luftlinie ab dem nächstgelegenen Parkplatz.
          </p>
        </section>
      )}

      <Umfeld items={umfeld} />

      {umgebung.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Weitere Ausgangspunkte im Umkreis</h2>
          <ul className="mt-4 divide-y divide-line">
            {umgebung.map((p) => (
              <li key={p.slug} className="flex items-baseline gap-3 py-2.5">
                <span className="w-16 shrink-0 tabular-nums text-sm text-muted">{km(p.km)} km</span>
                <span>
                  <Link href={`/wanderparkplatz/${p.slug}`} className="font-medium hover:text-accent">
                    {p.name}
                  </Link>
                  {p.ort_name && p.ort_name !== o.name && (
                    <span className="block text-sm text-muted">{p.ort_name}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
