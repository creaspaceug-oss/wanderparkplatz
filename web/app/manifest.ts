import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} – Wanderparkplatz in meiner Nähe`,
    short_name: "Wanderparkplatz",
    description:
      "Wanderparkplätze in ganz Deutschland: Wanderwege ab dem Platz, Stellplätze, Gebühren und Anfahrt.",
    start_url: "/",
    display: "standalone",
    lang: "de",
    background_color: "#fbfaf7",
    theme_color: "#2f6b3f",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
