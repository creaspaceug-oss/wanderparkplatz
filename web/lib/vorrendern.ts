/**
 * Wie viele Seiten je Typ beim Build vorgerendert werden.
 *
 * Der Rest entsteht bei der ersten Anfrage und wird danach zwischengespeichert
 * (dynamicParams + ISR). Das ist bewusst so: der Build läuft je nach Tarif in
 * einer anderen Weltregion als die Datenbank, und jede Abfrage kostet dann
 * rund 90 ms statt einer. Alles vorzurendern verlängert den Build erheblich,
 * ohne den Seiten selbst zu nützen.
 *
 * Über Umgebungsvariablen anhebbar, sobald Build-Region und Datenbank
 * beieinander liegen.
 */
const zahl = (wert: string | undefined, standard: number) => {
  const n = Number(wert);
  return Number.isFinite(n) && n >= 0 ? n : standard;
};

export const VORRENDERN = {
  parkplatz: zahl(process.env.VORRENDERN_PARKPLAETZE, 300),
  ort: zahl(process.env.VORRENDERN_ORTE, 400),
  kreis: zahl(process.env.VORRENDERN_KREISE, 400),
};
