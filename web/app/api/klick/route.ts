import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Nimmt die Meldung entgegen, dass jemand einen Partnerverweis geklickt hat.
 *
 * Gespeichert wird, was die Entscheidung trägt: Seite, Abschnitt, Produkt.
 * Nicht gespeichert wird, wer geklickt hat — keine IP, keine Kennung, kein
 * Cookie. Die Meldung kommt per sendBeacon und blockiert den Seitenwechsel
 * nicht; geht sie verloren, fehlt ein Klick in der Statistik und sonst nichts.
 *
 * Offen zugänglich wie jede Zählung dieser Art. Gegen versehentliche Fluten
 * schützen die Formatprüfungen und die Begrenzung auf eigene Pfade; wer die
 * Zahlen mutwillig verfälschen will, kann es — er gewinnt damit nichts.
 */
const ASIN = /^[A-Z0-9]{10}$/;
const PLAETZE = new Set(["uebersicht", "berater", "vergleich", "modelle", "groesse", "leiste", "entscheidung", "sonstiges"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const pfad = String(body.pfad ?? "");
  if (!pfad.startsWith("/") || pfad.length > 200) return new NextResponse(null, { status: 400 });

  const asin = String(body.asin ?? "");
  const platz = String(body.platz ?? "");

  await q(
    "INSERT INTO partnerklick (pfad, asin, platz) VALUES ($1, $2, $3)",
    [pfad, ASIN.test(asin) ? asin : null, PLAETZE.has(platz) ? platz : "sonstiges"],
  );

  // 204: Der Browser verwirft die Antwort ohnehin, der Nutzer ist längst
  // unterwegs zu Amazon.
  return new NextResponse(null, { status: 204 });
}
