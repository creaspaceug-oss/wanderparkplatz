/**
 * Tabelle harter Angaben für die Seitenspalte.
 *
 * Leere Werte fallen heraus, statt als "unbekannt" eine Zeile zu belegen:
 * In OpenStreetMap heißt ein fehlender Eintrag "niemand hat nachgesehen".
 * Eine Zeile "Toilette: unbekannt" sähe nach Information aus und wäre keine.
 */
export default function Faktenkarte({
  titel = "Daten",
  eintraege,
  hinweis,
}: {
  titel?: string;
  eintraege: [string, React.ReactNode][];
  hinweis?: React.ReactNode;
}) {
  const belegt = eintraege.filter(([, v]) => v != null && v !== "");
  if (!belegt.length) return null;

  return (
    <section className="rounded-xl border border-line bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">{titel}</h2>
      <dl className="mt-3 text-sm">
        {belegt.map(([label, wert]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-line py-2.5">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium">{wert}</dd>
          </div>
        ))}
      </dl>
      {hinweis && <div className="mt-4 text-sm text-muted">{hinweis}</div>}
    </section>
  );
}
