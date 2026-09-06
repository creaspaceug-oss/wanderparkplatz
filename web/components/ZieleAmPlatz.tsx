import Link from "next/link";
import { zielTitel } from "@/lib/zielart";
import { nf } from "@/lib/format";

interface Eintrag {
  slug: string;
  name: string;
  art: string;
  hoehe_m: number | null;
  distanz_m: number;
  eigene_seite: boolean;
}

const meter = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

export default function ZieleAmPlatz({ items }: { items: Eintrag[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Ziele in Reichweite</h2>
      <ul className="mt-4 divide-y divide-line">
        {items.map((z) => (
          <li key={z.slug} className="flex items-baseline gap-3 py-2.5">
            <span className="w-20 shrink-0 tabular-nums text-sm text-muted">
              {meter(z.distanz_m)}
            </span>
            <span className="min-w-0">
              {/* Nur verlinken, wo es auch eine Seite gibt. */}
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
      <p className="mt-3 text-sm text-muted">
        Luftlinie ab dem Parkplatz. Der Weg dorthin ist je nach Gelände deutlich länger.
      </p>
    </section>
  );
}
