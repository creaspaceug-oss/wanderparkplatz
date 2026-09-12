import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import RegionListe from "@/components/RegionListe";
import Block from "@/components/Block";
import Brotkrumen from "@/components/Brotkrumen";
import SammlungLd from "@/components/SammlungLd";
import Faktenkarte from "@/components/Faktenkarte";
import WegeListe from "@/components/WegeListe";
import ZieleListe from "@/components/ZieleListe";
import Umfeld from "@/components/Umfeld";
import {
  parkplaetzeIn, alleSlugs, wanderwegeImLand, zieleImLand, umfeldImLand,
} from "@/lib/db";
import { bundeslandBySlug, kreiseIn } from "@/lib/queries";
import { nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { landDativ, landDativGross } from "@/lib/regionen";

export const revalidate = 604800;

export async function generateStaticParams() {
  return (await alleSlugs("bundesland")).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/bundesland/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const bl = await bundeslandBySlug(slug);
  if (!bl) return { title: "Bundesland nicht gefunden" };
  return {
    title: titel(`Wanderparkplätze ${landDativ(bl.name)} (${nf.format(bl.poi_count)})`),
    description: beschreibung(
      `Alle ${nf.format(bl.poi_count)} Wanderparkplätze ${landDativ(bl.name)}: Wanderwege ab dem Platz, Stellplätze, Gebühren und Untergrund — nach Landkreisen geordnet.`,
    ),
    alternates: { canonical: `/bundesland/${bl.slug}` },
  };
}

export default async function BundeslandSeite({ params }: PageProps<"/bundesland/[slug]">) {
  const { slug } = await params;
  const bl = await bundeslandBySlug(slug);
  if (!bl) notFound();

  const [kreise, top, wege, ziele, umfeld] = await Promise.all([
    kreiseIn(bl.id),
    parkplaetzeIn("bundesland_id", bl.id, 40),
    wanderwegeImLand(bl.id, 16),
    zieleImLand(bl.id, 12),
    umfeldImLand(bl.id),
  ]);

  const kostenfrei = top.filter((p) => p.gebuehr === false).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SammlungLd
        name={`Wanderparkplätze ${landDativ(bl.name)}`}
        pfad={`/bundesland/${bl.slug}`}
        art="AdministrativeArea"
        ueber={bl.name}
        anzahl={bl.poi_count}
      />

      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell={bl.name} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze {landDativ(bl.name)}
      </h1>

      <div className="mt-4 space-y-4 text-lg text-muted">
        <p>
          {`${landDativGross(bl.name)} ${bl.poi_count === 1 ? "ist ein Wanderparkplatz" : `sind ${nf.format(bl.poi_count)} Wanderparkplätze`} verzeichnet` +
            (kreise.length
              ? `, verteilt auf ${nf.format(kreise.length)} ${kreise.length === 1 ? "Landkreis beziehungsweise kreisfreie Stadt" : "Landkreise und kreisfreie Städte"}`
              : "") +
            "." +
            (kostenfrei > 0
              ? ` Unter den ausführlich erfassten ${kostenfrei === 1 ? "ist einer" : `sind ${nf.format(kostenfrei)}`} nachweislich kostenfrei.`
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
            titel={`Daten zu ${bl.name}`}
            eintraege={[
              ["Wanderparkplätze", nf.format(bl.poi_count)],
              ["Landkreise", kreise.length ? nf.format(kreise.length) : null],
              ["Markierte Wanderwege", wege.length ? nf.format(wege.length) : null],
              ["Wanderziele", ziele.length ? nf.format(ziele.length) : null],
            ]}
          />

          {kreise.length > 0 && (
            <Block titel={`Landkreise ${landDativ(bl.name)}`}>
              <RegionListe items={kreise} basis="kreis" spalten={1} />
            </Block>
          )}
        </aside>

        <div className="order-2 space-y-6 lg:order-1">
          <Block titel={`Ausführlich erfasste Wanderparkplätze ${landDativ(bl.name)}`}>
            <ParkplatzListe items={top} />
          </Block>

          {wege.length > 0 && (
            <Block titel={`Wanderwege ${landDativ(bl.name)}`}>
              <WegeListe items={wege} maxSichtbar={10} />
            </Block>
          )}

          {ziele.length > 0 && (
            <Block
              titel={`Wanderziele ${landDativ(bl.name)}`}
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
        </div>
      </div>
    </div>
  );
}
