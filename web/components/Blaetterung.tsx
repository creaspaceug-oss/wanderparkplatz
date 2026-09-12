import Link from "next/link";

/**
 * Seitennummern für lange Verzeichnisse.
 *
 * Zweck ist zuerst die Erreichbarkeit: Ohne diese Verweise hingen 6.295
 * Ziel- und 1.170 Wegseiten intern in der Luft und waren nur über die
 * Sitemap auffindbar. Deshalb stehen erste und letzte Seite immer im
 * Quelltext, nicht nur "weiter" — sonst müsste ein Crawler sich durch
 * neunundzwanzig Seiten hangeln.
 */
export default function Blaetterung({
  basis,
  seite,
  seiten,
}: {
  /** Pfad ohne Seitennummer, etwa "/ziele/seite". */
  basis: string;
  seite: number;
  seiten: number;
}) {
  if (seiten <= 1) return null;

  const umgebung = [seite - 2, seite - 1, seite, seite + 1, seite + 2].filter(
    (n) => n > 1 && n < seiten,
  );
  const nummern = [...new Set([1, ...umgebung, seiten])].sort((a, b) => a - b);

  const knopf =
    "rounded-lg border border-line px-3 py-2 text-sm hover:border-accent";

  return (
    <nav aria-label="Seiten" className="mt-8 flex flex-wrap items-center gap-2">
      {seite > 1 && (
        <Link href={`${basis}/${seite - 1}`} rel="prev" className={knopf}>
          Zurück
        </Link>
      )}

      {nummern.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {/* Lücke sichtbar machen, damit niemand eine fortlaufende Reihe erwartet. */}
          {i > 0 && n - nummern[i - 1] > 1 && <span className="text-muted">…</span>}
          {n === seite ? (
            <span
              aria-current="page"
              className="rounded-lg border border-accent bg-accent-soft px-3 py-2 text-sm font-medium"
            >
              {n}
            </span>
          ) : (
            <Link href={`${basis}/${n}`} className={knopf}>
              {n}
            </Link>
          )}
        </span>
      ))}

      {seite < seiten && (
        <Link href={`${basis}/${seite + 1}`} rel="next" className={knopf}>
          Weiter
        </Link>
      )}
    </nav>
  );
}
