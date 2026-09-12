# Maßnahmenplan wanderparkplatz.info

Stand 12.09.2026. Grundlage: sechs Fachprüfungen, 501 gecrawlte Seiten,
Labormessungen mit Chromium. Reihenfolge nach Wirkung geteilt durch Aufwand.

## Sofort

### 1. OpenStreetMap-Karte erst auf Klick laden
**Betrifft 14.450 Seiten** (Parkplatz, Ziel, Ort).
Das JavaScript der Einbettung ist 1,37 MB unkomprimiert, übertragen werden je
Aufruf rund 360 kB über 8 bis 10 Anfragen. `loading="lazy"` greift nicht, weil
das iframe im sichtbaren Bereich liegt — auf dem Handy sogar weit oben.

Zwei Gründe, das zu ändern, nicht nur einer:
- Die eigene Seite wiegt 14 kB. Die Karte ist das Fünfundzwanzigfache.
- Jeder Aufruf überträgt die IP-Adresse der Besucher an einen Dritten, ohne
  Einwilligung. Bei einer deutschen Seite ist das eine Frage an die
  Datenschutzerklärung, nicht nur an die Ladezeit.

Lösung: Platzhalter mit Umriss und Schaltfläche, das iframe wird erst beim
Klick eingehängt. Löst beides auf einmal.

### 2. Doppelte Titel auf Wegseiten auflösen
16 Gruppen, darunter neunmal derselbe Titel für verschiedene Abschnitte des
Europäischen Fernwanderwegs E1. Ursache ist die Kürzung langer Namen.
Zielseiten haben dafür bereits eine Stufe mit Kreis und Bundesland, Wegseiten
nicht. Dieselbe Staffelung nachziehen, als Unterscheidung bietet sich das
Bundesland oder das Kürzel an.

### 3. Zwei Schema-Eigenschaften richtigstellen
- `maximumAttendeeCapacity` trägt die Stellplatzzahl. Die Eigenschaft meint
  Teilnehmer einer Veranstaltung. Gehört als `additionalProperty`.
- `accessibilityFeature` ist auf `ParkingFacility` nicht definiert, sie gilt
  für `CreativeWork`. Gehört als `amenityFeature`.

## Innerhalb einer Woche

### 4. Übersichtsseiten blättern lassen
`/ziele` liefert 678 kB und enthält 767 von 7.062 Verweisen, `/wanderwege`
464 von 1.634. Der Rest ist intern nicht verlinkt und nur über die Sitemap
auffindbar. Interne Verweise tragen Gewicht weiter, eine Sitemap nicht.

### 5. Listen mit echten Trennzeichen ausgeben
Name, Art und Entfernung stoßen ohne Leerraum aneinander, getrennt nur durch
CSS. Wer die Seite rendert, sieht das richtig. Wer nur die Auszeichnung
entfernt, liest "KönigstuhlGipfel568 m139 m". Betrifft den größten Teil des
Textvolumens auf Detailseiten und damit die Zitierfähigkeit für KI-Systeme.

### 6. noindex-Seiten aus der Sitemap nehmen
`parkplaetze.xml` führt alle 4.321 Adressen, darunter die 223 mit noindex.
Eine Sitemap ist eine Empfehlung zur Aufnahme; eine Seite auf noindex
gleichzeitig zu empfehlen, widerspricht sich.

## Innerhalb eines Monats

### 7. Wegseiten inhaltlich stärken
1.634 Seiten, 94 Prozent unter 500 Wörtern, zugleich die höchste Ähnlichkeit
untereinander (Jaccard 0,317 über Dreiwortfolgen). Größtes Volumen, dünnster
Inhalt.

### 8. CollectionPage auf Kreis-, Bundesland- und Ortsseiten ergänzen
Strukturell dieselben Listenseiten wie Region, Ziel und Weg, die es haben.

### 9. Bundeslandseiten mit wenig Bestand
4 von 14 unter 250 Wörtern, Hamburg 81 Wörter bei einem Parkplatz.

## Laufend

- Ende September Search-Console-Daten auswerten und gegen die notierten
  Ausgangswerte halten.
- Erst danach über Facettenseiten entscheiden.
- Zwei Punkte bleiben beim Betreiber: die vertretungsberechtigten
  Gesellschafter im Impressum und der Wechsel des Datenbankpassworts.
