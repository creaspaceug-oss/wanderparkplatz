import { ImageResponse } from "next/og";
import { oepnvGesamt } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Anteil der Wanderparkplätze mit Haltestelle in Laufweite";

/**
 * Eigenes Vorschaubild für die Auswertung — siehe die Begründung beim
 * Gegenstück unter /toilette-am-wanderparkplatz.
 *
 * Hier trägt der Gesamtanteil das Bild: Haltestellen sind in OpenStreetMap
 * systematisch erfasst, die 70,9 % sind belastbar. Die Einschränkung, die auf
 * der Seite breit ausgeführt wird, steht als Zeile darunter — ein Bild ohne
 * sie würde eine Aussage über Fahrpläne suggerieren, die die Daten nicht
 * hergeben.
 */
export default async function OgBild() {
  const g = await oepnvGesamt();
  const anteil = Number(g.prozent);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fbfaf7",
          padding: "58px 72px",
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

        <div style={{ display: "flex", alignItems: "center", marginTop: 44 }}>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 700, color: "#2f6b3f" }}>
            {String(g.prozent).replace(".", ",")} %
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 40 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#1c1917" }}>
              der Wanderparkplätze haben
            </div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#1c1917" }}>
              eine Haltestelle vor der Tür
            </div>
          </div>
        </div>

        {/* Ein Balken sagt mehr als die Zahl allein: 70,9 von 100. */}
        <div style={{ display: "flex", marginTop: 40, height: 26, background: "#e0ddd5" }}>
          <div style={{ display: "flex", width: `${anteil}%`, background: "#2f6b3f" }} />
        </div>

        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#1c1917" }}>
          {`${g.mit.toLocaleString("de-DE")} von ${g.plaetze.toLocaleString("de-DE")} Ausgangspunkten, im Mittel ${g.median.toLocaleString("de-DE")} m entfernt`}
        </div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 25, color: "#6b7280" }}>
          Eine Haltestelle ist noch kein Bus — Fahrpläne sind nicht enthalten.
        </div>
      </div>
    ),
    size,
  );
}
