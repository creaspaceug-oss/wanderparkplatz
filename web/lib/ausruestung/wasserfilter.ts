import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Wasserfilter-Vergleich — von Hand zusammengestellt.
 *
 * Wasserfilter unterscheiden sich weniger in der Marke als im Prinzip:
 * Hohlfasermembran zum Drücken oder Saugen, Pumpe, Filterflasche mit
 * Virenschutz, Tabletten. Was ein Filter zurückhält, hängt an der
 * Porengröße; die Einordnung folgt der US-Gesundheitsbehörde CDC (Filter
 * bis 1 µm halten Parasiten zurück, bis 0,3 µm auch Bakterien, Viren nicht).
 * Alle Produktangaben aus den Herstellertexten zum jeweiligen Artikel.
 *
 * Die Stiftung Warentest hat laut eigener Auskunft (März 2024) keine
 * Reisefilter untersucht; berichtet hat sie 2008 über einen Schweizer Test.
 */

export type Prinzip = "Squeeze" | "Filterflasche" | "Strohhalm" | "Pumpe" | "Presse" | "Tabletten";

export interface Wasserfilter {
  asin: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  prinzip: Prinzip;
  /** Porengröße in Mikrometern, falls angegeben. */
  poren: number | null;
  /** Hält laut Hersteller Viren zurück bzw. tötet sie ab. */
  viren: boolean;
  /** Liter bis zum Austausch laut Hersteller; null, wenn keine Angabe. */
  liter: number | null;
  /** Liter pro Minute laut Hersteller. */
  durchfluss: number | null;
  gramm: number | null;
  besonderheit: string;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const FILTER: Wasserfilter[] = [
  {
    asin: "B075X5R67T",
    name: "BeFree 1,0 l",
    marke: "Katadyn",
    abzeichen: "Unsere erste Wahl",
    rolle: "Flasche in den Bach, Deckel drauf, trinken — der einfachste Filter für Wanderer.",
    einordnung:
      "Eine faltbare Weichflasche mit einem Filter im Deckel: 0,1-Mikrometer-Hohlfasermembran, 63 Gramm, laut Katadyn 2 Liter pro Minute und 1000 Liter bis zum Austausch. Getestet nach EPA-Standard auf 99,9999 Prozent Bakterien und 99,9 Prozent Giardia und Cryptosporidium. Zum Reinigen schüttelt man den Filter im Wasser, eine Rückspülung braucht es nicht. Die Bergwelten-Redaktion nennt Hohlfaserfilter wie diesen die praktischste Lösung für die Alpen.",
    prinzip: "Filterflasche",
    poren: 0.1,
    viren: false,
    liter: 1000,
    durchfluss: 2,
    gramm: 63,
    besonderheit: "Reinigung durch Schütteln, faltbar",
    dafuer: [
      "63 g und faltbar — passt in jede Jackentasche.",
      "2 Liter pro Minute: trinken, ohne kräftig zu drücken.",
      "Reinigen durch Schütteln im Wasser, ohne Werkzeug.",
      "Filterleistung nach EPA-Standard angegeben.",
    ],
    dagegen: [
      "Keine Viren: Die Membran hält laut Katadyn nichts unter 0,1 Mikrometer zurück.",
      "Frostempfindlich: Eine gefrorene Membran kann laut Anleitung Keime durchlassen.",
    ],
    nichtFuer: "Reisen in Länder mit unsicherem Trinkwasser. Dafür braucht es Virenschutz.",
  },
  {
    asin: "B00B1OSU4W",
    name: "Squeeze SP129",
    marke: "Sawyer",
    abzeichen: "Vielseitig",
    rolle: "Der Filter für alles: drücken, saugen, an die Flasche schrauben, an die Trinkblase hängen.",
    einordnung:
      "Ein Inline-Filter mit 0,1-Mikrometer-Hohlfasermembran, dazu ein faltbarer Beutel. Man füllt den Beutel am Bach und drückt das Wasser durch den Filter in die Flasche oder in den Mund — oder schraubt den Filter auf eine gewöhnliche PET-Flasche. Sawyer gibt 99,9999 Prozent Bakterien und 99,999 Prozent Protozoen an. Die Bergwelten-Redaktion nennt ihn neben der BeFree als typischen Hohlfaserfilter.",
    prinzip: "Squeeze",
    poren: 0.1,
    viren: false,
    liter: null,
    durchfluss: null,
    gramm: null,
    besonderheit: "passt auf handelsübliche Flaschengewinde",
    dafuer: [
      "Passt auf gewöhnliche Flaschen mit Gewinde — kein eigenes System nötig.",
      "Als Filter vor der Trinkblase oder zum Befüllen für mehrere nutzbar.",
      "Beutel faltbar, laut Sawyer hunderte Male wiederverwendbar.",
    ],
    dagegen: [
      "Keine Viren.",
      "Weder Gewicht noch Kapazität noch Durchfluss im Angebot.",
      "Mehr Einzelteile als die BeFree: Filter, Beutel, Verschlusskappe.",
    ],
    nichtFuer: "Wer nur schnell aus dem Bach trinken will. Dafür ist die BeFree einfacher.",
  },
  {
    asin: "B00TOX6UM6",
    name: "Mini",
    marke: "Sawyer",
    abzeichen: "56 Gramm",
    rolle: "Der kleine Bruder — für den Notfall im Rucksack oder als Strohhalm.",
    einordnung:
      "Die Mini hat dieselbe 0,1-Mikrometer-Membran in einem Gehäuse, das in die Handfläche passt, und wiegt laut Sawyer 56 Gramm. Man trinkt mit dem beiliegenden Strohhalm direkt aus dem Bach, schraubt sie an eine Flasche oder hängt sie in den Schlauch einer Trinkblase. Sawyer gibt 99,99999 Prozent Bakterien und 99,9999 Prozent Protozoen an.",
    prinzip: "Squeeze",
    poren: 0.1,
    viren: false,
    liter: null,
    durchfluss: null,
    gramm: 56,
    besonderheit: "als Strohhalm oder in der Trinkblase",
    dafuer: [
      "56 g, handtellergroß.",
      "Strohhalm, Flasche oder Trinkblase — alles möglich.",
      "Günstig.",
    ],
    dagegen: [
      "Kein Durchfluss im Angebot — bei kleinen Filtern muss man meist kräftiger saugen oder drücken.",
      "Keine Viren, keine Kapazitätsangabe im Angebot.",
    ],
    nichtFuer: "Gruppen, die viele Liter auf einmal filtern wollen. Dafür ist die Pumpe gebaut.",
  },
  {
    asin: "B09SBPP9R9",
    name: "Peak Straw",
    marke: "LifeStraw",
    abzeichen: "Unbegrenzt lagerbar",
    rolle: "Der Strohhalm, der in jeder Notfalltasche liegt — auch für Jahre.",
    einordnung:
      "Nach LifeStraw wird in Deutschland öfter gesucht als nach jedem anderen Filterhersteller hier. Der Peak-Strohhalm wiegt 65 Gramm, man trinkt direkt aus See oder Bach oder steckt ihn in eine Flasche. LifeStraw nennt 99,999999 Prozent Bakterien, 99,999 Prozent Parasiten und 99,999 Prozent Mikroplastik und gibt an, der Filter sei unbegrenzt lagerfähig. Ein Rückspülzubehör ist dabei.",
    prinzip: "Strohhalm",
    poren: null,
    viren: false,
    liter: null,
    durchfluss: null,
    gramm: 65,
    besonderheit: "unbegrenzt lagerfähig laut Hersteller",
    dafuer: [
      "Liegt jahrelang im Rucksack, ohne zu altern — laut LifeStraw.",
      "65 g, keine Einzelteile.",
      "Rückspülzubehör dabei.",
    ],
    dagegen: [
      "Vor allem zum direkten Trinken gedacht: Wasser für Kochen oder Trinkblase lässt sich damit nur mühsam abfüllen.",
      "Keine Viren, keine Kapazität und keine Porengröße im Angebot.",
    ],
    nichtFuer: "Mehrtägige Touren, auf denen man Liter für den Tag abfüllen will.",
  },
  {
    asin: "B093VHYHWW",
    name: "GeoPress 710 ml",
    marke: "Grayl",
    abzeichen: "Mit Virenschutz",
    rolle: "Die Flasche für Reisen — sie hält auch Viren und viele Chemikalien zurück.",
    einordnung:
      "Die GeoPress funktioniert wie eine Kaffeepresse: Wasser in den Außenbecher, Innenbecher mit Filterkartusche hineindrücken, fertig. Grayl gibt an, dass sie Viren wie Norovirus, Rotavirus und Hepatitis A entfernt, dazu Bakterien, Protozoen, Mikroplastik, viele Chemikalien und Schwermetalle. Eine Kartusche reicht laut Grayl für 250 Liter. Die Bergwelten-Redaktion hält Filterflaschen mit Virenbarriere in den Alpen meist für überdimensioniert, auf Reisen in Länder mit unsicherer Trinkwasserhygiene aber für eine kompakte Lösung.",
    prinzip: "Presse",
    poren: null,
    viren: true,
    liter: 250,
    durchfluss: null,
    gramm: null,
    besonderheit: "entfernt laut Hersteller auch Viren und Chemikalien",
    dafuer: [
      "Einziger Filter hier, der laut Hersteller auch Viren zurückhält.",
      "Filtert laut Grayl auch Chlor, Benzol, Blei und andere Stoffe.",
      "Kein Pumpen, keine Batterie, keine Wartezeit.",
    ],
    dagegen: [
      "Die Kartusche reicht nur für 250 Liter.",
      "Größer als ein Hohlfaserfilter, ein Gewicht nennt das Angebot nicht.",
      "Die teuerste Lösung hier, im Kauf und im Betrieb.",
    ],
    nichtFuer: "Wanderungen in den Alpen und im Mittelgebirge. Dort reicht ein Hohlfaserfilter.",
  },
  {
    asin: "B075TTTX2R",
    name: "Hiker Pro",
    marke: "Katadyn",
    abzeichen: "Für Gruppen",
    rolle: "Pumpen statt drücken — für mehrere Personen und trübes Wasser.",
    einordnung:
      "Ein Pumpfilter mit 0,2-Mikrometer-Glasfaserfilter und Aktivkohlekern, der laut Katadyn Geschmack und Gerüche mindert. 1 Liter pro Minute mit etwa 48 Pumpstößen, dazu Schläuche und ein Flaschenadapter; der Schlauch geht in den Bach, das Wasser kommt in die Flasche. Katadyn nennt rund 300 Gallonen, also etwa 1100 Liter, pro Filterelement, und das Element lässt sich unterwegs ausspülen.",
    prinzip: "Pumpe",
    poren: 0.2,
    viren: false,
    liter: 1100,
    durchfluss: 1,
    gramm: null,
    besonderheit: "Aktivkohlekern, Schlauch für flache Quellen",
    dafuer: [
      "Der Schlauch erreicht auch flache Rinnsale, aus denen man keine Flasche füllen kann.",
      "Aktivkohle gegen Geschmack und Geruch.",
      "Filterelement unterwegs zu reinigen und einzeln nachzukaufen.",
    ],
    dagegen: [
      "Umständlicher als eine Filterflasche: Schlauch auspacken, pumpen, einpacken. Ein Gewicht nennt das Angebot nicht.",
      "0,2 statt 0,1 Mikrometer, keine Viren.",
      "Pumpen kostet Zeit: 48 Stöße je Liter.",
    ],
    nichtFuer: "Die Einzelperson auf der Tagestour.",
  },
  {
    asin: "B0043DB1ZI",
    name: "Micropur Forte MF 1T",
    marke: "Katadyn",
    abzeichen: "Backup",
    rolle: "Tabletten für den Notfall — und gegen Viren, die jeder Hohlfaserfilter durchlässt.",
    einordnung:
      "Chlor und Silberionen, eine Tablette je Liter klares Wasser. Laut Packung braucht es 30 Minuten gegen Bakterien und Viren und 2 Stunden gegen Giardia. Cryptosporidium nennt die Packung nicht — und die CDC schreibt, dass Chlor gegen Parasiten nicht gut wirkt. Tabletten ersetzen also keinen Filter, sie ergänzen ihn: Erst filtern, dann desinfizieren, so rät es die CDC, wenn Abkochen nicht geht.",
    prinzip: "Tabletten",
    poren: null,
    viren: true,
    liter: 50,
    durchfluss: null,
    gramm: null,
    besonderheit: "50 Tabletten für 50 Liter",
    dafuer: [
      "Wirkt laut Packung gegen Viren — als Ergänzung zum Hohlfaserfilter.",
      "Wiegt fast nichts, friert nicht ein.",
      "Silberionen halten das Wasser länger keimfrei.",
    ],
    dagegen: [
      "30 Minuten Wartezeit, 2 Stunden gegen Giardia.",
      "Gegen Parasiten wie Cryptosporidium wirkt Chlor laut CDC schlecht.",
      "Nur für klares Wasser, Geschmack nach Chlor.",
    ],
    nichtFuer: "Als einzige Methode aus Bächen in Weidegebieten, wo Parasiten das Hauptrisiko sind.",
  },
  {
    asin: "B073R8F3HP",
    name: "Wasserfilter-Strohhalm",
    marke: "Membrane Solutions",
    abzeichen: "Günstigster",
    rolle: "Viel Kapazität für wenig Geld — mit einer Zertifizierung, die das Falsche prüft.",
    einordnung:
      "0,1-Mikrometer-Hohlfaser plus Aktivkohle, 56 Gramm, laut Hersteller 500 Milliliter pro Minute und 5000 Liter Kapazität. Beworben wird er mit den NSF/ANSI-Standards 42, 372 und 401. Die betreffen Geschmack und Chlor, bleifreie Materialien und neu auftretende Verunreinigungen — die Rückhaltung von Bakterien und Parasiten weisen sie nicht nach. Dafür nennt der Hersteller 99,9999 Prozent E. coli.",
    prinzip: "Strohhalm",
    poren: 0.1,
    viren: false,
    liter: 5000,
    durchfluss: 0.5,
    gramm: 56,
    besonderheit: "Aktivkohle, 5000 Liter laut Hersteller",
    dafuer: [
      "Günstig, mit Aktivkohle gegen Geschmack.",
      "5000 Liter Kapazität laut Hersteller.",
      "Auf Flaschen und Beutel steckbar, rückspülbar.",
    ],
    dagegen: [
      "Die genannten NSF-Normen prüfen nicht auf Keime.",
      "500 ml pro Minute — ein Viertel der BeFree.",
      "Protozoen nennt das Angebot nicht ausdrücklich.",
    ],
    nichtFuer: "Wer eine Filterleistung will, die auf Keime geprüft ausgewiesen ist.",
  },
];

export function alsProdukt(f: Wasserfilter): Produkt {
  return {
    ...f,
    kurz: [f.prinzip, f.poren ? `${String(f.poren).replace(".", ",")} µm` : null, f.gramm ? `${f.gramm} g` : null].filter(Boolean).join(" · "),
    eckdaten: [
      ["Prinzip", f.prinzip],
      ["Porengröße", f.poren ? `${String(f.poren).replace(".", ",")} µm` : "nicht angegeben"],
      ["Viren", f.viren ? "ja, laut Hersteller" : "nein"],
      ["Kapazität", f.liter ? `${f.liter.toLocaleString("de-DE")} Liter` : "nicht angegeben"],
      ["Durchfluss", f.durchfluss ? `${String(f.durchfluss).replace(".", ",")} l/min` : "nicht angegeben"],
      ["Gewicht", f.gramm ? `${f.gramm} g` : "nicht angegeben"],
    ],
    kennwert: {
      wert: f.liter ? `${f.liter.toLocaleString("de-DE")} l` : "k. A.",
      unter: f.viren ? "mit Virenschutz" : f.poren ? `${String(f.poren).replace(".", ",")} µm, ohne Viren` : "ohne Viren",
    },
  };
}

export const QUELLEN = {
  cdc: "https://www.cdc.gov/drinking-water/prevention/water-treatment-hiking-camping-traveling.html",
  bergwelten: "https://www.bergwelten.com/a/wasserfilter-sicher-trinken-aus-bach-und-fluss",
  warentest: "https://www.test.de/Reise-Wasserfilter-Keim-und-chlorfrei-1707945-0/",
  katadyn: "https://www.katadyngroup.com/Downloads/katadyn/manuals/filters/current/Manual%20BeFree_EU_de.pdf",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Braucht man beim Wandern einen Wasserfilter?",
    antwort:
      "Auf einer Tagestour, auf der man genug Wasser mitnimmt, nicht. Wer regelmäßig aus Bächen trinkt oder mehrere Tage unterwegs ist, ist mit einem Filter deutlich sicherer. Auch klares Gebirgswasser kann Krankheitserreger enthalten, etwa von Wildtieren.",
  },
  {
    frage: "Filtern Outdoor-Wasserfilter auch Viren?",
    antwort:
      "Die meisten nicht. Laut CDC halten Filter mit 0,3 Mikrometern oder weniger Bakterien und Parasiten zurück, aber keine Viren. Hohlfaserfilter mit 0,1 Mikrometern wie BeFree oder Sawyer gehören dazu. Gegen Viren helfen Abkochen, chemische Desinfektion oder Filter mit Virenbarriere wie die Grayl GeoPress.",
  },
  {
    frage: "Was sagt die Stiftung Warentest zu Outdoor-Wasserfiltern?",
    antwort:
      "Sie hat laut eigener Auskunft keine Reisefilter selbst untersucht. 2008 berichtete sie über einen Test der Schweizer Konsumenteninfo AG mit fünf Systemen; am besten schnitt damals der MSR MiniWorks EX ab.",
  },
  {
    frage: "Wie lange muss man Wasser abkochen?",
    antwort:
      "Die CDC nennt eine Minute sprudelnd kochen, oberhalb von 6500 Fuß — rund 2000 Metern — drei Minuten. Abkochen tötet Viren, Bakterien und Parasiten.",
  },
  {
    frage: "Kann ein Wasserfilter einfrieren?",
    antwort:
      "Ja, und das ist gefährlich. Katadyn warnt in der Anleitung der BeFree, eine gefrorene Membran könne Mikroorganismen hindurchlassen. Im Winter den Filter nah am Körper tragen und nach einer frostigen Nacht nicht mehr verwenden.",
  },
  {
    frage: "Reichen Wasserentkeimungstabletten statt eines Filters?",
    antwort:
      "Als Notlösung für klares Wasser. Micropur Forte braucht laut Packung 30 Minuten gegen Bakterien und Viren und 2 Stunden gegen Giardia. Gegen Cryptosporidium wirkt Chlor laut CDC schlecht. Die CDC rät: erst filtern, dann desinfizieren.",
  },
];
