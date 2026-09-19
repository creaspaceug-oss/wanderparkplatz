"use client";

import { useId, useState } from "react";

type Wetter = "kuehl" | "mild" | "heiss";

const WETTER: { k: Wetter; text: string; unter: string }[] = [
  { k: "kuehl", text: "kühl", unter: "unter 15 °C" },
  { k: "mild", text: "mild", unter: "15 bis 25 °C" },
  { k: "heiss", text: "heiß", unter: "über 25 °C" },
];

const GROESSEN = [1.5, 2, 3] as const;

const liter = (x: number) => x.toLocaleString("de-DE", { maximumFractionDigits: 1 });
/** Für die offengelegte Annahme: 0,25 darf nicht als 0,3 erscheinen. */
const genau = (x: number) => x.toLocaleString("de-DE", { maximumFractionDigits: 2 });

/**
 * Wie viel Wasser, und welche Blase dafür.
 *
 * Die Stundenwerte kommen als Eigenschaft herein und stehen unter dem Rechner
 * offen da. Sie sind eine Annahme, geeicht an der einzigen belegten Zahl — 1,5
 * bis 2 Liter für eine Tageswanderung laut Deutschem Wanderverband. Ein
 * Rechner, der Genauigkeit vortäuscht, wäre schlechter als keiner.
 *
 * Das Bild zeigt alle drei gängigen Größen mit dem Füllstand, den die Tour
 * braucht. Wer sieht, dass eine 3-Liter-Blase nur zur Hälfte voll wäre, kauft
 * die kleinere — auch das ist eine gute Beratung.
 */
export default function Wasserrechner({
  jeStunde,
  ohneEinkehr,
  gesamt,
  angebotName,
  angebote,
}: {
  jeStunde: Record<Wetter, number>;
  ohneEinkehr: number;
  gesamt: number;
  /**
   * Die Empfehlung in der Größe, die der Rechner ausgibt. Wer "2 Liter"
   * liest, soll nicht die 3-Liter-Ausführung suchen müssen. Preise kommen
   * mit Zeitpunkt vom Server, wie Amazon es verlangt.
   */
  angebotName?: string;
  angebote?: Record<string, { url: string; anzeige: string | null; zeit: string | null }>;
}) {
  const id = useId();
  const [stunden, setStunden] = useState(5);
  const [wetter, setWetter] = useState<Wetter>("mild");

  const bedarf = Math.round(stunden * jeStunde[wetter] * 10) / 10;
  const passend = GROESSEN.find((g) => bedarf <= g) ?? null;

  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-sand p-5 sm:grid-cols-[1fr_15rem] sm:p-7">
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-muted">
          Wie lange bist du unterwegs?
        </label>
        <div className="mt-2 flex items-baseline gap-2">
          <output htmlFor={id} className="text-4xl font-bold tabular-nums tracking-tight">
            {liter(stunden)}
          </output>
          <span className="text-lg text-muted">Stunden</span>
        </div>
        <input
          id={id}
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={stunden}
          onChange={(e) => setStunden(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--accent)]"
        />

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-muted">Wie warm wird es?</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {WETTER.map((w) => (
              <label
                key={w.k}
                className={`cursor-pointer rounded-xl border p-2.5 text-center transition ${
                  wetter === w.k ? "border-accent bg-card" : "border-line bg-card/60 hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-wetter`}
                  value={w.k}
                  checked={wetter === w.k}
                  onChange={() => setWetter(w.k)}
                  className="sr-only"
                />
                <span className="block font-semibold">{w.text}</span>
                <span className="block text-xs text-muted">{w.unter}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 rounded-xl border border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Du brauchst ungefähr</p>
          <p className="text-3xl font-bold tabular-nums">{liter(bedarf)} Liter</p>
          <p className="mt-1 text-[0.95rem] leading-relaxed">
            {passend
              ? `Eine ${liter(passend)}-Liter-Blase reicht${passend > bedarf + 0.6 ? " — sie wird aber nicht voll, die kleinere trägt sich leichter" : ""}.`
              : "Mehr, als eine Blase fasst. Nimm 3 Liter und plane, wo du nachfüllst."}
          </p>
          {angebote && angebotName && (() => {
            const a = angebote[String(passend ?? 3)];
            if (!a) return null;
            return (
              <p className="mt-3 border-t border-line pt-3 text-sm">
                <a
                  href={a.url}
                  rel="sponsored nofollow noopener"
                  target="_blank"
                  className="font-semibold text-accent underline hover:no-underline"
                >
                  {angebotName} in {liter(passend ?? 3)} Litern
                  {a.anzeige ? ` — ${a.anzeige} bei Amazon` : " bei Amazon"} →
                </a>
                <span className="block text-xs text-muted">
                  Anzeige{a.zeit ? ` · Preis und Verfügbarkeit: Stand ${a.zeit} Uhr` : ""}
                </span>
              </p>
            );
          })()}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Annahme: {genau(jeStunde.kuehl)} / {genau(jeStunde.mild)} / {genau(jeStunde.heiss)} Liter
          je Stunde — so gewählt, dass fünf Stunden bei mildem Wetter bei den 1,5 bis 2 Litern landen,
          die der Deutsche Wanderverband für eine Tageswanderung empfiehlt. Viele Höhenmeter und
          Sonne ohne Schatten brauchen mehr. An {ohneEinkehr.toLocaleString("de-DE")} von{" "}
          {gesamt.toLocaleString("de-DE")} Wanderparkplätzen liegt im Umkreis von 1,2 km keine
          Einkehr, an der man nachfüllen könnte.
        </p>
      </div>

      {/* Drei Blasen, jeweils mit dem Füllstand, den die Tour braucht. */}
      <svg
        viewBox="0 0 240 230"
        className="mx-auto w-full max-w-[15rem] text-foreground"
        role="img"
        aria-label={`${liter(bedarf)} Liter im Vergleich zu Blasen mit 1,5, 2 und 3 Litern${passend ? `; die ${liter(passend)}-Liter-Blase passt` : ""}.`}
      >
        {GROESSEN.map((g, i) => {
          const hoehe = 70 + g * 38;
          const x = 12 + i * 78;
          const y = 200 - hoehe;
          const fuell = Math.min(1, bedarf / g);
          const aktiv = g === passend;
          return (
            <g key={g}>
              <clipPath id={`${id}-k${i}`}>
                <rect x={x} y={y} width="62" height={hoehe} rx="16" />
              </clipPath>
              <rect x={x} y={y} width="62" height={hoehe} rx="16" fill="var(--card)" />
              <rect
                x={x}
                y={y + hoehe * (1 - fuell)}
                width="62"
                height={hoehe * fuell}
                // Zu kleine Blasen im Warnton: randvoll in Grün sähe nach "passt" aus.
                fill={g < bedarf ? "var(--warn)" : "var(--accent)"}
                fillOpacity={aktiv ? 0.85 : 0.35}
                clipPath={`url(#${id}-k${i})`}
                style={{ transition: "y .35s ease, height .35s ease" }}
              />
              <rect
                x={x}
                y={y}
                width="62"
                height={hoehe}
                rx="16"
                fill="none"
                stroke={aktiv ? "var(--accent)" : "currentColor"}
                strokeOpacity={aktiv ? 1 : 0.35}
                strokeWidth={aktiv ? 3 : 1.5}
              />
              <rect x={x + 22} y={y - 10} width="18" height="12" rx="3" fill="currentColor" fillOpacity=".35" />
              <text x={x + 31} y="222" textAnchor="middle" fontSize="13" fontWeight={aktiv ? 700 : 500} fill={aktiv ? "var(--accent)" : "currentColor"}>
                {liter(g)} l
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
