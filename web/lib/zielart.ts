/** Zielarten in lesbarem Deutsch, mit korrektem Artikel für Fließtext. */
export const ZIELART: Record<
  string,
  { titel: string; artikel: string; plural: string }
> = {
  gipfel: { titel: "Gipfel", artikel: "der", plural: "Gipfel" },
  burg: { titel: "Burg oder Ruine", artikel: "die", plural: "Burgen und Ruinen" },
  wasserfall: { titel: "Wasserfall", artikel: "der", plural: "Wasserfälle" },
  hoehle: { titel: "Höhle", artikel: "die", plural: "Höhlen" },
  turm: { titel: "Aussichtsturm", artikel: "der", plural: "Aussichtstürme" },
  aussicht: { titel: "Aussichtspunkt", artikel: "der", plural: "Aussichtspunkte" },
};

export const zielTitel = (art: string) => ZIELART[art]?.titel ?? "Wanderziel";
