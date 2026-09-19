"use client";

import ReactDOM from "react-dom";

/**
 * Verbindung zu Amazons Bildserver vorab aufbauen und die Bilder der ersten
 * Übersichtszeilen vorladen.
 *
 * Ohne das beginnt der Browser erst mit dem Bildserver zu reden, wenn er beim
 * Aufbauen des Layouts auf das erste Bild stößt — auf dem Handy eine spürbare
 * Lücke zwischen Text und Bild. Laut Next.js-Dokumentation dieser Version der
 * vorgesehene Weg: ReactDOM-Methoden aus einer Client-Komponente, sie landen
 * im <head>.
 */
export default function Vorladen({ bilder }: { bilder: string[] }) {
  ReactDOM.preconnect("https://m.media-amazon.com");
  for (const b of bilder) ReactDOM.preload(b, { as: "image", fetchPriority: "high" });
  return null;
}
