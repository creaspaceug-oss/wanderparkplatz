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
 */
export default function Affiliatelink({
  url,
  preis,
  name,
}: {
  url: string;
  preis?: Preisstand;
  /** Produktname, für die Vorlesehilfe — "bei Amazon ansehen" allein sagt nichts. */
  name: string;
}) {
  const zeit = preis?.abgerufen
    ? new Date(preis.abgerufen).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Berlin",
      })
    : null;

  return (
    <div className="mt-4">
      <a
        href={preis?.url ?? url}
        rel="sponsored nofollow noopener"
        target="_blank"
        className="inline-flex items-center gap-2 rounded-lg border border-accent bg-accent-soft px-4 py-2 text-sm font-medium hover:border-foreground"
      >
        {preis?.anzeige ? `${preis.anzeige} bei Amazon` : "Bei Amazon ansehen"}
        <span className="sr-only">— {name}, Anzeige, Verweis mit Partnerkennung</span>
        <span aria-hidden>→</span>
      </a>
      <p className="mt-1.5 text-xs text-muted">
        <strong className="font-medium">Anzeige.</strong> Verweis mit Partnerkennung — kaufst du
        darüber, bekommen wir eine Provision, für dich ändert sich am Preis nichts.
        {zeit && ` Preis abgerufen am ${zeit} Uhr, Änderungen seitdem sind möglich.`}
        {preis?.uvp && preis.betrag && preis.uvp > preis.betrag
          ? ` Herstellerangabe: ${preis.uvp.toFixed(2).replace(".", ",")} €.`
          : ""}
      </p>
    </div>
  );
}
