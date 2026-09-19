"use client";

import { useId, useState } from "react";

type Boden = "schnee" | "eis" | "firn" | "gletscher";
type Steil = "flach" | "maessig" | "steil";
type Schuh = "halb" | "wander" | "berg";

export interface GroessenAngebot {
  modell: string;
  k: string;
  schuh: [number, number];
  url: string;
  anzeige: string | null;
  zeit: string | null;
}

const BODEN: { k: Boden; text: string; unter: string }[] = [
  { k: "schnee", text: "Festgetretener Schnee", unter: "Winterwanderweg, Forststraße" },
  { k: "eis", text: "Vereister Weg", unter: "Blankeis, gefrorene Pfützen" },
  { k: "firn", text: "Hartes Schneefeld", unter: "Altschnee, Firn, morgens gefroren" },
  { k: "gletscher", text: "Gletscher", unter: "Hochtour" },
];

const STEIL: { k: Steil; text: string }[] = [
  { k: "flach", text: "flach" },
  { k: "maessig", text: "mäßig steil" },
  { k: "steil", text: "steil" },
];

const SCHUH: { k: Schuh; text: string; unter: string }[] = [
  { k: "halb", text: "Halbschuh", unter: "Trail-, Laufschuh" },
  { k: "wander", text: "Wanderschuh", unter: "knöchelhoch, weiche Sohle" },
  { k: "berg", text: "Bergschuh", unter: "steife Sohle, Absatzkante" },
];

type Urteil = { stufe: "nichts" | "groedel" | "steigeisen" | "umkehren"; titel: string; text: string };

/**
 * Die Faustregel, nach der die Seite argumentiert — ausgeschrieben statt
 * versteckt. Grundlage sind die beiden DAV-Artikel: Grödel für vereiste Wege,
 * Leichtsteigeisen bieten "deutlich mehr Sicherheit", auf hart gefrorenen
 * Altschneefeldern "geht ohne Steigeisen meistens nichts mehr", und
 * Steigeisen mit Kombibindung brauchen einen bedingt steigeisenfesten Schuh.
 */
function urteil(boden: Boden, steil: Steil, schuh: Schuh): Urteil {
  if (boden === "gletscher")
    return {
      stufe: "steigeisen",
      titel: "Steigeisen — und mehr als das",
      text: "Auf dem Gletscher sind Grödel falsch. Dort braucht es Steigeisen, Seil und das Wissen, sie zu benutzen. Das ist keine Ausrüstungsfrage mehr, sondern eine Ausbildungsfrage.",
    };
  if (boden === "firn") {
    if (steil === "steil")
      return {
        stufe: "umkehren",
        titel: "Steigeisen, Erfahrung — oder umkehren",
        text: "Auf einem harten, steilen Schneefeld erreicht man beim Ausrutschen laut DAV fast die Geschwindigkeit des freien Falls. Grödel halten das nicht auf. Ohne Steigeisen und Übung ist Umkehren die richtige Entscheidung.",
      };
    return {
      stufe: "steigeisen",
      titel: "Leichtsteigeisen",
      text:
        steil === "flach"
          ? "Für eine kurze, flache Querung können Grödel reichen. Hart gefrorener Altschnee ist aber genau das Gelände, in dem der DAV Steigeisen empfiehlt — wer so etwas auf der Tour erwartet, nimmt Leichtsteigeisen mit."
          : "Auf hart gefrorenem Altschnee geht laut DAV ohne Steigeisen meistens nichts mehr. Leichtsteigeisen bieten deutlich mehr Sicherheit als Grödel.",
    };
  }
  if (boden === "eis" && steil === "steil")
    return {
      stufe: "groedel",
      titel: "Grödel mit langen Zacken — an der Grenze",
      text: "Auf einem steilen, vereisten Weg helfen Grödel mit langen Zacken und festem Sitz. Wird es so steil, dass man sich mit den Händen halten möchte, sind Leichtsteigeisen die sicherere Wahl.",
    };
  if (boden === "schnee" && steil === "flach")
    return {
      stufe: "nichts",
      titel: "Meist nichts — Grödel als Reserve",
      text: "Auf flachem, festgetretenem Schnee trägt ein Schuh mit gutem Profil. Grödel in den Rucksack, falls der Weg morgens gefroren ist oder im Schatten vereist.",
    };
  return {
    stufe: "groedel",
    titel: "Grödel",
    text:
      schuh === "halb"
        ? "Genau dafür sind Grödel gemacht, und sie passen auch über Trail- und Laufschuhe. Auf die richtige Größe achten, sonst verrutschen sie."
        : "Genau dafür sind Grödel gemacht: vereiste Wege und Schnee, bergauf wie bergab. Sie passen über jeden Wanderschuh.",
  };
}

const FARBE: Record<Urteil["stufe"], string> = {
  nichts: "border-line",
  groedel: "border-accent",
  steigeisen: "border-warn",
  umkehren: "border-warn",
};

export default function Groedelberater({ angebote }: { angebote: GroessenAngebot[] }) {
  const id = useId();
  const [boden, setBoden] = useState<Boden>("eis");
  const [steil, setSteil] = useState<Steil>("maessig");
  const [schuh, setSchuh] = useState<Schuh>("wander");
  const [groesse, setGroesse] = useState(42);

  const u = urteil(boden, steil, schuh);
  const schuhHinweis =
    u.stufe === "steigeisen" && schuh !== "berg"
      ? schuh === "halb"
        ? " Über einen Halbschuh passt kein Steigeisen sicher."
        : " Auf einem Wanderschuh mit weicher Sohle hält nur ein Steigeisen mit Riemenbindung; für Kipphebel braucht es einen Bergschuh mit steifer Sohle und Absatzkante."
      : "";

  // Für jedes Modell die Größe, in deren Spanne die Schuhgröße fällt; bei
  // überlappenden Grenzen (40 steht bei Snowline in M und L) die größere.
  const passend = Object.values(
    angebote
      .filter((a) => a.schuh[0] <= groesse && groesse <= a.schuh[1])
      .reduce<Record<string, GroessenAngebot>>((acc, a) => {
        const alt = acc[a.modell];
        if (!alt || a.schuh[0] > alt.schuh[0]) acc[a.modell] = a;
        return acc;
      }, {}),
  );

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-left transition ${
      aktiv ? "border-accent bg-card" : "border-line bg-card/60 hover:border-muted"
    }`;

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-muted">Worauf gehst du?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {BODEN.map((x) => (
                <label key={x.k} className={knopf(boden === x.k)}>
                  <input type="radio" name={`${id}-boden`} checked={boden === x.k} onChange={() => setBoden(x.k)} className="sr-only" />
                  <span className="block font-semibold leading-snug">{x.text}</span>
                  <span className="block text-xs text-muted">{x.unter}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className="text-sm font-medium text-muted">Wie steil?</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {STEIL.map((x) => (
                  <label key={x.k} className={`${knopf(steil === x.k)} text-center`}>
                    <input type="radio" name={`${id}-steil`} checked={steil === x.k} onChange={() => setSteil(x.k)} className="sr-only" />
                    <span className="block text-sm font-semibold leading-snug">{x.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium text-muted">Welcher Schuh?</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SCHUH.map((x) => (
                  <label key={x.k} className={`${knopf(schuh === x.k)} text-center`} title={x.unter}>
                    <input type="radio" name={`${id}-schuh`} checked={schuh === x.k} onChange={() => setSchuh(x.k)} className="sr-only" />
                    <span className="block text-sm font-semibold leading-snug">{x.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className={`flex flex-col rounded-xl border-2 bg-card p-4 ${FARBE[u.stufe]}`} aria-live="polite">
          <p className="text-sm text-muted">Unsere Faustregel</p>
          <p className={`text-2xl font-bold leading-tight ${u.stufe === "groedel" ? "text-accent" : u.stufe === "nichts" ? "" : "text-warn"}`}>
            {u.titel}
          </p>
          <p className="mt-2 text-[0.95rem] leading-relaxed">
            {u.text}
            {schuhHinweis}
          </p>
        </div>
      </div>

      {/* Größenfinder: nur Modelle, deren Angebot Schuhgrößen nennt. */}
      <div className="mt-6 border-t border-line pt-5">
        <label htmlFor={`${id}-gr`} className="block text-sm font-medium text-muted">
          Schuhgröße des Schuhs, über den die Grödel kommen
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <output htmlFor={`${id}-gr`} className="w-14 text-4xl font-bold tabular-nums tracking-tight">
            {groesse}
          </output>
          <input
            id={`${id}-gr`}
            type="range"
            min={32}
            max={52}
            step={1}
            value={groesse}
            onChange={(e) => setGroesse(Number(e.target.value))}
            className="min-w-[12rem] flex-1 accent-[var(--accent)]"
          />
        </div>
        {u.stufe === "steigeisen" || u.stufe === "umkehren" ? (
          <p className="mt-3 rounded-xl border border-warn/40 bg-warn-soft/60 p-3 text-sm leading-relaxed">
            Für das Gelände oben helfen Grödel nicht, deshalb zeigen wir hier keine. Die Größen gelten
            für Wege, auf denen sie reichen — stell oben „Vereister Weg“ oder „Festgetretener Schnee“
            ein.
          </p>
        ) : passend.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {passend.map((a) => (
              <li key={a.url} className="rounded-xl border border-line bg-card p-3 text-sm">
                <p className="font-semibold">{a.modell}</p>
                <p className="text-muted">
                  Größe <strong className="text-foreground">{a.k}</strong> ({a.schuh[0]}–{a.schuh[1]})
                </p>
                <a
                  href={a.url}
                  rel="sponsored nofollow noopener"
                  target="_blank"
                  className="mt-2 inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                >
                  {a.anzeige ? `${a.anzeige} bei Amazon` : "bei Amazon"} <span aria-hidden>→</span>
                </a>
                <span className="mt-1 block text-xs text-muted">
                  Anzeige{a.zeit ? ` · Preis und Verfügbarkeit: Stand ${a.zeit} Uhr` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Für diese Schuhgröße nennt keines der Angebote eine passende Größe.</p>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Eine Faustregel, kein Ersatz für die Einschätzung vor Ort. Sie folgt den Artikeln des
        Deutschen Alpenvereins zu Leichtsteigeisen und Altschneefeldern. Die Größen stehen nur für
        Modelle, deren Angebot Schuhgrößen nennt; liegt eine Schuhgröße auf der Grenze zweier
        Größen, zeigen wir die größere — und empfehlen, beide über dem echten Schuh zu probieren.
      </p>
    </div>
  );
}
