/**
 * Zeitgesteuerte Veröffentlichung der Ausrüstungsseiten.
 *
 * Eine Seite kann fertig im Code liegen und trotzdem erst zu einem festen
 * Zeitpunkt erscheinen. Bis dahin liefert sie 404, und alle Verweise darauf —
 * Startseite, Übersicht, Querverweise, Sitemap — bleiben ausgeblendet. Da die
 * Seiten per ISR neu erzeugt werden, erscheint alles spätestens mit der
 * nächsten Revalidierung nach dem Zeitpunkt: die Seite und die Übersicht
 * innerhalb einer Stunde, Startseite und Sitemap innerhalb eines Tages.
 */
export const FREIGABE: Record<string, string> = {
  "/ausruestung/wasserfilter": "2026-09-23T09:00:00+02:00",
  "/ausruestung/wandersocken": "2026-09-26T09:00:00+02:00",
  "/ausruestung/schuhe-impraegnieren": "2026-09-28T09:00:00+02:00",
};

export function sichtbar(pfad: string, jetzt = Date.now()): boolean {
  const ab = FREIGABE[pfad];
  return !ab || jetzt >= new Date(ab).getTime();
}
