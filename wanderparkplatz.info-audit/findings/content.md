# Inhaltsqualität — wanderparkplatz.info

Methodik: Stichprobe von je 14–22 Live-Seiten pro Typ (wanderparkplatz, ziel,
wanderweg, kreis, region, bundesland, ort — ort fehlt komplett in crawl.json,
daher zusätzlich per Sitemap gezogen), Text via trafilatura extrahiert.
Ähnlichkeit gemessen als mittlerer Jaccard-Koeffizient über 3-Wort-Folgen
(Shingles), nach Normalisierung (Kleinschreibung, Zahlen → Platzhalter, damit
reine Fakten wie "25 Stellplätze" nicht als Unterschied zählen — gemessen wird
die Formulierung, nicht die Daten). Wortzahlen aus crawl.json (`woerter`) wo
vorhanden, sonst aus eigener Stichprobe. n je Typ: 22 (wanderparkplatz, ziel,
wanderweg, region, ort), 18 (kreis), 14 (bundesland, = Vollerhebung).

## Was funktioniert

- **/ueber-uns, /impressum, /datenschutz tragen die Trust-Säule des E-E-A-T
  spürbar.** Vollständige Anbieterkennzeichnung (WU Socialmedia GbR,
  Bonländer Hauptstraße 34, Aichtal, § 5 DDG), Methodik offengelegt
  (Verknüpfungsradien nach Zieltyp: 5 km Gipfel, 3 km Burg/Wasserfall/Höhle/
  Aussichtsturm, 2,5 km Aussichtspunkt, 1,5 km Einkehr/Toilette/Haltestelle;
  60-m-Dublettenregel; Update-Rhythmus 30/90/180/365 Tage je Objekttyp),
  Lizenzketten benannt (OSM/ODbL, deutschlandGeoJSON, Wikidata-Bilder mit
  Urheber), und die Seite nennt selbst ihre eigene noindex-Schwelle
  öffentlich ("Seiten mit weniger als 3 konkreten Angaben … werden
  Suchmaschinen aber nicht zur Aufnahme angeboten"). Das ist eine seltene,
  glaubwürdige Transparenzleistung für einen Betreiber ohne genannte Autoren.
- **Generierte Fakten sind atomar und zitierfähig**: "25 Stellplätze",
  "kostenfrei", "wassergebundene Decke" stehen als eigenständige, aus dem
  Fließtext herauslösbare Aussagen — gut geeignet für KI-Snippets/AI Overviews.
- **ParkingFacility-Schema auf allen 60 gestichprobten Parkplatzseiten**,
  zusätzlich BreadcrumbList durchgängig; Startseite mit Organization, WebSite,
  FAQPage.
- **Kreisseiten sind der stärkste Typ im Vergleich**: Median 1.018 Wörter
  (n=18, min 664/max 1.361 in der Stichprobe) und die mit Abstand geringste
  Formulierungs-Ähnlichkeit im gesamten Vergleich (Ø Jaccard 0,081 — siehe
  Tabelle unten). Am wenigsten schablonenhaft von allen Typen.

## Befunde

### High — Wanderweg-Seiten: größtes Volumen, dünnster Inhalt, stärkste Schablone
1.634 Wanderweg-Seiten sind nach Parkplatz und Ziel der drittgrößte
Seitentyp. In crawl.json (n=323, der bei weitem größte Sample-Block)
liegt der Median bei 372 Wörtern, **304 von 323 (94 %) unter 500 Wörtern**
— der Location-Page-Richtwert. Die eigene Live-Stichprobe (n=22) bestätigt
das mit Median 263 Wörtern. Gleichzeitig ist Wanderweg mit Ø Jaccard **0,317**
der am stärksten wiederholende Typ im Vergleich (nächsthöchster: Parkplatz
mit 0,222). Konkretes Beispielpaar mit hoher Übereinstimmung:
`/wanderweg/hugenotten-und-waldenserpfad-etappe-hondingen-oefingen` ↔
`/wanderweg/nord-sued-trail-abschnitt-singen-hohentwiel-friedrichshafen`,
Jaccard 0,422 bei normalisierten 3-Wort-Folgen.
→ Empfehlung: Wanderweg-Textbausteine um Segment-spezifische Substanz
erweitern (Höhenprofil, Schwierigkeit, Zwischenziele), nicht nur um mehr
Wörter — sonst wird aus dünn nur länglich-dünn.

### High — /ort/-Seiten fehlen vollständig in der vorhandenen Messbasis und sind dünn
Keine der 3.067 Ort-Seiten (größter Typ nach Parkplatz) taucht in crawl.json
auf (0 Treffer bei 501 Zeilen) — eine blinde Stelle in den bisherigen Daten,
nicht nur ein Stichprobenzufall, da alle anderen Typen inkl. der kleineren
Region/Bundesland vollständig vertreten sind. Eigene Live-Stichprobe (n=22,
per sitemaps/orte.xml gezogen) zeigt Median 273 Wörter (139–426), damit unter
dem Location-Page-Richtwert von 500–600 Wörtern. Ähnlichkeit liegt mit
Ø Jaccard 0,122 im Mittelfeld — nicht auffällig schablonenhaft, aber knapp.
→ Empfehlung: /ort/-Seiten in künftige Crawl-Samples aufnehmen; inhaltlich
prüfen, ob sich (wie bei Kreis) zusätzliche aggregierte Fakten ergänzen
lassen, um über die 500-Wort-Schwelle zu kommen.

### Medium-High — Einzelne Ziel-Seiten fast wortgleich
Ø Jaccard bei Ziel liegt bei 0,215, aber ein Paar sticht deutlich heraus:
`/ziel/marksburg` ↔ `/ziel/philippsburg-hxuds` mit **0,711** — mehr als
dreimal so hoch wie der Kategoriedurchschnitt. Bei POI-armen Zielen
(wenig Umfeld-Daten aus OSM) fällt der generierte Text offenbar auf ein
nahezu identisches Gerüst zurück. Das ist das Muster, das bei
programmatischen Seiten typischerweise Near-Duplicate-Risiko erzeugt, wenn
die zugrunde liegenden Fakten selbst dünn sind.
→ Empfehlung: Stichprobe gezielt auf Ziel-Seiten mit wenigen erfassten
Umfeld-Objekten ausweiten (nicht nur Zufallsstichprobe); für Objekte mit
sehr wenig OSM-Umfeld einen zweiten Textbaustein vorsehen, der nicht bei
Datenarmut ins selbe Gerüst fällt.

### Medium — Bundesland-Seiten uneinheitlich dünn, kein Entity-Schema
14 Bundesland-Seiten (Vollerhebung im crawl.json-Sample): Wortzahl von 81
bis 689, Median 488 — 7 von 14 (50 %) unter 500 Wörtern, und das auf der
obersten Hierarchieebene der Seite. Kreis- und Bundesland-Seiten tragen
zudem nur BreadcrumbList-Schema, kein CollectionPage/Place-Markup wie
Region (CollectionPage, n=29), Ziel (CollectionPage, n=47) oder Wanderweg
(CollectionPage, n=323).
→ Empfehlung: kürzeste Bundesland-Seiten (z. B. die mit 81 Wörtern)
identifizieren und mit denselben Aggregat-Fakten anreichern, die Kreisseiten
bereits nutzen (Commit "Kreisseiten anreichern" laut Log — dasselbe Muster
auf Bundesland übertragen); CollectionPage-Schema für Kreis/Bundesland
ergänzen.

### Medium — Experience-Signal strukturell schwach
/ueber-uns räumt explizit ein: "Niemand fährt die Plätze ab und prüft sie vor
Ort." Ehrlich und vertrauensbildend, bedeutet aber: keine Erstbesuchs-Signale
in den generierten Fakten selbst. Das Bewertungssystem (Sternebewertungen,
moderiert) ist die vorgesehene Experience-Quelle — auf allen in dieser
Stichprobe gesichteten Parkplatzseiten (>20) erschien jedoch nur "Noch keine
Bewertung." Das Element ist angelegt, aber bislang ungenutzt.
→ Kein Sofort-Fix; bei wachsendem Bewertungsbestand beobachten, ob echte
Nutzererfahrung tatsächlich einfließt — davon hängt der Experience-Faktor
strukturell ab.

### Low — Lesbarkeitsformel versagt auf Listen-lastigen Seiten (methodischer Hinweis, kein Content-Fehler)
Flesch-Berechnung (deutsche Formel, satzbasiert) ergibt für Kreis/Region/
Bundesland stark negative, unplausible Werte (Kreis: FRE ≈ −57, mittlere
Satzlänge 76 Wörter), weil trafilatura Listenpunkte (Ortsnamen, Zahlen) ohne
Satzzeichen aneinanderreiht — ein Artefakt der Formel, keine tatsächliche
Schwerverständlichkeit. Für Fließtext-Typen ist die Formel dagegen
aussagekräftig: Parkplatz FRE 38,9, Wanderweg 36,2, Ziel 29,3, Ort 23,8 —
alle im Bereich "schwer" nach deutscher Skala, was für deutsche
Sachtexte mit Komposita üblich ist und nicht gesondert auffällt.
→ Kein Handlungsbedarf; Listen-Layout ist laut Commit-Log bereits bewusst
auf Überfliegbarkeit ausgelegt, das ist für diesen Inhaltstyp die richtige
Form, nicht Fließtext-Lesbarkeit.

## Ähnlichkeit je Seitentyp (Ø Jaccard, 3-Wort-Folgen, normalisiert)

| Typ | n | Ø Jaccard | Median Wörter | unter 500 Wörter |
|---|---|---|---|---|
| Wanderweg | 22 (323 in crawl.json) | 0,317 | 372 (crawl.json) / 263 (live) | 94 % (crawl.json, n=323) |
| Parkplatz | 22 (+21 Vollprobe) | 0,222 / 0,238 | 637 (crawl.json) | 15 % (crawl.json, n=60) |
| Ziel | 22 | 0,215 | 540 (crawl.json) | 36 % (crawl.json, n=47) |
| Ort | 22 | 0,122 | 273 (live, kein crawl.json-Wert) | — (nicht in crawl.json) |
| Bundesland | 14 (Vollerhebung) | 0,101 | 488 | 50 % |
| Region | 22 | 0,106 | 540 | 38 % |
| Kreis | 18 | 0,081 | 1.018 | 0 % |

Einordnung: 0,081–0,12 (Kreis, Region, Bundesland, Ort) bedeutet, dass
verschiedene Seiten desselben Typs überwiegend unterschiedliche Wortfolgen
nutzen — Templating ist vorhanden, aber der Fakteneinschub dominiert das
Ergebnis. 0,22–0,32 (Parkplatz, Ziel, Wanderweg) heißt: im Schnitt teilt
jede vierte bis jede dritte 3-Wort-Folge sich mit einer beliebigen anderen
Seite desselben Typs — deutlich näher an strukturell identischen
Textbausteinen. Einzelne Ausreißer (Ziel-Paar 0,711) zeigen, dass bei
datenarmen Objekten die Ähnlichkeit noch weiter steigt als der Durchschnitt
vermuten lässt.

## E-E-A-T-Bewertung

| Faktor | Gewicht | Score | Begründung |
|---|---|---|---|
| Experience | 20 % | 25/100 | Keine Erstbesuchs-Inhalte, Bewertungssystem vorhanden aber in Stichprobe durchgängig leer; /ueber-uns bestätigt fehlende Vor-Ort-Prüfung explizit |
| Expertise | 25 % | 60/100 | Methodik auf /ueber-uns ist konkret und fachlich (Verknüpfungsradien nach Zieltyp, Dublettenlogik) — Datenprozess-Expertise sichtbar, aber keine personengebundenen Qualifikationen |
| Authoritativeness | 25 % | 20/100 | Domain seit 31.08.2026 indexiert (~2 Wochen), keine externen Zitate/Erwähnungen messbar, keine Autorenprofile |
| Trustworthiness | 30 % | 88/100 | Vollständiges Impressum, detaillierte Datenschutzerklärung ohne Tracking-Kosmetik, offengelegte Limitierungen, öffentlich dokumentierte noindex-Schwelle |
| **Gesamt (gewichtet)** | | **51/100** | |

## AI-Zitierfähigkeit: 60/100
Stärken: atomare Fakten (Gebühr, Stellplatzzahl, Belag) sind einzeln
herauslösbar, ParkingFacility-Schema auf allen Parkplatzseiten,
FAQPage/Organization auf der Startseite. Schwächen: Kreis/Bundesland/Ort
ohne Entity-Schema (nur BreadcrumbList bzw. gar keines bei Ort — nicht
geprüft, da nicht in crawl.json), und die Near-Duplicate-Ausreißer bei
Ziel/Wanderweg schwächen die Eindeutigkeit einzelner Fakten für
KI-Systeme, die auf Seitenebene deduplizieren.

## Inhaltsqualitäts-Score: 55/100
Getragen von einer außergewöhnlich transparenten Trust-Basis (/ueber-uns,
/impressum, /datenschutz) und soliden Kreisseiten, belastet durch
Wanderweg (1.634 Seiten, 94 % unter 500 Wörtern, höchste Schablonenähnlichkeit)
und Ort (3.067 Seiten, median 273 Wörter, komplett ungemessen bisher) — diese
beiden Typen allein umfassen rund 4.700 der ~16.400 Adressen (29 %).
