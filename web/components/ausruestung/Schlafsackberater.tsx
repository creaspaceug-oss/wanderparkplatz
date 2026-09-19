"use client";

import { useId, useState } from "react";

export interface Angebot {
  asin: string;
  name: string;
  material: string;
  gramm: number | null;
  mikrowelle: string;
  url: string;
  anzeige: string | null;
  zeit: string | null;
}

type Wichtig = "gewicht" | "preis" | "haut";

/**
 * Welcher Hüttenschlafsack — drei Fragen, eine Empfehlung und eine
 * Alternative. Die Zuordnung steht hier offen, nicht in einer Punkteformel:
 * Wer friert, braucht Wärme, und Wärme kann von den Modellen hier nur das
 * Thermolite-Inlett; wer Gewicht spart, nimmt Seide; wer Geld spart,
 * Mikrofaser; wer es wie Bettwäsche will, Baumwolle.
 */
const REGELN: Record<"friert" | Wichtig, { erst: string; dann: string; warum: string }> = {
  friert: {
    erst: "B0CT6B4WGH",
    dann: "B001DX8064",
    warum:
      "Hüttenschlafsäcke aus Seide, Baumwolle oder Mikrofaser sind für Hygiene gemacht, nicht für Wärme. Das Thermolite-Inlett ist hier das einzige, das spürbar wärmt. Die Baumwolle von Cocoon soll laut Hersteller bis zu 3,9 Grad bringen.",
  },
  gewicht: {
    erst: "B07YHX12ZK",
    dann: "B01NAV63BX",
    warum: "Seide ist das leichteste Material: 140 Gramm in der schmalen Fassung. Mikrofaser ist die günstigere Alternative mit 230 Gramm.",
  },
  preis: {
    erst: "B01NAV63BX",
    dann: "B0C5D1TC3J",
    warum: "Mikrofaser ist günstig, leicht und klein. Wer lieber Baumwolle auf der Haut hat, bekommt sie mit 225 Gramm fast ebenso leicht.",
  },
  haut: {
    erst: "B001DX8064",
    dann: "B001DX9YTQ",
    warum: "Baumwolle fühlt sich an wie Bettwäsche. Seide ist glatter und kühler, aber deutlich teurer.",
  },
};

export default function Schlafsackberater({ angebote }: { angebote: Angebot[] }) {
  const id = useId();
  const [friert, setFriert] = useState(false);
  const [wichtig, setWichtig] = useState<Wichtig>("haut");
  const [mikro, setMikro] = useState(false);

  const regel = REGELN[friert ? "friert" : wichtig];
  const finde = (asin: string) => angebote.find((a) => a.asin === asin);
  let erst = finde(regel.erst);
  let dann = finde(regel.dann);
  // Wo die Hütte die Mikrowelle verlangt, kommt vorn nur etwas, bei dem der
  // Hersteller kein Metall nennt oder die Mikrowelle ausdrücklich erlaubt.
  const heikel = (a?: Angebot) => !!a && /nicht angegeben|Reißverschluss —/.test(a.mikrowelle);
  if (mikro && heikel(erst) && dann && !heikel(dann)) [erst, dann] = [dann, erst];

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-center transition ${
      aktiv ? "border-accent bg-card" : "border-line bg-card/60 hover:border-muted"
    }`;

  const karte = (a: Angebot | undefined, haupt: boolean) =>
    a && (
      <div className={haupt ? "" : "mt-3 border-t border-line pt-3"}>
        <p className="text-sm text-muted">{haupt ? "Unsere Empfehlung" : "Alternative"}</p>
        <p className={`${haupt ? "text-2xl" : "text-lg"} font-bold leading-tight`}>{a.name}</p>
        <p className="text-sm text-muted">
          {a.material}
          {a.gramm ? ` · ${a.gramm} g` : ""} · Mikrowelle: {a.mikrowelle}
        </p>
        <a
          href={a.url}
          rel="sponsored nofollow noopener"
          target="_blank"
          className={`mt-2 inline-block rounded-lg bg-accent px-3 py-1.5 font-semibold text-white hover:brightness-110 dark:text-background ${haupt ? "text-sm" : "text-xs"}`}
        >
          {a.anzeige ? `${a.anzeige} bei Amazon` : "bei Amazon"} <span aria-hidden>→</span>
        </a>
        <span className="mt-1 block text-xs text-muted">
          Anzeige{a.zeit ? ` · Preis und Verfügbarkeit: Stand ${a.zeit} Uhr` : ""}
        </span>
      </div>
    );

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-muted">Frierst du nachts leicht?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                [false, "nein"],
                [true, "ja, oft"],
              ].map(([w, t]) => (
                <label key={String(w)} className={knopf(friert === w)}>
                  <input type="radio" name={`${id}-f`} checked={friert === w} onChange={() => setFriert(w as boolean)} className="sr-only" />
                  <span className="font-semibold">{t as string}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={friert} className={friert ? "opacity-50" : ""}>
            <legend className="text-sm font-medium text-muted">Was zählt für dich am meisten?</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                [
                  ["gewicht", "Gewicht"],
                  ["preis", "Preis"],
                  ["haut", "Hautgefühl"],
                ] as [Wichtig, string][]
              ).map(([k, t]) => (
                <label key={k} className={knopf(wichtig === k)}>
                  <input type="radio" name={`${id}-w`} checked={wichtig === k} onChange={() => setWichtig(k)} className="sr-only" />
                  <span className="text-sm font-semibold">{t}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium text-muted">Muss der Schlafsack auf deiner Hütte in die Mikrowelle?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                [false, "nein / weiß nicht"],
                [true, "ja"],
              ].map(([w, t]) => (
                <label key={String(w)} className={knopf(mikro === w)}>
                  <input type="radio" name={`${id}-m`} checked={mikro === w} onChange={() => setMikro(w as boolean)} className="sr-only" />
                  <span className="text-sm font-semibold">{t as string}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-[0.95rem] leading-relaxed">{regel.warum}</p>
        </div>
        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          {karte(erst, true)}
          {karte(dann, false)}
          {mikro && (
            <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
              Metall gehört nicht in die Mikrowelle — auch kein Reißverschlussschieber. Wo der
              Hersteller nichts dazu sagt, vorher auf der Hütte fragen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
