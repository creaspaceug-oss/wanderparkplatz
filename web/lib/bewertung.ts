import { createHash } from "node:crypto";
import { q, one } from "./db";

/**
 * Freigabemodus. Voreinstellung ist Vormoderation: unmoderierte Texte gehen
 * sonst unmittelbar öffentlich, was bei einem Verzeichnis ohne Anmeldung ein
 * reales Missbrauchsrisiko ist.
 */
export const FREIGABE = process.env.BEWERTUNG_FREIGABE === "sofort" ? "frei" : "neu";

const SALT = process.env.BEWERTUNG_SALT ?? "";

/**
 * Absender-Kennung: gesalzener Hash aus IP und User-Agent. Die IP selbst wird
 * nirgends gespeichert; ohne Salt aus der Umgebung wäre der Hash einer IP
 * rückrechenbar, deshalb ist ein gesetztes Salt Pflicht.
 */
export function absenderHash(headers: Headers): string | null {
  if (!SALT) return null;
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unbekannt";
  const ua = headers.get("user-agent") ?? "";
  return createHash("sha256").update(`${SALT}|${ip}|${ua}`).digest("hex").slice(0, 32);
}

export interface Eingabe {
  slug: string;
  sterne: number;
  text?: string;
  autor?: string;
  besucht_am?: string;
  webseite?: string; // Honigtopf — muss leer bleiben
}

export type Pruefung = { ok: true; wert: Required<Pick<Eingabe, "sterne">> & {
  text: string | null; autor: string | null; besucht_am: string | null;
} } | { ok: false; fehler: string };

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|de|ru|xyz|shop|info)\b)/i;

export function pruefe(e: Eingabe): Pruefung {
  if (e.webseite) return { ok: false, fehler: "Ungültige Eingabe." };

  const sterne = Number(e.sterne);
  if (!Number.isInteger(sterne) || sterne < 1 || sterne > 5)
    return { ok: false, fehler: "Bitte 1 bis 5 Sterne vergeben." };

  const text = (e.text ?? "").trim();
  if (text.length > 1500) return { ok: false, fehler: "Der Text ist zu lang (max. 1500 Zeichen)." };
  if (text && text.length < 15)
    return { ok: false, fehler: "Bitte schreibe mindestens 15 Zeichen — oder lass das Feld leer." };
  if (LINK.test(text)) return { ok: false, fehler: "Links sind in Bewertungen nicht erlaubt." };

  const autor = (e.autor ?? "").trim();
  if (autor.length > 60) return { ok: false, fehler: "Der Name ist zu lang." };
  if (LINK.test(autor)) return { ok: false, fehler: "Links sind im Namen nicht erlaubt." };

  let besucht: string | null = null;
  if (e.besucht_am) {
    const d = new Date(e.besucht_am);
    const heute = new Date();
    const vorZehnJahren = new Date(heute.getFullYear() - 10, 0, 1);
    if (Number.isNaN(d.getTime()) || d > heute || d < vorZehnJahren)
      return { ok: false, fehler: "Das Besuchsdatum liegt außerhalb des gültigen Bereichs." };
    besucht = d.toISOString().slice(0, 10);
  }

  return {
    ok: true,
    wert: { sterne, text: text || null, autor: autor || null, besucht_am: besucht },
  };
}

/** Ratenbegrenzung über die Datenbank — kein zusätzlicher Dienst nötig. */
export async function darfSchreiben(hash: string, parkplatzId: number) {
  const [{ pro_stunde, pro_platz }] = await q<{ pro_stunde: number; pro_platz: number }>(
    `SELECT count(*) FILTER (WHERE erstellt > now() - interval '1 hour')::int AS pro_stunde,
            count(*) FILTER (WHERE parkplatz_id = $2)::int                    AS pro_platz
       FROM bewertung WHERE absender_hash = $1`,
    [hash, parkplatzId],
  );
  if (pro_platz > 0)
    return { ok: false as const, fehler: "Für diesen Parkplatz liegt bereits eine Bewertung von dir vor." };
  if (pro_stunde >= 3)
    return { ok: false as const, fehler: "Zu viele Bewertungen in kurzer Zeit. Bitte später erneut versuchen." };
  return { ok: true as const };
}

export interface Bewertung {
  id: number;
  sterne: number;
  text: string | null;
  autor: string | null;
  besucht_am: string | null;
  erstellt: string;
}

export const bewertungenFuer = (parkplatzId: number, limit = 20) =>
  q<Bewertung>(
    `SELECT id, sterne, text, autor, besucht_am, erstellt
       FROM bewertung
      WHERE parkplatz_id = $1 AND status = 'frei'
      ORDER BY erstellt DESC LIMIT $2`,
    [parkplatzId, limit],
  );

export const platzIdFuerSlug = (slug: string) =>
  one<{ id: number }>("SELECT id FROM parkplatz WHERE slug = $1 AND aktiv", [slug]);

export async function speichere(
  parkplatzId: number,
  wert: { sterne: number; text: string | null; autor: string | null; besucht_am: string | null },
  hash: string,
) {
  await q(
    `INSERT INTO bewertung (parkplatz_id, sterne, text, autor, besucht_am, status, absender_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [parkplatzId, wert.sterne, wert.text, wert.autor, wert.besucht_am, FREIGABE, hash],
  );
}
