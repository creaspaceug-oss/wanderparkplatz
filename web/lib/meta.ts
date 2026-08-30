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

export const titel = (text: string) => kuerze(text, 60);
export const beschreibung = (text: string) => kuerze(text, 158);
