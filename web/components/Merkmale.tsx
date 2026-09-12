import type { Parkplatz } from "@/lib/db";

/**
 * Die Angaben, nach denen vor der Fahrt entschieden wird, als Zeile ganz oben.
 *
 * Dieselben Werte stehen weiter unten in der vollständigen Tabelle. Oben
 * stehen sie trotzdem, weil "kostet das etwas und passe ich da hin" die
 * Fragen sind, die über das Ziel entscheiden — sie sollen nicht erst nach
 * drei Absätzen Fließtext auftauchen.
 *
 * Gezeigt wird nur, was erfasst ist. Ein "Toilette: nein" ist keine
 * Information, sondern eine Behauptung: In OpenStreetMap heißt ein fehlender
 * Eintrag "niemand hat nachgesehen", nicht "gibt es nicht".
 */
export default function Merkmale({ p }: { p: Parkplatz }) {
  const stuecke: { text: string; stark?: boolean }[] = [];

  if (p.gebuehr === false) stuecke.push({ text: "kostenfrei", stark: true });
  if (p.gebuehr === true) stuecke.push({ text: "gebührenpflichtig", stark: true });
  if (p.stellplaetze) stuecke.push({ text: `${p.stellplaetze} Stellplätze` });
  if (p.oberflaeche) stuecke.push({ text: p.oberflaeche });
  if (p.wc) stuecke.push({ text: "Toilette" });
  if (p.barrierefrei) stuecke.push({ text: "barrierefreie Plätze" });
  if (p.wohnmobil) stuecke.push({ text: "für Wohnmobile" });
  if (p.beleuchtet) stuecke.push({ text: "beleuchtet" });

  if (!stuecke.length) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {stuecke.map((s) => (
        <li
          key={s.text}
          className={
            "rounded-full border px-3 py-1 text-sm " +
            (s.stark
              ? "border-accent bg-accent-soft font-medium text-foreground"
              : "border-line bg-card text-muted")
          }
        >
          {s.text}
        </li>
      ))}
    </ul>
  );
}
