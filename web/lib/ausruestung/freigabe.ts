/**
 * Zeitgesteuerte Veröffentlichung der Ausrüstungsseiten.
 *
 * Eine Seite kann fertig im Code liegen und trotzdem erst zu einem festen
 * Zeitpunkt erscheinen. Bis dahin liefert sie 404, und alle Verweise darauf —
 * Startseite, Übersicht, Querverweise, Sitemap — bleiben ausgeblendet.
 *
 * Freigegeben wird von selbst: Ein täglicher Vercel-Cron um 07:15 UTC
 * (09:15 Uhr Sommerzeit) ruft /api/freigabe auf. Die Route erzeugt Seite,
 * Übersicht, Startseite und Sitemap neu und meldet die Seite bei IndexNow.
 * Fällt der Cron aus, erscheint alles trotzdem mit der nächsten
 * Revalidierung — Seite und Übersicht binnen einer Stunde, Startseite und
 * Sitemap binnen eines Tages. Freigabezeiten also auf 09:00 Uhr legen.
 */
export const FREIGABE: Record<string, string> = {
  "/ausruestung/wasserfilter": "2026-09-23T09:00:00+02:00",
  "/ausruestung/regenhose": "2026-09-25T09:00:00+02:00",
  "/ausruestung/wandersocken": "2026-09-26T09:00:00+02:00",
  "/ausruestung/schuhe-impraegnieren": "2026-09-28T09:00:00+02:00",
  "/ausruestung/regenjacke": "2026-09-30T09:00:00+02:00",
};

export function sichtbar(pfad: string, jetzt = Date.now()): boolean {
  const ab = FREIGABE[pfad];
  return !ab || jetzt >= new Date(ab).getTime();
}
