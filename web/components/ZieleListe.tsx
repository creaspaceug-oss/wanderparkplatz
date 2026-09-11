import Link from "next/link";
import type { OrtZiel } from "@/lib/db";
import { zielTitel } from "@/lib/zielart";
import { nf } from "@/lib/format";

const meter = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

/**
 * Liste von Wanderzielen mit Entfernung. Genutzt von Orts- und Wegseiten.
 *
 * Verlinkt wird nur, wo es eine Seite gibt. Die Entfernung ist Luftlinie ab
 * dem nächstgelegenen Parkplatz — der Hinweis darauf gehört unter die Liste
 * und wird deshalb von der aufrufenden Seite gesetzt.
 */
export default function ZieleListe({ items }: { items: OrtZiel[] }) {
  if (!items.length) return null;

  return (
    <ul className="mt-4 divide-y divide-line">
      {items.map((z) => (
        <li key={z.slug} className="flex items-baseline gap-3 py-2.5">
          <span className="w-20 shrink-0 tabular-nums text-sm text-muted">
            {meter(z.distanz_m)}
          </span>
          <span className="min-w-0">
            {z.eigene_seite ? (
              <Link href={`/ziel/${z.slug}`} className="font-medium hover:text-accent">
                {z.name}
              </Link>
            ) : (
              <span className="font-medium">{z.name}</span>
            )}
            <span className="block text-sm text-muted">
              {[zielTitel(z.art), z.hoehe_m ? `${nf.format(z.hoehe_m)} m` : null]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
