import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import RegionListe from "@/components/RegionListe";
import WegeListe from "@/components/WegeListe";
import ZieleListe from "@/components/ZieleListe";
import Umfeld from "@/components/Umfeld";
import Brotkrumen from "@/components/Brotkrumen";
import {
  parkplaetzeIn, alleSlugs, wanderwegeImKreis, zieleImKreis, umfeldImKreis,
} from "@/lib/db";
import { kreisBySlug, orteIn, nachbarKreise } from "@/lib/queries";
import { nf } from "@/lib/format";
import { kreisDativ, kreisNominativ } from "@/lib/regionen";
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

  const [orte, plaetze, nachbarn, wege, ziele, umfeld] = await Promise.all([
    orteIn(k.id),
    parkplaetzeIn("kreis_id", k.id, MAX_LISTE),
    nachbarKreise(k.id, k.bundesland_id!, 8),
    wanderwegeImKreis(k.id, 16),
    zieleImKreis(k.id, 12),
    umfeldImKreis(k.id),
  ]);

  const kostenfrei = plaetze.filter((p) => p.gebuehr === false).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
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

      <RegionListe items={orte} basis="ort" titel={`Orte ${kreisDativ(k.name, k.typ)}`} />

      {wege.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Wanderwege {kreisDativ(k.name, k.typ)}</h2>
          <WegeListe items={wege} />
        </section>
      )}

      {ziele.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Wanderziele {kreisDativ(k.name, k.typ)}</h2>
          <ZieleListe items={ziele} />
          <p className="mt-3 text-sm text-muted">
            Luftlinie ab dem nächstgelegenen Parkplatz.
          </p>
        </section>
      )}

      <Umfeld items={umfeld} />

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          {plaetze.length >= MAX_LISTE ? "Wanderparkplätze" : "Alle Wanderparkplätze"} {kreisDativ(k.name, k.typ)}
        </h2>
        {plaetze.length >= MAX_LISTE && (
          <p className="mt-2 text-sm text-muted">
            Angezeigt werden die {nf.format(MAX_LISTE)} Plätze mit den vollständigsten
            Angaben. Die übrigen stehen auf den Ortsseiten weiter oben.
          </p>
        )}
        <div className="mt-4">
          <ParkplatzListe items={plaetze} />
        </div>
      </section>

      <RegionListe items={nachbarn} basis="kreis" titel={`Weitere Landkreise in ${k.bl_name}`} />
    </div>
  );
}
