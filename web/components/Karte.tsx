"use client";

import { useState } from "react";

/**
 * Kartenausschnitt um einen Punkt, über die offizielle Einbettung von
 * OpenStreetMap — geladen erst auf Klick.
 *
 * Zwei Gründe gegen das sofortige Einbinden, und der zweite wiegt schwerer:
 *
 * Das JavaScript der Einbettung ist 1,37 MB unkomprimiert, je Aufruf gehen
 * rund 360 kB über die Leitung. Die Seite selbst wiegt 14 kB. `loading="lazy"`
 * half nicht, weil das Fenster im sichtbaren Bereich liegt — auf dem Handy
 * sogar weit oben.
 *
 * Vor allem aber überträgt jeder Aufruf die IP-Adresse der Besucher an einen
 * Dritten, bevor irgendjemand eine Karte angefordert hat. Auf Klick geladen
 * entscheidet das jede Person selbst, und der Hinweis darauf steht daneben.
 *
 * Bewusst keine Kartenbibliothek: Leaflet oder MapLibre kosten ebenfalls
 * JavaScript und brauchen zusätzlich einen Kachelanbieter, also einen Vertrag
 * und ein Budget.
 */
export default function Karte({
  lat,
  lon,
  titel,
  hoeheKm = 1.2,
}: {
  lat: number;
  lon: number;
  titel: string;
  hoeheKm?: number;
}) {
  const [geladen, setGeladen] = useState(false);

  // Ein Grad Länge ist je nach Breitengrad unterschiedlich lang, daher der
  // Kosinus — ohne ihn wäre der Ausschnitt in Norddeutschland verzerrt.
  const dLat = hoeheKm / 111.32 / 2;
  const dLon = dLat / Math.cos((lat * Math.PI) / 180);
  const rahmen = [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
    .map((v) => v.toFixed(5))
    .join(",");

  const einbettung =
    `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(rahmen)}` +
    `&layer=mapnik&marker=${lat.toFixed(5)},${lon.toFixed(5)}`;
  const gross = `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lon.toFixed(5)}#map=15/${lat.toFixed(4)}/${lon.toFixed(4)}`;

  return (
    <figure className="mt-4">
      {/* Gleiche Höhe in beiden Zuständen, damit beim Laden nichts springt. */}
      <div className="h-[340px] overflow-hidden rounded-xl border border-line bg-card">
        {geladen ? (
          <iframe
            src={einbettung}
            title={`Lage: ${titel}`}
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
            <p className="text-sm text-muted">
              Die Karte kommt von OpenStreetMap. Beim Laden wird deine
              IP-Adresse dorthin übertragen.
            </p>
            <button
              type="button"
              onClick={() => setGeladen(true)}
              className="rounded-lg border border-accent bg-accent-soft px-4 py-2 text-sm font-medium hover:border-foreground"
            >
              Karte laden
            </button>
            {/* Ohne JavaScript bleibt der Weg nach draußen offen. */}
            <a
              href={gross}
              rel="noopener nofollow"
              target="_blank"
              className="text-sm text-muted underline hover:text-accent"
            >
              Stattdessen bei OpenStreetMap ansehen
            </a>
          </div>
        )}
      </div>
      <figcaption className="mt-1.5 text-xs text-muted">
        Karte:{" "}
        <a href={gross} rel="noopener nofollow" target="_blank" className="underline hover:text-accent">
          OpenStreetMap
        </a>{" "}
        — der Marker zeigt die erfasste Position, nicht zwingend die Einfahrt.
      </figcaption>
    </figure>
  );
}
