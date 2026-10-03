"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { PACKLISTE, TOUR_NAME, type Tour } from "@/lib/ausruestung/packliste";

/**
 * Packliste zum Abhaken, nach Tourart gefiltert.
 *
 * Die Punkte stammen aus der DAV-Packliste; was wir ergänzt haben, ist als
 * Ergänzung markiert. Abgehakt wird nur im Browser und nur für diesen Besuch:
 * Eine Liste, die beim nächsten Mal noch halb abgehakt wäre, führt in die
 * Irre — gepackt wird jede Tour neu.
 */
export default function Packliste({ sichtbare }: { sichtbare: string[] }) {
  const id = useId();
  // Funktionen lassen sich nicht an Client-Komponenten übergeben: Welche
  // Vergleichsseiten schon freigegeben sind, entscheidet der Server.
  const frei = useMemo(() => new Set(sichtbare), [sichtbare]);
  const [tour, setTour] = useState<Tour>("tag");
  const [fertig, setFertig] = useState<Set<string>>(new Set());

  const gruppen = useMemo(
    () =>
      PACKLISTE.map((g) => ({ ...g, posten: g.posten.filter((p) => p.touren.includes(tour)) })).filter(
        (g) => g.posten.length > 0,
      ),
    [tour],
  );
  const gesamt = gruppen.reduce((n, g) => n + g.posten.length, 0);
  const erledigt = gruppen.reduce((n, g) => n + g.posten.filter((p) => fertig.has(p.name)).length, 0);

  const umschalten = (name: string) =>
    setFertig((alt) => {
      const neu = new Set(alt);
      if (neu.has(name)) neu.delete(name);
      else neu.add(name);
      return neu;
    });

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <fieldset>
        <legend className="text-sm font-medium text-muted">Was für eine Tour?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(Object.keys(TOUR_NAME) as Tour[]).map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-xl border p-2.5 text-center text-sm transition ${
                tour === t ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
              }`}
            >
              <input
                type="radio"
                name={`${id}-tour`}
                checked={tour === t}
                onChange={() => setTour(t)}
                className="sr-only"
              />
              {TOUR_NAME[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="mt-5 flex items-baseline justify-between text-sm text-muted">
        <span>
          {gesamt} Punkte für die {TOUR_NAME[tour]}
        </span>
        <span className="tabular-nums">
          {erledigt} von {gesamt} gepackt
        </span>
      </p>
      <div className="mt-1 h-2 rounded-full bg-card">
        <div
          className="h-2 rounded-full bg-accent transition-all"
          style={{ width: `${gesamt ? (erledigt / gesamt) * 100 : 0}%` }}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {gruppen.map((g) => (
          <div key={g.titel} className="rounded-xl border border-line bg-card p-4">
            <h3 className="font-semibold">{g.titel}</h3>
            <ul className="mt-3 space-y-2.5">
              {g.posten.map((p) => {
                const ab = fertig.has(p.name);
                return (
                  <li key={p.name} className="flex gap-2.5">
                    <input
                      id={`${id}-${p.name}`}
                      type="checkbox"
                      checked={ab}
                      onChange={() => umschalten(p.name)}
                      className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                    />
                    <label htmlFor={`${id}-${p.name}`} className="cursor-pointer text-sm leading-snug">
                      <span className={ab ? "text-muted line-through" : "font-medium"}>{p.name}</span>
                      {p.ergaenzt && (
                        <span className="ml-1.5 rounded border border-line px-1 text-[0.65rem] uppercase tracking-wide text-muted">
                          ergänzt
                        </span>
                      )}
                      {p.hinweis && <span className="block text-muted">{p.hinweis}</span>}
                      {p.pfad && frei.has(p.pfad) && (
                        <Link href={p.pfad} className="mt-0.5 block text-accent underline-offset-2 hover:underline">
                          Vergleich lesen
                        </Link>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Grundlage ist die Packliste des Deutschen Alpenvereins für Frühjahrstouren, ergänzt um
        Punkte für Hütten- und Wintertouren; die sind als Ergänzung markiert. Abgehakte Punkte
        merkt sich nur dieser Besuch.
      </p>
    </div>
  );
}
