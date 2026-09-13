import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import RegionListe from "@/components/RegionListe";
import Faktenkarte from "@/components/Faktenkarte";
import OhneAuto from "@/components/OhneAuto";
import WegeListe from "@/components/WegeListe";
import ZieleListe from "@/components/ZieleListe";
import Umfeld from "@/components/Umfeld";
import Block from "@/components/Block";
import Brotkrumen from "@/components/Brotkrumen";
import SammlungLd from "@/components/SammlungLd";
import {
  parkplaetzeIn, alleSlugs, wanderwegeImKreis, zieleImKreis, umfeldImKreis, oepnvFuerRegion,
} from "@/lib/db";
import { kreisBySlug, orteIn, nachbarKreise } from "@/lib/queries";
import { nf } from "@/lib/format";
import { kreisTitel, kreisDativ, kreisNominativ } from "@/lib/regionen";
import { titel, beschreibung } from "@/lib/meta";
import { VORRENDERN } from "@/lib/vorrendern";

/** Obergrenze je Kreisseite; darüber wird auf die Ortsseiten verwiesen. */
const MAX_LISTE = 400;

export const revalidate = 604800;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await alleSlugs("kreis", VORRENDERN.kreis)).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kreis/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const k = await kreisBySlug(slug);
  if (!k) return { title: "Landkreis nicht gefunden" };
  return {
    title: titel(`Wanderparkplätze ${kreisDativ(k.name, k.typ)} (${nf.format(k.poi_count)})`),
    description: beschreibung(
      `Alle ${nf.format(k.poi_count)} Wanderparkplätze ${kreisDativ(k.name, k.typ)} (${k.bl_name}): Wanderwege ab dem Platz, Stellplätze, Gebühren und Anfahrt.`,
    ),
    alternates: { canonical: `/kreis/${k.slug}` },
  };
}

export default async function KreisSeite({ params }: PageProps<"/kreis/[slug]">) {
  const { slug } = await params;
  const k = await kreisBySlug(slug);
  if (!k) notFound();

  const [orte, plaetze, nachbarn, wege, ziele, umfeld, ohneAuto] = await Promise.all([
    orteIn(k.id),
    parkplaetzeIn("kreis_id", k.id, MAX_LISTE),
    nachbarKreise(k.id, k.bundesland_id!, 8),
    wanderwegeImKreis(k.id, 16),
    zieleImKreis(k.id, 12),
    umfeldImKreis(k.id),
    oepnvFuerRegion("kreis_id", k.id),
  ]);

  const kostenfrei = plaetze.filter((p) => p.gebuehr === false).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SammlungLd
        name={`Wanderparkplätze ${kreisDativ(k.name, k.typ)}`}
        pfad={`/kreis/${k.slug}`}
        art="AdministrativeArea"
        ueber={kreisTitel(k.name, k.typ)}
        anzahl={k.poi_count}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: k.bl_name!, url: `/bundesland/${k.bl_slug}` },
        ]}
        aktuell={k.name}
      />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze {kreisDativ(k.name, k.typ)}
      </h1>
      {/* Ein Satz, eine Zeichenkette: aus JSX zusammengesetzt entstünden
          Leerzeichen vor Komma und Punkt. Einzahl und Mehrzahl an jeder
          Stelle, sonst steht auf 61 Kreisseiten "1 Wanderparkplätze". */}
      <div className="mt-4 space-y-4 text-lg text-muted">
        <p>
          {`${nf.format(k.poi_count)} ${k.poi_count === 1 ? "Wanderparkplatz ist" : "Wanderparkplätze sind"} hier erfasst` +
            (orte.length
              ? `, verteilt auf ${nf.format(orte.length)} ${orte.length === 1 ? "Ort" : "Orte"}`
              : "") +
            `. ${kreisNominativ(k.name, k.typ)} liegt in ${k.bl_name}.` +
            (kostenfrei > 0
              ? ` ${nf.format(kostenfrei)} ${kostenfrei === 1 ? "Platz ist" : "Plätze sind"} nachweislich kostenfrei.`
              : "")}
        </p>
        {wege.length > 0 && (
          <p>
            {`Ab diesen Parkplätzen ${wege.length === 1 ? "führt ein markierter Wanderweg" : `führen ${nf.format(wege.length)} markierte Wanderwege`} weiter` +
              (ziele.length
                ? `, und ${ziele.length === 1 ? "ein Wanderziel liegt" : `${nf.format(ziele.length)} Wanderziele liegen`} in Reichweite`
                : "") +
              "."}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <aside className="order-1 space-y-6 lg:order-2">
          <Faktenkarte
            titel={`Daten ${kreisDativ(k.name, k.typ)}`}
            eintraege={[
              ["Wanderparkplätze", nf.format(k.poi_count)],
              ["davon kostenfrei", kostenfrei > 0 ? nf.format(kostenfrei) : null],
              ["Orte mit Bestand", orte.length ? nf.format(orte.length) : null],
              ["Markierte Wanderwege", wege.length ? nf.format(wege.length) : null],
              ["Wanderziele", ziele.length ? nf.format(ziele.length) : null],
              ["Bundesland", k.bl_name ?? null],
            ]}
          />

          {nachbarn.length > 0 && (
            <Block titel={`Weitere Landkreise in ${k.bl_name}`}>
              <RegionListe items={nachbarn} basis="kreis" spalten={1} />
            </Block>
          )}
        </aside>

        <div className="order-2 space-y-6 lg:order-1">
          <Block
            titel={`${plaetze.length >= MAX_LISTE ? "Wanderparkplätze" : "Alle Wanderparkplätze"} ${kreisDativ(k.name, k.typ)}`}
            einleitung={
              plaetze.length >= MAX_LISTE
                ? `Angezeigt werden die ${nf.format(MAX_LISTE)} Plätze mit den vollständigsten Angaben. Die übrigen stehen auf den Ortsseiten.`
                : undefined
            }
          >
            <ParkplatzListe items={plaetze} />
          </Block>

          {orte.length > 0 && (
            <Block titel={`Orte ${kreisDativ(k.name, k.typ)}`}>
              <RegionListe items={orte} basis="ort" spalten={2} />
            </Block>
          )}

          {wege.length > 0 && (
            <Block titel={`Wanderwege ${kreisDativ(k.name, k.typ)}`}>
              <WegeListe items={wege} maxSichtbar={10} />
            </Block>
          )}

          {ziele.length > 0 && (
            <Block
              titel={`Wanderziele ${kreisDativ(k.name, k.typ)}`}
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz."
            >
              <ZieleListe items={ziele} />
            </Block>
          )}

          <OhneAuto daten={ohneAuto} region={kreisDativ(k.name, k.typ)} />

          {umfeld.length > 0 && (
            <Block
              titel="In Laufweite"
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz. Öffnungszeiten und Fahrpläne sind nicht erfasst."
            >
              <Umfeld items={umfeld} />
            </Block>
          )}
        </div>
      </div>
    </div>
  );
}
