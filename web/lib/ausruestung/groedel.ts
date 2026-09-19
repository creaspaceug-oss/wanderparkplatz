import type { Produkt } from "./typen";

/**
 * Die Auswahl für den Grödelvergleich — von Hand zusammengestellt.
 *
 * Grödel werden nach Schuhgröße verkauft, und bei Amazon hat jede Größe eine
 * eigene ASIN. Deshalb steht zu jedem Modell die Liste seiner Größen; die
 * Schuhgrößen dazu nur, wo der Hersteller sie im Angebot nennt.
 *
 * Einen Test der Stiftung Warentest gibt es nicht. Belegt sind zwei Dinge:
 * Der Händler Bergzeit hat im Dezember 2025 16 Modelle ausprobiert und je
 * Einsatzbereich einen Sieger genannt, die Schweizer Zeitschrift Saldo hat
 * 2023 Schuhspikes für den Alltag getestet. Gewichte stammen, wo nicht anders
 * vermerkt, aus dem Bergzeit-Test — die Hersteller nennen sie im Angebot
 * fast nie.
 */

export interface Groesse {
  k: string;
  asin: string;
  /** EU-Schuhgrößen laut Angebot; fehlt, wenn der Hersteller sie dort nicht nennt. */
  schuh?: [number, number];
}

export interface Groedel {
  name: string;
  marke: string;
  abzeichen?: string;
  rolle: string;
  einordnung: string;
  zacken: number | null;
  /** Länge der Zacken in Millimetern, falls angegeben. */
  zackenMm: number | null;
  /** Gramm je Paar; null, wenn niemand ein belastbares Gewicht nennt. */
  gramm: number | null;
  grammQuelle?: string;
  befestigung: string;
  einsatz: string;
  besonderheit: string;
  groessen: Groesse[];
  dafuer: string[];
  dagegen: string[];
  nichtFuer: string;
}

export const GROEDEL: Groedel[] = [
  {
    name: "Chainsen Pro",
    marke: "Snowline",
    abzeichen: "Unsere erste Wahl",
    rolle: "Der Klassiker fürs Winterwandern — in fünf Größen, vom Kinderschuh bis Größe 52.",
    einordnung:
      "Snowline verkauft Grödel mit Gummirand nach eigener Angabe seit 1991, und die Chainsen Pro sind das Modell, an das die meisten denken, wenn sie „Grödel“ sagen. Edelstahlzacken an einer Edelstahlkette, ein Gummirahmen, der über den Schuh gezogen wird. Nichts daran ist neu. Aber die Größen reichen von 32 bis 52, und kaum ein anderer Hersteller sagt im Angebot so genau, welche Größe zu welchem Schuh passt.",
    zacken: null,
    zackenMm: null,
    gramm: null,
    befestigung: "Gummirahmen",
    einsatz: "Winterwandern, Rodeln, vereiste Wege",
    besonderheit: "fünf Größen mit Schuhgrößen im Angebot",
    groessen: [
      { k: "S", asin: "B006OEPOZC", schuh: [32, 36] },
      { k: "M", asin: "B006O5K050", schuh: [36, 40] },
      { k: "L", asin: "B006O5JZ56", schuh: [40, 44] },
      { k: "XL", asin: "B006O5JZD8", schuh: [44, 48] },
      { k: "XXL", asin: "B018U6YGYQ", schuh: [48, 52] },
    ],
    dafuer: [
      "Fünf Größen, jede mit Schuhgrößen im Angebot. Man muss nicht raten.",
      "Die kleinste Größe beginnt bei 32 — für Kinder, die mitgehen, ein seltenes Angebot.",
      "Snowline gibt an, seine Modelle seien als Gleitschutz CE-zertifiziert und TÜV-geprüft.",
      "Mit Packbeutel, damit die Zacken im Rucksack nichts aufreißen.",
    ],
    dagegen: [
      "Weder Zackenzahl noch -länge noch Gewicht stehen im Angebot.",
      "Nicht im Bergzeit-Test — dort war das leichtere Modell Chainsen Light dabei.",
      "Die Preise unterscheiden sich je nach Größe spürbar — vor dem Kauf die eigene Größe vergleichen, nicht die erstbeste.",
    ],
    nichtFuer:
      "Harte, steile Schneefelder. Grödel ersetzen dort kein Steigeisen, egal von welchem Hersteller.",
  },
  {
    name: "Ice Master Light",
    marke: "Camp",
    abzeichen: "Lange Zacken",
    rolle: "13 Zacken mit 13 Millimetern — mehr Biss auf hartem Eis als die meisten.",
    einordnung:
      "Der italienische Bergsporthersteller Camp nennt als einer der wenigen alles, was man vergleichen will: 13 Zacken aus rostfreiem Edelstahl, jede 13 Millimeter lang, gleichmäßig über die Sohle verteilt. Hinten eine Lasche, an der man den Gummi über die Ferse zieht. Bergzeit hat ihn getestet und 302 Gramm je Paar gewogen.",
    zacken: 13,
    zackenMm: 13,
    gramm: 302,
    grammQuelle: "Bergzeit",
    befestigung: "Elastomer, Lasche an der Ferse",
    einsatz: "Winterwandern, vereiste Wege",
    besonderheit: "Lasche hinten zum Anziehen",
    groessen: [
      { k: "S", asin: "B09FK5N8BP", schuh: [36, 38] },
      { k: "M", asin: "B09FL791WH", schuh: [39, 41] },
      { k: "L", asin: "B09FMNWLLF", schuh: [42, 44] },
      { k: "XL", asin: "B09FKKH4RT", schuh: [45, 47] },
    ],
    dafuer: [
      "Zackenzahl und -länge stehen im Angebot: 13 Stück, je 13 mm.",
      "Eine Lasche an der Ferse, laut Camp für schnelles An- und Ausziehen.",
      "Vier Größen, jede mit Schuhgrößen im Namen.",
      "Von Bergzeit ausprobiert: 302 g je Paar.",
    ],
    dagegen: [
      "Keine Größe unter 36 und über 47.",
      "Lange Zacken greifen auf Eis besser, stolpern aber leichter über Wurzeln und Steine.",
      "Kein Hinweis auf eine Prüfung oder Zertifizierung im Angebot.",
    ],
    nichtFuer: "Wer Schuhgröße 48 oder mehr trägt. Dann Snowline Chainsen Pro in XXL.",
  },
  {
    name: "Microspikes",
    marke: "Kahtoola",
    abzeichen: "Vier Jahre Garantie",
    rolle: "Die teuren unter den Grödeln — mit vier Jahren Garantie.",
    einordnung:
      "Kahtoola aus den USA verkauft seine Grödel unter dem Namen Microspikes. 12 Zacken aus wärmebehandeltem Edelstahl, je einen Zentimeter lang, acht unter dem Vorfuß und vier unter der Ferse. Das Gummi bleibt laut Hersteller bis minus 30 Grad dehnbar, die Ösen — sonst die Stelle, an der Grödel reißen — sind verstärkt.",
    zacken: 12,
    zackenMm: 10,
    gramm: null,
    befestigung: "Elastomer mit Zehenbügel",
    einsatz: "Winterwandern, Bergwege, Trailrunning",
    besonderheit: "4 Jahre Herstellergarantie",
    groessen: [
      { k: "S", asin: "B00RXX5ZVQ" },
      { k: "M", asin: "B0172G4S7K", schuh: [42, 44] },
      { k: "L", asin: "B0BSKJPKTQ" },
      { k: "XL", asin: "B0172G4SD4" },
    ],
    dafuer: [
      "Vier Jahre Herstellergarantie — die einzige Garantieangabe in diesem Vergleich.",
      "Verstärkte Ösen, an der Stelle, an der Grödel am ehesten reißen.",
      "Acht Zacken vorn, vier an der Ferse: Beim Bergabgehen greift auch die Ferse.",
    ],
    dagegen: [
      "Der teuerste Grödel in diesem Vergleich.",
      "Kein Gewicht im Angebot, und bei Amazon mischen sich Angebote verschiedener Jahrgänge.",
      "Schuhgrößen nennt das Angebot nur für M. Für die anderen Größen die Tabelle auf den Produktbildern ansehen.",
    ],
    nichtFuer: "Wer zweimal im Winter auf einen vereisten Waldweg geht. Dafür reichen günstigere Grödel.",
  },
  {
    name: "Puez Mtn Spike",
    marke: "Salewa",
    abzeichen: "18 Zacken",
    rolle: "Lange Zacken und ein Klettverschluss — für steile, vereiste Wege.",
    einordnung:
      "18 Zacken aus rostfreiem Edelstahl, je 12 Millimeter lang, und ein Klettverschluss über dem Rist, der schnell an- und abgelegt ist. Bergzeit hat die Salewa MTN Spikes mit 18 Zacken zum Sieger fürs Bergwandern erklärt; ob das Amazon-Angebot mit dem Namen „Puez“ genau dieses Modell ist, sagt der Text nicht.",
    zacken: 18,
    zackenMm: 12,
    gramm: null,
    befestigung: "Klettverschluss",
    einsatz: "Bergwandern, steile vereiste Wege",
    besonderheit: "eine Größe für 36–47",
    groessen: [{ k: "36–47", asin: "B076317JHB", schuh: [36, 47] }],
    dafuer: [
      "18 Zacken mit je 12 mm — bei den Markengrödeln hier die meisten.",
      "Klettverschluss: laut Salewa schnell an- und abgelegt.",
      "Eine Größe für 36 bis 47, man muss nicht wählen.",
    ],
    dagegen: [
      "Eine Größe für elf Schuhgrößen passt nicht an jedem Ende gleich gut.",
      "Ob es das von Bergzeit getestete Modell ist, ist nicht sicher.",
      "Kein Gewicht im Angebot. Mehr Zacken wiegen mehr.",
    ],
    nichtFuer: "Den Weg zum Bäcker. Für flache Wege sind 18 lange Zacken zu viel.",
  },
  {
    name: "Chainsen Light",
    marke: "Snowline",
    abzeichen: "230 Gramm",
    rolle: "Die leichte Schwester der Pro — für den Rucksack, auf Verdacht.",
    einordnung:
      "Bergzeit hat 230 Gramm je Paar gewogen und 12 Zacken gezählt. Das Gummi soll laut Snowline bis minus 50 Grad elastisch bleiben. Die Chainsen Light sind die Grödel, die man im Herbst und Frühjahr einpackt, ohne zu wissen, ob man sie braucht — und die dann nicht stören.",
    zacken: 12,
    zackenMm: null,
    gramm: 230,
    grammQuelle: "Bergzeit",
    befestigung: "Elastomer, Edelstahl-U-Schäkel",
    einsatz: "Wandern im Übergang, als Reserve",
    besonderheit: "Gummi laut Hersteller bis −50 °C elastisch",
    groessen: [
      { k: "S", asin: "B07KPSZT3N" },
      { k: "M", asin: "B08HVBJK5Z" },
      { k: "XL", asin: "B08HV9TFJJ" },
    ],
    dafuer: [
      "230 g je Paar, von Bergzeit nachgewogen.",
      "Gummi laut Hersteller bis −50 °C elastisch.",
      "Klein genug für jede Deckeltasche.",
    ],
    dagegen: [
      "Schuhgrößen stehen im Angebot nicht. Die Größen folgen vermutlich dem Schema der Pro, zusagen tut es das Angebot nicht.",
      "Leichter heißt auch: weniger Material für harte Einsätze.",
      "Größe L war bei Amazon zuletzt nicht lieferbar und fehlt deshalb hier.",
    ],
    nichtFuer: "Den ganzen Winter auf harschigen Wegen. Dafür sind die Pro oder die Camp robuster gebaut.",
  },
  {
    name: "Grödel 19 Zähne",
    marke: "Marktplatz",
    abzeichen: "Günstigster",
    rolle: "Für den einen Winterurlaub — wenn niemand weiß, ob es einen zweiten gibt.",
    einordnung:
      "19 Zacken, ein dickes Gummi, das bis minus 45 Grad halten soll, ein Tragebeutel — für einen Bruchteil des Preises. Unter wechselnden Namen verkaufen mehrere Händler dieselbe Bauart. Geprüft hat sie niemand, den wir zitieren könnten. Snowline schreibt über die eigenen Grödel, sie seien persönliche Schutzausrüstung und man solle beim Kauf auf Prüfzeichen achten. Dieses Angebot nennt keines.",
    zacken: 19,
    zackenMm: null,
    gramm: null,
    befestigung: "Gummirahmen mit Riemen",
    einsatz: "gelegentlich",
    besonderheit: "mit Tragebeutel",
    groessen: [
      { k: "M", asin: "B0CTCSRN2R" },
      { k: "L", asin: "B0CSMV225D" },
    ],
    dafuer: [
      "Mit Abstand am günstigsten.",
      "19 Zacken und ein zusätzlicher Riemen über dem Rist.",
      "Ein Beutel ist dabei.",
    ],
    dagegen: [
      "Kein Prüfzeichen, keine Zackenlänge, kein Gewicht im Angebot.",
      "Schuhgrößen stehen nicht dabei, nur M und L.",
      "Wie lange die Ösen halten, weiß vorher niemand. Genau dort reißen billige Grödel.",
    ],
    nichtFuer: "Wer sich an einer ausgesetzten Stelle auf sie verlassen muss.",
  },
];

/**
 * Für den Alltag, nicht für den Berg — aber genau das suchen die meisten, die
 * "Spikes für Schuhe" eingeben. Bergzeit nennt das Modell Sieger im Alltag.
 */
export const CITY: Groedel = {
  name: "Chainsen City",
  marke: "Snowline",
  abzeichen: "Für Gehweg und Haltestelle",
  rolle: "Sechs Zacken, 60 Gramm — für den vereisten Weg zum Auto.",
  einordnung:
    "Bergzeit hat 60 Gramm je Paar gewogen, sechs Zacken gezählt und das Modell zum Sieger im Alltag erklärt. Die City passen auch über flache Straßenschuhe. Snowline gibt außerdem an, sie hätten im Test der Schweizer Zeitschrift Saldo von 2023 die beste Note bekommen.",
  zacken: 6,
  zackenMm: null,
  gramm: 60,
  grammQuelle: "Bergzeit",
  befestigung: "Gummirahmen",
  einsatz: "Alltag, Glatteis",
  besonderheit: "passt über Straßenschuhe",
  groessen: [
    { k: "M", asin: "B08RHS5PQ8" },
    { k: "L", asin: "B08L6S4BBL" },
    { k: "XL", asin: "B08L6RLFGQ" },
  ],
  dafuer: [
    "60 g je Paar. Passen in die Manteltasche.",
    "Laut Bergzeit auch über Schuhe mit Absatz.",
    "Bei Bergzeit Sieger im Alltag.",
  ],
  dagegen: [
    "Sechs kurze Zacken sind nichts für den Berg.",
    "Die Saldo-Note kennen wir nur aus Snowlines eigener Mitteilung. Der Artikel selbst steht hinter einer Bezahlschranke.",
  ],
  nichtFuer: "Wanderwege mit Gefälle.",
};

/**
 * Das Steigeisen als Abgrenzung. Wer im Rechner bei "Steigeisen" landet, soll
 * sehen, wie eins aussieht — nicht wieder bei einem Grödel.
 */
export const STEIGEISEN = {
  asin: "B00ET40HYC",
  marke: "Salewa",
  name: "Alpinist Combi",
  text: "12 Zacken aus Stahl mit Antistollplatten, Kipphebel hinten und ein weiches Körbchen vorn — die Kombibindung, die der DAV für bedingt steigeisenfeste Bergschuhe beschreibt. 920 Gramm laut Salewa, verstellbar für die Schuhgrößen 35 bis 48.",
};

/** Die Grödel in der Form, die die gemeinsamen Bausteine verstehen. */
export function alsProdukt(g: Groedel): Produkt {
  const asin = standardGroesse(g).asin;
  const schuh = g.groessen.filter((x) => x.schuh);
  return {
    asin,
    name: g.name,
    marke: g.marke,
    abzeichen: g.abzeichen,
    rolle: g.rolle,
    einordnung: g.einordnung,
    kurz: [
      g.zacken ? `${g.zacken} Zacken` : null,
      g.zackenMm ? `${g.zackenMm} mm` : null,
      g.gramm ? `${g.gramm} g` : null,
    ]
      .filter(Boolean)
      .join(" · ") || g.einsatz,
    eckdaten: [
      ["Zacken", g.zacken ? `${g.zacken}${g.zackenMm ? ` × ${g.zackenMm} mm` : ""}` : "nicht genannt"],
      ["Gewicht", g.gramm ? `${g.gramm} g je Paar (${g.grammQuelle})` : "nicht genannt"],
      ["Befestigung", g.befestigung],
      ["Größen", g.groessen.map((x) => x.k).join(", ")],
      ["Schuhgrößen", schuh.length ? `${schuh[0].schuh![0]}–${schuh[schuh.length - 1].schuh![1]}${schuh.length < g.groessen.length ? " (nicht für alle angegeben)" : ""}` : "nicht angegeben"],
      ["Einsatz", g.einsatz],
    ],
    kennwert: g.zacken
      ? { wert: `${g.zacken}`, zusatz: g.zackenMm ? `je ${g.zackenMm} mm` : undefined, unter: g.gramm ? `${g.gramm} g je Paar` : undefined }
      : undefined,
    dafuer: g.dafuer,
    dagegen: g.dagegen,
    nichtFuer: g.nichtFuer,
  };
}

/**
 * Die Größe, auf die Übersicht und Bericht verweisen: die für Schuhgröße 42,
 * sonst L, sonst M, sonst die erste. Eine mittlere Größe ist für die meisten richtig
 * und hat fast immer einen Preis.
 */
export function standardGroesse(g: Groedel): Groesse {
  return (
    g.groessen.find((x) => x.schuh && x.schuh[0] <= 42 && 42 <= x.schuh[1]) ??
    g.groessen.find((x) => x.k === "L") ??
    g.groessen.find((x) => x.k === "M") ??
    g.groessen[0]
  );
}

export const QUELLEN = {
  leichtsteigeisen:
    "https://www.alpenverein.de/artikel/leichtsteigeisen-was-man-wissen-muss_25593d3d-3b42-4011-8784-6c2c1c53b16c",
  schneefelder: "https://www.alpenverein.de/artikel/wandern-schneefelder_904a65a4-06a9-465a-9ee1-42e7e0f6f21a",
  bergzeit: "https://www.bergzeit.de/magazin/groedel-test-testsieger-vergleich/",
  saldo:
    "https://www.saldo.ch/tests/produktetests/detail/artikeldetail/test-die-guenstigsten-schuhspikes-haften-auf-eis-am-besten",
  snowline: "https://snowlinespikes.com/",
};

export const FRAGEN: { frage: string; antwort: string }[] = [
  {
    frage: "Was sind Grödel?",
    antwort:
      "Grödel sind kurze Metallzacken an einer Kette, die mit einem Gummirahmen über den Schuh gezogen werden. Sie geben Halt auf vereisten Wegen und festgetretenem Schnee. Anders als Steigeisen brauchen sie keinen besonderen Schuh und keine Bindung — und anders als Steigeisen taugen sie nicht für steiles, hartes Gelände.",
  },
  {
    frage: "Grödel oder Steigeisen — was brauche ich?",
    antwort:
      "Für vereiste Wege, Forststraßen und flache Schneepassagen reichen Grödel. Für harte, steile Schneefelder, Firn und Gletscher braucht es Steigeisen. Der Deutsche Alpenverein schreibt, Leichtsteigeisen böten deutlich mehr Sicherheit als Grödel, und auf hart gefrorenen Altschneefeldern gehe ohne Steigeisen meistens nichts mehr.",
  },
  {
    frage: "Welche Größe brauche ich bei Grödeln?",
    antwort:
      "Die nach der Schuhgröße des Schuhs, über den sie gezogen werden — also des Wanderschuhs, nicht des Straßenschuhs. Wer zwischen zwei Größen liegt, probiert beide über dem echten Schuh. Zu große Grödel verrutschen, zu kleine überdehnen den Gummi und reißen früher.",
  },
  {
    frage: "Passen Grödel auf jeden Schuh?",
    antwort:
      "Auf fast jeden festen Schuh mit Profil: Wanderschuhe, Winterstiefel, Trailrunningschuhe. Steigeisenfeste Bergschuhe braucht man nicht. Auf sehr weichen Schuhen können die Ketten drücken, und auf Absatzschuhen sitzen nur flache Alltagsspikes gut.",
  },
  {
    frage: "Kann man mit Grödeln auf Asphalt oder Fels gehen?",
    antwort:
      "Kurz, ja. Auf Dauer nutzen sich die Zacken ab, und auf glattem Fels oder Steinplatten rutschen Metallzacken sogar leichter als die Gummisohle. Auf eisfreien Abschnitten ausziehen.",
  },
  {
    frage: "Hat die Stiftung Warentest Grödel getestet?",
    antwort:
      "Nein. Belegt sind ein Praxistest des Händlers Bergzeit mit 16 Modellen (Dezember 2025) und ein Test von Schuhspikes für den Alltag der Schweizer Zeitschrift Saldo (Heft 19/2023).",
  },
  {
    frage: "Brauche ich Grödel im Mittelgebirge?",
    antwort:
      "Im Winter oft ja. Vereiste Forstwege und festgetretene Schneepfade gibt es im Harz, im Schwarzwald oder im Bayerischen Wald genauso wie in den Alpen, und morgens nach einer klaren Nacht sind sie am glättesten.",
  },
];
