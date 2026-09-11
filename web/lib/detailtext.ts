import type { Parkplatz, OrtTrail, OrtZiel, UmfeldEintrag } from "./db";
import { aufzaehlung, nf } from "./format";

/**
 * Beschreibende Texte für Ziel- und Wegseiten.
 *
 * Wie in ortstext.ts: Sätze werden als ganze Zeichenketten gebaut, nicht aus
 * JSX-Teilen zusammengesetzt — sonst entstehen Leerzeichen vor Komma und
 * Punkt. Eigennamen werden nicht gebeugt, "am Großer Arber" wäre falsch und
 * für beliebige Namen nicht zuverlässig lösbar. Deshalb stehen Namen hier
 * immer in einer Position, die keine Beugung verlangt.
 */

const meter = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

/** Fernwanderwege zuerst nennen — sie sind der stärkste Grund, hier zu starten. */
const fernwege = (wege: OrtTrail[]) => wege.filter((w) => w.netz === "iwn" || w.netz === "nwn");

function gebuehrensatz(plaetze: { gebuehr: boolean | null }[]): string {
  const mitAngabe = plaetze.filter((p) => p.gebuehr !== null);
  if (!mitAngabe.length) return "";
  const frei = mitAngabe.filter((p) => p.gebuehr === false).length;
  if (frei === mitAngabe.length)
    return mitAngabe.length === 1
      ? " Das Parken ist dort kostenfrei."
      : " Das Parken ist an allen kostenfrei.";
  if (frei === 0) return " Das Parken ist gebührenpflichtig.";
  return ` Davon ${nf.format(frei)} kostenfrei.`;
}

function umfeldsatz(umfeld: UmfeldEintrag[]): string {
  const naechster = (kategorie: string) =>
    umfeld.filter((e) => e.kategorie === kategorie && e.name).sort((a, b) => a.distanz_m - b.distanz_m)[0];

  const teile: string[] = [];
  const halt = naechster("oepnv");
  if (halt)
    teile.push(
      `Wer ohne Auto anreist, steigt an der Haltestelle ${halt.name} aus, ${meter(halt.distanz_m)} von einem der Parkplätze entfernt.`,
    );
  // Ohne Präposition vor dem Namen: "in Umoya Restaurant" wäre schief, und
  // ein Eigenname lässt sich nicht zuverlässig beugen.
  const einkehr = naechster("einkehr");
  if (einkehr)
    teile.push(`Die nächste Einkehr ist ${einkehr.name}, ${meter(einkehr.distanz_m)} entfernt.`);
  const huette = naechster("schutzhuette");
  if (!einkehr && huette)
    teile.push(`Als Unterstand steht ${huette.name} bereit, ${meter(huette.distanz_m)} entfernt.`);

  return teile.join(" ");
}

export function zieltext(
  ziel: { name: string; parkplatz_count: number },
  plaetze: (Parkplatz & { distanz_m: number })[],
  wege: OrtTrail[],
  umfeld: UmfeldEintrag[],
): string[] {
  const absaetze: string[] = [];
  const naechster = plaetze[0];

  absaetze.push(
    `Als Ausgangspunkt ${ziel.parkplatz_count === 1 ? "ist" : "sind"} ${nf.format(ziel.parkplatz_count)} ` +
      `${ziel.parkplatz_count === 1 ? "Wanderparkplatz" : "Wanderparkplätze"} erfasst. ` +
      `Der nächstgelegene liegt ${meter(naechster.distanz_m)} entfernt.` +
      gebuehrensatz(plaetze),
  );

  if (wege.length) {
    const teile = [
      wege.length === 1
        ? "Ab diesen Parkplätzen führt ein markierter Wanderweg weiter."
        : `Ab diesen Parkplätzen führen ${nf.format(wege.length)} markierte Wanderwege weiter.`,
    ];
    const fern = fernwege(wege);
    if (fern.length)
      teile.push(
        `Darunter ${fern.length === 1 ? "ist" : "sind"} ${aufzaehlung(fern.slice(0, 3).map((w) => w.name))} — ` +
          `${fern.length === 1 ? "ein Fernwanderweg" : "Fernwanderwege"}, hier lässt sich also auch eine Etappe beginnen.`,
      );
    const markiert = wege.find((w) => w.markierung);
    if (markiert) teile.push(`Der ${markiert.name} trägt als Markierung ${markiert.markierung}.`);
    absaetze.push(teile.join(" "));
  }

  const umfeldSatz = umfeldsatz(umfeld);
  if (umfeldSatz) absaetze.push(umfeldSatz);

  absaetze.push(
    "Alle Entfernungen sind Luftlinie. Der tatsächliche Weg ist je nach Gelände deutlich länger, " +
      "und die Angaben stammen aus OpenStreetMap — maßgeblich ist die Beschilderung vor Ort.",
  );

  return absaetze;
}

export function wegtext(
  weg: { name: string; parkplatz_count: number; laenge_km: string | null; markierung: string | null },
  plaetze: { gebuehr: boolean | null }[],
  ziele: OrtZiel[],
  orte: { name: string }[],
  laender: string[],
): string[] {
  const absaetze: string[] = [];

  absaetze.push(
    `Am ${weg.name} ${weg.parkplatz_count === 1 ? "ist" : "sind"} ${nf.format(weg.parkplatz_count)} ` +
      `${weg.parkplatz_count === 1 ? "Wanderparkplatz" : "Wanderparkplätze"} erfasst.` +
      gebuehrensatz(plaetze) +
      (laender.length ? ` Der Weg berührt ${aufzaehlung(laender)}.` : "") +
      " Alle Plätze liegen höchstens 200 Meter vom Wegverlauf entfernt — sie eignen sich" +
      " als Ausgangspunkt für eine Runde oder als Ein- und Ausstieg einer Etappe.",
  );

  if (orte.length > 1)
    absaetze.push(
      `Parkplätze liegen unter anderem in ${aufzaehlung(orte.slice(0, 4).map((o) => o.name))}. ` +
        `Wer eine Etappe plant, findet so einen Ein- und Ausstieg, der zur eigenen Tagesleistung passt.`,
    );

  if (ziele.length) {
    const teile = [
      ziele.length === 1
        ? `Von den Parkplätzen aus ist ein Wanderziel in Reichweite: ${ziele[0].name}.`
        : `Von den Parkplätzen aus sind ${nf.format(ziele.length)} Wanderziele in Reichweite, darunter ` +
          `${aufzaehlung(ziele.slice(0, 3).map((z) => z.name))}.`,
    ];
    const hoechster = ziele
      .filter((z) => z.hoehe_m !== null)
      .sort((a, b) => (b.hoehe_m ?? 0) - (a.hoehe_m ?? 0))[0];
    if (hoechster && ziele.length > 1)
      teile.push(`Am höchsten liegt ${hoechster.name} mit ${nf.format(hoechster.hoehe_m!)} Metern.`);
    absaetze.push(teile.join(" "));
  }

  return absaetze;
}
