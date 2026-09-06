import type { UmfeldEintrag } from "@/lib/db";

const KATEGORIE: Record<string, { titel: string; leer: string }> = {
  einkehr: { titel: "Einkehr", leer: "" },
  oepnv: { titel: "Bus und Bahn", leer: "" },
  wc: { titel: "Toilette", leer: "" },
  aussicht: { titel: "Aussichtspunkt", leer: "" },
  infotafel: { titel: "Infotafel oder Wegweiser", leer: "" },
  schutzhuette: { titel: "Schutzhütte", leer: "" },
};

/** Reihenfolge nach Nutzen vor der Wanderung, nicht alphabetisch. */
const REIHENFOLGE = ["oepnv", "wc", "einkehr", "infotafel", "aussicht", "schutzhuette"];

const meter = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`);

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
    <section className="mt-10">
      <h2 className="text-xl font-semibold">In Laufweite</h2>
      <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {gruppen.map((k) => {
          const liste = proKategorie.get(k)!;
          return (
            <div key={k} className="border-b border-line py-3">
              <dt className="text-sm text-muted">{KATEGORIE[k]?.titel ?? k}</dt>
              <dd className="mt-1">
                {liste.map((e, i) => (
                  <span key={`${e.name}-${e.distanz_m}-${i}`} className="block">
                    {e.name ?? <span className="text-muted">ohne Namen erfasst</span>}
                    <span className="ml-2 text-sm tabular-nums text-muted">
                      {meter(e.distanz_m)}
                    </span>
                  </span>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-sm text-muted">
        Luftlinie ab dem Parkplatz. Öffnungszeiten von Gaststätten und Fahrpläne sind nicht
        erfasst — gerade in Wandergebieten lohnt der Blick vorab.
      </p>
    </section>
  );
}
