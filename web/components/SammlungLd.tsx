import { jsonLd } from "@/lib/format";
import { SITE } from "@/lib/site";

/**
 * CollectionPage-Auszeichnung für Seiten, die eine Auswahl von Parkplätzen
 * zusammenstellen: Kreise, Bundesländer, Orte.
 *
 * Ziel- und Wegseiten tragen das längst, die Regionsseiten nicht — dabei
 * sind gerade sie Sammlungen im Wortsinn. `about` benennt, worum es geht:
 * bei einer Verwaltungseinheit ein AdministrativeArea, bei einem Ort ein
 * Place. Ohne diesen Bezug bliebe die Auszeichnung eine leere Hülle.
 *
 * Bewusst ohne itemListElement: Eine Liste von bis zu 400 Einträgen
 * aufzuzählen bläht die Seite auf und bringt nichts, was die Verweise im
 * Text nicht schon sagen.
 */
export default function SammlungLd({
  name,
  pfad,
  art,
  ueber,
  anzahl,
  lat,
  lon,
}: {
  /** Name der Sammlung, etwa "Wanderparkplätze im Landkreis Güstrow". */
  name: string;
  /** Pfad der Seite, mit führendem Schrägstrich. */
  pfad: string;
  art: "AdministrativeArea" | "Place";
  /** Name des Gegenstands, also der Region selbst. */
  ueber: string;
  anzahl: number;
  lat?: number | null;
  lon?: number | null;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLd({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name,
        url: `${SITE}${pfad}`,
        about: {
          "@type": art,
          name: ueber,
          ...(lat != null && lon != null
            ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lon } }
            : {}),
        },
        // Der Name der Sammlung steht schon oben; hier zählt nur die Menge.
        // "Wanderparkplätze Der Landkreis Reutlingen" wäre kein Deutsch, und
        // den Namen zu beugen geht bei beliebigen Regionen nicht zuverlässig.
        mainEntity: {
          "@type": "ItemList",
          name,
          numberOfItems: anzahl,
        },
      })}
    />
  );
}
