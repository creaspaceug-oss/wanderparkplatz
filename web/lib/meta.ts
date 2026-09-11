/**
 * Google zeigt Titel bis rund 60 Zeichen und Beschreibungen bis rund 160.
 * Beides wird hier am Wortende gekürzt statt mitten im Wort.
 */
const kuerze = (text: string, max: number): string => {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const schnitt = s.slice(0, max - 1);
  const luecke = schnitt.lastIndexOf(" ");
  return `${(luecke > max * 0.6 ? schnitt.slice(0, luecke) : schnitt).replace(/[,;:–—-]$/, "")}…`;
};

const TITEL_MAX = 60;

export const titel = (text: string) => kuerze(text, TITEL_MAX);
export const beschreibung = (text: string) => kuerze(text, 158);

/**
 * Wählt aus mehreren Titelfassungen die erste, die ins Budget passt.
 *
 * Sinnvoll überall dort, wo der Titel neben dem Namen eine Unterscheidung
 * trägt — etwa den Kreis bei Namensdubletten. Ohne die Staffelung würde bei
 * langen Namen das Ende abgeschnitten, und ausgerechnet die Unterscheidung
 * fiele weg. Passt keine Fassung, wird die kürzeste gekürzt.
 */
export const titelVariante = (...fassungen: string[]) =>
  titel(fassungen.find((f) => f.replace(/\s+/g, " ").trim().length <= TITEL_MAX) ?? fassungen[fassungen.length - 1]);
