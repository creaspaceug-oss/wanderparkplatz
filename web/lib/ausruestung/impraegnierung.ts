import type { Produkt } from "./typen";

/**
 * Die Auswahl für „Schuhe imprägnieren“ — von Hand zusammengestellt.
 *
 * Welches Mittel passt, hängt am Obermaterial: Der DAV nennt Schuhwachs für
 * Glattleder und Imprägniersprays für Rauleder und Kunstfaser. Danach richtet
 * sich der Pflegeplaner. Die Stiftung Warentest hat 2023 Imprägniermittel
 * getestet (test 9/2023); die Einzelnoten sind kostenpflichtig, öffentlich
 * sind nur die Aussagen im frei lesbaren Teil, die Antworten der Redaktion in
 * den Kommentaren und die Angaben der Hersteller zu ihren Testergebnissen.
 */

export type Material = "glatt" | "rau" | "textil" | "misch";
export type Form = "Pumpspray" | "Wachs" | "Set";

export interface Mittel {
  key: string;
  name: string;
  marke: string;
  asin: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  form: Form;
  inhalt: string;
  /** Wofür der Hersteller es ausweist. */
  materialien: Material[];
  pfas: string;
  membran: string;
  warentest: string | null;
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const MATERIAL_NAME: Record<Material, string> = {
  glatt: "Glattleder",
  rau: "Rauleder (Nubuk, Velours)",
  textil: "Textil, Synthetik",
  misch: "Leder und Textil gemischt",
};

export const MITTEL: Mittel[] = [
  {
    key: "holmenkol",
    name: "Natural Proof",
    marke: "Holmenkol",
    asin: "B07TWK7KWZ",
    abzeichen: "Unsere erste Wahl",
    rolle: "Das Testsieger-Spray für Textil- und Membranschuhe — ohne Treibgas, ohne Fluor.",
    einordnung:
      "Holmenkol weist Natural Proof als fluorfreie Universal-Imprägnierung für Funktionstextilien und Schuhe aus, einsetzbar bei allen Membranen. Es kommt aus der Pumpflasche, nicht aus der Treibgasdose — das ist mehr als eine Formsache: Laut Bundesinstitut für Risikobewertung werden die Tröpfchen einer Pumpe nicht kleiner als 100 Mikrometer und erreichen die Lungenbläschen nicht. Im Test der Stiftung Warentest 9/2023 lag es laut Hersteller und Berichten über den Test gemeinsam mit Toko Eco Proof Textile vorn, mit der Note 1,7.",
    form: "Pumpspray",
    inhalt: "500 ml",
    materialien: ["textil", "misch"],
    pfas: "fluorfrei laut Hersteller",
    membran: "alle Membranen laut Hersteller",
    warentest: "Testsieger 9/2023 (1,7)",
    dafuer: [
      "Testsieger bei der Stiftung Warentest 9/2023, laut Berichten mit 1,7.",
      "Pumpspray ohne Treibgas: grobe Tröpfchen, kein lungengängiger Nebel.",
      "Fluorfrei, für alle Membranen.",
      "Auch für Jacke und Rucksack — eine Flasche für die ganze Ausrüstung.",
    ],
    dagegen: [
      "500 ml — für ein Paar Schuhe allein reichlich; lohnt sich, wenn Jacke und Rucksack mitbehandelt werden.",
      "Für Glattleder rät der DAV zu Wachs, nicht zu Spray.",
    ],
    nichtFuer: "Reine Glattlederstiefel. Die bekommen Wachs.",
  },
  {
    key: "nikwaxSL",
    name: "Stoff & Leder Imprägnierung",
    marke: "Nikwax",
    asin: "B001KAQSW8",
    abzeichen: "Für gemischte Schuhe",
    rolle: "Für den typischen Wanderschuh aus Leder und Textil — auf den nassen Schuh gesprüht.",
    einordnung:
      "Die meisten Wanderschuhe sind heute gemischt: Lederbesätze, Textilflächen, darunter eine Membran. Genau dafür ist dieses Spray gemacht, laut Nikwax auch für geöltes, gewachstes und beschichtetes Leder. Es wird auf den sauberen, noch nassen Schuh gesprüht, nach zwei Minuten wischt man den Überschuss ab, eine Wärmebehandlung braucht es nicht. Nikwax nennt seine Produkte PFAS-frei und wasserbasiert.",
    form: "Pumpspray",
    inhalt: "300 ml",
    materialien: ["misch", "textil", "glatt"],
    pfas: "PFAS-frei laut Hersteller",
    membran: "für Membranschuhe ausgewiesen",
    warentest: null,
    dafuer: [
      "Für Leder, Textil und Mischungen — passt auf fast jeden Wanderschuh.",
      "Wird auf den nassen Schuh aufgetragen: direkt nach dem Reinigen.",
      "Pumpspray, PFAS-frei und wasserbasiert laut Hersteller.",
    ],
    dagegen: [
      "Nicht im Warentest 2023 geprüft.",
      "Für reine Rauleder- oder Glattlederschuhe gibt es passendere Mittel.",
    ],
    nichtFuer: "Reine Nubuk- oder Veloursschuhe. Dafür hat Nikwax ein eigenes Spray.",
  },
  {
    key: "nikwaxSet",
    name: "Reinigungsgel + Stoff & Leder Imprägnierung",
    marke: "Nikwax",
    asin: "B01MQFV8JO",
    abzeichen: "Reinigen und imprägnieren",
    rolle: "Beide Schritte in einer Packung — weil Imprägnieren auf schmutzigen Schuhen wenig bringt.",
    einordnung:
      "Der DAV beginnt jede Schuhpflege mit dem Reinigen: Schweiß, Hautfett und Schmutz mindern die Funktion der Membran. Das Set kombiniert das Stoff-und-Leder-Spray mit einem Reinigungsgel, das laut Nikwax für Glattleder, Wildleder, Nubuk und Stoff gedacht ist: aufsprühen, sanft schrubben, abspülen — und dann das Imprägnierspray auf den noch nassen Schuh.",
    form: "Set",
    inhalt: "2 × 300 ml",
    materialien: ["misch", "textil", "glatt", "rau"],
    pfas: "PFAS-frei laut Hersteller",
    membran: "für Membranschuhe ausgewiesen",
    warentest: null,
    dafuer: [
      "Reiniger und Imprägnierung passen zueinander — der Reiniger bereitet den nassen Schuh vor.",
      "Reinigungsgel für alle Obermaterialien laut Hersteller.",
    ],
    dagegen: [
      "Die Imprägnierung darin ist das Stoff-und-Leder-Spray — für reines Rauleder nicht die erste Wahl.",
      "Nicht im Warentest 2023 geprüft.",
    ],
    nichtFuer: "Wer seine Schuhe mit Bürste und Seifenlauge reinigt, wie es der DAV beschreibt. Dann reicht das Spray allein.",
  },
  {
    key: "nikwaxWachs",
    name: "Imprägnierwachs für Leder",
    marke: "Nikwax",
    asin: "B0041DFH3C",
    abzeichen: "Für Glattleder",
    rolle: "Das Wachs für den klassischen Lederstiefel, auch mit Gore-Tex.",
    einordnung:
      "Für Glattleder nennt der DAV Schuhwachs, keine öligen oder fettenden Mittel. Das Nikwax-Wachs ist wasserbasiert, wird mit dem Schwamm eingerieben, besonders an den Nähten, und nach zwei Minuten mit einem feuchten Tuch abgenommen. Nikwax empfiehlt es ausdrücklich auch für Stiefel mit Gore-Tex und eVent und betont, dass es das Leder nicht übermäßig weich macht.",
    form: "Wachs",
    inhalt: "100 ml",
    materialien: ["glatt"],
    pfas: "PFAS-frei laut Hersteller",
    membran: "auch für Gore-Tex und eVent laut Hersteller",
    warentest: null,
    dafuer: [
      "Wachs für Glattleder, so wie es der DAV empfiehlt.",
      "Mit Schwammapplikator, auf nassem oder trockenem Leder.",
      "Kein Sprühnebel.",
    ],
    dagegen: [
      "Nur für Glattleder — nicht für Nubuk, Velours oder Textil.",
      "Kleine Tube.",
    ],
    nichtFuer: "Gemischte Schuhe mit viel Textil oder Rauleder.",
  },
  {
    key: "meindl",
    name: "Sportwax",
    marke: "Meindl",
    asin: "B01DHBKSJ6",
    abzeichen: "Vom Schuhhersteller",
    rolle: "Das Wachs eines Bergschuhherstellers, im Doppelpack.",
    einordnung:
      "Meindl baut selbst Lederbergstiefel und bietet dazu ein eigenes Wachs an: laut Angebot zur Pflege und zum Schutz aller Glattleder, auch mit Gore-Tex. Mehr verrät das Angebot nicht — keine Inhaltsstoffe, keine Angabe zu PFAS. Wer Meindl-Stiefel trägt, pflegt sie damit so, wie es der Hersteller selbst vorsieht.",
    form: "Wachs",
    inhalt: "2 × 80 g",
    materialien: ["glatt"],
    pfas: "k. A.",
    membran: "auch für Gore-Tex laut Hersteller",
    warentest: null,
    dafuer: [
      "Vom Hersteller von Lederbergstiefeln.",
      "Für Glattleder mit und ohne Gore-Tex.",
      "Zwei Dosen — reicht lange.",
    ],
    dagegen: [
      "Das Angebot nennt weder Inhaltsstoffe noch PFAS-Freiheit.",
      "Nur für Glattleder.",
    ],
    nichtFuer: "Wer ausdrücklich ein PFAS-freies Mittel sucht. Dann das Nikwax-Wachs.",
  },
  {
    key: "nikwaxNubuk",
    name: "Nubuk & Wildleder Spray-On",
    marke: "Nikwax",
    asin: "B0BRJSDGVW",
    abzeichen: "Für Rauleder",
    rolle: "Für Nubuk- und Veloursschuhe, ohne die Oberfläche zu verkleben.",
    einordnung:
      "Rauleder bekommt laut DAV ein Spray, kein Wachs, und zum Schluss die Raulederbürste. Dieses Nikwax-Spray ist für Nubuk und Wildleder gemacht und soll die Struktur des Leders erhalten. Aufgetragen wird es aus 15 Zentimetern auf den sauberen, nassen Schuh; nach zwei Minuten den Überschuss abnehmen und natürlich trocknen lassen.",
    form: "Pumpspray",
    inhalt: "125 ml",
    materialien: ["rau"],
    pfas: "PFAS-frei laut Hersteller",
    membran: "für Membranschuhe ausgewiesen",
    warentest: null,
    dafuer: [
      "Eigens für Nubuk und Wildleder.",
      "Erhält laut Hersteller Struktur und Atmungsaktivität.",
      "Pumpspray, PFAS-frei laut Hersteller.",
    ],
    dagegen: [
      "Kleine Flasche.",
      "Nur für Rauleder sinnvoll.",
    ],
    nichtFuer: "Glattlederschuhe.",
  },
  {
    key: "grangers",
    name: "Footwear Repel",
    marke: "Grangers",
    asin: "B00R1FOGC0",
    abzeichen: "Für alle Obermaterialien",
    rolle: "Ein Spray für alles im Schuhschrank — Leder, Rauleder, Gewebe.",
    einordnung:
      "Grangers weist Footwear Repel für Leder, Wildleder, Nubuk und Gewebe aus; das Spray ist bluesign-zugelassen, und Grangers nennt seine Formulierungen wasserbasiert und fluorkohlenstofffrei. Wer Schuhe aus verschiedenen Materialien im Haushalt hat und nur eine Flasche kaufen will, liegt hier richtig.",
    form: "Pumpspray",
    inhalt: "275 ml",
    materialien: ["glatt", "rau", "textil", "misch"],
    pfas: "fluorkohlenstofffrei laut Hersteller",
    membran: "atmungsaktiv laut Hersteller",
    warentest: null,
    dafuer: [
      "Für jedes Obermaterial laut Hersteller.",
      "bluesign-zugelassen.",
      "Pumpspray.",
    ],
    dagegen: [
      "Für Glattleder rät der DAV eher zu Wachs.",
      "Nicht im Warentest 2023 geprüft.",
    ],
    nichtFuer: "Wer für jedes Material das spezialisierte Mittel will.",
  },
];

export function alsProdukt(m: Mittel): Produkt {
  return {
    asin: m.asin,
    name: m.name,
    marke: m.marke,
    abzeichen: m.abzeichen,
    rolle: m.rolle,
    einordnung: m.einordnung,
    kurz: `${m.form} · ${m.inhalt}`,
    eckdaten: [
      ["Form", m.form],
      ["Inhalt", m.inhalt],
      ["Für", m.materialien.map((x) => MATERIAL_NAME[x]).join(", ")],
      ["PFAS", m.pfas],
      ["Membran", m.membran],
      ["Stiftung Warentest", m.warentest ?? "nicht geprüft"],
    ],
    kennwert: { wert: m.form, unter: m.inhalt },
    siegel: m.warentest ? `Stiftung Warentest: ${m.warentest}` : undefined,
    dafuer: m.dafuer,
    dagegen: m.dagegen,
    nichtFuer: m.nichtFuer,
  };
}

export const QUELLEN = {
  warentest: "https://www.test.de/Impraegniermittel-im-Test-4899882-0/",
  warentestBericht: "https://www.eltern-kind-tipps.de/14673/impraegnierspray-im-test/",
  holmenkol: "https://www.holmenkol.com/de/en/Natural-Proof/22250",
  davPflege:
    "https://www.alpenverein.de/artikel/bergbekleidung-und-schuhe-pflegen-und-reparieren_710ac22a-1066-41d6-b9c7-cc5a0c52ccec",
  gore: "https://www.gore-tex.com/de/blog/wie-pflegt-man-gore-tex-schuhe",
  bfr2006: "https://www.bfr.bund.de/presseinformation/ursache-fuer-vergiftungsfaelle-mit-nano-spray-noch-nicht-vollstaendig-aufgeklaert/",
  bfr2020: "https://www.bfr.bund.de/presseinformation/wenn-das-impraegnierspray-auf-die-lunge-schlaegt/",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Muss man neue Schuhe imprägnieren?",
    antwort:
      "Ja, rät die Stiftung Warentest: Schuhe direkt nach dem Kauf imprägnieren, weil nicht alle ab Werk gut gegen Nässe und Schmutz gewappnet sind. Das Spray gleichmäßig auftragen und die Schuhe danach auslüften lassen.",
  },
  {
    frage: "Muss man Gore-Tex-Schuhe imprägnieren?",
    antwort:
      "Ja. Die Membran hält Wasser ab, aber das Obermaterial darüber saugt sich ohne Imprägnierung voll — dann wird der Schuh schwer und atmet schlechter, schreibt der DAV. Gore-Tex selbst empfiehlt, nach dem Reinigen ein Imprägnierspray aufzutragen. Ölige und fettende Pflegemittel gehören laut DAV nicht an Membranschuhe.",
  },
  {
    frage: "Wie oft sollte man Wanderschuhe imprägnieren?",
    antwort:
      "Nach Bedarf, nicht nach Kalender. Die Stiftung Warentest empfiehlt den Tropfentest: ein wenig Wasser auftropfen. Perlt es ab, reicht die Imprägnierung noch; zieht es ein, ist sie fällig. Nach einer gründlichen Reinigung empfiehlt Gore-Tex ohnehin, neu zu imprägnieren.",
  },
  {
    frage: "Wachs oder Spray?",
    antwort:
      "Das hängt am Obermaterial. Der DAV nennt Schuhwachs für Glattleder und Imprägniersprays für Rauleder wie Nubuk und Velours sowie für Kunstfaser. Rauleder zum Schluss mit der Raulederbürste aufrauen.",
  },
  {
    frage: "Sind Imprägniersprays gefährlich?",
    antwort:
      "Treibgassprays können es sein. Laut Bundesinstitut für Risikobewertung entstehen nur beim Sprühen mit Treibgas so feine Tröpfchen, dass sie tief in die Lunge gelangen und dort Atemnot bis hin zum Lungenödem auslösen können. Bei Pumpsprays sind die Tröpfchen nicht kleiner als 100 Mikrometer und erreichen die Lungenbläschen nicht. Im Freien sprühen, wenige kurze Sprühstöße, Abstand halten.",
  },
  {
    frage: "Was bedeutet PFC-frei oder PFAS-frei?",
    antwort:
      "PFAS sind per- und polyfluorierte Chemikalien, die Wasser, Fett und Schmutz abweisen, sich aber in Umwelt und Organismen anreichern. Die Stiftung Warentest wertete 2023 fünf Imprägniersprays, die solche Stoffe versprühten, mit mangelhaft ab. Alle Mittel in diesem Vergleich außer dem Meindl-Wachs sind laut Hersteller fluor- oder PFAS-frei; Meindl macht dazu im Angebot keine Angabe.",
  },
];
