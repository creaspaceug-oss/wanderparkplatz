import Link from "next/link";

/**
 * Verweis vom Verzeichnis in den Ausrüstungsteil.
 *
 * Die Parkplatz-, Wege- und Kreisseiten tragen bewusst keine Partnerverweise.
 * Dieser Hinweis führt deshalb auf Packliste, Hüttentour oder Winterwandern —
 * Seiten, die selbst keine Partnerverweise tragen; die stehen erst auf den
 * Vergleichen dahinter. So bekommt der Ausrüstungsteil interne Verweise, ohne
 * dass Werbung ins Verzeichnis wandert.
 *
 * Welcher Hinweis erscheint, entscheiden die Daten der Seite: Ein Fernwanderweg
 * bekommt die Hüttentour, ein Landkreis mit Gipfeln über 1.300 Metern das
 * Winterwandern, alles andere die allgemeine Packliste.
 */
export default function AusruestungHinweis({
  titel = "Vor der Tour",
  text = "Was in den Rucksack gehört, hat der Deutsche Alpenverein zusammengestellt. Unsere Packliste folgt ihr und lässt sich für Tagestour, Hüttentour und Winter abhaken.",
  href = "/ausruestung#packliste",
  verweis = "Zur Packliste",
}: {
  titel?: string;
  text?: string;
  href?: string;
  verweis?: string;
}) {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-lg font-semibold">{titel}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
      <Link
        href={href}
        className="mt-3 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
      >
        {verweis}
      </Link>
    </section>
  );
}
