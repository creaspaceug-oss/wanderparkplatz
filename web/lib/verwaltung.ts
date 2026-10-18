import { q } from "./db";

/**
 * Abfragen für den Verwaltungsbereich.
 *
 * Dieselben Anweisungen wie im Kommandozeilenwerkzeug
 * (pipeline/src/moderieren.ts und klicks.ts) — nur eben für den Browser.
 * Beide Wege bleiben nutzbar: Der eine braucht einen Rechner mit
 * Datenbankzugang, der andere ein Passwort.
 */

export interface OffeneBewertung {
  id: number;
  sterne: number;
  text: string | null;
  autor: string | null;
  besucht_am: string | null;
  erstellt: string;
  name: string;
  slug: string;
}

export const offeneBewertungen = () =>
  q<OffeneBewertung>(
    `SELECT b.id, b.sterne, b.text, b.autor, b.besucht_am, b.erstellt, p.name, p.slug
       FROM bewertung b JOIN parkplatz p ON p.id = b.parkplatz_id
      WHERE b.status = 'neu'
      ORDER BY b.erstellt`,
  );

export const bewertungsZahlen = () =>
  q<{ status: string; n: number }>(
    "SELECT status, count(*)::int AS n FROM bewertung GROUP BY status ORDER BY status",
  );

/** Setzt den Status und liefert die betroffenen Parkplatz-Slugs zurück. */
export async function setzeStatus(ids: number[], status: "frei" | "abgelehnt"): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await q<{ slug: string }>(
    `UPDATE bewertung b SET status = $1, geprueft = now()
       FROM parkplatz p
      WHERE p.id = b.parkplatz_id AND b.id = ANY($2) AND b.status = 'neu'
      RETURNING p.slug`,
    [status, ids],
  );
  return [...new Set(rows.map((r) => r.slug))];
}

export const klicksNachSeite = (tage: number) =>
  q<{ pfad: string; klicks: number }>(
    `SELECT pfad, count(*)::int AS klicks FROM partnerklick
      WHERE zeit >= now() - ($1 || ' days')::interval
      GROUP BY pfad ORDER BY klicks DESC LIMIT 25`,
    [tage],
  );

export const klicksNachAbschnitt = (tage: number) =>
  q<{ platz: string; klicks: number }>(
    `SELECT platz, count(*)::int AS klicks FROM partnerklick
      WHERE zeit >= now() - ($1 || ' days')::interval
      GROUP BY platz ORDER BY klicks DESC`,
    [tage],
  );

export const klicksNachProdukt = (tage: number) =>
  q<{ asin: string; klicks: number }>(
    `SELECT asin, count(*)::int AS klicks FROM partnerklick
      WHERE zeit >= now() - ($1 || ' days')::interval AND asin IS NOT NULL
      GROUP BY asin ORDER BY klicks DESC LIMIT 20`,
    [tage],
  );

/** Wann lief der Import zuletzt, und wie alt sind die Daten? */
export const letzterImport = () =>
  q<{ gelaufen: string; parkplaetze: number }>(
    "SELECT gelaufen, parkplaetze FROM import_lauf ORDER BY gelaufen DESC LIMIT 5",
  );
