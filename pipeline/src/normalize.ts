/** OSM-Tags → deutschsprachige, normalisierte Felder. */

const SURFACE: Record<string, string> = {
  asphalt: "Asphalt",
  paved: "befestigt",
  concrete: "Beton",
  paving_stones: "Pflastersteine",
  sett: "Kopfsteinpflaster",
  compacted: "wassergebundene Decke",
  fine_gravel: "Feinschotter",
  gravel: "Schotter",
  pebblestone: "Kies",
  ground: "Naturboden",
  dirt: "Erde",
  earth: "Erde",
  grass: "Wiese",
  grass_paver: "Rasengittersteine",
  sand: "Sand",
  unpaved: "unbefestigt",
  woodchips: "Hackschnitzel",
};

const ACCESS: Record<string, string> = {
  yes: "öffentlich zugänglich",
  public: "öffentlich zugänglich",
  permissive: "Nutzung geduldet",
  customers: "nur für Gäste",
  destination: "nur für Anlieger",
  private: "privat",
  no: "gesperrt",
};

const num = (v?: string): number | null => {
  if (!v) return null;
  const m = /-?\d+(?:[.,]\d+)?/.exec(v);
  return m ? Number(m[0].replace(",", ".")) : null;
};

const yes = (v?: string): boolean | null => {
  if (v == null) return null;
  if (["yes", "true", "1", "designated", "official"].includes(v)) return true;
  if (["no", "false", "0", "none"].includes(v)) return false;
  return null;
};

export interface Normalized {
  stellplaetze: number | null;
  gebuehr: boolean | null;
  gebuehr_info: string | null;
  oberflaeche: string | null;
  zugang: string | null;
  oeffnungszeiten: string | null;
  beleuchtet: boolean | null;
  barrierefrei: boolean | null;
  max_hoehe_m: number | null;
  wohnmobil: boolean | null;
  wc: boolean | null;
  betreiber: string | null;
  hoehe_m: number | null;
}

export function normalize(t: Record<string, string>): Normalized {
  const fee = yes(t.fee);
  const gebuehrInfo =
    t.charge ??
    t["fee:conditional"] ??
    (t.fee && fee === null ? t.fee : null) ??
    null;

  const wohnmobil =
    yes(t.motorhome) ??
    yes(t.caravan) ??
    (t["capacity:caravan"] && num(t["capacity:caravan"])! > 0 ? true : null);

  return {
    stellplaetze: num(t.capacity),
    // charge ohne fee-Tag heißt de facto kostenpflichtig
    gebuehr: fee ?? (t.charge ? true : null),
    gebuehr_info: gebuehrInfo,
    oberflaeche: t.surface ? (SURFACE[t.surface] ?? t.surface) : null,
    zugang: t.access ? (ACCESS[t.access] ?? t.access) : null,
    oeffnungszeiten: t.opening_hours ?? null,
    beleuchtet: yes(t.lit),
    barrierefrei:
      yes(t.wheelchair) ??
      (t["capacity:disabled"] && num(t["capacity:disabled"])! > 0 ? true : null),
    max_hoehe_m: num(t.maxheight ?? t["maxheight:physical"]),
    wohnmobil,
    wc: yes(t.toilets),
    betreiber: t.operator ?? null,
    hoehe_m: num(t.ele) != null ? Math.round(num(t.ele)!) : null,
  };
}

/**
 * 0–100: wie belastbar der Datensatz ist. Steuert Sortierung und
 * entscheidet, ob eine Detailseite genug Substanz für eine eigene URL hat.
 */
export function datenScore(n: Normalized, hasName: boolean): number {
  let s = 0;
  if (hasName) s += 25;
  if (n.stellplaetze != null) s += 20;
  if (n.gebuehr != null) s += 15;
  if (n.oberflaeche) s += 10;
  if (n.zugang) s += 8;
  if (n.oeffnungszeiten) s += 6;
  if (n.beleuchtet != null) s += 4;
  if (n.barrierefrei != null) s += 4;
  if (n.max_hoehe_m != null) s += 3;
  if (n.wohnmobil != null) s += 3;
  if (n.wc != null) s += 2;
  return Math.min(100, s);
}
