import Link from "next/link";
import type { OrtTrail } from "@/lib/db";

/** OSM-Netzstufe → Einordnung für Leser. */
const NETZ: Record<string, string> = {
  iwn: "internationaler Fernwanderweg",
  nwn: "nationaler Fernwanderweg",
  rwn: "regionaler Wanderweg",
  lwn: "örtlicher Wanderweg",
};

/**
 * Liste markierter Wanderwege. Genutzt von Orts-, Ziel- und Wegseiten.
 *
 * Verlinkt wird nur, wo es eine Seite gibt: Wege mit zu wenig Substanz
 * bleiben als Name stehen, statt ins Leere zu führen.
 */
export default function WegeListe({ items }: { items: OrtTrail[] }) {
  if (!items.length) return null;

  return (
    <ul className="mt-4 divide-y divide-line">
      {items.map((w) => (
        <li key={w.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
          <span className="font-medium">
            {w.ref && (
              <span className="mr-2 rounded border border-line px-1.5 py-0.5 text-xs tabular-nums text-muted">
                {w.ref}
              </span>
            )}
            {w.eigene_seite ? (
              <Link href={`/wanderweg/${w.slug}`} className="hover:text-accent">
                {w.name}
              </Link>
            ) : (
              w.name
            )}
          </span>
          <span className="text-sm text-muted">
            {[
              NETZ[w.netz ?? ""] ?? null,
              w.markierung,
              w.laenge_km ? `${Number(w.laenge_km).toLocaleString("de-DE")} km` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </li>
      ))}
    </ul>
  );
}
