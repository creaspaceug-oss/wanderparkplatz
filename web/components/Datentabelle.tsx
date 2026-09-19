"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { nf } from "@/lib/format";

export interface Datenzeile {
  name: string;
  slug: string;
  plaetze: number;
  mit: number;
  prozent: string;
  median: number | null;
}

type Spalte = "name" | "plaetze" | "mit" | "prozent" | "median";

/**
 * Außerhalb des Renderkörpers definiert: Eine Komponente, die bei jedem
 * Durchlauf neu entsteht, wirft React bei jeder Änderung weg und baut sie samt
 * Zustand neu auf.
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
 * Tabelle mit Suche und Sortierung.
 *
 * Der Zweck ist nicht Spielerei: Bei 335 Landkreisen sucht jeder zuerst den
 * eigenen. Ohne Suchfeld muss man dafür scrollen und lesen, mit Suchfeld sind
 * es drei Buchstaben.
 *
 * Die Zeilen kommen fertig vom Server und stehen vollständig im Quelltext.
 * Suchen und Sortieren ordnen nur um, was ohnehin da ist — ohne JavaScript
 * bleibt die Tabelle vollständig lesbar, nur eben unsortierbar.
 */
export default function Datentabelle({
  zeilen,
  basis,
  duennAb = 10,
  regionWort = "Region",
  mitTitel = "mit Haltestelle",
  medianTitel = "Median",
}: {
  zeilen: Datenzeile[];
  basis: "bundesland" | "kreis";
  /** Unter dieser Zahl ist ein Prozentwert nicht belastbar. */
  duennAb?: number;
  regionWort?: string;
  /** Überschrift der Trefferspalte — je Auswertung eine andere Sache. */
  mitTitel?: string;
  medianTitel?: string;
}) {
  const [suche, setSuche] = useState("");
  const [spalte, setSpalte] = useState<Spalte>("prozent");
  const [absteigend, setAbsteigend] = useState(true);

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase();
    const liste = q ? zeilen.filter((z) => z.name.toLowerCase().includes(q)) : zeilen;

    return [...liste].sort((a, b) => {
      const v = (z: Datenzeile) =>
        spalte === "name"
          ? z.name
          : spalte === "prozent"
            ? Number(z.prozent)
            : spalte === "median"
              ? (z.median ?? Number.POSITIVE_INFINITY)
              : z[spalte];
      const x = v(a);
      const y = v(b);
      const r = typeof x === "string" ? x.localeCompare(y as string, "de") : (x as number) - (y as number);
      return absteigend ? -r : r;
    });
  }, [zeilen, suche, spalte, absteigend]);

  const sortieren = (s: Spalte) => {
    if (s === spalte) return setAbsteigend((a) => !a);
    setSpalte(s);
    // Namen von A an, Zahlen von groß nach klein — das erwartet man so.
    setAbsteigend(s !== "name");
  };

  return (
    <div>
      <label className="block">
        <span className="sr-only">{regionWort} suchen</span>
        <input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder={`${regionWort} suchen …`}
          className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent sm:w-72"
        />
      </label>

      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {gefiltert.length === zeilen.length
          ? `${nf.format(zeilen.length)} Einträge`
          : `${nf.format(gefiltert.length)} von ${nf.format(zeilen.length)} Einträgen`}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-line text-sm text-muted">
              <Kopfzelle
                s="name"
                text={regionWort}
                aktiv={spalte === "name"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
              <Kopfzelle
                s="plaetze"
                text="Plätze"
                rechts
                aktiv={spalte === "plaetze"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
              <Kopfzelle
                s="mit"
                text={mitTitel}
                rechts
                aktiv={spalte === "mit"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
              <Kopfzelle
                s="prozent"
                text="Anteil"
                rechts
                aktiv={spalte === "prozent"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
              <Kopfzelle
                s="median"
                text={medianTitel}
                rechts
                aktiv={spalte === "median"}
                absteigend={absteigend}
                sortieren={sortieren}
              />
            </tr>
          </thead>
          <tbody>
            {gefiltert.map((z) => {
              const duenn = z.plaetze < duennAb;
              return (
                <tr key={z.slug} className="border-b border-line">
                  <td className="py-2 pr-3">
                    <Link href={`/${basis}/${z.slug}`} className="hover:text-accent">
                      {z.name}
                    </Link>{" "}
                    {duenn && (
                      <span className="ml-1 text-xs text-muted" title="zu wenige Plätze für einen belastbaren Anteil">
                        zu wenige
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf.format(z.plaetze)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf.format(z.mit)}</td>
                  <td
                    className={`py-2 pr-3 text-right tabular-nums font-medium ${duenn ? "text-muted" : ""}`}
                  >
                    {z.prozent.replace(".", ",")} %
                  </td>
                  <td className="py-2 text-right tabular-nums text-muted">
                    {z.median == null ? "—" : `${nf.format(z.median)} m`}
                  </td>
                </tr>
              );
            })}
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
