import Link from "next/link";
import type { OrtTrail } from "@/lib/db";

/**
 * OSM-Netzstufe → kurzes Etikett plus Gewichtung.
 *
 * Vorher stand die volle Einordnung ("internationaler Fernwanderweg") als
 * Fließtext in jeder Zeile. Bei zwanzig Wegen untereinander liest das
 * niemand mehr — gleich lange graue Zeilen sind nicht überfliegbar. Als
 * kurzes Etikett mit Farbe trägt dieselbe Angabe den Blick durch die Liste.
 */
const NETZ: Record<string, { text: string; stark: boolean }> = {
  iwn: { text: "Fernwanderweg international", stark: true },
  nwn: { text: "Fernwanderweg", stark: true },
  rwn: { text: "regionaler Weg", stark: false },
  lwn: { text: "örtlicher Weg", stark: false },
};

const meter = (m: number) => (m <= 30 ? "direkt am Platz" : `${m} m entfernt`);

function Zeile({ w }: { w: OrtTrail }) {
  const netz = NETZ[w.netz ?? ""];
  const unten = [w.markierung, w.laenge_km ? `${Number(w.laenge_km).toLocaleString("de-DE")} km` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        {/* Kürzel im Textfluss, nicht als eigenes Flex-Kind: sonst rutscht
            es bei langen Namen auf eine eigene Zeile darüber. */}
        <p className="font-medium">
          {w.ref && (
            <span className="mr-2 rounded border border-line px-1.5 py-0.5 align-[0.1em] text-xs font-normal tabular-nums text-muted">
              {w.ref}
            </span>
          )}
          {/* Nur verlinken, wo es auch eine Seite gibt — sonst führte der
              Verweis ins Leere. */}
          {w.eigene_seite ? (
            <Link href={`/wanderweg/${w.slug}`} className="hover:text-accent">
              {w.name}
            </Link>
          ) : (
            w.name
          )}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          {netz && (
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs " +
                (netz.stark ? "bg-accent-soft text-foreground" : "border border-line")
              }
            >
              {netz.text}
            </span>
          )}
          {unten && <span>{unten}</span>}
        </div>
      </div>
      <span className="shrink-0 pt-0.5 text-sm tabular-nums text-muted">
        {meter(w.distanz_m)}
      </span>
    </li>
  );
}

export default function WegeListe({
  items,
  maxSichtbar,
}: {
  items: OrtTrail[];
  /** Darüber hinaus wird eingeklappt. Ohne Angabe stehen alle Wege offen. */
  maxSichtbar?: number;
}) {
  if (!items.length) return null;
  const grenze = maxSichtbar ?? items.length;
  const rest = items.length - grenze;

  return (
    <>
      <ul className="divide-y divide-line">
        {items.slice(0, grenze).map((w) => (
          <Zeile key={w.slug} w={w} />
        ))}
      </ul>

      {/* Eingeklappt heißt nicht entfernt: Die Wege stehen weiterhin
          vollständig im Quelltext und bleiben auffindbar. */}
      {rest > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-muted hover:text-accent">
            {`${rest} weitere Wege anzeigen`}
          </summary>
          <ul className="divide-y divide-line border-t border-line">
            {items.slice(grenze).map((w) => (
              <Zeile key={w.slug} w={w} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
