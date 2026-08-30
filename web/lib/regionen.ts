/**
 * Kreisnamen sauber ins Deutsche einbetten. Viele Kreise tragen die Gattung
 * schon im Namen ("Ortenaukreis", "Rhein-Sieg-Kreis", "Region Hannover") —
 * ein vorangestelltes "Landkreis" ergäbe "der Landkreis Ortenaukreis".
 * Zusätzlich weicht das Genus ab: "die Region Hannover", aber "der Kreis".
 */
const TRAEGT_GATTUNG = /(kreis|region|verband)$|^(region|städteregion|regionalverband)\b/i;
const FEMININ = /^(region|städteregion)\b/i;

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
