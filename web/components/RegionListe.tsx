import Link from "next/link";
import { nf } from "@/lib/format";
import type { RegionZeile } from "@/lib/queries";

const SPALTEN: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * Regionen mit ihrem Bestand, als Raster.
 *
 * Ohne eigene Überschrift: Die Liste steht mal in der Hauptspalte, mal in
 * der schmalen Seitenspalte, und die Rahmung kommt vom umgebenden Block.
 * `spalten` deckt den Unterschied ab — drei Spalten in 20 Rem breiter
 * Seitenspalte wären Buchstabensalat.
 */
export default function RegionListe({
  items,
  basis,
  spalten = 3,
}: {
  items: RegionZeile[];
  basis: "bundesland" | "kreis" | "ort";
  spalten?: 1 | 2 | 3;
}) {
  if (!items.length) return null;

  return (
    <ul className={`grid gap-x-6 ${SPALTEN[spalten]}`}>
      {items.map((r) => (
        <li
          key={r.slug}
          className="flex items-baseline justify-between gap-2 border-b border-line py-2"
        >
          <Link href={`/${basis}/${r.slug}`} className="truncate hover:text-accent">
            {r.name}
          </Link>{" "}
          <span className="shrink-0 text-sm tabular-nums text-muted">
            {nf.format(r.poi_count)}
          </span>
        </li>
      ))}
    </ul>
  );
}
