import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { raw, out, OUT, RAW } from "./paths.ts";

import { normalize, datenScore } from "./normalize.ts";
import { kennung } from "./ident.ts";
import { markierung } from "./markierung.ts";
import {
  type Pt, type Area, makeArea, geomToPolys, locate, bearingLabel, slugify, Grid,
  distanzZuLinie, suchform,
} from "./geo.ts";
import { coordOf, type OsmElement } from "./overpass.ts";

const readJson = async (p: string) => JSON.parse(await readFile(p, "utf8"));

/**
 * Kacheldateien einsammeln statt das Raster nachzurechnen: gescheiterte
 * Kacheln werden beim Abruf geviertelt, ihre Namen stehen nicht im Raster.
 */
async function kachelDateien(prefix: string): Promise<string[]> {
  const alle = await readdir(RAW);
  // Kachel-IDs beginnen mit der Breitengrad-Zahl — so bleiben Altbestände
  // aus früheren Abrufstrategien (z. B. "pois-de-bw.json") außen vor.
  const muster = new RegExp(`^${prefix}-\\d.*\\.json$`);
  return alle.filter((f) => muster.test(f)).sort();
}

/**
 * Namen ohne Unterscheidungswert. In OSM heißen sehr viele Plätze schlicht
 * "Wanderparkplatz" oder "P1" — als Seitentitel und Listeneintrag unbrauchbar.
 */
const GENERISCH = /^(wanderer?[- ]?parkplatz|wander[- ]?parkplatz|parkplatz|pkw[- ]?parkplatz|p\s*\d{0,2}|stellplatz)$/i;
const istGenerisch = (n?: string) => !n || GENERISCH.test(n.trim());


/**
 * GADM-Kreisnamen bereinigen. Zwei Eigenheiten der Quelle stünden sonst in
 * Seitentiteln: kreisfreie Städte tragen ein angehängtes "Städte", und einige
 * Namen liegen in englischer Form vor.
 */
const ENGLISCH: Record<string, string> = {
  Cologne: "Köln",
  Munich: "München",
  Nuremberg: "Nürnberg",
  Hanover: "Hannover",
  Brunswick: "Braunschweig",
};

/**
 * Drei Kreise führt GADM sachlich falsch. Belegt über die Ausdehnung der
 * Polygone: Hannover 73×61 km und Aachen 26×51 km sind die Region bzw. die
 * Städteregion, nicht die Städte; Saarbrücken (31×30 km) ist der
 * Regionalverband und keine kreisfreie Stadt.
 */
const KORREKTUR: Record<string, { name: string; typ: string }> = {
  Hannover: { name: "Region Hannover", typ: "Landkreis" },
  Aachen: { name: "Städteregion Aachen", typ: "Landkreis" },
  Saarbrücken: { name: "Regionalverband Saarbrücken", typ: "Landkreis" },
};

function kreisName(roh: string): string {
  const ohneSuffix = roh.replace(/\s+(Städte|Stadt)$/, "").trim();
  const deutsch = ENGLISCH[ohneSuffix] ?? ohneSuffix;
  return KORREKTUR[deutsch]?.name ?? deutsch;
}

function kreisTyp(rohName: string, stadt: boolean): string {
  const ohneSuffix = rohName.replace(/\s+(Städte|Stadt)$/, "").trim();
  const deutsch = ENGLISCH[ohneSuffix] ?? ohneSuffix;
  return KORREKTUR[deutsch]?.typ ?? (stadt ? "Kreisfreie Stadt" : "Landkreis");
}

// ---------------------------------------------------------------- Grenzen
type BlProps = { iso: string; name: string; slug: string };
type KreisProps = { name: string; typ: string; blName: string; slug: string };

async function loadAreas() {
  const bl: Area<BlProps>[] = (await readJson(raw("bundeslaender.geo.json"))).features.map(
    (f: any) =>
      makeArea<BlProps>(
        { iso: f.properties.id, name: f.properties.name, slug: slugify(f.properties.name) },
        geomToPolys(f.geometry),
      ),
  );

  // GADM führt Kreisname doppelt (Landkreis + kreisfreie Stadt gleichen Namens)
  const kreisNames = new Map<string, number>();
  for (const f of (await readJson(raw("kreise.geo.json"))).features) {
    const n = kreisName(f.properties.NAME_3);
    kreisNames.set(n, (kreisNames.get(n) ?? 0) + 1);
  }
  const kreise: Area<KreisProps>[] = (await readJson(raw("kreise.geo.json"))).features.map(
    (f: any) => {
      const name = kreisName(f.properties.NAME_3);
      const stadt = f.properties.TYPE_3 === "Kreisfreie Städte";
      const typ = kreisTyp(f.properties.NAME_3, stadt);
      const slug =
        (kreisNames.get(name) ?? 0) > 1
          ? slugify(`${name} ${stadt ? "Stadt" : "Landkreis"}`)
          : slugify(name);
      return makeArea<KreisProps>({ name, typ, blName: f.properties.NAME_1, slug }, geomToPolys(f.geometry));
    },
  );
  return { bl, kreise };
}

// ------------------------------------------------------------------ Orte
interface OrtRec {
  pt: Pt; name: string; typ: string; einwohner: number | null;
  slug: string; blIso: string; poi_count: number; id: number;
  kreis_slug?: string; bl_slug?: string;
}

async function loadPlaces(): Promise<Grid<OrtRec>> {
  const grid = new Grid<OrtRec>(0.1);
  const seen = new Map<string, number>();
  const seenOsm = new Set<number>();
  let id = 0;
  let fehlend = 0;
  const ortDateien = await kachelDateien("places");
  if (!ortDateien.length) fehlend++;
  for (const datei of ortDateien) {
    let els: OsmElement[];
    try {
      els = (await readJson(raw(datei))).elements;
    } catch {
      fehlend++;
      continue;
    }
    for (const el of els) {
      // Kacheln überlappen an den Rändern nicht, aber Wiederholungsläufe schon
      if (seenOsm.has(el.id)) continue;
      seenOsm.add(el.id);
      const pt = coordOf(el);
      const name = el.tags?.name;
      if (!pt || !name) continue;
      let slug = slugify(name);
      const n = (seen.get(slug) ?? 0) + 1;
      seen.set(slug, n);
      if (n > 1) slug = `${slug}-${n}`;
      grid.add({
        pt, name, slug, id: ++id, blIso: "", poi_count: 0,
        typ: el.tags?.place ?? "village",
        einwohner: el.tags?.population ? Number(el.tags.population.replace(/\D/g, "")) || null : null,
      });
    }
  }
  if (fehlend) console.warn(`  ! Ortsdaten unvollständig (${fehlend} Kacheln nicht lesbar)`);
  return grid;
}

/**
 * Anzeigenamen eindeutig machen.
 *
 * Ohne diesen Schritt tragen Dutzende Seiten denselben Titel — allein
 * "Wanderparkplatz bei Ahlum" kommt zwölfmal vor. Gleiche Titel bei nahezu
 * gleichem Inhalt sind für Suchmaschinen Dubletten und für Leser wertlos.
 * Deshalb wird stufenweise qualifiziert, bis der Name trägt.
 */
function vergebeNamen(liste: any[]) {
  // Ab 150 m ist eine Richtungsangabe belastbar. Die frühere Schwelle von
  // 800 m schloss alle innerörtlichen Plätze aus — genau die, die sich häufen.
  const richtung = (p: any) =>
    p.ort_richtung && p.ort_km != null && p.ort_km >= 0.15 ? p.ort_richtung : null;

  const stufen: ((p: any) => string | null)[] = [
    // 1 — Grundform
    (p) => p.basisName,
    // 2 — Himmelsrichtung ergänzen
    (p) => {
      const r = richtung(p);
      return r && p.ort_name ? `${p.rumpf} ${r} von ${p.ort_name}` : null;
    },
    // 3 — zusätzlich die Entfernung
    (p) => {
      const r = richtung(p);
      if (!r || !p.ort_name) return null;
      const km = p.ort_km.toLocaleString("de-DE", { maximumFractionDigits: 1 });
      return `${p.rumpf} ${km} km ${r} von ${p.ort_name}`;
    },
    // 4 — Straßenname, sofern erfasst
    (p) => (p.tags?.["addr:street"] ? `${p.basisName} (${p.tags["addr:street"]})` : null),
    // 5 — letzte Instanz: stabile Kennung, damit nichts kollidiert
    (p) => `${p.basisName} (${kennung(p.osm_type, p.osm_id)})`,
  ];

  const belegt = new Map<string, number>();
  for (const p of liste) belegt.set(p.basisName, (belegt.get(p.basisName) ?? 0) + 1);

  const vergeben = new Set<string>();
  for (const p of liste) {
    if ((belegt.get(p.basisName) ?? 0) === 1) {
      p.name = p.basisName;
      vergeben.add(p.name);
      continue;
    }
    let gewaehlt: string | null = null;
    for (const stufe of stufen) {
      const kandidat = stufe(p);
      if (kandidat && !vergeben.has(kandidat)) {
        gewaehlt = kandidat;
        break;
      }
    }
    p.name = gewaehlt ?? `${p.basisName} (${kennung(p.osm_type, p.osm_id)})`;
    vergeben.add(p.name);
  }
}

/**
 * Slugs in zwei Durchgängen: erst zählen, welche Namen mehrfach vorkommen,
 * dann vergeben. Dadurch hängt der Slug nur am Objekt selbst und an der
 * Namensverteilung — nicht daran, in welcher Reihenfolge Kacheln eintrafen.
 */
function vergebeSlugs(liste: any[]) {
  const nachName = new Map<string, number>();
  for (const p of liste) nachName.set(p.name, (nachName.get(p.name) ?? 0) + 1);

  const mitOrt = new Map<string, number>();
  for (const p of liste) {
    if ((nachName.get(p.name) ?? 0) === 1) continue;
    const k = `${p.name}|${p.ort_slug ?? ""}`;
    mitOrt.set(k, (mitOrt.get(k) ?? 0) + 1);
  }

  for (const p of liste) {
    if ((nachName.get(p.name) ?? 0) === 1) {
      p.slug = slugify(p.name);
      continue;
    }
    const k = `${p.name}|${p.ort_slug ?? ""}`;
    if (p.ort_name && (mitOrt.get(k) ?? 0) === 1) {
      p.slug = slugify(`${p.name} ${p.ort_name}`);
      continue;
    }
    p.slug = `${slugify(p.name)}-${kennung(p.osm_type, p.osm_id)}`;
  }

  const gesehen = new Set<string>();
  for (const p of liste) {
    // Letzte Absicherung: identischer Name am selben Ort in derselben Kachel
    if (gesehen.has(p.slug)) p.slug = `${p.slug}-${kennung(p.osm_type, p.osm_id)}`;
    gesehen.add(p.slug);
  }
}

// ------------------------------------------------------- Standortsuche
/**
 * Suchziele für die Standorteingabe: alle Orte (auch ohne Parkplatzbestand)
 * plus die Postleitzahlgebiete. Ohne Bestandsfilter — wer "Husum" eingibt,
 * soll eine Antwort bekommen, selbst wenn dort kein Parkplatz erfasst ist.
 */
async function baueStandorte(
  bl: Area<BlProps>[],
  kreise: Area<KreisProps>[],
): Promise<any[]> {
  const raus: any[] = [];
  const gesehen = new Set<number>();

  const TYP: Record<string, { label: string; gewicht: number }> = {
    city: { label: "Stadt", gewicht: 900_000 },
    town: { label: "Stadt", gewicht: 60_000 },
    village: { label: "Ort", gewicht: 1_500 },
  };

  for (const datei of await kachelDateien("places")) {
    let els: OsmElement[];
    try {
      els = (await readJson(raw(datei))).elements;
    } catch {
      continue;
    }
    for (const el of els) {
      if (gesehen.has(el.id)) continue;
      gesehen.add(el.id);
      const pt = coordOf(el);
      const name = el.tags?.name;
      if (!pt || !name) continue;
      const art = TYP[el.tags?.place ?? "village"] ?? TYP.village;
      const kreis = locate(pt, kreise);
      const land = locate(pt, bl);
      if (!land) continue; // Kacheln greifen über die Grenze
      const einwohner = el.tags?.population
        ? Number(el.tags.population.replace(/\D/g, "")) || null
        : null;
      raus.push({
        typ: "ort",
        name,
        zusatz: [art.label, kreis?.name, land.name].filter(Boolean).join(" · "),
        lat: pt[1],
        lon: pt[0],
        einwohner,
        gewicht: einwohner ?? art.gewicht / 100,
        such_text: suchform(`${name} ${kreis?.name ?? ""} ${land.name}`),
      });
    }
  }

  const plzGesehen = new Set<string>();
  const ortGitter = new Grid<{ pt: Pt; name: string; gewicht: number }>(0.1);
  for (const o of raus) ortGitter.add({ pt: [o.lon, o.lat], name: o.name, gewicht: o.gewicht });

  for (const datei of await kachelDateien("plz")) {
    let els: OsmElement[];
    try {
      els = (await readJson(raw(datei))).elements;
    } catch {
      continue;
    }
    for (const el of els) {
      const plz = el.tags?.postal_code;
      const pt = coordOf(el);
      if (!plz || !pt || plzGesehen.has(plz)) continue;
      if (!locate(pt, bl)) continue;
      plzGesehen.add(plz);
      // Größter Ort im Umkreis benennt das Gebiet
      const nah = ortGitter
        .within(pt, 8)
        .sort((a, b) => b.item.gewicht - a.item.gewicht)[0];
      raus.push({
        typ: "plz",
        name: plz,
        zusatz: nah ? nah.item.name : "Postleitzahl",
        lat: pt[1],
        lon: pt[0],
        einwohner: null,
        // PLZ-Eingaben sind eindeutig gemeint und ranken deshalb oben
        gewicht: 2_000_000,
        such_text: suchform(`${plz} ${nah?.item.name ?? ""}`),
      });
    }
  }

  console.log(`  Standortziele: ${raus.filter((r) => r.typ === "ort").length} Orte, ${plzGesehen.size} Postleitzahlen`);
  return raus;
}

// ----------------------------------------------------------- Wanderwege
/** Höchstabstand, bis zu dem ein Weg noch als "ab diesem Parkplatz" gilt. */
const TRAIL_MAX_M = 200;

interface TrailErgebnis {
  trails: any[];
  zuordnung: { osm_type: string; osm_id: number; trail_osm_id: number; distanz_m: number }[];
}

async function verarbeiteTrails(parkplaetze: any[]): Promise<TrailErgebnis> {
  const dateien = await kachelDateien("trails");
  if (!dateien.length) {
    console.log("Keine Wanderweg-Kacheln vorhanden — Schritt übersprungen.");
    return { trails: [], zuordnung: [] };
  }
  console.log(`Lese ${dateien.length} Wanderweg-Kacheln …`);

  const routen = new Map<number, Record<string, string>>();
  const wegZuRoute = new Map<number, Set<number>>();
  const wegGeom = new Map<number, Pt[]>();

  for (const datei of dateien) {
    let els: OsmElement[];
    try {
      els = (await readJson(raw(datei))).elements;
    } catch {
      continue;
    }
    for (const el of els) {
      if (el.type === "relation") {
        if (el.tags?.name) routen.set(el.id, el.tags);
        for (const m of el.members ?? []) {
          if (m.type !== "way") continue;
          const set = wegZuRoute.get(m.ref) ?? new Set<number>();
          set.add(el.id);
          wegZuRoute.set(m.ref, set);
        }
      } else if (el.type === "way" && el.geometry?.length) {
        wegGeom.set(el.id, el.geometry.map((g) => [g.lon, g.lat] as Pt));
      }
    }
  }
  console.log(`  ${routen.size} Routen, ${wegGeom.size} Wegstücke mit Geometrie`);

  const gitter = new Grid<{ pt: Pt; idx: number }>(0.02);
  parkplaetze.forEach((p, idx) => gitter.add({ pt: [p.lon, p.lat], idx }));

  // Kürzester Abstand je (Parkplatz, Route)
  const beste = new Map<string, number>();
  const suchradius = TRAIL_MAX_M / 1000 + 0.15;
  for (const [wegId, geom] of wegGeom) {
    const rels = wegZuRoute.get(wegId);
    if (!rels?.size) continue;

    const kandidaten = new Set<number>();
    for (const knoten of geom)
      for (const { item } of gitter.within(knoten, suchradius)) kandidaten.add(item.idx);
    if (!kandidaten.size) continue;

    for (const idx of kandidaten) {
      const p = parkplaetze[idx];
      const km = distanzZuLinie([p.lon, p.lat], geom);
      if (km * 1000 > TRAIL_MAX_M) continue;
      for (const relId of rels) {
        if (!routen.has(relId)) continue;
        const schluessel = `${idx}|${relId}`;
        const alt = beste.get(schluessel);
        if (alt === undefined || km < alt) beste.set(schluessel, km);
      }
    }
  }

  // Nur Routen behalten, die tatsächlich an einem Parkplatz liegen
  const genutzt = new Set<number>();
  for (const schluessel of beste.keys()) genutzt.add(Number(schluessel.split("|")[1]));

  const slugs = new Set<string>();
  const trails = [...genutzt].map((relId) => {
    const t = routen.get(relId)!;
    let slug = slugify(t.name);
    if (slugs.has(slug)) slug = `${slug}-${kennung("relation", relId)}`;
    slugs.add(slug);
    const laenge = Number(t.distance?.replace(/[^\d.,]/g, "").replace(",", ".")) || null;
    return {
      osm_id: relId,
      name: t.name,
      slug,
      netz: t.network ?? null,
      ref: t.ref ?? null,
      markierung: markierung(t["osmc:symbol"] ?? t.symbol),
      laenge_km: laenge && laenge > 0 && laenge < 20000 ? laenge : null,
    };
  });

  const zuordnung = [...beste.entries()].map(([schluessel, km]) => {
    const [idx, relId] = schluessel.split("|").map(Number);
    const p = parkplaetze[idx];
    return {
      osm_type: p.osm_type,
      osm_id: p.osm_id,
      trail_osm_id: relId,
      distanz_m: Math.round(km * 1000),
    };
  });

  const mitWegen = new Set(zuordnung.map((z) => `${z.osm_type}/${z.osm_id}`)).size;
  console.log(
    `  ${trails.length} Wanderwege, ${zuordnung.length} Zuordnungen, ` +
      `${mitWegen} von ${parkplaetze.length} Parkplätzen mit mindestens einem Weg`,
  );
  return { trails, zuordnung };
}

// ------------------------------------------------------------- Parkplätze
async function main() {
  console.log("Lade Verwaltungsgrenzen …");
  const { bl, kreise } = await loadAreas();
  console.log(`  ${bl.length} Bundesländer, ${kreise.length} Kreise`);

  console.log("Lade Orte …");
  const ortGrid = await loadPlaces();

  const parkplaetze: any[] = [];
  const stats = { total: 0, ohneName: 0, ausland: 0, ohneKreis: 0, ohneOrt: 0, dubletten: 0, nahDubletten: 0 };
  const seenOsm = new Set<string>();

  const poiDateien = await kachelDateien("pois");
  console.log(`Lese ${poiDateien.length} POI-Kacheln …`);
  let fehlendePois = 0;
  for (const datei of poiDateien) {
    let els: OsmElement[];
    try {
      els = (await readJson(raw(datei))).elements;
    } catch {
      fehlendePois++;
      continue;
    }

    for (const el of els) {
      const pt = coordOf(el);
      if (!pt) continue;
      const key = `${el.type}/${el.id}`;
      if (seenOsm.has(key)) { stats.dubletten++; continue; }
      seenOsm.add(key);

      const tags = el.tags ?? {};
      const blHit = locate(pt, bl);
      const kreisHit = locate(pt, kreise);
      const ortHit = ortGrid.nearest(pt, 30);

      // Die Kacheln greifen über die Grenze; Objekte in Nachbarländern fliegen raus.
      if (!blHit) { stats.ausland++; continue; }
      if (!kreisHit) stats.ohneKreis++;
      if (!ortHit) stats.ohneOrt++;

      const ortName = ortHit?.item.name;
      const hasName = !istGenerisch(tags.name);
      if (!hasName) stats.ohneName++;
      // Ohne Ortsbezug trägt der Kreis den Namen — sonst hießen alle gleich.
      const rumpf = "Wanderparkplatz";
      const basisName = hasName
        ? tags.name!
        : ortName
          ? `${rumpf} ${ortHit && ortHit.km < 0.8 ? "in" : "bei"} ${ortName}`
          : kreisHit
            ? `${rumpf} im ${kreisHit.typ === "Kreisfreie Stadt" ? kreisHit.name : `Landkreis ${kreisHit.name}`}`
            : rumpf;

      const norm = normalize(tags);
      if (ortHit) ortHit.item.poi_count++;

      parkplaetze.push({
        osm_type: el.type, osm_id: el.id, slug: "", name: basisName, basisName, rumpf,
        lat: pt[1], lon: pt[0],
        bl_slug: blHit?.slug ?? null,
        kreis_slug: kreisHit?.slug ?? null,
        ort_slug: ortHit?.item.slug ?? null,
        ort_name: ortName ?? null, // nur für die Namensvergabe, nicht importiert
        ort_km: ortHit ? Number(ortHit.km.toFixed(2)) : null,
        ort_richtung: ortHit ? bearingLabel(ortHit.item.pt, pt) : null,
        ...norm,
        tier: 1,
        daten_score: datenScore(norm, hasName),
        tags,
      });
      stats.total++;
      if (ortHit) { ortHit.item.bl_slug = blHit?.slug; ortHit.item.kreis_slug = kreisHit?.slug; }
    }
  }
  if (fehlendePois) console.warn(`  ! ${fehlendePois} POI-Kacheln nicht lesbar`);

  // Derselbe Platz ist häufig doppelt erfasst: einmal als Punkt, einmal als
  // Fläche. Gleicher Rohname innerhalb von 60 m ⇒ der besser belegte Satz
  // gewinnt. Muss vor vergebeNamen laufen: danach sind alle Namen eindeutig
  // gemacht und der Vergleich liefe ins Leere.
  const dubGrid = new Grid<{ pt: Pt; idx: number }>(0.02);
  const verworfen = new Set<number>();
  parkplaetze.forEach((p, idx) => {
    for (const { item } of dubGrid.within([p.lon, p.lat], 0.06)) {
      if (verworfen.has(item.idx)) continue;
      const a = parkplaetze[item.idx];
      if (a.basisName !== p.basisName) continue;
      const schwaecher = a.daten_score >= p.daten_score ? idx : item.idx;
      verworfen.add(schwaecher);
      if (schwaecher === idx) return;
    }
    dubGrid.add({ pt: [p.lon, p.lat], idx });
  });
  if (verworfen.size) {
    for (const idx of verworfen) {
      const p = parkplaetze[idx];
      if (p.ort_slug) {
        for (const cell of (ortGrid as any).cells.values())
          for (const o of cell as OrtRec[]) if (o.slug === p.ort_slug) o.poi_count--;
      }
    }
    const behalten = parkplaetze.filter((_, i) => !verworfen.has(i));
    parkplaetze.length = 0;
    parkplaetze.push(...behalten);
  }
  stats.nahDubletten = verworfen.size;

  vergebeNamen(parkplaetze);
  vergebeSlugs(parkplaetze);


  // Nur Orte mit mindestens einem Parkplatz bekommen eine eigene Seite —
  // sonst entstehen tausende leere Ortsseiten (Thin Content).
  const orte: any[] = [];
  const ortSeen = new Set<string>();
  for (const cell of (ortGrid as any).cells.values())
    for (const o of cell as OrtRec[]) {
      if (o.poi_count > 0 && !ortSeen.has(o.slug)) {
        ortSeen.add(o.slug);
        orte.push({
          slug: o.slug, name: o.name, typ: o.typ, einwohner: o.einwohner,
          lat: o.pt[1], lon: o.pt[0], poi_count: o.poi_count,
          bl_slug: o.bl_slug ?? null, kreis_slug: o.kreis_slug ?? null,
        });
      }
    }

  // Bundesländer / Kreise: nur mit Bestand, Schwerpunkt aus den Parkplätzen
  const agg = (key: "bl_slug" | "kreis_slug") => {
    const m = new Map<string, { n: number; lat: number; lon: number }>();
    for (const p of parkplaetze) {
      const k = p[key];
      if (!k) continue;
      const e = m.get(k) ?? { n: 0, lat: 0, lon: 0 };
      e.n++; e.lat += p.lat; e.lon += p.lon;
      m.set(k, e);
    }
    return m;
  };
  const blAgg = agg("bl_slug");
  const kreisAgg = agg("kreis_slug");

  const bundeslaender = bl
    .filter((a) => blAgg.has(a.props.slug))
    .map((a) => {
      const e = blAgg.get(a.props.slug)!;
      return { ...a.props, poi_count: e.n, lat: e.lat / e.n, lon: e.lon / e.n };
    });

  const kreiseOut = kreise
    .filter((a) => kreisAgg.has(a.props.slug))
    .map((a) => {
      const e = kreisAgg.get(a.props.slug)!;
      return {
        slug: a.props.slug, name: a.props.name, typ: a.props.typ,
        bl_slug: slugify(a.props.blName),
        poi_count: e.n, lat: e.lat / e.n, lon: e.lon / e.n,
      };
    });

  const { trails, zuordnung } = await verarbeiteTrails(parkplaetze);
  console.log("Baue Standortziele …");
  const standorte = await baueStandorte(bl, kreise);

  await mkdir(OUT, { recursive: true });
  await writeFile(out("trails.json"), JSON.stringify(trails));
  await writeFile(out("parkplatz_trail.json"), JSON.stringify(zuordnung));
  await writeFile(out("standorte.json"), JSON.stringify(standorte));
  await writeFile(out("bundeslaender.json"), JSON.stringify(bundeslaender));
  await writeFile(out("kreise.json"), JSON.stringify(kreiseOut));
  await writeFile(out("orte.json"), JSON.stringify(orte));
  await writeFile(out("parkplaetze.json"), JSON.stringify(parkplaetze));

  const scored = parkplaetze.filter((p) => p.daten_score >= 45).length;
  stats.total = parkplaetze.length;
  console.log(`
Ergebnis
  Parkplätze      ${parkplaetze.length}\n  Dubletten       ${stats.dubletten} (OSM-ID) + ${stats.nahDubletten} (Name & <60 m)
  eigener Name    ${stats.total - stats.ohneName}  (Rest: aus Ort bzw. Kreis gebildet)
  doppelte Namen  ${parkplaetze.length - new Set(parkplaetze.map((p) => p.name)).size}
  Datensatz ≥45   ${scored}  (${((scored / stats.total) * 100).toFixed(0)} % — Kandidaten für eigene Detailseite)
  verworfen (Ausland) ${stats.ausland}\n  ohne Kreis      ${stats.ohneKreis}, ohne Ort ${stats.ohneOrt}
  Bundesländer    ${bundeslaender.length}
  Kreise          ${kreiseOut.length}
  Orte mit Bestand ${orte.length}`);
}

await main();
