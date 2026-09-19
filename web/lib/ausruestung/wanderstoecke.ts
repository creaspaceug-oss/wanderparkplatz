/**
 * Die Auswahl für den Stockvergleich — von Hand zusammengestellt.
 *
 * Warum nicht aus Amazons Stichwortsuche: Wer dort "Wanderstöcke" eingibt,
 * bekommt Alpenwert, Juskys, Anykuu, Covacure, Glymnis und "Underwood
 * Aggregator". Keinen Leki, keinen Black Diamond, keinen Komperdell — also
 * genau die Marken nicht, nach denen gesucht wird. Eine Vergleichsseite aus
 * dieser Liste wäre dieselbe wie bei vergleich.org und expertentesten.de.
 *
 * Deshalb umgekehrt: erst entscheiden, welche Stöcke eine Erwähnung verdienen,
 * dann bei Amazon Preis und Verfügbarkeit dazuholen.
 *
 * Zu den Zahlen: Alle technischen Angaben stammen aus den Herstellerangaben
 * zum jeweiligen Artikel. Nicht übernommen wird Amazons Gewichtsfeld — das ist
 * das Versandgewicht und liegt beim Black Diamond Trail Back bei 1,23 kg,
 * während das Paar real rund 500 g wiegt.
 *
 * Zu den Testnoten: nur Gesamtnoten der Stiftung Warentest, die frei
 * zugänglich zitiert werden (Heft 2/2024). Teilnoten stehen hinter der
 * Bezahlschranke, und die Sekundärquellen widersprechen sich darin.
 */

export interface Warentest {
  note: string;
  urteil: string;
  /** Kurz, was diese Note einordnet — "bester Faltstock", "Teleskop-Sieger". */
  rang?: string;
}

export interface Stock {
  asin: string;
  name: string;
  marke: string;
  /** Kurzes Etikett für Karten und Tabelle. */
  abzeichen?: string;
  /** Wofür dieser Stock die richtige Wahl ist — ein Satz, keine Werbung. */
  rolle: string;
  /** Zwei, drei Sätze Einordnung, bevor die Listen kommen. */
  einordnung: string;
  bauart: "Faltstock" | "Teleskopstock" | "Faltstock, feste Länge";
  material: "Aluminium" | "Carbon" | "Carbon und Aluminium";
  /** Gramm je Stock, aus der Herstellerangabe. */
  gramm_stueck: number | null;
  laenge: string;
  verschluss: string;
  griff: string;
  warentest?: Warentest;
  dafuer: string[];
  dagegen: string[];
  /** Wer ihn nicht kaufen sollte. Der wichtigste Satz je Produkt. */
  nichtFuer: string;
}

export const WARENTEST = {
  heft: "test 2/2024",
  datum: "17. Januar 2024",
  url: "https://www.test.de/Wanderstoecke-im-Test-5623087-0/",
  modelle: 12,
  teleskop: 7,
  falt: 5,
  preisspanne: "15 bis 200 Euro",
  /** Wo die frei zugänglichen Gesamtnoten nachzulesen sind. */
  zusammenfassung:
    "https://www.familie.de/testberichte/wanderstoecke-test-die-3-sieger-bei-stiftung-warentest--01HNZCP97ZCEPRNV6BCSPS0DAC",
};

export const STOECKE: Stock[] = [
  {
    asin: "B0F63PVSJP",
    name: "Khumbu",
    marke: "Leki",
    abzeichen: "Unsere erste Wahl",
    rolle: "Teleskop-Sieger im Warentest, für weniger als die Hälfte des Gesamtsiegers.",
    einordnung:
      "Ein Teleskopstock ohne Besonderheiten, und genau das ist seine Stärke. Aluminium, drei Segmente, Klemmverschluss, ordentlicher Griff. Bei der Stiftung Warentest war er der beste Teleskopstock im Feld — und kostet weniger als die Hälfte des Gesamtsiegers.",
    bauart: "Teleskopstock",
    material: "Aluminium",
    gramm_stueck: 277,
    laenge: "110–145 cm",
    verschluss: "Speed Lock Plus, Klemmverschluss",
    griff: "Aergon mit Griffzonen",
    warentest: { note: "1,9", urteil: "gut", rang: "bester Teleskopstock" },
    dafuer: [
      "Bester Teleskopstock im Warentest, Gesamtnote 1,9.",
      "Rund 66 Euro. Weniger kostet ein Markenstock mit Klemmverschluss kaum.",
      "Klemmverschluss an allen Segmenten, von außen sichtbar offen oder zu.",
      "Leki verkauft Spitzen, Teller und Verschlussteile einzeln nach. Ein verbogenes Segment heißt nicht neuer Stock.",
    ],
    dagegen: [
      "277 g je Stock, gut 20 g mehr als der Carbon-Faltstock von Leki.",
      "Zusammengeschoben rund 65 cm. Im Rucksack steht er oben heraus.",
      "Bei Amazon laufen zwei Ausführungen mit unterschiedlichem Griff. Welche genau im Test lag, lässt sich aus der frei zugänglichen Zusammenfassung nicht sagen.",
    ],
    nichtFuer:
      "Wer die Stöcke oft im Rucksack verstaut — auf Klettersteigpassagen, im Bus, im Flugzeuggepäck. Dafür ist ein Faltstock gebaut.",
  },
  {
    asin: "B09RPP5R95",
    name: "Makalu FX Carbon",
    marke: "Leki",
    abzeichen: "Testsieger",
    rolle: "Der beste Stock im Warentest, und entsprechend teuer.",
    einordnung:
      "Vierteilig faltbar und trotzdem stufenlos verstellbar — die meisten Faltstöcke sind nur das eine. Carbon hält das Gewicht niedrig, gefaltet verschwindet er im Tagesrucksack. Die Stiftung Warentest gab ihm die beste Gesamtnote im Feld.",
    bauart: "Faltstock",
    material: "Carbon",
    gramm_stueck: 254,
    laenge: "110–130 cm",
    verschluss: "Speed Lock, Klemmverschluss, stufenlos",
    griff: "Aergon mit Griffzonen",
    warentest: { note: "1,8", urteil: "gut", rang: "Gesamtsieger" },
    dafuer: [
      "Beste Gesamtnote im Warentest: 1,8.",
      "508 g das Paar bei voller Verstellbarkeit.",
      "Faltbar und stufenlos einstellbar. Man muss sich nicht zwischen Packmaß und Anpassung entscheiden.",
      "Getestet wurde genau diese Ausführung ohne Dämpfung. Bei der Variante mit „AS“ im Namen gilt die Note nicht.",
    ],
    dagegen: [
      "Rund 150 Euro. Für zwei Sonntagstouren im Jahr nicht zu rechtfertigen.",
      "Carbon bricht, wo Aluminium sich verbiegt. Zwischen Felsen verklemmt ist der Stock hin, nicht krumm.",
      "Verstellbereich nur 110 bis 130 cm. Über 1,90 m wird es knapp, siehe Längentabelle.",
    ],
    nichtFuer:
      "Wer im blockigen Gelände unterwegs ist, in dem sich Stöcke verklemmen. Dort ist Aluminium die vernünftigere Wahl, unabhängig vom Budget.",
  },
  {
    asin: "B01GKYKK2W",
    name: "Explorer Contour Powerlock",
    marke: "Komperdell",
    abzeichen: "Leichtgewicht",
    rolle: "Leichter als der Carbon-Faltstock — aus Aluminium und verstellbar.",
    einordnung:
      "Komperdell baut seit 1922 in Österreich Stöcke, und das merkt man an Details: eine lange Griffverlängerung, eine Spitze aus Wolframcarbid, ein Verschluss aus geschmiedetem Metall statt Kunststoff. Im Warentest war er nicht.",
    bauart: "Teleskopstock",
    material: "Aluminium",
    gramm_stueck: 239,
    laenge: "105–140 cm",
    verschluss: "Powerlock 3.0, geschmiedeter Klemmverschluss",
    griff: "Schaumstoff mit langer Griffverlängerung",
    dafuer: [
      "239 g je Stock — unter den Stöcken hier, für die ein Gewicht angegeben ist, der leichteste, Carbon eingeschlossen.",
      "Verschlusshebel aus geschmiedetem Metall statt aus Kunststoff.",
      "Lange Griffverlängerung aus Schaumstoff. Im Steilstück greift man tiefer, ohne die Länge zu verstellen.",
      "Spitze aus Wolframcarbid, hält auf Fels und Schotter länger als Stahl.",
    ],
    dagegen: [
      "Teurer als der Khumbu, und das für 38 g weniger je Stock.",
      "Kein Warentest-Ergebnis. Die Einordnung hier stützt sich nur auf Herstellerangaben.",
      "Teleskop, also zusammengeschoben rund 65 cm lang.",
    ],
    nichtFuer:
      "Wer eine unabhängige Prüfung haben möchte, bevor er Geld ausgibt. Dann ist der Khumbu die sicherere Wahl.",
  },
  {
    asin: "B0CRVSPJXM",
    name: "Trail Back",
    marke: "Black Diamond",
    rolle: "Solide Grundausstattung zum Preis des Khumbu.",
    einordnung:
      "Ein schlichter Aluminiumstock mit Klemmverschluss und großem Verstellbereich. Er lag im Warentest — die Note steht hinter der Bezahlschranke, und wir zitieren nur, was frei zugänglich ist.",
    bauart: "Teleskopstock",
    material: "Aluminium",
    gramm_stueck: null,
    laenge: "100–140 cm",
    verschluss: "FlickLock, Klemmverschluss",
    griff: "EVA-Schaumstoff mit Griffverlängerung",
    dafuer: [
      "FlickLock: mit Handschuhen bedienbar, mit einer Schraube nachstellbar, auf einen Blick offen oder zu.",
      "100 bis 140 cm reichen von 1,50 m bis 2,00 m Körpergröße. Als Stock, den sich mehrere im Haushalt teilen, praktisch.",
      "Rund 65 Euro für einen Markenstock mit Klemmverschluss.",
    ],
    dagegen: [
      "Black Diamond nennt beim Händler kein Produktgewicht, und schätzen wollen wir es nicht.",
      "Warentest-Note unbekannt. Er war im Test, mehr sagt die freie Zusammenfassung nicht.",
      "Teleskop, also dieselbe Sperrigkeit wie beim Khumbu.",
    ],
    nichtFuer:
      "Wer aufs Gramm achtet. Wer sich zwischen ihm und dem Khumbu entscheidet, nimmt den Khumbu — gleicher Preis, bekannte Note.",
  },
  {
    asin: "B09N7VF4GK",
    name: "Distance Z",
    marke: "Black Diamond",
    abzeichen: "Kleinstes Packmaß",
    rolle: "Für schnelle Touren, wenn das Packmaß über allem steht.",
    einordnung:
      "Kein Verstellmechanismus, sondern drei Segmente, die ein Seil zusammenzieht. Ein Zug, und der Stock steht. Das ist die Bauart der Trailläufer und Ultraleicht-Wanderer — und sie hat eine Bedingung: Die Länge muss beim Kauf stimmen.",
    bauart: "Faltstock, feste Länge",
    material: "Aluminium",
    gramm_stueck: null,
    laenge: "feste Länge, beim Kauf wählen",
    verschluss: "keiner — Z-Faltung mit Steckverbindung",
    griff: "EVA-Schaumstoff mit Griffverlängerung",
    dafuer: [
      "Kein Verstellmechanismus heißt kein Teil, das unter Last durchrutschen kann.",
      "Ein Zug am Griff, und der Stock steht. Schneller geht es mit keiner anderen Bauart.",
      "7075-Aluminium statt Carbon. Hält aus, wenn man sich schwer darauf stützt.",
    ],
    dagegen: [
      "Feste Länge. Bergauf kürzer, bergab länger geht nicht.",
      "Teilen kann man ihn nur mit Menschen derselben Körpergröße.",
      "Die Größe muss beim Kauf stimmen. Danebengegriffen heißt zurückschicken.",
    ],
    nichtFuer:
      "Alle, die im Gelände nachstellen oder die Stöcke teilen wollen. Dann ist ein verstellbarer Stock die einzige sinnvolle Wahl.",
  },
  {
    asin: "B0DPFQVN3X",
    name: "Faltbare Trekkingstöcke",
    marke: "Anykuu",
    abzeichen: "Günstigster",
    rolle: "Zum Ausprobieren, ob man Stöcke überhaupt mag — mehr nicht.",
    einordnung:
      "Kein Markenname, keine Ersatzteile, keine Prüfung. Dafür rund 29 Euro. Wer zweimal im Jahr wandert und herausfinden will, ob Stöcke etwas für ihn sind, kann damit anfangen. Wer sich darauf verlassen muss, nicht.",
    bauart: "Faltstock",
    material: "Aluminium",
    gramm_stueck: 290,
    laenge: "110–130 cm",
    verschluss: "vom Anbieter nicht angegeben",
    griff: "EVA-Schaumstoff",
    dafuer: [
      "Rund 29 Euro, weniger als ein Fünftel des Testsiegers.",
      "Faltbar auf 36 cm.",
      "7075-Aluminium, dieselbe Legierung wie bei teureren Modellen.",
    ],
    dagegen: [
      "Welcher Verschluss verbaut ist, sagt der Anbieter nicht. Bei einem Stock, auf den man sich stützt, ist das die wichtigste Angabe überhaupt.",
      "290 g je Stock, 51 g mehr als der Komperdell.",
      "Keine Ersatzteile. Bricht ein Teil, ist der Stock Müll.",
      "Kein Markenname heißt keine Fertigungsgeschichte. Über die Streuung zwischen zwei Exemplaren lässt sich nichts sagen.",
    ],
    nichtFuer:
      "Alle, die sich auf die Stöcke verlassen müssen — im Schnee, im Steilgelände, mit schwerem Rucksack. Dort ist ein durchrutschender Verschluss kein Ärgernis, sondern ein Sturz.",
  },
];

/** Der eine Holzstock — eigene Suchabsicht, eigener Abschnitt. */
export const HOLZSTOCK = {
  asin: "B01FDZ50MY",
  name: "Wanderstock Naturwurzel, geflammt",
  marke: "Stock-Fachmann",
  merkmale: [
    ["Holz", "Kastanie, geflammt"],
    ["Länge", "120 cm, fest"],
    ["Belastbar bis", "120 kg"],
    ["Schlaufe", "Leder"],
    ["Herkunft", "deutsche Fertigung"],
  ] as [string, string][],
};

/**
 * Stocklänge nach Körpergröße.
 *
 * Die Faustregel: Unterarm waagerecht, Ellbogen im rechten Winkel, Spitze am
 * Boden. Das ergibt ungefähr Körpergröße mal 0,68. Die Werte unten sind genau
 * das, auf fünf Zentimeter gerundet — nachrechenbar, damit niemand im Laden
 * einer Tabelle glauben muss, die mit ihrer eigenen Regel nicht übereinstimmt.
 */
export const FAKTOR = 0.68;

export const LAENGEN: { groesse: string; stock: number }[] = [
  { groesse: "150–158 cm", stock: 105 },
  { groesse: "159–166 cm", stock: 110 },
  { groesse: "167–174 cm", stock: 115 },
  { groesse: "175–182 cm", stock: 120 },
  { groesse: "183–190 cm", stock: 125 },
  { groesse: "ab 191 cm", stock: 130 },
];

/**
 * Häufige Fragen — ausgewählt nach dem, was tatsächlich gesucht wird
 * (DataForSEO, Deutschland, September 2026), nicht nach dem, was sich
 * aufschreiben lässt. Erscheint auch als FAQPage-Auszeichnung.
 */
export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Welche Stocklänge brauche ich bei 1,70 m?",
    antwort:
      "115 Zentimeter. Die Faustregel ist Körpergröße mal 0,68, also 115,6 — auf fünf Zentimeter gerundet und im Zweifel nach unten. Bergauf stellst du fünf bis zehn Zentimeter kürzer, bergab genauso viel länger.",
  },
  {
    frage: "Darf ich Wanderstöcke im Handgepäck mitnehmen?",
    antwort:
      "Rechne nicht damit. Wanderstöcke gelten an der Sicherheitskontrolle als Gegenstände, mit denen man zuschlagen kann, und gehören ins aufgegebene Gepäck. Manche kommen damit durch, verlassen kann man sich darauf nicht — entschieden wird an der Kontrolle, nicht bei der Fluggesellschaft.",
  },
  {
    frage: "Hat die Stiftung Warentest Wanderstöcke getestet?",
    antwort:
      "Ja, in Heft 2/2024: zwölf Modelle zwischen 15 und 200 Euro, sieben Teleskop- und fünf Faltstöcke. Die beste Gesamtnote bekam der Leki Makalu FX Carbon mit 1,8, bester Teleskopstock war der Leki Khumbu mit 1,9. Ein Modell fiel wegen Schadstoffen im Griff mit „mangelhaft“ durch.",
  },
  {
    frage: "Kork oder Schaumstoff — welcher Griff ist besser?",
    antwort:
      "Kork passt sich mit der Zeit der Hand an und bleibt auch bei Schweiß griffig, ist aber teurer und empfindlicher. Schaumstoff ist leicht, warm und günstig, saugt aber Schweiß und wird mit den Jahren speckig. Für die meisten ist Schaumstoff die vernünftige Wahl, Kork die angenehmere.",
  },
  {
    frage: "Was ist der Unterschied zwischen Damen- und Herrenstöcken?",
    antwort:
      "Meist nur zwei Dinge: Damenmodelle sind kürzer und haben einen schmaleren Griff. Maßgeblich ist nicht das Etikett, sondern ob die Länge zu deiner Körpergröße passt und der Griff in deiner Hand liegt.",
  },
  {
    frage: "Einer oder zwei Stöcke?",
    antwort:
      "Zwei, wenn es um die Knie geht. Nur ein Paar verteilt die Last gleichmäßig und entlastet im Abstieg spürbar. Ein einzelner Stock hilft beim Gleichgewicht, etwa beim Queren von Bächen — dafür reicht auch ein Holzstock.",
  },
  {
    frage: "Kann ich Nordic-Walking-Stöcke zum Wandern nehmen?",
    antwort:
      "Auf ebenen Wegen ja, im Gebirge nein. Nordic-Walking-Stöcke haben meist eine feste Länge und eine handschuhartige Schlaufe, aus der man nicht schnell herauskommt. Bergab kann man sie nicht verlängern, und bei einem Sturz hängt die Hand fest.",
  },
  {
    frage: "Brauche ich eine Dämpfung („Antishock“)?",
    antwort:
      "Nein. Sie kostet Gewicht und Geld, und beide Warentest-Sieger haben keine. Manche empfinden sie auf langen Asphaltabschnitten als angenehm, andere mögen das leichte Nachgeben beim Aufsetzen gar nicht.",
  },
];
