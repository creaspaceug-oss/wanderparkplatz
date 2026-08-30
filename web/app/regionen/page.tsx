import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
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

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {regionen.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/region/${r.slug}`}
              className="flex h-full flex-col rounded-xl border border-line bg-card p-4 transition hover:border-accent"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{r.name}</span>
                <span className="shrink-0 text-sm tabular-nums text-muted">
                  {nf.format(r.bestand)}
                </span>
              </span>
              <span className="mt-1 text-sm text-muted">{r.kurz}</span>
              <span className="mt-2 text-xs text-muted">{r.laender.join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-muted">
        Regionen ohne erfasste Wanderparkplätze werden nicht aufgeführt. Der Datenbestand
        wächst laufend — sobald in einer Region Plätze erfasst sind, erscheint sie hier.
      </p>
    </div>
  );
}
