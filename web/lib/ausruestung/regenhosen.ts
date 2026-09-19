import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Regenhosen-Vergleich — von Hand zusammengestellt.
 *
 * Maßgeblich sind drei Dinge: wie dicht (Wassersäule), wie sie über den
 * Schuh geht (Seitenreißverschluss) und wie viel sie wiegt. Wassersäule und
 * Gewicht stammen von den Herstellerseiten oder aus dem Angebot; wo der
 * Hersteller keinen Wert nennt, steht null — dann zeigt die Seite „k. A.“
 * statt einer Zahl aus zweiter Hand.
 *
 * Eine ASIN je Passform genügt: Auf der Amazon-Seite wählt man die Größe.
 */

export type Zip = "durchgehend" | "dreiviertel" | "vorhanden" | "keiner";

export interface Regenhose {
  key: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  /** Wassersäule in mm laut Hersteller, sonst null. */
  wassersaeule: number | null;
  /** Gewicht in g laut Hersteller, sonst null. */
  gewicht: number | null;
  lagen: string;
  zip: Zip;
  pfas: string;
  herren?: string;
  damen?: string;
  unisex?: string;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const ZIP_NAME: Record<Zip, string> = {
  durchgehend: "durchgehend",
  dreiviertel: "3/4-lang",
  vorhanden: "ja, Länge k. A.",
  keiner: "keiner",
};

export const HOSEN: Regenhose[] = [
  {
    key: "fluid",
    name: "Fluid Full-Zip Pants II",
    marke: "Vaude",
    abzeichen: "Unsere erste Wahl",
    rolle: "Die Regenhose, die man über den Wanderschuh zieht, ohne sich hinzusetzen.",
    einordnung:
      "Durchgehende, teilbare und abgedeckte Reißverschlüsse an beiden Seiten: Die Hose lässt sich über Wanderstiefel anziehen, ohne die Schuhe auszuziehen. Vaude nennt für die Ceplex-Active-Membran eine Wassersäule von mindestens 10.000 Millimetern, gemessen nach JIS L 1092 B, und verzichtet auf PFAS. Zweilagig mit geteiltem Futter — oben Netz, unten Taft —, Knie vorgeformt, Beinabschluss mit Klett. Mit 400 Gramm ist sie keine Leichthose, dafür eine, die man auch den ganzen Tag trägt.",
    wassersaeule: 10000,
    gewicht: 400,
    lagen: "2 Lagen",
    zip: "durchgehend",
    pfas: "ohne PFAS laut Hersteller",
    herren: "B0018YQI4E",
    damen: "B003DI592A",
    dafuer: [
      "Durchgehende Seitenreißverschlüsse: an- und ausziehen mit Schuhen.",
      "Mindestens 10.000 mm Wassersäule laut Vaude.",
      "Ohne PFAS, Damen- und Herrenschnitt.",
      "Futter und vorgeformte Knie — auch für lange Regentage.",
    ],
    dagegen: [
      "400 Gramm — mehr als doppelt so schwer wie die Drop Pants.",
      "Zweilagig mit Futter: weniger luftig als eine 2,5-Lagen-Hose.",
    ],
    nichtFuer: "Wer eine Notfallhose sucht, die fast nichts wiegt. Dann die Drop Pants.",
  },
  {
    key: "drop",
    name: "Drop Pants II",
    marke: "Vaude",
    abzeichen: "Die leichteste",
    rolle: "Die Hose für den Rucksackboden — 180 Gramm für den Fall der Fälle.",
    einordnung:
      "Vaude gibt 180 Gramm an, 2,5 Lagen und dieselbe Membran wie bei der Fluid: mindestens 10.000 Millimeter Wassersäule, ohne PFAS. Sie kommt mit Packbeutel und ist eigentlich als Radhose gedacht, mit verstärktem Schritt und Gesäß und Reflektoren. Den Seitenreißverschluss spart sie sich; über den Schuh kommt man nur mit dem weitenregulierbaren Beinabschluss — je nach Schuh ein Gefummel.",
    wassersaeule: 10000,
    gewicht: 180,
    lagen: "2,5 Lagen",
    zip: "keiner",
    pfas: "ohne PFAS laut Hersteller",
    herren: "B081B2B9MB",
    damen: "B0D6BZVRQK",
    dafuer: [
      "180 Gramm mit Packbeutel.",
      "Mindestens 10.000 mm Wassersäule laut Vaude.",
      "Verstärkter Schritt und Gesäß.",
    ],
    dagegen: [
      "Kein Seitenreißverschluss: über hohe Stiefel nur mit Mühe.",
      "Kein Futter, eher für den Notfall als für den ganzen Regentag.",
    ],
    nichtFuer: "Wer sie oft und über schwere Bergstiefel anziehen muss.",
  },
  {
    key: "marmot",
    name: "PreCip Eco Full Zip Pant",
    marke: "Marmot",
    abzeichen: "Leicht mit Reißverschluss",
    rolle: "Durchgehender Reißverschluss bei rund 300 Gramm — der Mittelweg.",
    einordnung:
      "Laut Angebot 2,5 Lagen mit NanoPro-Eco-Membran aus recyceltem Nylon, durchgehende Seitenreißverschlüsse mit Druckknopf und Abdeckleisten, 320 Gramm für das Herrenmodell und 290 Gramm für das Damenmodell, das es auch extralang gibt. Eine Wassersäule nennt Marmot auf seiner Produktseite nicht.",
    wassersaeule: null,
    gewicht: 320,
    lagen: "2,5 Lagen",
    zip: "durchgehend",
    pfas: "PFC-frei laut Hersteller",
    herren: "B07FJ6Y5F1",
    damen: "B07L3Y2392",
    dafuer: [
      "Durchgehende Reißverschlüsse bei 320 g (Herren) bzw. 290 g (Damen).",
      "2,5 Lagen: luftiger als eine gefütterte Zweilagenhose.",
      "Damenmodell in Langgröße.",
    ],
    dagegen: [
      "Keine Wassersäule vom Hersteller angegeben.",
      "3 Lagen gelten laut DAV als langlebiger als 2,5.",
    ],
    nichtFuer: "Wer eine belegte Wassersäule als Kaufkriterium nimmt.",
  },
  {
    key: "schoeffel",
    name: "Rain Pants Elmori",
    marke: "Schöffel",
    abzeichen: "Unisex",
    rolle: "Zweilagig, voll getapt, mit Beinreißverschluss — ein Schnitt für alle.",
    einordnung:
      "Schöffel nennt 10.000 Millimeter Wassersäule, komplett getapte Nähte und eine Atmungsaktivität von 10.000 g/m² in 24 Stunden. Die Venturi-Membran ist zweilagig, Beinreißverschlüsse erleichtern das Anziehen über Schuhe und Stiefel. Die Hose ist unisex geschnitten — für manche Figuren ein Kompromiss.",
    wassersaeule: 10000,
    gewicht: null,
    lagen: "2 Lagen",
    zip: "vorhanden",
    pfas: "k. A.",
    unisex: "B0F9B5VFCV",
    dafuer: [
      "10.000 mm Wassersäule und getapte Nähte laut Hersteller.",
      "Beinreißverschlüsse für das Anziehen über Stiefel.",
      "Atmungsaktivität angegeben (10.000 g/m²/24 h).",
    ],
    dagegen: [
      "Unisex-Schnitt, keine eigene Damenpassform.",
      "Kein Gewicht, keine Angabe zu PFAS im Angebot.",
      "Länge des Beinreißverschlusses nicht angegeben.",
    ],
    nichtFuer: "Wer eine Damenpassform will.",
  },
  {
    key: "columbia",
    name: "Pouring Adventure III",
    marke: "Columbia",
    rolle: "Mit Oberschenkeltasche und Netzfutter — mehr Hose als Überzieher.",
    einordnung:
      "Columbia beschreibt eine wasserdichte, atmungsaktive, vollständig nahtversiegelte Hose aus recyceltem Nylon mit Netzfutter, dreiviertellangen Seitenreißverschlüssen und einer Oberschenkeltasche mit Reißverschluss. Wassersäule und Gewicht nennt Columbia nicht.",
    wassersaeule: null,
    gewicht: null,
    lagen: "mit Netzfutter",
    zip: "dreiviertel",
    pfas: "k. A.",
    herren: "B0D4F7MQ43",
    damen: "B0D4F94JS1",
    dafuer: [
      "Vollständig nahtversiegelt laut Hersteller.",
      "Tasche mit Reißverschluss am Oberschenkel.",
      "Damen- und Herrenmodell.",
    ],
    dagegen: [
      "Weder Wassersäule noch Gewicht angegeben.",
      "3/4-Reißverschluss: über hohe Stiefel enger als durchgehend.",
    ],
    nichtFuer: "Wer nach Zahlen kauft.",
  },
  {
    key: "cmp",
    name: "Regenhose mit seitlichen Reißverschlüssen",
    marke: "CMP",
    abzeichen: "Für Damen",
    rolle: "Einfache Damen-Regenhose mit durchgehenden Reißverschlüssen.",
    einordnung:
      "CMP nennt für die Clima-Protect-Membran eine Wassersäule von 10.000 Millimetern und eine Atmungsaktivität von 4.000 g/m² in 24 Stunden, dazu vollständig versiegelte Nähte. Die Reißverschlüsse laufen über das ganze Bein, unten schließt ein Klett. Die Hose lässt sich in die eigene Tasche falten. Die Atmungsaktivität ist die niedrigste angegebene in diesem Vergleich.",
    wassersaeule: 10000,
    gewicht: null,
    lagen: "Membran mit Thermolaminat",
    zip: "durchgehend",
    pfas: "k. A.",
    damen: "B07JJ7J1H1",
    dafuer: [
      "Durchgehende Seitenreißverschlüsse.",
      "10.000 mm Wassersäule und versiegelte Nähte laut Hersteller.",
      "In die eigene Tasche faltbar.",
    ],
    dagegen: [
      "Atmungsaktivität 4.000 g/m²/24 h — schwitzt man bergauf eher.",
      "Nur Damenmodell, kein Gewicht, keine Angabe zu PFAS.",
    ],
    nichtFuer: "Lange, steile Aufstiege im Regen.",
  },
];

/** Die ASIN, auf die Übersicht und Bericht verlinken: Herren vor Unisex vor Damen. */
export const hauptAsin = (h: Regenhose): string => (h.herren ?? h.unisex ?? h.damen)!;

export function alsProdukt(h: Regenhose): Produkt {
  const ws = h.wassersaeule ? `${h.wassersaeule.toLocaleString("de-DE")} mm` : "k. A.";
  return {
    asin: hauptAsin(h),
    name: h.name,
    marke: h.marke,
    abzeichen: h.abzeichen,
    rolle: h.rolle,
    einordnung: h.einordnung,
    kurz: [h.lagen, `Reißverschluss ${ZIP_NAME[h.zip]}`, h.gewicht ? `${h.gewicht} g` : null].filter(Boolean).join(" · "),
    eckdaten: [
      ["Wassersäule", h.wassersaeule ? `${ws} laut Hersteller` : "nicht angegeben"],
      ["Gewicht", h.gewicht ? `${h.gewicht} g laut Hersteller` : "nicht angegeben"],
      ["Aufbau", h.lagen],
      ["Seitenreißverschluss", ZIP_NAME[h.zip]],
      ["PFAS", h.pfas],
      ["Passform", [h.herren && "Herren", h.damen && "Damen", h.unisex && "Unisex"].filter(Boolean).join(", ")],
    ],
    kennwert: { wert: ws, unter: "Wassersäule" },
    dafuer: h.dafuer,
    dagegen: h.dagegen,
    nichtFuer: h.nichtFuer,
  };
}

export const QUELLEN = {
  davWetterschutz:
    "https://www.alpenverein.de/artikel/wie-funktioniert-das-wetterschutzbekleidung_92524e64-3fc4-4f8d-aee3-d3c3b140dcfb",
  davOutfit: "https://www.alpenverein.de/artikel/das-richtige-wanderoutfit_cff0a90c-1323-40b0-ae4d-7247a313c845",
  warentestJacken: "https://www.test.de/Wanderjacken-im-Test-Viele-sind-nicht-ganz-dicht-6160402-0/",
  warentestMethode: "https://www.test.de/Funktionsjacken-im-Test-So-haben-wir-getestet-5060339-5060345/",
  vaudeFluid: "https://www.vaude.com/int/en/06343-fluid-full-zip-ii-rain-pants-men-s.html",
  vaudeDrop: "https://www.vaude.com/int/en/04981-drop-ii-rain-pants-men-s.html",
  marmot: "https://www.marmot.com/p/womens-precip-eco-pants/SP_219657/AFS_889169479540.html",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Wie viel Wassersäule braucht eine Regenhose?",
    antwort:
      "Nach DIN gilt ein Stoff ab 1.300 Millimetern Wassersäule als wasserdicht. Weil Sitzen und Knien den Druck erhöhen, empfiehlt die Eidgenössische Materialprüfanstalt (EMPA) laut DAV mindestens 4.000 Millimeter. Die Regenhosen mit Herstellerangabe in diesem Vergleich nennen 10.000 Millimeter.",
  },
  {
    frage: "Braucht eine Regenhose einen Seitenreißverschluss?",
    antwort:
      "Zum Wandern ja, wenn man die Hose unterwegs anzieht: Ein durchgehender Reißverschluss erlaubt es, sie über Wanderstiefel zu ziehen, ohne die Schuhe auszuziehen. Ohne Reißverschluss geht das nur mit schlanken Schuhen und weitem Beinabschluss.",
  },
  {
    frage: "2, 2,5 oder 3 Lagen?",
    antwort:
      "Der DAV beschreibt Zweilagen-Laminate als leicht und bequem mit eingenähtem Futter, 2,5 Lagen als sehr leicht und luftig mit aufgedrucktem Schutzmuster statt Futter, und 3 Lagen als etwas steifer, aber besonders leistungsfähig und langlebig.",
  },
  {
    frage: "Was sagt die Wassersäule nicht?",
    antwort:
      "Ob die Nähte dicht sind. In einem Test des Schweizer Magazins Saldo, über den die Stiftung Warentest berichtete, hielt eine Jacke mit 24.000 Millimetern Wassersäule im Labor-Dauerregen nur etwa fünf Minuten dicht. Die Schwachstelle vieler Jacken waren die Nähte.",
  },
  {
    frage: "Wie wasche ich eine Regenhose?",
    antwort:
      "Laut DAV regelmäßig waschen, weil Schweiß und Schmutz die Funktion behindern: Pflegeleichtprogramm bei 40 Grad, Reißverschlüsse vorher schließen, an der Luft oder im Trockner trocknen. 20 zusätzliche Minuten im Trockner reaktivieren die Imprägnierung; lässt der Oberstoff trotzdem Wasser durch, mit Pumpspray oder Einwaschmittel nachimprägnieren. Das Etikett geht vor.",
  },
  {
    frage: "Was bedeutet PFAS-frei bei Regenhosen?",
    antwort:
      "PFAS sind fluorierte Chemikalien, die als Imprägnierung Wasser und Schmutz abweisen, sich aber in der Umwelt anreichern. Für Jacken nennt der DAV eine Imprägnierung ohne Fluorkarbone aus Umweltsicht ideal. Vaude nennt für beide Vaude-Hosen in diesem Vergleich eine Ausrüstung ohne PFAS.",
  },
];
