"use client";

import { useId, useState } from "react";

export interface CheckSet {
  asin: string;
  name: string;
  hat: string[];
}

export interface CheckPosition {
  k: string;
  text: string;
  wozu: string;
}

export interface Nachkauf {
  name: string;
  url: string;
  anzeige: string | null;
}

/**
 * Das eigene Set gegen die Liste des Alpenvereins prüfen.
 *
 * Wählt man eines der verglichenen Sets, sind die Häkchen nach den
 * Inhaltslisten der Hersteller gesetzt — und lassen sich ändern, denn wer ein
 * Set besitzt, hat es oft schon ergänzt. "Mein eigenes Set" beginnt leer. Für
 * fehlende Positionen steht ein Verweis zum Nachkaufen, wo es einen gibt.
 */
export default function SetCheck({
  sets,
  liste,
  nachkauf,
  zeit,
}: {
  sets: CheckSet[];
  liste: CheckPosition[];
  nachkauf: Record<string, Nachkauf>;
  zeit: string | null;
}) {
  const id = useId();
  const [auswahl, setAuswahl] = useState(sets[0]?.asin ?? "eigen");
  const [haken, setHaken] = useState<Set<string>>(() => new Set(sets[0]?.hat ?? []));

  const waehle = (asin: string) => {
    setAuswahl(asin);
    setHaken(new Set(sets.find((s) => s.asin === asin)?.hat ?? []));
  };
  const umschalten = (k: string) =>
    setHaken((alt) => {
      const neu = new Set(alt);
      if (neu.has(k)) neu.delete(k);
      else neu.add(k);
      return neu;
    });

  const anzahl = liste.filter((p) => haken.has(p.k)).length;
  const fehlt = liste.filter((p) => !haken.has(p.k));
  const anteil = anzahl / liste.length;

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <label htmlFor={`${id}-set`} className="block text-sm font-medium text-muted">
        Welches Set hast du oder willst du kaufen?
      </label>
      <select
        id={`${id}-set`}
        value={auswahl}
        onChange={(e) => waehle(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-card px-3 py-2.5 font-semibold"
      >
        {sets.map((s) => (
          <option key={s.asin} value={s.asin}>
            {s.name}
          </option>
        ))}
        <option value="eigen">Mein eigenes Set</option>
      </select>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <fieldset>
          <legend className="text-sm font-medium text-muted">DAV-Liste für Tagestouren — abhaken, was drin ist</legend>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {liste.map((p) => {
              const an = haken.has(p.k);
              return (
                <li key={p.k}>
                  <label
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
                      an ? "border-accent/50 bg-card" : "border-line bg-card/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={an}
                      onChange={() => umschalten(p.k)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                    />
                    <span>
                      <span className={an ? "font-semibold" : ""}>{p.text}</span>
                      <span className="block text-xs text-muted">{p.wozu}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="self-start rounded-xl border-2 border-accent bg-card p-4 lg:sticky lg:top-6" aria-live="polite">
          <p className="text-sm text-muted">Abgedeckt</p>
          <p className="text-4xl font-bold tabular-nums">
            {anzahl}
            <span className="text-xl font-semibold text-muted"> / {liste.length}</span>
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sand">
            <div
              className={`h-full rounded-full transition-all duration-300 ${anteil >= 0.8 ? "bg-accent" : anteil >= 0.5 ? "bg-accent/70" : "bg-warn"}`}
              style={{ width: `${anteil * 100}%` }}
            />
          </div>
          {fehlt.length === 0 ? (
            <p className="mt-3 text-[0.95rem]">Vollständig nach der DAV-Liste.</p>
          ) : (
            <>
              <p className="mt-3 text-sm font-semibold">Es fehlt:</p>
              <ul className="mt-1 space-y-1.5 text-sm">
                {fehlt.map((p) => {
                  const n = nachkauf[p.k];
                  return (
                    <li key={p.k}>
                      {p.text}
                      {n && (
                        <a
                          href={n.url}
                          rel="sponsored nofollow noopener"
                          target="_blank"
                          className="block text-accent underline hover:no-underline"
                        >
                          {n.name}
                          {n.anzeige ? ` — ${n.anzeige}` : ""} →
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              {fehlt.some((p) => nachkauf[p.k]) && (
                <p className="mt-2 text-xs text-muted">
                  Anzeige{zeit ? ` · Preis und Verfügbarkeit: Stand ${zeit} Uhr` : ""}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Die Häkchen für die Sets folgen den Inhaltslisten der Hersteller. Gezählt wird, ob eine
        Position vorhanden ist, nicht die Menge. Die Liste ist die des Deutschen Alpenvereins für ein
        Standard-Päckchen; Desinfektionstücher führt der DAV selbst als „umstritten“.
      </p>
    </div>
  );
}
