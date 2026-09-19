"use client";

import { useId, useState } from "react";

export interface LampeLeuchtdauer {
  name: string;
  lm: number;
  h: number;
  url: string;
  anzeige: string | null;
}

const REGIONEN = [
  { k: "nord", text: "Norden", ort: "Hamburg", lat: 53.55, lon: 10.0 },
  { k: "mitte", text: "Mitte", ort: "Kassel", lat: 51.32, lon: 9.5 },
  { k: "sued", text: "Alpen", ort: "Garmisch-Partenkirchen", lat: 47.49, lon: 11.1 },
] as const;

const MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

/** Letzter Sonntag eines Monats (UTC-Datum). */
const letzterSonntag = (jahr: number, monat: number) => {
  const d = new Date(Date.UTC(jahr, monat + 1, 0));
  return d.getUTCDate() - d.getUTCDay();
};

/**
 * Sonnenuntergang und Ende der bürgerlichen Dämmerung in Ortszeit, in
 * Minuten nach Mitternacht.
 *
 * Nach den Näherungsformeln der NOAA (Gleichung der Zeit und Deklination als
 * Fourier-Reihe), genau auf wenige Minuten — für eine Tourplanung mehr als
 * genug. Sonnenuntergang bei 90,833° Zenitdistanz (Refraktion und
 * Sonnenradius), Ende der bürgerlichen Dämmerung bei 96°. Sommerzeit vom
 * letzten Sonntag im März bis zum letzten Sonntag im Oktober.
 */
function sonne(jahr: number, monat: number, tag: number, lat: number, lon: number) {
  const n = Math.round((Date.UTC(jahr, monat, tag) - Date.UTC(jahr, 0, 0)) / 864e5);
  const g = ((2 * Math.PI) / 365) * (n - 1);
  const eqt =
    229.18 *
    (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const phi = (lat * Math.PI) / 180;
  const stundenwinkel = (zenit: number) =>
    (Math.acos(Math.cos((zenit * Math.PI) / 180) / (Math.cos(phi) * Math.cos(decl)) - Math.tan(phi) * Math.tan(decl)) * 180) / Math.PI;
  const sommer =
    (monat > 2 && monat < 9) ||
    (monat === 2 && tag >= letzterSonntag(jahr, 2)) ||
    (monat === 9 && tag < letzterSonntag(jahr, 9));
  const versatz = sommer ? 120 : 60;
  const utc = (zenit: number) => 720 - 4 * (lon - stundenwinkel(zenit)) - eqt;
  return { unter: utc(90.833) + versatz, dunkel: utc(96) + versatz, sommer };
}

const uhr = (min: number) => {
  const m = Math.round(min);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
};

/**
 * Wann wird es auf dieser Tour dunkel — und hält die Lampe so lange?
 *
 * Eingaben: Monat, Region, Startzeit, Gehzeit. Ausgabe: Sonnenuntergang,
 * Ende der Dämmerung, Ankunft, Minuten im Dunkeln, als Zeitleiste. Dazu die
 * Lampen aus dem Vergleich, deren mittlere Stufe die doppelte Dunkelzeit
 * hält — das Doppelte als offen genannte Reserve für Kälte, einen Umweg
 * oder einen alten Akku.
 */
export default function Dunkelrechner({
  lampen,
  zeit,
  monatStart,
}: {
  lampen: LampeLeuchtdauer[];
  zeit: string | null;
  monatStart: number;
}) {
  const id = useId();
  const [monat, setMonat] = useState(monatStart);
  const [region, setRegion] = useState<(typeof REGIONEN)[number]["k"]>("mitte");
  const [start, setStart] = useState(11 * 60);
  const [dauer, setDauer] = useState(5);

  const r = REGIONEN.find((x) => x.k === region)!;
  const jahr = new Date().getFullYear();
  const s = sonne(jahr, monat, 15, r.lat, r.lon);
  const ende = start + dauer * 60;
  const imDunkeln = Math.max(0, ende - s.dunkel);
  const inDaemmerung = Math.max(0, Math.min(ende, s.dunkel) - Math.max(start, s.unter));
  const reserveH = (imDunkeln * 2) / 60;
  const passend = lampen.filter((l) => l.h >= Math.max(reserveH, 0.5));

  // Zeitleiste von 6 bis 24 Uhr.
  const von = 6 * 60;
  const bis = 24 * 60;
  const pos = (m: number) => `${(Math.min(Math.max(m, von), bis) - von) / (bis - von) * 100}%`;

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-muted">Monat</legend>
            <div className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
              {MONATE.map((m, i) => (
                <label
                  key={m}
                  className={`cursor-pointer rounded-lg border py-1.5 text-center text-sm transition ${
                    monat === i ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
                  }`}
                >
                  <input type="radio" name={`${id}-m`} checked={monat === i} onChange={() => setMonat(i)} className="sr-only" />
                  {m}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium text-muted">Wo?</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {REGIONEN.map((x) => (
                <label
                  key={x.k}
                  className={`cursor-pointer rounded-xl border p-2 text-center transition ${
                    region === x.k ? "border-accent bg-card" : "border-line bg-card/60 hover:border-muted"
                  }`}
                >
                  <input type="radio" name={`${id}-r`} checked={region === x.k} onChange={() => setRegion(x.k)} className="sr-only" />
                  <span className="block text-sm font-semibold">{x.text}</span>
                  <span className="block text-xs text-muted">{x.ort}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-s`} className="block text-sm font-medium text-muted">
                Start am Parkplatz
              </label>
              <output htmlFor={`${id}-s`} className="mt-1 block text-3xl font-bold tabular-nums">
                {uhr(start)} Uhr
              </output>
              <input
                id={`${id}-s`}
                type="range"
                min={6 * 60}
                max={17 * 60}
                step={15}
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--accent)]"
              />
            </div>
            <div>
              <label htmlFor={`${id}-d`} className="block text-sm font-medium text-muted">
                Gehzeit mit Pausen
              </label>
              <output htmlFor={`${id}-d`} className="mt-1 block text-3xl font-bold tabular-nums">
                {dauer.toLocaleString("de-DE")} h
              </output>
              <input
                id={`${id}-d`}
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={dauer}
                onChange={(e) => setDauer(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--accent)]"
              />
            </div>
          </div>

          {/* Zeitleiste: Tag, Dämmerung, Nacht — und die Tour darüber. */}
          <div aria-hidden className="pt-1">
            <div className="relative h-8 overflow-hidden rounded-lg">
              <div className="absolute inset-y-0 left-0 bg-[#f3e7b8] dark:bg-[#5b5230]" style={{ width: pos(s.unter) }} />
              <div
                className="absolute inset-y-0 bg-[#c9a36b] dark:bg-[#6b4f2f]"
                style={{ left: pos(s.unter), width: `calc(${pos(s.dunkel)} - ${pos(s.unter)})` }}
              />
              <div className="absolute inset-y-0 right-0 bg-[#2c3440]" style={{ left: pos(s.dunkel) }} />
              <div
                className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow"
                style={{ left: pos(start), width: `calc(${pos(ende)} - ${pos(start)})` }}
              />
            </div>
            <div className="relative mt-1 h-4 text-xs tabular-nums text-muted">
              {[6, 9, 12, 15, 18, 21, 24].map((h) => (
                <span key={h} className="absolute -translate-x-1/2" style={{ left: pos(h * 60) }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Sonnenuntergang</dt>
            <dd className="text-right font-semibold tabular-nums">{uhr(s.unter)} Uhr</dd>
            <dt className="text-muted">Dunkel ab</dt>
            <dd className="text-right font-semibold tabular-nums">{uhr(s.dunkel)} Uhr</dd>
            <dt className="text-muted">Zurück am Auto</dt>
            <dd className="text-right font-semibold tabular-nums">{ende >= 24 * 60 ? "nach Mitternacht" : `${uhr(ende)} Uhr`}</dd>
          </dl>
          <p className="mt-3 border-t border-line pt-3 text-2xl font-bold leading-tight">
            {imDunkeln > 0
              ? `${Math.round(imDunkeln)} Minuten im Dunkeln`
              : inDaemmerung > 0
                ? "Zurück in der Dämmerung"
                : "Zurück bei Tageslicht"}
          </p>
          <p className="mt-1 text-[0.95rem] leading-relaxed">
            {imDunkeln > 0
              ? `Die Lampe sollte auf mittlerer Stufe mindestens ${
                  reserveH < 1
                    ? `${Math.ceil(reserveH * 60)} Minuten`
                    : `${reserveH.toLocaleString("de-DE", { maximumFractionDigits: 1 })} Stunden`
                } halten — das Doppelte als Reserve.`
              : inDaemmerung > 0
                ? `${Math.round(inDaemmerung)} Minuten nach Sonnenuntergang, im Wald wird es früher dunkel. Eine Lampe gehört trotzdem in den Rucksack.`
                : "Eine Lampe gehört trotzdem in den Rucksack — für den Fall, dass es länger dauert."}
          </p>
          {imDunkeln > 0 && (
            <>
              <p className="mt-3 text-sm font-semibold">Aus diesem Vergleich reicht das:</p>
              <ul className="mt-1 space-y-1 text-sm">
                {passend.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} rel="sponsored nofollow noopener" target="_blank" className="text-accent underline hover:no-underline">
                      {l.name} — {l.lm} lm für {l.h.toLocaleString("de-DE")} h{l.anzeige ? `, ${l.anzeige}` : ""} →
                    </a>
                  </li>
                ))}
              </ul>
              {passend.length === 0 && <p className="text-sm text-muted">Keine — plane Ersatzbatterien oder eine zweite Lampe ein.</p>}
              <p className="mt-2 text-xs text-muted">Anzeige{zeit ? ` · Preis und Verfügbarkeit: Stand ${zeit} Uhr` : ""}</p>
            </>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Sonnenzeiten für den 15. des Monats in {r.ort}, berechnet nach den Näherungsformeln der
        US-Wetterbehörde NOAA, auf wenige Minuten genau; {s.sommer ? "Sommerzeit" : "Winterzeit"}.
        „Dunkel ab“ ist das Ende der bürgerlichen Dämmerung, wenn die Sonne 6° unter dem Horizont
        steht — danach braucht man im Freien Licht, im Wald und in Nordhängen schon früher.
        Die Reserve ist unsere Annahme. Leuchtdauern der mittleren Stufe laut Hersteller, nur für
        Lampen, die sie veröffentlichen.
      </p>
    </div>
  );
}
