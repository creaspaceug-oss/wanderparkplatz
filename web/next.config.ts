import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    // Bilder liegen auf den Wikimedia-Servern; Next lädt sie einmal, rechnet
    // sie um und liefert sie danach aus dem eigenen Zwischenspeicher aus —
    // das schont die Wikimedia-Infrastruktur und ist für Besucher schneller.
    // Commons liefert Vorschaubilder über thumb.wikimedia.org, Originale in
    // Zielgröße dagegen über upload.wikimedia.org — beide kommen im Bestand vor.
    remotePatterns: [
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000, // 30 Tage
  },

  async headers() {
    return [
      {
        source: "/:pfad*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // geolocation=(self) ist Pflicht — sonst blockiert die Richtlinie die
          // Standortsuche, also genau die Kernfunktion der Startseite.
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
