import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Wanderparkplatz-Verzeichnis für Deutschland";

/**
 * Satori verlangt bei jedem Element mit mehr als einem Kind ein explizites
 * display; Zeilenumbrüche über <br/> unterstützt es nicht — daher je Zeile
 * ein eigener Container.
 */
export default function OgBild() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#fbfaf7",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#2f6b3f",
              color: "#ffffff",
              fontSize: 46,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div style={{ display: "flex", marginLeft: 20, fontSize: 32, color: "#6b7280" }}>
            wanderparkplatz.info
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 46, fontSize: 78, fontWeight: 700, color: "#1c1917" }}>
          Wanderparkplatz
        </div>
        <div style={{ display: "flex", fontSize: 78, fontWeight: 700, color: "#1c1917" }}>
          in meiner Nähe
        </div>

        <div style={{ display: "flex", marginTop: 30, fontSize: 33, color: "#6b7280" }}>
          Ausgangspunkte in ganz Deutschland
        </div>
        <div style={{ display: "flex", fontSize: 33, color: "#6b7280" }}>
          mit Wanderwegen, Stellplätzen und Gebühren
        </div>

        <div style={{ display: "flex", marginTop: 40, height: 8, width: 220, background: "#2f6b3f" }} />
      </div>
    ),
    size,
  );
}
