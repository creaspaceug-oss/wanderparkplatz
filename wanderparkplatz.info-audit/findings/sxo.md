# SXO-Befund: Seitentyp und Suchintention für "wanderparkplatz in der nähe"

Zielseite: `https://www.wanderparkplatz.info` (Startseite), abgerufen via
`render_page.py --mode auto` (raw, `is_spa=false`, 512 KB HTML) und
`parse_html.py`. Titel: "Wanderparkplatz in meiner Nähe – Verzeichnis für
Deutschland", H1 identisch, 2.816 Wörter, Schema: `Organization`, `WebSite`,
`FAQPage`.

## Was funktioniert

- Die Startseite hat tatsächlich ein Near-Me-Werkzeug oberhalb des Folds:
  Eingabefeld "Wo suchst du?", Button "Meinen Standort verwenden", Umkreis-
  Filter 10/25/50 km. Das ist strukturell der richtige Baustein für
  Nähe-Anfragen (Taxonomie-Kategorie "Tool/Interactive" hat in der
  Klassifikationsreihenfolge Priorität 1, sobald ein funktionales Werkzeug
  vorhanden ist).
- FAQPage-Schema beantwortet u. a. explizit "Wie finde ich einen
  Wanderparkplatz in meiner Nähe?" — Intention ist redaktionell erkannt.

## Befund 1 — Klicklücke bei Nähe-Anfragen: Kartenblock-Hypothese nicht verifizierbar (Schweregrad: MEDIUM, Erkenntnisgrenze)

Beleg: 287 Impressionen über die vier Nähe-Varianten
("wanderparkplatz in der nähe" 224/0, "waldparkplatz in meiner nähe" 26/0,
"wanderparkplatz in meiner nähe" 19/1, "waldparkplatz in der nähe" 18/0)
gegen 1 Klick = 0,35 % Blend-CTR bei Positionen zwischen 8,37 und 12,94.

Ich konnte die Vermutung "Kartenblock verdrängt das organische Ergebnis"
**nicht belegen**. Das eingesetzte WebSearch-Werkzeug liefert nur eine von
einem Sprachmodell zusammengefasste Trefferliste ohne Positionsnummern,
ohne sichtbaren Local-/Map-Pack, ohne PAA-Box — es rendert die echte
Google-SERP nicht nach. Ein Screenshot der mobilen SERP oder ein
API-Zugriff (Search-Console-Performance mit SERP-Feature-Flag, DataForSEO)
stand laut BRIEFING nicht zur Verfügung. Das ist eine offene Lücke, keine
verworfene Hypothese.

Was die vorhandenen Zahlen allein hergeben: Bei Position 8–13 liegt die
branchenübliche organische CTR ohnehin nur bei grob 0,5–2 %, unabhängig von
Sonderblöcken — allein die Tiefe der Platzierung erklärt einen Großteil der
schwachen CTR. Die gemessenen 0,35 % liegen am unteren Rand dieser Spanne,
aber nicht dramatisch außerhalb. Zusätzlich strukturell plausibel (aber
unbewiesen): "in der Nähe"/"in meiner Nähe" ist ein klassischer Auslöser für
lokale SERP-Elemente (Map Pack, "Orte in der Nähe"), die auf Mobilgeräten
viel Bildschirmfläche vor Position 1 organisch beanspruchen — das würde die
niedrige CTR zusätzlich verschärfen, ist hier aber nicht gemessen, sondern
nur aus allgemeinem Suchverhalten übertragen.

**Empfehlung:** Bevor hier investiert wird, die Lücke schließen — entweder
mit Google Search Console Performance-API inkl. Search-Appearance-Filter,
oder mit einem echten Screenshot/Playwright-Rendering der mobilen Google-
SERP für "wanderparkplatz in der nähe". Erst danach lässt sich sagen, ob
ein Map-Pack ursächlich ist oder ob allein die Position (Platz 8–13) die
Klicklücke erklärt.

## Befund 2 — Startseite kann strukturell nicht an lokalen SERP-Elementen teilnehmen (Schweregrad: HIGH)

Beleg: Das einzige Adress-tragende Schema auf der Startseite ist
`Organization` mit der Geschäftsadresse des Betreibers ("WU Socialmedia
GbR", Bonländer Hauptstraße 34, Aichtal) — nicht mit den 4.543 einzelnen
Parkplatz-Standorten verknüpft. Kein `LocalBusiness`- oder `Place`-Schema,
kein Kartenmodul im Server-HTML (`grep -i leaflet/mapbox/maplibre/iframe`
= 0 Treffer). Für eine bundesweite Verzeichnis-Startseite gibt es keine
einzelne verifizierbare Adresse, an der Google einen Map-Pack-Eintrag
festmachen könnte — die Seite kann dort strukturell nicht mitspielen,
unabhängig vom Content.

**Empfehlung:** Kein Map-Pack-Wettbewerb für die Startseite anstreben.
Stattdessen die 4.321 indexierten `/wanderparkplatz/<slug>`-Seiten (die
echte Koordinaten und Einzelstandorte tragen, siehe crawl.json) als
Zielseiten für ortsbezogene Nähe-Anfragen stärken.

## Befund 3 — Seitentyp-Mismatch: Tool-Ansatz richtig, Umsetzung liefert kein Nähe-Ergebnis (Schweregrad: HIGH, Stichprobe klein)

Beleg: Zwei WebSearch-Stichproben ("wanderparkplatz", "wanderparkplatz in
der nähe") zeigen keine bundesweiten Verzeichnis-Homepages unter den
Treffern, sondern überwiegend zwei Muster: (a) einzelne, konkret benannte
Parkplatz- oder Kommunalseiten mit Adressbezug (melle.info, gaienhofen.de,
willingen.de, naturpark-sauerland-rothaargebirge.de, lennestadt-
kirchhundem.de — Local-Page-Signale laut Taxonomie), und (b) kartenbasierte
Tourenplattformen mit Kartendarstellung (Komoot, AllTrails — Tool-Typ,
aber mit funktionierender Karte).

Die Startseite selbst trifft die Tool-Klassifikation formal (Eingabefeld +
Geolocation-Button + Umkreisfilter), liefert im Server-HTML aber keine
personalisierten Ergebnisse — ohne Standortfreigabe zeigt sie ein
generisches Beispiel (Forbach) plus bundesweite Statistik und FAQ. Für
Google (das keinen Nutzerstandort simulieren kann) und für User ohne
aktivierte Ortung ist die "Nähe"-Zusage im Titel damit uneingelöst: die
Seite bleibt ein nationales Verzeichnis, kein Nähe-Ergebnis. Das deckt sich
mit der SERP-Stichprobe, in der genau die Seiten ranken, die entweder einen
festen Standortbezug (Local Page) oder eine echte Karte (Tool mit Map)
haben — beides fehlt der Startseite in Kombination.

**Wichtige Einschränkung:** Diese Einschätzung stützt sich auf nur zwei
WebSearch-Abfragen ohne vollständige Analyse der Top-10-Positionen, ohne
SERP-Feature-Erkennung (kein Featured Snippet/PAA/Local-Pack sichtbar) und
ohne Geräteunterscheidung. Das ist eine Stichprobe, kein vollständiger
SERP-Consensus nach dem Standard-Playbook (dafür wäre eine tiefere Analyse
von mindestens 10 Ergebnissen je Kernanfrage nötig, die im verbleibenden
Zeitbudget nicht mehr möglich war).

**Empfehlung:** Zwei Stellschrauben statt einer: (1) interne Linkstruktur
und Sitemap-Priorität stärker auf Kreis-/Ort-Seiten mit "Wanderparkplatz in
der Nähe von [Ort]"-Framing lenken — das sind die eigentlich passenden
Local-Pages im Bestand. (2) Der Startseite ein sichtbares Kartenmodul
geben (auch ohne Standortfreigabe, z. B. Kartenausschnitt Deutschland mit
Pins), damit sie wenigstens gegen die Tool-Konkurrenz (Komoot, AllTrails)
in den ersten 10 Sekunden Klarheit liefert.

## Randnotiz zur Geräte-Differenz (mobil 8,54 vs. Desktop 22,77)

Nicht abschließend geklärt — dafür fehlt eine Keyword-mal-Gerät-Kreuz-
tabelle; nur aggregierte Zahlen lagen vor (968 mobile Impressionen bei
8,54, 278 Desktop-Impressionen bei 22,77). Plausible, aber unbewiesene
Erklärung: Der Query-Mix unterscheidet sich vermutlich nach Gerät. Die
Nähe-Varianten (Position 8,37–12,94) sind typisches unterwegs-Suchverhalten
und dürften den Großteil der mobilen Impressionen stellen; das Muster
"wanderparkplatz &lt;Eigenname&gt;" (Position 32, 47 Impressionen über 33
Anfragen) und das bloße "wanderparkplatz" (14,25) wirken eher wie
Desktop-lastige Recherche zu einem bereits bekannten Ziel. Wenn das
zutrifft, ist die 14-Positionen-Lücke größtenteils ein Artefakt des
Anfrage-Mixes, nicht primär ein Rendering- oder Crawling-Unterschied
zwischen den Geräten. Für eine belastbare Aussage fehlt die
Kreuztabelle — das ist ein Fall für `/seo technical` bzw. echten
Search-Console-API-Zugriff, nicht für dieses SXO-Verfahren.

## Limitations

- WebSearch bildet die echte Google-SERP nicht nach (keine Positionen,
  keine Local-Pack-/PAA-/Ads-Sichtbarkeit) — Kernhypothese zu Befund 1
  bleibt unverifiziert.
- Keine Search-Console-API (siehe BRIEFING) — alle Positions-/Impressions-
  /Klickzahlen stammen aus den vom Auftraggeber gelieferten Aggregaten,
  keine eigene Rohdatenabfrage möglich.
- Nur 2 SERP-Stichproben statt der vollen Top-10-Analyse mit
  Seitentyp-Klassifikation für jedes Ergebnis (Zeitbudget-Grenze).
- Keine Geräte-mal-Keyword-Kreuztabelle verfügbar.
- Kein Persona-Scoring-Raster und keine IST/SOLL-Wireframes erstellt
  (nicht angefragt, Zeitbudget).

Cross-Skill-Hinweis: Für belastbare SERP-Feature-Erkennung (Map-Pack, PAA)
eignet sich eher `/seo local` mit echtem GBP-/lokalem Ranking-Werkzeug als
WebSearch.
