import { NextResponse } from "next/server";
import { umkreis } from "@/lib/db";

/**
 * Wanderparkplätze rund um den groben Standort aus der IP-Adresse.
 *
 * Vercel hängt jeder Anfrage an, aus welcher Gegend sie kommt. Das reicht
 * nicht für eine Hausnummer, aber für "welche Wanderparkplätze liegen in
 * fünfundzwanzig Kilometern" allemal — und es braucht weder Nachfrage noch
 * Erlaubnis, weil keine Standortabfrage im Browser stattfindet.
 *
 * Bewusst als eigene Route statt im Server-Rendering der Startseite:
 *
 * Erstens bliebe die Startseite sonst nicht mehr einen Tag zwischenge-
 * speichert, sondern müsste bei jedem Aufruf neu gebaut werden. Zweitens,
 * und das wiegt schwerer, käme dabei für Google Unsinn heraus: Der Crawler
 * fragt aus Rechenzentren an, meist in den USA. Ihm serverseitig
 * "Wanderparkplätze in deiner Nähe" zu zeigen hieße, ihm Ergebnisse rund um
 * ein Rechenzentrum vorzusetzen. Der Standort gehört zu dem, was der Browser
 * nachlädt, nicht in die indexierte Seite.
 *
 * Gespeichert wird nichts. Die Koordinaten stehen in den Kopfzeilen der
 * Anfrage und werden nur für diese eine Abfrage verwendet.
 */
export const dynamic = "force-dynamic";

const DE = { latMin: 47.0, latMax: 55.2, lonMin: 5.7, lonMax: 15.2 };

/** Vercel setzt die Kopfzeilen; lokal fehlen sie, dann gibt es eben nichts. */
function ausKopfzeilen(request: Request) {
  const h = request.headers;
  // Fehlende Kopfzeilen nicht über Number() laufen lassen: null würde zu 0,
  // und 0/0 liegt im Atlantik — die Meldung hieße dann "außerhalb
  // Deutschlands" statt "kein Standort dabei".
  const rohLat = h.get("x-vercel-ip-latitude");
  const rohLon = h.get("x-vercel-ip-longitude");
  const lat = rohLat === null ? NaN : Number(rohLat);
  const lon = rohLon === null ? NaN : Number(rohLon);
  const roh = h.get("x-vercel-ip-city");
  // Die Stadt kommt prozentkodiert an, "Sankt%20Wendel" wäre sonst zu lesen.
  let stadt: string | null = null;
  try {
    stadt = roh ? decodeURIComponent(roh) : null;
  } catch {
    stadt = roh;
  }
  return { lat, lon, stadt };
}

export async function GET(request: Request) {
  const { lat, lon, stadt } = ausKopfzeilen(request);
  const p = new URL(request.url).searchParams;
  const radius = Math.min(Math.max(Number(p.get("r")) || 25, 1), 100);
  const limit = Math.min(Math.max(Number(p.get("limit")) || 6, 1), 24);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { verfuegbar: false, grund: "kein Standort in der Anfrage" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (lat < DE.latMin || lat > DE.latMax || lon < DE.lonMin || lon > DE.lonMax) {
    return NextResponse.json(
      { verfuegbar: false, grund: "außerhalb Deutschlands" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const treffer = await umkreis(lat, lon, radius, limit);

  return NextResponse.json(
    {
      verfuegbar: true,
      stadt,
      radius_km: radius,
      treffer: treffer.map((t) => ({
        slug: t.slug,
        name: t.name,
        km: Math.round(t.km * 10) / 10,
        ort: t.ort_name,
        stellplaetze: t.stellplaetze,
        gebuehr: t.gebuehr,
        oberflaeche: t.oberflaeche,
      })),
    },
    // Je Besucher anders — kein gemeinsamer Zwischenspeicher.
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
