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
