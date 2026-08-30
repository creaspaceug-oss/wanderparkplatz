import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import RegionListe from "@/components/RegionListe";
import Brotkrumen from "@/components/Brotkrumen";
import { parkplaetzeIn, alleSlugs } from "@/lib/db";
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

  const [orte, plaetze, nachbarn] = await Promise.all([
    orteIn(k.id),
    parkplaetzeIn("kreis_id", k.id, MAX_LISTE),
    nachbarKreise(k.id, k.bundesland_id!, 8),
  ]);

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
      <p className="mt-4 text-lg text-muted">
        {nf.format(k.poi_count)} Wanderparkplätze sind hier erfasst
        {orte.length > 0 && `, verteilt auf ${nf.format(orte.length)} Orte`}.{" "}
        {kreisNominativ(k.name, k.typ)} liegt in {k.bl_name}.
      </p>

      <RegionListe items={orte} basis="ort" titel={`Orte ${kreisDativ(k.name, k.typ)}`} />

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
