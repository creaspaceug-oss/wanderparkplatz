import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Wanderschuh-Vergleich — von Hand zusammengestellt.
 *
 * Zwei Tests tragen diese Seite: der eigene Wanderschuh-Test der Stiftung
 * Warentest (10/2022, Einzelnoten hinter der Bezahlschranke) und ein Test
 * leichter Wanderschuhe der französischen Que choisir, über den die Stiftung
 * Warentest 2026 frei lesbar berichtet hat — mit Modellnamen, Preisen und
 * Messwerten. Was von dort stammt, ist am Produkt vermerkt.
 *
 * Schuhe sind bei Amazon je Größe und Farbe eine eigene ASIN. Verlinkt ist
 * jeweils eine Variante; Größe und Farbe wählt man auf der Seite, der Preis
 * kann je Variante abweichen. Darauf weist die Seite an jeder Preisangabe hin.
 */

/** Schuhkategorien nach der Einteilung des Deutschen Alpenvereins. */
export type Kategorie = "A" | "A/B" | "B" | "C";

export const KATEGORIE_TEXT: Record<Kategorie, string> = {
  A: "Leichte Schuhe für Wanderwege und einfaches Gelände",
  "A/B": "Zwischen Wanderweg und leichtem Bergweg",
  B: "Klassischer Wanderstiefel fürs Mittelgebirge und einfache Bergwege",
  C: "Fester Bergstiefel für alpines Gelände, bedingt steigeisenfest",
};

export interface Schuh {
  key: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  kategorie: Kategorie;
  /** Halbschuh oder über den Knöchel. */
  schaft: "halbhoch" | "Halbschuh";
  membran: string;
  obermaterial: string;
  /** Gewicht je Schuh laut Hersteller, sonst null. */
  gewicht: string | null;
  /** Was ein Test über genau dieses Modell sagt, sonst null. */
  test: string | null;
  passform: string;
  herren?: string;
  damen?: string;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const SCHUHE: Schuh[] = [
  {
    key: "xultra",
    name: "X Ultra 4 GTX",
    marke: "Salomon",
    abzeichen: "Testsieger der leichten Schuhe",
    rolle: "Der leichte Halbschuh, der bei Que choisir vorn lag — für Tagestouren auf Wegen.",
    einordnung:
      "Im Test leichter Wanderschuhe der französischen Que choisir, über den die Stiftung Warentest berichtete, lag der X Ultra 4 GTX vorn: guter Halt, stützt den Fuß, bequem, und beim Durchqueren eines kleinen Bachs blieben die Füße trocken. Im Labortest, der eine Wanderung durch hohes Gras nachstellt, drang nach 15 Minuten Feuchtigkeit durch den Stoff — der beste Wert im Feld, aber eben kein dichter Schuh im Dauernassen. Salomon nennt ein Chassis für die Stabilität, eine Contagrip-Sohle und einen eigenen Leisten für das Damenmodell.",
    kategorie: "A",
    schaft: "Halbschuh",
    membran: "Gore-Tex",
    obermaterial: "Synthetik",
    gewicht: null,
    test: "Testsieger bei Que choisir; nach 15 Minuten in hohem Gras feucht",
    passform: "eigener Damenleisten laut Hersteller",
    damen: "B08LK4YWX3",
    dafuer: [
      "Bester Schuh im Que-choisir-Test leichter Wanderschuhe.",
      "Blieb im Praxistest auch bei einer Bachdurchquerung trocken.",
      "Damenmodell mit eigenem Leisten und weicheren Materialien laut Salomon.",
    ],
    dagegen: [
      "Halbschuh: kein Halt für den Knöchel, weniger Dämpfung beim Auftreten.",
      "Nach 15 Minuten in hohem, nassem Gras feucht.",
      "Das Herrenmodell führt Amazon derzeit nur als Nachfolger; hier ist das Damenmodell verlinkt.",
    ],
    nichtFuer: "Mehrtagestouren mit schwerem Rucksack und alpines Gelände.",
  },
  {
    key: "litetrail",
    name: "Lite Trail GTX",
    marke: "Meindl",
    abzeichen: "Am dichtesten im Test",
    rolle: "Der leichte Schuh, der im Grastest am wenigsten Wasser durchließ.",
    einordnung:
      "Von den zehn leichten Wanderschuhen bei Que choisir ließ der Lite Trail GTX am wenigsten Wasser durch — in einem Testfeld, in dem der Zweitplatzierte schon nach zehn Minuten nasse Füße bescherte. Meindl gibt rund 370 Gramm je Schuh in Größe 38 an, Velourleder mit Mesh, Gore-Tex-Membran und ein Fußbett, das aktiv belüftet. Ein Halbschuh für Wanderwege, nicht für Geröll.",
    kategorie: "A",
    schaft: "Halbschuh",
    membran: "Gore-Tex",
    obermaterial: "Velourleder und Mesh",
    gewicht: "ca. 370 g (Gr. 38)",
    test: "ließ im Que-choisir-Test am wenigsten Wasser durch",
    passform: "keine Angabe im Angebot",
    herren: "B08586NFCN",
    damen: "B07NDRPRT1",
    dafuer: [
      "Dichtester Schuh im Grastest des Que-choisir-Felds.",
      "Rund 370 Gramm je Schuh in Größe 38 laut Meindl.",
      "Damen- und Herrenmodell.",
    ],
    dagegen: [
      "Halbschuh ohne Knöchelhalt.",
      "Velourleder will regelmäßig imprägniert werden.",
    ],
    nichtFuer: "Wer über Geröll und Blockwerk steigt.",
  },
  {
    key: "peakfreak",
    name: "Peakfreak II OutDry",
    marke: "Columbia",
    abzeichen: "Komfort, aber früh nass",
    rolle: "Der Zweitplatzierte im Test: bequem und atmungsaktiv, aber schnell feucht.",
    einordnung:
      "Bei Que choisir landete der Peakfreak 2 auf Platz zwei: Komfort und Atmungsaktivität überzeugten, die Sohle hielt auf nassen und glatten Flächen hervorragend. Im Grastest hatte man nach zehn Minuten feuchte Füße. Columbia selbst nennt eine Adapt-Trax-Sohle mit fünf Millimeter hohen Stollen und eine OutDry-Konstruktion. Ein Schuh für trockene Tage und gemütliche Wege, kein Begleiter für den Morgentau.",
    kategorie: "A",
    schaft: "Halbschuh",
    membran: "OutDry",
    obermaterial: "Mesh",
    gewicht: null,
    test: "Platz zwei bei Que choisir; nach 10 Minuten in hohem Gras feucht",
    passform: "keine Angabe im Angebot",
    herren: "B0CLWBTMVH",
    damen: "B0D4C7NMTC",
    dafuer: [
      "Im Test für Komfort und Atmungsaktivität gelobt.",
      "Sohle mit sehr gutem Halt auf nassem, glattem Untergrund.",
    ],
    dagegen: [
      "Nach zehn Minuten in nassem Gras feucht — der schwächste Wert der drei Getesteten hier.",
      "Halbschuh ohne Knöchelhalt.",
    ],
    nichtFuer: "Touren im Morgentau, über Wiesen oder bei Dauerregen.",
  },
  {
    key: "renegade",
    name: "Renegade Evo GTX Mid",
    marke: "Lowa",
    abzeichen: "Unsere erste Wahl",
    rolle: "Der Allrounder für alles zwischen Feldweg und Mittelgebirge, in neuer Auflage.",
    einordnung:
      "Lowa nennt den Renegade den Klassiker unter den Multifunktionsschuhen; die Evo-Auflage ist die aktuelle Generation. Gore-Tex-Membran, halbhoher Schaft, der den Knöchel führt, und laut Lowa ein Leisten für mittelbreite Füße. Lowa nennt als Einsatz Tages- und Mehrtagestouren, Fernwanderungen, Pilgerwege. Im Warentest-Feld von 2022 waren Modelle von Lowa, Meindl, Salewa und Jack Wolfskin; welches davon wie abschnitt, steht hinter der Bezahlschranke.",
    kategorie: "B",
    schaft: "halbhoch",
    membran: "Gore-Tex",
    obermaterial: "Leder",
    gewicht: null,
    test: null,
    passform: "mittelbreite Füße laut Lowa",
    herren: "B0D3SRBKD5",
    damen: "B0CWWWHFCY",
    dafuer: [
      "Halbhoher Schaft: Halt für den Knöchel auf unebenem Gelände.",
      "Gore-Tex, Leder, für Mehrtagestouren ausgewiesen.",
      "Damen- und Herrenmodell mit eigenen Leisten.",
    ],
    dagegen: [
      "Deutlich schwerer als ein Halbschuh.",
      "Kein veröffentlichtes Testergebnis für genau diese Auflage.",
    ],
    nichtFuer: "Kurze Runden auf ebenen Wegen — dafür ist er zu viel Schuh.",
  },
  {
    key: "moab",
    name: "Moab 3 Mid GTX",
    marke: "Merrell",
    abzeichen: "Für breitere Füße",
    rolle: "Der breit gebaute Klassiker mit Vibram-Sohle.",
    einordnung:
      "Der Moab gilt als vergleichsweise breit geschnitten und ist deshalb oft die Antwort auf Druckstellen am Ballen. Merrell nennt Obermaterial aus Leder und Netzstoff, eine Balgzunge gegen Schmutz, eine schützende Zehenkappe und eine Vibram-TC5+-Sohle, dazu recycelte Schnürsenkel und Futter. Vorsicht bei der Modellwahl: Im Que-choisir-Test war nicht dieser Schuh, sondern der leichtere Moab Speed 2 GTX — und der zählte zu denen, die schnell undicht wurden.",
    kategorie: "B",
    schaft: "halbhoch",
    membran: "Gore-Tex",
    obermaterial: "Leder und Mesh",
    gewicht: null,
    test: null,
    passform: "gilt als breiter geschnitten",
    herren: "B09XR6ZQSQ",
    damen: "B0B1DR8LYN",
    dafuer: [
      "Breiterer Schnitt als die meisten europäischen Modelle.",
      "Vibram-Sohle, Zehenkappe, Balgzunge laut Hersteller.",
      "Damen- und Herrenmodell, oft günstiger als europäische Stiefel.",
    ],
    dagegen: [
      "Kein Testergebnis für dieses Modell; der getestete Moab Speed 2 GTX wurde früh undicht.",
      "Keine Gewichtsangabe im Angebot.",
    ],
    nichtFuer: "Schmale Füße — dort rutscht die Ferse.",
  },
  {
    key: "island",
    name: "Island MFS Active",
    marke: "Meindl",
    abzeichen: "Kategorie C",
    rolle: "Der feste Nubuklederstiefel für alpines Gelände und schweres Gepäck.",
    einordnung:
      "Wenn das Gelände steil, steinig und weglos wird, reicht ein Kategorie-B-Stiefel nicht mehr. Der Island ist der klassische Vertreter der nächsten Stufe: Nubukleder, Gore-Tex-Futter, steifere Sohle, Spannhaken zum Feststellen der Schnürung und eine Schutzkante gegen Geröll. Entsprechend schwer ist er, und entsprechend lange braucht er, bis er eingelaufen ist. Für die Wochenendrunde im Mittelgebirge ist das zu viel Schuh.",
    kategorie: "C",
    schaft: "halbhoch",
    membran: "Gore-Tex",
    obermaterial: "Nubukleder",
    gewicht: null,
    test: null,
    passform: "auch als Weitvariante erhältlich",
    herren: "B003P65U56",
    dafuer: [
      "Steifere Sohle und fester Schaft für alpines Gelände.",
      "Nubukleder mit Geröllschutzkante, Spannhaken für zweigeteilte Schnürung.",
      "Meindl führt den Island auch als Weitvariante.",
    ],
    dagegen: [
      "Der schwerste Schuh in diesem Vergleich.",
      "Muss eingelaufen werden, bevor es auf eine lange Tour geht.",
      "Hier nur als Herrenmodell verlinkt.",
    ],
    nichtFuer: "Alles unterhalb des Bergwegs. Für Feld und Wald ist er eine Zumutung.",
  },
];

export const hauptAsin = (s: Schuh): string => (s.herren ?? s.damen)!;

export function alsProdukt(s: Schuh): Produkt {
  return {
    asin: hauptAsin(s),
    name: s.name,
    marke: s.marke,
    abzeichen: s.abzeichen,
    rolle: s.rolle,
    einordnung: s.einordnung,
    kurz: [`Kategorie ${s.kategorie}`, s.schaft === "Halbschuh" ? "Halbschuh" : "halbhoher Schaft", s.membran]
      .filter(Boolean)
      .join(" · "),
    eckdaten: [
      ["Kategorie", `${s.kategorie} — ${KATEGORIE_TEXT[s.kategorie]}`],
      ["Schaft", s.schaft === "Halbschuh" ? "Halbschuh, Knöchel frei" : "halbhoch, Knöchel geführt"],
      ["Membran", s.membran],
      ["Obermaterial", s.obermaterial],
      ["Gewicht", s.gewicht ?? "nicht angegeben"],
      ["Passform", s.passform],
      ["Im Test", s.test ?? "nicht geprüft"],
    ],
    kennwert: { wert: `Kat. ${s.kategorie}`, unter: s.schaft === "Halbschuh" ? "Halbschuh" : "halbhoch" },
    siegel: s.test ?? undefined,
    dafuer: s.dafuer,
    dagegen: s.dagegen,
    nichtFuer: s.nichtFuer,
  };
}

export const QUELLEN = {
  warentestSchuhe: "https://www.test.de/Wanderschuhe-im-Test-5771499-0/",
  warentestLeicht:
    "https://www.test.de/Leichte-Wanderschuhe-im-Test-hohes-Gras-ist-der-endgegner-6233928-0/",
  davSchuhe: "https://www.alpenverein.de/artikel/wanderschuhe_09af809d-88ef-4226-88ac-1aabcf181fac",
  davOutfit: "https://www.alpenverein.de/artikel/das-richtige-wanderoutfit_cff0a90c-1323-40b0-ae4d-7247a313c845",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Welche Wanderschuh-Kategorie brauche ich?",
    antwort:
      "Der Deutsche Alpenverein teilt in vier Stufen ein: A für leichte Schuhe auf Wanderwegen, B für klassische Wanderstiefel im Mittelgebirge und auf einfachen Bergwegen, C für alpines Gelände und bedingt steigeisenfeste Stiefel, D für extreme Touren. Ab Kategorie B sollten die Schuhe einen hohen Schaft und eine mehrzonige Schnürung haben.",
  },
  {
    frage: "Sind wasserdichte Wanderschuhe wirklich dicht?",
    antwort:
      "Im Praxistest ja, im Labor nicht unbedingt. Bei den leichten Schuhen, die Que choisir prüfte, blieben im Praxistest alle bei einer Bachdurchquerung trocken; im Labortest durch hohes, nasses Gras drang beim Testsieger nach 15 Minuten Feuchtigkeit ein, beim Zweitplatzierten nach zehn. Im Warentest-Feld von 2022 blieben einige Schuhe sechs Stunden im Wasserbad dicht, andere waren deutlich früher durchfeuchtet.",
  },
  {
    frage: "Halbschuh oder hoher Schaft?",
    antwort:
      "Leichte Halbschuhe sind weicher und bequemer, stabilisieren den Knöchel aber nicht und dämpfen Stöße schwächer ab. Die Stiftung Warentest ordnet sie deshalb kurzen Wanderungen und Tagestouren in einfachem Gelände zu. Wer schweres Gepäck trägt oder über unebenes Gelände geht, nimmt den halbhohen Schaft.",
  },
  {
    frage: "Wann soll ich Wanderschuhe anprobieren?",
    antwort:
      "Nachmittags oder abends, weil die Füße über den Tag anschwellen. Die eigenen Wandersocken mitbringen, fest schnüren und im Laden herumgehen — der DAV rät ausdrücklich dazu, auf Stühle und Treppenstufen zu steigen, zu wippen und zu hüpfen. Vor der ersten großen Tour den Schuh mehrere Stunden einlaufen.",
  },
  {
    frage: "Was tun bei breiten Füßen?",
    antwort:
      "Nach dem Leisten gehen, nicht nach der Größe. Lowa weist für den Renegade einen Leisten für mittelbreite Füße aus, Meindl führt von mehreren Modellen eigene Weitvarianten, und amerikanische Marken wie Merrell gelten als breiter geschnitten. Die Testpersonen bei Que choisir bewerteten den Tragekomfort derselben Modelle sehr unterschiedlich — ein Hinweis darauf, dass die Passform die wichtigste Größe ist.",
  },
  {
    frage: "Was ist mit PFAS in Wanderschuhen?",
    antwort:
      "Que choisir fand in der Hälfte der geprüften Modelle per- und polyfluorierte Alkylsubstanzen. In der EU treten laut Stiftung Warentest ab Oktober 2026 schrittweise Verbote für PFAS in Schuhen und Textilien in Kraft. Beim Nachimprägnieren lässt sich der Stoffgruppe schon heute ausweichen.",
  },
];
