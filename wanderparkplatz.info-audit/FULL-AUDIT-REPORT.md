# SEO-Audit wanderparkplatz.info

Stand 12.09.2026 · Gesundheitswert **69 von 100**

Grundlage: 501 gecrawlte Seiten, sechs Fachprüfungen gegen die Live-Seite,
Labormessungen mit Chromium. Die Einzelbefunde stehen unter `findings/`.

## Einordnung

Die Domain ist seit dem 31.08.2026 im Index, also zwölf Tage alt. Ein Wert um
69 ist für ein Verzeichnis dieses Alters unauffällig. Das Fundament stimmt:
Auszeichnung, Canonicals, Rendering ohne JavaScript, Sicherheits-Header und
Bilder sind in Ordnung. Die Punkte, die fehlen, verteilen sich auf wenige,
klar benennbare Stellen, und fast alle sind an einem Tag zu beheben.

| Bereich | Wert | Gewicht |
|---|---|---|
| Inhaltsqualität | 55 | 23 % |
| Technik | 72 | 22 % |
| On-Page | 78 | 20 % |
| Strukturierte Daten | 65 | 10 % |
| Ladeleistung | 75 | 10 % |
| KI-Suche | 62 | 10 % |
| Bilder | 90 | 5 % |

## Was trägt

- Canonicals auf 501 Seiten ohne einen einzigen Fehler, kein fehlender Titel,
  keine fehlende Beschreibung, genau eine H1 je Seite.
- 294 Bilder, kein einziges ohne Alternativtext.
- LCP und CLS in allen zehn Messungen im grünen Bereich, CLS durchgehend 0,000.
- `aggregateRating` ist richtigerweise nirgends gesetzt, weil es noch keine
  Bewertungen gibt. Erfundene Aggregate sind ein häufiger und teurer Fehler.
- Über uns, Impressum und Datenschutz legen Methode, Lizenzen und sogar die
  eigene Schwelle für noindex offen.
- robots.txt sperrt keinen KI-Crawler aus, llms.txt nennt Herkunft und
  Zitierweise.

## Die fünf wichtigsten Befunde

### 1. Das Kartenfenster lädt sofort, nicht verzögert
Betrifft 14.450 Seiten. Das JavaScript der OpenStreetMap-Einbettung ist
1,37 MB unkomprimiert, übertragen werden je Aufruf rund 360 kB über 8 bis 10
Anfragen. `loading="lazy"` wirkt nicht, weil das iframe im sichtbaren Bereich
liegt. Die eigene Seite wiegt 14 kB.

Zweiter, schwererer Punkt: Jeder Aufruf überträgt die IP-Adresse der Besucher
an einen Dritten, bevor irgendjemand eine Karte angefordert hat. Bei einer
deutschen Seite ist das eine Frage an die Datenschutzerklärung. Ein
Platzhalter, der die Karte erst auf Klick einhängt, löst beides zugleich.

### 2. 54 Seiten teilen sich 16 Titel
Fast ausschließlich Wegseiten. Neunmal steht derselbe Titel über
verschiedenen Abschnitten des Europäischen Fernwanderwegs E1. Ursache ist die
Kürzung langer Namen. Zielseiten haben dafür eine Unterscheidungsstufe mit
Kreis und Bundesland, Wegseiten nicht.

### 3. Die Übersichtsseiten verlinken nur einen Bruchteil
`/ziele` liefert 678 kB und enthält 767 von 7.062 Verweisen, `/wanderwege`
464 von 1.634. Die übrigen Detailseiten sind intern nicht verlinkt und nur
über die Sitemap auffindbar. Interne Verweise tragen Gewicht weiter, eine
Sitemap tut das nicht.

### 4. Zwei Schema-Eigenschaften stehen für den falschen Zweck
`maximumAttendeeCapacity` trägt die Stellplatzzahl, gemeint sind damit aber
Teilnehmer einer Veranstaltung. `accessibilityFeature` ist auf
`ParkingFacility` gar nicht definiert, die Eigenschaft gilt für
`CreativeWork`.

### 5. Listen verkleben bei einfacher Textextraktion
Name, Art und Entfernung stoßen ohne Leerraum aneinander und werden nur durch
CSS getrennt. Wer die Seite rendert, sieht es richtig. Wer nur die
Auszeichnung entfernt, liest `KönigstuhlGipfel568 m139 m`. Das betrifft den
größten Teil des Textvolumens auf Detailseiten und damit die Zitierfähigkeit
für KI-Systeme, die ohne Rendering arbeiten.

## Inhaltliche Lage

Die Ähnlichkeit der erzeugten Texte wurde gemessen, nicht geschätzt, als
Anteil gemeinsamer Dreiwortfolgen zwischen Seiten desselben Typs:

| Seitentyp | Ähnlichkeit | Bewertung |
|---|---|---|
| Kreis | 0,081 | eigenständig |
| Bundesland | 0,101 | eigenständig |
| Region | 0,106 | eigenständig |
| Ort | 0,122 | unauffällig |
| Ziel | 0,215 | erhöht |
| Parkplatz | 0,222 bis 0,238 | erhöht |
| Wanderweg | 0,317 | schablonenhaft |

Wegseiten sind damit an drei Stellen zugleich auffällig: größtes Volumen,
dünnster Inhalt, höchste Ähnlichkeit. Sie sind der lohnendste Hebel.

## Grenzen dieses Audits

- **Keine Google-Zugangsdaten.** Search Console, CrUX, PageSpeed und
  Analytics standen nicht zur Verfügung. Die Ladeleistung ist im Labor
  gemessen, nicht an echten Nutzern.
- **Keine Backlink- und Positionsdaten.** Kein DataForSEO, Moz oder Ahrefs.
- **Der Crawl war breitensuchend** und hatte seine 500 Seiten aufgebraucht,
  bevor er Ortsseiten erreichte. Nachgeprüft: Ortsseiten sind gut verlinkt,
  allein eine Kreisseite führt 57 Verweise. Das war ein Artefakt des
  Crawlers, kein Befund.
- **Der Kartenblock als Ursache der niedrigen Klickrate ließ sich nicht
  belegen.** Suchergebnisseiten sind maschinell nicht zuverlässig auszulesen.
  Ich hatte das zuvor als Tatsache dargestellt; das war zu weit gegriffen.
  Was die Zahlen allein hergeben: Auf Position 8 bis 13 liegt die übliche
  Klickrate ohnehin bei 0,5 bis 2 Prozent, das erklärt einen Großteil der
  Schwäche ohne jeden Sonderblock.
