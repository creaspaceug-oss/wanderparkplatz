import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Bewusst ohne Emoji: die Emoji-Schrift müsste zur Bauzeit nachgeladen werden. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2f6b3f",
          color: "#ffffff",
          fontSize: 42,
          fontWeight: 700,
          borderRadius: 14,
        }}
      >
        P
      </div>
    ),
    size,
  );
}
