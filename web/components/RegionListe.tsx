import Link from "next/link";
import { nf } from "@/lib/format";
import type { RegionZeile } from "@/lib/queries";

export default function RegionListe({
  items,
  basis,
  titel,
}: {
  items: RegionZeile[];
  basis: "bundesland" | "kreis" | "ort";
  titel: string;
}) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{titel}</h2>
      <ul className="mt-4 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <li
            key={r.slug}
            className="flex items-baseline justify-between gap-2 border-b border-line py-2"
          >
            <Link href={`/${basis}/${r.slug}`} className="truncate hover:text-accent">
              {r.name}
            </Link>
            <span className="shrink-0 text-sm tabular-nums text-muted">
              {nf.format(r.poi_count)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
