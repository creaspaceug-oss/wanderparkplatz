import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Rucksackvergleich — von Hand zusammengestellt.
 *
 * Nach der Suchnachfrage gebaut: "wanderrucksack damen" wird fast halb so
 * oft gesucht wie der Hauptbegriff (9.900 gegen 22.200 im Monat). Deshalb
 * steht zu jedem Rucksack die Damen-Ausführung dabei, wo es eine gibt.
 *
 * Alle Angaben aus den Herstellertexten zum jeweiligen Artikel. Gewichte
 * nennen die Hersteller hier fast nie — belegt sind nur zwei. Wo nichts
 * steht, steht das da.
 *
 * Zu den Tests: Die Stiftung Warentest hat keinen eigenen Rucksacktest
 * veröffentlicht, sondern über zwei Tests ausländischer Partner berichtet —
 * 2019 über die Schweizer Zeitschrift Saldo, 2021 über das tschechische
 * dTest. Beide nennen Rangfolgen, keine Noten, und die Modelle sind
 * seitdem teils überarbeitet worden.
 */

export interface Rucksack {
  asin: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  liter: number;
  ruecken: "Netzrücken" | "Kontaktrücken" | "Netzrücken mit Metallrahmen";
  rueckenDetail: string;
  /** Gramm laut Hersteller- oder Händlerangabe; null, wenn keine genannt ist. */
  gramm: number | null;
  grammQuelle?: string;
  rueckenlaengeVerstellbar: boolean | null;
  regenhuelle: boolean | null;
  trinkblase: boolean | null;
  besonderheit: string;
  /** Die Damen-Ausführung, falls es eine gibt. */
  damen?: { asin: string; name: string; liter: number; hinweis?: string };
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const RUCKSAECKE: Rucksack[] = [
  {
    asin: "B0FHKWGD68",
    name: "Futura 27",
    marke: "Deuter",
    abzeichen: "Unsere erste Wahl",
    rolle: "Der Tagesrucksack, an dem sich die anderen messen lassen müssen.",
    einordnung:
      "Ein gespanntes Netz hält den Rucksack auf Abstand zum Rücken. Das klingt nach Kleinigkeit und ist im Aufstieg an einem warmen Tag der größte Unterschied, den ein Rucksack machen kann. In der aktuellen Ausführung ist das Netz im Lendenbereich breiter und weicher geworden, die Schulterträger bewegen sich mit. Regenhülle inklusive.",
    liter: 27,
    ruecken: "Netzrücken",
    rueckenDetail: "Aircomfort-Netzrücken",
    gramm: null,
    rueckenlaengeVerstellbar: null,
    regenhuelle: true,
    trinkblase: null,
    besonderheit: "bewegliche Schulterträger, Hüftflossen zum Nachziehen nach vorn",
    damen: { asin: "B0FHL3Z58N", name: "Futura 25 SL", liter: 25 },
    dafuer: [
      "Netzrücken: Zwischen Rücken und Rucksack bleibt Luft. Im Lendenbereich, wo man am meisten schwitzt, ist das Netz verbreitert.",
      "Hüftflossen mit Pull-Forward-Verstellung: Man zieht den Gurt nach vorn fest statt zur Seite, das geht auch mit kalten Fingern.",
      "Regenhülle dabei.",
      "Die Damen-Ausführung Futura 25 SL mit derselben Bauweise.",
    ],
    dagegen: [
      "Deuter nennt kein Gewicht. Ein Netzrücken mit Rahmen wiegt mehr als ein Rucksack ohne.",
      "Durch das Netz rückt der Inhalt vom Rücken weg. Das belüftet, verlagert aber den Schwerpunkt ein Stück nach hinten.",
      "Ob sich die Rückenlänge verstellen lässt und ob es ein Fach für eine Trinkblase gibt, steht in den Angaben zur aktuellen Ausführung nicht.",
    ],
    nichtFuer:
      "Wer in Kletterpassagen und auf schmalen Graten unterwegs ist, wo ein Rucksack eng am Körper sitzen muss. Dafür ist ein Kontaktrücken wie beim Osprey Talon gebaut.",
  },
  {
    asin: "B0D6BXNYCK",
    name: "Brenta 24",
    marke: "Vaude",
    abzeichen: "Rückenlänge verstellbar",
    rolle: "Die Reihe, die im Schweizer Test vorn lag — mit verstellbarer Rückenlänge.",
    einordnung:
      "Im Test der Schweizer Zeitschrift Saldo, über den die Stiftung Warentest 2019 berichtete, lag der Brenta 25 vor sieben anderen Rucksäcken, mit dem besten Tragekomfort und dem besten Ergebnis im Regentest. Heute führt Vaude die Reihe unter anderem als Brenta 24. Ob er baugleich mit dem getesteten Modell ist, sagt Vaude nicht.",
    liter: 24,
    ruecken: "Netzrücken",
    rueckenDetail: "Netzrücken mit Rückenbelüftung",
    gramm: null,
    rueckenlaengeVerstellbar: true,
    regenhuelle: true,
    trinkblase: true,
    besonderheit: "Hüftflügel mit Tasche, ohne PFAS ausgerüstet",
    damen: { asin: "B0D6BYPP7Q", name: "Brenta 28 Damen", liter: 28, hinweis: "frauenspezifische Konstruktion" },
    dafuer: [
      "Rückenlänge verstellbar — neben dem Osprey Talon der einzige Rucksack hier, bei dem der Hersteller das ausdrücklich angibt.",
      "Integrierte, abnehmbare Regenhülle und eine Stockhalterung.",
      "Tasche am Hüftflügel für Handy oder Riegel.",
      "Wasserabweisend ohne PFAS ausgerüstet und laut Vaude auf Reparatur ausgelegt.",
    ],
    dagegen: [
      "Der Testsieg liegt sieben Jahre zurück und galt dem Vorgänger. Über die heutige Ausführung sagt er nichts Sicheres.",
      "Kein Gewicht angegeben.",
      "Die Damen-Ausführung hat 28 statt 24 Liter — wer beide vergleicht, vergleicht zwei Größen.",
    ],
    nichtFuer:
      "Wer für Hüttentouren packt. 24 Liter reichen für den Tag, nicht für Schlafsack und Wechselwäsche.",
  },
  {
    asin: "B0B21SBFT6",
    name: "Zugspitze 24",
    marke: "Deuter",
    abzeichen: "Preis-Leistung",
    rolle: "Netzrücken zum kleineren Preis — im selben Schweizer Test gelobt.",
    einordnung:
      "Im Saldo-Test von 2019 überzeugte der Zugspitze neben dem Testsieger. Er nutzt dasselbe Aircomfort-Netz wie der Futura, gespannt von einem Rahmen aus Federstahl, der die Last auf den Hüftgurt bringt — nur schlichter und günstiger. Für Tagestouren im Mittelgebirge braucht man nicht mehr.",
    liter: 24,
    ruecken: "Netzrücken",
    rueckenDetail: "Aircomfort-Netzrücken, Rundprofilrahmen aus Federstahl",
    gramm: null,
    rueckenlaengeVerstellbar: null,
    regenhuelle: true,
    trinkblase: null,
    besonderheit: "Hüftpolster nach der Beckenform geformt",
    damen: { asin: "B0B21QTB7N", name: "Zugspitze 22 SL", liter: 22 },
    dafuer: [
      "Dasselbe Aircomfort-Netz wie beim Futura, zum deutlich kleineren Preis.",
      "Abnehmbare Regenhülle mit eigenem Staufach.",
      "Im Schweizer Test 2019 neben dem Testsieger hervorgehoben.",
    ],
    dagegen: [
      "Keine Angabe zu einer Vorrichtung für die Trinkblase.",
      "Kein Gewicht angegeben.",
      "Weniger Taschen und Details als beim Futura — das ist der Preisunterschied.",
    ],
    nichtFuer: "Wer viel verstauen will und Ordnung in vielen Fächern schätzt. Dann lieber der Futura.",
  },
  {
    asin: "B097Q25692",
    name: "Speed Lite 25",
    marke: "Deuter",
    abzeichen: "710 Gramm",
    rolle: "Für schnelle Touren, wenn jedes Gramm zählt.",
    einordnung:
      "710 Gramm bei 25 Litern — das ist das einzige belastbare Gewicht in diesem Vergleich, und es ist niedrig. Dafür nennt Deuter kein Belüftungssystem. Der Rucksack liegt direkt am Rücken und ist für Leute gebaut, die zügig gehen und wenig tragen.",
    liter: 25,
    ruecken: "Kontaktrücken",
    rueckenDetail: "kein Belüftungssystem angegeben",
    gramm: 710,
    grammQuelle: "Herstellerangabe",
    rueckenlaengeVerstellbar: null,
    regenhuelle: null,
    trinkblase: true,
    besonderheit: "Handytasche am Schulterträger, recyceltes Material",
    dafuer: [
      "710 g — der leichteste Rucksack hier, für den ein Gewicht genannt ist.",
      "Tasche am Schulterträger für Handy, GPS oder Riegel, ohne den Rucksack abzusetzen.",
      "Kompressionsriemen an der Seite: halb voll bleibt er schmal.",
      "Hauptmaterial aus recyceltem Material, bluesign-zertifiziert.",
    ],
    dagegen: [
      "Keine Belüftung angegeben. Im Sommeraufstieg wird der Rücken nass.",
      "Keine Regenhülle genannt.",
      "Keine Damen-Ausführung in dieser Größe.",
    ],
    nichtFuer: "Wer mehr als sieben, acht Kilo trägt. Leichte Rucksäcke sparen am Tragesystem.",
  },
  {
    asin: "B0DSCP1V9L",
    name: "Talon 26",
    marke: "Osprey",
    abzeichen: "Sitzt eng am Körper",
    rolle: "Nah am Körper, mit Taschen am Hüftgurt — für bewegte Touren.",
    einordnung:
      "Osprey setzt statt eines Netzes auf ein Rückenteil aus Schaumstoff mit Kanälen, das eng anliegt und trotzdem Luft lässt. Der Rucksack bewegt sich mit, statt hinterherzuschwingen. Dazu Befestigungen für Stöcke, Helm und Eispickel und Taschen am Hüftgurt. Die Damen-Ausführung heißt Tempest.",
    liter: 26,
    ruecken: "Kontaktrücken",
    rueckenDetail: "AirScape-Rückenteil aus Schaumstoff",
    gramm: 1100,
    grammQuelle: "Händlerangabe",
    rueckenlaengeVerstellbar: true,
    regenhuelle: null,
    trinkblase: true,
    besonderheit: "Stock-, Helm- und Eispickelbefestigung, Hüftgurttaschen",
    damen: {
      asin: "B0BTRJX3NS",
      name: "Tempest 20, erweiterte Passform",
      liter: 20,
      hinweis: "für Hüftumfang bis 178 cm",
    },
    dafuer: [
      "Liegt eng am Rücken. In Kletterstellen und auf Graten schwingt nichts nach.",
      "Rückenlänge über eine verschiebbare Schulterpasse einstellbar.",
      "Stöcke lassen sich im Gehen verstauen, ohne den Rucksack abzunehmen.",
      "Taschen am Hüftgurt und ein eigenes Fach für die Trinkblase.",
      "Die Damen-Ausführung gibt es in erweiterter Passform für einen Hüftumfang bis 178 Zentimeter — das bietet kaum ein anderer Hersteller.",
    ],
    dagegen: [
      "Der teuerste Tagesrucksack in diesem Vergleich.",
      "Das Gewicht von 1,1 kg stammt aus dem Händlertext, nicht von Osprey.",
      "Kein Netz: Mehr Belüftung als ein flacher Rücken, weniger als ein gespanntes Netz.",
    ],
    nichtFuer: "Wer vor allem im Sommer schwitzt. Dann ist ein Netzrücken angenehmer.",
  },
  {
    asin: "B08JQXWNDK",
    name: "Futura Pro 40",
    marke: "Deuter",
    abzeichen: "Für Hüttentouren",
    rolle: "Für mehrere Tage von Hütte zu Hütte.",
    einordnung:
      "Derselbe Netzrücken wie beim Futura 27, aber mit 40 Litern und beweglichen Hüftflossen, die sich um die Hüfte legen. Ein Bergführer nennt 40 Liter für eine Woche mit Hüttenübernachtungen „üppig und ausreichend“. Wer mit Zelt unterwegs ist, braucht mehr — dafür ist dieser Rucksack nicht gebaut.",
    liter: 40,
    ruecken: "Netzrücken",
    rueckenDetail: "Aircomfort-Netzrücken mit Federstahlrahmen",
    gramm: null,
    rueckenlaengeVerstellbar: null,
    regenhuelle: null,
    trinkblase: null,
    besonderheit: "bewegliche VariFlex-Hüftflossen",
    damen: { asin: "B08JQYXSTP", name: "Futura Pro 38 SL", liter: 38 },
    dafuer: [
      "40 Liter reichen für eine Woche von Hütte zu Hütte, sagt ein Bergführer.",
      "Hüftflossen, die sich mitbewegen. Bei schwerem Gepäck trägt die Hüfte, nicht die Schulter.",
      "Damen-Ausführung mit 38 Litern.",
    ],
    dagegen: [
      "Für eine Tagestour zu groß. Ein halb leerer 40-Liter-Rucksack schwappt.",
      "Weder Gewicht noch Regenhülle stehen in den Angaben.",
      "Für Touren mit Zelt zu klein.",
    ],
    nichtFuer: "Tagestouren. Dafür ist der Futura 27 die bessere Wahl.",
  },
  {
    asin: "B0BX2YWLTG",
    name: "Wanderrucksack 30L",
    marke: "SKYSPER",
    abzeichen: "Günstigster",
    rolle: "Zum Ausprobieren, ob Wandern mehr wird als ein Hobby für zwei Sonntage.",
    einordnung:
      "Eine Marktplatzmarke zu einem Bruchteil des Preises. Auf dem Papier bringt er alles mit: Metallrahmen, Netzrücken, Lageverstellriemen, Regenhülle im Bodenfach. Wie gut das zusammen trägt, hat niemand geprüft, den wir zitieren könnten — und im tschechischen Test von 2021 hatten gerade die beiden billigsten Rucksäcke Probleme mit Gurten und Schnallen.",
    liter: 30,
    ruecken: "Netzrücken mit Metallrahmen",
    rueckenDetail: "Metallrahmen mit Rückennetz",
    gramm: 1105,
    grammQuelle: "Händlerangabe",
    rueckenlaengeVerstellbar: null,
    regenhuelle: true,
    trinkblase: true,
    besonderheit: "vier Fächer, Lageverstellriemen, Signalpfeife",
    dafuer: [
      "Mit Abstand der günstigste Rucksack hier.",
      "Netzrücken mit Metallrahmen — dieselbe Idee wie bei den teuren Modellen.",
      "Regenhülle im eigenen Bodenfach, vorbereitet für eine Trinkblase, Stockbefestigung.",
    ],
    dagegen: [
      "1.105 Gramm laut Händler — so viel wie der Osprey Talon, der ein Vielfaches kostet.",
      "Keine Angaben zur Rückenlänge und keine Damen-Ausführung.",
      "Im Test von 2021 hielten beim 13-Euro-Rucksack die Gurte nicht, beim 40-Euro-Rucksack rutschten sie durch die Schnallen. Das waren andere Modelle — aber genau dort spart man in dieser Preisklasse.",
    ],
    nichtFuer: "Hüttentouren mit schwerem Gepäck. Dort trägt der Hüftgurt den Tag, und an ihm spart man zuerst.",
  },
];

/** Der Rucksack in der Form, die die gemeinsamen Bausteine verstehen. */
export function alsProdukt(r: Rucksack): Produkt {
  const jaNein = (x: boolean | null, ja: string) => (x === null ? "keine Angabe" : x ? ja : "nein");
  return {
    ...r,
    kurz: [`${r.liter} l`, r.ruecken, r.gramm ? `${r.gramm} g` : null].filter(Boolean).join(" · "),
    eckdaten: [
      ["Volumen", `${r.liter} Liter`],
      ["Rücken", r.rueckenDetail],
      ["Gewicht", r.gramm ? `${r.gramm} g (${r.grammQuelle})` : "nicht genannt"],
      ["Rückenlänge", jaNein(r.rueckenlaengeVerstellbar, "verstellbar")],
      ["Regenhülle", jaNein(r.regenhuelle, "dabei")],
      ["Damen-Ausführung", r.damen ? `${r.damen.name}, ${r.damen.liter} l` : "keine"],
    ],
    kennwert: { wert: `${r.liter} l`, unter: r.ruecken },
  };
}

export const TESTS = {
  saldo: {
    url: "https://www.test.de/Wanderrucksaecke-im-Test-Vaude-schlaegt-Mammut-5474834-0/",
    datum: "27. Mai 2019",
  },
  dtest: {
    url: "https://www.test.de/Rucksaecke-im-Test-Die-besten-fuer-Tagestouren-5754391-0/",
    datum: "30. Mai 2021",
  },
};

export const QUELLEN = {
  rueckenlaenge: "https://www.deuter.com/lu-de/beratung/rueckenlaenge-messen/",
  alpenverein: "https://alpenverein.it/rucksack-richtig-packen-und-einstellen/",
  bergfuehrer: "https://akademie.alpinewelten.com/bergwandern/wanderrucksack",
  volumen: "https://www.bergzeit.de/magazin/rucksack-groesse-volumen/",
};

/**
 * Volumen nach Tourart — die Grundlage des Rechners.
 *
 * Die Spannen stammen aus zwei Quellen, die sich decken: Bergzeit nennt 18
 * bis 25 Liter für Tagestouren, 25 bis 35 für Hütten, 45 bis 65 mit Zelt;
 * die Bergführer von Alpinewelten nennen 20, 30 bis 35 und 40 Liter für eine
 * Woche auf Hütten. Im Winter laut Bergzeit meist eine Größenklasse mehr.
 */
export const TOUREN = [
  { k: "tag", text: "Tagestour", unter: "ohne Übernachtung", von: 18, bis: 25 },
  { k: "huette", text: "Hütte, 1–2 Nächte", unter: "Hüttenschlafsack, Wechselwäsche", von: 25, bis: 35 },
  { k: "woche", text: "Hüttentour, eine Woche", unter: "von Hütte zu Hütte", von: 35, bis: 40 },
  { k: "zelt", text: "Mit Zelt", unter: "Zelt, Schlafsack, Kocher", von: 45, bis: 65 },
] as const;

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Wie viel Liter brauche ich für eine Tagestour?",
    antwort:
      "18 bis 25 Liter. Das reicht für Regenjacke, eine zusätzliche Schicht, Proviant und Wasser. Für eine Hüttentour mit einer oder zwei Übernachtungen 25 bis 35 Liter, im Winter jeweils eine Größenklasse mehr.",
  },
  {
    frage: "Wie messe ich meine Rückenlänge?",
    antwort:
      "Vom hervorstehenden siebten Halswirbel — er tritt heraus, wenn du den Kopf nach vorn neigst — bis zur Oberkante des Beckenkamms, gemessen entlang der Wirbelsäule. Am einfachsten zu zweit, mit einem Gürtel auf Höhe der Hüftknochen als Markierung.",
  },
  {
    frage: "Brauchen Frauen einen Damenrucksack?",
    antwort:
      "Deuter empfiehlt Frauen, wegen der Passform immer ein SL-Modell zu wählen. Damenmodelle haben ein kürzeres Tragesystem und sind an die weibliche Anatomie angepasst. Entscheidend bleibt, dass die Rückenlänge passt und der Hüftgurt auf dem Beckenkamm sitzt.",
  },
  {
    frage: "Netzrücken oder Kontaktrücken?",
    antwort:
      "Ein Netzrücken hält den Rucksack auf Abstand, der Rücken schwitzt weniger, dafür liegt der Schwerpunkt etwas weiter hinten. Ein Kontaktrücken sitzt eng und stabil — besser in Kletterstellen und bei schnellen Bewegungen. Für Tagestouren im Sommer spricht fast alles für das Netz.",
  },
  {
    frage: "Wie stelle ich den Rucksack richtig ein?",
    antwort:
      "Alle Gurte lockern, beladen aufsetzen, Hüftgurt mittig auf die Hüftknochen legen und festziehen, dann die Schultergurte, dann den Brustgurt, zuletzt die Lageverstellriemen. Der Hüftgurt soll 70 bis 80 Prozent des Gewichts tragen.",
  },
  {
    frage: "Ist ein Wanderrucksack wasserdicht?",
    antwort:
      "Fast nie. Die meisten sind wasserabweisend, bei Dauerregen dringt Wasser an Nähten und Reißverschlüssen ein. Eine Regenhülle hilft, ein Packsack innen hilft zuverlässiger. Im Schweizer Test von 2019 wurde ausgerechnet der teuerste Rucksack im Regen durchnässt.",
  },
  {
    frage: "Wie schwer darf ein Wanderrucksack sein?",
    antwort:
      "Je leichter, desto besser — eine feste Grenze gibt es nicht. Als Maßstab: Für eine siebentägige Alpenüberquerung empfehlen Bergführer höchstens 8 Kilo Gesamtgewicht. Für eine Tagestour sollte es entsprechend deutlich weniger sein.",
  },
  {
    frage: "Hat die Stiftung Warentest Wanderrucksäcke getestet?",
    antwort:
      "Nicht selbst. Sie hat über zwei Tests ausländischer Partner berichtet: 2019 über die Schweizer Zeitschrift Saldo, bei der der Vaude Brenta 25 vorn lag, und 2021 über das tschechische dTest, bei dem der Deuter Trans Alpine 30 gewann. Noten wurden nicht vergeben, nur Rangfolgen.",
  },
];

/**
 * Der Testsieger von 2021. Deuter verkauft ihn heute als Fahrradrucksack,
 * und die aktuelle Ausführung ist nicht die getestete — deshalb kein
 * Platz in der Auswahl, sondern ein Hinweis im Testkapitel.
 */
export const TESTSIEGER_2021 = { asin: "B0C822N4MM", marke: "Deuter", name: "Trans Alpine 30" };
