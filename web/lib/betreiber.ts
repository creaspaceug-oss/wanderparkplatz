/** Angaben des Anbieters nach § 5 DDG. Eine Quelle für Impressum,
 *  Datenschutzerklärung und die Organization-Auszeichnung. */
export const BETREIBER = {
  name: "WU Socialmedia GbR",
  strasse: "Bonländer Hauptstraße 34",
  plz: "70794",
  ort: "Aichtal",
  land: "Deutschland",
  landCode: "DE",
  email: "info@wu-socialmedia.de",
} as const;

export const ANSCHRIFT_EINZEILIG = `${BETREIBER.strasse}, ${BETREIBER.plz} ${BETREIBER.ort}`;
