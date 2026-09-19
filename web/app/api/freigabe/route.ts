import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FREIGABE } from "@/lib/ausruestung/freigabe";

export const dynamic = "force-dynamic";

/**
 * Macht frisch freigegebene Ausrüstungsseiten sofort sichtbar und meldet sie.
 *
 * Aufgerufen einmal täglich vom Vercel-Cron (vercel.json), kurz nach der
 * üblichen Freigabezeit 09:00 Uhr. Ohne diesen Lauf erschiene eine Seite
 * trotzdem — aber erst mit der nächsten Revalidierung, Startseite und Sitemap
 * bis zu einen Tag später, und niemand meldete sie bei IndexNow.
 *
 * Berücksichtigt wird, was in den letzten 26 Stunden freigegeben wurde: Der
 * Cron läuft täglich, die zwei Stunden Spielraum fangen Verzögerungen und die
 * Zeitumstellung ab. Eine doppelte Meldung an IndexNow schadet nicht.
 */

const FENSTER_MS = 26 * 60 * 60 * 1000;

/** Siehe pipeline/src/indexnow.ts — der Schlüssel ist öffentlich. */
const HOST = "www.wanderparkplatz.info";
const SCHLUESSEL = "9c9bce2cb89234b6169cb09bb03d4432";

export async function GET(request: Request) {
  // Mit CRON_SECRET schickt Vercel es als Bearer-Token mit; ohne bleibt der
  // Aufruf dem Cron vorbehalten. Mehr als Seiten neu erzeugen und einmal
  // melden kann ein fremder Aufruf ohnehin nicht.
  const geheim = process.env.CRON_SECRET;
  const erlaubt = geheim
    ? request.headers.get("authorization") === `Bearer ${geheim}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron");
  if (!erlaubt) return NextResponse.json({ fehler: "nicht erlaubt" }, { status: 401 });

  const jetzt = Date.now();
  const neu = Object.entries(FREIGABE)
    .filter(([, ab]) => {
      const t = new Date(ab).getTime();
      return t <= jetzt && jetzt - t < FENSTER_MS;
    })
    .map(([pfad]) => pfad);

  if (neu.length === 0) return NextResponse.json({ neu });

  // "layout" erfasst die Übersicht und alle Ausrüstungsseiten samt ihrer
  // Querverweise auf die neue Seite.
  revalidatePath("/ausruestung", "layout");
  revalidatePath("/");
  revalidatePath("/sitemaps/[typ]", "page");

  const urlList = [...neu, "/ausruestung", "/"].map((p) => `https://${HOST}${p}`);
  let indexnow: number | string;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: SCHLUESSEL,
        keyLocation: `https://${HOST}/${SCHLUESSEL}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    indexnow = res.status;
  } catch (e) {
    indexnow = String(e);
  }

  return NextResponse.json({ neu, indexnow });
}
