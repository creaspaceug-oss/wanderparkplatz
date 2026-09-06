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
import { ortstext } from "@/lib/ortstext";
import { zielTitel } from "@/lib/zielart";
import { titel, beschreibung } from "@/lib/meta";
import { VORRENDERN } from "@/lib/vorrendern";
import Link from "next/link";

export const revalidate = 604800;
export const dynamicParams = true;

/** OSM-Netzstufe → Einordnung für Leser. */
const NETZ: Record<string, string> = {
  iwn: "internationaler Fernwanderweg",
  nwn: "nationaler Fernwanderweg",
  rwn: "regionaler Wanderweg",
  lwn: "örtlicher Wanderweg",
};

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
          <ul className="mt-4 divide-y divide-line">
            {wege.map((w) => (
              <li key={w.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                <span className="font-medium">
                  {w.ref && (
                    <span className="mr-2 rounded border border-line px-1.5 py-0.5 text-xs tabular-nums text-muted">
                      {w.ref}
                    </span>
                  )}
                  {w.eigene_seite ? (
                    <Link href={`/wanderweg/${w.slug}`} className="hover:text-accent">
                      {w.name}
                    </Link>
                  ) : (
                    w.name
                  )}
                </span>
                <span className="text-sm text-muted">
                  {[
                    NETZ[w.netz ?? ""] ?? null,
                    w.markierung,
                    w.laenge_km ? `${Number(w.laenge_km).toLocaleString("de-DE")} km` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ziele.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Wanderziele in Reichweite</h2>
          <ul className="mt-4 divide-y divide-line">
            {ziele.map((z) => (
              <li key={z.slug} className="flex items-baseline gap-3 py-2.5">
                <span className="w-20 shrink-0 tabular-nums text-sm text-muted">
                  {z.distanz_m < 1000
                    ? `${z.distanz_m} m`
                    : `${(z.distanz_m / 1000).toFixed(1).replace(".", ",")} km`}
                </span>
                <span className="min-w-0">
                  {z.eigene_seite ? (
                    <Link href={`/ziel/${z.slug}`} className="font-medium hover:text-accent">
                      {z.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{z.name}</span>
                  )}
                  <span className="block text-sm text-muted">
                    {[zielTitel(z.art), z.hoehe_m ? `${nf.format(z.hoehe_m)} m` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
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
