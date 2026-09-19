import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Vergleich der Erste-Hilfe-Sets — von Hand
 * zusammengestellt und an einer einzigen Liste gemessen: der Empfehlung des
 * Deutschen Alpenvereins für ein Standard-Päckchen zur Tagestour
 * (DAV Panorama, "Wie funktionieren Erste-Hilfe-Sets?", zuletzt geändert
 * 21.02.2023). Fünfzehn Positionen; welches Set welche davon enthält, steht
 * in `hat` und stammt aus den Inhaltslisten auf den Herstellerseiten, nicht
 * aus den Amazon-Texten — die nennen den Inhalt meist nur in Auszügen.
 */

export type Position =
  | "handschuhe"
  | "verbandpaeckchen"
  | "mullbinde"
  | "kompressen"
  | "rettungsdecke"
  | "tape"
  | "pflaster"
  | "blasenpflaster"
  | "dreieckstuch"
  | "beatmungstuch"
  | "zecke"
  | "pinzette"
  | "traubenzucker"
  | "schere"
  | "desinfektion";

/** Die DAV-Liste für das Standard-Päckchen, in der Reihenfolge des Artikels. */
export const DAV_LISTE: { k: Position; text: string; wozu: string }[] = [
  { k: "handschuhe", text: "1 Paar Einmalhandschuhe", wozu: "Schutz für dich und die verletzte Person" },
  { k: "verbandpaeckchen", text: "1 Verbandpäckchen", wozu: "Druckverband für stark blutende Wunden" },
  { k: "mullbinde", text: "1 Mullbinde, elastisch", wozu: "Fixieren, stützen" },
  { k: "kompressen", text: "2 sterile Kompressen", wozu: "Wundauflage" },
  { k: "rettungsdecke", text: "1 Rettungsfolie", wozu: "Wärmeerhalt, Sichtbarkeit" },
  { k: "tape", text: "1 Taperolle", wozu: "Fixieren — besser als Verbandklammern" },
  { k: "pflaster", text: "1 Pflasterset, 20 Stück", wozu: "u. a. Fingerkuppen- und Knöchelpflaster" },
  { k: "blasenpflaster", text: "2 hautbildende Blasenpflaster", wozu: "nur zur Regeneration" },
  { k: "dreieckstuch", text: "1 Dreieckstuch", wozu: "Armschlinge, Polster, Verband" },
  { k: "beatmungstuch", text: "1 Beatmungstuch", wozu: "für die Reanimation" },
  { k: "zecke", text: "1 Zeckenkarte", wozu: "Zecken entfernen" },
  { k: "pinzette", text: "1 Pinzette, stabil", wozu: "Splitter, Stacheln" },
  { k: "traubenzucker", text: "1 Traubenzucker", wozu: "bei Unterzucker" },
  { k: "schere", text: "1 kleine Schere, stabil", wozu: "Tape, Verband, Kleidung" },
  { k: "desinfektion", text: "2 Desinfektionstüchlein", wozu: "laut DAV „umstritten“" },
];

export interface Set {
  asin: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  gramm: number | null;
  masse: string | null;
  klasse: "Mini" | "Standard" | "Erweitert";
  /** Welche DAV-Positionen das Set laut Hersteller enthält. */
  hat: Position[];
  extra: string;
  inhaltQuelle: string;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const SETS: Set[] = [
  {
    asin: "B09MQMXXF7",
    name: "First Aid Kit",
    marke: "Deuter",
    abzeichen: "Unsere erste Wahl",
    rolle: "Zehn der fünfzehn DAV-Positionen, in der Gewichtsklasse, die der DAV für Tagestouren nennt.",
    einordnung:
      "Das Set deckt sich am weitesten mit der Liste des Alpenvereins: Handschuhe, zwei Verbandpäckchen, elastische Mullbinde, Kompresse, Rettungsdecke, Tape, ein 20-teiliges Pflasterset, Dreieckstuch, Pinzette und eine große Metallschere. Dazu eine Signalpfeife. 300 Gramm liegen genau in der Spanne von 230 bis 450 Gramm, die der DAV für ein Standard-Päckchen angibt. Das Innenteil klappt auf, eine Schlaufe hält das Set am Hüftgurt.",
    gramm: 300,
    masse: "12 × 18 × 6 cm",
    klasse: "Standard",
    hat: ["handschuhe", "verbandpaeckchen", "mullbinde", "kompressen", "rettungsdecke", "tape", "pflaster", "dreieckstuch", "pinzette", "schere"],
    extra: "Signalpfeife",
    inhaltQuelle: "deuter.com",
    dafuer: [
      "10 von 15 DAV-Positionen — mehr als jedes andere Set hier.",
      "Mit Rettungsdecke und Pinzette, die dem kleineren Deuter Active fehlen.",
      "Signalpfeife — für das alpine Notsignal, wenn es keinen Empfang gibt.",
      "Ausklappbares Innenteil, Schlaufe für den Hüftgurt.",
    ],
    dagegen: [
      "Keine Zeckenkarte, kein Beatmungstuch, keine Blasenpflaster — die drei muss man ergänzen.",
      "Nur eine sterile Kompresse, der DAV nennt zwei.",
      "Latexhandschuhe: Wer eine Latexallergie hat, tauscht sie gegen Nitril.",
    ],
    nichtFuer: "Mehrtagestouren abseits von Hütten. Dafür nennt der DAV ein erweitertes Päckchen.",
  },
  {
    asin: "B0DSVZQ3C1",
    name: "First Aid Kit Active",
    marke: "Deuter",
    abzeichen: "200 Gramm",
    rolle: "Das kleine Deuter-Set — mit zwei Lücken, die man kennen sollte.",
    einordnung:
      "Fast derselbe Inhalt wie das große Deuter-Set, in 200 Gramm und 11 × 13 × 5 Zentimetern. Es fehlen laut Hersteller aber genau die zwei Dinge, die am Berg zählen: die Rettungsdecke und die Pinzette. Die Rettungsdecke kostet einzeln wenig und wiegt fast nichts — wer das Active nimmt, legt sie dazu.",
    gramm: 200,
    masse: "11 × 13 × 5 cm",
    klasse: "Mini",
    hat: ["handschuhe", "verbandpaeckchen", "mullbinde", "kompressen", "tape", "pflaster", "dreieckstuch", "schere"],
    extra: "Signalpfeife",
    inhaltQuelle: "deuter.com",
    dafuer: [
      "200 g, kleiner als das große Set.",
      "Verbandpäckchen, Mullbinde, Dreieckstuch und Tape sind dabei.",
      "Signalpfeife und umlaufender Reißverschluss.",
    ],
    dagegen: [
      "Keine Rettungsdecke — am Berg das Teil, das man am ehesten braucht, wenn man warten muss.",
      "Keine Pinzette.",
    ],
    nichtFuer: "Wer es so kauft, wie es ist. Mit einer Rettungsdecke dazu ist es ein gutes kleines Set.",
  },
  {
    asin: "B001QXDQPG",
    name: "First Aid Complete",
    marke: "Tatonka",
    abzeichen: "Für Gruppen",
    rolle: "Für eine Woche und bis zu vier Personen — mit Desinfektion und viel Verbandsmaterial.",
    einordnung:
      "Laut Tatonka für eine Woche und bis zu vier Personen gepackt, zusammengestellt mit der Outdoorschule Süd. Drei Wundkompressen, zwei Verbandpäckchen, Verbandtuch, Dreieckstuch, Schere, Splitterpinzette, zwei Paar Handschuhe, Rettungsdecke und zehn Alkoholtupfer, dazu ein Spickzettel für die Erstversorgung. 440 Gramm. Was fehlt, ist eine elastische Binde und eine Taperolle.",
    gramm: 440,
    masse: "18 × 12,5 × 6,5 cm",
    klasse: "Erweitert",
    hat: ["handschuhe", "verbandpaeckchen", "kompressen", "rettungsdecke", "pflaster", "dreieckstuch", "pinzette", "schere", "desinfektion"],
    extra: "Verbandtuch, Fixierpflaster, Spickzettel",
    inhaltQuelle: "tatonka.com",
    dafuer: [
      "Viel Verbandsmaterial: drei Kompressen, zwei Verbandpäckchen, ein großes Verbandtuch.",
      "Zwei Paar Handschuhe — wichtig, wenn zwei helfen.",
      "Spickzettel und Checkliste für die Erstversorgung.",
    ],
    dagegen: [
      "Keine elastische Binde und kein Tape — beides braucht man zum Fixieren.",
      "440 g: am oberen Ende dessen, was der DAV für Tagestouren nennt.",
      "Keine Zeckenkarte, kein Beatmungstuch.",
    ],
    nichtFuer: "Die Einzelperson auf der Tagestour. Für sie ist es zu viel.",
  },
  {
    asin: "B0015NQLNQ",
    name: "Trek",
    marke: "Lifesystems",
    abzeichen: "Mit Blasenpflastern",
    rolle: "Für kleine Verletzungen gut sortiert — aber ohne Rettungsdecke.",
    einordnung:
      "Lifesystems hat die ausführlichste Inhaltsliste im Angebot: Pinzette, Schere, Mullbinde, Schnellverband, Mulltupfer, Wundkompressen, Micropore-Tape, Kochsalztücher, zwei Paar Handschuhe, Brandsalbe, Pflaster und zwei Blasenpflaster. 241 Gramm. Es ist auf kleine Verletzungen ausgelegt. Verbandpäckchen, Dreieckstuch und Rettungsdecke fehlen.",
    gramm: 241,
    masse: "14 × 11 × 5 cm",
    klasse: "Standard",
    hat: ["handschuhe", "mullbinde", "kompressen", "tape", "pflaster", "blasenpflaster", "pinzette", "schere"],
    extra: "Brandsalbe, Kochsalztücher, Augenkompresse",
    inhaltQuelle: "Amazon-Angebot",
    dafuer: [
      "Blasenpflaster sind dabei — als einzigem Set hier.",
      "Ausführliche Inhaltsliste im Angebot, man weiß, was man kauft.",
      "Zwei Paar Handschuhe.",
    ],
    dagegen: [
      "Keine Rettungsdecke, kein Verbandpäckchen, kein Dreieckstuch — für stark blutende Wunden und das Warten auf Hilfe fehlt das Wichtigste.",
      "Die Brandsalbe braucht man am Berg selten.",
    ],
    nichtFuer: "Alpine Touren, auf denen man mit einer Rettung rechnen muss — ohne Ergänzung.",
  },
  {
    asin: "B07Q4647Y9",
    name: "Roll Doc Mini",
    marke: "Ortovox",
    abzeichen: "Zum Rollen",
    rolle: "Flach gerollt für die Deckeltasche — mit Rettungsdecke.",
    einordnung:
      "Ortovox rollt das Set statt es zu falten: 15 × 8 × 3 Zentimeter, flach genug für jede Deckeltasche. Laut Angebot sind Rettungsdecke, Heftpflaster, Handschuhe, eine kleine Schere, zwei sterile Kompressen, ein Verbandpäckchen, ein Pflasterset und eine Notfallkarte mit Versorgungstipps dabei. Ein Gewicht nennt das Angebot nicht.",
    gramm: null,
    masse: "15 × 8 × 3 cm",
    klasse: "Mini",
    hat: ["handschuhe", "verbandpaeckchen", "kompressen", "rettungsdecke", "tape", "pflaster", "schere"],
    extra: "Notfallkarte",
    inhaltQuelle: "Amazon-Angebot",
    dafuer: [
      "Mit Rettungsdecke und Verbandpäckchen — das Wichtigste für den Ernstfall.",
      "Flach gerollt, 3 cm dick.",
      "Notfallkarte mit Versorgungstipps.",
    ],
    dagegen: [
      "Kein Gewicht im Angebot.",
      "Keine Pinzette, kein Dreieckstuch, keine Mullbinde.",
    ],
    nichtFuer: "Wer auf Tagestouren mit Familie oder Gruppe unterwegs ist. Dafür ist es zu knapp.",
  },
  {
    asin: "B001QXDQOM",
    name: "First Aid Basic",
    marke: "Tatonka",
    abzeichen: "Tatonka-Grundausstattung",
    rolle: "Grundausstattung für eine Person — laut Tatonka nur für Eintagestouren.",
    einordnung:
      "Tatonka nennt für die aktuelle Ausführung 230 Gramm und diesen Inhalt: zwei sterile Wundverbände, ein Verbandpäckchen, fünf Pflasterstrips, Rollenpflaster, ein Paar Handschuhe, Rettungsdecke, Spickzettel und Checkliste. Die Outdoorschule Süd, die den Inhalt zusammengestellt hat, empfiehlt es ausdrücklich nur für Eintagestouren und eine Person. Das Amazon-Angebot nennt andere Maße als Tatonka — möglicherweise eine ältere Ausführung mit anderem Inhalt.",
    gramm: 230,
    masse: "16,5 × 11,5 × 5 cm",
    klasse: "Standard",
    hat: ["handschuhe", "verbandpaeckchen", "kompressen", "rettungsdecke", "tape", "pflaster"],
    extra: "Spickzettel, Checkliste",
    inhaltQuelle: "tatonka.com",
    dafuer: [
      "Mit Rettungsdecke und Verbandpäckchen.",
      "Spickzettel und Checkliste für die Erstversorgung.",
      "Tatonka fertigt nach eigener Angabe in eigenen Produktionsstätten.",
    ],
    dagegen: [
      "Keine Schere, keine Pinzette, kein Dreieckstuch, keine Mullbinde.",
      "Das Amazon-Angebot nennt 18 × 12,5 × 5,5 cm, Tatonka 16,5 × 11,5 × 5 cm. Was genau geliefert wird, ist unklar.",
    ],
    nichtFuer: "Wer ein Set ohne Nachrüsten will. Mit Schere und Dreieckstuch wird es eines.",
  },
  {
    asin: "B001QXDOXU",
    name: "First Aid Mini",
    marke: "Tatonka",
    abzeichen: "90 Gramm",
    rolle: "Für die Hosentasche — Pflaster und Zeckenzange, nicht mehr.",
    einordnung:
      "90 Gramm, 10 × 7 × 4 Zentimeter. Ein kleines Verbandpäckchen, zwei Wundpflaster, fünf Pflasterstrips und eine Zeckenzange. Das ist kein Erste-Hilfe-Set im Sinne des DAV, sondern ein Pflastertäschchen — für Spaziergänge, Kinderwagenrunden und als Ergänzung, nicht für den Berg.",
    gramm: 90,
    masse: "10 × 7 × 4 cm",
    klasse: "Mini",
    hat: ["verbandpaeckchen", "pflaster", "zecke"],
    extra: "Zeckenzange",
    inhaltQuelle: "tatonka.com",
    dafuer: [
      "90 g, passt in jede Tasche.",
      "Mit Zeckenzange — die fehlt fast allen größeren Sets.",
      "Günstig.",
    ],
    dagegen: [
      "Drei von fünfzehn DAV-Positionen.",
      "Keine Rettungsdecke, keine Handschuhe.",
    ],
    nichtFuer: "Jede Tour, auf der man auf Hilfe warten müsste.",
  },
];

/** Was man einzeln nachkaufen kann, wenn es im Set fehlt. */
export const NACHKAUF: Partial<Record<Position, { asin: string; name: string }>> = {
  rettungsdecke: { asin: "B06ZYB33DF", name: "Rettungsdecke gold/silber, 160 × 210 cm" },
  zecke: { asin: "B07NRZY822", name: "Zeckenkarte mit Lupe" },
  beatmungstuch: { asin: "B0D8JG3L5C", name: "Beatmungstücher, 12 Stück" },
  tape: { asin: "B000F5WCA6", name: "Leukotape classic, 3,75 cm × 10 m" },
};

/** Was der DAV zusätzlich empfiehlt — nicht im Set, aber im Rucksack. */
export const ZUBEHOER = {
  biwaksack: {
    asin: "B076DJQNYX",
    name: "Ortovox Bivy Ultralight",
    text: "Biwaksack bis zwei Personen, 235 × 110 cm. Der DAV schreibt, ein Biwaksack schütze mehr vor Unterkühlung als eine Rettungsdecke, und man könne eine verletzte Person darin einpacken, ohne die Verletzung viel zu bewegen.",
  },
  schiene: {
    asin: "B00XW763VS",
    name: "SAM Splint, 92 × 11 cm",
    text: "Gepolsterte Aluschiene, die sich formen lässt. Der DAV beschreibt sie in der Standardgröße 11 × 91 Zentimeter mit rund 130 Gramm: am gesunden Arm anpassen, dann am verletzten mit einer elastischen Binde fixieren.",
  },
};

export function abdeckung(s: Set) {
  return s.hat.length;
}

export function alsProdukt(s: Set): Produkt {
  return {
    ...s,
    kurz: [`${abdeckung(s)} von ${DAV_LISTE.length} DAV-Positionen`, s.gramm ? `${s.gramm} g` : null].filter(Boolean).join(" · "),
    eckdaten: [
      ["DAV-Liste", `${abdeckung(s)} von ${DAV_LISTE.length}`],
      ["Gewicht", s.gramm ? `${s.gramm} g` : "nicht genannt"],
      ["Maße", s.masse ?? "nicht genannt"],
      ["Klasse", s.klasse],
      ["Dazu", s.extra],
      ["Inhalt laut", s.inhaltQuelle],
    ],
    kennwert: { wert: `${abdeckung(s)}/${DAV_LISTE.length}`, unter: s.gramm ? `${s.gramm} g` : "Gewicht k. A." },
  };
}

export const QUELLEN = {
  dav: "https://www.alpenverein.de/artikel/wie-funktioniert-das-erste-hilfe-sets_71c61d38-aff0-4ab2-9a38-0eeaebb9908b",
  notruf: "https://www.alpenverein.de/artikel/wie-funktioniert-das-notruf_29889ad0-4363-4b8f-b52e-a5d0fecd7168",
  wallner: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9566397/",
  wikipedia: "https://de.wikipedia.org/wiki/Rettungsdecke",
};

/** Die drei Größen, die der DAV unterscheidet. */
export const KLASSEN = [
  { k: "Mini", fuer: "Kurze Ausflüge: Feierabendrunde, Berglauf, Klettertour", gramm: "150–200 g", masse: "ca. 11 × 12 × 3,5 cm", preis: "12–25 €" },
  { k: "Standard", fuer: "Tagestouren: Wandern, Skitour, Hochtour", gramm: "230–450 g", masse: "ca. 14 × 9,5 × 6 cm", preis: "30–45 €" },
  { k: "Erweitert", fuer: "Mehrtagestouren, Durchquerungen, ohne schnelle Rückkehr ins Tal", gramm: "450–700 g", masse: "ca. 26 × 18 × 4,5 cm", preis: "45–100 €" },
] as const;

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Was gehört in ein Erste-Hilfe-Set zum Wandern?",
    antwort:
      "Der Deutsche Alpenverein nennt für Tagestouren: Einmalhandschuhe, Verbandpäckchen, elastische Mullbinde, zwei sterile Kompressen, Rettungsfolie, Tape, ein Pflasterset, Blasenpflaster, Dreieckstuch, Beatmungstuch, Zeckenkarte, Pinzette, Traubenzucker, eine kleine Schere und — als umstritten gekennzeichnet — Desinfektionstücher.",
  },
  {
    frage: "Wie schwer darf ein Erste-Hilfe-Set sein?",
    antwort:
      "Für Tagestouren nennt der DAV 230 bis 450 Gramm, für kurze Ausflüge 150 bis 200 Gramm und für Mehrtagestouren 450 bis 700 Gramm.",
  },
  {
    frage: "Welche Seite der Rettungsdecke gehört nach außen?",
    antwort:
      "Der DAV empfiehlt: silberne Seite zum Patienten, goldene nach außen. Für die Wärme ist der Unterschied nach Messungen gering — entscheidend ist, die Person dicht einzuwickeln und von unten zu isolieren. Gold nach außen macht sie im Schnee für Retter besser sichtbar. Gegen Sonne und Hitze umgekehrt: silber nach außen, als Schattensegel aufgespannt.",
  },
  {
    frage: "Gehören Medikamente ins Erste-Hilfe-Set?",
    antwort:
      "Der DAV rät davon ab, sie an andere weiterzugeben: Auch rezeptfreie Mittel wie Aspirin können im falschen Moment schaden. Wenn überhaupt, dann nur für den eigenen Bedarf.",
  },
  {
    frage: "Wie oft muss man ein Erste-Hilfe-Set erneuern?",
    antwort:
      "Nach dem Verfallsdatum, und wenn keines erkennbar ist, spätestens wenn Verpackungen vergilben, zerfransen oder spröde werden — Sterilität, Elastizität und Klebekraft lassen nach. Altes Material taugt noch zum Üben.",
  },
  {
    frage: "Welche Notrufnummer gilt in den Bergen?",
    antwort:
      "Die 112 europaweit. In Österreich gibt es zusätzlich den Alpinnotruf 140, in der Schweiz die Rega unter 1414. Ohne Empfang bleibt das alpine Notsignal: sechsmal pro Minute rufen, pfeifen oder mit der Lampe blinken, eine Minute Pause, wiederholen. Die Antwort kommt dreimal pro Minute.",
  },
];
