import { FREIGABE } from "./ausruestung/freigabe";

/**
 * Wann eine redaktionelle Seite erschienen ist und wann sie zuletzt
 * inhaltlich geändert wurde.
 *
 * Bis hierher trug jede Ausrüstungsseite im Markup ein dateModified mit der
 * Renderzeit — bei stündlicher Revalidierung also ein Datum, das sich
 * stündlich bewegte, ohne dass sich ein Wort geändert hätte. Für eine
 * Suchmaschine ist das entweder wertlos oder ein Täuschungsversuch; beides
 * wollen wir nicht.
 *
 * Deshalb steht das Datum hier von Hand. Beim nächsten echten Eingriff an
 * einer Seite mitziehen — nicht, wenn sich nur Amazon-Preise oder -Bilder
 * ändern. Zeitgesteuerte Seiten erben ihr Erscheinungsdatum aus FREIGABE:
 * Vorher gab es für Suchmaschinen nichts zu sehen.
 *
 * Dieselben Daten speisen das lastmod der Sitemap (siehe lib/sitemap.ts).
 */
export const STAND: Record<string, string> = {
  "/ueber-uns": "2026-09-19T08:51:07+02:00",
  "/toilette-am-wanderparkplatz": "2026-09-19T09:00:23+02:00",
  "/wandern-ohne-auto": "2026-09-19T09:07:57+02:00",
  "/ausruestung": "2026-10-03T12:00:00+02:00",
  "/ausruestung/wanderstoecke": "2026-09-19T18:11:37+02:00",
  "/ausruestung/wanderrucksack": "2026-09-19T18:11:37+02:00",
  "/ausruestung/huettenschlafsack": "2026-09-19T18:11:37+02:00",
  "/ausruestung/erste-hilfe-set": "2026-09-19T18:28:41+02:00",
  "/ausruestung/stirnlampe": "2026-09-19T18:28:41+02:00",
  "/ausruestung/gamaschen": "2026-09-19T18:40:28+02:00",
  "/ausruestung/groedel": "2026-09-19T18:40:28+02:00",
  "/ausruestung/trinkblase": "2026-09-19T18:57:52+02:00",
  "/ausruestung/wasserfilter": "2026-09-19T18:57:52+02:00",
  "/ausruestung/wandersocken": "2026-09-19T19:38:32+02:00",
  "/ausruestung/schuhe-impraegnieren": "2026-09-19T19:56:03+02:00",
  "/ausruestung/regenhose": "2026-09-19T21:05:48+02:00",
  "/ausruestung/regenjacke": "2026-09-19T21:46:45+02:00",
  "/ausruestung/wanderschuhe": "2026-10-03T08:09:40+02:00",
  "/ausruestung/huettentour": "2026-10-03T08:21:09+02:00",
  "/ausruestung/winterwandern": "2026-10-03T08:21:09+02:00",
};

/**
 * Erscheinungs- und Änderungsdatum für das Markup einer Seite.
 *
 * Erschienen ist eine zeitgesteuerte Seite zum Freigabezeitpunkt, alles
 * andere zu seinem Stand. Geändert wurde sie zum späteren der beiden Daten:
 * Wird eine Seite nach der Freigabe überarbeitet, rückt nur dieses Datum vor.
 */
export function stand(pfad: string): { veroeffentlicht?: string; geaendert?: string } {
  const frei = FREIGABE[pfad];
  const bearbeitet = STAND[pfad];
  if (!frei && !bearbeitet) return {};
  const veroeffentlicht = frei ?? bearbeitet;
  const geaendert =
    frei && bearbeitet && new Date(bearbeitet) > new Date(frei) ? bearbeitet : veroeffentlicht;
  return { veroeffentlicht, geaendert };
}
