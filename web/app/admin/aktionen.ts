"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { anmelden, abmelden, angemeldet, gesperrt } from "@/lib/admin";
import { setzeStatus } from "@/lib/verwaltung";

/**
 * Die Aktionen des Verwaltungsbereichs.
 *
 * Jede prüft die Anmeldung selbst. Eine Serveraktion ist ein eigener
 * Einstiegspunkt: Wer ihre Adresse kennt, kann sie aufrufen, ohne je die
 * Seite gesehen zu haben — die Prüfung in der Seite schützt sie nicht.
 */

/** Grobe Kennung für die Bremse bei Fehlversuchen. */
async function kennung(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unbekannt";
}

export async function anmeldenAktion(_: string | null, formular: FormData): Promise<string | null> {
  const wartezeit = gesperrt(await kennung());
  if (wartezeit) return `Zu viele Versuche. Bitte ${wartezeit} Sekunden warten.`;

  const ok = await anmelden(String(formular.get("passwort") ?? ""), await kennung());
  if (!ok) return "Passwort stimmt nicht.";

  revalidatePath("/admin");
  return null;
}

export async function abmeldenAktion() {
  await abmelden();
  revalidatePath("/admin");
}

export async function moderiereAktion(formular: FormData) {
  if (!(await angemeldet())) return;

  const status = formular.get("status") === "frei" ? "frei" : "abgelehnt";
  const ids = formular
    .getAll("id")
    .map((x) => Number(x))
    .filter(Number.isInteger);

  const slugs = await setzeStatus(ids, status);

  // Die Parkplatzseiten tragen die Bewertungen; ohne diesen Anstoß zeigten
  // sie die Freigabe erst mit ihrer nächsten Revalidierung — bis zu sieben Tage.
  for (const slug of slugs) revalidatePath(`/wanderparkplatz/${slug}`);
  revalidatePath("/admin");
}
