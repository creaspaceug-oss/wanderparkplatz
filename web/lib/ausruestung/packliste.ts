/**
 * Packliste für Wanderungen.
 *
 * Grundlage ist die Packliste des Deutschen Alpenvereins für Frühjahrstouren
 * (zuletzt geändert am 18.03.2026, erstellt mit Globetrotter). Sie gilt hier
 * als Basis für jede Tour; was nur für bestimmte Touren nötig ist, trägt eine
 * eigene Markierung. Punkte, die nicht aus der DAV-Liste stammen, sind als
 * Ergänzung gekennzeichnet — so bleibt erkennbar, was belegt ist und was
 * unsere eigene Zutat.
 */

export type Tour = "tag" | "huette" | "winter";

export const TOUR_NAME: Record<Tour, string> = {
  tag: "Tagestour",
  huette: "Hüttentour, mehrtägig",
  winter: "Winter und Schnee",
};

export interface Posten {
  name: string;
  /** Der Zusatz, den der DAV zum Punkt nennt — oder unsere Begründung. */
  hinweis?: string;
  /** Unsere Vergleichsseite dazu, falls es eine gibt. */
  pfad?: string;
  /** Für welche Touren der Punkt gilt. */
  touren: Tour[];
  /** Steht so nicht in der DAV-Liste. */
  ergaenzt?: boolean;
}

export interface Gruppe {
  titel: string;
  posten: Posten[];
}

export const PACKLISTE: Gruppe[] = [
  {
    titel: "Im Rucksack",
    posten: [
      { name: "Rucksack", hinweis: "20 bis 30 Liter, mit Regenhülle", pfad: "/ausruestung/wanderrucksack", touren: ["tag", "winter"] },
      { name: "Rucksack, größer", hinweis: "Für mehrere Tage reicht ein Tagesrucksack selten", pfad: "/ausruestung/wanderrucksack", touren: ["huette"], ergaenzt: true },
      { name: "Biwaksack oder Rettungsdecke", hinweis: "möglichst leicht", pfad: "/ausruestung/erste-hilfe-set", touren: ["tag", "huette", "winter"] },
      { name: "Erste-Hilfe-Set", pfad: "/ausruestung/erste-hilfe-set", touren: ["tag", "huette", "winter"] },
      { name: "Blasenpflaster", touren: ["tag", "huette", "winter"] },
      { name: "Stirnlampe", hinweis: "Schafft Sicherheitsspielräume, wenn es früh dunkel wird", pfad: "/ausruestung/stirnlampe", touren: ["tag", "huette", "winter"] },
      { name: "Wanderkarte", hinweis: "Maßstab 1:25.000", touren: ["tag", "huette", "winter"] },
      { name: "Wasserflasche oder Trinkblase", hinweis: "je nach Länge der Tour", pfad: "/ausruestung/trinkblase", touren: ["tag", "huette", "winter"] },
      { name: "Brotzeit", hinweis: "Box mit Snacks oder Brotzeit", touren: ["tag", "huette", "winter"] },
      { name: "Mülltüte", touren: ["tag", "huette", "winter"] },
      { name: "Sonnencreme", hinweis: "mindestens Lichtschutzfaktor 30", touren: ["tag", "huette", "winter"] },
      { name: "Sonnenbrille", touren: ["tag", "huette", "winter"] },
      { name: "Geldbeutel", hinweis: "mit DAV-Ausweis, Pass, Versichertenkarte und Bargeld", touren: ["tag", "huette", "winter"] },
      { name: "Handy", touren: ["tag", "huette", "winter"] },
      { name: "Taschenmesser", touren: ["tag", "huette", "winter"] },
      { name: "Wanderstöcke", pfad: "/ausruestung/wanderstoecke", touren: ["tag", "huette", "winter"] },
      { name: "Thermo-Sitzkissen", hinweis: "beim DAV als „ggf.“ geführt", touren: ["tag", "winter"] },
      { name: "Grödel", hinweis: "Wie Schneeketten für den Schuh — keine Steigeisen", pfad: "/ausruestung/groedel", touren: ["winter"] },
      { name: "Hüttenschlafsack", hinweis: "Auf bewirtschafteten Hütten verlangt", pfad: "/ausruestung/huettenschlafsack", touren: ["huette"], ergaenzt: true },
      { name: "Wasserfilter", hinweis: "Nur wenn unterwegs aus Quellen oder Bächen geschöpft wird", pfad: "/ausruestung/wasserfilter", touren: ["huette"], ergaenzt: true },
      { name: "Ersatzwäsche", hinweis: "Mehrere Tage ohne Waschmaschine", touren: ["huette"], ergaenzt: true },
    ],
  },
  {
    titel: "Am Körper",
    posten: [
      { name: "Hohe Bergschuhe", hinweis: "Regelmäßig nachimprägnieren, am besten ohne Fluorkarbone", pfad: "/ausruestung/schuhe-impraegnieren", touren: ["tag", "huette", "winter"] },
      { name: "Wandersocken", pfad: "/ausruestung/wandersocken", touren: ["tag", "huette", "winter"] },
      { name: "Ersatzsocken", hinweis: "Nasse Füße sind anfälliger für Blasen", pfad: "/ausruestung/wandersocken", touren: ["huette", "winter"], ergaenzt: true },
      { name: "T-Shirt", touren: ["tag", "huette", "winter"] },
      { name: "Funktions-Pulli", touren: ["tag", "huette", "winter"] },
      { name: "Tourenhose", touren: ["tag", "huette", "winter"] },
      { name: "Unterwäsche", touren: ["tag", "huette", "winter"] },
      { name: "Regenjacke", hinweis: "wasserdicht und atmungsaktiv", pfad: "/ausruestung/regenjacke", touren: ["tag", "huette", "winter"] },
      { name: "Regenhose", hinweis: "Die untere Hälfte des Regenschutzes", pfad: "/ausruestung/regenhose", touren: ["huette", "winter"], ergaenzt: true },
      { name: "Warme Jacke", hinweis: "Daune oder Kunstfaser, am besten winddicht", touren: ["tag", "huette", "winter"] },
      { name: "Handschuhe", hinweis: "winddicht und wasserabweisend", touren: ["tag", "huette", "winter"] },
      { name: "Mütze", hinweis: "Kommt beim DAV beim Packen ganz nach oben", touren: ["tag", "huette", "winter"] },
      { name: "Gamaschen", hinweis: "Damit die Hosenbeine im Schnee nicht nass werden", pfad: "/ausruestung/gamaschen", touren: ["winter"] },
    ],
  },
];

export const QUELLEN = {
  davPackliste:
    "https://www.alpenverein.de/artikel/packliste-fur-wanderungen-im-fruhjahr_c1c01d77-76a2-49bf-84f0-e5784bc546d9",
  davOutfit: "https://www.alpenverein.de/artikel/das-richtige-wanderoutfit_cff0a90c-1323-40b0-ae4d-7247a313c845",
};

/** Die Packregeln des DAV, von unten nach oben. */
export const PACKEN: { titel: string; text: string }[] = [
  {
    titel: "Schweres an den Rücken",
    text: "Wasser oder Seil möglichst nah an den Rücken. Je weiter hinten schwere Dinge liegen, desto mehr muss die Bauchmuskulatur ausgleichen. Trinkblasen sitzen dafür ideal: direkt am Rückenteil.",
  },
  {
    titel: "Unten, was du hoffentlich nicht brauchst",
    text: "Biwaksack und Erste-Hilfe-Set kommen ganz nach unten.",
  },
  {
    titel: "Leichtes nach vorn und an die Seiten",
    text: "Ersatzwäsche und Jacken. Den Rucksack dabei seitengleich packen, sonst zieht er in eine Richtung.",
  },
  {
    titel: "Oben, was du wahrscheinlich brauchst",
    text: "Mütze, Handschuhe und Brotzeit. Kleinkram wie Karte, Sonnenbrille und Geldbörse ins Deckelfach oder in die Außenfächer.",
  },
];
