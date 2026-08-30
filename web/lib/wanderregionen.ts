/**
 * Kuratierte Wanderregionen.
 *
 * Nutzer suchen nach "Wanderparkplatz Schwarzwald", nicht nach
 * "Wanderparkplatz Ortenaukreis". Verwaltungsgrenzen und Wanderregionen
 * decken sich nicht — deshalb hier ein bewusst gepflegter Datensatz mit
 * Mittelpunkt und Radius statt einer aus den Kreisen abgeleiteten Krücke.
 *
 * Der Bestand wird zur Laufzeit gezählt; Regionen ohne erfasste Parkplätze
 * erscheinen nicht. Sobald der Datenbestand wächst, tauchen sie von selbst auf.
 */
export interface Wanderregion {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  laender: string[];
  /** Ein Satz für Kacheln und Listen. */
  kurz: string;
  /** Einleitung der Regionsseite. */
  text: string;
  /** Bekannte Fernwanderwege der Region. */
  fernwege: string[];
}

export const WANDERREGIONEN: Wanderregion[] = [
  {
    slug: "schwarzwald",
    name: "Schwarzwald",
    lat: 48.2, lon: 8.2, radiusKm: 55,
    laender: ["Baden-Württemberg"],
    kurz: "Größtes zusammenhängendes Mittelgebirge Deutschlands",
    text:
      "Der Schwarzwald ist das größte zusammenhängende Mittelgebirge Deutschlands und reicht vom Hochrhein bis nach Karlsruhe. Der Feldberg erreicht 1493 Meter und ist damit der höchste Berg außerhalb der Alpen. Die Wanderparkplätze liegen häufig an Passstraßen und Talausgängen — im Winter ist die Zufahrt zu den Höhenlagen nicht überall geräumt.",
    fernwege: ["Westweg", "Mittelweg", "Ostweg", "Schluchtensteig"],
  },
  {
    slug: "schwaebische-alb",
    name: "Schwäbische Alb",
    lat: 48.45, lon: 9.35, radiusKm: 50,
    laender: ["Baden-Württemberg"],
    kurz: "Karstlandschaft mit Albtrauf, Höhlen und Burgen",
    text:
      "Die Schwäbische Alb ist eine Karstlandschaft: Wasser versickert im Kalkstein, statt oberirdisch abzufließen. Der Albtrauf, die steil abfallende Nordkante, trägt die bekanntesten Aussichtspunkte und Burgen. Für Wanderungen entlang des Traufs starten viele Touren an Parkplätzen auf der Hochfläche.",
    fernwege: ["Albsteig (HW 1)", "Donauberglandweg", "Löwenpfade"],
  },
  {
    slug: "harz",
    name: "Harz",
    lat: 51.75, lon: 10.6, radiusKm: 35,
    laender: ["Niedersachsen", "Sachsen-Anhalt", "Thüringen"],
    kurz: "Nördlichstes Mittelgebirge, geprägt vom Brocken",
    text:
      "Der Harz ist das nördlichste deutsche Mittelgebirge und ragt unvermittelt aus dem Flachland auf. Der Brocken erreicht 1141 Meter und trägt ein raues, fast subalpines Klima. Große Teile stehen als Nationalpark unter Schutz, weshalb das Wegenetz stark kanalisiert ist und die ausgewiesenen Parkplätze entsprechend wichtig sind.",
    fernwege: ["Harzer-Hexen-Stieg", "Kaiserweg", "Harzer Baudensteig"],
  },
  {
    slug: "eifel",
    name: "Eifel",
    lat: 50.4, lon: 6.6, radiusKm: 45,
    laender: ["Nordrhein-Westfalen", "Rheinland-Pfalz"],
    kurz: "Vulkanische Mittelgebirgslandschaft mit Maaren",
    text:
      "Die Eifel ist vulkanischen Ursprungs — die Maare der Vulkaneifel sind wassergefüllte Explosionstrichter und in Mitteleuropa einzigartig. Im Norden schützt der Nationalpark Eifel ausgedehnte Buchenwälder. Viele Ausgangspunkte liegen an Talsperren und in den engen Bachtälern.",
    fernwege: ["Eifelsteig", "Wildnis-Trail", "Ahrsteig"],
  },
  {
    slug: "sauerland",
    name: "Sauerland",
    lat: 51.2, lon: 8.2, radiusKm: 40,
    laender: ["Nordrhein-Westfalen"],
    kurz: "Waldreiche Höhenzüge mit dichtem Wegenetz",
    text:
      "Das Sauerland ist waldreich und von langen Höhenrücken durchzogen; der Kahle Asten erreicht 841 Meter. Die Region ist eines der am dichtesten mit markierten Wegen erschlossenen Mittelgebirge Deutschlands. Entsprechend viele Wanderparkplätze liegen unmittelbar an Fernwanderwegen.",
    fernwege: ["Rothaarsteig", "Sauerland-Höhenflug", "Medebacher Bergweg"],
  },
  {
    slug: "bayerischer-wald",
    name: "Bayerischer Wald",
    lat: 48.95, lon: 13.3, radiusKm: 45,
    laender: ["Bayern"],
    kurz: "Ältester Nationalpark Deutschlands, ausgedehnte Bergwälder",
    text:
      "Der Bayerische Wald bildet zusammen mit dem böhmischen Šumava das größte zusammenhängende Waldgebiet Mitteleuropas. Der 1970 gegründete Nationalpark war der erste in Deutschland. Der Große Arber erreicht 1456 Meter; die Ausgangspunkte liegen oft an Bergstraßen mit langer Zufahrt.",
    fernwege: ["Goldsteig", "Pandurensteig", "Baierweg"],
  },
  {
    slug: "allgaeu",
    name: "Allgäu",
    lat: 47.65, lon: 10.3, radiusKm: 40,
    laender: ["Bayern", "Baden-Württemberg"],
    kurz: "Voralpenland und Allgäuer Alpen",
    text:
      "Das Allgäu reicht vom hügeligen Voralpenland bis in die Allgäuer Alpen mit Gipfeln über 2600 Metern. Das Nebeneinander von einfachen Talwegen und hochalpinen Touren macht die Region ganzjährig begehbar. An bekannten Ausgangspunkten sind die Parkplätze an Wochenenden früh belegt und häufig gebührenpflichtig.",
    fernwege: ["Heilbronner Weg", "Wandertrilogie Allgäu", "Lechweg"],
  },
  {
    slug: "odenwald",
    name: "Odenwald",
    lat: 49.6, lon: 8.9, radiusKm: 30,
    laender: ["Hessen", "Baden-Württemberg", "Bayern"],
    kurz: "Buntsandstein, Burgen und weiche Höhenzüge",
    text:
      "Der Odenwald ist ein Buntsandsteingebirge mit sanften Kuppen und tief eingeschnittenen Tälern. Der Katzenbuckel ist mit 626 Metern der höchste Punkt. Die Nähe zur Rhein-Neckar-Region macht ihn zum Naherholungsgebiet — an Sonntagen sind die bekannten Parkplätze schnell voll.",
    fernwege: ["Nibelungensteig", "Alemannenweg", "Neckarsteig"],
  },
  {
    slug: "taunus",
    name: "Taunus",
    lat: 50.2, lon: 8.35, radiusKm: 30,
    laender: ["Hessen", "Rheinland-Pfalz"],
    kurz: "Mittelgebirge vor den Toren von Frankfurt",
    text:
      "Der Taunus liegt unmittelbar nordwestlich von Frankfurt und ist entsprechend stark besucht. Der Große Feldberg erreicht 879 Meter. Durch die Region verläuft der Obergermanisch-Raetische Limes, der zum UNESCO-Welterbe zählt und an vielen Stellen erwandert werden kann.",
    fernwege: ["Limeswanderweg", "Rheinsteig", "Taunus-Schinderhannes-Steig"],
  },
  {
    slug: "rhoen",
    name: "Rhön",
    lat: 50.5, lon: 10.0, radiusKm: 30,
    laender: ["Hessen", "Bayern", "Thüringen"],
    kurz: "Das „Land der offenen Fernen“",
    text:
      "Die Rhön trägt den Beinamen „Land der offenen Fernen“ — offene Bergkuppen und weite Sicht statt geschlossener Wälder. Die Wasserkuppe ist mit 950 Metern der höchste Punkt. Die Region ist als UNESCO-Biosphärenreservat ausgewiesen und gilt wegen geringer Lichtverschmutzung als Sternenpark.",
    fernwege: ["Der Hochrhöner", "Ulstertalweg", "Rhön-Rennsteig-Wanderweg"],
  },
  {
    slug: "fraenkische-schweiz",
    name: "Fränkische Schweiz",
    lat: 49.8, lon: 11.25, radiusKm: 25,
    laender: ["Bayern"],
    kurz: "Felsentürme, Höhlen und Burgen auf engem Raum",
    text:
      "Die Fränkische Schweiz ist eine Karstlandschaft mit freistehenden Dolomitfelsen, zahlreichen Höhlen und dicht gestellten Burgen. Auf kleiner Fläche liegen außergewöhnlich viele Aussichtspunkte. Die Talorte sind Ausgangspunkt für kurze, aber steile Runden.",
    fernwege: ["Fränkischer Gebirgsweg", "Frankenweg"],
  },
  {
    slug: "erzgebirge",
    name: "Erzgebirge",
    lat: 50.6, lon: 13.2, radiusKm: 45,
    laender: ["Sachsen"],
    kurz: "Kammlandschaft mit Bergbaugeschichte",
    text:
      "Das Erzgebirge steigt von Norden sanft an und bricht nach Böhmen steil ab. Der Fichtelberg ist mit 1215 Metern der höchste Berg Sachsens. Die Montanregion Erzgebirge zählt zum UNESCO-Welterbe; viele Wege folgen alten Bergbaupfaden.",
    fernwege: ["Kammweg Erzgebirge–Vogtland", "Silberstraße"],
  },
  {
    slug: "saechsische-schweiz",
    name: "Sächsische Schweiz",
    lat: 50.92, lon: 14.15, radiusKm: 20,
    laender: ["Sachsen"],
    kurz: "Elbsandsteingebirge mit Tafelbergen und Schluchten",
    text:
      "Die Sächsische Schweiz ist der deutsche Teil des Elbsandsteingebirges: Tafelberge, Felsnadeln und enge Schluchten auf kleinem Raum. Der Nationalpark schützt große Teile, das Wegegebot ist streng. Die bekannten Ausgangspunkte sind an Wochenenden früh überlastet — hier lohnt die Anreise mit S-Bahn und Fähre besonders.",
    fernwege: ["Malerweg", "Forststeig Elbsandstein"],
  },
  {
    slug: "thueringer-wald",
    name: "Thüringer Wald",
    lat: 50.65, lon: 10.7, radiusKm: 35,
    laender: ["Thüringen"],
    kurz: "Langgestreckter Höhenzug entlang des Rennsteigs",
    text:
      "Der Thüringer Wald zieht sich als schmaler Höhenzug über rund 150 Kilometer. Über seinen Kamm führt der Rennsteig, einer der ältesten und bekanntesten Fernwanderwege Deutschlands. Der Große Beerberg ist mit 983 Metern der höchste Punkt.",
    fernwege: ["Rennsteig", "Gebirgsrundweg Schmiedefeld"],
  },
  {
    slug: "pfaelzerwald",
    name: "Pfälzerwald",
    lat: 49.3, lon: 7.85, radiusKm: 35,
    laender: ["Rheinland-Pfalz"],
    kurz: "Größtes zusammenhängendes Waldgebiet Deutschlands",
    text:
      "Der Pfälzerwald ist das größte zusammenhängende Waldgebiet Deutschlands und bildet mit den französischen Nordvogesen ein grenzüberschreitendes Biosphärenreservat. Buntsandsteinfelsen und Burgruinen prägen das Bild. Die Kalmit erreicht 673 Meter; zahlreiche Waldgaststätten liegen direkt an den Wegen.",
    fernwege: ["Pfälzer Waldpfad", "Pfälzer Weinsteig", "Pfälzer Hüttensteig"],
  },
  {
    slug: "hunsrueck",
    name: "Hunsrück",
    lat: 49.9, lon: 7.2, radiusKm: 35,
    laender: ["Rheinland-Pfalz", "Saarland"],
    kurz: "Ruhige Höhenrücken zwischen Mosel, Saar und Nahe",
    text:
      "Der Hunsrück liegt zwischen Mosel, Saar und Nahe und ist deutlich ruhiger als die benachbarten Regionen. Der Erbeskopf erreicht 816 Meter. Der Nationalpark Hunsrück-Hochwald schützt Buchenwälder und offene Hangmoore, sogenannte Rosselhalden.",
    fernwege: ["Saar-Hunsrück-Steig", "Traumschleifen", "Ausoniusweg"],
  },
  {
    slug: "westerwald",
    name: "Westerwald",
    lat: 50.6, lon: 7.85, radiusKm: 30,
    laender: ["Rheinland-Pfalz", "Hessen", "Nordrhein-Westfalen"],
    kurz: "Basaltkuppen, Seenplatte und stille Wälder",
    text:
      "Der Westerwald ist ein basaltgeprägtes Mittelgebirge nordöstlich von Koblenz. Die Fuchskaute erreicht 657 Meter. Die Westerwälder Seenplatte, eine Kette künstlich angelegter Weiher, bildet einen eigenen Wanderschwerpunkt.",
    fernwege: ["WesterwaldSteig", "Druidensteig", "Klosterweg"],
  },
  {
    slug: "teutoburger-wald",
    name: "Teutoburger Wald",
    lat: 52.0, lon: 8.55, radiusKm: 35,
    laender: ["Nordrhein-Westfalen", "Niedersachsen"],
    kurz: "Schmaler Kamm mit Externsteinen und Hermannsdenkmal",
    text:
      "Der Teutoburger Wald ist ein schmaler, langgezogener Höhenzug mit gut ausgebautem Wegenetz. Die Externsteine und das Hermannsdenkmal zählen zu den bekanntesten Zielen. Weil der Kamm durchgehend begehbar ist, eignet sich die Region gut für Streckenwanderungen mit Rückfahrt per Bahn.",
    fernwege: ["Hermannsweg", "Eggeweg", "Wittekindsweg"],
  },
  {
    slug: "lueneburger-heide",
    name: "Lüneburger Heide",
    lat: 53.15, lon: 10.05, radiusKm: 35,
    laender: ["Niedersachsen"],
    kurz: "Offene Heidelandschaft, flach und weitläufig",
    text:
      "Die Lüneburger Heide ist eine offene, durch jahrhundertelange Beweidung entstandene Kulturlandschaft. Der Wilseder Berg erreicht nur 169 Meter — gewandert wird hier in der Fläche, nicht in der Höhe. Zur Heideblüte im August ist der Andrang am größten; im Naturschutzgebiet gilt weitgehendes Fahrverbot, die Parkplätze liegen daher am Rand.",
    fernwege: ["Heidschnuckenweg", "Freudenthalweg"],
  },
  {
    slug: "spessart",
    name: "Spessart",
    lat: 50.0, lon: 9.4, radiusKm: 30,
    laender: ["Bayern", "Hessen"],
    kurz: "Ausgedehnte Laubwälder zwischen Main und Kinzig",
    text:
      "Der Spessart ist eines der größten zusammenhängenden Laubwaldgebiete Deutschlands, geprägt von alten Eichen- und Buchenbeständen. Der Geiersberg erreicht 586 Meter. Weite Teile sind kaum besiedelt, was lange Etappen ohne Einkehrmöglichkeit bedeutet.",
    fernwege: ["Eselsweg", "Birkenhainer Straße", "Spessartweg"],
  },
  {
    slug: "berchtesgadener-land",
    name: "Berchtesgadener Land",
    lat: 47.63, lon: 12.95, radiusKm: 20,
    laender: ["Bayern"],
    kurz: "Hochalpine Landschaft um Watzmann und Königssee",
    text:
      "Das Berchtesgadener Land ist die einzige deutsche Region mit hochalpinem Nationalpark. Der Watzmann erreicht 2713 Meter, der Königssee liegt eingebettet zwischen steilen Felswänden. Viele Touren beginnen an Talparkplätzen mit erheblichem Höhenunterschied — Zeitbedarf und Ausrüstung sind hier anders zu bemessen als im Mittelgebirge.",
    fernwege: ["SalzAlpenSteig", "Watzmann-Überschreitung"],
  },
  {
    slug: "zugspitzregion",
    name: "Zugspitzregion",
    lat: 47.5, lon: 11.1, radiusKm: 25,
    laender: ["Bayern"],
    kurz: "Rund um den höchsten Berg Deutschlands",
    text:
      "Die Zugspitzregion umfasst das Werdenfelser Land rund um Garmisch-Partenkirchen und Mittenwald. Die Zugspitze ist mit 2962 Metern der höchste Berg Deutschlands. Neben hochalpinen Touren führen leichte Wege durch die Partnach- und die Höllentalklamm.",
    fernwege: ["Via Alpina", "König-Ludwig-Weg", "Maximiliansweg"],
  },
  {
    slug: "chiemgau",
    name: "Chiemgau",
    lat: 47.8, lon: 12.5, radiusKm: 30,
    laender: ["Bayern"],
    kurz: "Voralpen zwischen Chiemsee und Kaisergebirge",
    text:
      "Der Chiemgau verbindet das Seeufer des Chiemsees mit den Chiemgauer Alpen. Kampenwand und Hochfelln sind mit Seilbahnen erschlossen und entsprechend stark besucht. Die Übergänge zwischen flachem Voralpenland und steilem Anstieg liegen oft nur wenige Kilometer auseinander.",
    fernwege: ["SalzAlpenSteig", "Prientalweg"],
  },
  {
    slug: "bergisches-land",
    name: "Bergisches Land",
    lat: 51.05, lon: 7.3, radiusKm: 30,
    laender: ["Nordrhein-Westfalen"],
    kurz: "Talsperren und Höhenrücken östlich von Köln",
    text:
      "Das Bergische Land östlich von Köln und Düsseldorf ist von tief eingeschnittenen Bachtälern und zahlreichen Talsperren geprägt. Trotz der Nähe zum Ballungsraum ist die Region waldreich. Das dichte Netz kurzer Rundwege macht sie zum klassischen Ziel für Halbtagestouren.",
    fernwege: ["Bergischer Weg", "Bergische Panoramasteige", "Neanderlandsteig"],
  },
  {
    slug: "weserbergland",
    name: "Weserbergland",
    lat: 51.9, lon: 9.4, radiusKm: 40,
    laender: ["Niedersachsen", "Nordrhein-Westfalen", "Hessen"],
    kurz: "Bewaldete Höhenzüge beiderseits der Weser",
    text:
      "Das Weserbergland begleitet den Flusslauf der Weser mit bewaldeten Höhenzügen und offenen Talauen. Die Porta Westfalica bildet den markanten Durchbruch nach Norden. Weil die Weser die Region durchschneidet, lassen sich Wanderungen gut mit Fährfahrten verbinden.",
    fernwege: ["Weserbergland-Weg", "Wesergebirgsweg", "Ith-Hils-Weg"],
  },
  {
    slug: "altmuehltal",
    name: "Altmühltal",
    lat: 48.95, lon: 11.3, radiusKm: 35,
    laender: ["Bayern"],
    kurz: "Jurafelsen und Wacholderheiden entlang der Altmühl",
    text:
      "Der Naturpark Altmühltal ist einer der größten Naturparks Deutschlands. Freistehende Jurafelsen, Wacholderheiden und die Fossilienfundstellen bei Solnhofen prägen das Tal. Die Wege verlaufen überwiegend auf den Talhängen mit Blick auf den Fluss.",
    fernwege: ["Altmühltal-Panoramaweg", "Jurasteig"],
  },
  {
    slug: "kellerwald",
    name: "Kellerwald",
    lat: 51.15, lon: 9.05, radiusKm: 25,
    laender: ["Hessen"],
    kurz: "Alte Buchenwälder am Edersee",
    text:
      "Der Nationalpark Kellerwald-Edersee schützt einen der letzten großen Buchenurwaldreste Mitteleuropas; er gehört zum UNESCO-Weltnaturerbe. Der Edersee bildet die nördliche Grenze. Das Gelände ist steiler, als die geringe Höhe vermuten lässt.",
    fernwege: ["Kellerwaldsteig", "Urwaldsteig Edersee"],
  },
  {
    slug: "fichtelgebirge",
    name: "Fichtelgebirge",
    lat: 50.0, lon: 11.85, radiusKm: 25,
    laender: ["Bayern"],
    kurz: "Hufeisenförmiges Granitgebirge in Oberfranken",
    text:
      "Das Fichtelgebirge bildet ein nach Osten offenes Hufeisen aus Granithöhen. Der Schneeberg erreicht 1051 Meter, der Ochsenkopf ist über Seilbahnen erschlossen. Charakteristisch sind die verwitterten Felsburgen aus Granit, sogenannte Wollsackformationen.",
    fernwege: ["Fränkischer Gebirgsweg", "Nordbayerischer Jakobsweg"],
  },
  {
    slug: "mecklenburgische-seenplatte",
    name: "Mecklenburgische Seenplatte",
    lat: 53.45, lon: 12.85, radiusKm: 45,
    laender: ["Mecklenburg-Vorpommern"],
    kurz: "Größtes zusammenhängendes Seengebiet Deutschlands",
    text:
      "Die Mecklenburgische Seenplatte ist das größte zusammenhängende Seengebiet Deutschlands. Der Müritz-Nationalpark schützt Buchenwälder, Moore und Seeufer. Gewandert wird flach und weit; die Ausgangspunkte liegen meist an Seezugängen und Waldrändern.",
    fernwege: ["Müritz-Nationalpark-Weg", "Mecklenburgischer Seen-Radweg"],
  },
];

export const regionBySlug = (slug: string) =>
  WANDERREGIONEN.find((r) => r.slug === slug) ?? null;
