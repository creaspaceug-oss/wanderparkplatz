import { NextResponse } from "next/server";
import { standorte, type Standort } from "@/lib/db";
import { suchform } from "@/lib/suchform";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const roh = (new URL(request.url).searchParams.get("q") ?? "").trim();
  // Ziffern nicht durch die Normalform schicken — sie sollen Präfixe bleiben
  const q = /^\d+$/.test(roh) ? roh.slice(0, 5) : suchform(roh).slice(0, 60);
  if (q.length < 2) return NextResponse.json({ treffer: [] });

  const treffer = await standorte(q, 8);
  return NextResponse.json(
    {
      treffer: treffer.map((t: Standort) => ({
        name: t.name,
        zusatz: t.zusatz,
        typ: t.typ,
        lat: t.lat,
        lon: t.lon,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
