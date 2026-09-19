import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Wandersocken-Vergleich — von Hand zusammengestellt.
 *
 * Socken unterscheiden sich in Polsterung, Material und Passform; welche
 * passt, hängt am Schuh. Falke ordnet seine Socken ausdrücklich Schuh-
 * kategorien zu (TK5 für Kategorie A, TK2 für A–B), daran orientiert sich
 * der Sockenfinder. Alle Angaben aus den Herstellertexten zum Artikel,
 * Größen einzeln, weil jede bei Amazon eine eigene ASIN hat.
 *
 * Einen Test von Wandersocken hat die Stiftung Warentest nicht veröffentlicht;
 * sie berichtete 2024 über einen Schweizer Test von Sport- und Laufsocken.
 */

export type Polster = "leicht" | "mittel" | "stark";

export interface SockenGroesse {
  k: string;
  asin: string;
  /** Schuhgrößen von–bis, wenn im Angebot genannt. */
  von?: number;
  bis?: number;
  damen?: boolean;
}

export interface Socke {
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  polster: Polster;
  material: string;
  /** Merino-Anteil in Prozent, falls angegeben. */
  merino: number | null;
  schuh: string;
  waschen: string | null;
  garantie: string | null;
  groessen: SockenGroesse[];
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const SOCKEN: Socke[] = [
  {
    name: "TK2 Explore",
    marke: "Falke",
    abzeichen: "Unsere erste Wahl",
    rolle: "Die Wandersocke für den normalen Wanderschuh — links und rechts verschieden gestrickt.",
    einordnung:
      "Falke ordnet die TK2 dem Mittelgebirge und Wanderschuhen der Kategorien A bis B zu, also genau dem, was die meisten tragen. Wolle und Funktionsfaser, eine dreilagige Sohle, die Feuchtigkeit aufnimmt, mittelstarke Polsterung an den Belastungszonen und eine flache Zehennaht. Die Besonderheit: Linke und rechte Socke sind nach der Anatomie des jeweiligen Fußes gestrickt, für Damen und Herren getrennt. Bei Zwischengrößen empfiehlt Falke die kleinere.",
    polster: "mittel",
    material: "Wolle (Merino) mit Funktionsfaser",
    merino: null,
    schuh: "Kategorie A–B",
    waschen: null,
    garantie: null,
    groessen: [
      { k: "39–41", asin: "B001E2IWPI", von: 39, bis: 41 },
      { k: "42–43", asin: "B001E2IWQ2", von: 42, bis: 43 },
      { k: "44–45", asin: "B001MAEGCU", von: 44, bis: 45 },
      { k: "46–48", asin: "B001MAGCR2", von: 46, bis: 48 },
      { k: "37–38", asin: "B001MAFX54", von: 37, bis: 38, damen: true },
      { k: "39–40", asin: "B0027ATJ5I", von: 39, bis: 40, damen: true },
      { k: "41–42", asin: "B001MAJP1M", von: 41, bis: 42, damen: true },
    ],
    dafuer: [
      "Links und rechts anatomisch gestrickt, für Damen und Herren eigene Passformen.",
      "Falke nennt die Schuhkategorie, für die sie gemacht ist: A bis B.",
      "Flache Zehennaht gegen Druckstellen, dreilagige Sohle gegen Feuchtigkeit.",
      "Viele Größen, die Schuhgröße steht im Angebot.",
    ],
    dagegen: [
      "Den Merino-Anteil nennt das Angebot nicht.",
      "Keine Waschtemperatur im Angebot.",
      "Für schwere Bergstiefel ist die Polsterung mittelstark — dort sind dickere Socken üblich.",
    ],
    nichtFuer: "Leichte Halbschuhe im Sommer. Dafür ist die TK5 gemacht.",
  },
  {
    name: "TK5 Wander",
    marke: "Falke",
    abzeichen: "Für leichte Schuhe",
    rolle: "Die dünne Schwester für Halbschuhe, Sommer und Städtetrip.",
    einordnung:
      "Gleiche Bauart wie die TK2 — Wolle und Funktionsfaser, dreilagige Sohle, flache Zehennaht, links und rechts anatomisch —, aber mit leichter Polsterung. Falke ordnet sie Freizeitwanderungen in flachem Gelände und Multifunktionsschuhen der Kategorie A zu. Wer im Sommer in Trailrunnern oder leichten Wanderschuhen unterwegs ist, hat mit einer dicken Socke nur einen warmen Fuß mehr.",
    polster: "leicht",
    material: "Wolle (Merino) mit Funktionsfaser",
    merino: null,
    schuh: "Kategorie A",
    waschen: null,
    garantie: null,
    groessen: [
      { k: "Herren", asin: "B004FQ1DZQ" },
      { k: "37–38", asin: "B004FPXJKY", von: 37, bis: 38, damen: true },
      { k: "39–40", asin: "B004FQ1E6O", von: 39, bis: 40, damen: true },
    ],
    dafuer: [
      "Leicht gepolstert: kühler im Sommer, passt in schmale Schuhe.",
      "Dieselbe anatomische Passform wie die TK2.",
      "Für Halbschuhe, Trailrunner und Multifunktionsschuhe gedacht.",
    ],
    dagegen: [
      "Wenig Dämpfung für lange Abstiege mit schwerem Rucksack.",
      "Beim Herrenmodell wählt man die Größe erst auf der Amazon-Seite.",
    ],
    nichtFuer: "Feste Wanderstiefel und Winter.",
  },
  {
    name: "Hiker Micro Crew",
    marke: "Darn Tough",
    abzeichen: "Garantie auf Lebenszeit",
    rolle: "Die Socke für Leute, die keine Socken mehr kaufen wollen.",
    einordnung:
      "Darn Tough aus Vermont gibt auf diese Socke eine Garantie auf Lebenszeit, ohne Bedingungen. 61 Prozent Merinowolle, 36 Prozent Nylon, 3 Prozent Elasthan, fein gestrickt, mittlere Polsterung unter dem Fuß, nahtlos verschlossene Spitze. Die Micro-Crew-Höhe reicht knapp über den Rand eines normalen Wanderschuhs. Dass Haltbarkeit bei Socken keine Selbstverständlichkeit ist, zeigte ein Schweizer Test von Sportsocken: Drei von zehn scheuerten durch.",
    polster: "mittel",
    material: "61 % Merino, 36 % Nylon, 3 % Elasthan",
    merino: 61,
    schuh: "Wanderschuh",
    waschen: null,
    garantie: "lebenslang laut Hersteller",
    groessen: [
      { k: "Herren", asin: "B000XFW6OU" },
      { k: "Damen, 2 Paar, L", asin: "B0DN6RVDSL", damen: true },
    ],
    dafuer: [
      "Garantie auf Lebenszeit — die weitestgehende hier.",
      "61 % Merino, der höchste angegebene Anteil in diesem Vergleich.",
      "Nahtlose Spitze, feiner Strick.",
    ],
    dagegen: [
      "Die teuerste Socke pro Paar.",
      "Micro Crew reicht laut Hersteller knapp über einen normalen Wanderschuh — für hohe Stiefel eher zu kurz.",
      "Größen wählt man erst auf der Amazon-Seite.",
    ],
    nichtFuer: "Hohe Bergstiefel. Dafür braucht es eine höhere Socke.",
  },
  {
    name: "Hike Midweight Merino Performance",
    marke: "Bridgedale",
    abzeichen: "Wolle und Merino",
    rolle: "Mittelschwer, für Stiefel — mit weniger Merino, als der Name vermuten lässt.",
    einordnung:
      "Bridgedale nennt die Zusammensetzung genau: 38 Prozent Nylon, 26 Prozent Wolle, 18 Prozent Merinowolle, 17 Prozent Polypropylen, 1 Prozent Elasthan. „Merino“ im Namen heißt also 18 Prozent Merino — zusammen mit der anderen Wolle 44 Prozent. Die Höhe heißt bei Bridgedale „Boot“, die Socke ist also für Stiefel gedacht.",
    polster: "mittel",
    material: "38 % Nylon, 26 % Wolle, 18 % Merino, 17 % Polypropylen",
    merino: 18,
    schuh: "Wanderstiefel",
    waschen: null,
    garantie: null,
    groessen: [
      { k: "Herren", asin: "B07GR463GV" },
      { k: "Damen M", asin: "B07FGLLMH4", damen: true },
    ],
    dafuer: [
      "Zusammensetzung vollständig angegeben.",
      "Als Stiefelsocke ausgewiesen.",
      "Polstersystem und Feuchtigkeitstransport laut Hersteller.",
    ],
    dagegen: [
      "Nur 18 % Merino, trotz Merino im Namen.",
      "Größen wählt man erst bei Amazon.",
    ],
    nichtFuer: "Wer eine möglichst reine Merinosocke sucht. Dann Darn Tough.",
  },
  {
    name: "Trekking Fibre Tech",
    marke: "Rohner",
    abzeichen: "Für Membranschuhe",
    rolle: "Für Gore-Tex-Schuhe und kalte Tage — mit Plüsch und Isolation.",
    einordnung:
      "Rohner hat die Fibre Tech laut Angebot für Schuhe mit Membranfutter entwickelt. Plüsch im Fußbereich polstert und isoliert, ein weicher Plüsch am Rist schützt vor Druckstellen, die Spitze ist von Hand gekettelt. Rohner nennt als Einsatz Rucksacktouren, Schneeschuhe, Bergtouren — also eher die kühlere und längere Tour.",
    polster: "stark",
    material: "Funktionsfaser mit Plüsch",
    merino: null,
    schuh: "Schuhe mit Membran",
    waschen: null,
    garantie: null,
    groessen: [
      { k: "39–41", asin: "B001EKJBJG", von: 39, bis: 41 },
      { k: "42–44", asin: "B001EKG94Q", von: 42, bis: 44 },
      { k: "47–49", asin: "B006ZHUG3I", von: 47, bis: 49 },
    ],
    dafuer: [
      "Ausdrücklich für Schuhe mit Membran entwickelt.",
      "Plüsch im Fußbereich: gut gepolstert und isolierend.",
      "Handgekettelte Spitze, weicher Rand.",
    ],
    dagegen: [
      "Material und Faseranteile stehen nicht im Angebot.",
      "Für den Hochsommer zu warm.",
      "Größe 45–46 haben wir bei Amazon nicht gefunden.",
    ],
    nichtFuer: "Sommerwanderungen in leichten Schuhen.",
  },
  {
    name: "Merino Wandersocken, 3 Paar",
    marke: "Danish Endurance",
    abzeichen: "Im Dreierpack",
    rolle: "Drei Paar zum Preis von einem Markenpaar — mit Garantie gegen Löcher im ersten Jahr.",
    einordnung:
      "Stark gepolstert von der Ferse bis zu den Zehen, 38 Prozent Merinowolle, 30 Prozent Polyamid, 30 Prozent Acryl, 2 Prozent Elasthan, gefertigt in Portugal. Waschbar bis 40 Grad mit Wollwaschmittel, nicht in den Trockner. Bekommt die Socke im ersten Jahr ein Loch, schickt der Hersteller laut Angebot kostenlos Ersatz.",
    polster: "stark",
    material: "38 % Merino, 30 % Polyamid, 30 % Acryl, 2 % Elasthan",
    merino: 38,
    schuh: "Wanderschuh",
    waschen: "max. 40 °C, Wollwaschmittel",
    garantie: "1 Jahr gegen Löcher",
    groessen: [
      { k: "35–38", asin: "B07D8WQ764", von: 35, bis: 38 },
      { k: "39–42", asin: "B0BV7G33N3", von: 39, bis: 42 },
      { k: "43–47", asin: "B08QRQSWNX", von: 43, bis: 47 },
    ],
    dafuer: [
      "Mehrere Paare — wichtig auf mehrtägigen Touren.",
      "Zusammensetzung, Herkunft und Pflege im Angebot.",
      "Ein Jahr Garantie gegen Löcher.",
    ],
    dagegen: [
      "Nur drei weite Größen, keine Damen- und Herrenpassform.",
      "30 % Acryl.",
    ],
    nichtFuer: "Wer eine genau passende Socke für schmale Füße sucht.",
  },
];

export function standardGroesse(s: Socke): SockenGroesse {
  return (
    s.groessen.find((g) => !g.damen && g.von !== undefined && g.von <= 42 && 42 <= (g.bis ?? 0)) ??
    s.groessen.find((g) => !g.damen) ??
    s.groessen[0]
  );
}

export function alsProdukt(s: Socke): Produkt {
  return {
    asin: standardGroesse(s).asin,
    name: s.name,
    marke: s.marke,
    abzeichen: s.abzeichen,
    rolle: s.rolle,
    einordnung: s.einordnung,
    kurz: [`Polsterung ${s.polster}`, s.merino ? `${s.merino} % Merino` : null].filter(Boolean).join(" · "),
    eckdaten: [
      ["Polsterung", s.polster],
      ["Material", s.material],
      ["Schuh", s.schuh],
      ["Waschen", s.waschen ?? "nicht angegeben"],
      ["Garantie", s.garantie ?? "keine angegeben"],
      ["Größen", s.groessen.map((g) => `${g.damen ? "D " : ""}${g.k}`).join(", ")],
    ],
    kennwert: { wert: s.polster, unter: s.merino ? `${s.merino} % Merino` : "Merino-Anteil k. A." },
    dafuer: s.dafuer,
    dagegen: s.dagegen,
    nichtFuer: s.nichtFuer,
  };
}

export const QUELLEN = {
  warentest: "https://www.test.de/Sportsocken-im-Test-Zwei-schrumpfen-drei-scheuern-durch-6141956-0/",
  davMerino: "https://www.alpenverein.de/artikel/kleidung-aus-merinowolle_2c213388-9e87-463a-a30a-d2552956e10b",
  davSchuhe: "https://www.alpenverein.de/artikel/wanderschuhe_09af809d-88ef-4226-88ac-1aabcf181fac",
  oeavBlasen: "https://www.alpenverein.at/vorarlberg-bezirk-hohenems/archiv/2006_02_16_14748488_blasen.php",
  davEh: "https://www.alpenverein.de/artikel/wie-funktioniert-das-erste-hilfe-sets_71c61d38-aff0-4ab2-9a38-0eeaebb9908b",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Warum Wandersocken statt normaler Socken?",
    antwort:
      "Weil Blasen durch Reibung entstehen und nasse Füße deutlich anfälliger sind, wie der Österreichische Alpenverein schreibt. Wandersocken sind an den Belastungszonen gepolstert, haben flache Nähte und leiten Feuchtigkeit ab. Wer in feuchten Socken läuft, bekommt leichter Blasen — das hielten auch die Tester eines Schweizer Sockentests fest.",
  },
  {
    frage: "Merino oder Kunstfaser?",
    antwort:
      "Merinowolle kann laut DAV bis zu einem Drittel ihres Trockengewichts an Feuchtigkeit aufnehmen, reguliert die Temperatur und riecht weniger schnell. Reine Merinosocken gibt es kaum: Nylon und Elasthan machen Wandersocken haltbar und formstabil. Die meisten mischen deshalb Wolle und Kunstfaser — bei den Socken hier liegt der angegebene Merino-Anteil zwischen 18 und 61 Prozent.",
  },
  {
    frage: "Wie dick sollten Wandersocken sein?",
    antwort:
      "Das hängt am Schuh. Falke ordnet leicht gepolsterte Socken leichten Schuhen der Kategorie A zu, mittelstark gepolsterte Wanderschuhen der Kategorien A bis B. Schwere Bergstiefel und Winter vertragen dickere Socken. Wichtig: Der Schuh muss zur Socke passen — deshalb die Wandersocken zum Schuhkauf mitnehmen, rät der DAV.",
  },
  {
    frage: "Welche Größe bei Wandersocken?",
    antwort:
      "Die Schuhgröße, die du trägst. Liegst du zwischen zwei Größen, empfiehlt Falke die kleinere. Eine zu große Socke wirft Falten, und Falten reiben.",
  },
  {
    frage: "Wie wasche ich Merino-Wandersocken?",
    antwort:
      "Der DAV rät zu 30 bis 40 Grad, Wollwaschmittel ohne das Enzym Protease, kein Weichspüler, kein Trockner. Wie heikel zu heiße Wäsche ist, zeigte ein Schweizer Test von Sportsocken: Bei 60 Grad schrumpften zwei Modelle um sechs Größen, von 42 auf 36.",
  },
  {
    frage: "Hilft es, zwei Paar Socken übereinander zu tragen?",
    antwort:
      "Viele schwören darauf, schreibt der Österreichische Alpenverein: eine sehr dünne, eng anliegende Kunstfasersocke unter der Wollsocke, sodass die Reibung zwischen den beiden Socken entsteht und nicht an der Haut. Der Schuh muss dafür Platz haben.",
  },
];
