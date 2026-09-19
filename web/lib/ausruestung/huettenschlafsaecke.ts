import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Hüttenschlafsack-Vergleich — von Hand zusammengestellt.
 *
 * Ein Hüttenschlafsack ist ein Stück Stoff; was ihn unterscheidet, sind
 * Material, Gewicht, Packmaß, Waschtemperatur und — seit Hütten gegen
 * Bettwanzen Mikrowellen aufstellen — ob Metall daran ist. Alle Angaben aus
 * den Herstellertexten zum jeweiligen Artikel. Einen unabhängigen Test gibt
 * es nicht.
 */

export type Material = "Baumwolle" | "Seide" | "Mikrofaser" | "Thermolite";

export interface Huettenschlafsack {
  asin: string;
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  material: Material;
  materialDetail: string;
  /** Gramm laut Hersteller; null, wenn keine Angabe. */
  gramm: number | null;
  masse: string | null;
  packmass: string | null;
  verschluss: string;
  /** Waschtemperatur laut Hersteller, falls genannt. */
  waschen: string | null;
  mikrowelle: string;
  kissen: boolean | null;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const HUETTENSCHLAFSAECKE: Huettenschlafsack[] = [
  {
    asin: "B001DX8064",
    name: "Travel Sheet Ägyptische Baumwolle",
    marke: "Cocoon",
    abzeichen: "Unsere erste Wahl",
    rolle: "Baumwolle vom Spezialisten — mit allen Maßen, die man vergleichen will.",
    einordnung:
      "Cocoon ist auf Inletts und Reiseschlafsäcke spezialisiert. Dieses hier ist ein schlichtes Rechteck aus ägyptischer Baumwolle, 220 × 90 Zentimeter, 410 Gramm, verpackt 17 × 9 Zentimeter. Baumwolle ist nicht das Leichteste, aber das, was sich auf der Haut am ehesten wie Bettwäsche anfühlt und sich am unkompliziertesten waschen lässt.",
    material: "Baumwolle",
    materialDetail: "100 % ägyptische Baumwolle",
    gramm: 410,
    masse: "220 × 90 cm",
    packmass: "17 × 9 cm",
    verschluss: "keiner angegeben",
    waschen: null,
    mikrowelle: "kein Metall angegeben",
    kissen: null,
    dafuer: [
      "Alle Maße im Angebot: Größe, Gewicht, Packmaß.",
      "Baumwolle fühlt sich an wie Bettwäsche und verzeiht beim Waschen am meisten.",
      "Laut Cocoon steigert es die Wärmeleistung eines Schlafsacks um bis zu 3,9 Grad — eine Herstellerangabe, geprüft hat sie niemand, den wir kennen.",
    ],
    dagegen: [
      "410 g — fast doppelt so schwer wie die leichten Mikrofaser- und Baumwollmodelle hier.",
      "Keine Waschtemperatur im Angebot.",
      "Kein Kissenfach erwähnt.",
    ],
    nichtFuer: "Wer jedes Gramm zählt. Dann Seide oder Mikrofaser.",
  },
  {
    asin: "B001DX9YTQ",
    name: "Hüttenschlafsack Seide",
    marke: "Cocoon",
    abzeichen: "Seide",
    rolle: "Das Leichteste und Kleinste, was es gibt — zu einem Preis, der das weiß.",
    einordnung:
      "Seide ist laut DAV-Shop das leichteste und kompakteste Material für einen Hüttenschlafsack und wirkt bei Hitze kühlend. Cocoon verschließt die seitliche Öffnung mit Klett statt mit Reißverschluss, dazu kommt eine Tasche für das Kissen und verstärkte Zwickel. Ein Gewicht nennt das Angebot nicht.",
    material: "Seide",
    materialDetail: "Seide",
    gramm: null,
    masse: "ca. 218 × 89 cm",
    packmass: null,
    verschluss: "Klett, seitlich",
    waschen: null,
    mikrowelle: "Klett statt Reißverschluss",
    kissen: true,
    dafuer: [
      "Seide: laut DAV-Shop das leichteste und kompakteste Material, kühlend bei Hitze.",
      "Klett statt Reißverschluss — kein Metall, wenn die Hütte die Mikrowelle verlangt.",
      "Kissentasche, doppelte Nähte, verstärkte Zwickel.",
    ],
    dagegen: [
      "Weder Gewicht noch Packmaß im Angebot.",
      "Deutlich teurer als Baumwolle oder Mikrofaser.",
      "Seide ist empfindlicher als Baumwolle und will schonend gewaschen werden.",
    ],
    nichtFuer: "Wer seinen Hüttenschlafsack in die Kochwäsche stecken will.",
  },
  {
    asin: "B01NAV63BX",
    name: "Hüttenschlafsack Mikrofaser",
    marke: "Armadic",
    abzeichen: "Mikrowelle laut Hersteller",
    rolle: "230 Gramm, faustgroß verpackt — und der Hersteller erlaubt die Mikrowelle.",
    einordnung:
      "Mikrofaser ist die günstige Antwort auf Seide: leicht, klein, glatt. Armadic nennt 230 Gramm, ein Packmaß von 7 × 16 Zentimetern, eine 150 Zentimeter lange Einstiegsöffnung und ein Fach für das Kissen. Und als einer der wenigen schreibt der Hersteller ausdrücklich, der Schlafsack sei in der Mikrowelle sterilisierbar.",
    material: "Mikrofaser",
    materialDetail: "100 % Mikrofaser",
    gramm: 230,
    masse: "220 × 90 cm",
    packmass: "7 × 16 cm",
    verschluss: "keiner, 150 cm Öffnung",
    waschen: "30 °C",
    mikrowelle: "laut Hersteller geeignet",
    kissen: true,
    dafuer: [
      "230 g und 7 × 16 cm — kaum mehr als eine Trinkflasche.",
      "Laut Hersteller für die Mikrowelle geeignet, ohne Reißverschluss.",
      "Kissenfach und verstärkter Einstieg.",
    ],
    dagegen: [
      "Waschbar bei 30 °C — das tötet Bettwanzen laut Umweltbundesamt nicht sicher. Dafür bleibt das Tiefkühlfach.",
      "Kunstfaser fühlt sich für manche weniger angenehm an als Baumwolle, vor allem in warmen Lagern.",
    ],
    nichtFuer: "Wer Kunstfaser auf der Haut nicht mag.",
  },
  {
    asin: "B0C5D1TC3J",
    name: "Hüttenschlafsack Baumwolle ohne Reißverschluss",
    marke: "Backpacker's Journey",
    abzeichen: "Leichteste Baumwolle",
    rolle: "Baumwolle zum Gewicht von Mikrofaser — ohne Reißverschluss.",
    einordnung:
      "225 Gramm aus Baumwolle, dazu 20 Gramm für den Beutel, verpackt 8 × 16 Zentimeter. Der Hersteller schreibt ehrlich in den Namen, was das Ding nicht kann: „keine Wärmeleistung“. Es ist ein Hygieneschlafsack, genau das, was die Hüttenordnung verlangt, und nicht mehr.",
    material: "Baumwolle",
    materialDetail: "100 % Baumwolle",
    gramm: 225,
    masse: null,
    packmass: "8 × 16 cm",
    verschluss: "keiner",
    waschen: "30 °C",
    mikrowelle: "kein Reißverschluss",
    kissen: null,
    dafuer: [
      "225 g Baumwolle — so leicht wie Mikrofaser.",
      "Ohne Reißverschluss, also nichts aus Metall, das in der Mikrowelle stört.",
      "Ehrliche Produktbeschreibung: keine Wärmeleistung, reine Hygiene.",
    ],
    dagegen: [
      "Dünn — in kalten Lagern merkt man das.",
      "Waschbar bei 30 °C, siehe unten zu Bettwanzen.",
      "Die Maße stehen nicht im Angebot.",
    ],
    nichtFuer: "Wer auf der Hütte leicht friert.",
  },
  {
    asin: "B07YHX12ZK",
    name: "Seidenschlafsack Inlett",
    marke: "Browint",
    abzeichen: "Seide, extrabreit",
    rolle: "Seide für weniger Geld — und in einer Breite, in der man sich umdrehen kann.",
    einordnung:
      "100 Prozent Maulbeerseide in drei Formaten: 220 × 87 Zentimeter mit 140 Gramm, extrabreit mit 220 × 110 Zentimetern und 180 Gramm, dazu eine Mumienform. Die breite Fassung ist für alle interessant, die sich in einem schmalen Inlett wie eingewickelt fühlen. Ein Kissenbezug ist aufgenäht, der Beutel lässt sich am Schlafsack einhaken.",
    material: "Seide",
    materialDetail: "100 % Maulbeerseide",
    gramm: 140,
    masse: "220 × 87 cm oder 220 × 110 cm",
    packmass: null,
    verschluss: "keiner angegeben",
    waschen: "Waschmaschine laut Hersteller",
    mikrowelle: "kein Metall angegeben",
    kissen: true,
    dafuer: [
      "140 g in der schmalen, 180 g in der breiten Fassung.",
      "Extrabreit mit 110 cm — 20 cm mehr als die meisten.",
      "Kissenbezug aufgenäht, Beutel am Schlafsack einhakbar.",
    ],
    dagegen: [
      "Drei Formate unter einem Angebot: beim Kauf das richtige wählen.",
      "Marktplatzmarke, die Qualität der Seide lässt sich vorher nicht prüfen.",
    ],
    nichtFuer: "Wer eine Mumienform mit Kapuze sucht und die Formatwahl übersieht.",
  },
  {
    asin: "B0DZVNDF6V",
    name: "Hüttenschlafsack Bio-Baumwolle mit Reißverschluss",
    marke: "Armadic",
    abzeichen: "Mit Reißverschluss",
    rolle: "Zum Aufklappen: Mit dem umlaufenden Reißverschluss wird er zur Decke.",
    einordnung:
      "Bio-Baumwolle, 370 Gramm, verpackt 9 × 16 Zentimeter, 90 × 220 Zentimeter. Der Unterschied zu den anderen ist der umlaufende Reißverschluss: Man kann den Schlafsack ganz öffnen und als Laken oder Decke benutzen. Genau der ist aber ein Nachteil auf Hütten, die den Schlafsack in die Mikrowelle schicken.",
    material: "Baumwolle",
    materialDetail: "100 % Bio-Baumwolle",
    gramm: 370,
    masse: "220 × 90 cm",
    packmass: "9 × 16 cm",
    verschluss: "Reißverschluss, umlaufend",
    waschen: "30 °C",
    mikrowelle: "Reißverschluss — vorher fragen",
    kissen: true,
    dafuer: [
      "Umlaufender Reißverschluss mit Sperre: als Schlafsack, Laken oder Decke nutzbar.",
      "Bio-Baumwolle, Kissenfach, verstärkter Einstieg.",
      "9 × 16 cm verpackt — klein für Baumwolle.",
    ],
    dagegen: [
      "Ein Reißverschluss hat meist einen Schieber aus Metall, und Metall gehört nicht in die Mikrowelle. Wo die Hütte das verlangt, vorher fragen.",
      "Waschbar bei 30 °C.",
    ],
    nichtFuer: "Hütten, die wegen Bettwanzen die Mikrowelle vorschreiben.",
  },
  {
    asin: "B0CT6B4WGH",
    name: "Reactor Liner Mummy",
    marke: "Sea to Summit",
    abzeichen: "Für kalte Nächte",
    rolle: "Kein Hygieneschlafsack, sondern eine Wärmeschicht — der hygienisch mitläuft.",
    einordnung:
      "Thermolite-Gewebe, dehnbar, Mumienform mit Kapuze und Kordelzug, 284 Gramm. Sea to Summit verkauft ihn als Wärmeschicht für den Schlafsack, nicht als Hüttenschlafsack. Auf der Hütte erfüllt er beides: Er ist ein eigener Schlafsack unter der Hüttendecke, und er hält wärmer als Baumwolle oder Seide. Für alle, die in Matratzenlagern im Herbst frieren.",
    material: "Thermolite",
    materialDetail: "Thermolite (Kunstfaser), dehnbar",
    gramm: 284,
    masse: "216 cm lang, 80/55 cm breit",
    packmass: null,
    verschluss: "Kordelzug an der Kapuze",
    waschen: "Waschmaschine laut Hersteller",
    mikrowelle: "nicht angegeben",
    kissen: false,
    dafuer: [
      "Die wärmste Lösung hier, bei 284 g.",
      "Dehnbar: Man kann sich bewegen, ohne das Inlett mitzuziehen.",
      "Geruchshemmend ausgerüstet, Packsack dabei.",
    ],
    dagegen: [
      "Mumienform: an den Füßen 55 cm breit, eng für Seitenschläfer.",
      "Zur Mikrowelle sagt der Hersteller nichts.",
      "Im warmen Lager im Sommer zu warm.",
    ],
    nichtFuer: "Hochsommer und gut geheizte Zimmer.",
  },
];

/** Der Hüttenschlafsack in der Form, die die gemeinsamen Bausteine verstehen. */
export function alsProdukt(h: Huettenschlafsack): Produkt {
  return {
    ...h,
    kurz: [h.material, h.gramm ? `${h.gramm} g` : null, h.packmass].filter(Boolean).join(" · "),
    eckdaten: [
      ["Material", h.materialDetail],
      ["Gewicht", h.gramm ? `${h.gramm} g` : "nicht genannt"],
      ["Maße", h.masse ?? "nicht genannt"],
      ["Packmaß", h.packmass ?? "nicht genannt"],
      ["Verschluss", h.verschluss],
      ["Waschen", h.waschen ?? "nicht genannt"],
    ],
    kennwert: { wert: h.gramm ? `${h.gramm} g` : "k. A.", unter: h.material },
  };
}

export const QUELLEN = {
  hueoto: "https://www.alpenverein.at/portal_wAssets/docs/huetten-wege/regelungen/huetten_tarif_ordnung/012022_HueOTO.pdf",
  davGast: "https://www.alpenverein.de/artikel/zu-gast-auf-alpenvereinshutten_7bf6cdc6-934f-4a00-9ff7-9829cb6180d0",
  davShop: "https://www.dav-shop.de/page.aspx?name=Huettenschlafsack",
  dpa: "https://www.welt.de/newsticker/dpa_nt/infoline_nt/wissenschaft_nt/article196760827/Wanze-am-Berg-Mikrowelle-gegen-Bettwanzen.html",
  uba: "https://www.umweltbundesamt.de/system/files/medien/479/publikationen/2023_uba_ratgeber_bettwanzen.pdf",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Ist ein Hüttenschlafsack Pflicht?",
    antwort:
      "Ja, auf Alpenvereinshütten. In der Hütten- und Tarifordnung steht: „Für alle Schlafplätze ist die Verwendung eines Hüttenschlafsacks verpflichtend vorgeschrieben.“ Der Grund ist Hygiene: Decken und Bettwäsche in Lagern und Mehrbettzimmern werden nicht nach jeder Nacht gewaschen.",
  },
  {
    frage: "Was ist ein Hüttenschlafsack?",
    antwort:
      "Ein dünner Innenschlafsack aus Baumwolle, Seide oder Mikrofaser, in dem man unter der Hüttendecke schläft. Er wärmt kaum, sondern trennt den Körper von Decke und Matratze. Er wiegt zwischen gut 100 und rund 500 Gramm.",
  },
  {
    frage: "Seide, Baumwolle oder Mikrofaser?",
    antwort:
      "Seide ist am leichtesten und kleinsten, aber teuer und empfindlich. Baumwolle ist angenehm auf der Haut und günstig, aber schwerer. Mikrofaser ist leicht und billig, fühlt sich aber für manche weniger angenehm an. Für die meisten ist Baumwolle der beste Kompromiss.",
  },
  {
    frage: "Warum muss der Hüttenschlafsack in die Mikrowelle?",
    antwort:
      "Wegen Bettwanzen. Auf einigen Hütten, etwa der Knorrhütte an der Zugspitze, muss der Schlafsack schon am Eingang kurz in die Mikrowelle — 2019 berichtete die dpa von 30 Sekunden bei 600 Watt. Laut DAV-Sektion München werden Bettwanzen zu 70 Prozent über Hüttenschlafsäcke eingeschleppt. Metall wie Reißverschlussschieber gehört nicht in die Mikrowelle.",
  },
  {
    frage: "Kann man einen Hüttenschlafsack auf der Hütte leihen?",
    antwort:
      "Oft ja, gegen Gebühr, manchmal auch kaufen. Der DAV-Shop rät, das vorher bei der Hütte zu erfragen. Wer mehrere Nächte plant, fährt mit einem eigenen günstiger.",
  },
  {
    frage: "Wie wasche ich einen Hüttenschlafsack?",
    antwort:
      "Nach Herstellerangabe, viele erlauben nur 30 °C. Nach einer Hütte mit Bettwanzen-Hinweis reicht das nicht: Das Umweltbundesamt nennt mindestens 40 °C, besser 60 °C im längsten Programm, oder drei Tage bei −18 °C im Tiefkühlfach, locker in einer verschlossenen Tüte.",
  },
  {
    frage: "Braucht man auf der Hütte einen richtigen Schlafsack?",
    antwort:
      "Auf bewirtschafteten Alpenvereinshütten nein — dort gibt es Decken, und der Hüttenschlafsack kommt darunter. Wer leicht friert, nimmt einen wärmeren Innenschlafsack statt eines zweiten Schlafsacks.",
  },
];
