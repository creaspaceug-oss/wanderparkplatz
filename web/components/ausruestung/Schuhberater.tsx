"use client";

import { useId, useState } from "react";

export interface SchuhAngebot {
  key: string;
  name: string;
  kategorie: string;
  herren: { url: string; anzeige: string | null } | null;
  damen: { url: string; anzeige: string | null } | null;
}

type Gelaende = "wege" | "mittelgebirge" | "bergwege" | "alpin";
type Last = "leicht" | "tag" | "mehrtag";

/**
 * Welche Schuhkategorie — nach Gelände und Gepäck.
 *
 * Die Regel, offen: Die Kategorie folgt dem Gelände, so wie sie der DAV
 * beschreibt — A für Wanderwege, B für Mittelgebirge und einfache Bergwege,
 * C für alpines Gelände. Schweres Gepäck verschiebt um eine Stufe nach oben,
 * weil die Sohle mehr tragen und der Schaft mehr führen muss. Ab Kategorie B
 * empfiehlt der DAV hohen Schaft und mehrzonige Schnürung.
 */
const GELAENDE: { k: Gelaende; text: string; stufe: number }[] = [
  { k: "wege", text: "Feld- und Waldwege, flach", stufe: 0 },
  { k: "mittelgebirge", text: "Mittelgebirge, Wurzeln und Steine", stufe: 1 },
  { k: "bergwege", text: "Markierte Bergwege, steil", stufe: 2 },
  { k: "alpin", text: "Alpines Gelände, Geröll, weglos", stufe: 3 },
];

const LAST: { k: Last; text: string; plus: number }[] = [
  { k: "leicht", text: "Kleiner Rucksack", plus: 0 },
  { k: "tag", text: "Tagesrucksack, 8–12 kg", plus: 0 },
  { k: "mehrtag", text: "Mehrtagesgepäck, über 12 kg", plus: 1 },
];

const STUFEN = [
  { kat: "A", kurz: "Leichte Schuhe für Wanderwege", keys: ["litetrail", "xultra", "peakfreak"] },
  { kat: "A/B", kurz: "Stiefel mit Reserve — oder ein leichter Schuh, wenn du trittsicher bist", keys: ["renegade", "litetrail", "moab"] },
  { kat: "B", kurz: "Wanderstiefel mit halbhohem Schaft", keys: ["renegade", "moab"] },
  { kat: "C", kurz: "Fester Bergstiefel, bedingt steigeisenfest", keys: ["island", "renegade"] },
];

export default function Schuhberater({ angebote }: { angebote: Record<string, SchuhAngebot> }) {
  const id = useId();
  const [gelaende, setGelaende] = useState<Gelaende>("mittelgebirge");
  const [last, setLast] = useState<Last>("tag");
  const [damen, setDamen] = useState(false);

  const stufe = Math.min(
    3,
    (GELAENDE.find((g) => g.k === gelaende)?.stufe ?? 1) + (LAST.find((l) => l.k === last)?.plus ?? 0),
  );
  const ziel = STUFEN[stufe];
  const passend = ziel.keys.filter((k) => (damen ? angebote[k]?.damen : angebote[k]?.herren));
  const [erst, dann] = passend;

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-center text-sm transition ${
      aktiv ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
    }`;

  const karte = (k: string | undefined, haupt: boolean) => {
    if (!k) return null;
    const a = angebote[k];
    const v = damen ? a.damen : a.herren;
    if (!v) return null;
    return (
      <div className={haupt ? "" : "mt-3 border-t border-line pt-3"}>
        <p className="text-sm text-muted">{haupt ? "Passt dazu" : "Alternative"}</p>
        <p className={`${haupt ? "text-xl" : "text-base"} font-bold leading-tight`}>{a.name}</p>
        <p className="text-xs text-muted">Kategorie {a.kategorie}</p>
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
          <fieldset>
            <legend className="text-sm font-medium text-muted">Wo gehst du?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {GELAENDE.map((g) => (
                <label key={g.k} className={knopf(gelaende === g.k)}>
                  <input
                    type="radio"
                    name={`${id}-gelaende`}
                    checked={gelaende === g.k}
                    onChange={() => setGelaende(g.k)}
                    className="sr-only"
                  />
                  {g.text}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-muted">Wie viel trägst du?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {LAST.map((l) => (
                <label key={l.k} className={knopf(last === l.k)}>
                  <input
                    type="radio"
                    name={`${id}-last`}
                    checked={last === l.k}
                    onChange={() => setLast(l.k)}
                    className="sr-only"
                  />
                  {l.text}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-muted">Passform</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                [false, "Herren"],
                [true, "Damen"],
              ].map(([v, t]) => (
                <label key={String(t)} className={knopf(damen === v)}>
                  <input
                    type="radio"
                    name={`${id}-passform`}
                    checked={damen === v}
                    onChange={() => setDamen(v as boolean)}
                    className="sr-only"
                  />
                  {t as string}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Kategorie</p>
          <p className="text-3xl font-bold">{ziel.kat}</p>
          <p className="mt-1 text-sm leading-relaxed">{ziel.kurz}</p>
          {stufe >= 2 && (
            <p className="mt-3 rounded-lg bg-sand px-3 py-2 text-xs leading-relaxed">
              Ab Kategorie B rät der DAV zu hohem Schaft und mehrzoniger Schnürung.
            </p>
          )}
          <div className="mt-3 border-t border-line pt-3">{karte(erst, true)}</div>
          {karte(dann, false)}
          <p className="mt-3 text-xs text-muted">Anzeige · Größe und Farbe auf der Amazon-Seite wählen</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Unsere Regel: Die Kategorie folgt dem Gelände, wie der Deutsche Alpenverein sie beschreibt.
        Mehrtagesgepäck über zwölf Kilo verschiebt um eine Stufe nach oben, weil Sohle und Schaft
        mehr tragen müssen. Die Einteilung ersetzt keine Anprobe: Welcher Leisten zu deinem Fuß
        passt, entscheidet sich im Laden.
      </p>
    </div>
  );
}
