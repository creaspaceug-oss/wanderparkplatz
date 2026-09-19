import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Regenjacken-Vergleich — von Hand zusammengestellt.
 *
 * Die Stiftung Warentest hat keinen eigenen aktuellen Regenjacken-Test, sie
 * berichtete aber 2024 über einen Labortest des Schweizer Magazins Saldo.
 * Zwei der dort geprüften Jacken sind hier dabei. Wassersäule und Gewicht
 * stammen von den Herstellerseiten oder aus dem Angebot; fehlt eine Angabe,
 * steht null und die Seite zeigt „k. A.“.
 *
 * Eine ASIN je Passform genügt: Auf der Amazon-Seite wählt man die Größe.
 */

export interface Regenjacke {
  key: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  wassersaeule: number | null;
  /** Gewicht in g laut Hersteller; bei zwei Werten Herren/Damen. */
  gewicht: string | null;
  lagen: string;
  belueftung: boolean;
  pfas: string;
  saldo: string | null;
  herren?: string;
  damen?: string;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const JACKEN: Regenjacke[] = [
  {
    key: "escape",
    name: "Escape Light",
    marke: "Vaude",
    abzeichen: "Unsere erste Wahl",
    rolle: "Die einzige Wanderjacke im Saldo-Test, die in Deutschland erhältlich ist und „gut“ abschnitt.",
    einordnung:
      "Das Schweizer Magazin Saldo ließ Wanderjacken im Labor-Dauerregen prüfen; die Stiftung Warentest berichtete 2024 darüber. Die Damenversion der Escape Light war die einzige gute unter den in Deutschland erhältlichen Jacken: Sie hielt lange trocken, war atmungsaktiv und kam ohne Perfluorcarbone aus. Vaude nennt für die Ceplex-Active-Membran mindestens 10.000 Millimeter Wassersäule und 420 Gramm für das Damenmodell. Zwei Lagen, verstaubare Kapuze, Zwei-Wege-Reißverschluss.",
    wassersaeule: 10000,
    gewicht: "420 (Damen)",
    lagen: "2 Lagen",
    belueftung: false,
    pfas: "ohne PFAS laut Hersteller",
    saldo: "gut (Damenmodell)",
    herren: "B006A3CR48",
    damen: "B09JSYGGSB",
    dafuer: [
      "Im Saldo-Test als einzige in Deutschland erhältliche Jacke „gut“ (Damenmodell).",
      "Mindestens 10.000 mm Wassersäule, ohne PFAS laut Vaude.",
      "Kapuze im Kragen verstaubar, Zwei-Wege-Reißverschluss.",
    ],
    dagegen: [
      "Keine Unterarm-Reißverschlüsse im Angebot genannt.",
      "Geprüft wurde das Damenmodell; das Herrenmodell war nicht im Test.",
    ],
    nichtFuer: "Wer beim Aufstieg viel schwitzt und Belüftung braucht. Dann die Marmot.",
  },
  {
    key: "marmot",
    name: "PreCip Eco Jacket",
    marke: "Marmot",
    abzeichen: "Mit Unterarm-Lüftung",
    rolle: "Leicht, mit Reißverschlüssen unter den Armen — für alle, die bergauf schwitzen.",
    einordnung:
      "Laut Angebot 2,5 Lagen mit NanoPro-Eco-Beschichtung, komplett getapte Nähte, Belüftungsreißverschlüsse an den Unterarmen, einrollbare Kapuze, rund 286 Gramm für das Herren- und 247 Gramm für das Damenmodell, aus recyceltem Nylon. Eine Wassersäule nennt Marmot nicht. Was die Jacke auszeichnet, sind die Unterarm-Reißverschlüsse: Der DAV nennt Reißverschlüsse, die kritische Stellen beim Aufstieg belüften, ausdrücklich als Merkmal einer guten Wanderjacke.",
    wassersaeule: null,
    gewicht: "286 / 247",
    lagen: "2,5 Lagen",
    belueftung: true,
    pfas: "PFC-frei laut Hersteller",
    saldo: null,
    herren: "B07F687RP6",
    damen: "B07F5WJMQN",
    dafuer: [
      "Unterarm-Reißverschlüsse zum Lüften.",
      "Getapte Nähte, rund 286 g (Herren) bzw. 247 g (Damen).",
      "Einrollbare Kapuze, Klettbündchen.",
    ],
    dagegen: [
      "Keine Wassersäule angegeben.",
      "2,5 Lagen: leicht, aber laut DAV weniger langlebig als 3 Lagen.",
    ],
    nichtFuer: "Wer eine belegte Wassersäule als Kaufkriterium nimmt.",
  },
  {
    key: "berghaus",
    name: "Deluge Pro 3.0",
    marke: "Berghaus",
    abzeichen: "Die dichteste Angabe",
    rolle: "Die Herrenjacke mit den meisten Zahlen: 12.000 mm Wassersäule, 21.000 g Atmungsaktivität.",
    einordnung:
      "Berghaus nennt für die Hydroshell-Jacke 12.000 Millimeter Wassersäule und eine Atmungsaktivität von 21.000 g/m² in 24 Stunden — die höchsten Angaben in diesem Vergleich. Zweilagig, Sturmklappen über den Reißverschlüssen, zwei Reißverschlusstaschen, mehr als 75 Prozent recyceltes Material laut Angebot. Berghaus selbst ordnet sie für Alltag, Pendeln und Reisen ein.",
    wassersaeule: 12000,
    gewicht: null,
    lagen: "2 Lagen",
    belueftung: false,
    pfas: "k. A.",
    saldo: null,
    herren: "B0CRBD8RW2",
    dafuer: [
      "12.000 mm Wassersäule und 21.000 g/m²/24 h laut Hersteller.",
      "Sturmklappen über den Reißverschlüssen.",
      "Überwiegend recyceltes Material.",
    ],
    dagegen: [
      "Hier nur als Herrenmodell verlinkt.",
      "Keine Angabe zu PFAS im Angebot.",
      "Berghaus nennt als Einsatz Alltag und Reisen, nicht Berg.",
    ],
    nichtFuer: "Damen — hier ist nur das Herrenmodell verlinkt.",
  },
  {
    key: "weiltal",
    name: "Weiltal 2L",
    marke: "Jack Wolfskin",
    abzeichen: "Im Test: genügend",
    rolle: "Getestet, PFC-frei — und im Regen nur mittelmäßig.",
    einordnung:
      "Die Herrenversion war im Saldo-Test dabei und bekam „genügend“: Sie schlug sich im Regentest nur etwas besser als die ungenügende Jacke von H&M. Frei von Perfluorcarbonen war sie aber — neben der Vaude die einzige der fünf in Deutschland erhältlichen Jacken. Jack Wolfskin nennt 10.000 Millimeter Wassersäule, eine fest verbundene, in Gesichtsfeld und Volumen einstellbare Kapuze und wasserabweisende Reißverschlüsse.",
    wassersaeule: 10000,
    gewicht: null,
    lagen: "2 Lagen",
    belueftung: false,
    pfas: "PFC-frei laut Saldo-Test",
    saldo: "genügend (Herrenmodell)",
    herren: "B0D3FG6DXH",
    damen: "B0D3FGQKXL",
    dafuer: [
      "Im Saldo-Test als PFC-frei bestätigt.",
      "Kapuze fest verbunden und gut einstellbar.",
      "Damen- und Herrenmodell.",
    ],
    dagegen: [
      "Im Regentest nur „genügend“ (Herrenmodell).",
      "Kein Gewicht angegeben.",
    ],
    nichtFuer: "Lange Regentage. Dafür hielt sie im Test zu kurz dicht.",
  },
  {
    key: "torrentshell",
    name: "Torrentshell 3L",
    marke: "Patagonia",
    abzeichen: "3 Lagen",
    rolle: "Die dreilagige Jacke im Vergleich — für viel und langes Tragen.",
    einordnung:
      "Drei Lagen sind laut DAV etwas steifer, aber besonders leistungsfähig und langlebig. Patagonia baut die Torrentshell so; im Amazon-Angebot stehen darüber hinaus keine technischen Angaben, weder Wassersäule noch Gewicht. Sie ist die einzige Jacke mit drei Lagen in diesem Vergleich.",
    wassersaeule: null,
    gewicht: null,
    lagen: "3 Lagen",
    belueftung: false,
    pfas: "k. A.",
    saldo: null,
    herren: "B0BZVK9YKW",
    damen: "B0BZVJSY7W",
    dafuer: [
      "3 Lagen: laut DAV besonders leistungsfähig und langlebig.",
      "Damen- und Herrenmodell.",
    ],
    dagegen: [
      "Keine technischen Angaben im Angebot.",
      "Steifer als 2 oder 2,5 Lagen (DAV).",
    ],
    nichtFuer: "Wer eine leichte Notfalljacke sucht.",
  },
  {
    key: "columbia",
    name: "Watertight II",
    marke: "Columbia",
    abzeichen: "Einfach",
    rolle: "Die schlichte Regenjacke, die in die eigene Tasche passt.",
    einordnung:
      "Columbia beschreibt eine wasserdichte, atmungsaktive Omni-Tech-Jacke mit fest angebrachter, verstellbarer Kapuze, zwei Reißverschlusstaschen und Kordelzug am Saum; sie lässt sich in der eigenen Tasche verstauen und ist maschinenwaschbar. Wassersäule und Gewicht nennt das Angebot nicht.",
    wassersaeule: null,
    gewicht: null,
    lagen: "k. A.",
    belueftung: false,
    pfas: "k. A.",
    saldo: null,
    herren: "B0CN3X472D",
    dafuer: [
      "In der eigenen Tasche verstaubar.",
      "Fest angebrachte, verstellbare Kapuze.",
      "Maschinenwaschbar.",
    ],
    dagegen: [
      "Weder Wassersäule noch Gewicht noch Aufbau angegeben.",
      "Hier nur als Herrenmodell verlinkt.",
    ],
    nichtFuer: "Wer nach Zahlen kauft.",
  },
];

export const hauptAsin = (j: Regenjacke): string => (j.herren ?? j.damen)!;

export function alsProdukt(j: Regenjacke): Produkt {
  const ws = j.wassersaeule ? `${j.wassersaeule.toLocaleString("de-DE")} mm` : "k. A.";
  return {
    asin: hauptAsin(j),
    name: j.name,
    marke: j.marke,
    abzeichen: j.abzeichen,
    rolle: j.rolle,
    einordnung: j.einordnung,
    kurz: [j.lagen !== "k. A." ? j.lagen : null, j.belueftung ? "Unterarm-Lüftung" : null, j.gewicht ? `${j.gewicht} g` : null]
      .filter(Boolean)
      .join(" · "),
    eckdaten: [
      ["Wassersäule", j.wassersaeule ? `${ws} laut Hersteller` : "nicht angegeben"],
      ["Gewicht", j.gewicht ? `${j.gewicht} g laut Hersteller` : "nicht angegeben"],
      ["Aufbau", j.lagen],
      ["Unterarm-Lüftung", j.belueftung ? "ja" : "nicht angegeben"],
      ["PFAS", j.pfas],
      ["Saldo-Test 2024", j.saldo ?? "nicht geprüft"],
      ["Passform", [j.herren && "Herren", j.damen && "Damen"].filter(Boolean).join(", ")],
    ],
    kennwert: { wert: ws, unter: "Wassersäule" },
    siegel: j.saldo ? `Saldo-Test 2024: ${j.saldo}` : undefined,
    dafuer: j.dafuer,
    dagegen: j.dagegen,
    nichtFuer: j.nichtFuer,
  };
}

export const QUELLEN = {
  warentest: "https://www.test.de/Wanderjacken-im-Test-Viele-sind-nicht-ganz-dicht-6160402-0/",
  warentestMethode: "https://www.test.de/Funktionsjacken-im-Test-So-haben-wir-getestet-5060339-5060345/",
  davWetterschutz:
    "https://www.alpenverein.de/artikel/wie-funktioniert-das-wetterschutzbekleidung_92524e64-3fc4-4f8d-aee3-d3c3b140dcfb",
  davOutfit: "https://www.alpenverein.de/artikel/das-richtige-wanderoutfit_cff0a90c-1323-40b0-ae4d-7247a313c845",
  vaude: "https://www.vaude.com/int/en/03895-escape-light-rain-jacket-women-s.html",
  berghaus: "https://www.berghaus.com/men-s-deluge-pro-3.0-waterproof-jacket-natural/16623780.html",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Welche Regenjacke ist die beste zum Wandern?",
    antwort:
      "Einen aktuellen eigenen Regenjacken-Test hat die Stiftung Warentest nicht. Sie berichtete 2024 über einen Labortest des Schweizer Magazins Saldo: Von den in Deutschland erhältlichen Jacken war nur die Vaude Escape Light (Damen) gut — sie hielt lange trocken, war atmungsaktiv und frei von Perfluorcarbonen.",
  },
  {
    frage: "Wie viel Wassersäule braucht eine Regenjacke?",
    antwort:
      "Nach DIN gilt ein Stoff ab 1.300 Millimetern als wasserdicht. Weil Rucksackträger, Sitzen und Knien den Druck erhöhen, empfiehlt die Eidgenössische Materialprüfanstalt laut DAV mindestens 4.000 Millimeter. Aber Vorsicht: Im Saldo-Test hielt eine Jacke mit angegebenen 24.000 Millimetern nur etwa fünf Minuten dicht — die Nähte waren die Schwachstelle.",
  },
  {
    frage: "Hardshell oder Softshell zum Wandern?",
    antwort:
      "Laut DAV: Softshell für kühle und windige Tage — weich, warm, dehnbar und sehr atmungsaktiv. Bei richtigem Regenwetter gehört eine Hardshell in den Rucksack, also eine wasserdichte, atmungsaktive Regenjacke.",
  },
  {
    frage: "Warum lässt meine Regenjacke nach dem Waschen Wasser durch?",
    antwort:
      "Im Saldo-Test hielten alle Jacken nach mehrmaligem Waschen den Regen kürzer ab als neu, weil die Wäsche die wasserabweisende Beschichtung mit ausspült. Der DAV rät: 20 zusätzliche Minuten im Trockner reaktivieren die Imprägnierung; lässt der Oberstoff trotzdem Wasser durch, mit Pumpspray oder Einwaschmittel nachimprägnieren.",
  },
  {
    frage: "Welche Größe sollte eine Regenjacke haben?",
    antwort:
      "So groß, dass sie über die wärmste Schicht passt, die du darunter trägst. Der DAV nennt es ausdrücklich: Wenn die Hardshell nicht über den dicken Fleece passt, wird es schwierig. Ärmel und Rücken sollten nicht zu kurz sein, unter den Achseln darf es nicht zu eng werden.",
  },
  {
    frage: "Was bedeutet PFC-frei bei Regenjacken?",
    antwort:
      "Perfluorcarbone (PFC, heute meist PFAS genannt) machen Oberstoffe wasser- und schmutzabweisend, reichern sich aber in der Umwelt an; manche stehen im Verdacht, krebserregend zu sein. Der DAV nennt Jacken mit Imprägnierung ohne Fluorkarbone aus Umweltsicht ideal. Im Saldo-Test waren von fünf in Deutschland erhältlichen Jacken nur die von Vaude und Jack Wolfskin frei davon.",
  },
];
