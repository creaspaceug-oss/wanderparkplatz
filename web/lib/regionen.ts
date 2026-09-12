/**
 * Kreisnamen sauber ins Deutsche einbetten. Viele Kreise tragen die Gattung
 * schon im Namen ("Ortenaukreis", "Rhein-Sieg-Kreis", "Region Hannover") —
 * ein vorangestelltes "Landkreis" ergäbe "der Landkreis Ortenaukreis".
 * Zusätzlich weicht das Genus ab: "die Region Hannover", aber "der Kreis".
 */
const TRAEGT_GATTUNG = /(kreis|region|verband)$|^(region|städteregion|regionalverband)\b/i;
const FEMININ = /^(region|städteregion)\b/i;

/**
 * Bundesland im Dativ mit Präposition: "in Bayern", aber "im Saarland".
 *
 * Von den sechzehn Ländern trägt allein das Saarland einen Artikel. Eine
 * Liste statt einer Regel ist hier das Ehrlichere: Die Menge ist
 * abgeschlossen und ändert sich nicht.
 */
const LAND_MIT_ARTIKEL: Record<string, string> = { Saarland: "im" };

export const landDativ = (name: string) => `${LAND_MIT_ARTIKEL[name] ?? "in"} ${name}`;

/** Dasselbe am Satzanfang: "Im Saarland sind …", "In Bayern sind …". */
export const landDativGross = (name: string) => {
  const d = landDativ(name);
  return d[0].toUpperCase() + d.slice(1);
};

export function kreisTitel(name: string, typ: string | null): string {
  if (typ === "Kreisfreie Stadt") return name;
  return TRAEGT_GATTUNG.test(name) ? name : `Landkreis ${name}`;
}

/** Dativ mit Präposition: "im Ortenaukreis", "in der Region Hannover". */
export function kreisDativ(name: string, typ: string | null): string {
  if (typ === "Kreisfreie Stadt") return `im Stadtgebiet von ${name}`;
  const titel = kreisTitel(name, typ);
  return FEMININ.test(titel) ? `in der ${titel}` : `im ${titel}`;
}

/** Nominativ mit Artikel: "Der Ortenaukreis", "Die Region Hannover". */
export function kreisNominativ(name: string, typ: string | null): string {
  if (typ === "Kreisfreie Stadt") return `Die kreisfreie Stadt ${name}`;
  const titel = kreisTitel(name, typ);
  return FEMININ.test(titel) ? `Die ${titel}` : `Der ${titel}`;
}
