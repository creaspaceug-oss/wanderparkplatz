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

/**
 * Ortsangabe zu einem Wegnamen, ohne den Namen zu beugen.
 *
 * "Am Rechter Neckarrandweg" ist falsch, richtig wäre "Am Rechten". Statt
 * den Eigennamen zu beugen — für beliebige Namen nicht zuverlässig lösbar —
 * nimmt ein vorangestelltes Gattungswort die Beugung auf.
 *
 * Entscheidend ist, das eng zu fassen. Von Ortsnamen abgeleitete Adjektive
 * auf -er werden im Deutschen gar nicht gebeugt: "Am Bucher Hufeisen" und
 * "Am Vogelsanger Weg" sind schon richtig. Eine grobe Regel über alle
 * Endungen auf -er, -e, -es griff bei 247 von 1.634 Wegen, nötig war sie bei
 * 78 — sie hätte 169 Seiten ohne Grund umständlicher gemacht.
 *
 * Erkannt werden deshalb nur Ableitungssilben echter Adjektive und eine
 * Liste häufiger Grundwörter. Die Liste ist nicht vollständig; ein nicht
 * erkannter Name bleibt bei der bisherigen Form.
 */
const ADJEKTIV_VORNE =
  /^(?:[A-ZÄÖÜ][a-zäöüß]*(?:isch|lich|ig|sam|bar)|Groß|Gross|Klein|Hoh|Nieder|Ober|Unter|Mittler|Vorder|Hinter|Äußer|Inner|Recht|Link|Alt|Neu|Lang|Kurz|Weiß|Schwarz|Rot|Blau|Grün|Gelb|Breit|Schmal|Tief|Flach|Steil|Spitz|Rund|Krumm|Dick|Schön|Wild|Still|Finster|Dunkel|Hell|Nass|Trocken|Voralpin)(?:er|e|es)\s+\S/;

const amWeg = (name: string) =>
  ADJEKTIV_VORNE.test(name) ? `Am Wanderweg ${name}` : `Am ${name}`;

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
    // Ohne Artikel: "Der" vor einem Eigennamen rät dessen Geschlecht.
    if (markiert) teile.push(`${markiert.name} trägt als Markierung ${markiert.markierung}.`);
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
  plaetze: { gebuehr: boolean | null; stellplaetze: number | null; oberflaeche: string | null }[],
  ziele: OrtZiel[],
  orte: { name: string }[],
  laender: string[],
  umfeld: UmfeldEintrag[] = [],
): string[] {
  const absaetze: string[] = [];

  absaetze.push(
    `${amWeg(weg.name)} ${weg.parkplatz_count === 1 ? "ist" : "sind"} ${nf.format(weg.parkplatz_count)} ` +
      `${weg.parkplatz_count === 1 ? "Wanderparkplatz" : "Wanderparkplätze"} erfasst.` +
      gebuehrensatz(plaetze) +
      (laender.length ? ` Der Weg berührt ${aufzaehlung(laender)}.` : "") +
      " Alle Plätze liegen höchstens 200 Meter vom Wegverlauf entfernt — sie eignen sich" +
      " als Ausgangspunkt für eine Runde oder als Ein- und Ausstieg einer Etappe.",
  );

  // Zahlen, die vor der Fahrt zählen: Wie viel Platz gibt es, und worauf
  // steht man. Beides liegt vor, stand aber nur auf den Einzelseiten.
  const summe = plaetze.reduce((s, p) => s + (p.stellplaetze ?? 0), 0);
  const mitZahl = plaetze.filter((p) => p.stellplaetze != null).length;
  const unbefestigt = plaetze.filter(
    (p) => p.oberflaeche && /Schotter|Kies|Naturboden|Erde|Wiese|unbefestigt|Sand|Rasengitter|Hackschnitzel/i.test(p.oberflaeche),
  ).length;
  const mitBelag = plaetze.filter((p) => p.oberflaeche).length;

  const kapazitaet: string[] = [];
  if (summe > 0)
    kapazitaet.push(
      `Für ${mitZahl === 1 ? "einen Platz" : `${nf.format(mitZahl)} Plätze`} ist die Stellplatzzahl erfasst, zusammen ${nf.format(summe)} Stellplätze.`,
    );
  if (mitBelag > 0 && unbefestigt > 0)
    kapazitaet.push(
      unbefestigt === mitBelag
        ? `Wo der Untergrund bekannt ist, ${mitBelag === 1 ? "ist er unbefestigt" : "sind alle unbefestigt"} — Schotter, Kies oder Waldboden.`
        : `Von ${nf.format(mitBelag)} Plätzen mit Angabe zum Untergrund ${unbefestigt === 1 ? "ist einer" : `sind ${nf.format(unbefestigt)}`} unbefestigt.`,
    );
  if (kapazitaet.length) absaetze.push(kapazitaet.join(" "));

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

  const umfeldSatz = umfeldsatz(umfeld);
  if (umfeldSatz) absaetze.push(umfeldSatz);

  return absaetze;
}
