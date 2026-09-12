/**
 * Abschnitt als abgesetzte Fläche.
 *
 * Detailseiten bestehen aus einem Dutzend Abschnitten. Ohne eigene Fläche
 * lesen sie sich als ein einziger Strom, in dem alles gleich viel wiegt —
 * Überschriften allein tragen diese Gliederung nicht.
 *
 * `fussnote` steht für die Einordnung, die fast jede Liste braucht: woher die
 * Angabe stammt, worauf sich eine Entfernung bezieht. Sie gehört unter die
 * Liste und nicht in die Überschrift, wird aber oft vergessen — deshalb ist
 * sie hier ein eigener Platz.
 */
export default function Block({
  titel,
  einleitung,
  fussnote,
  klasse = "",
  children,
}: {
  titel: string;
  einleitung?: string;
  fussnote?: React.ReactNode;
  /** Nur für Seiten, die ihre Abstände noch selbst setzen. */
  klasse?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-line bg-card p-5 sm:p-6 ${klasse}`}>
      <h2 className="text-lg font-semibold tracking-tight">{titel}</h2>
      {einleitung && <p className="mt-1 text-sm text-muted">{einleitung}</p>}
      <div className="mt-4">{children}</div>
      {fussnote && <p className="mt-4 text-sm text-muted">{fussnote}</p>}
    </section>
  );
}
