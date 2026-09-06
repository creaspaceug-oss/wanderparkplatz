/**
 * osmc:symbol → deutschsprachige Beschreibung der Wegmarkierung.
 *
 * Format: wegfarbe:hintergrund[:vordergrund][:text][:textfarbe]
 * Beispiel: "black:black:black_rectangle:A2:white"
 *
 * Wanderer orientieren sich an der Markierung, nicht am Routennamen — deshalb
 * ist das eine der nützlichsten Angaben überhaupt.
 */

const FARBE: Record<string, string> = {
  red: "rot", blue: "blau", green: "grün", yellow: "gelb", black: "schwarz",
  white: "weiß", brown: "braun", orange: "orange", purple: "violett",
  violet: "violett", gray: "grau", grey: "grau",
};

// Genus steuert die Adjektivendung: roter Punkt, rote Raute, rotes Rechteck.
const FORM: Record<string, { wort: string; genus: "m" | "f" | "n" }> = {
  bar: { wort: "Balken", genus: "m" },
  stripe: { wort: "Streifen", genus: "m" },
  cross: { wort: "Kreuz", genus: "n" },
  x: { wort: "Andreaskreuz", genus: "n" },
  dot: { wort: "Punkt", genus: "m" },
  circle: { wort: "Kreis", genus: "m" },
  ring: { wort: "Ring", genus: "m" },
  rectangle: { wort: "Rechteck", genus: "n" },
  square: { wort: "Quadrat", genus: "n" },
  triangle: { wort: "Dreieck", genus: "n" },
  diamond: { wort: "Raute", genus: "f" },
  rhombus: { wort: "Raute", genus: "f" },
  lozenge: { wort: "Raute", genus: "f" },
  arch: { wort: "Bogen", genus: "m" },
  bowl: { wort: "Schale", genus: "f" },
  L: { wort: "L", genus: "n" },
  corner: { wort: "Winkel", genus: "m" },
  slash: { wort: "Schrägstrich", genus: "m" },
  backslash: { wort: "Schrägstrich", genus: "m" },
  hiker: { wort: "Wanderersymbol", genus: "n" },
  arrow: { wort: "Pfeil", genus: "m" },
  right: { wort: "Pfeil", genus: "m" },
  left: { wort: "Pfeil", genus: "m" },
};

const ENDUNG = { m: "er", f: "e", n: "es" } as const;

function beuge(farbe: string, genus: "m" | "f" | "n"): string {
  // "orange" bleibt im Deutschen häufig unflektiert, klingt gebeugt aber richtig
  return farbe + ENDUNG[genus];
}

export function markierung(osmc?: string): string | null {
  if (!osmc) return null;
  const teile = osmc.split(":");
  const vordergrund = teile[2] ?? "";
  const text = (teile[3] ?? "").trim();

  // Vordergrund ist "<farbe>_<form>", teils mehrteilig (z. B. "white_lower_arch")
  const stuecke = vordergrund.split("_").filter(Boolean);
  const farbeEn = stuecke.find((s) => FARBE[s]);
  const formEn = [...stuecke].reverse().find((s) => FORM[s]);

  if (!formEn) {
    // Ohne erkennbare Form bleibt höchstens die Grundfarbe des Schilds
    const grund = FARBE[teile[1]] ?? FARBE[teile[0]];
    if (!grund) return text || null;
    return text ? `${grund}e Markierung mit \u201e${text}\u201c` : `${grund}e Markierung`;
  }

  const form = FORM[formEn];
  const farbe = FARBE[farbeEn ?? ""] ?? FARBE[teile[1]] ?? FARBE[teile[0]];
  const kern = farbe ? `${beuge(farbe, form.genus)} ${form.wort}` : form.wort;
  return text ? `${kern} mit \u201e${text}\u201c` : kern;
}

/** OSM-Netzstufe → deutschsprachige Einordnung. */
export const NETZ: Record<string, string> = {
  iwn: "internationaler Fernwanderweg",
  nwn: "nationaler Fernwanderweg",
  rwn: "regionaler Wanderweg",
  lwn: "örtlicher Wanderweg",
};

/**
 * Netzstufe normalisieren. Das network-Feld enthält in OpenStreetMap neben den
 * vier gültigen Werten allerlei Varianten und gelegentlich Fließtext
 * ("Nationalpark Eifel"). Unbekanntes wird verworfen statt angezeigt — eine
 * falsche Einordnung ist schlechter als gar keine.
 */
const NETZ_VARIANTEN: Record<string, string> = {
  iwn: "iwn", international: "iwn",
  nwn: "nwn", national: "nwn",
  rwn: "rwn", regional: "rwn", rhn: "rwn",
  lwn: "lwn", local: "lwn", lokal: "lwn", lhn: "lwn", lnw: "lwn", lwm: "lwn",
};

export function netzstufe(wert?: string): string | null {
  if (!wert) return null;
  return NETZ_VARIANTEN[wert.trim().toLowerCase()] ?? null;
}
