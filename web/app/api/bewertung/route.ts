import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  FREIGABE, absenderHash, pruefe, darfSchreiben, speichere, platzIdFuerSlug,
} from "@/lib/bewertung";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const hash = absenderHash(request.headers);
  if (!hash) {
    // Ohne Salt wäre der gespeicherte Hash einer IP rückrechenbar.
    console.error("BEWERTUNG_SALT ist nicht gesetzt — Bewertungen sind deaktiviert.");
    return NextResponse.json(
      { fehler: "Bewertungen sind derzeit nicht verfügbar." },
      { status: 503 },
    );
  }

  const slug = String(body.slug ?? "");
  const platz = await platzIdFuerSlug(slug);
  if (!platz) return NextResponse.json({ fehler: "Parkplatz nicht gefunden." }, { status: 404 });

  const geprueft = pruefe(body as never);
  if (!geprueft.ok) return NextResponse.json({ fehler: geprueft.fehler }, { status: 422 });

  const erlaubt = await darfSchreiben(hash, platz.id);
  if (!erlaubt.ok) return NextResponse.json({ fehler: erlaubt.fehler }, { status: 429 });

  await speichere(platz.id, geprueft.wert, hash);

  if (FREIGABE === "frei") revalidatePath(`/wanderparkplatz/${slug}`);

  return NextResponse.json({
    ok: true,
    status: FREIGABE,
    hinweis:
      FREIGABE === "frei"
        ? "Danke! Deine Bewertung ist veröffentlicht."
        : "Danke! Deine Bewertung wird geprüft und erscheint anschließend.",
  });
}
