# Strukturierte Daten (Schema.org / JSON-LD)

Geprüft per Live-Fetch (curl, `--mode never`, serverseitig gerendertes HTML —
kein SPA-Hydrationsproblem) auf:
`/` , `/wanderparkplatz/wanderparkplatz-in-forbach`,
`/wanderparkplatz/koenigstuhl`, `/ziel/hohloh`, `/ziel/rehbergturm`,
`/wanderweg/europaeischer-fernwanderweg-e8-bayerischer-wald-verein`,
`/region/schwaebische-alb`, `/bundesland/baden-wuerttemberg`,
`/kreis/reutlingen`, `/ort/forbach-2`, `/ueber-uns`.
Alle Seiten liefern JSON-LD server-seitig im initialen HTML (raw == rendered),
kein Client-Side-Injection-Risiko.

## Was funktioniert

- Durchgehend JSON-LD, `@context: https://schema.org` (https, korrekt),
  keine Microdata/RDFa-Reste.
- BreadcrumbList korrekt aufgebaut: fortlaufende `position`, absolute URLs,
  letztes Element ohne `item` (Google-Konvention für aktuelle Seite
  eingehalten). Auf Parkplatzseiten 5-stufig und vollständig
  (Start → Bundesland → Kreis → Ort → Parkplatz), z. B. Forbach und
  Königstuhl geprüft.
- Organization/WebSite sauber per `@graph` und `@id`-Referenz verknüpft
  (WebSite.publisher → Organization), vermeidet Duplizierung. Keine
  Platzhaltertexte, echte Adresse, echte E-Mail.
- **aggregateRating ist nirgends gesetzt** — bei null echten Bewertungen
  korrekt. Kein erfundenes Rating auf den 60 geprüften ParkingFacility-Typen
  im Sample. Das ist der richtige Zustand, nicht ergänzen, solange es keine
  echten Reviews gibt.
- FAQPage auf der Startseite: kein Google-Rich-Result mehr, aber als
  Auszeichnung für KI-Zitierfähigkeit sinnvoll belassen (Info, siehe unten).

## Befunde

### High

**1. CollectionPage fehlt auf Kreis-, Bundesland- und Ortsseiten, obwohl sie dieselbe Funktion wie Region-/Ziel-/Wegseiten haben**
Beleg: `/region/schwaebische-alb`, `/ziel/hohloh` und
`/wanderweg/europaeischer-fernwanderweg-e8-bayerischer-wald-verein` tragen
`CollectionPage` mit `name`, `url`, `about`. `/bundesland/baden-wuerttemberg`,
`/kreis/reutlingen` und `/ort/forbach-2` liefern dagegen nur `BreadcrumbList`
— kein `CollectionPage`, kein `about`. Alle sechs Seitentypen sind strukturell
identisch: eine Liste von Wanderparkplätzen zu einer geografischen Einheit.
Laut Crawl-Sample betrifft das 14 Bundesland- und 18 Kreis-Seiten (real: 14
und 330 laut Sitemap) plus alle Ortsseiten (in den 501 Sample-Seiten nicht
enthalten, aber am Live-Beispiel Forbach bestätigt).
Empfehlung: gleiches `CollectionPage`-Muster wie bei Region/Ziel/Weg
anwenden — `name`, `url`, `about` (bei Kreis/Bundesland: `about.@type:
AdministrativeArea` mit `name`, ggf. `containsPlace`-Bezug zu den
untergeordneten Kreisen/Orten).

**2. `maximumAttendeeCapacity` für Stellplatzzahl zweckentfremdet**
Beleg: Forbach — `"maximumAttendeeCapacity": 25` für 25 erfasste Stellplätze.
Schema.org definiert die Property als "die Gesamtzahl der Personen, die eine
Veranstaltung oder einen Ort besuchen dürfen" — semantisch für Publikum, nicht
für Fahrzeug-Stellplätze. Technisch gültig (Domain schließt Place ein), aber
inhaltlich falsch: ein Parser/Sprachmodell liest "25 Personen dürfen
teilnehmen", nicht "25 Autos passen hin". Kein Rich-Result betroffen, aber
Risiko für falsche KI-Interpretation der eigenen Daten.
Empfehlung: entfernen und stattdessen `additionalProperty` mit
`PropertyValue` nutzen, z. B.
`{"@type":"PropertyValue","name":"Stellplätze","value":25}`. Das ist die von
schema.org vorgesehene Fluchttür für Werte ohne eigene Property.

**3. `accessibilityFeature` ist auf ParkingFacility kein gültiges Property**
Beleg: Königstuhl — `"accessibilityFeature": "wheelchairAccessibleParking"`
direkt auf dem `ParkingFacility`-Objekt. `accessibilityFeature` ist in
schema.org nur für `CreativeWork` (und darüber `MediaObject`) definiert, nicht
für `Place`/`CivicStructure`. Google prüft ParkingFacility ohnehin nicht für
Rich Results, aber strikte Validatoren (validator.schema.org, Google
Rich-Results-Test im "unbekannte Property"-Modus) melden das als nicht
erkanntes Feld, und Wissensgraph-Parser ignorieren es im Zweifel.
Empfehlung: entfernen oder korrekt über
`amenityFeature: {"@type":"LocationFeatureSpecification","name":"Barrierefreier Stellplatz","value":true}`
abbilden — das ist die schema.org-konforme Struktur für
Ausstattungsmerkmale von Orten. Der Fließtext in `description` transportiert
die Information ohnehin bereits ("Erfasst sind außerdem barrierefreie
Stellplätze").

### Medium

**4. `isAccessibleForFree` direkt auf ParkingFacility ist grenzwertig**
Beleg: Forbach — `"isAccessibleForFree": true` auf dem `ParkingFacility`-
Objekt selbst. Die Property ist laut schema.org für `CreativeWork`, `Event`
und `LocationFeatureSpecification` vorgesehen, nicht direkt für `Place`.
Anders als bei Befund 3 ist der Praxisschaden gering (Google ignoriert
unbekannte Properties stillschweigend, kein Rich Result betroffen), aber es
ist derselbe Muster-Fehler: Properties aus dem CreativeWork/Event-Vokabular
werden unkontrolliert auf Place-Objekte gemappt.
Empfehlung: langfristig durch `amenityFeature`/`LocationFeatureSpecification`
ersetzen (siehe Befund 3), kurzfristig unkritisch.

**5. Kein `SearchAction` im WebSite-Objekt trotz vorhandener Suchseite**
Beleg: `/` liefert `WebSite` mit `name`, `url`, `description`, `publisher`,
aber kein `potentialAction`. `/suche` existiert als Route (im Crawl-Sample
bestätigt). Sitelinks-Searchbox ist einer der wenigen echten Google-Rich-
Result-Effekte für `WebSite` und setzt exakt ein `potentialAction` mit
`SearchAction`/`EntryPoint`-Template voraus.
Empfehlung, falls `/suche?q={query}` (oder ähnliches Query-Pattern)
funktioniert:
```json
"potentialAction": {
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://www.wanderparkplatz.info/suche?q={search_term_string}"
  },
  "query-input": "required name=search_term_string"
}
```

**6. Organization ohne `logo`**
Beleg: `/` — Organization-Objekt enthält `name`, `url`, `email`, `address`,
aber kein `logo`. Google verlangt `logo` (mind. 112×112 px, absolute URL) für
die Verwendung des Markenlogos im Knowledge Panel.
Empfehlung: `logo` mit absoluter Bild-URL ergänzen, sofern ein Logo
existiert. Kein Platzhalter erfinden, wenn keins vorhanden ist.

**7. `description` in CollectionPage uneinheitlich befüllt**
Beleg: `/region/schwaebische-alb` hat eine redaktionelle `description`,
`/ziel/hohloh` und `/wanderweg/...` haben keine. `description` ist bei
CollectionPage kein Pflichtfeld, aber empfohlen und würde die
Snippet-Qualität und KI-Zusammenfassbarkeit auf den 47 Ziel- und 323
Wanderweg-Seiten im Sample vereinheitlichen.
Empfehlung: wo bereits eine Kurzbeschreibung im Fließtext existiert (h1/h2),
diese auch strukturiert im `description`-Feld spiegeln — nicht neu erfinden.

### Low / Info

**8. ParkingFacility und CollectionPage lösen bei Google keine Rich Results aus**
Beide Typen stehen nicht in Googles Liste unterstützter Structured-Data-
Features (kein Sitelinks-Effekt, kein Snippet-Zusatz). Das ist kein Fehler —
die Auszeichnung ist trotzdem sinnvoll für Entitäts-Erkennung durch Google
selbst und für Zitierfähigkeit durch LLMs (GEO). Nur zur Erwartungssteuerung:
von den 60 (perspektivisch 4.321) ParkingFacility- und 399 CollectionPage-
Objekten ist im SERP kein sichtbarer Effekt zu erwarten.

**9. FAQPage ohne SERP-Nutzen, für KI-Sichtbarkeit aber richtig platziert**
Bestätigt die Vorgabe: Google hat FAQ-Rich-Results zum 7. Mai 2026 für alle
Sites zurückgezogen. Die zwei FAQPage-Vorkommen (Startseite) bleiben ohne
SERP-Wirkung, aber sinnvoll für KI-Zitate. Keine Handlung nötig, nicht
entfernen.

**10. Keine ItemList in den Listenseiten**
Beleg: In keinem der geprüften `CollectionPage`-Blöcke (Region, Ziel, Weg)
steckt eine `ItemList`/`mainEntity`-Struktur, die die tatsächlich
gelisteten Parkplätze als Entitäten benennt (z. B. per `itemListElement`
mit `ListItem → ParkingFacility`-Referenzen). Aktuell ist `CollectionPage`
nur ein Etikett ohne Inhaltsangabe. Kein Google-Rich-Result-Trigger, aber
eine `ItemList` würde Suchmaschinen und LLMs explizit sagen, welche
Parkplätze auf der Seite aufgeführt sind, statt es aus dem Fließtext zu
erschließen — nützlich angesichts der GEO-Ausrichtung der Seite.
Empfehlung (optional, kein Pflichtbefund): pro Listenseite `ItemList` mit
`itemListElement` (Name + URL je Parkplatz, keine volle ParkingFacility-
Duplizierung nötig) ergänzen, sofern der Rendering-Aufwand vertretbar ist.

**11. Redundante Breadcrumb-Beschriftung bei gleichnamigem Kreis und Ort**
Beleg: Königstuhl-Breadcrumb zeigt zweimal "Heidelberg" hintereinander
(Position 3: Kreis Heidelberg, Position 4: Ort Heidelberg) mit
unterschiedlichen URLs. Kein Schema-Fehler (unterschiedliche `item`-URLs,
Google akzeptiert das), aber prüfenswert, ob eine Differenzierung wie
"Stadtkreis Heidelberg" vs. "Heidelberg" der Klarheit hilft. Nicht
Schema-relevant, daher nur als Randnotiz.

## Nicht empfohlen (zur Klarstellung, nichts davon ist hier vorhanden)

Keine der deprecaten Typen (HowTo, SpecialAnnouncement, CourseInfo,
EstimatedSalary, LearningVideo) ist im Einsatz. Kein Handlungsbedarf.

## Zusammenfassung der Prioritäten

| Prio | Befund | Seiten betroffen |
|---|---|---|
| High | CollectionPage fehlt auf Kreis/Bundesland/Ort | 14 + 330 + alle Ortsseiten |
| High | `maximumAttendeeCapacity` zweckentfremdet | alle ParkingFacility mit bekannter Stellplatzzahl |
| High | `accessibilityFeature` ungültig auf Place | ParkingFacility mit Barrierefreiheits-Angabe |
| Medium | `isAccessibleForFree` grenzwertig auf Place | alle ParkingFacility mit Gebührenangabe |
| Medium | WebSite ohne SearchAction | Startseite |
| Medium | Organization ohne logo | Startseite |
| Medium | CollectionPage-description uneinheitlich | Ziel-/Wanderweg-Seiten |
| Info | ParkingFacility/CollectionPage ohne SERP-Effekt | alle |
| Info | FAQPage ohne SERP-Effekt, für KI behalten | Startseite |
| Info | Keine ItemList in Listenseiten | Region/Ziel/Weg (später auch Kreis/Bundesland/Ort) |
