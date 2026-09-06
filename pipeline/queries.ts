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
 * Der Einstieg über Knoten statt über Wege ist der entscheidende Punkt:
 * `way(around.pois:150)` gemessen 4:28 je Kachel, `node(around.pois:150)`
 * mit anschließender Rückwärtssuche 1:37 — bei gleichem Ergebnis. Die
 * Umkreissuche über Knoten ist die billigste Zugriffsart in Overpass.
 *
 * Ausgegeben werden nur die Knoten, die zu einem Wanderweg gehören und im
 * Umkreis liegen. Das genügt für die Zuordnung und spart gegenüber der
 * Ausgabe aller Knoten ein Vielfaches an Datenmenge.
 */
export const trailsQuery = (t: Tile) => `[out:json][timeout:400][bbox:${bbox(t)}];
${POI_SET}
node(around.pois:150)->.nn;
way(bn.nn)["highway"]->.nw;
rel(bw.nw)["route"="hiking"]->.routen;
way.nw(r.routen)->.tw;
node.nn(w.tw)->.tn;
.tw out;
.tn out skel;
.routen out body;`;

/**
 * Postleitzahlgebiete als Suchziele. Nur ein Viertel der Ortsknoten trägt eine
 * PLZ, für eine verlässliche PLZ-Suche reicht das nicht. Die Grenzrelationen
 * decken dagegen die Fläche vollständig ab; der Schwerpunkt genügt als Anker.
 */
export const plzQuery = (t: Tile) => `[out:json][timeout:300][bbox:${bbox(t)}];
nwr["boundary"="postal_code"]["postal_code"];
out center tags;`;

/**
 * Was rund um den Parkplatz liegt: Einkehr, Haltestelle, WC, Aussichtspunkt,
 * Infotafel, Schutzhütte.
 *
 * Wie bei den Wanderwegen entsteht die Zuordnung lokal — Overpass grenzt nur
 * auf das Umfeld der Parkplätze ein, die Abstände rechnet der Build-Schritt.
 * Die Ergebnismenge ist klein, deshalb genügt hier `out center`.
 */
export const umfeldQuery = (t: Tile) => `[out:json][timeout:300][bbox:${bbox(t)}];
${POI_SET}
(
  nwr(around.pois:1500)["amenity"~"^(restaurant|cafe|biergarten|pub)$"]["name"];
  nwr(around.pois:1500)["amenity"="toilets"];
  nwr(around.pois:1500)["amenity"="shelter"];
  nwr(around.pois:1500)["tourism"~"^(viewpoint|wilderness_hut|alpine_hut)$"];
  nwr(around.pois:1500)["tourism"="information"]["information"~"^(map|board|guidepost)$"];
  node(around.pois:1500)["highway"="bus_stop"];
  nwr(around.pois:1500)["railway"~"^(station|halt|tram_stop)$"];
);
out center tags;`;

/**
 * Wanderziele: Gipfel, Burgen, Wasserfälle, Höhlen, Aussichtstürme.
 *
 * Anders als beim Umfeld flächendeckend statt im Umkreis der Parkplätze —
 * diese Objekte sind dünn gesät, und ein Ziel liegt oft mehrere Kilometer vom
 * Ausgangspunkt entfernt. Die Zuordnung entsteht wieder lokal.
 */
export const zieleQuery = (t: Tile) => `[out:json][timeout:300][bbox:${bbox(t)}];
(
  nwr["natural"="peak"]["name"];
  nwr["natural"="waterfall"]["name"];
  nwr["natural"="cave_entrance"]["name"];
  nwr["historic"~"^(castle|ruins)$"]["name"];
  nwr["man_made"="tower"]["tower:type"="observation"]["name"];
  nwr["tourism"="viewpoint"]["name"];
);
out center tags;`;

/** Orte für "X km von <Ort>" und die Ortsseiten. */
export const placesQuery = (t: Tile) => `[out:json][timeout:300][bbox:${bbox(t)}];
node["place"~"^(city|town|village)$"]["name"];
out;`;
