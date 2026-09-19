import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Trinkblasenvergleich — von Hand zusammengestellt.
 *
 * Anders als bei Wanderstöcken liefert Amazons Suche hier die richtigen
 * Marken: Deuter, Source, CamelBak, HydraPak, Platypus. Ausgewählt wurde
 * trotzdem nach Rolle, nicht nach Rangplatz — jede Blase steht für eine
 * Entscheidung, die man beim Kauf tatsächlich trifft.
 *
 * Alle Angaben stammen aus den Herstellertexten zum jeweiligen Artikel. Wo
 * keine Gewichtsangabe steht, steht das da. Einen Labortest von Trinkblasen
 * gibt es weder von der Stiftung Warentest noch von Öko-Test — geprüft wurden
 * dort nur Trinkflaschen. Deshalb auch keine Noten auf dieser Seite.
 *
 * Verglichen wird durchgehend die 2-Liter-Ausführung. Das ist die Größe, die
 * am häufigsten gesucht wird, und nur bei gleicher Größe sind Gewichte
 * vergleichbar.
 */

export interface Trinkblase {
  asin: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  liter: number;
  /** Die Art der Öffnung — das wichtigste Merkmal für die Reinigung. */
  oeffnung: "Schiebeverschluss" | "Schraubdeckel" | "Zwei Öffnungen" | "Weite Öffnung";
  oeffnungDetail: string;
  gramm: number | null;
  masse: string | null;
  absperrung: string;
  besonderheit: string;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
  /** Dieselbe Blase in anderen Größen — nur, wo es sie bei Amazon gibt. */
  groessen?: { liter: number; asin: string; hinweis?: string }[];
}

export const TRINKBLASEN: Trinkblase[] = [
  {
    asin: "B0D5R98FL3",
    name: "Streamer II 2.0",
    marke: "Deuter",
    abzeichen: "Unsere erste Wahl",
    rolle: "Die unaufgeregte Wahl: leicht zu füllen, leicht zu reinigen, flach im Rucksack.",
    einordnung:
      "Ein Schiebeverschluss über die ganze Breite und eine Blase, die sich zum Reinigen auf links drehen lässt — das sind die beiden Eigenschaften, an denen sich im Alltag entscheidet, ob man eine Trinkblase gern benutzt. Gebaut wird sie übrigens nicht von Deuter: Auf der eigenen Produktseite heißt sie „HydraPak Streamer II“, entwickelt für Deuter-Rucksäcke.",
    liter: 2,
    oeffnung: "Schiebeverschluss",
    oeffnungDetail: "Schiebe-Clip über die ganze Breite",
    gramm: null,
    masse: "35 × 17 × 2 cm",
    absperrung: "selbstschließendes Beißventil",
    besonderheit: "wendbar, TPU, passt an 28-mm-Filter",
    dafuer: [
      "Lässt sich auf links drehen. Keine Ecke, in die die Bürste nicht kommt.",
      "Schiebeverschluss statt Schraubdeckel: öffnet über die ganze Breite, zum Füllen wie zum Reinigen.",
      "Flach: 35 × 17 × 2 cm laut Hersteller. Passt auch in schmale Trinkblasenfächer.",
      "Laut Deuter mit einem 28-mm-Wasserfilter kombinierbar — wer aus Bächen nachfüllt, hat damit eine Option.",
    ],
    dagegen: [
      "Deuter nennt auf der eigenen Seite kein Gewicht. Der Händlertext bei Amazon nennt 130 g, aber für alle drei Größen dieselben — darauf verlassen wir uns nicht.",
      "Kein Absperrhahn am Schlauch. Das Beißventil schließt selbst, aber wer die Blase im Auto liegen lässt, will manchmal doppelt sicher sein.",
      "Keine Angabe zu einer antibakteriellen Beschichtung. Sauber halten musst du sie selbst.",
    ],
    nichtFuer:
      "Wer mit Handschuhen trinken will und eine Absperrung mit einer Hand bedienen möchte. Dafür ist die CamelBak gebaut.",
    groessen: [
      { liter: 1.5, asin: "B0D5R68X2W" },
      { liter: 2, asin: "B0D5R98FL3" },
      { liter: 3, asin: "B0D5R7HDFD", hinweis: "40 × 20 × 2 cm" },
    ],
  },
  {
    asin: "B0BWLZP54Y",
    name: "Widepac 2 L",
    marke: "Source",
    abzeichen: "Nur 108 Gramm",
    rolle: "Die leichteste Blase mit Gewichtsangabe, und eine Öffnung, in die die ganze Hand passt.",
    einordnung:
      "Source ist ein israelischer Hersteller, der auch Trinksysteme für Armeen baut. Die patentierte weite Öffnung macht das Reinigen so einfach wie bei einer Schüssel. Mit 108 Gramm ist sie unter den Blasen mit Gewichtsangabe die leichteste.",
    liter: 2,
    oeffnung: "Weite Öffnung",
    oeffnungDetail: "patentierte weite Öffnung",
    gramm: 108,
    masse: "35,5 × 19,2 × 9,1 cm",
    absperrung: "Helix-Beißventil",
    besonderheit: "Schnellkupplung am Schlauch",
    dafuer: [
      "108 g — leichter als jede andere Blase hier, für die ein verlässliches Gewicht genannt ist.",
      "Die weite Öffnung lässt eine Hand hinein. Reinigen ohne Spezialbürste.",
      "Schnellkupplung: Schlauch ab, Blase raus, Schlauch bleibt im Rucksack.",
    ],
    dagegen: [
      "9,1 cm Profil laut Hersteller. In schmalen Trinkblasenfächern kann es gefüllt eng werden.",
      "Die Herkunft aus dem Armeebedarf ist ein Verkaufsargument, keine Prüfung. Über die Haltbarkeit dieser Ausführung sagt sie nichts.",
    ],
    nichtFuer:
      "Wer einen sehr flachen Laufrucksack oder eine Weste nutzt. Dort passt ein schlankes Profil besser.",
    groessen: [
      { liter: 1.5, asin: "B0BWM1HJF9" },
      { liter: 2, asin: "B0BWLZP54Y", hinweis: "108 g" },
      { liter: 3, asin: "B0BWLXDBKL" },
    ],
  },
  {
    asin: "B07MR7SS8X",
    name: "Big Zip EVO 2 l",
    marke: "Platypus",
    abzeichen: "Hält sich selbst offen",
    rolle: "Für alle, die ihre Blase schon einmal verschimmelt weggeworfen haben.",
    einordnung:
      "Das Problem jeder Trinkblase ist nicht das Trinken, sondern das Trocknen danach: Die Folie klebt zusammen, innen bleibt Feuchtigkeit, und nach zwei Wochen im Schrank riecht es. Platypus hält die Blase mit einer halbfesten Trennwand offen und arbeitet Silberionen gegen Schimmel ein.",
    liter: 2,
    oeffnung: "Schiebeverschluss",
    oeffnungDetail: "breiter Zip-Verschluss",
    gramm: 171,
    masse: null,
    absperrung: "selbstschließendes HyFLO-Beißventil",
    besonderheit: "Trennwand hält offen, Silberionen",
    dafuer: [
      "Die halbfeste Trennwand hält die Blase offen. Sie trocknet von selbst, ohne Bügel.",
      "Silberionen im Material gegen Schimmel und Bakterien — laut Hersteller.",
      "Schnelltrennung oben am Schlauch zum Füllen und Entleeren.",
    ],
    dagegen: [
      "171 g, gut 60 g mehr als die Source. Das ist der Preis der Trennwand.",
      "Silberionen ersetzen das Ausspülen nicht. Sie verlangsamen, sie verhindern nicht.",
    ],
    nichtFuer:
      "Wer auf jedes Gramm achtet und die Blase zu Hause ohnehin gründlich trocknet.",
    groessen: [
      { liter: 1.5, asin: "B07M68J5GK", hinweis: "160 g" },
      { liter: 2, asin: "B07MR7SS8X", hinweis: "171 g" },
      { liter: 3, asin: "B002OYDFFW", hinweis: "184 g" },
    ],
  },
  {
    asin: "B07KWDYZJT",
    name: "Crux 2 L",
    marke: "CamelBak",
    abzeichen: "Absperrung per Hebel",
    rolle: "Viel Durchfluss und ein Hebel, der den Schlauch mit einer Hand sperrt.",
    einordnung:
      "CamelBak gibt es seit 1989, und die Crux ist ihr Standardmodell. Sie setzt auf einen Schraubdeckel statt eines Schiebeverschlusses und auf einen Ein-Aus-Hebel am Schlauch — praktisch mit Handschuhen, lästiger beim Reinigen.",
    liter: 2,
    oeffnung: "Schraubdeckel",
    oeffnungDetail: "Schraubdeckel mit Griff",
    gramm: null,
    masse: null,
    absperrung: "Ein-Aus-Hebel am Schlauch, Big-Bite-Ventil",
    besonderheit: "Beschichtung gegen Bakterienwachstum",
    dafuer: [
      "Ein-Aus-Hebel am Schlauch: mit einer Hand zu, auch mit Handschuhen.",
      "Laut Hersteller 20 Prozent mehr Wasser je Schluck.",
      "Eine Beschichtung soll das Bakterienwachstum in Blase und Schlauch hemmen.",
    ],
    dagegen: [
      "Schraubdeckel statt Schiebeverschluss. In die Öffnung passt eine Bürste, aber keine Hand — die Ecken erreicht man schlecht.",
      "CamelBak nennt kein Gewicht für diese Ausführung.",
      "Die 20 Prozent mehr je Schluck nennen keinen Maßstab — mehr als was, sagt der Hersteller nicht.",
    ],
    nichtFuer: "Wer die Blase oft und gründlich reinigen will. Dafür ist ein Schiebeverschluss besser.",
  },
  {
    asin: "B0BRBRBXV9",
    name: "Contour 2 L",
    marke: "HydraPak",
    abzeichen: "Bleibt flach",
    rolle: "Die flache Blase für schmale Rucksäcke — mit lebenslanger Garantie.",
    einordnung:
      "Die Contour ist darauf gebaut, dass sie im Rucksack nicht zur Wurst wird: Innenwände halten sie flach, ein fester Boden gibt ihr Form. Dazu gibt HydraPak eine Garantie auf Material- und Verarbeitungsfehler für die ganze Lebensdauer. HydraPak baut übrigens auch die Deuter-Blase.",
    liter: 2,
    oeffnung: "Schiebeverschluss",
    oeffnungDetail: "Slide-Seal-Verschluss",
    gramm: null,
    masse: null,
    absperrung: "Comet-Beißventil mit Daumen-Absperrung",
    besonderheit: "lebenslange Garantie, Magnetclip",
    dafuer: [
      "Innenwände halten sie flach. Im Rücken trägt sie sich wie ein Brett, nicht wie ein Ball.",
      "Lebenslange Garantie auf Material- und Verarbeitungsfehler.",
      "Innen eine Lasche, mit der sie sich zum Reinigen auf links ziehen lässt.",
      "Absperrung mit dem Daumen und ein Magnetclip für den Schlauch am Schultergurt.",
    ],
    dagegen: [
      "Preislich am oberen Ende dieses Vergleichs.",
      "HydraPak nennt für diese Ausführung kein Gewicht.",
    ],
    nichtFuer: "Wer sparen will. Die Deuter kann bei der Reinigung dasselbe.",
  },
  {
    asin: "B0CJ9CML66",
    name: "Trinkblase 2 l",
    marke: "SASMO",
    abzeichen: "Günstigste",
    rolle: "Der günstige Einstieg mit zwei Öffnungen und langem Schlauch.",
    einordnung:
      "Eine Handelsmarke, keine Herstellermarke mit Geschichte. Die Angaben klingen gut — stärkere Folie als üblich, zwei Öffnungen, ein Meter Schlauch —, prüfen lassen sie sich nur durch Ausprobieren. Für den Einstieg vertretbar, weil der Anbieter die Rücknahme ohne Bedingungen zusagt.",
    liter: 2,
    oeffnung: "Zwei Öffnungen",
    oeffnungDetail: "runde Einfüllöffnung und Schiebeverschluss",
    gramm: null,
    masse: null,
    absperrung: "Beißventil, Click-Schnellkupplung",
    besonderheit: "TPU 0,4 mm, LFGB-zertifiziert, 100 cm Schlauch",
    dafuer: [
      "Mit Abstand die günstigste Blase in diesem Vergleich.",
      "Zwei Öffnungen: rund zum schnellen Füllen, breit zum Reinigen.",
      "100 cm Schlauch — lang genug auch für große Rucksäcke.",
      "Laut Anbieter lebensmittelecht nach LFGB und BPA-frei.",
    ],
    dagegen: [
      "Kein Gewicht angegeben.",
      "Eine Handelsmarke. Wie lange Nähte und Verschluss halten, lässt sich nicht aus einer Geschichte ablesen.",
      "Zwei Öffnungen heißt zwei Dichtungen, die dicht bleiben müssen.",
    ],
    nichtFuer:
      "Mehrtagestouren ohne Ausweichmöglichkeit. Eine undichte Blase im Rucksack ist dort mehr als nasser Rücken.",
  },
];

/** Die Blase in der Form, die die gemeinsamen Bausteine verstehen. */
export function alsProdukt(t: Trinkblase): Produkt {
  return {
    ...t,
    kurz: [`${t.liter} l`, t.oeffnung, t.gramm ? `${t.gramm} g` : null].filter(Boolean).join(" · "),
    eckdaten: [
      ["Inhalt", `${t.liter} Liter`],
      ["Öffnung", t.oeffnungDetail],
      ["Gewicht", t.gramm ? `${t.gramm} g` : "vom Hersteller nicht genannt"],
      ["Maße", t.masse ?? "nicht genannt"],
      ["Ventil", t.absperrung],
      ["Besonders", t.besonderheit],
    ],
    kennwert: { wert: t.gramm ? `${t.gramm} g` : "—", unter: t.oeffnung },
  };
}

/**
 * Ersatzteile je Blase — Mundstück oder Schlauch vom selben Hersteller.
 *
 * Die Kupplungen sind oft herstellereigen. Deshalb hier nur Originalteile,
 * die zur jeweiligen Blase gehören, und keine "universellen" Mundstücke vom
 * Marktplatz, deren Passform niemand zusagt.
 */
export const ERSATZTEILE: { zu: string; teil: string; asin: string }[] = [
  { zu: "Deuter Streamer II", teil: "Ersatz-Beißventil", asin: "B0DFC5RY79" },
  { zu: "Deuter Streamer II", teil: "Schlauch mit Ventil", asin: "B0DFC4WY4R" },
  { zu: "Source Widepac (2023)", teil: "Helix-Schlauchset mit Kupplung", asin: "B0BWLYLYMM" },
  { zu: "CamelBak Crux", teil: "Big-Bite-Ventil", asin: "B0019DCVTA" },
  { zu: "HydraPak Contour", teil: "Comet-Beißventil", asin: "B0BRBRC8GM" },
  { zu: "Platypus Big Zip EVO", teil: "Schlauchset", asin: "B07N84M5FG" },
];

/** Zubehör — eigene Suchthemen, eigene Abschnitte. */
export const ZUBEHOER = {
  isolierung: {
    asin: "B0DCKBXX8C",
    marke: "SASMO",
    name: "Isolierter Trinkschlauch, 100 cm",
    text: "Ein ganzer Ersatzschlauch mit Neoprenhülle und Beißventil, mit Click-Kupplung. Passt an Blasen mit demselben Anschluss — vor dem Kauf prüfen.",
  },
  reinigung: {
    asin: "B0BGSVLDL5",
    marke: "SASMO",
    name: "Reinigungsset für Trinkblasen",
    text: "Eine 100 cm lange Bürste für den Schlauch, eine kleine für das Ventil und eine Halterung, die die Blase zum Trocknen offen hält.",
  },
};

/**
 * Wie viel Wasser für wie viele Stunden — die Annahme hinter dem Rechner.
 *
 * Belastbare Stundenwerte gibt es nicht. Belegt ist die Tagesmenge: Der
 * Deutsche Wanderverband empfiehlt 1,5 bis 2 Liter für eine Tageswanderung,
 * der Schweizer Alpen-Club nennt 1 bis 2 Liter für größere Touren. Die Werte
 * unten sind so gewählt, dass eine Tour von fünf Stunden bei mildem Wetter
 * genau dort landet — und stehen auf der Seite als das, was sie sind: eine
 * Annahme.
 */
export const LITER_JE_STUNDE = { kuehl: 0.25, mild: 0.35, heiss: 0.6 } as const;

export const QUELLEN = {
  wanderverband:
    "https://www.wanderverband.de/wandern/wanderwissen/tipps-und-infos-zum-wandern/tipps-fuers-wandern/essen-und-trinken",
  sac: "https://www.sac-cas.ch/de/die-alpen/fluessigkeitsaufnahme-bei-bergtouren-teil-ii-14301/",
  warentestFlaschen: "https://www.test.de/Trinkflaschen-im-Test-Nicht-ganz-dicht-6229623-0/",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Wie viel Wasser brauche ich für eine Tageswanderung?",
    antwort:
      "Der Deutsche Wanderverband empfiehlt 1,5 bis 2 Liter für eine Tageswanderung. Bei Hitze und vielen Höhenmetern deutlich mehr. Trink früh und regelmäßig, nicht erst bei Durst — der kommt unter Belastung zu spät.",
  },
  {
    frage: "2 oder 3 Liter?",
    antwort:
      "Für die meisten Tagestouren 2 Liter. 3 Liter lohnen sich bei Hitze, bei langen Touren ohne Einkehr und für Mehrtagestouren. Eine volle 3-Liter-Blase wiegt drei Kilo — wer sie nur halb füllt, trägt die leere Hälfte umsonst.",
  },
  {
    frage: "Wie reinige ich eine Trinkblase?",
    antwort:
      "Nach jeder Tour ausspülen, alle paar Touren gründlich: warmes Wasser mit etwas Spülmittel oder Natron, Blase, Schlauch und Ventil mit Bürsten reinigen, gründlich klar spülen und offen trocknen lassen. Nicht heißer als der Hersteller erlaubt; steht nichts dabei, handwarm.",
  },
  {
    frage: "Wie bekomme ich den Plastikgeschmack aus einer neuen Trinkblase?",
    antwort:
      "Vor dem ersten Einsatz mit warmem Wasser und etwas Natron oder Zitronensaft füllen, einige Stunden stehen lassen, gründlich ausspülen. Hält sich der Geschmack danach, liegt es am Material und nicht am Schmutz.",
  },
  {
    frage: "Wie trockne ich eine Trinkblase richtig?",
    antwort:
      "Offen, kopfüber und so, dass die Folie nicht zusammenklebt — mit einem Trockenbügel, einem Kochlöffel oder einem zusammengerollten Küchentuch darin. Den Schlauch abnehmen und hängend trocknen lassen. Wird sie nicht ganz trocken, ins Gefrierfach: Kälte tötet Keime nicht, aber sie vermehren sich dort nicht.",
  },
  {
    frage: "Warum friert im Winter zuerst der Schlauch?",
    antwort:
      "Weil darin wenig Wasser außen in der Kälte hängt, während die Blase am warmen Rücken liegt. Hilfe: eine isolierte Hülle und nach jedem Schluck das Wasser aus dem Schlauch in die Blase zurückblasen.",
  },
  {
    frage: "Passt jede Trinkblase in jeden Rucksack?",
    antwort:
      "Nein. Der Rucksack braucht ein Fach, in dem die Blase aufrecht hängt, und eine Öffnung für den Schlauch. Vergleiche die Maße: Die Deuter misst laut Hersteller 35 × 17 cm, in der 3-Liter-Ausführung 40 × 20 cm, die Source 35,5 × 19,2 cm — das Fach sollte etwas größer sein.",
  },
  {
    frage: "Darf Mineralwasser mit Kohlensäure in die Trinkblase?",
    antwort:
      "Besser nicht. In den Angaben der Hersteller hier findet sich keine Freigabe dafür. Kohlensäure baut in der geschlossenen Blase Druck auf, sie bläht sich, und beim ersten Biss schießt es aus dem Ventil. Still oder nur leicht sprudelnd, und dann halb gefüllt, ist das Äußerste.",
  },
  {
    frage: "Kann man ein Loch in der Trinkblase reparieren?",
    antwort:
      "Ein kleines Loch in der Fläche ja: Stelle trocknen, mit Alkohol reinigen, von außen einen Reparaturflicken für Kunststofffolien aufkleben — für TPU die Ausführung, die nicht für PVC gedacht ist, bei Tear-Aid heißt sie Typ A. An Nähten, am Verschluss oder am Anschluss hält ein Flicken selten dauerhaft. Dort ist eine neue Blase die ehrlichere Lösung.",
  },
  {
    frage: "Hat die Stiftung Warentest Trinkblasen getestet?",
    antwort:
      "Nein. Die Stiftung Warentest und Öko-Test haben Trinkflaschen geprüft, aber keine Trinkblasen. Seiten, die von einem „Trinkblasen-Testsieger“ sprechen, meinen einen eigenen Vergleich — so wie diese hier, die das auch sagt.",
  },
];
