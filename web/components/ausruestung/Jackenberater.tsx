"use client";

import { useId, useState } from "react";

export interface JackenAngebot {
  key: string;
  name: string;
  herren: { url: string; anzeige: string | null } | null;
  damen: { url: string; anzeige: string | null } | null;
}

type Einsatz = "notfall" | "regelmaessig" | "lang";

/**
 * Welche Regenjacke — nach Einsatz, Schwitzen und Passform.
 *
 * Die Regel, offen: Für den Notfall zählt Gewicht, für regelmäßigen Regen
 * ein belegtes Testergebnis, für lange und häufige Regentage die Haltbarkeit
 * von drei Lagen (DAV). Wer bergauf viel schwitzt, bekommt die Jacke mit
 * Unterarm-Reißverschlüssen — der DAV nennt Belüftung als Merkmal einer
 * guten Wanderjacke. Modelle ohne passende Passform fallen heraus.
 */
const REGEL: Record<Einsatz, string[]> = {
  notfall: ["marmot", "escape", "columbia"],
  regelmaessig: ["escape", "berghaus", "marmot"],
  lang: ["torrentshell", "escape", "berghaus"],
};

const WARUM: Record<string, string> = {
  marmot: "Leicht und mit Unterarm-Reißverschlüssen zum Lüften.",
  escape: "Im Saldo-Test die einzige in Deutschland erhältliche Jacke mit „gut“ (geprüft: Damenmodell).",
  columbia: "Schlicht und in der eigenen Tasche verstaubar.",
  berghaus: "Die höchste Wassersäulen-Angabe im Vergleich: 12.000 mm.",
  torrentshell: "Drei Lagen — laut DAV besonders leistungsfähig und langlebig.",
};

export default function Jackenberater({ angebote }: { angebote: Record<string, JackenAngebot> }) {
  const id = useId();
  const [einsatz, setEinsatz] = useState<Einsatz>("regelmaessig");
  const [schwitzen, setSchwitzen] = useState(false);
  const [damen, setDamen] = useState(false);

  const passt = (k: string) => Boolean(damen ? angebote[k]?.damen : angebote[k]?.herren);
  let reihe = REGEL[einsatz].filter(passt);
  if (schwitzen && passt("marmot")) reihe = ["marmot", ...reihe.filter((k) => k !== "marmot")];
  const [erst, dann] = reihe;

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-center text-sm transition ${
      aktiv ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
    }`;
  const gruppe = <T,>(legend: string, name: string, wert: T, setzen: (v: T) => void, optionen: [T, string][]) => (
    <fieldset>
      <legend className="text-sm font-medium text-muted">{legend}</legend>
      <div className={`mt-2 grid gap-2 ${optionen.length === 3 ? "sm:grid-cols-3" : "grid-cols-2"}`}>
        {optionen.map(([v, t]) => (
          <label key={String(v)} className={knopf(wert === v)}>
            <input type="radio" name={`${id}-${name}`} checked={wert === v} onChange={() => setzen(v)} className="sr-only" />
            {t}
          </label>
        ))}
      </div>
    </fieldset>
  );

  const karte = (k: string | undefined, haupt: boolean) => {
    if (!k) return null;
    const a = angebote[k];
    const v = damen ? a.damen : a.herren;
    if (!v) return null;
    return (
      <div className={haupt ? "" : "mt-3 border-t border-line pt-3"}>
        <p className="text-sm text-muted">{haupt ? "Unsere Empfehlung" : "Alternative"}</p>
        <p className={`${haupt ? "text-xl" : "text-base"} font-bold leading-tight`}>{a.name}</p>
        <p className="mt-1 text-sm leading-snug">{WARUM[k]}</p>
        <a
          href={v.url}
          rel="sponsored nofollow noopener"
          target="_blank"
          className={`mt-2 inline-block rounded-lg bg-accent px-3 py-1.5 font-semibold text-white hover:brightness-110 dark:text-background ${haupt ? "text-sm" : "text-xs"}`}
        >
          {damen ? "Damen" : "Herren"}
          {v.anzeige ? ` · ${v.anzeige}` : ""} <span aria-hidden>→</span>
          <span className="sr-only"> bei Amazon, Anzeige</span>
        </a>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          {gruppe<Einsatz>("Wofür brauchst du die Jacke?", "einsatz", einsatz, setEinsatz, [
            ["notfall", "Nur für den Notfall im Rucksack"],
            ["regelmaessig", "Regelmäßig, wenn es regnet"],
            ["lang", "Oft und lange, auch mehrtägig"],
          ])}
          <div className="grid gap-4 sm:grid-cols-2">
            {gruppe<boolean>("Schwitzt du bergauf stark?", "schwitzen", schwitzen, setSchwitzen, [
              [false, "eher nicht"],
              [true, "ja"],
            ])}
            {gruppe<boolean>("Passform", "damen", damen, setDamen, [
              [false, "Herren"],
              [true, "Damen"],
            ])}
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Tipp des DAV für die Größe: Die Regenjacke muss über die wärmste Schicht passen, die du
            darunter trägst. Ärmel und Rücken nicht zu kurz, unter den Achseln nicht zu eng.
          </p>
        </div>
        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          {karte(erst, true)}
          {karte(dann, false)}
          <p className="mt-3 text-xs text-muted">Anzeige · Größe auf der Amazon-Seite wählen</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Unsere Regel: Für den Notfall zählt das Gewicht, für regelmäßigen Regen ein belegtes
        Testergebnis, für lange Regentage die Haltbarkeit von drei Lagen. Wer stark schwitzt, bekommt
        die Jacke mit Unterarm-Reißverschlüssen. Modelle ohne passende Passform fallen heraus.
      </p>
    </div>
  );
}
