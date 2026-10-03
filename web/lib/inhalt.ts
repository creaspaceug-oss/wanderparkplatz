/**
 * Ab wie vielen konkreten Aussagen eine Detailseite in den Index gehört.
 *
 * Eine Seite mit zwei Angaben ist für Suchmaschinen austauschbar und zieht
 * die Bewertung der ganzen Domain nach unten. Sie bleibt erreichbar und
 * verlinkt — nur eben nicht indexiert, bis sie Substanz hat. Nach der
 * Anreicherung mit Wanderwegen und Umfeld betrifft das noch 223 von 4.539
 * Seiten; der Median liegt bei elf Aussagen.
 */
export const MIN_AUSSAGEN = 3;

export const istIndexierbar = (aussagen: number) => aussagen >= MIN_AUSSAGEN;

/**
 * Dasselbe Maß für Wegeseiten: Länge, Markierung, Netzstufe, Kürzel und ein
 * zweiter Parkplatz sind die Angaben, die eine Wegeseite von einer bloßen
 * Namensnennung unterscheiden. Ein Weg mit nur einem Parkplatz und sonst
 * nichts bleibt erreichbar, aber außerhalb des Index.
 */
export const wegAussagen = (t: {
  laenge_km: string | null;
  markierung: string | null;
  netz: string | null;
  ref: string | null;
  parkplatz_count: number;
}) =>
  (t.laenge_km ? 1 : 0) +
  (t.markierung ? 1 : 0) +
  (t.netz ? 1 : 0) +
  (t.ref ? 1 : 0) +
  (t.parkplatz_count >= 2 ? 1 : 0);
