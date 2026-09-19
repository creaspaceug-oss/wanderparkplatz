import type { Preisstand } from "@/lib/amazon";

/**
 * Verweis zu Amazon, gekennzeichnet und entwertet.
 *
 * Drei Dinge, die nicht verhandelbar sind:
 *
 * `rel="sponsored"` — Google verlangt die Auszeichnung für bezahlte Verweise.
 * Ohne sie gilt der Link als gekaufte Empfehlung, und das trifft nicht den
 * Link, sondern die ganze Domain.
 *
 * Die Kennzeichnung steht am Verweis, nicht im Seitenfuß. Ein Sammelhinweis
 * ganz unten reicht nach deutscher Rechtsprechung nicht; erkennbar sein muss
 * es dort, wo geklickt wird.
 *
 * Der Preis trägt seinen Abrufzeitpunkt. Amazon verlangt das ausdrücklich, und
 * es ist ohnehin das Ehrlichere — zwischen Abruf und Klick können Stunden
 * liegen.
 *
 * `knapp` für Karten: gleiche Kennzeichnung, kürzerer Hinweistext. Die
 * ausführliche Erklärung zur Provision steht einmal oben auf der Seite.
 */
export default function Affiliatelink({
  url,
  preis,
  name,
  knapp,
}: {
  url: string;
  preis?: Preisstand;
  /** Produktname, für die Vorlesehilfe — "bei Amazon ansehen" allein sagt nichts. */
  name: string;
  knapp?: boolean;
}) {
  const ziel = preis?.url ?? url;
  if (!ziel) return null;

  const zeit = preis?.abgerufen
    ? new Date(preis.abgerufen).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Berlin",
      })
    : null;

  return (
    <div className="mt-3">
      <a
        href={ziel}
        rel="sponsored nofollow noopener"
        target="_blank"
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 dark:text-background"
      >
        {preis?.anzeige ? `${preis.anzeige} bei Amazon` : "Bei Amazon ansehen"}
        <span className="sr-only">— {name}, Anzeige, Verweis mit Partnerkennung</span>
        <span aria-hidden>→</span>
      </a>
      <p className="mt-1.5 text-xs leading-snug text-muted">
        <strong className="font-medium">Anzeige</strong>
        {knapp
          ? zeit
            ? ` · Preis vom ${zeit} Uhr, kann sich geändert haben`
            : " · Verweis mit Partnerkennung"
          : ` — Verweis mit Partnerkennung. Kaufst du darüber, bekommen wir eine Provision, für dich ändert sich am Preis nichts.${zeit ? ` Preis abgerufen am ${zeit} Uhr, Änderungen seitdem möglich.` : ""}`}
      </p>
    </div>
  );
}
