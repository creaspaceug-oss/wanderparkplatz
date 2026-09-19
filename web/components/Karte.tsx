/**
 * Kartenausschnitt um einen Punkt, über die offizielle Einbettung von
 * OpenStreetMap.
 *
 * Hier stand einmal eine Klickschranke. Zwei Gründe sprachen dafür, und beide
 * gelten weiter — sie sind gegen die Einfachheit abgewogen worden und haben
 * verloren:
 *
 * Erstens der Umfang: Das JavaScript der Einbettung ist unkomprimiert 1,37 MB,
 * je Aufruf gehen rund 360 kB über die Leitung, die Seite selbst wiegt 14 kB.
 * `loading="lazy"` mildert das nur, wo die Karte unterhalb des sichtbaren
 * Bereichs liegt; auf dem Handy steht sie weiter oben.
 *
 * Zweitens der Datenschutz: Jeder Aufruf überträgt die IP-Adresse der
 * Besucher an einen Dritten. Rechtsgrundlage dafür ist das berechtigte
 * Interesse (Art. 6 Abs. 1 lit. f DSGVO) — für ein Parkplatzverzeichnis ist
 * die Lage auf der Karte kein Beiwerk, sondern der Gegenstand. Das steht so
 * auch in der Datenschutzerklärung; wer diese Komponente ändert, muss dort
 * nachziehen.
 *
 * Abgeschwächt wird beides, so weit es geht: `loading="lazy"` nimmt mit, was
 * unterhalb des Bildschirms liegt, und `referrerPolicy="no-referrer"` sorgt
 * dafür, dass OpenStreetMap wenigstens nicht erfährt, welche Seite jemand
 * gerade liest.
 *
 * Keine Kartenbibliothek: Leaflet oder MapLibre kosten ebenfalls JavaScript
 * und brauchen zusätzlich einen Kachelanbieter, also einen Vertrag und ein
 * Budget. Ohne Zustand braucht die Komponente auch kein "use client" mehr —
 * das ist der Teil des Umfangs, den wir zurückbekommen.
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
      {/* Feste Höhe, damit beim Laden nichts springt. */}
      <div className="h-[340px] overflow-hidden rounded-xl border border-line bg-card">
        <iframe
          src={einbettung}
          title={`Lage: ${titel}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="block h-full w-full border-0"
        />
      </div>
      <figcaption className="mt-1.5 text-xs text-muted">
        Karte:{" "}
        <a href={gross} rel="noopener nofollow" target="_blank" className="underline hover:text-accent">
          OpenStreetMap
        </a>{" "}
        — der Marker zeigt die erfasste Position, nicht zwingend die Einfahrt. Beim Laden
        der Karte wird deine IP-Adresse an OpenStreetMap übertragen.
      </figcaption>
    </figure>
  );
}
