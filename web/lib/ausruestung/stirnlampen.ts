import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Stirnlampen-Vergleich — von Hand zusammengestellt.
 *
 * Alle Leuchtwerte nach ANSI/PLATO FL 1, so wie die Hersteller sie angeben.
 * Wichtig für das Lesen der Zahlen (Petzl erklärt das Verfahren offen): Der
 * Lichtstrom wird 30 bis 120 Sekunden nach dem Einschalten mit frischen
 * Batterien gemessen, die Leuchtweite bis dort, wo noch 0,25 Lux ankommen,
 * und die Leuchtdauer, bis die Lampe auf 10 Prozent ihrer Anfangsleistung
 * gefallen ist. "12 Stunden" heißt also nicht zwölf Stunden gleich hell.
 *
 * Die mittlere Stufe (`mitte`) ist der Wert, mit dem man auf dem Weg
 * tatsächlich geht; der Rechner nutzt ihn. Wo ein Hersteller keine
 * Stufenwerte veröffentlicht, steht null.
 */

export interface Stufe {
  lm: number;
  /** Leuchtweite in Metern. */
  m: number | null;
  /** Leuchtdauer in Stunden bis 10 % der Anfangsleistung. */
  h: number | null;
}

export interface Stirnlampe {
  asin: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  maxLm: number;
  mitte: Stufe | null;
  max: Stufe | null;
  gramm: number | null;
  schutz: string;
  energie: string;
  rot: string;
  test?: string;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const STIRNLAMPEN: Stirnlampe[] = [
  {
    asin: "B0FDM3F43J",
    name: "Tikka",
    marke: "Petzl",
    abzeichen: "Unsere erste Wahl",
    rolle: "Die Stirnlampe, die auf Wanderungen fast alles richtig macht — mit Batterien oder Akku.",
    einordnung:
      "Im Test der Schweizer Zeitschrift K-Tipp, über den die Stiftung Warentest 2021 berichtete, kam die Tikka auf den zweiten Platz und hielt ihre volle Helligkeit 37 Minuten lang — andere Lampen drosselten schon nach zwei Minuten. Heute leistet sie laut Petzl 350 Lumen bei 94 Gramm. Auf der Standardstufe gibt sie 100 Lumen für 12 Stunden, genug für jeden Rückweg. Sie läuft mit drei AAA-Batterien, die dabei sind, oder mit dem Core-Akku.",
    maxLm: 350,
    mitte: { lm: 100, m: 45, h: 12 },
    max: { lm: 350, m: 70, h: 2 },
    gramm: 94,
    schutz: "IPX4",
    energie: "3 × AAA (dabei) oder Core-Akku",
    rot: "Dauer- und Blinklicht",
    test: "K-Tipp 2021: Platz 2",
    dafuer: [
      "Im K-Tipp-Test auf Platz zwei, mit der längsten vollen Helligkeit.",
      "100 lm für 12 Stunden auf Batterien — die längste mittlere Stufe unter den Lampen hier, die Werte veröffentlichen.",
      "Batterien bekommt man an jeder Tankstelle, der Core-Akku lässt sich nachrüsten.",
      "Breiter, gleichmäßiger Lichtkegel für Weg und Füße.",
    ],
    dagegen: [
      "Nur IPX4, spritzwassergeschützt: Im K-Tipp-Test drang beim Untertauchen Feuchtigkeit ein. Petzl verwies darauf, die Lampe sei nur spritzwasserfest.",
      "Leuchtweite 70 m — für Trailrunning oder Wegsuche im freien Gelände knapp.",
    ],
    nichtFuer: "Wer im Starkregen unterwegs ist oder die Lampe in Bäche fallen lassen könnte. Dann IP67.",
  },
  {
    asin: "B09NQK3P4K",
    name: "Spot 400-R",
    marke: "Black Diamond",
    abzeichen: "Wasserdicht",
    rolle: "Wasserdicht, mit Akku und der längsten mittleren Stufe unter den Akkulampen.",
    einordnung:
      "400 Lumen, 86 Gramm, fester Akku mit 1500 mAh. Black Diamond gibt IP67 an: eine halbe Stunde einen Meter unter Wasser. Auf der mittleren Stufe leuchtet sie mit 200 Lumen 8 Stunden und 60 Meter weit. Ein Sperrmodus verhindert, dass sie sich im Rucksack einschaltet, der Speicher merkt sich die zuletzt genutzte Helligkeit.",
    maxLm: 400,
    mitte: { lm: 200, m: 60, h: 8 },
    max: { lm: 400, m: 100, h: 4 },
    gramm: 86,
    schutz: "IP67",
    energie: "Akku 1500 mAh, Micro-USB",
    rot: "Dauer-, Dimm- und Blinklicht",
    dafuer: [
      "IP67: taucht eine halbe Stunde unter, ohne Schaden.",
      "Mittlere Stufe mit 200 lm doppelt so hell wie bei der Tikka, 8 Stunden lang.",
      "Sperrmodus und Speicher für die letzte Helligkeit.",
    ],
    dagegen: [
      "Micro-USB statt USB-C — ein Kabel mehr im Rucksack.",
      "Fester Akku: Ist er leer, hilft keine Batterie aus der Hütte.",
    ],
    nichtFuer: "Mehrtägige Touren ohne Steckdose. Dann eine Lampe, die auch Batterien nimmt.",
  },
  {
    asin: "B0FHJMGRXK",
    name: "Actik Core",
    marke: "Petzl",
    abzeichen: "Weiter sehen",
    rolle: "Für den Weg, den man suchen muss — mit gebündeltem Licht bis weit voraus.",
    einordnung:
      "Die Actik Core hat neben dem breiten Lichtkegel einen gebündelten für die Ferne. Petzl nennt 625 Lumen und 115 Meter auf der höchsten Stufe, 88 Gramm, den Core-Akku inklusive. Auf der Standardstufe hält sie mit 100 Lumen 7 Stunden. Wie die Tikka nimmt sie notfalls drei AAA-Batterien. Das Amazon-Angebot nennt 600 Lumen, vermutlich eine ältere Ausführung.",
    maxLm: 625,
    mitte: { lm: 100, m: 60, h: 7 },
    max: { lm: 625, m: 115, h: 2 },
    gramm: 88,
    schutz: "IPX4",
    energie: "Core-Akku (dabei) oder 3 × AAA",
    rot: "Dauer- und Blinklicht",
    dafuer: [
      "115 m Leuchtweite auf der höchsten Stufe — für Markierungen und Wegweiser in der Ferne.",
      "Akku dabei, Batterien als Reserve möglich.",
      "Reflektierendes Kopfband.",
    ],
    dagegen: [
      "Nur IPX4.",
      "Die Standardstufe hält mit Akku kürzer (7 h) als die Tikka mit Batterien (12 h).",
    ],
    nichtFuer: "Wer nur im Hüttenlager und auf dem Weg zur Toilette leuchtet. Dafür reicht die Tikka.",
  },
  {
    asin: "B0CF9T15JY",
    name: "HF6R Core",
    marke: "Ledlenser",
    abzeichen: "IP68, Fokus",
    rolle: "Die robusteste hier — Aluminiumgehäuse, IP68 und ein Fokus zum Drehen.",
    einordnung:
      "Ledlenser aus Solingen hieß früher Zweibrüder Optoelectronics, deshalb suchen viele noch nach der „Zweibrüder-Stirnlampe“. Die HF6R Core hat ein Aluminiumgehäuse, IP68 und einen Fokus, den man am Rad zwischen breitem und gebündeltem Licht verstellt. Ledlenser nennt 20 bis 800 Lumen, 25 bis 160 Meter und 3 bis 60 Stunden je nach Stufe, dazu 126 Gramm. Im K-Tipp-Test hatte eine Ledlenser — ein älteres Modell, die SE07R — das beste Licht.",
    maxLm: 800,
    mitte: null,
    max: { lm: 800, m: 160, h: null },
    gramm: 126,
    schutz: "IP68",
    energie: "Akku, USB-C",
    rot: "Rotlicht",
    dafuer: [
      "IP68 und Aluminiumgehäuse — die robusteste Lampe hier.",
      "Fokus stufenlos zwischen Nahfeld und Ferne.",
      "Bis 800 lm und 160 m.",
    ],
    dagegen: [
      "126 g, die schwerste hier.",
      "Ledlenser nennt nur Spannen, keine Werte für eine mittlere Stufe.",
    ],
    nichtFuer: "Wer auf jedes Gramm achtet. Dann die Nitecore.",
  },
  {
    asin: "B0F1KKYNR7",
    name: "NU25 MCT UL",
    marke: "Nitecore",
    abzeichen: "47 Gramm",
    rolle: "Die leichteste Lampe hier, mit drei Lichtfarben.",
    einordnung:
      "47 Gramm mit Kopfband, 400 Lumen, 132 Meter Leuchtweite, fester Akku mit 700 mAh, USB-C. Die Besonderheit sind drei Farbtemperaturen, von warm bis kalt — warmes Licht empfinden viele im Nebel und im Schnee als angenehmer. Nitecore gibt bis zu 45 Stunden auf der niedrigsten Stufe an, veröffentlicht aber keine Werte für die mittleren Stufen.",
    maxLm: 400,
    mitte: null,
    max: { lm: 400, m: 132, h: null },
    gramm: 47,
    schutz: "IP66",
    energie: "Akku 700 mAh, USB-C",
    rot: "Rotlicht, zwei Stufen",
    dafuer: [
      "47 g — halb so schwer wie die Tikka.",
      "Warm-, Neutral- und Kaltweiß wählbar.",
      "USB-C, IP66.",
    ],
    dagegen: [
      "Kleiner Akku mit 700 mAh.",
      "Keine veröffentlichten Leuchtdauern für die mittleren Stufen.",
    ],
    nichtFuer: "Lange Winternächte ohne Lademöglichkeit.",
  },
  {
    asin: "B0CKJ2HTJD",
    name: "Trail Runner Free 2",
    marke: "Silva",
    abzeichen: "Für Läufer",
    rolle: "Für den Lauf im Dunkeln — mit Rücklicht und Batteriefach am Hinterkopf.",
    einordnung:
      "Silva gewann 2014 den schwedischen Test von Råd & Rön, über den die Stiftung Warentest berichtete — mit dem Vorgänger Trail Runner II. Die Free 2 verteilt das Gewicht: vorn die Lampe, hinten das Batteriefach mit rotem Rücklicht, das Kabel im Band. 450 Lumen, mittlere Stufe 200 Lumen für 4 bis 5 Stunden, 122 Gramm mit Batterien, IPX5. Ein Verlängerungskabel erlaubt es, das Batteriefach bei Kälte in der Jacke zu tragen.",
    maxLm: 450,
    mitte: { lm: 200, m: 50, h: 4 },
    max: { lm: 450, m: 75, h: 1.5 },
    gramm: 122,
    schutz: "IPX5",
    energie: "3 × AAA (nicht dabei) oder Silva-Hybridakku",
    rot: "Rücklicht am Batteriefach",
    test: "Vorgänger: Råd & Rön 2014, Platz 1",
    dafuer: [
      "Rotes Rücklicht — sichtbar für Autos auf dem Weg zum Parkplatz.",
      "Gewicht vorn und hinten verteilt, springt beim Laufen weniger.",
      "Verlängerungskabel, um die Batterien bei Kälte warm zu halten.",
    ],
    dagegen: [
      "Batterien nicht dabei, Akku kostet extra.",
      "Mittlere Stufe nur 4 bis 5 Stunden.",
    ],
    nichtFuer: "Wer im Hüttenlager eine kleine Lampe braucht. Das Batteriefach am Hinterkopf stört beim Liegen.",
  },
  {
    asin: "B09G6M8JLK",
    name: "Stirnlampe mit Rotlicht",
    marke: "Blukar",
    abzeichen: "Günstigste",
    rolle: "Für die Taschenlampen-Schublade — und als Zweitlampe im Auto.",
    einordnung:
      "Eine Marktplatzlampe mit breitem COB-Leuchtfeld, stufenlos dimmbar, Bewegungssensor, Rotlicht, USB-C und 1200 mAh. Andere Blukar-Angebote werben mit 2000 oder 8000 „Lumen“, ohne eine Messnorm zu nennen. Dieses Angebot nennt gar keinen Lichtstrom. Als Zweitlampe im Auto, für den Fall, dass man am Parkplatz im Dunkeln sucht, ist sie genau richtig.",
    maxLm: 0,
    mitte: null,
    max: null,
    gramm: null,
    schutz: "keine Angabe",
    energie: "Akku 1200 mAh, USB-C",
    rot: "Rotlicht",
    dafuer: [
      "Mit Abstand die günstigste.",
      "Breites Licht, dimmbar, USB-C.",
    ],
    dagegen: [
      "Keine Angaben nach ANSI-Standard: weder Lumen noch Leuchtdauer noch Leuchtweite.",
      "Keine Schutzklasse angegeben.",
    ],
    nichtFuer: "Die Tour, auf der man sich auf die Lampe verlassen muss.",
  },
];

/** Die Notfall-Lampe, die der DAV fürs Erste-Hilfe-Set nennt. */
export const NOTFALL = {
  asin: "B01KYTR0HM",
  marke: "Petzl",
  name: "e+LITE",
  text: "40 Lumen, Lithium-Knopfzellen, die laut Petzl zehn Jahre gelagert werden können, IPX7, von −30 bis +60 °C. Rotes Licht, das von weitem gesehen wird. Keine Wanderlampe, sondern die, die immer im Rucksack bleibt — der DAV nennt für Touren ohne Nachtaufbruch eine Notfallstirnlampe ab etwa 30 Gramm.",
};

export function alsProdukt(s: Stirnlampe): Produkt {
  return {
    ...s,
    kurz: [s.maxLm ? `${s.maxLm} lm` : null, s.gramm ? `${s.gramm} g` : null, s.schutz !== "keine Angabe" ? s.schutz : null].filter(Boolean).join(" · "),
    eckdaten: [
      ["Maximal", s.max ? `${s.max.lm} lm${s.max.m ? `, ${s.max.m} m` : ""}${s.max.h ? `, ${String(s.max.h).replace(".", ",")} h` : ""}` : "keine Angabe"],
      ["Mittlere Stufe", s.mitte ? `${s.mitte.lm} lm, ${s.mitte.m} m, ${s.mitte.h} h` : "nicht angegeben"],
      ["Gewicht", s.gramm ? `${s.gramm} g` : "nicht angegeben"],
      ["Schutz", s.schutz],
      ["Energie", s.energie],
      ["Rotlicht", s.rot],
    ],
    kennwert: s.mitte
      ? { wert: `${s.mitte.h} h`, zusatz: `${s.mitte.lm} lm`, unter: `${s.maxLm} lm max · ${s.schutz}` }
      : undefined,
    siegel: s.test,
  };
}

export const QUELLEN = {
  warentest2021: "https://www.test.de/Stirnlampen-Test-Gute-Stirnlampen-fuer-Sport-und-Heimwerken-5821402-0/",
  warentest2014: "https://www.test.de/Stirnleuchten-im-Test-Lichtblicke-im-Dunkeln-4766676-0/",
  ansi: "https://www.petzl.com/US/en/Operators/How-is-lighting-performance-measured-with-the-ANSI-PLATO-FL1-protocol-",
  tikka: "https://www.petzl.com/DE/de/Sport/Stirnlampen/TIKKA",
  dav: "https://www.alpenverein.de/artikel/wie-funktioniert-das-erste-hilfe-sets_71c61d38-aff0-4ab2-9a38-0eeaebb9908b",
  notruf: "https://www.alpenverein.de/artikel/wie-funktioniert-das-notruf_29889ad0-4363-4b8f-b52e-a5d0fecd7168",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Wie viel Lumen braucht eine Stirnlampe zum Wandern?",
    antwort:
      "Gehen lässt es sich auf einem Wanderweg mit rund 100 Lumen gut, das ist bei vielen Lampen die mittlere Stufe. Mehr braucht man, um Markierungen und Abzweige in der Ferne zu finden. Wichtiger als der Höchstwert ist, wie lange die Lampe die mittlere Stufe hält.",
  },
  {
    frage: "Was sagt die Stiftung Warentest zu Stirnlampen?",
    antwort:
      "Sie hat 2021 über einen Test der Schweizer Zeitschrift K-Tipp berichtet: Sieben von zehn Lampen überzeugten, Testsieger war die Trek 500 USB von Decathlon, Zweite die Petzl Tikka, das beste Licht hatte die Ledlenser SE07R. Die größten Unterschiede gab es beim Akku: Zwei Lampen hielten die volle Helligkeit nur zwei Minuten, die Tikka 37.",
  },
  {
    frage: "Wofür ist das Rotlicht an der Stirnlampe?",
    antwort:
      "Rotes Licht erhält die Anpassung der Augen an die Dunkelheit und blendet andere nicht — im Hüttenlager, am Rastplatz, beim Kartenlesen in der Gruppe. Rotes Blinklicht zeigt im Notfall, wo man ist.",
  },
  {
    frage: "Akku oder Batterien?",
    antwort:
      "Akku ist günstiger im Betrieb und praktisch, wenn man abends laden kann. Batterien bekommt man überall und tauscht sie in Sekunden. Am flexibelsten sind Hybridlampen wie die Petzl Tikka oder Actik Core, die beides nehmen.",
  },
  {
    frage: "Was bedeuten IPX4 und IP67?",
    antwort:
      "Die Schutzart gegen Wasser. IPX4 heißt spritzwassergeschützt, Regen macht der Lampe nichts. IP67 heißt, sie übersteht eine halbe Stunde in einem Meter Wassertiefe. Im K-Tipp-Test mussten die Lampen eine Minute unter Wasser — die Tikka mit IPX4 ließ Feuchtigkeit ein.",
  },
  {
    frage: "Warum wird meine Stirnlampe nach kurzer Zeit dunkler?",
    antwort:
      "Viele Lampen drosseln die Helligkeit nach kurzer Zeit, um den Akku zu schonen. Die angegebene Leuchtdauer zählt nach ANSI-Standard, bis die Lampe auf 10 Prozent ihrer Anfangshelligkeit gefallen ist — sie ist also nicht die ganze Zeit so hell wie am Anfang.",
  },
];
