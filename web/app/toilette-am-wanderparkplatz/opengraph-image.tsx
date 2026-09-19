import { ImageResponse } from "next/og";
import { wcGesamt, wcNachGroesse } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Toiletten am Wanderparkplatz — Anteil nach Größe des Platzes";

/**
 * Eigenes Vorschaubild für die Auswertung.
 *
 * Bis hierher zeigte jede geteilte Adresse dasselbe allgemeine Bild der Seite.
 * Bei einem Beitrag, der von einer Zahl lebt, ist das die größte verschenkte
 * Wirkung: Wer den Link in einem Forum sieht, soll die Zahl schon im Bild
 * lesen, nicht erst nach dem Klick.
 *
 * Gezeigt wird die Größenstaffel und nicht der Gesamtanteil. Der Gesamtanteil
 * ist die schwächere Zahl — sie hängt an der Vollständigkeit der Kartierung.
 * Die Staffel ist der belastbare Befund und zugleich der überraschendere.
 *
 * Satori verlangt bei jedem Element mit mehr als einem Kind ein explizites
 * display und kennt kein <br/>; daher je Zeile ein eigener Container.
 */
export default async function OgBild() {
  const [g, groesse] = await Promise.all([wcGesamt(), wcNachGroesse()]);
  const hoechster = Math.max(...groesse.map((r) => Number(r.prozent)));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fbfaf7",
          padding: "56px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#1c1917" }}>
            wanderparkplatz.info
          </div>
          <div style={{ display: "flex", marginLeft: 18, fontSize: 24, color: "#8b8f95" }}>
            Datenauswertung
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 34, fontSize: 58, fontWeight: 700, color: "#1c1917" }}>
          Die Toilette folgt dem Andrang,
        </div>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 700, color: "#1c1917" }}>
          nicht dem Wanderweg
        </div>

        <div style={{ display: "flex", marginTop: 20, fontSize: 27, color: "#5c6067" }}>
          Anteil der Wanderparkplätze mit Toilette in 500 m, nach Stellplätzen
        </div>

        {/* Säulen: feste Grundlinie, Höhe anteilig zum größten Wert. */}
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 34, height: 210 }}>
          {groesse.map((r) => {
            const p = Number(r.prozent);
            return (
              <div
                key={r.klasse}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 196,
                }}
              >
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#1c1917" }}>
                  {r.prozent.replace(".", ",")} %
                </div>
                <div
                  style={{
                    display: "flex",
                    width: 128,
                    height: Math.round((p / hoechster) * 150) + 4,
                    marginTop: 8,
                    background: "#2f6b3f",
                  }}
                />
                <div style={{ display: "flex", marginTop: 10, fontSize: 21, color: "#6b7280" }}>
                  {r.klasse}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", marginTop: 26, fontSize: 24, color: "#6b7280" }}>
          {`${g.plaetze.toLocaleString("de-DE")} Ausgangspunkte aus OpenStreetMap · ${g.ohne_alles.toLocaleString("de-DE")} haben weder Toilette noch Gaststätte`}
        </div>
      </div>
    ),
    size,
  );
}
