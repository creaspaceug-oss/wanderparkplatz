"use client";

import { useId, useState } from "react";

/**
 * Stocklänge aus der Körpergröße, mit Bergauf- und Bergabwert.
 *
 * Gerechnet wird dieselbe Regel, die unter dem Rechner als Tabelle steht:
 * Körpergröße mal 0,68, auf fünf Zentimeter gerundet. Rechner und Tabelle
 * dürfen sich nicht widersprechen — deshalb kommt der Faktor als Eigenschaft
 * herein und nicht als zweite Konstante.
 *
 * Der Teil, den sonst niemand hat: welche Stöcke aus dem Vergleich diese Länge
 * überhaupt erreichen. Ein Faltstock bis 130 cm nützt bei 1,95 m nichts, und
 * das steht auf keiner Produktseite so deutlich da.
 */
export default function Laengenrechner({
  faktor,
  stoecke,
}: {
  faktor: number;
  /** Verstellbereich je Stock in Zentimetern; feste Längen fehlen hier bewusst. */
  stoecke: { name: string; min: number; max: number; anker: string }[];
}) {
  const id = useId();
  const [groesse, setGroesse] = useState(175);

  const grund = Math.round((groesse * faktor) / 5) * 5;
  const auf = grund - 10;
  const ab = grund + 10;

  const passend = stoecke.filter((s) => grund >= s.min && grund <= s.max);
  const bergabKnapp = passend.filter((s) => ab > s.max);
  const zuKurz = stoecke.filter((s) => grund > s.max);

  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-sand p-5 sm:grid-cols-[1fr_auto] sm:p-7">
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-muted">
          Deine Körpergröße
        </label>
        <div className="mt-2 flex items-baseline gap-2">
          <output htmlFor={id} className="text-4xl font-bold tabular-nums tracking-tight">
            {groesse}
          </output>
          <span className="text-lg text-muted">cm</span>
        </div>
        <input
          id={id}
          type="range"
          min={145}
          max={205}
          step={1}
          value={groesse}
          onChange={(e) => setGroesse(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--accent)]"
        />
        <div className="mt-1 flex justify-between text-xs text-muted" aria-hidden>
          <span>145</span>
          <span>175</span>
          <span>205</span>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            ["bergauf", auf, "kürzer greifen"],
            ["Grundlänge", grund, "in der Ebene"],
            ["bergab", ab, "länger stellen"],
          ].map(([k, v, z]) => (
            <div
              key={k as string}
              className={`rounded-xl border p-3 ${k === "Grundlänge" ? "border-accent bg-card" : "border-line bg-card/60"}`}
            >
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{v}</dd>
              <dd className="text-xs text-muted">{z}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 text-sm leading-relaxed" aria-live="polite">
          {passend.length > 0 ? (
            <p>
              <span className="font-medium">Erreichen {grund} cm: </span>
              {passend.map((s, i) => (
                <span key={s.anker}>
                  <a href={`#${s.anker}`} className="underline decoration-line hover:text-accent">
                    {s.name}
                  </a>
                  {i < passend.length - 1 ? ", " : ""}
                </span>
              ))}
              .
            </p>
          ) : (
            <p>Keiner der verstellbaren Stöcke hier reicht für {grund} cm.</p>
          )}
          {bergabKnapp.length > 0 && (
            <p className="mt-1 text-muted">
              Bergab mit {ab} cm wird es knapp bei:{" "}
              {bergabKnapp.map((s) => `${s.name} (bis ${s.max} cm)`).join(", ")}.
            </p>
          )}
          {zuKurz.length > 0 && (
            <p className="mt-1 text-warn">
              Zu kurz für dich: {zuKurz.map((s) => `${s.name} (bis ${s.max} cm)`).join(", ")}.
            </p>
          )}
        </div>
      </div>

      {/* Die Regel als Bild: Unterarm waagerecht, Ellbogen im rechten Winkel. */}
      <svg
        viewBox="0 0 220 300"
        className="mx-auto h-64 w-auto text-foreground sm:h-72"
        role="img"
        aria-label={`Figur mit Wanderstock: Bei ${groesse} cm Körpergröße steht der Ellbogen bei ${grund} cm Stocklänge im rechten Winkel.`}
      >
        <line x1="10" y1="285" x2="210" y2="285" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
        {/* Figur */}
        <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none">
          <circle cx="80" cy="38" r="14" strokeWidth="4" />
          <line x1="80" y1="54" x2="80" y2="160" />
          <line x1="80" y1="160" x2="66" y2="283" />
          <line x1="80" y1="160" x2="96" y2="283" />
          <line x1="80" y1="74" x2="84" y2="128" />
          <line x1="84" y1="128" x2="142" y2="128" />
        </g>
        {/* Stock */}
        <line x1="142" y1="120" x2="142" y2="283" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
        <rect x="136" y="112" width="12" height="24" rx="4" fill="var(--accent)" />
        {/* rechter Winkel */}
        <path d="M84 114 h14 v14" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        <text x="102" y="110" fontSize="13" fill="var(--accent)" fontWeight="600">90°</text>
        {/* Maß: Körpergröße */}
        <g stroke="currentColor" strokeOpacity=".45" strokeWidth="1.5">
          <line x1="28" y1="24" x2="28" y2="285" />
          <line x1="22" y1="24" x2="34" y2="24" />
          <line x1="22" y1="285" x2="34" y2="285" />
        </g>
        <text x="20" y="160" fontSize="12" fill="currentColor" fillOpacity=".7" transform="rotate(-90 20 160)" textAnchor="middle">
          {groesse} cm
        </text>
        {/* Maß: Stocklänge */}
        <g stroke="var(--accent)" strokeWidth="1.5">
          <line x1="178" y1="128" x2="178" y2="285" />
          <line x1="172" y1="128" x2="184" y2="128" />
          <line x1="172" y1="285" x2="184" y2="285" />
        </g>
        <text x="192" y="210" fontSize="13" fontWeight="600" fill="var(--accent)" transform="rotate(-90 192 210)" textAnchor="middle">
          {grund} cm
        </text>
      </svg>
    </div>
  );
}
