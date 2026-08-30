import { test } from "node:test";
import assert from "node:assert/strict";
import {
  haversineKm, bearingLabel, makeArea, locate, slugify, Grid,
  distanzZuStrecke, distanzZuLinie,
} from "../src/geo.ts";

test("haversineKm trifft bekannte Distanzen", () => {
  const berlin: [number, number] = [13.405, 52.52];
  const hamburg: [number, number] = [9.99, 53.55];
  assert.ok(Math.abs(haversineKm(berlin, hamburg) - 255) < 3);
  assert.equal(haversineKm(berlin, berlin), 0);
});

test("haversineKm ist symmetrisch", () => {
  const a: [number, number] = [7.1, 51.2];
  const b: [number, number] = [11.6, 48.1];
  assert.ok(Math.abs(haversineKm(a, b) - haversineKm(b, a)) < 1e-9);
});

test("bearingLabel liefert fertige deutsche Adverbien", () => {
  const mitte: [number, number] = [10, 51];
  assert.equal(bearingLabel(mitte, [10, 52]), "nördlich");
  assert.equal(bearingLabel(mitte, [11, 51]), "östlich");
  assert.equal(bearingLabel(mitte, [10, 50]), "südlich");
  assert.equal(bearingLabel(mitte, [9, 51]), "westlich");
  // Der Umlaut lässt sich nicht per Endungstausch erzeugen
  assert.equal(bearingLabel(mitte, [11, 52]), "nordöstlich");
  assert.equal(bearingLabel(mitte, [9, 50]), "südwestlich");
});

test("locate erkennt Punkte in Polygonen und in Löchern", () => {
  const mitLoch = makeArea("ring", [
    [
      [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
      [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]],
    ],
  ]);
  assert.equal(locate([1, 1], [mitLoch]), "ring");
  assert.equal(locate([5, 5], [mitLoch]), null, "Punkt im Loch zählt nicht");
  assert.equal(locate([20, 20], [mitLoch]), null);
});

test("locate wählt bei mehreren Flächen die zutreffende", () => {
  const a = makeArea("west", [[[[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]]]]);
  const b = makeArea("ost", [[[[5, 0], [10, 0], [10, 5], [5, 5], [5, 0]]]]);
  assert.equal(locate([1, 1], [a, b]), "west");
  assert.equal(locate([9, 1], [a, b]), "ost");
});

test("slugify erzeugt URL-taugliche deutsche Slugs", () => {
  assert.equal(slugify("Wanderparkplatz Große Höhe/Süd (P3)"), "wanderparkplatz-grosse-hoehe-sued-p3");
  assert.equal(slugify("Müllerthal — Öko"), "muellerthal-oeko");
  assert.equal(slugify("---Test---"), "test");
  assert.ok(slugify("x".repeat(200)).length <= 80);
});

test("Grid findet nächsten Nachbarn und respektiert den Radius", () => {
  const g = new Grid<{ pt: [number, number]; n: string }>(0.1);
  g.add({ pt: [13.405, 52.52], n: "Berlin" });
  g.add({ pt: [9.99, 53.55], n: "Hamburg" });
  g.add({ pt: [11.58, 48.14], n: "München" });

  assert.equal(g.nearest([13.4, 52.5])!.item.n, "Berlin");
  assert.equal(g.nearest([9.9, 53.5])!.item.n, "Hamburg");
  assert.equal(g.within([13.405, 52.52], 5).length, 1);
  assert.equal(g.within([13.405, 52.52], 300).length, 2, "Hamburg liegt in 300 km");
  assert.equal(g.nearest([0, 0], 40), null, "außerhalb des Suchradius");
});

test("Grid sortiert Treffer nach Distanz", () => {
  const g = new Grid<{ pt: [number, number]; n: string }>(0.1);
  g.add({ pt: [7.0, 51.0], n: "nah" });
  g.add({ pt: [7.2, 51.0], n: "fern" });
  const treffer = g.within([6.99, 51.0], 30);
  assert.deepEqual(treffer.map((t) => t.item.n), ["nah", "fern"]);
});

test("distanzZuStrecke misst senkrecht zur Strecke, nicht zu den Enden", () => {
  // Strecke rund 1 km lang, Punkt 100 m seitlich der Mitte
  const a: [number, number] = [7.0, 51.0];
  const b: [number, number] = [7.0143, 51.0];
  const p: [number, number] = [7.00715, 51.0009];
  const d = distanzZuStrecke(p, a, b);
  assert.ok(Math.abs(d - 0.1) < 0.01, `erwartet ~0,1 km, war ${d.toFixed(3)}`);
  // Knotenabstand wäre deutlich größer — genau der Fehler, den das vermeidet
  assert.ok(Math.min(haversineKm(p, a), haversineKm(p, b)) > 0.4);
});

test("distanzZuStrecke klemmt auf die Endpunkte", () => {
  const a: [number, number] = [7.0, 51.0];
  const b: [number, number] = [7.01, 51.0];
  const jenseits: [number, number] = [6.99, 51.0];
  assert.ok(Math.abs(distanzZuStrecke(jenseits, a, b) - haversineKm(jenseits, a)) < 0.001);
});

test("distanzZuLinie nimmt das nächste Segment", () => {
  const linie: [number, number][] = [[7.0, 51.0], [7.01, 51.0], [7.01, 51.01]];
  const p: [number, number] = [7.0101, 51.005];
  assert.ok(distanzZuLinie(p, linie) < 0.02);
  assert.equal(distanzZuLinie(p, []), Infinity);
});
