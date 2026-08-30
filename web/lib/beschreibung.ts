import type { Parkplatz } from "./db";
import { kreisDativ } from "./regionen";
import type { TrailAmPlatz } from "./db";
import { beschreibung as kurz } from "./meta";

/**
 * Erzeugt aus den erfassten Merkmalen einen beschreibenden Text.
 * Die Variantenwahl hängt an der OSM-ID, damit Nachbarseiten sich sprachlich
 * unterscheiden und nicht als Textdubletten gelesen werden.
 */
function waehle<T>(varianten: T[], seed: number): T {
  return varianten[seed % varianten.length];
}

const kreisPhrase = (p: Parkplatz): string | null =>
  p.kreis_name ? kreisDativ(p.kreis_name, p.kreis_typ) : null;

const lage = (p: Parkplatz, seed: number): string => {
  if (p.ort_name && p.ort_km != null && p.ort_richtung) {
    const dist =
      p.ort_km < 0.8
        ? `direkt in ${p.ort_name}`
        : `${p.ort_km.toLocaleString("de-DE", { maximumFractionDigits: 1 })} km ${p.ort_richtung} von ${p.ort_name}`;
    return waehle(
      [
        `Der ${p.name} liegt ${dist}.`,
        `${p.name} befindet sich ${dist}.`,
        `Dieser Wanderparkplatz liegt ${dist}.`,
      ],
      seed,
    );
  }
  // Ohne Ortsbezug trägt der Kreis die Ortsangabe, sonst entstünde ein
  // tautologischer Satz ("X ist als Wanderparkplatz erfasst").
  const kp = kreisPhrase(p);
  return kp ? `Der ${p.name} liegt ${kp}.` : `${p.name} ist als Wanderparkplatz erfasst.`;
};

const region = (p: Parkplatz): string | null => {
  const kp = kreisPhrase(p);
  if (!kp || !p.bl_name) return null;
  // Ohne Ortsbezug steht der Kreis schon im ersten Satz.
  if (!p.ort_name) return `Das Gebiet gehört zu ${p.bl_name}.`;
  return `Er liegt ${kp} in ${p.bl_name}.`;
};

const kapazitaet = (p: Parkplatz, seed: number): string | null => {
  if (p.stellplaetze == null) return null;
  const groesse =
    p.stellplaetze <= 8 ? "klein" : p.stellplaetze <= 25 ? "mittelgroß" : "großzügig geschnitten";
  return waehle(
    [
      `Der Platz bietet ${p.stellplaetze} Stellplätze und ist damit ${groesse}.`,
      `Mit ${p.stellplaetze} Stellplätzen ist der Parkplatz ${groesse}.`,
      `Erfasst sind ${p.stellplaetze} Stellplätze — der Platz ist ${groesse}.`,
    ],
    seed,
  );
};

const gebuehren = (p: Parkplatz, seed: number): string | null => {
  if (p.gebuehr === false)
    return waehle(
      [
        "Für das Parken wird keine Gebühr erhoben.",
        "Das Parken ist nach den vorliegenden Daten kostenfrei.",
        "Gebühren sind für diesen Platz nicht erfasst — er gilt als kostenfrei.",
      ],
      seed,
    );
  if (p.gebuehr === true)
    return p.gebuehr_info
      ? `Das Parken ist gebührenpflichtig (${p.gebuehr_info}).`
      : "Das Parken ist gebührenpflichtig; zur Höhe liegen keine Angaben vor.";
  return null;
};

const untergrund = (p: Parkplatz, seed: number): string | null => {
  if (!p.oberflaeche) return null;
  const unbefestigt = /Schotter|Kies|Naturboden|Erde|Wiese|unbefestigt|Sand|Hackschnitzel|Rasengitter/i.test(
    p.oberflaeche,
  );
  const zusatz = unbefestigt
    ? " Nach längerem Regen ist mit weichem Untergrund zu rechnen."
    : "";
  return (
    waehle(
      [
        `Der Untergrund ist ${p.oberflaeche}.`,
        `Als Belag ist ${p.oberflaeche} erfasst.`,
        `Der Platz ist mit ${p.oberflaeche} befestigt.`,
      ],
      seed,
    ) + zusatz
  );
};

const zufahrt = (p: Parkplatz): string | null => {
  const teile: string[] = [];
  if (p.zugang && p.zugang !== "öffentlich zugänglich")
    teile.push(`Die Zufahrt ist als „${p.zugang}" gekennzeichnet.`);
  if (p.max_hoehe_m)
    teile.push(
      `Eine Höhenbegrenzung von ${Number(p.max_hoehe_m).toLocaleString("de-DE", { minimumFractionDigits: 2 })} m ist erfasst — für hohe Fahrzeuge relevant.`,
    );
  if (p.oeffnungszeiten) teile.push(`Öffnungszeiten: ${p.oeffnungszeiten}.`);
  return teile.length ? teile.join(" ") : null;
};

const ausstattung = (p: Parkplatz): string | null => {
  const ja: string[] = [];
  if (p.wc) ja.push("eine Toilette");
  if (p.beleuchtet) ja.push("Beleuchtung");
  if (p.barrierefrei) ja.push("barrierefreie Stellplätze");
  if (p.wohnmobil) ja.push("Platz für Wohnmobile");
  if (!ja.length) return null;
  const liste =
    ja.length === 1 ? ja[0] : `${ja.slice(0, -1).join(", ")} und ${ja.at(-1)}`;
  return `Erfasst sind außerdem ${liste}.`;
};

const hoehe = (p: Parkplatz): string | null =>
  p.hoehe_m != null ? `Der Parkplatz liegt auf ${p.hoehe_m} m über dem Meeresspiegel.` : null;

const betreiber = (p: Parkplatz): string | null =>
  p.betreiber ? `Betreiber ist laut Eintrag ${p.betreiber}.` : null;

/**
 * Der wichtigste Absatz: Wanderparkplätze werden gesucht, um von dort zu
 * starten. Fernwanderwege werden namentlich genannt, örtliche Rundwege nur
 * gezählt — sonst kippt der Satz in eine Aufzählung.
 */
function wege(trails: TrailAmPlatz[], seed: number): string | null {
  if (!trails.length) return null;

  const fern = trails.filter((t) => t.netz === "iwn" || t.netz === "nwn");
  const regional = trails.filter((t) => t.netz === "rwn");
  const oertlich = trails.filter((t) => !t.netz || t.netz === "lwn");

  const nenne = (liste: TrailAmPlatz[], max: number) => {
    const namen = liste.slice(0, max).map((t) => t.name);
    if (namen.length === 1) return `der ${namen[0]}`;
    return `${namen.slice(0, -1).map((n) => `der ${n}`).join(", ")} und der ${namen.at(-1)}`;
  };

  const teile: string[] = [];
  const zahl = trails.length;
  teile.push(
    waehle(
      [
        `Am Parkplatz führen ${zahl === 1 ? "ein markierter Wanderweg" : `${zahl} markierte Wanderwege`} vorbei.`,
        `${zahl === 1 ? "Ein markierter Wanderweg berührt" : `${zahl} markierte Wanderwege berühren`} den Parkplatz.`,
        `Der Platz liegt an ${zahl === 1 ? "einem markierten Wanderweg" : `${zahl} markierten Wanderwegen`}.`,
      ],
      seed,
    ),
  );

  if (fern.length)
    teile.push(
      `Darunter ${fern.length === 1 ? "ist" : "sind"} ${nenne(fern, 3)} — ${
        fern.length === 1 ? "ein Fernwanderweg" : "Fernwanderwege"
      }, hier lässt sich also auch eine Etappe beginnen.`,
    );
  else if (regional.length) teile.push(`Namentlich ausgewiesen ist ${nenne(regional, 2)}.`);

  if (oertlich.length && (fern.length || regional.length))
    teile.push(
      `Dazu ${oertlich.length === 1 ? "kommt ein örtlicher Rundweg" : `kommen ${oertlich.length} örtliche Rundwege`}.`,
    );

  const mitMarkierung = trails.find((t) => t.markierung);
  if (mitMarkierung)
    teile.push(`Der ${mitMarkierung.name} trägt als Markierung ${mitMarkierung.markierung}.`);

  return teile.join(" ");
}

/** Absätze für die Detailseite. Leere Bausteine fallen weg. */
export function beschreibung(p: Parkplatz, trails: TrailAmPlatz[] = []): string[] {
  const seed = Math.abs(p.id);
  const absatz1 = [lage(p, seed), region(p), hoehe(p)].filter(Boolean).join(" ");
  const absatz2 = [
    kapazitaet(p, seed + 1),
    gebuehren(p, seed + 2),
    untergrund(p, seed + 3),
  ]
    .filter(Boolean)
    .join(" ");
  const absatz3 = [zufahrt(p), ausstattung(p), betreiber(p)].filter(Boolean).join(" ");
  const absatzWege = wege(trails, seed + 4);
  return [absatz1, absatzWege, absatz2, absatz3].filter(
    (a): a is string => Boolean(a && a.length),
  );
}

/** Meta-Description: greift die belastbarsten Merkmale heraus. */
export function metaBeschreibung(p: Parkplatz, trailAnzahl = 0): string {
  const teile = [
    trailAnzahl
      ? `${trailAnzahl} ${trailAnzahl === 1 ? "Wanderweg" : "Wanderwege"}`
      : null,
    p.ort_name ? `bei ${p.ort_name}` : null,
    p.kreis_name,
    p.stellplaetze ? `${p.stellplaetze} Stellplätze` : null,
    p.gebuehr === false ? "kostenfrei" : p.gebuehr === true ? "gebührenpflichtig" : null,
    p.oberflaeche ? `Untergrund ${p.oberflaeche}` : null,
  ].filter(Boolean);
  return kurz(`${p.name} ${teile.join(", ")}. Anfahrt, Koordinaten und Parkplätze in der Nähe.`);
}
