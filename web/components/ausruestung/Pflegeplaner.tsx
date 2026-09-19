"use client";

import { useId, useState } from "react";

export interface PflegeAngebot {
  k: string;
  name: string;
  form: string;
  url: string;
  anzeige: string | null;
}

type Material = "glatt" | "rau" | "textil" | "misch";
type Tropfen = "perlt" | "zieht";

/**
 * Was deine Schuhe jetzt brauchen — nach Obermaterial und Tropfentest.
 *
 * Die Regel, offen: Ob überhaupt imprägniert werden muss, entscheidet der
 * Tropfentest der Stiftung Warentest. Die Schritte stammen aus der
 * Pflegeanleitung des DAV, das Mittel folgt dem Obermaterial — Wachs für
 * Glattleder, Spray für Rauleder und Kunstfaser. An Membranschuhe keine
 * öligen oder fettenden Mittel (DAV).
 */
export default function Pflegeplaner({
  angebote,
  zeit,
}: {
  angebote: Record<string, PflegeAngebot>;
  zeit: string | null;
}) {
  const id = useId();
  const [material, setMaterial] = useState<Material>("misch");
  const [membran, setMembran] = useState(true);
  const [tropfen, setTropfen] = useState<Tropfen>("zieht");
  const [neu, setNeu] = useState(false);

  const [erst, dann] =
    material === "glatt"
      ? ["nikwaxWachs", "meindl"]
      : material === "rau"
        ? ["nikwaxNubuk", "grangers"]
        : material === "textil"
          ? ["holmenkol", "nikwaxSL"]
          : ["nikwaxSL", "holmenkol"];
  const wachs = material === "glatt";
  const faellig = neu || tropfen === "zieht";

  const schritte: string[] = neu
    ? [
        "Reinigen entfällt — der Schuh ist neu.",
        wachs
          ? "Wachs mit Schwamm oder Tuch einreiben, besonders an den Nähten."
          : "Spray gleichmäßig aufsprühen, im Freien.",
        "Überschuss mit einem Tuch einarbeiten, 24 Stunden einwirken und auslüften lassen.",
      ]
    : [
        "Ausschütteln, groben Schmutz entfernen, mit Bürste und lauwarmer Seifenlauge reinigen.",
        ...(membran ? ["Innen mit weichem Schwamm auswischen — keine Bürste, sie beschädigt das Futter."] : []),
        "Trocknen bei Zimmertemperatur: keine Heizung, keine Sonne, Zeitungspapier hinein und wechseln. Nach einer Wäsche dauert das zwei bis drei Tage.",
        wachs
          ? "Wachs mit Schwamm oder Tuch einreiben, besonders an den Nähten. Leder mit Membran darf dabei noch etwas feucht sein."
          : "Spray gleichmäßig aufsprühen, im Freien. Manche Mittel gehören auf den noch nassen Schuh — Etikett lesen.",
        "Überschuss mit einem Tuch einarbeiten, 24 Stunden einwirken lassen.",
        ...(material === "rau" ? ["Zum Schluss mit der Raulederbürste aufrauen."] : []),
      ];

  const knopf = (aktiv: boolean) =>
    `cursor-pointer rounded-xl border p-2.5 text-center text-sm transition ${
      aktiv ? "border-accent bg-card font-semibold" : "border-line bg-card/60 hover:border-muted"
    }`;
  const gruppe = <T,>(legend: string, name: string, wert: T, setzen: (v: T) => void, optionen: [T, string][], spalten = "grid-cols-2") => (
    <fieldset>
      <legend className="text-sm font-medium text-muted">{legend}</legend>
      <div className={`mt-2 grid gap-2 ${spalten}`}>
        {optionen.map(([v, t]) => (
          <label key={String(v)} className={knopf(wert === v)}>
            <input type="radio" name={`${id}-${name}`} checked={wert === v} onChange={() => setzen(v)} className="sr-only" />
            {t}
          </label>
        ))}
      </div>
    </fieldset>
  );

  const karte = (k: string, haupt: boolean) => {
    const a = angebote[k];
    if (!a) return null;
    return (
      <div className={haupt ? "" : "mt-3 border-t border-line pt-3"}>
        <p className="text-sm text-muted">{haupt ? "Passendes Mittel" : "Alternative"}</p>
        <p className={`${haupt ? "text-xl" : "text-base"} font-bold leading-tight`}>{a.name}</p>
        <p className="text-xs text-muted">{a.form}</p>
        <a
          href={a.url}
          rel="sponsored nofollow noopener"
          target="_blank"
          className={`mt-2 inline-block rounded-lg bg-accent px-3 py-1.5 font-semibold text-white hover:brightness-110 dark:text-background ${haupt ? "text-sm" : "text-xs"}`}
        >
          {a.anzeige ?? "Bei Amazon ansehen"} <span aria-hidden>→</span>
          <span className="sr-only"> bei Amazon, Anzeige</span>
        </a>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-line bg-sand p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          {gruppe<Material>(
            "Woraus ist der Schuh außen?",
            "material",
            material,
            setMaterial,
            [
              ["glatt", "Glattleder"],
              ["rau", "Nubuk, Velours"],
              ["textil", "Textil, Synthetik"],
              ["misch", "Leder und Textil"],
            ],
            "grid-cols-2 sm:grid-cols-4",
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            {gruppe<boolean>("Mit Membran (z. B. Gore-Tex)?", "membran", membran, setMembran, [
              [true, "ja"],
              [false, "nein"],
            ])}
            {gruppe<boolean>("Neu gekauft?", "neu", neu, setNeu, [
              [false, "nein"],
              [true, "ja"],
            ])}
            {gruppe<Tropfen>("Tropfentest", "tropfen", tropfen, setTropfen, [
              ["perlt", "perlt ab"],
              ["zieht", "zieht ein"],
            ])}
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Tropfentest nach Stiftung Warentest: ein wenig Wasser auf das Obermaterial tropfen. Perlt es
            ab, schützt die Imprägnierung noch.
          </p>
        </div>

        <div className="rounded-xl border-2 border-accent bg-card p-4" aria-live="polite">
          <p className="text-sm text-muted">Jetzt</p>
          <p className="text-2xl font-bold leading-tight">
            {!faellig ? "Noch nicht nötig" : wachs ? "Wachsen" : "Imprägnieren"}
          </p>
          {!faellig ? (
            <p className="mt-2 text-sm leading-relaxed">
              Das Wasser perlt noch ab. Nach der Tour reinigen und beim nächsten Mal wieder testen —
              nach einer gründlichen Reinigung rät Gore-Tex, neu zu imprägnieren.
            </p>
          ) : (
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
              {schritte.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          )}
          {membran && (
            <p className="mt-3 rounded-lg bg-sand px-3 py-2 text-xs leading-relaxed">
              Membranschuh: keine öligen oder fettenden Pflegemittel, schreibt der DAV.
            </p>
          )}
          <div className="mt-3 border-t border-line pt-3">{karte(erst, true)}</div>
          {karte(dann, false)}
          <p className="mt-3 text-xs text-muted">Anzeige{zeit ? ` · Preis und Verfügbarkeit: Stand ${zeit} Uhr` : ""}</p>
        </div>
      </div>
    </div>
  );
}
