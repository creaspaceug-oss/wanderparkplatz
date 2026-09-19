"use client";

import { useId, useState } from "react";

export interface DruckHose {
  key: string;
  name: string;
  wassersaeule: number | null;
  url: string;
}

type Haltung = "sitzen" | "knien";

/**
 * Wie viel Wasserdruck entsteht, wenn man sich mit der Regenhose auf nassen
 * Untergrund setzt oder kniet?
 *
 * Die Physik ist einfach: Druck = Gewichtskraft ÷ Auflagefläche, und ein
 * Millimeter Wassersäule entspricht 9,81 Pascal. Unsicher sind nur die
 * Eingangswerte — welcher Anteil des Gewichts auf der Stelle lastet und wie
 * groß die Fläche ist. Beides steht offen da und lässt sich verstellen.
 * Die Vergleichswerte — 1.300 mm nach DIN, 4.000 mm nach EMPA — nennt der DAV.
 */
const HALTUNG: Record<Haltung, { text: string; anteil: number; flaeche: number; wo: string }> = {
  sitzen: { text: "Sitzen auf nassem Stein", anteil: 0.75, flaeche: 400, wo: "Gesäß" },
  knien: { text: "Knien auf einem Knie", anteil: 0.5, flaeche: 25, wo: "Knie" },
};

const G = 9.81;
const nf = (n: number) => Math.round(n).toLocaleString("de-DE");

export default function Druckrechner({ hosen }: { hosen: DruckHose[] }) {
  const id = useId();
  const [haltung, setHaltung] = useState<Haltung>("knien");
  const [gewicht, setGewicht] = useState(75);
  const [rucksack, setRucksack] = useState(6);
  const [flaeche, setFlaeche] = useState(HALTUNG.knien.flaeche);

  const h = HALTUNG[haltung];
  // Beim Sitzen ist der Rucksack meist abgesetzt, beim Knien (Schuh binden, Foto) oft nicht.
  const last = (gewicht + (haltung === "knien" ? rucksack : 0)) * h.anteil;
  const pascal = (last * G) / (flaeche / 10_000);
  const mm = pascal / G;

  const stufe = mm > 10_000 ? "ueber" : mm > 4_000 ? "empa" : mm > 1_300 ? "din" : "unter";

  const waehle = (x: Haltung) => {
    setHaltung(x);
    setFlaeche(HALTUNG[x].flaeche);
  };

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-center text-sm transition ${
      aktiv ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
    }`;

  const regler = (
    label: string,
    wert: number,
    setzen: (v: number) => void,
    min: number,
    max: number,
    schritt: number,
    einheit: string,
    name: string,
  ) => (
    <div>
      <label htmlFor={`${id}-${name}`} className="flex items-baseline justify-between text-sm text-muted">
        {label}
        <output htmlFor={`${id}-${name}`} className="text-lg font-bold tabular-nums text-foreground">
          {wert} {einheit}
        </output>
      </label>
      <input
        id={`${id}-${name}`}
        type="range"
        min={min}
        max={max}
        step={schritt}
        value={wert}
        onChange={(e) => setzen(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--accent)]"
      />
    </div>
  );

  // Balken logarithmisch, sonst verschwinden 1.300 mm neben 15.000 mm.
  const skala = (v: number) => Math.min(100, (Math.log10(Math.max(v, 100)) - 2) / (Math.log10(40_000) - 2) * 100);

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-muted">Was machst du in der nassen Hose?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(HALTUNG) as Haltung[]).map((x) => (
                <label key={x} className={knopf(haltung === x)}>
                  <input type="radio" name={`${id}-h`} checked={haltung === x} onChange={() => waehle(x)} className="sr-only" />
                  {HALTUNG[x].text}
                </label>
              ))}
            </div>
          </fieldset>
          {regler("Dein Gewicht", gewicht, setGewicht, 40, 130, 1, "kg", "g")}
          {haltung === "knien" && regler("Rucksack auf dem Rücken", rucksack, setRucksack, 0, 20, 1, "kg", "r")}
          {regler(`Auflagefläche ${h.wo} (Annahme)`, flaeche, setFlaeche, haltung === "knien" ? 10 : 150, haltung === "knien" ? 80 : 900, haltung === "knien" ? 5 : 25, "cm²", "f")}
          <p className="text-xs leading-relaxed text-muted">
            Annahmen, die du verstellen kannst: Beim {haltung === "knien" ? "Knien" : "Sitzen"} tragen
            wir {Math.round(h.anteil * 100)} % des Gewichts auf dieser Fläche an
            {haltung === "knien" ? ", den Rest trägt der andere Fuß" : ", den Rest tragen die Füße"}.
            Auf hartem, unebenem Stein ist die tatsächliche Fläche eher kleiner, der Druck also höher.
          </p>
        </div>

        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Druck auf die Hose am {h.wo}</p>
          <p className="text-3xl font-bold tabular-nums">{nf(mm)} mm</p>
          <p className="text-sm text-muted">Wassersäule, grob geschätzt</p>

          <div className="mt-4 space-y-2 text-xs">
            {[
              { t: "Du", v: mm, hervor: true },
              { t: "wasserdicht nach DIN", v: 1_300 },
              { t: "Empfehlung EMPA", v: 4_000 },
              { t: "Hosen in diesem Vergleich", v: 10_000 },
            ].map((z) => (
              <div key={z.t}>
                <div className="flex justify-between">
                  <span className={z.hervor ? "font-semibold" : "text-muted"}>{z.t}</span>
                  <span className="tabular-nums">{nf(z.v)} mm</span>
                </div>
                <div className="mt-0.5 h-2 rounded-full bg-sand">
                  <div
                    className={`h-2 rounded-full ${z.hervor ? "bg-accent" : "bg-muted/50"}`}
                    style={{ width: `${skala(z.v)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed">
            {stufe === "ueber"
              ? `Mehr als die 10.000 mm, die die Hersteller hier angeben. Am ${h.wo} kann Wasser durchdrücken — kurz knien geht, lange nicht. Ein Sitzkissen oder die Rucksackhülle darunter hilft.`
              : stufe === "empa"
                ? "Mehr als die 4.000 mm der EMPA-Empfehlung, aber unter 10.000 mm. Eine Hose mit 10.000 mm hält das aus."
                : stufe === "din"
                  ? "Über den 1.300 mm, ab denen ein Stoff nach DIN als wasserdicht gilt. Genau deshalb empfiehlt die EMPA mindestens 4.000 mm."
                  : "Unter der DIN-Schwelle von 1.300 mm. Jede wasserdichte Hose hält das."}
          </p>

          <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            {hosen.map((x) => {
              const haelt = x.wassersaeule === null ? null : x.wassersaeule >= mm;
              return (
                <li key={x.key} className="flex items-center justify-between gap-2">
                  <a href={x.url} rel="sponsored nofollow noopener" target="_blank" className="hover:text-accent">
                    {x.name}
                    <span className="sr-only"> bei Amazon, Anzeige</span>
                  </a>
                  <span
                    className={`shrink-0 text-xs font-semibold ${haelt === null ? "text-muted" : haelt ? "text-accent" : "text-red-700 dark:text-red-400"}`}
                  >
                    {haelt === null ? "k. A." : haelt ? "hält" : "zu wenig"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted">Anzeige: Die Namen führen zu Amazon.</p>
        </div>
      </div>
    </div>
  );
}
