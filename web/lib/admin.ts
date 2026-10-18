import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Zugang zum Verwaltungsbereich.
 *
 * Ein einziges Passwort aus der Umgebung, kein Benutzerkonto: Es gibt genau
 * eine Person, die hier etwas zu tun hat. Fehlt ADMIN_PASSWORT, bleibt der
 * Bereich geschlossen — lieber kein Zugang als einer ohne Schloss.
 *
 * Im Keks steht nicht das Passwort, sondern ein Ablaufzeitpunkt mit
 * Signatur. Damit lässt sich die Sitzung prüfen, ohne das Geheimnis an den
 * Browser zu geben, und sie läuft von selbst ab. Verglichen wird in
 * konstanter Zeit; ein Vergleich mit === verriete über die Laufzeit, wie
 * viele Zeichen stimmen.
 */
const KEKS = "wpp_verwaltung";
const DAUER_MS = 12 * 60 * 60 * 1000;

const passwort = () => process.env.ADMIN_PASSWORT ?? "";

export const zugangEingerichtet = () => passwort().length > 0;

const signiere = (wert: string) => createHmac("sha256", passwort()).update(wert).digest("hex");

/** Vergleich in konstanter Zeit, auch bei verschiedener Länge. */
function gleich(a: string, b: string): boolean {
  const x = Buffer.from(createHmac("sha256", "vergleich").update(a).digest("hex"));
  const y = Buffer.from(createHmac("sha256", "vergleich").update(b).digest("hex"));
  return timingSafeEqual(x, y);
}

/**
 * Fehlversuche je Prozess bremsen.
 *
 * Kein echter Schutz gegen verteilte Versuche — dafür bräuchte es einen
 * gemeinsamen Speicher, und auf Vercel läuft jede Funktion für sich. Gegen
 * das naheliegende Durchprobieren von einer Stelle aus reicht es, und mehr
 * behauptet es nicht.
 */
const versuche = new Map<string, { n: number; bis: number }>();
const SPERRE_MS = 60_000;
const MAX_VERSUCHE = 5;

export function gesperrt(kennung: string): number {
  const e = versuche.get(kennung);
  if (!e || Date.now() > e.bis) return 0;
  return e.n >= MAX_VERSUCHE ? Math.ceil((e.bis - Date.now()) / 1000) : 0;
}

function merkeFehlversuch(kennung: string) {
  const e = versuche.get(kennung);
  const jetzt = Date.now();
  if (!e || jetzt > e.bis) versuche.set(kennung, { n: 1, bis: jetzt + SPERRE_MS });
  else versuche.set(kennung, { n: e.n + 1, bis: e.bis });
}

export async function anmelden(eingabe: string, kennung: string): Promise<boolean> {
  if (!zugangEingerichtet()) return false;
  if (gesperrt(kennung)) return false;

  if (!gleich(eingabe, passwort())) {
    merkeFehlversuch(kennung);
    return false;
  }

  versuche.delete(kennung);
  const ablauf = String(Date.now() + DAUER_MS);
  const keks = await cookies();
  keks.set(KEKS, `${ablauf}.${signiere(ablauf)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // Nur auf dem Verwaltungspfad: Auf allen anderen Seiten hat der Keks
    // nichts zu suchen und würde bloß mitgeschickt.
    path: "/admin",
    maxAge: DAUER_MS / 1000,
  });
  return true;
}

export async function abmelden() {
  (await cookies()).delete({ name: KEKS, path: "/admin" });
}

export async function angemeldet(): Promise<boolean> {
  if (!zugangEingerichtet()) return false;
  const wert = (await cookies()).get(KEKS)?.value;
  if (!wert) return false;

  const [ablauf, signatur] = wert.split(".");
  if (!ablauf || !signatur) return false;
  if (Number(ablauf) < Date.now()) return false;
  return gleich(signatur, signiere(ablauf));
}
