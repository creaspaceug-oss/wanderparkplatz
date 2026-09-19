"use client";

import { useId, useState } from "react";

export interface FilterAngebot {
  name: string;
  liter: number | null;
  durchfluss: number | null;
  viren: boolean;
  tabletten: boolean;
  url: string;
  anzeige: string | null;
}

type Quelle = "gebirge" | "weide" | "trueb" | "reise";

const QUELLEN: { k: Quelle; text: string; unter: string }[] = [
  { k: "gebirge", text: "Gebirgsbach", unter: "Quelle, Schmelzwasser, oberhalb von Almen" },
  { k: "weide", text: "Bach im Tal", unter: "unterhalb von Weiden, Wald, Mittelgebirge" },
  { k: "trueb", text: "Trübes Wasser", unter: "Tümpel, Seeufer, Pfütze" },
  { k: "reise", text: "Reise", unter: "Länder mit unsicherem Trinkwasser" },
];

const RAT: Record<Quelle, { titel: string; text: string }> = {
  gebirge: {
    titel: "Hohlfaserfilter",
    text: "Viele Gebirgsbäche werden von Quellen oder Schmelzwasser gespeist. Sicher sind sie trotzdem nicht — Wildtiere können Erreger eintragen. Ein Hohlfaserfilter hält Bakterien und Parasiten zurück, die hier das Hauptrisiko sind. Wasser so nah wie möglich an der Quelle schöpfen.",
  },
  weide: {
    titel: "Hohlfaserfilter, nah an der Quelle schöpfen",
    text: "Je weiter unten geschöpft, desto mehr kann von oben eingetragen sein — die Bergwelten-Redaktion rät, so nah wie möglich an der Quelle zu schöpfen. Ein Hohlfaserfilter hält Bakterien und Parasiten zurück; Viren nicht. Wer ganz sicher gehen will, kocht zusätzlich ab oder desinfiziert nach dem Filtern.",
  },
  trueb: {
    titel: "Vorfiltern, dann filtern",
    text: "Schwebstoffe verstopfen Membranen und stören Tabletten. Erst durch ein Tuch gießen oder absetzen lassen, dann filtern — eine Pumpe mit Schlauch schöpft auch aus flachem Wasser. Tabletten allein wirken nur in klarem Wasser zuverlässig.",
  },
  reise: {
    titel: "Virenschutz: Filter plus Desinfektion oder Abkochen",
    text: "Hohlfaserfilter lassen Viren durch. Die CDC rät, wenn Abkochen nicht geht, erst zu filtern und dann zu desinfizieren — oder einen Filter mit Virenbarriere zu nehmen.",
  },
};

/**
 * Welche Methode für welches Wasser — und reicht der Filter für die Tour?
 *
 * Die Einordnung der Quellen folgt der Bergwelten-Redaktion und der CDC.
 * Die Mengenrechnung ist schlicht: Personen × Tage × Liter pro Tag, gegen die
 * Kapazität laut Hersteller; die Filterzeit aus dem Durchfluss, wo einer
 * angegeben ist. Für Reisen zählen nur Lösungen mit Virenschutz, und
 * Hohlfaserfilter werden dort mit Tabletten kombiniert gezeigt.
 */
export default function Wasserberater({ filter, zeit }: { filter: FilterAngebot[]; zeit: string | null }) {
  const id = useId();
  const [quelle, setQuelle] = useState<Quelle>("gebirge");
  const [personen, setPersonen] = useState(1);
  const [tage, setTage] = useState(2);
  const [proTag, setProTag] = useState(3);

  const gesamt = personen * tage * proTag;
  const rat = RAT[quelle];
  // Auf Reisen nur Lösungen mit Virenschutz; sonst die Hohlfaser- und
  // Pumpfilter, denn eine Virenbarriere braucht es in Europa selten.
  const passend = filter
    .filter((f) => !f.tabletten && (quelle === "reise" ? f.viren : !f.viren))
    .map((f) => ({ ...f, reicht: f.liter === null ? null : f.liter >= gesamt }))
    .sort((a, b) => Number(b.reicht ?? 0.5) - Number(a.reicht ?? 0.5) || (b.durchfluss ?? 0) - (a.durchfluss ?? 0));
  const tabletten = filter.find((f) => f.tabletten);
  const zahl = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 1 });

  const regler = (label: string, wert: number, setzen: (n: number) => void, min: number, max: number, einheit: string) => (
    <div>
      <label htmlFor={`${id}-${label}`} className="flex items-baseline justify-between text-sm text-muted">
        {label}
        <output htmlFor={`${id}-${label}`} className="text-lg font-bold tabular-nums text-foreground">
          {wert} {einheit}
        </output>
      </label>
      <input
        id={`${id}-${label}`}
        type="range"
        min={min}
        max={max}
        value={wert}
        onChange={(e) => setzen(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--accent)]"
      />
    </div>
  );

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-muted">Woher kommt das Wasser?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {QUELLEN.map((q) => (
                <label
                  key={q.k}
                  className={`cursor-pointer rounded-xl border p-2.5 transition ${
                    quelle === q.k ? "border-accent bg-card" : "border-line bg-card/60 hover:border-muted"
                  }`}
                >
                  <input type="radio" name={`${id}-q`} checked={quelle === q.k} onChange={() => setQuelle(q.k)} className="sr-only" />
                  <span className="block font-semibold leading-snug">{q.text}</span>
                  <span className="block text-xs text-muted">{q.unter}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-3">
            {regler("Personen", personen, setPersonen, 1, 6, "")}
            {regler("Tage", tage, setTage, 1, 14, "")}
            {regler("Liter pro Kopf und Tag", proTag, setProTag, 1, 6, "l")}
          </div>
          <p className="rounded-xl bg-card px-4 py-3 text-[0.95rem] leading-relaxed">
            <strong>{rat.titel}.</strong> {rat.text}
          </p>
        </div>

        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Zu filtern auf der Tour</p>
          <p className="text-3xl font-bold tabular-nums">{zahl(gesamt)} Liter</p>
          <ul className="mt-3 space-y-2.5 border-t border-line pt-3 text-sm">
            {passend.map((f) => (
              <li key={f.url}>
                <a href={f.url} rel="sponsored nofollow noopener" target="_blank" className="font-semibold text-accent underline hover:no-underline">
                  {f.name}
                  {f.anzeige ? ` — ${f.anzeige}` : ""} →
                </a>
                <span className="block text-xs text-muted">
                  {f.liter === null
                    ? "Kapazität nicht angegeben"
                    : f.reicht
                      ? `reicht für ${Math.floor(f.liter / gesamt).toLocaleString("de-DE")} solche Touren`
                      : `nur ${f.liter} Liter — Ersatzfilter nötig`}
                  {f.durchfluss ? ` · Filterzeit etwa ${Math.ceil(gesamt / f.durchfluss)} Minuten` : ""}
                </span>
              </li>
            ))}
            {quelle === "reise" && tabletten && (
              <li>
                <a href={tabletten.url} rel="sponsored nofollow noopener" target="_blank" className="font-semibold text-accent underline hover:no-underline">
                  oder Hohlfaserfilter + {tabletten.name}
                  {tabletten.anzeige ? ` — ${tabletten.anzeige}` : ""} →
                </a>
                <span className="block text-xs text-muted">
                  1 Tablette je Liter: {Math.ceil(gesamt)} Tabletten, laut Packung 30 Minuten Wartezeit
                </span>
              </li>
            )}
          </ul>
          <p className="mt-3 text-xs text-muted">Anzeige{zeit ? ` · Preis und Verfügbarkeit: Stand ${zeit} Uhr` : ""}</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Kapazität und Durchfluss laut Hersteller; die Filterzeit rechnet reine Durchflusszeit, ohne
        Schöpfen und Reinigen. Die Einordnung der Quellen folgt der Bergwelten-Redaktion und der
        US-Gesundheitsbehörde CDC. Ein Filter ersetzt nicht den Blick auf das Wasser: Liegt oberhalb
        ein totes Tier im Bach oder weidet Vieh direkt daneben, weiter oben schöpfen.
      </p>
    </div>
  );
}
