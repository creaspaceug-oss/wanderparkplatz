/**
 * Kartenausschnitt um einen Punkt, über die offizielle Einbettung von
 * OpenStreetMap.
 *
 * Bewusst keine Kartenbibliothek: Leaflet oder MapLibre kosten JavaScript im
 * Browser und brauchen einen Kachelanbieter, also einen Vertrag und ein
 * Budget. Die Einbettung ist ein iframe, lädt verzögert und trägt ihre
 * Namensnennung selbst — auf einer Seite, die ohnehin von OpenStreetMap lebt,
 * ist das die ehrlichste Lösung.
 *
 * Der Ausschnitt entsteht aus einem Rahmen um den Punkt. Ein Grad Länge ist
 * je nach Breitengrad unterschiedlich lang, deshalb der Kosinus — ohne ihn
 * wäre der Ausschnitt in Norddeutschland spürbar verzerrt.
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
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <iframe
          src={einbettung}
          title={`Lage: ${titel}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[320px] w-full border-0"
        />
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
