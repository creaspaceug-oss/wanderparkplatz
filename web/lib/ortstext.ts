import type { Parkplatz } from "./db";
import type { OrtTrail, OrtZiel } from "./db";
import { aufzaehlung, nf } from "./format";

/**
 * Beschreibender Text für eine Ortsseite.
 *
 * Sätze werden als ganze Zeichenketten gebaut, nicht aus JSX-Teilen
 * zusammengesetzt — sonst entstehen Leerzeichen vor Komma und Punkt.
 * Eigennamen werden nicht gebeugt: "im Großer Arber" wäre falsch, und für
 * beliebige Namen lässt sich das nicht zuverlässig lösen.
 */
export function ortstext(
  ort: { name: string; poi_count: number; kreis_name?: string | null; bl_name?: string | null },
  plaetze: Parkplatz[],
  wege: OrtTrail[],
  ziele: OrtZiel[],
): string[] {
  const absaetze: string[] = [];

  const lage = [
    `${nf.format(ort.poi_count)} ${ort.poi_count === 1 ? "Wanderparkplatz ist" : "Wanderparkplätze sind"} `,
    `${ort.name} direkt zugeordnet`,
    ort.kreis_name ? `, ${ort.kreis_name}` : "",
    ort.bl_name ? ` in ${ort.bl_name}` : "",
    ".",
  ].join("");

  // Gebühren und Untergrund nur nennen, wo tatsächlich Angaben vorliegen
  const mitGebuehr = plaetze.filter((p) => p.gebuehr !== null);
  const frei = mitGebuehr.filter((p) => p.gebuehr === false).length;
  const gebuehren =
    mitGebuehr.length === 0
      ? ""
      : frei === mitGebuehr.length
        ? mitGebuehr.length === 1
          ? " Das Parken ist dort kostenfrei."
          : " Das Parken ist an allen kostenfrei."
        : frei === 0
          ? " Das Parken ist gebührenpflichtig."
          : ` Davon ${nf.format(frei)} kostenfrei.`;

  const summe = plaetze.reduce((s, p) => s + (p.stellplaetze ?? 0), 0);
  const kapazitaet = summe > 0 ? ` Zusammen sind ${nf.format(summe)} Stellplätze erfasst.` : "";

  absaetze.push(lage + gebuehren + kapazitaet);

  if (wege.length) {
    const fern = wege.filter((w) => w.netz === "iwn" || w.netz === "nwn");
    const teile = [
      `Ab den Parkplätzen ${wege.length === 1 ? "führt ein markierter Wanderweg" : `führen ${nf.format(wege.length)} markierte Wanderwege`} weiter.`,
    ];
    if (fern.length)
      teile.push(
        `Darunter ${fern.length === 1 ? "ist" : "sind"} ${aufzaehlung(fern.slice(0, 3).map((w) => w.name))} — ` +
          `${fern.length === 1 ? "ein Fernwanderweg" : "Fernwanderwege"}, hier lässt sich also auch eine Etappe beginnen.`,
      );
    const markiert = wege.find((w) => w.markierung);
    // Ohne Artikel: "Der" vor einem Eigennamen rät dessen Geschlecht.
    if (markiert) teile.push(`${markiert.name} trägt als Markierung ${markiert.markierung}.`);
    absaetze.push(teile.join(" "));
  }

  if (ziele.length) {
    const nah = ziele.filter((z) => z.distanz_m <= 5000).slice(0, 3);
    if (nah.length) {
      absaetze.push(
        `In Reichweite ${nah.length === 1 ? "liegt" : "liegen"} ${aufzaehlung(nah.map((z) => z.name))}` +
          `${nah.length === 1 && nah[0].hoehe_m ? ` (${nf.format(nah[0].hoehe_m)} m)` : ""}. ` +
          `Die Entfernungen sind Luftlinie ab dem Parkplatz — der Weg dorthin ist je nach Gelände länger.`,
      );
    }
  }

  return absaetze;
}
