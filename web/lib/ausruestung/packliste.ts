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
      { name: "Hohe Bergschuhe", hinweis: "Die Kategorie folgt dem Gelände", pfad: "/ausruestung/wanderschuhe", touren: ["tag", "huette", "winter"] },
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

/**
 * Packliste für die Hüttenübernachtung.
 *
 * Nach der Liste des DAV (Artikel „Packliste für die Hüttenübernachtung“,
 * 10.07.2025), in deren eigener Gliederung. Ergänzungen von uns sind als
 * solche markiert, damit erkennbar bleibt, was belegt ist.
 */
export const HUETTENLISTE: Gruppe[] = [
  {
    titel: "Für die Übernachtung",
    posten: [
      { name: "Hüttenschlafsack", hinweis: "Auf Alpenvereinshütten verlangt", pfad: "/ausruestung/huettenschlafsack", touren: ["huette"] },
      { name: "Stirn- oder Taschenlampe", hinweis: "Falls man nachts aufstehen muss", pfad: "/ausruestung/stirnlampe", touren: ["huette"] },
      { name: "Ohrstöpsel", hinweis: "Für eine ruhige Nacht im Lager", touren: ["huette"] },
      { name: "DAV-Ausweis", touren: ["huette"] },
      { name: "Hütten- oder Hausschuhe", touren: ["huette"] },
      { name: "Kleines Handtuch", hinweis: "Mikrofaser: klein, leicht, trocknet schnell", touren: ["huette"] },
      { name: "Waschbeutel", hinweis: "Zahnbürste, Zahnpasta, kleine Seife, Deo", touren: ["huette"] },
    ],
  },
  {
    titel: "Wanderausrüstung",
    posten: [
      { name: "Stabile Wanderschuhe", hinweis: "Mit Profilsohle", pfad: "/ausruestung/wanderschuhe", touren: ["huette"] },
      { name: "Rucksack", hinweis: "Je nach Länge der Tour 30 bis 40 Liter", pfad: "/ausruestung/wanderrucksack", touren: ["huette"] },
      { name: "Regenhülle für den Rucksack", touren: ["huette"] },
      { name: "Wanderstöcke", hinweis: "Kein Muss, aber entlastend", pfad: "/ausruestung/wanderstoecke", touren: ["huette"] },
      { name: "Karte", touren: ["huette"] },
    ],
  },
  {
    titel: "Verpflegung",
    posten: [
      { name: "Trink- oder Thermosflasche", hinweis: "Idealerweise mindestens 2 Liter", pfad: "/ausruestung/trinkblase", touren: ["huette"] },
      { name: "Brotzeitdose", touren: ["huette"] },
      { name: "Proviant", hinweis: "Müsliriegel, Nüsse", touren: ["huette"] },
      { name: "Kleine Müllbeutel", hinweis: "Alles wieder mit ins Tal nehmen", touren: ["huette"] },
      { name: "Wasserfilter", hinweis: "Nur, wenn unterwegs aus Quellen geschöpft wird", pfad: "/ausruestung/wasserfilter", touren: ["huette"], ergaenzt: true },
    ],
  },
  {
    titel: "Gesundheit und Erste Hilfe",
    posten: [
      { name: "Erste-Hilfe-Set", pfad: "/ausruestung/erste-hilfe-set", touren: ["huette"] },
      { name: "Biwaksack", pfad: "/ausruestung/erste-hilfe-set", touren: ["huette"] },
      { name: "Medikamente", hinweis: "Nach Bedarf", touren: ["huette"] },
      { name: "Sonnenschutz", hinweis: "Kopfbedeckung, Creme und Brille", touren: ["huette"] },
      { name: "Blasenpflaster", touren: ["huette"] },
    ],
  },
  {
    titel: "Kleidung",
    posten: [
      { name: "Funktionsunterwäsche", touren: ["huette"] },
      { name: "Strapazierfähige Berghose", touren: ["huette"] },
      { name: "Regendichte Jacke", pfad: "/ausruestung/regenjacke", touren: ["huette"] },
      { name: "Regenhose", pfad: "/ausruestung/regenhose", touren: ["huette"], ergaenzt: true },
      { name: "Mütze und Handschuhe", touren: ["huette"] },
      { name: "Wandersocken", pfad: "/ausruestung/wandersocken", touren: ["huette"] },
      { name: "Wechselwäsche", hinweis: "Je nach Länge der Tour", touren: ["huette"] },
      { name: "Bequeme Kleidung für die Hütte", touren: ["huette"] },
    ],
  },
  {
    titel: "Sonstiges",
    posten: [
      { name: "Ausreichend Bargeld", hinweis: "Viele Hütten können nicht elektronisch abrechnen — kein Netz, kein Strom", touren: ["huette"] },
      { name: "Pass und Versicherungsausweis", touren: ["huette"] },
      { name: "Handy und Ladegerät oder Powerbank", touren: ["huette"] },
    ],
  },
];

/** Die Winterausrüstung, die der DAV über die Standardausrüstung hinaus nennt. */
export const WINTERLISTE: Gruppe[] = [
  {
    titel: "Zusätzlich im Winter",
    posten: [
      { name: "Grödel oder Spikes", hinweis: "Alternativ Leichtsteigeisen — gegen vereiste Passagen", pfad: "/ausruestung/groedel", touren: ["winter"] },
      { name: "Gamaschen", hinweis: "Gegen Schnee im Schuh und nasse Hosenbeine", pfad: "/ausruestung/gamaschen", touren: ["winter"] },
      { name: "Wanderstöcke", pfad: "/ausruestung/wanderstoecke", touren: ["winter"] },
      { name: "Mütze und Handschuhe", touren: ["winter"] },
      { name: "Isolierende Bekleidungsschicht", touren: ["winter"] },
      { name: "Thermoskanne mit heißem Getränk", touren: ["winter"] },
      { name: "Stirn- oder Taschenlampe", hinweis: "Muss mit — die Tage sind kurz", pfad: "/ausruestung/stirnlampe", touren: ["winter"] },
    ],
  },
  {
    titel: "Standardausrüstung, die mitgeht",
    posten: [
      { name: "Biwaksack", pfad: "/ausruestung/erste-hilfe-set", touren: ["winter"] },
      { name: "Erste-Hilfe-Set", pfad: "/ausruestung/erste-hilfe-set", touren: ["winter"] },
      { name: "Feste Wanderschuhe", hinweis: "Kategorie B aufwärts, Profilsohle", pfad: "/ausruestung/wanderschuhe", touren: ["winter"] },
      { name: "Wandersocken", pfad: "/ausruestung/wandersocken", touren: ["winter"] },
      { name: "Regenjacke oder Hardshell", pfad: "/ausruestung/regenjacke", touren: ["winter"] },
      { name: "Rucksack", pfad: "/ausruestung/wanderrucksack", touren: ["winter"] },
      { name: "Karte", touren: ["winter"] },
    ],
  },
];

export const QUELLEN_HUB = {
  davHuette:
    "https://www.alpenverein.de/artikel/packliste-fur-die-huettenuebernachtung_cd3016db-6a2d-44c0-a5d5-90a750eaa056",
  davWinter: "https://www.alpenverein.de/artikel/sicher-winterwandern_30fdf4a8-1d26-4efc-a0fb-f28db05b8113",
};
