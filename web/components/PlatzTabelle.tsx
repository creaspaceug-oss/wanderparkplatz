"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { nf } from "@/lib/format";

export interface PlatzZeile {
  name: string;
  slug: string;
  kreis: string;
  kreis_slug: string;
  land: string;
  distanz_m: number;
  /** Der Eintrag, zu dem die Entfernung gilt — bei Haltestellen ihr Name. */
  zusatz: string | null;
}

type Spalte = "name" | "kreis" | "land" | "distanz_m" | "zusatz";

/**
 * Außerhalb des Renderkörpers: Eine Komponente, die bei jedem Durchlauf neu
 * entsteht, wirft React samt Zustand weg und baut sie neu auf.
 */
function Kopfzelle({
  s,
  text,
  rechts,
  aktiv,
  absteigend,
  sortieren,
}: {
  s: Spalte;
  text: string;
  rechts?: boolean;
  aktiv: boolean;
  absteigend: boolean;
  sortieren: (s: Spalte) => void;
}) {
  return (
    <th
      scope="col"
      aria-sort={aktiv ? (absteigend ? "descending" : "ascending") : "none"}
      className={`py-2 pr-3 font-medium ${rechts ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => sortieren(s)}
        className="inline-flex items-center gap-1 hover:text-accent"
      >
        {text}
        <span aria-hidden className={aktiv ? "" : "opacity-30"}>
          {aktiv && !absteigend ? "▲" : "▼"}
        </span>
      </button>
    </th>
  );
}

/**
 * Durchsuchbare Liste von Wanderparkplätzen mit einer Entfernungsangabe.
 *
 * Der Grund für diese Tabelle ist schlichter Gebrauchswert. Eine Auswertung
 * beantwortet eine Frage über Deutschland; wer hier ankommt, hat meist eine
 * über den eigenen Landkreis. Ob am Ausgangspunkt ein Klo steht oder ein Bus
 * hält, findet man mit drei Buchstaben im Suchfeld.
 *
 * Die Zeilen kommen fertig vom Server und stehen vollständig im Quelltext.
 * Suchen und Sortieren ordnen nur um, was ohnehin da ist — ohne JavaScript
 * bleibt die Liste lesbar, nur eben unsortierbar.
 */
export default function PlatzTabelle({
  zeilen,
  zusatzTitel,
  platzhalter = "Platz, Landkreis oder Bundesland …",
}: {
  zeilen: PlatzZeile[];
  /**
   * Überschrift der Zusatzspalte. Ohne Angabe entfällt die Spalte — bei
   * Toiletten steht dort fast nie etwas, bei Haltestellen fast immer.
   */
  zusatzTitel?: string;
  platzhalter?: string;
}) {
  const [suche, setSuche] = useState("");
  const [spalte, setSpalte] = useState<Spalte>("kreis");
  const [absteigend, setAbsteigend] = useState(false);

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    const liste = q
      ? zeilen.filter(
          (z) =>
            z.name.toLowerCase().includes(q) ||
            z.kreis.toLowerCase().includes(q) ||
            z.land.toLowerCase().includes(q) ||
            (z.zusatz?.toLowerCase().includes(q) ?? false),
        )
      : zeilen;

    return [...liste].sort((a, b) => {
      const v = (z: PlatzZeile) =>
        spalte === "distanz_m" ? z.distanz_m : (z[spalte] ?? "");
      const x = v(a);
      const y = v(b);
      const r =
        typeof x === "string" ? x.localeCompare(y as string, "de") : (x as number) - (y as number);
      // Innerhalb desselben Kreises nach Namen, sonst springt die Liste.
      return (absteigend ? -r : r) || a.name.localeCompare(b.name, "de");
    });
  }, [zeilen, suche, spalte, absteigend]);

  const sortieren = (s: Spalte) => {
    if (s === spalte) return setAbsteigend((a) => !a);
    setSpalte(s);
    // Text von A an, Entfernung von nah nach fern — beides die erwartete Richtung.
    setAbsteigend(false);
  };

  return (
    <div>
      <label className="block">
        <span className="sr-only">{platzhalter.replace(" …", " suchen")}</span>
        <input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder={platzhalter}
          className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent sm:w-80"
        />
      </label>

      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {gefiltert.length === zeilen.length
          ? `${nf.format(zeilen.length)} Plätze`
          : `${nf.format(gefiltert.length)} von ${nf.format(zeilen.length)} Plätzen`}
      </p>

      <div className="mt-3 max-h-[36rem] overflow-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b-2 border-line text-sm text-muted">
              <Kopfzelle
                s="name"
                text="Wanderparkplatz"
                aktiv={spalte === "name"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
              <Kopfzelle
                s="kreis"
                text="Landkreis"
                aktiv={spalte === "kreis"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
              {zusatzTitel && (
                <Kopfzelle
                  s="zusatz"
                  text={zusatzTitel}
                  aktiv={spalte === "zusatz"}
                  absteigend={absteigend}
                  sortieren={sortieren}
                />
              )}
              <Kopfzelle
                s="distanz_m"
                text="Entfernung"
                rechts
                aktiv={spalte === "distanz_m"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
            </tr>
          </thead>
          <tbody>
            {gefiltert.map((z) => (
              <tr key={z.slug} className="border-b border-line last:border-0">
                <td className="py-2 pl-3 pr-3">
                  <Link href={`/wanderparkplatz/${z.slug}`} className="hover:text-accent">
                    {z.name}
                  </Link>
                </td>
                <td className="py-2 pr-3 text-muted">
                  <Link href={`/kreis/${z.kreis_slug}`} className="hover:text-accent">
                    {z.kreis}
                  </Link>
                </td>
                {zusatzTitel && (
                  <td className="py-2 pr-3 text-muted">{z.zusatz ?? "—"}</td>
                )}
                <td className="py-2 pr-3 text-right tabular-nums">{nf.format(z.distanz_m)} m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {gefiltert.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          Nichts gefunden. Landkreise stehen unter ihrem amtlichen Namen, also etwa
          „Ortenaukreis“ statt „Offenburg“.
        </p>
      )}
    </div>
  );
}
