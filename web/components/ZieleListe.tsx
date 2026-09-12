import Link from "next/link";
import type { OrtZiel } from "@/lib/db";
import { zielTitel } from "@/lib/zielart";
import { nf } from "@/lib/format";

const meter = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

/**
 * Wanderziele mit Entfernung.
 *
 * Die Entfernung steht rechts und rechtsbündig, nicht als führende Spalte:
 * Gesucht wird nach einem Namen, sortiert wird nach Entfernung. Der Name
 * gehört deshalb an den Anfang der Zeile, wo der Blick ihn findet.
 */
export default function ZieleListe({ items }: { items: OrtZiel[] }) {
  if (!items.length) return null;

  return (
    <ul className="divide-y divide-line">
      {items.map((z) => (
        <li key={z.slug} className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0">
            {/* Nur verlinken, wo es auch eine Seite gibt. */}
            {z.eigene_seite ? (
              <Link href={`/ziel/${z.slug}`} className="font-medium hover:text-accent">
                {z.name}
              </Link>
            ) : (
              <span className="font-medium">{z.name}</span>
            )}{" "}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="rounded-full border border-line px-2 py-0.5 text-xs">
                {zielTitel(z.art)}
              </span>{" "}
              {z.hoehe_m != null && <span>{nf.format(z.hoehe_m)} m</span>}
            </div>
          </div>{" "}
          <span className="shrink-0 pt-0.5 text-sm tabular-nums text-muted">
            {meter(z.distanz_m)}
          </span>
        </li>
      ))}
    </ul>
  );
}
