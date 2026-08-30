import { NextResponse } from "next/server";
import { umkreis } from "@/lib/db";

// Standortabhängig — nie statisch vorrendern.
export const dynamic = "force-dynamic";

const DE = { latMin: 47.0, latMax: 55.2, lonMin: 5.7, lonMax: 15.2 };

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const lat = Number(p.get("lat"));
  const lon = Number(p.get("lon"));
  const radius = Math.min(Math.max(Number(p.get("r")) || 25, 1), 100);
  const limit = Math.min(Math.max(Number(p.get("limit")) || 24, 1), 50);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ fehler: "lat und lon erforderlich" }, { status: 400 });
  }
  if (lat < DE.latMin || lat > DE.latMax || lon < DE.lonMin || lon > DE.lonMax) {
    return NextResponse.json(
      { treffer: [], hinweis: "Das Verzeichnis deckt derzeit nur Deutschland ab." },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  }

  const treffer = await umkreis(lat, lon, radius, limit);
  return NextResponse.json(
    {
      radius_km: radius,
      treffer: treffer.map((t) => ({
        slug: t.slug,
        name: t.name,
        km: Math.round(t.km * 10) / 10,
        lat: t.lat,
        lon: t.lon,
        ort: t.ort_name,
        kreis: t.kreis_name,
        stellplaetze: t.stellplaetze,
        gebuehr: t.gebuehr,
        oberflaeche: t.oberflaeche,
      })),
    },
    // Koordinaten sind grob genug für Zwischenspeicher, aber nicht personenbezogen cachebar
    { headers: { "Cache-Control": "private, max-age=120" } },
  );
}
