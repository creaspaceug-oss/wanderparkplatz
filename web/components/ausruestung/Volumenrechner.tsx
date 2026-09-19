"use client";

import { useId, useState } from "react";

export interface Tour {
  k: string;
  text: string;
  unter: string;
  von: number;
  bis: number;
}

export interface Angebot {
  name: string;
  liter: number;
  damen: boolean;
  url: string;
  anzeige: string | null;
  zeit: string | null;
}

type Fuer = "alle" | "damen" | "herren";

/** Eine Größenklasse im Winter — als Zahl unsere Annahme, siehe unten. */
const WINTER = 5;
const SKALA = { von: 10, bis: 70 };

const pos = (l: number) => ((l - SKALA.von) / (SKALA.bis - SKALA.von)) * 100;

/**
 * Wie viel Liter, und welche Rucksäcke aus dem Vergleich dazu passen.
 *
 * Die Spannen je Tourart stammen aus zwei Quellen, die sich decken (Bergzeit
 * und die Bergführer von Alpinewelten), und kommen als Eigenschaft herein. Was
 * wir selbst ansetzen, steht unter dem Rechner: Ohne Einkehr unterwegs die
 * obere Hälfte der Spanne, sonst die untere; im Winter fünf Liter mehr.
 *
 * Dazu die passenden Modelle, auf Wunsch nur Damen- oder nur Herren-
 * ausführungen — "wanderrucksack damen" wird fast halb so oft gesucht wie das
 * Wort allein, und wer das sucht, will nicht erst sortieren.
 */
export default function Volumenrechner({
  touren,
  angebote,
  ohneEinkehr,
  gesamt,
}: {
  touren: readonly Tour[];
  angebote: Angebot[];
  ohneEinkehr: number;
  gesamt: number;
}) {
  const id = useId();
  const [tour, setTour] = useState(touren[0].k);
  const [winter, setWinter] = useState(false);
  const [einkehr, setEinkehr] = useState(true);
  const [fuer, setFuer] = useState<Fuer>("alle");

  const t = touren.find((x) => x.k === tour) ?? touren[0];
  const mitte = Math.round((t.von + t.bis) / 2);
  const zuschlag = winter ? WINTER : 0;
  const von = (einkehr ? t.von : mitte) + zuschlag;
  const bis = (einkehr ? mitte : t.bis) + zuschlag;

  const passend = angebote
    .filter((a) => (fuer === "alle" ? true : fuer === "damen" ? a.damen : !a.damen))
    .filter((a) => a.liter >= von - 2 && a.liter <= bis + 2)
    .sort((a, b) => Math.abs(a.liter - (von + bis) / 2) - Math.abs(b.liter - (von + bis) / 2))
    .slice(0, 4);

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-left transition ${
      aktiv ? "border-accent bg-card" : "border-line bg-card/60 hover:border-muted"
    }`;

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-muted">Was hast du vor?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {touren.map((x) => (
                <label key={x.k} className={knopf(tour === x.k)}>
                  <input
                    type="radio"
                    name={`${id}-tour`}
                    value={x.k}
                    checked={tour === x.k}
                    onChange={() => setTour(x.k)}
                    className="sr-only"
                  />
                  <span className="block font-semibold leading-snug">{x.text}</span>
                  <span className="block text-xs text-muted">{x.unter}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className="text-sm font-medium text-muted">Jahreszeit</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  [false, "Frühjahr bis Herbst"],
                  [true, "Winter"],
                ].map(([w, text]) => (
                  <label key={String(w)} className={knopf(winter === w)}>
                    <input
                      type="radio"
                      name={`${id}-winter`}
                      checked={winter === w}
                      onChange={() => setWinter(w as boolean)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold leading-snug">{text as string}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium text-muted">Einkehr unterwegs?</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  [true, "ja"],
                  [false, "nein, alles dabei"],
                ].map(([e, text]) => (
                  <label key={String(e)} className={knopf(einkehr === e)}>
                    <input
                      type="radio"
                      name={`${id}-einkehr`}
                      checked={einkehr === e}
                      onChange={() => setEinkehr(e as boolean)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold leading-snug">{text as string}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Skala: die ganze Spanne der Tourart hell, die Empfehlung kräftig. */}
          <div aria-hidden className="pt-2">
            <div className="relative h-4 rounded-full bg-card">
              <div
                className="absolute inset-y-0 rounded-full bg-accent/20 transition-all duration-300"
                style={{ left: `${pos(t.von + zuschlag)}%`, width: `${pos(t.bis + zuschlag) - pos(t.von + zuschlag)}%` }}
              />
              <div
                className="absolute inset-y-0 rounded-full bg-accent transition-all duration-300"
                style={{ left: `${pos(von)}%`, width: `${Math.max(pos(bis) - pos(von), 1.5)}%` }}
              />
            </div>
            <div className="relative mt-1.5 h-4 text-xs tabular-nums text-muted">
              {[10, 20, 30, 40, 50, 60, 70].map((l) => (
                <span key={l} className="absolute -translate-x-1/2" style={{ left: `${pos(l)}%` }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Du brauchst ungefähr</p>
          <p className="text-3xl font-bold tabular-nums">
            {von}–{bis} Liter
          </p>
          <p className="mt-1 text-[0.95rem] leading-relaxed">
            {bis <= 25
              ? "Ein Tagesrucksack. Mehr Volumen heißt hier nur mehr Gewicht und ein halb leerer Sack, der schwappt."
              : bis <= 40
                ? "Genug für Hüttenschlafsack und Wechselwäsche. Wer effizient packt, kommt mit dem unteren Wert aus."
                : "Ein Trekkingrucksack mit tragfähigem Hüftgurt. Die haben wir nicht verglichen — dafür reicht keiner der Rucksäcke hier."}
          </p>

          <fieldset className="mt-4 border-t border-line pt-3">
            <legend className="sr-only">Ausführung</legend>
            <div className="flex gap-1 rounded-lg bg-sand p-1 text-sm">
              {(
                [
                  ["alle", "alle"],
                  ["damen", "Damen"],
                  ["herren", "Herren/Unisex"],
                ] as [Fuer, string][]
              ).map(([k, text]) => (
                <label
                  key={k}
                  className={`flex-1 cursor-pointer rounded-md px-2 py-1 text-center transition ${
                    fuer === k ? "bg-card font-semibold shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-fuer`}
                    checked={fuer === k}
                    onChange={() => setFuer(k)}
                    className="sr-only"
                  />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>

          {passend.length > 0 ? (
            <ul className="mt-3 space-y-2.5 text-sm">
              {passend.map((a) => (
                <li key={a.url}>
                  <a
                    href={a.url}
                    rel="sponsored nofollow noopener"
                    target="_blank"
                    className="font-semibold text-accent underline hover:no-underline"
                  >
                    {a.name}, {a.liter} l{a.anzeige ? ` — ${a.anzeige}` : ""} →
                  </a>
                  <span className="block text-xs text-muted">
                    Anzeige{a.zeit ? ` · Preis und Verfügbarkeit: Stand ${a.zeit} Uhr` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              In dieser Größe ist keiner der Rucksäcke aus unserem Vergleich dabei.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Spannen je Tourart nach Bergzeit und den Bergführern von Alpinewelten, die sich weitgehend
        decken. Unsere Annahmen: Mit Einkehr unterwegs die untere Hälfte der Spanne, ohne die obere —
        Proviant und Wasser für den ganzen Tag brauchen Platz. Im Winter eine Größenklasse mehr, wie
        Bergzeit rät; wir setzen dafür {WINTER} Liter an. An {ohneEinkehr.toLocaleString("de-DE")} von{" "}
        {gesamt.toLocaleString("de-DE")} Wanderparkplätzen in unserem Verzeichnis liegt im Umkreis
        von 1,2 km keine Einkehr.
      </p>
    </div>
  );
}
