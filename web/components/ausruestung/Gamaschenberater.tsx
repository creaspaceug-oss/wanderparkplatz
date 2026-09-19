"use client";

import { useId, useState } from "react";

export interface GamaschenAngebot {
  k: string;
  name: string;
  url: string;
  anzeige: string | null;
  zeit: string | null;
}

type Bedingung = "staub" | "gras" | "schlamm" | "schnee" | "zecken";

const BEDINGUNGEN: { k: Bedingung; text: string }[] = [
  { k: "staub", text: "Staub, Sand, Steinchen" },
  { k: "gras", text: "Nasses Gras, Tau" },
  { k: "schlamm", text: "Schlamm, Regen" },
  { k: "schnee", text: "Schnee" },
  { k: "zecken", text: "Hohes Gras, Zecken" },
];

type Hoehe = "keine" | "kurz" | "mittel" | "lang";

/**
 * Welche Gamasche — nach Bedingungen, nicht nach Marke.
 *
 * Die Regel, offen: Schnee braucht lang; Schlamm, nasses Gras und Zecken
 * brauchen wenigstens wadenlang; gegen Staub und Steinchen reicht kurz. Ist
 * es warm, gewinnt das atmungsaktive Material, sonst das dichte und
 * robustere. Die Höhen in der Zeichnung sind die der Modelle im Vergleich.
 */
export default function Gamaschenberater({ angebote }: { angebote: Record<string, GamaschenAngebot> }) {
  const id = useId();
  const [wahl, setWahl] = useState<Set<Bedingung>>(new Set(["gras", "schlamm"]));
  const [warm, setWarm] = useState(false);

  const hat = (b: Bedingung) => wahl.has(b);
  const hoehe: Hoehe = hat("schnee")
    ? "lang"
    : hat("schlamm") || hat("gras") || hat("zecken")
      ? "mittel"
      : hat("staub")
        ? "kurz"
        : "keine";

  const empfehlung: { k: string; warum: string } | null =
    hoehe === "lang"
      ? warm
        ? { k: "quagmire", warum: "Lang und atmungsaktiv: Unter einer dichten, beschichteten Gamasche schwitzt man an warmen Tagen." }
        : { k: "tatonka", warum: "Lang, dicht und robust, mit Hypalon-Steg. Im Kalten stört die fehlende Atmungsaktivität kaum." }
      : hoehe === "mittel"
        ? { k: "salewa", warum: "Wadenlang reicht für nasses Gras, Matsch und gegen Zecken — und bleibt im Sommer erträglich." }
        : hoehe === "kurz"
          ? warm
            ? { k: "kahtoola", warum: "Kurz, dehnbar und atmungsaktiv — hält Steinchen draußen, ohne zu wärmen." }
            : { k: "short", warum: "Kurz und aus beschichtetem Nylon — gegen Steinchen und Spritzwasser am Schuhrand." }
          : null;
  const a = empfehlung ? angebote[empfehlung.k] : null;

  const umschalten = (b: Bedingung) =>
    setWahl((alt) => {
      const neu = new Set(alt);
      if (neu.has(b)) neu.delete(b);
      else neu.add(b);
      return neu;
    });

  // Zeichnung: Unterschenkel von 0 bis 50 cm über dem Boden, 4 px je cm.
  const y = (cm: number) => 230 - cm * 4;
  const baender: { h: Hoehe; cm: number; text: string }[] = [
    { h: "kurz", cm: 25, text: "kurz · 25 cm" },
    { h: "mittel", cm: 31, text: "wadenlang · 31 cm" },
    { h: "lang", cm: 47, text: "lang · bis 47 cm" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_13rem_18rem] lg:items-start">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-muted">Worauf triffst du unterwegs? (mehrere möglich)</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {BEDINGUNGEN.map((b) => (
                <label
                  key={b.k}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                    hat(b.k) ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
                  }`}
                >
                  <input type="checkbox" checked={hat(b.k)} onChange={() => umschalten(b.k)} className="h-4 w-4 accent-[var(--accent)]" />
                  {b.text}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium text-muted">Wie warm ist es meistens?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                [false, "kühl, Übergangszeit, Winter"],
                [true, "warm, Sommer"],
              ].map(([w, t]) => (
                <label
                  key={String(w)}
                  className={`cursor-pointer rounded-xl border p-2.5 text-center text-sm transition ${
                    warm === w ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
                  }`}
                >
                  <input type="radio" name={`${id}-w`} checked={warm === w} onChange={() => setWarm(w as boolean)} className="sr-only" />
                  {t as string}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <svg
          viewBox="0 0 215 250"
          className="mx-auto h-60 w-auto text-foreground"
          role="img"
          aria-label={`Unterschenkel mit den Gamaschenhöhen kurz (etwa 25 cm), wadenlang (etwa 31 cm) und lang (bis etwa 47 cm). Empfohlen: ${hoehe === "keine" ? "keine Gamasche" : hoehe}.`}
        >
          {/* Bein und Schuh */}
          <path d="M40 20 C38 80 44 130 46 170 L48 205 L50 222 L112 222 C118 222 120 214 112 208 L86 198 L84 170 C88 130 92 80 88 20" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
          <path d="M44 205 L44 228 L124 228 C130 228 132 218 124 212 L90 200 L86 190" fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeOpacity=".45" strokeWidth="2" />
          {/* Höhen: gestrichelte Linien, die empfohlene gefüllt. */}
          {baender.map((b) => {
            const aktiv = b.h === hoehe;
            return (
              <g key={b.h}>
                {aktiv && (
                  <rect x="38" y={y(b.cm)} width="56" height={y(0) - y(b.cm) - 22} rx="6" fill="var(--accent)" fillOpacity=".55" stroke="var(--accent)" />
                )}
                <line x1="34" x2="104" y1={y(b.cm)} y2={y(b.cm)} stroke={aktiv ? "var(--accent)" : "currentColor"} strokeOpacity={aktiv ? 1 : 0.4} strokeDasharray={aktiv ? undefined : "4 3"} strokeWidth={aktiv ? 2 : 1} />
                <text x="108" y={y(b.cm) + 4} fontSize="11" fontWeight={aktiv ? 700 : 400} fill={aktiv ? "var(--accent)" : "currentColor"} fillOpacity={aktiv ? 1 : 0.65}>
                  {b.text}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Du brauchst</p>
          <p className="text-2xl font-bold leading-tight">
            {hoehe === "keine" ? "keine Gamasche" : hoehe === "mittel" ? "wadenlange Gamaschen" : `${hoehe}e Gamaschen`}
          </p>
          {empfehlung ? (
            <>
              <p className="mt-2 text-[0.95rem] leading-relaxed">{empfehlung.warum}</p>
              {a && (
                <p className="mt-3 border-t border-line pt-3 text-sm">
                  <a href={a.url} rel="sponsored nofollow noopener" target="_blank" className="font-semibold text-accent underline hover:no-underline">
                    {a.name}
                    {a.anzeige ? ` — ${a.anzeige}` : ""} →
                  </a>
                  <span className="block text-xs text-muted">Anzeige{a.zeit ? ` · Preis und Verfügbarkeit: Stand ${a.zeit} Uhr` : ""}</span>
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-[0.95rem] leading-relaxed">Auf trockenen, festen Wegen braucht man keine Gamaschen.</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Unsere Faustregel: Schnee braucht lang, Schlamm, nasses Gras und Zecken wenigstens wadenlang,
        Staub und Steinchen kurz. Bei Wärme gewinnt atmungsaktives Material. Die Höhen in der
        Zeichnung sind die der Modelle in diesem Vergleich laut Hersteller.
      </p>
    </div>
  );
}
