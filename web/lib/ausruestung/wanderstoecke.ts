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
 */

export interface Stock {
  asin: string;
  name: string;
  marke: string;
  /** Wofür dieser Stock die richtige Wahl ist — ein Satz, keine Werbung. */
  rolle: string;
  bauart: "Faltstock" | "Teleskopstock" | "Faltstock, feste Länge";
  material: "Aluminium" | "Carbon" | "Carbon und Aluminium";
  /** Gramm je Stock, aus der Herstellerangabe. null, wenn nur das Paar genannt ist. */
  gramm_stueck: number | null;
  /** Gramm je Paar. Der Wert, den die Hersteller uneinheitlich angeben. */
  gramm_paar: number | null;
  laenge: string;
  verschluss: string;
  griff: string;
  /** Was für ihn spricht. */
  dafuer: string[];
  /** Was gegen ihn spricht — jeder Eintrag hat einen. */
  dagegen: string[];
  /** Wer ihn nicht kaufen sollte. Der wichtigste Satz je Produkt. */
  nichtFuer: string;
}

export const STOECKE: Stock[] = [
  {
    asin: "B01GKYKK2W",
    name: "Explorer Contour Powerlock",
    marke: "Komperdell",
    rolle: "Der Arbeitsstock fürs Mittelgebirge — wenn nur einer, dann dieser.",
    bauart: "Teleskopstock",
    material: "Aluminium",
    gramm_stueck: 239,
    gramm_paar: 478,
    laenge: "105–140 cm",
    verschluss: "Powerlock 3.0, geschmiedeter Klemmverschluss",
    griff: "Schaumstoff mit langer Griffverlängerung",
    dafuer: [
      "239 g je Stock — für einen voll verstellbaren Aluminiumstock mit Klemmverschluss wenig.",
      "Klemmverschluss aus geschmiedetem Material statt Drehverschluss. Der häufigste Defekt an Billigstöcken ist ein Drehverschluss, der unter Last durchrutscht.",
      "Griffverlängerung aus Schaumstoff: Im Steilstück greift man tiefer, ohne die Länge zu verstellen.",
      "Wolframcarbid-Spitze. Hält deutlich länger als Stahl auf Fels und Schotter.",
    ],
    dagegen: [
      "Teleskop statt faltbar: zusammengeschoben immer noch rund 65 cm. Am Rucksack sperrig.",
      "Aluminium dämpft Stöße schlechter als Carbon. Auf langen Abstiegen spürbar.",
    ],
    nichtFuer:
      "Wer die Stöcke oft im Rucksack verstaut, nimmt einen Faltstock. 65 cm stehen über.",
  },
  {
    asin: "B09RX1HH44",
    name: "Makalu FX Carbon AS",
    marke: "Leki",
    rolle: "Der Maßstab bei den Faltstöcken, und entsprechend teuer.",
    bauart: "Faltstock",
    material: "Carbon und Aluminium",
    gramm_stueck: null,
    gramm_paar: 534,
    laenge: "110–130 cm",
    verschluss: "Speed Lock 2 plus, zusätzlich stufenlos verstellbar",
    griff: "Aergon Air",
    dafuer: [
      "Vierteilig faltbar und trotzdem stufenlos verstellbar — die meisten Faltstöcke sind das eine oder das andere.",
      "534 g das Paar bei voller Verstellbarkeit.",
      "AS steht für die Dämpfung im Untergestell. Auf langen Abstiegen der spürbarste Unterschied zu einem starren Stock.",
      "Leki liefert Ersatzteile über Jahre. Bei einem Stock für 155 Euro ist das die halbe Rechnung.",
    ],
    dagegen: [
      "Rund 155 Euro. Für gelegentliche Sonntagstouren nicht zu rechtfertigen.",
      "Carbon bricht, wo Aluminium sich verbiegt. Eingeklemmt zwischen Felsen ist der Stock hin, nicht krumm.",
      "Die Dämpfung kostet Gewicht und ist Geschmackssache — manche mögen die direkte Rückmeldung eines starren Stocks lieber.",
    ],
    nichtFuer:
      "Wer im blockigen Gelände unterwegs ist, in dem sich Stöcke verklemmen, fährt mit Aluminium besser.",
  },
  {
    asin: "B0CRVSPJXM",
    name: "Trail Back",
    marke: "Black Diamond",
    rolle: "Solide Grundausstattung ohne Kompromiss beim Verschluss.",
    bauart: "Teleskopstock",
    material: "Aluminium",
    gramm_stueck: null,
    gramm_paar: null,
    laenge: "100–140 cm",
    verschluss: "FlickLock, Klemmverschluss",
    griff: "EVA-Schaumstoff mit Griffverlängerung",
    dafuer: [
      "FlickLock ist der Klemmverschluss, an dem sich die anderen messen lassen müssen — mit Handschuhen bedienbar, nachziehbar, sichtbar offen oder zu.",
      "100 bis 140 cm deckt von 1,55 m bis 1,95 m Körpergröße alles ab. Als Leihstock im Haushalt praktisch.",
      "Rund 65 Euro für einen Markenstock mit vernünftigem Verschluss.",
    ],
    dagegen: [
      "Black Diamond nennt beim Händler kein Produktgewicht für dieses Modell, und schätzen wollen wir es nicht.",
      "Keine Dämpfung.",
      "Teleskop, also dieselbe Sperrigkeit wie beim Komperdell.",
    ],
    nichtFuer: "Wer aufs Gramm achtet. Dafür gibt es leichtere und teurere Bauarten.",
  },
  {
    asin: "B09N7VF4GK",
    name: "Distance Z",
    marke: "Black Diamond",
    rolle: "Für schnelle Touren, wenn das Packmaß über allem steht.",
    bauart: "Faltstock, feste Länge",
    material: "Aluminium",
    gramm_stueck: null,
    gramm_paar: null,
    laenge: "feste Länge, Größe beim Kauf wählen",
    verschluss: "keiner — Z-Faltung mit konischen Steckverbindungen",
    griff: "EVA-Schaumstoff mit Griffverlängerung",
    dafuer: [
      "Kein Verstellmechanismus heißt kein Teil, das durchrutschen kann. Die häufigste Fehlerquelle entfällt.",
      "Ein Zug, und der Stock steht. Schneller ist keine andere Bauart.",
      "7075-Aluminium statt Carbon — hält auch aus, wenn man sich darauf abstützt.",
    ],
    dagegen: [
      "Feste Länge. Bergauf kürzer, bergab länger geht nicht, und teilen kann man ihn auch nicht.",
      "Die Größe muss beim Kauf stimmen. Danebengegriffen heißt zurückschicken.",
    ],
    nichtFuer:
      "Alle, die die Stöcke mit jemand anderem teilen oder im Gelände nachstellen wollen. Dann ist ein verstellbarer Stock die einzige sinnvolle Wahl.",
  },
  {
    asin: "B0DPFQVN3X",
    name: "Faltbare Trekkingstöcke",
    marke: "Anykuu",
    rolle: "Der ehrliche Einstieg: wenn du noch nicht weißt, ob du Stöcke überhaupt magst.",
    bauart: "Faltstock",
    material: "Aluminium",
    gramm_stueck: 290,
    gramm_paar: 580,
    laenge: "110–130 cm",
    verschluss: "vom Anbieter nicht angegeben",
    griff: "EVA-Schaumstoff",
    dafuer: [
      "Rund 29 Euro. Wer zweimal im Jahr wandert, braucht keine 155-Euro-Stöcke.",
      "Faltbar auf 36 cm — kompakter als jeder Teleskopstock hier.",
      "7075-Aluminium, dieselbe Legierung wie bei den teuren Modellen.",
    ],
    dagegen: [
      "Keine Ersatzteile. Bricht ein Teil, ist der Stock Müll.",
      "Kein Markenname heißt keine Fertigungsgeschichte. Über die Streuung zwischen zwei Exemplaren lässt sich nichts sagen.",
      "Welcher Verschluss verbaut ist, sagt der Anbieter nicht. Bei einem Stock, auf den man sich stützt, ist das die wichtigste Angabe überhaupt.",
      "290 g je Stock, 51 g mehr als der Komperdell. Beim Preis gespart heißt hier nicht beim Gewicht gespart.",
    ],
    nichtFuer:
      "Alle, die sich auf die Stöcke verlassen müssen — im Schnee, im Steilgelände, mit schwerem Rucksack. Dort ist ein durchrutschender Verschluss kein Ärgernis, sondern ein Sturz.",
  },
];

/**
 * Stocklänge nach Körpergröße.
 *
 * Die Faustregel lautet: Unterarm waagerecht, Ellbogen im rechten Winkel,
 * Spitze am Boden. Das ergibt ungefähr Körpergröße mal 0,68. Die Tabelle
 * rechnet das aus, damit niemand im Laden rechnen muss.
 *
 * Diese Angabe ist der meistgesuchte und meistfalsch beantwortete Punkt zum
 * Thema. Deshalb steht er weit oben auf der Seite und nicht am Ende.
 */
export const LAENGEN: { groesse: string; stock: number }[] = [
  { groesse: "150–158 cm", stock: 105 },
  { groesse: "159–166 cm", stock: 110 },
  { groesse: "167–174 cm", stock: 115 },
  { groesse: "175–182 cm", stock: 120 },
  { groesse: "183–190 cm", stock: 125 },
  { groesse: "ab 191 cm", stock: 130 },
];
