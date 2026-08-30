import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import RegionListe from "@/components/RegionListe";
import Brotkrumen from "@/components/Brotkrumen";
import { parkplaetzeIn, alleSlugs } from "@/lib/db";
import { bundeslandBySlug, kreiseIn } from "@/lib/queries";
import { nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";

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
    title: titel(`Wanderparkplätze in ${bl.name} (${nf.format(bl.poi_count)})`),
    description: beschreibung(
      `Alle ${nf.format(bl.poi_count)} Wanderparkplätze in ${bl.name}: Wanderwege ab dem Platz, Stellplätze, Gebühren und Untergrund — nach Landkreisen geordnet.`,
    ),
    alternates: { canonical: `/bundesland/${bl.slug}` },
  };
}

export default async function BundeslandSeite({ params }: PageProps<"/bundesland/[slug]">) {
  const { slug } = await params;
  const bl = await bundeslandBySlug(slug);
  if (!bl) notFound();

  const [kreise, top] = await Promise.all([
    kreiseIn(bl.id),
    parkplaetzeIn("bundesland_id", bl.id, 40),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell={bl.name} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze in {bl.name}
      </h1>
      <p className="mt-4 text-lg text-muted">
        In {bl.name} sind {nf.format(bl.poi_count)} Wanderparkplätze verzeichnet, verteilt auf{" "}
        {nf.format(kreise.length)} Landkreise und kreisfreie Städte. Die Liste unten zeigt die
        Plätze mit den vollständigsten Angaben.
      </p>

      <RegionListe items={kreise} basis="kreis" titel={`Landkreise in ${bl.name}`} />

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Ausführlich erfasste Wanderparkplätze in {bl.name}
        </h2>
        <div className="mt-4">
          <ParkplatzListe items={top} />
        </div>
      </section>
    </div>
  );
}
