"use client";

import { useId, useState } from "react";

export interface FinderGroesse {
  k: string;
  von?: number;
  bis?: number;
  damen?: boolean;
  url: string;
  anzeige: string | null;
}

export interface FinderSocke {
  key: string;
  name: string;
  groessen: FinderGroesse[];
}

type Schuh = "leicht" | "wander" | "berg";
type Zeit = "sommer" | "uebergang" | "winter";

/**
 * Welche Socke zu welchem Schuh — und in welcher Größe.
 *
 * Die Regel, offen: Die Polsterung folgt dem Schuh (Falke ordnet leichte
 * Polsterung Schuhkategorie A zu, mittelstarke A–B), Winter und Bergstiefel
 * vertragen mehr, Sommer weniger. Für Schuhe mit Membran nennt Rohner seine
 * Fibre Tech ausdrücklich. Die Größe wird aus den Angeboten gesucht, die
 * Schuhgrößen nennen; sonst wählt man sie bei Amazon.
 */
export default function Sockenfinder({ socken, zeit: preisZeit }: { socken: FinderSocke[]; zeit: string | null }) {
  const id = useId();
  const [schuh, setSchuh] = useState<Schuh>("wander");
  const [jahreszeit, setJahreszeit] = useState<Zeit>("uebergang");
  const [membran, setMembran] = useState(false);
  const [blasen, setBlasen] = useState(false);
  const [damen, setDamen] = useState(false);
  const [groesse, setGroesse] = useState(42);

  const polster =
    schuh === "berg" || jahreszeit === "winter"
      ? "stark"
      : schuh === "leicht" || jahreszeit === "sommer"
        ? "leicht"
        : "mittel";
  const [erst, dann] =
    polster === "leicht"
      ? ["tk5", "tk2"]
      : polster === "mittel"
        ? ["tk2", "darn"]
        : membran
          ? ["rohner", "bridgedale"]
          : ["danish", "rohner"];
  const finde = (k: string) => socken.find((s) => s.key === k);

  const passendeGroesse = (s?: FinderSocke) => {
    if (!s) return null;
    // Ohne eigene Damengrößen gilt die Socke als unisex.
    const unisex = !s.groessen.some((g) => g.damen);
    const mitMass = s.groessen.filter((g) => g.von !== undefined && (unisex || !!g.damen === damen));
    const treffer = mitMass.find((g) => g.von! <= groesse && groesse <= g.bis!);
    if (treffer) return { g: treffer, genau: true };
    const ohne = s.groessen.find((g) => g.von === undefined && !!g.damen === damen) ?? s.groessen.find((g) => g.von === undefined);
    return ohne ? { g: ohne, genau: false } : null;
  };

  const karte = (k: string, haupt: boolean) => {
    const s = finde(k);
    const pg = passendeGroesse(s);
    if (!s) return null;
    return (
      <div className={haupt ? "" : "mt-3 border-t border-line pt-3"}>
        <p className="text-sm text-muted">{haupt ? "Unsere Empfehlung" : "Alternative"}</p>
        <p className={`${haupt ? "text-2xl" : "text-lg"} font-bold leading-tight`}>{s.name}</p>
        {pg ? (
          <>
            <a
              href={pg.g.url}
              rel="sponsored nofollow noopener"
              target="_blank"
              className={`mt-2 inline-block rounded-lg bg-accent px-3 py-1.5 font-semibold text-white hover:brightness-110 dark:text-background ${haupt ? "text-sm" : "text-xs"}`}
            >
              {pg.genau ? `Größe ${pg.g.k}` : pg.g.k}
              {pg.g.anzeige ? ` — ${pg.g.anzeige}` : ""} <span aria-hidden>→</span>
            </a>
            {!pg.genau && <span className="mt-1 block text-xs text-muted">Größe {groesse} auf der Amazon-Seite wählen</span>}
          </>
        ) : (
          <p className="mt-1 text-xs text-muted">In Größe {groesse} {damen ? "für Damen " : ""}nicht im Angebot.</p>
        )}
      </div>
    );
  };

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-center text-sm transition ${
      aktiv ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
    }`;
  const gruppe = <T,>(legend: string, name: string, wert: T, setzen: (v: T) => void, optionen: [T, string][]) => (
    <fieldset>
      <legend className="text-sm font-medium text-muted">{legend}</legend>
      <div className={`mt-2 grid gap-2 ${optionen.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {optionen.map(([v, t]) => (
          <label key={String(v)} className={knopf(wert === v)}>
            <input type="radio" name={`${id}-${name}`} checked={wert === v} onChange={() => setzen(v)} className="sr-only" />
            {t}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          {gruppe<Schuh>("Welcher Schuh?", "schuh", schuh, setSchuh, [
            ["leicht", "Halbschuh, Trailrunner"],
            ["wander", "Wanderschuh"],
            ["berg", "Bergstiefel"],
          ])}
          {gruppe<Zeit>("Wann?", "zeit", jahreszeit, setJahreszeit, [
            ["sommer", "Sommer"],
            ["uebergang", "Frühjahr, Herbst"],
            ["winter", "Winter"],
          ])}
          <div className="grid gap-4 sm:grid-cols-3">
            {gruppe<boolean>("Schuh mit Membran?", "membran", membran, setMembran, [
              [false, "nein"],
              [true, "ja"],
            ])}
            {gruppe<boolean>("Oft Blasen?", "blasen", blasen, setBlasen, [
              [false, "selten"],
              [true, "oft"],
            ])}
            {gruppe<boolean>("Passform", "damen", damen, setDamen, [
              [false, "Herren"],
              [true, "Damen"],
            ])}
          </div>
          <div>
            <label htmlFor={`${id}-gr`} className="flex items-baseline justify-between text-sm text-muted">
              Schuhgröße
              <output htmlFor={`${id}-gr`} className="text-2xl font-bold tabular-nums text-foreground">
                {groesse}
              </output>
            </label>
            <input
              id={`${id}-gr`}
              type="range"
              min={35}
              max={49}
              value={groesse}
              onChange={(e) => setGroesse(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--accent)]"
            />
          </div>
        </div>

        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Polsterung</p>
          <p className="text-3xl font-bold">{polster}</p>
          <div className="mt-3 border-t border-line pt-3">{karte(erst, true)}</div>
          {karte(dann, false)}
          {blasen && (
            <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed">
              <strong>Bei Blasen:</strong> Größe genau nehmen — Falke rät bei Zwischengrößen zur
              kleineren. Und eine dünne, eng anliegende Kunstfasersocke darunter versuchen: Dann reiben
              die Socken aneinander statt an der Haut.
            </p>
          )}
          <p className="mt-3 text-xs text-muted">Anzeige{preisZeit ? ` · Preis und Verfügbarkeit: Stand ${preisZeit} Uhr` : ""}</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Unsere Faustregel: Die Polsterung folgt dem Schuh — Falke ordnet leicht gepolsterte Socken
        Schuhkategorie A zu, mittelstark gepolsterte A bis B. Bergstiefel und Winter vertragen
        dickere, Sommer und leichte Schuhe dünnere Socken. Der Tipp mit der zweiten Socke stammt vom
        Österreichischen Alpenverein.
      </p>
    </div>
  );
}
