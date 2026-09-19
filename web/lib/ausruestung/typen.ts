/**
 * Was jede Ausrüstungsseite über ein Produkt wissen muss.
 *
 * Die Bausteine kennen nur diese Form. Jede Produktgruppe bringt eigene
 * Merkmale mit — Stöcke haben einen Verschluss, Trinkblasen eine Öffnung —
 * und übersetzt sie in `eckdaten` und `kurz`. So teilen sich alle Seiten
 * dieselbe Übersicht, denselben Bericht und dieselben Kaufknöpfe, und eine
 * Korrektur an einem Baustein gilt überall.
 */
export interface Produkt {
  asin: string;
  name: string;
  marke: string;
  /** Kurzes Etikett für Übersicht und Bericht. */
  abzeichen?: string;
  /** Wofür dieses Produkt die richtige Wahl ist — ein Satz, keine Werbung. */
  rolle: string;
  /** Zwei, drei Sätze Einordnung, bevor die Listen kommen. */
  einordnung: string;
  /** Merkmal und Wert für den Bericht. Fehlt eine Angabe, steht das als Wert da. */
  eckdaten: [string, string][];
  /** Eine Zeile für die Übersicht, etwa "Teleskopstock · Aluminium · 277 g". */
  kurz: string;
  /**
   * Die dritte Spalte der Übersicht — bei Stöcken die Warentest-Note, bei
   * Trinkblasen die Art der Öffnung. Gleiche Stelle, jeweils das Merkmal, nach
   * dem in dieser Gruppe zuerst entschieden wird.
   */
  kennwert?: { wert: string; zusatz?: string; unter?: string };
  /** Hinweis-Chip im Bericht, etwa "Stiftung Warentest 1,9 (gut)". */
  siegel?: string;
  dafuer: string[];
  dagegen: string[];
  /** Wer es nicht kaufen sollte. Der wichtigste Satz je Produkt. */
  nichtFuer: string;
}
