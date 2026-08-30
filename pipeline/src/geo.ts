export type Pt = [number, number]; // [lon, lat]
export type Ring = Pt[];
export type Poly = Ring[]; // [outer, ...holes]

const R = 6371.0088; // mittlerer Erdradius in km
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: Pt, b: Pt): number {
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(a[0] - b[0]) * -1;
  const la1 = rad(a[1]);
  const la2 = rad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Kompassrichtung von a nach b als deutsches Adverb ("nordöstlich").
 *
 * Bewusst als fertige Adverbform: aus "Nordosten" lässt sich "nordöstlich"
 * nicht durch Endungstausch bilden — der Umlaut kommt hinzu.
 */
export function bearingLabel(a: Pt, b: Pt): string {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x =
    Math.cos(rad(a[1])) * Math.sin(rad(b[1])) -
    Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  const dirs = [
    "nördlich", "nordöstlich", "östlich", "südöstlich",
    "südlich", "südwestlich", "westlich", "nordwestlich",
  ];
  return dirs[Math.round(((deg + 360) % 360) / 45) % 8];
}

function inRing(p: Pt, ring: Ring): boolean {
  // Ray-Casting nach Jordan
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export interface Bbox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function bboxOf(polys: Poly[]): Bbox {
  const b: Bbox = { minX: 180, minY: 90, maxX: -180, maxY: -90 };
  for (const poly of polys)
    for (const [x, y] of poly[0]) {
      if (x < b.minX) b.minX = x;
      if (y < b.minY) b.minY = y;
      if (x > b.maxX) b.maxX = x;
      if (y > b.maxY) b.maxY = y;
    }
  return b;
}

/** Fläche mit vorberechneter Bounding-Box — bbox-Vortest spart ~99 % der Ring-Tests. */
export interface Area<T> {
  props: T;
  polys: Poly[];
  bbox: Bbox;
}

export function makeArea<T>(props: T, polys: Poly[]): Area<T> {
  return { props, polys, bbox: bboxOf(polys) };
}

export function locate<T>(p: Pt, areas: Area<T>[]): T | null {
  for (const a of areas) {
    if (p[0] < a.bbox.minX || p[0] > a.bbox.maxX || p[1] < a.bbox.minY || p[1] > a.bbox.maxY) continue;
    for (const poly of a.polys) {
      if (!inRing(p, poly[0])) continue;
      let inHole = false;
      for (let h = 1; h < poly.length; h++) if (inRing(p, poly[h])) { inHole = true; break; }
      if (!inHole) return a.props;
    }
  }
  return null;
}

/** GeoJSON-Geometrie → Liste von Polygonen. */
export function geomToPolys(g: { type: string; coordinates: unknown }): Poly[] {
  if (g.type === "Polygon") return [g.coordinates as Poly];
  if (g.type === "MultiPolygon") return g.coordinates as Poly[];
  return [];
}

/**
 * Gleichmaschiges Gitter für Nachbarschaftssuchen. Zellgröße in Grad;
 * 0.1° ≈ 11 km in Nord-Süd-Richtung, für Ortssuche in Deutschland passend.
 */
export class Grid<T extends { pt: Pt }> {
  private cells = new Map<string, T[]>();
  private cell: number;

  constructor(cell = 0.1) {
    this.cell = cell;
  }

  private key(x: number, y: number) {
    return `${Math.floor(x / this.cell)}:${Math.floor(y / this.cell)}`;
  }

  add(item: T) {
    const k = this.key(item.pt[0], item.pt[1]);
    const arr = this.cells.get(k);
    if (arr) arr.push(item);
    else this.cells.set(k, [item]);
  }

  /** Alle Objekte im Umkreis radiusKm, aufsteigend nach Distanz. */
  within(p: Pt, radiusKm: number): { item: T; km: number }[] {
    const degLat = radiusKm / 111.32;
    const degLon = radiusKm / (111.32 * Math.max(Math.cos(rad(p[1])), 0.01));
    const out: { item: T; km: number }[] = [];
    const cx0 = Math.floor((p[0] - degLon) / this.cell);
    const cx1 = Math.floor((p[0] + degLon) / this.cell);
    const cy0 = Math.floor((p[1] - degLat) / this.cell);
    const cy1 = Math.floor((p[1] + degLat) / this.cell);
    for (let cx = cx0; cx <= cx1; cx++)
      for (let cy = cy0; cy <= cy1; cy++)
        for (const item of this.cells.get(`${cx}:${cy}`) ?? []) {
          const km = haversineKm(p, item.pt);
          if (km <= radiusKm) out.push({ item, km });
        }
    return out.sort((a, b) => a.km - b.km);
  }

  /** Nächstes Objekt; sucht den Radius stufenweise auf maxKm hoch. */
  nearest(p: Pt, maxKm = 40): { item: T; km: number } | null {
    for (const r of [2, 5, 12, 25, maxKm]) {
      if (r > maxKm) break;
      const hit = this.within(p, r)[0];
      if (hit) return hit;
    }
    return null;
  }
}

const UMLAUT: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", é: "e", è: "e", ê: "e", á: "a", à: "a", â: "a", ô: "o", û: "u", ç: "c", ñ: "n" };

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüßéèêáàâôûçñ]/g, (c) => UMLAUT[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Normalform für die Volltextsuche: kleingeschrieben, Umlaute aufgelöst,
 * Satzzeichen zu Leerzeichen. "Wanderparkplatz Große Höhe" → "wanderparkplatz
 * grosse hoehe" — damit findet "grosse hohe" den Eintrag ebenso.
 */
export function suchform(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüßéèêáàâôûçñ]/g, (c) => UMLAUT[c] ?? c)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Kürzester Abstand eines Punktes zu einer Strecke, in km.
 *
 * Lokale äquirektanguläre Projektion: über die paar hundert Meter, um die es
 * hier geht, ist der Fehler vernachlässigbar. Knotenabstand allein genügt
 * nicht — ein Weg kann dicht am Parkplatz vorbeiführen, während seine
 * Stützpunkte hundert Meter entfernt liegen.
 */
export function distanzZuStrecke(p: Pt, a: Pt, b: Pt): number {
  const kx = 111.32 * Math.cos(rad(p[1]));
  const ky = 111.32;
  const ax = (a[0] - p[0]) * kx, ay = (a[1] - p[1]) * ky;
  const bx = (b[0] - p[0]) * kx, by = (b[1] - p[1]) * ky;
  const dx = bx - ax, dy = by - ay;
  const laenge2 = dx * dx + dy * dy;
  if (laenge2 === 0) return Math.hypot(ax, ay);
  let t = -(ax * dx + ay * dy) / laenge2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

/** Kürzester Abstand eines Punktes zu einem Linienzug, in km. */
export function distanzZuLinie(p: Pt, linie: Pt[]): number {
  if (linie.length === 0) return Infinity;
  if (linie.length === 1) return haversineKm(p, linie[0]);
  let min = Infinity;
  for (let i = 1; i < linie.length; i++) {
    const d = distanzZuStrecke(p, linie[i - 1], linie[i]);
    if (d < min) min = d;
  }
  return min;
}
