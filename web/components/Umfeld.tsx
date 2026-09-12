import type { UmfeldEintrag } from "@/lib/db";

const KATEGORIE: Record<string, string> = {
  einkehr: "Einkehr",
  oepnv: "Bus und Bahn",
  wc: "Toilette",
  aussicht: "Aussichtspunkt",
  infotafel: "Infotafel oder Wegweiser",
  schutzhuette: "Schutzhütte",
};

/** Reihenfolge nach Nutzen vor der Wanderung, nicht alphabetisch. */
const REIHENFOLGE = ["oepnv", "wc", "einkehr", "infotafel", "aussicht", "schutzhuette"];

const meter = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);

/**
 * Was in Laufweite liegt, nach Art gruppiert.
 *
 * Je Art ein eigener Kasten statt einer durchlaufenden Definitionsliste: Wer
 * wissen will, ob es eine Toilette gibt, sucht nach einer Überschrift, nicht
 * nach einer Zeile in einer langen Aufzählung.
 */
export default function Umfeld({ items }: { items: UmfeldEintrag[] }) {
  if (!items.length) return null;

  const proKategorie = new Map<string, UmfeldEintrag[]>();
  for (const e of items) {
    const liste = proKategorie.get(e.kategorie) ?? [];
    liste.push(e);
    proKategorie.set(e.kategorie, liste);
  }

  const gruppen = REIHENFOLGE.filter((k) => proKategorie.has(k));
  if (!gruppen.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {gruppen.map((k) => (
        <div key={k} className="rounded-lg border border-line p-4">
          <h3 className="text-sm font-semibold">{KATEGORIE[k] ?? k}</h3>
          <ul className="mt-2 space-y-1">
            {proKategorie.get(k)!.map((e, i) => (
              <li
                key={`${e.name}-${e.distanz_m}-${i}`}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className={e.name ? "" : "text-muted"}>
                  {e.name ?? "ohne Namen erfasst"}
                </span>{" "}
                <span className="shrink-0 tabular-nums text-muted">{meter(e.distanz_m)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
