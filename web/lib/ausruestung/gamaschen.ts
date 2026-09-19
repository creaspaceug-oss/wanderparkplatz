import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Gamaschen-Vergleich — von Hand zusammengestellt.
 *
 * Gamaschen unterscheiden sich in vier Dingen: Höhe, Material (dicht oder
 * atmungsaktiv), Verschluss vorn und Steg unter dem Schuh. Alle Angaben aus
 * den Herstellertexten zum jeweiligen Artikel; Größen einzeln, weil jede bei
 * Amazon eine eigene ASIN hat. Einen unabhängigen Test gibt es nicht.
 */

export type Hoehe = "kurz" | "mittel" | "lang";

export interface Groesse {
  k: string;
  asin: string;
  /** Wadenumfang oder Höhe laut Angebot, falls genannt. */
  hinweis?: string;
}

export interface Gamasche {
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  hoehe: Hoehe;
  hoeheCm: number | null;
  material: string;
  dicht: "wasserdicht" | "wasserdicht, atmungsaktiv" | "wasserabweisend, atmungsaktiv";
  verschluss: string;
  steg: string;
  gramm: number | null;
  groessen: Groesse[];
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const GAMASCHEN: Gamasche[] = [
  {
    name: "Gaiter 420 HD",
    marke: "Tatonka",
    abzeichen: "Unsere erste Wahl",
    rolle: "Lang, dicht, robust — und mit Maßen für jede Größe im Angebot.",
    einordnung:
      "420-Denier-Nylon mit dreifacher PU-Beschichtung, Reißverschluss vorn, Metallhaken für die Schnürsenkel und ein verstellbarer Steg aus Hypalon, einem synthetischen Kautschuk, den Tatonka als äußerst robust beschreibt. Tatonka nennt für jede Größe Höhe und Umfang: M ist 42 Zentimeter hoch, L 47. Die Beschichtung macht sie dicht — und nicht atmungsaktiv.",
    hoehe: "lang",
    hoeheCm: 47,
    material: "420 HD Nylon, dreifach PU-beschichtet",
    dicht: "wasserdicht",
    verschluss: "Reißverschluss",
    steg: "Hypalon, verstellbar",
    gramm: null,
    groessen: [
      { k: "M", asin: "B00GKKR9Y4", hinweis: "42 cm hoch, Umfang 40/42 cm" },
      { k: "L", asin: "B000G4XK8E", hinweis: "47 cm hoch, Umfang 41/46 cm" },
    ],
    dafuer: [
      "Höhe und Umfang je Größe im Angebot — man kann vor dem Kauf messen.",
      "Steg aus Hypalon statt Gurtband oder Kordel.",
      "Dreifach PU-beschichtet, wasserdicht.",
      "Laut Tatonka auch gegen Insekten wie Zecken gedacht.",
    ],
    dagegen: [
      "Nicht atmungsaktiv. Im Aufstieg an einem warmen Tag schwitzt man darunter.",
      "Reißverschluss statt Klett: mit kalten Fingern und Schnee im Zipper mühsamer.",
      "Kein Gewicht im Angebot.",
    ],
    nichtFuer: "Trailrunning und heiße Sommertage. Dafür ist sie zu warm und zu lang.",
  },
  {
    name: "Quagmire eVent",
    marke: "Sea to Summit",
    abzeichen: "Wasserdicht und atmungsaktiv",
    rolle: "Das Flaggschiff — kniehoch, atmungsaktiv, für Schlamm, Dauerregen und Schnee.",
    einordnung:
      "Sea to Summit nennt die Quagmire das voll ausgestattete Spitzenmodell seiner Reihe. Das Obermaterial ist eVent, eine wasserdichte, atmungsaktive Membran; unten, wo Stein und Steigeisen reiben, sitzt gefüttertes 1000-Denier-Cordura. Vorn ein 50 Millimeter breiter Klettverschluss, ein Haken aus Edelstahl für die Schnürsenkel und ein austauschbarer Steg. Bei Amazon gibt es sie in S und XL.",
    hoehe: "lang",
    hoeheCm: null,
    material: "eVent oben, 1000D Cordura unten",
    dicht: "wasserdicht, atmungsaktiv",
    verschluss: "Klett, 50 mm",
    steg: "austauschbarer Riemen",
    gramm: null,
    groessen: [
      { k: "S", asin: "B09V2FFNKW" },
      { k: "XL", asin: "B00DTRXD6O" },
    ],
    dafuer: [
      "Wasserdicht und atmungsaktiv — die einzige hier mit einer Membran.",
      "Breiter Klettverschluss: auch mit Handschuhen zu öffnen.",
      "Steg austauschbar, wenn er durchgescheuert ist.",
    ],
    dagegen: [
      "Die teuerste Gamasche in diesem Vergleich.",
      "Bei Amazon nur in S und XL zu finden.",
      "Weder Höhe in Zentimetern noch Gewicht im Angebot.",
    ],
    nichtFuer: "Wer nur Staub und Steinchen aus dem Schuh halten will. Dafür reicht eine kurze Gamasche.",
  },
  {
    name: "Hiking Gaiter",
    marke: "Salewa",
    abzeichen: "140 Gramm",
    rolle: "Wadenlang und leicht — der Kompromiss für die meisten Tageswanderungen.",
    einordnung:
      "Salewa nennt das Wichtigste im Angebot: 140 Gramm, 31 Zentimeter hoch, 150-Denier-Polyester als Mini-Ripstop, wasserdicht, Reißverschluss vorn und ein Steg aus Hypalon, dessen Länge sich zwischen 16 und 19,5 Zentimetern einstellen lässt. Damit reicht sie über den Knöchel eines Wanderstiefels bis zur Wade — hoch genug für nasses Gras und Schneematsch, niedrig genug für den Sommer.",
    hoehe: "mittel",
    hoeheCm: 31,
    material: "150D Polyester Mini-Ripstop",
    dicht: "wasserdicht",
    verschluss: "Reißverschluss",
    steg: "Hypalon, 16–19,5 cm",
    gramm: 140,
    groessen: [
      { k: "M", asin: "B00RBGT5NY" },
    ],
    dafuer: [
      "140 g, 31 cm — Gewicht und Höhe im Angebot.",
      "Hypalon-Steg, in drei Längen einstellbar.",
      "Wadenlang: der beste Kompromiss für Tagestouren.",
    ],
    dagegen: [
      "Für tiefen Schnee zu kurz.",
      "Reißverschluss statt Klett.",
      "Größe L war bei Amazon zuletzt nicht lieferbar und fehlt deshalb hier.",
    ],
    nichtFuer: "Tiefschnee und Schneeschuhtouren. Dann lang.",
  },
  {
    name: "INSTAgaiter Low",
    marke: "Kahtoola",
    abzeichen: "Für Trail und Sommer",
    rolle: "Kurz und dehnbar — gegen Steinchen, Sand und Staub im Schuh.",
    einordnung:
      "Kahtoola baut die INSTAgaiter aus einem dehnbaren Nylon-Polyurethan-Gewebe, wasserabweisend und atmungsaktiv. Der Reißverschluss sitzt schräg, um den Rist nicht zu drücken, und lässt sich öffnen, ohne die Schuhe auszuziehen. Der Steg läuft zwischen den Stollen der Sohle, Kahtoola gibt eine Garantie über 1000 Meilen darauf. Es gibt auch eine höhere Mid-Version.",
    hoehe: "kurz",
    hoeheCm: null,
    material: "Nylon/Polyurethan, dehnbar, DWR",
    dicht: "wasserabweisend, atmungsaktiv",
    verschluss: "Reißverschluss, asymmetrisch",
    steg: "DuraLink-Riemen, 1000-Meilen-Garantie",
    gramm: null,
    groessen: [
      { k: "XS", asin: "B0DC2KHZGG" },
      { k: "S/M", asin: "B0DC2K4VTM" },
      { k: "L/XL", asin: "B0DC22QPDJ" },
    ],
    dafuer: [
      "Atmungsaktiv und dehnbar — auch an warmen Tagen tragbar.",
      "An- und ausziehen, ohne die Schuhe abzustreifen.",
      "Garantie von 1000 Meilen auf den Steg.",
    ],
    dagegen: [
      "Nur wasserabweisend, nicht dicht.",
      "Kurz: gegen Nässe von oben oder hohes nasses Gras kein Schutz.",
      "Größentabelle nur auf den Produktbildern.",
    ],
    nichtFuer: "Regentage und Schnee.",
  },
  {
    name: "Gaiter 420 HD Short",
    marke: "Tatonka",
    abzeichen: "Kurz und dicht",
    rolle: "Die kurze Fassung der ersten Wahl — für Halbschuhe und Schotterwege.",
    einordnung:
      "Dasselbe Material wie die lange 420 HD — 420-Denier-Nylon, dreifach PU-beschichtet — mit Reißverschluss und Metallhaken, aber nur 25 Zentimeter hoch bei 40 Zentimetern Umfang, in einer Größe. Sie hält Steinchen, Sand und Spritzwasser vom Schuhrand fern, mehr nicht.",
    hoehe: "kurz",
    hoeheCm: 25,
    material: "420 HD Nylon, dreifach PU-beschichtet",
    dicht: "wasserdicht",
    verschluss: "Reißverschluss",
    steg: "Schuh-Riemen",
    gramm: null,
    groessen: [{ k: "Einheitsgröße", asin: "B000G4XK16", hinweis: "25 cm hoch, Umfang 40 cm" }],
    dafuer: [
      "Robustes, beschichtetes Material in kurz.",
      "Günstig.",
      "Höhe und Umfang im Angebot.",
    ],
    dagegen: [
      "Nur eine Größe, 40 cm Umfang — für kräftige Waden eng.",
      "Beschichtet, also nicht atmungsaktiv.",
    ],
    nichtFuer: "Schnee und nasses Gras. Dafür ist sie zu kurz.",
  },
  {
    name: "Gamaschen wasserdicht",
    marke: "Unigear",
    abzeichen: "Günstigste",
    rolle: "Lang, mit Klett und verstärktem Unterteil — für wenig Geld.",
    einordnung:
      "Oben ein leichtes, atmungsaktives Gewebe, das der Hersteller Taslon nennt, unten 1000-Denier-Nylon gegen Dornen und Fels. Vorn ein 5 Zentimeter breiter Klettverschluss, oben ein Riemen mit Schnalle, unten ein Steg aus TPU. Unigear gibt eine Wassersäule über 8000 Millimeter für das Obermaterial und 3000 für das Unterteil an — Werte des Herstellers, ohne Prüfnorm.",
    hoehe: "lang",
    hoeheCm: null,
    material: "Taslon oben, 1000D Nylon unten",
    dicht: "wasserdicht, atmungsaktiv",
    verschluss: "Klett, 5 cm",
    steg: "TPU-Band",
    gramm: null,
    groessen: [{ k: "verstellbar", asin: "B08LNH1PXH" }],
    dafuer: [
      "Mit Abstand die günstigste lange Gamasche hier.",
      "Breiter Klettverschluss und Riemen oben.",
      "Verstärktes Unterteil aus 1000D Nylon.",
    ],
    dagegen: [
      "Wassersäule ohne Prüfnorm angegeben.",
      "Steg aus TPU statt Hypalon oder austauschbarem Riemen.",
      "Größen nur über eine Tabelle beim Hersteller.",
    ],
    nichtFuer: "Wer eine Gamasche viele Jahre im Geröll tragen will.",
  },
];

export function standardGroesse(g: Gamasche): Groesse {
  return g.groessen.find((x) => x.k === "L" || x.k === "S/M") ?? g.groessen[0];
}

export function alsProdukt(g: Gamasche): Produkt {
  return {
    asin: standardGroesse(g).asin,
    name: g.name,
    marke: g.marke,
    abzeichen: g.abzeichen,
    rolle: g.rolle,
    einordnung: g.einordnung,
    kurz: [g.hoehe, g.hoeheCm ? `${g.hoeheCm} cm` : null, g.dicht].filter(Boolean).join(" · "),
    eckdaten: [
      ["Höhe", g.hoeheCm ? `${g.hoehe}, ${g.hoeheCm} cm` : g.hoehe],
      ["Material", g.material],
      ["Wasser", g.dicht],
      ["Verschluss", g.verschluss],
      ["Steg", g.steg],
      ["Größen", g.groessen.map((x) => x.k).join(", ")],
    ],
    kennwert: { wert: g.hoehe, zusatz: g.hoeheCm ? `${g.hoeheCm} cm` : undefined, unter: g.dicht },
    dafuer: g.dafuer,
    dagegen: g.dagegen,
    nichtFuer: g.nichtFuer,
  };
}

export const QUELLEN = {
  sts: "https://seatosummit.eu/de/blogs/product-care/the-gaiter-guide-how-to-choose-use-and-care-for-them",
  rki: "https://www.rki.de/SharedDocs/FAQs/DE/Zecken/Zecken.html",
  rkiKarte: "https://www.rki.de/DE/Aktuelles/Neuigkeiten-und-Presse/Meldungen-PM/Meldungen/2026-02-25_FSME-Karte.html",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Braucht man Gamaschen zum Wandern?",
    antwort:
      "Nicht auf jeder Tour. Sie lohnen sich bei nassem Gras, Schlamm, Schnee und Geröll, und auf sandigen oder steinigen Wegen mit Halbschuhen. Auf trockenen, festen Wegen im Sommer braucht man sie nicht.",
  },
  {
    frage: "Welche Höhe sollten Gamaschen haben?",
    antwort:
      "Kurze Gamaschen um 25 Zentimeter halten Steinchen und Sand aus Halbschuhen und Trailrunnern. Wadenlange um 30 Zentimeter reichen für nasses Gras und Matsch. Lange ab rund 40 Zentimetern bis unters Knie sind für Schnee, Dauerregen und Gestrüpp.",
  },
  {
    frage: "Helfen Gamaschen gegen Zecken?",
    antwort:
      "Sie können helfen. Das Robert Koch-Institut empfiehlt geschlossene Kleidung — feste Schuhe, lange Hosen — und die Hosenbeine in die Socken zu stecken, damit Zecken außen auf der Kleidung nach oben laufen und leichter zu finden sind. Eine Gamasche über Schuh und Hosenbein erfüllt denselben Zweck. Nach der Tour gehört der Körper trotzdem abgesucht.",
  },
  {
    frage: "Welche Größe brauche ich bei Gamaschen?",
    antwort:
      "Sie hängt am Wadenumfang und am Schuh. Sea to Summit rät bei voluminösen Berg- und Skistiefeln eine Nummer größer zu nehmen. Zu locker, und Wasser und Schnee kommen hinein; zu eng, und der Verschluss schließt nicht.",
  },
  {
    frage: "Reißverschluss oder Klett?",
    antwort:
      "Klett ist mit Handschuhen und bei Schnee einfacher zu öffnen und zu schließen. Ein Reißverschluss schließt glatter, kann aber mit Schnee darin schwergängig werden. Für den Winter spricht deshalb mehr für breiten Klett.",
  },
  {
    frage: "Wie befestige ich Gamaschen richtig?",
    antwort:
      "Gamasche um den Unterschenkel legen, Verschluss vorn schließen, nach unten auf den Schuh schieben, den Haken in die Schnürsenkel einhängen und den Steg unter der Sohle festziehen — er gehört in die Wölbung vor dem Absatz, nicht unter den Absatz, wo er schneller durchscheuert.",
  },
];
