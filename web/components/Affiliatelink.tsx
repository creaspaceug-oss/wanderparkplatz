import { PREISHINWEIS, type Preisstand } from "@/lib/amazon";

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
 * Neben jedem Preis steht sein Zeitpunkt, und zwar für Preis UND
 * Verfügbarkeit — so verlangt es Amazon wörtlich. Der volle Wortlaut steht im
 * title-Attribut und einmal ausgeschrieben unter der Übersicht.
 *
 * Die Ersparnis gegenüber der UVP erscheint nur, wenn Amazon sie im selben
 * Abruf liefert. Eigene Rabattangaben sind nach den Programmbedingungen nicht
 * erlaubt, und sie wären ohnehin die unzuverlässigste Zahl auf der Seite.
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
  const rabatt = preis?.ersparnis && preis.ersparnis >= 5 ? preis.ersparnis : null;

  return (
    <div className="mt-3">
      <a
        href={ziel}
        rel="sponsored nofollow noopener"
        target="_blank"
        className="group inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:shadow-md hover:brightness-110 dark:text-background"
      >
        {preis?.anzeige ? (
          <>
            <span className="tabular-nums">{preis.anzeige}</span>
            <span className="font-normal opacity-90">bei Amazon</span>
          </>
        ) : (
          "Bei Amazon ansehen"
        )}
        <span className="sr-only">— {name}, Anzeige, Verweis mit Partnerkennung</span>
        <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
      </a>
      {rabatt && (
        <span className="ml-2 inline-block rounded-md bg-warn-soft px-1.5 py-0.5 align-middle text-xs font-semibold text-warn">
          −{rabatt} % zur UVP
        </span>
      )}
      <p className="mt-1.5 text-xs leading-snug text-muted" title={PREISHINWEIS}>
        <strong className="font-medium">Anzeige</strong>
        {zeit
          ? ` · Preis und Verfügbarkeit: Stand ${zeit} Uhr`
          : " · Verweis mit Partnerkennung"}
        {!knapp &&
          " — kaufst du darüber, bekommen wir eine Provision, für dich ändert sich am Preis nichts."}
      </p>
    </div>
  );
}
