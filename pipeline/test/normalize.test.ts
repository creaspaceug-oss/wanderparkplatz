import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize, datenScore } from "../src/normalize.ts";

test("normalize übersetzt Oberflächen und Zugang", () => {
  const n = normalize({ surface: "compacted", access: "permissive" });
  assert.equal(n.oberflaeche, "wassergebundene Decke");
  assert.equal(n.zugang, "Nutzung geduldet");
});

test("normalize reicht unbekannte Werte unverändert durch", () => {
  assert.equal(normalize({ surface: "metal_grid" }).oberflaeche, "metal_grid");
});

test("normalize liest Zahlen aus unsauberen Werten", () => {
  assert.equal(normalize({ capacity: "ca. 25" }).stellplaetze, 25);
  assert.equal(normalize({ maxheight: "2,10 m" }).max_hoehe_m, 2.1);
  assert.equal(normalize({ ele: "812.4" }).hoehe_m, 812);
  assert.equal(normalize({ capacity: "unbekannt" }).stellplaetze, null);
});

test("Gebühr: charge ohne fee-Tag gilt als kostenpflichtig", () => {
  const n = normalize({ charge: "2 EUR/Tag" });
  assert.equal(n.gebuehr, true);
  assert.equal(n.gebuehr_info, "2 EUR/Tag");
});

test("Gebühr: fee=no ist kostenfrei, fehlendes Tag bleibt unbekannt", () => {
  assert.equal(normalize({ fee: "no" }).gebuehr, false);
  assert.equal(normalize({}).gebuehr, null);
});

test("Barrierefreiheit auch aus capacity:disabled", () => {
  assert.equal(normalize({ "capacity:disabled": "2" }).barrierefrei, true);
  assert.equal(normalize({ "capacity:disabled": "0" }).barrierefrei, null);
  assert.equal(normalize({ wheelchair: "no" }).barrierefrei, false);
});

test("datenScore bleibt zwischen 0 und 100", () => {
  assert.equal(datenScore(normalize({}), false), 0);
  const voll = normalize({
    capacity: "20", fee: "no", surface: "asphalt", access: "yes",
    opening_hours: "24/7", lit: "yes", wheelchair: "yes",
    maxheight: "2.0", motorhome: "yes", toilets: "yes",
  });
  const s = datenScore(voll, true);
  assert.ok(s > 90 && s <= 100, `erwartet >90, war ${s}`);
});

test("datenScore gewichtet einen eigenen Namen", () => {
  const n = normalize({ capacity: "10" });
  assert.equal(datenScore(n, true) - datenScore(n, false), 25);
});

test("netzstufe normalisiert OSM-Varianten und verwirft Unbekanntes", async () => {
  const { netzstufe } = await import("../src/markierung.ts");
  assert.equal(netzstufe("rwn"), "rwn");
  assert.equal(netzstufe("regional"), "rwn");
  assert.equal(netzstufe("LOCAL"), "lwn");
  assert.equal(netzstufe("lhn"), "lwn");
  assert.equal(netzstufe("Nationalpark Eifel"), null, "Fließtext ist keine Netzstufe");
  assert.equal(netzstufe(undefined), null);
});
