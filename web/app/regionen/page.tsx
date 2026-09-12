import type { Metadata } from "next";
import Brotkrumen from "@/components/Brotkrumen";
import RegionKarten from "@/components/RegionKarten";
import { regionBestaende } from "@/lib/db";
import { WANDERREGIONEN } from "@/lib/wanderregionen";
import { nf } from "@/lib/format";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Wanderparkplätze nach Wanderregion",
  description:
    "Schwarzwald, Harz, Eifel, Sauerland und weitere Wanderregionen — mit der Zahl erfasster Wanderparkplätze und den Fernwanderwegen der Region.",
  alternates: { canonical: "/regionen" },
};

export default async function RegionenSeite() {
  const bestaende = await regionBestaende(WANDERREGIONEN);
  const proSlug = new Map(bestaende.map((b) => [b.slug, b]));

  const regionen = WANDERREGIONEN.map((r) => ({ ...r, bestand: proSlug.get(r.slug)?.n ?? 0 }))
    .filter((r) => r.bestand > 0)
    .sort((a, b) => b.bestand - a.bestand);

  const gesamt = regionen.reduce((s, r) => s + r.bestand, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Wanderregionen" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze nach Wanderregion
      </h1>
      <p className="mt-4 text-lg text-muted">
        Wanderregionen folgen der Landschaft, nicht den Verwaltungsgrenzen. Deshalb sind hier{" "}
        {regionen.length} Regionen mit Mittelpunkt und Radius hinterlegt — zusammen{" "}
        {nf.format(gesamt)} Wanderparkplätze, wobei sich benachbarte Regionen überschneiden
        können.
      </p>

      <div className="mt-8">
        <RegionKarten regionen={regionen} obenAufDerSeite />
      </div>

      <p className="mt-8 text-sm text-muted">
        Regionen ohne erfasste Wanderparkplätze werden nicht aufgeführt. Der Datenbestand
        wächst laufend — sobald in einer Region Plätze erfasst sind, erscheint sie hier.
      </p>
    </div>
  );
}
