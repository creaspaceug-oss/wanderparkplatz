import Link from "next/link";

/**
 * Verweis vom Verzeichnis auf die Packliste.
 *
 * Die Parkplatz- und Wegeseiten tragen bewusst keine Partnerverweise. Dieser
 * Hinweis führt deshalb auf die Packliste im Ausrüstungsteil — die Seite
 * selbst enthält keine Partnerverweise, erst die Vergleiche dahinter. So
 * bekommt der Ausrüstungsteil interne Verweise, ohne dass Werbung ins
 * Verzeichnis wandert.
 */
export default function PacklisteHinweis() {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-lg font-semibold">Vor der Tour</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Was in den Rucksack gehört, hat der Deutsche Alpenverein zusammengestellt. Unsere Packliste
        folgt ihr und lässt sich für Tagestour, Hüttentour und Winter abhaken.
      </p>
      <Link
        href="/ausruestung#packliste"
        className="mt-3 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
      >
        Zur Packliste
      </Link>
    </section>
  );
}
