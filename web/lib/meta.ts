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
/**
 * Kürzt in der Mitte statt am Ende, wortweise.
 *
 * Bei Wanderwegen steht die Unterscheidung am Ende des Namens, nicht am
 * Anfang: "Hugenotten- und Waldenserpfad, Etappe Hondingen - Öfingen" und
 * "… Etappe Schwenningen - Rottweil" trennen sich erst im letzten Drittel.
 * Eine Kürzung am Ende schnitt genau das weg und ließ 89 Seiten mit
 * identischem Titel zurück; mit ausgelassener Mitte sind es 36.
 *
 * Gefüllt wird wortweise und abwechselnd von vorn und von hinten, damit
 * kein Wort mitten durchtrennt wird. Reicht es nicht für beide Enden,
 * bleibt es bei der gewöhnlichen Kürzung.
 */
export function kuerzeMitte(text: string, max: number): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;

  const w = s.split(" ");
  const kopf: string[] = [];
  const schwanz: string[] = [];
  let i = 0;
  let j = w.length - 1;
  let laenge = 3; // Platz für " … "

  while (i <= j) {
    const vorne = w[i].length + (kopf.length ? 1 : 0);
    const hinten = w[j].length + (schwanz.length ? 1 : 0);
    if (kopf.join(" ").length <= schwanz.join(" ").length) {
      if (laenge + vorne > max) break;
      laenge += vorne;
      kopf.push(w[i++]);
    } else {
      if (laenge + hinten > max) break;
      laenge += hinten;
      schwanz.unshift(w[j--]);
    }
  }
  if (!kopf.length || !schwanz.length) return kuerze(s, max);

  return `${kopf.join(" ").replace(/[ ,;:–—-]+$/, "")} … ${schwanz
    .join(" ")
    .replace(/^[ ,;:–—-]+/, "")}`;
}

export const titelVariante = (...fassungen: string[]) =>
  titel(fassungen.find((f) => f.replace(/\s+/g, " ").trim().length <= TITEL_MAX) ?? fassungen[fassungen.length - 1]);
