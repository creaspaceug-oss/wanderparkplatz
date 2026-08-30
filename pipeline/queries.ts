export const BUNDESLAENDER = [
  ["DE-BW", "Baden-Württemberg"], ["DE-BY", "Bayern"], ["DE-BE", "Berlin"],
  ["DE-BB", "Brandenburg"], ["DE-HB", "Bremen"], ["DE-HH", "Hamburg"],
  ["DE-HE", "Hessen"], ["DE-MV", "Mecklenburg-Vorpommern"], ["DE-NI", "Niedersachsen"],
  ["DE-NW", "Nordrhein-Westfalen"], ["DE-RP", "Rheinland-Pfalz"], ["DE-SL", "Saarland"],
  ["DE-SN", "Sachsen"], ["DE-ST", "Sachsen-Anhalt"], ["DE-SH", "Schleswig-Holstein"],
  ["DE-TH", "Thüringen"],
] as const;

/** Bounding-Box Deutschland (Süd, West, Nord, Ost) — Overpass-Reihenfolge. */
export const DE_BBOX = { s: 47.2, w: 5.8, n: 55.1, e: 15.1 };

/**
 * Kacheln statt Bundesland-Areas: Area-Auflösung plus Namens-Regex läuft in
 * großen Ländern (Bayern) auf allen Mirrors in Timeouts. Bbox-Abfragen sind
 * die schnellste Zugriffsart in Overpass; die Gebietszuordnung passiert
 * ohnehin lokal per Point-in-Polygon.
 */
export interface Tile { id: string; s: number; w: number; n: number; e: number }

export function tiles(stepLon = 1.2, stepLat = 1.0): Tile[] {
  const out: Tile[] = [];
  for (let lon = DE_BBOX.w; lon < DE_BBOX.e; lon += stepLon)
    for (let lat = DE_BBOX.s; lat < DE_BBOX.n; lat += stepLat) {
      // Auf eine Nachkommastelle runden: sonst schleppt die Schleife
      // Fließkommarauschen in Kachel-IDs und Abfragen.
      const r = (v: number) => Math.round(v * 10) / 10;
      out.push({
        id: `${r(lat).toFixed(1)}_${r(lon).toFixed(1)}`,
        s: r(lat), w: r(lon),
        n: r(Math.min(lat + stepLat, DE_BBOX.n)),
        e: r(Math.min(lon + stepLon, DE_BBOX.e)),
      });
    }
  return out;
}

/**
 * Kachel vierteln. Dicht bebaute Regionen (Stuttgart, Ruhrgebiet) sprengen das
 * 300-Sekunden-Limit von Overpass; kleinere Ausschnitte laufen dann durch.
 */
export function viertel(t: Tile): Tile[] {
  const r = (v: number) => Math.round(v * 1000) / 1000;
  const mLat = r((t.s + t.n) / 2);
  const mLon = r((t.w + t.e) / 2);
  return [
    { id: `${t.id}a`, s: t.s, w: t.w, n: mLat, e: mLon },
    { id: `${t.id}b`, s: t.s, w: mLon, n: mLat, e: t.e },
    { id: `${t.id}c`, s: mLat, w: t.w, n: t.n, e: mLon },
    { id: `${t.id}d`, s: mLat, w: mLon, n: t.n, e: t.e },
  ];
}

const bbox = (t: Tile) => `${t.s},${t.w},${t.n},${t.e}`;

/** Kernbestand: explizit ausgewiesene Wanderparkplätze. */
export const poisQuery = (t: Tile) => `[out:json][timeout:300][bbox:${bbox(t)}];
(
  nwr["amenity"="parking"]["name"~"Wanderparkplatz|Wandererparkplatz|Wanderer-Parkplatz|Wander-Parkplatz|Wanderparkpl",i];
  nwr["amenity"="parking"]["hiking"="yes"];
  nwr["amenity"="parking"]["description"~"Wanderparkplatz",i];
);
out center tags;`;

/** Der Parkplatz-Teil, in mehreren Abfragen wiederverwendet. */
const POI_SET = `(
  nwr["amenity"="parking"]["name"~"Wanderparkplatz|Wandererparkplatz|Wanderer-Parkplatz|Wander-Parkplatz|Wanderparkpl",i];
  nwr["amenity"="parking"]["hiking"="yes"];
)->.pois;`;

/**
 * Wanderwege, die an einem Parkplatz vorbeiführen.
 *
 * Die Zuordnung Parkplatz↔Weg entsteht lokal: Overpass liefert die Geometrie
 * der nahen Wege und die Mitgliederlisten der Routen, den Abstand rechnet der
 * Build-Schritt aus. Ein `way(r.routen)` würde stattdessen die Mitglieder
 * aller Routen materialisieren — bei Fernwanderwegen zehntausende Wege.
 */
export const trailsQuery = (t: Tile) => `[out:json][timeout:400][bbox:${bbox(t)}];
${POI_SET}
way(around.pois:150)["highway"]->.nahe;
rel(bw.nahe)["route"="hiking"]->.routen;
way.nahe(r.routen)->.tw;
.tw out geom;
.routen out body;`;

/**
 * Postleitzahlgebiete als Suchziele. Nur ein Viertel der Ortsknoten trägt eine
 * PLZ, für eine verlässliche PLZ-Suche reicht das nicht. Die Grenzrelationen
 * decken dagegen die Fläche vollständig ab; der Schwerpunkt genügt als Anker.
 */
export const plzQuery = (t: Tile) => `[out:json][timeout:300][bbox:${bbox(t)}];
nwr["boundary"="postal_code"]["postal_code"];
out center tags;`;

/** Orte für "X km von <Ort>" und die Ortsseiten. */
export const placesQuery = (t: Tile) => `[out:json][timeout:300][bbox:${bbox(t)}];
node["place"~"^(city|town|village)$"]["name"];
out;`;
