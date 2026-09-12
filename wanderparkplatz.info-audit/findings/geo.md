# GEO-Befund: wanderparkplatz.info

Geprüft: robots.txt, /llms.txt, RSL, je 3 Parkplatz-/Ziel-/Ortsseiten (Volltext via
render_page.py / trafilatura), Schema-Verteilung aus crawl.json, Footer-Attribution.

## Was funktioniert

- **robots.txt erlaubt alle KI-Crawler pauschal.** `User-Agent: *` / `Allow: /` /
  `Disallow: /api/` — ohne spezifischere Regel für einen einzelnen Bot gilt der
  Wildcard-Block für **alle** genannten Crawler: GPTBot, OAI-SearchBot, ClaudeBot,
  PerplexityBot, Google-Extended, Bingbot, aber auch CCBot und anthropic-ai
  (Training). Es gibt keine Bot-spezifischen Sperren. Sitemap ist verlinkt.
- **/llms.txt existiert, ist sauber strukturiert und für dieses Verzeichnis
  ungewöhnlich gut**: Betreiberangabe, URL-Schema aller sechs Seitentypen,
  ein eigener Abschnitt „Herkunft und Verlässlichkeit" (ODbL, ehrenamtliche
  Erfassung, keine Schätzwerte) und ein expliziter Zitierhinweis mit
  Quellenformat für sowohl die Seite als auch die zugrunde liegende OSM-Lizenz.
  Erreichbar unter `https://www.wanderparkplatz.info/llms.txt`, HTTP 200,
  `content-type: text/plain`, CDN-gecacht (`s-maxage=86400`).
- **ODbL-Attribution ist global im Footer verankert**, nicht nur in llms.txt:
  „Standortdaten aus OpenStreetMap, lizenziert unter ODbL" mit Link auf
  `openstreetmap.org/copyright`, auf jeder geprüften Seite (Beleg:
  `forbach_raw.html`, `<footer>`-Block). Das erfüllt die ODbL-Pflichtattribution
  auf Seitenebene.
- **Server-seitig gerendert, kein SPA-Shell-Problem**: bei allen 9 Stichproben
  `is_spa: False`, `mode_used: raw` — der Rohfetch ohne JavaScript liefert
  bereits den vollständigen Inhalt. Für KI-Crawler, die kein JS ausführen
  (GPTBot, ClaudeBot, PerplexityBot tun das in der Regel nicht), ist der
  Inhalt vollständig erreichbar.
- **Parkplatzseiten tragen `ParkingFacility`-Schema** (60/60 in der Stichprobe
  aus crawl.json), Ziel-/Ort-/Kreis-/Regionsseiten `CollectionPage` (399),
  dazu `BreadcrumbList` auf 496 von 501 Seiten. Das ist ein maschinenlesbares
  Entitätssignal, das eine Seite ohne redaktionelle Autoren realistisch bieten
  kann.
- **Die Einleitungsabsätze sind zitierfähig.** Beispiel (Parkplatzseite
  Forbach, 115 Wörter bis zum ersten Listenblock):

  > „Wanderparkplatz in Forbach befindet sich direkt in Forbach. Er liegt im
  > Landkreis Rastatt in Baden-Württemberg. Der Platz liegt an 20 markierten
  > Wanderwegen. […] Erfasst sind 25 Stellplätze — der Platz ist mittelgroß.
  > Für das Parken wird keine Gebühr erhoben. Als Belag ist wassergebundene
  > Decke erfasst."

  Das beantwortet ohne Kontext die wahrscheinlichste Frage („Wo ist der
  Wanderparkplatz X, was kostet er, wie viele Plätze, welcher Belag?") in
  einem Absatz nahe der empfohlenen 134–167-Wort-Spanne. Gleiches Muster bei
  Naturfreundehaus (Kirkel, ~80 Wörter Lede) und Wanderparkplatz Ilsetal
  (~95 Wörter Lede) sowie bei den geprüften Ziel- und Ortsseiten (Burg
  Pottenstein, Hugenottenturm, Gruiten, Witten — jeweils 3–4 Sätze direkte
  Antwort vor dem ersten Listenblock).

## Befunde

### Critical: Listeninhalte sind für Text-Extraktion verklebt — der Großteil der Seite ist nicht zitierfähig

Beleg (trafilatura-Extraktion, boilerplate-bereinigt, identisch zu dem, was
ein textbasierter KI-Crawler sieht):

- `BurgBurgpanorama Weg örtlicher Weg8,4 km` (Naturfreundehaus)
- `RäubRäuberweg örtlicher Weg3,4 km` (Naturfreundehaus)
- `XRRuhrhöhenweg (Hattingen - Menden) Fernwanderweg…` (Witten)
- `H11Hessenweg 11- Frau Holle-Route Fernwanderweg…` (Hugenottenturm)
- `X7X7 Residenzenweg (Wuppertal) regionaler Weg…` (Berghausen)
- `SDiemeltaler Schmetterlings-Steig süd regionaler Weg…` (Hugenottenturm)
- `Blick auf Holzbrücke385 mAussichtspunkt` / `Eckkopf1,2 kmGipfel533 m`
  (Forbach, Abschnitt „Ziele in Reichweite")
- `Café im Dorf108 m`, `Restaurant Mylos29 m` (Gruiten, Abschnitt
  „In Laufweite")

Icon-Kürzel, Name, Wegtyp, Entfernung und Markierungsfarbe werden als
Text-Nodes ohne Trennzeichen aneinandergehängt. Visuell (CSS-Grid/Flex mit
`gap`) ist das für Menschen lesbar, aber jede Extraktion, die auf Text statt
gerendertem Layout arbeitet — trafilatura hier stellvertretend für das, was
GPTBot/ClaudeBot/PerplexityBot faktisch sehen — bekommt Wortmüll
(„BurgBurgpanorama", „XRRuhrhöhenweg", „Dorf108"). Das betrifft die Blöcke
„Wanderwege ab diesem Parkplatz/Ort/Ziel", „Ziele/Wanderziele in Reichweite"
und „In Laufweite" (Einkehr, Bus/Bahn, Aussichtspunkt, Infotafel) — auf allen
neun Stichprobenseiten, allen drei Seitentypen, durchgängig. Das ist der
größte Teil des Wortvolumens jeder Seite (bei Forbach z. B. 619 von 619
Wörtern extrahiertem Text, davon nur ~115 Wörter saubere Lede-Prosa, der Rest
Listen).

**Empfehlung**: In den Listenkomponenten ein sichtbares Trennzeichen
(Leerzeichen, Mittelpunkt „·" oder Zeilenumbruch als eigenes DOM-Element)
zwischen Name, Wegtyp/Kategorie und Entfernung einfügen, nicht nur über
CSS-`gap` trennen. Aufwand: gering bis mittel — betrifft vermutlich eine
Handvoll gemeinsam genutzter Listen-Komponenten (Parkplatzliste, Wegeliste,
Zielliste, POI-Liste), keine Änderung an den Daten selbst.

### High: Überschriften sind nicht fragebasiert — Struktursignal für AI-Overviews fehlt

Alle geprüften H1/H2 sind deklarativ, nicht als Frage formuliert:
„Wanderparkplatz in Forbach", „Wanderwege ab diesem Parkplatz", „Ziele in
Reichweite", „Wanderparkplätze in Gruiten", „Wanderparkplätze am Burg
Pottenstein". Google AI Overviews und Perplexity bevorzugen nachweislich
Abschnitte, deren Überschrift die Nutzerfrage vorwegnimmt („Wo kann ich bei
Burg Pottenstein parken?", „Was kostet der Wanderparkplatz in Forbach?").
Der Lede-Absatz selbst beantwortet solche Fragen bereits inhaltlich (siehe
oben) — es fehlt nur die passende Überschrift darüber, die das für den
Crawler explizit macht.

**Empfehlung**: Die erste H2 auf Parkplatz-/Ziel-/Ortsseiten in eine
naheliegende Frage umformulieren, ohne den Fließtext selbst zu ändern.
Aufwand: gering (Template-Änderung, keine neuen Daten).

### Medium: Ziel- und Ortsseiten ohne Aktualitätsstempel im Fließtext

Parkplatzseiten enden mit „Angaben aus OpenStreetMap, zuletzt abgeglichen am
30.8.2026." — ein konkretes, zitierbares Freshness-Signal. Die geprüften
Ziel- und Ortsseiten (Burg Pottenstein, Hugenottenturm, Schloss Ilsenburg,
Gruiten, Witten, Berghausen) tragen stattdessen nur den generischen Satz
„…die Angaben stammen aus OpenStreetMap — maßgeblich ist die Beschilderung
vor Ort." ohne Datum. `publication_date` (htmldate) wurde für 6 von 9
Stichprobenseiten gar nicht erkannt (`None`) — nur bei den drei
Parkplatzseiten und zufällig bei einer Ortsseite (die dort erkannten
2009-02-18 bei Witten ist offensichtlich ein Fehlgriff von htmldate auf ein
Datum in verlinktem Fremdinhalt, nicht das tatsächliche Abgleichsdatum).

**Empfehlung**: Den Abgleichsstempel „zuletzt abgeglichen am …" auch auf
Ziel-, Ort-, Kreis- und Regionsseiten ausgeben — die Information (Datum des
OSM-Datenimports) liegt ja bereits vor, da die Parkplatzseiten sie zeigen.

### Low: RSL 1.0 nicht vorhanden

`/rsl.xml` liefert 404, kein `License`-Header, kein `<link rel="license">`
geprüft (nicht verifiziert, nur Stichprobe Startseite). Für eine Seite, die
selbst unter ODbL fremde Daten weiterreicht, ist eine eigene RSL-Lizenzdatei
kein Muss — der Zitierhinweis in llms.txt deckt den Anwendungsfall
„Attribution bei KI-Nutzung" bereits informell ab. Nur als fehlendes
Signal vermerkt, keine dringende Empfehlung.

## Nicht geprüft / ungeprüft

- Kein Soll-Ist-Vergleich mit tatsächlichen Trefferlisten in ChatGPT-Suche,
  Perplexity oder Google AI Overviews — kein DataForSEO-Zugang verfügbar
  (siehe BRIEFING.md).
- Bot-spezifisches Verhalten (Rate-Limits, tatsächliche Crawl-Frequenz von
  GPTBot/ClaudeBot/PerplexityBot) nicht gemessen, nur robots.txt-Erlaubnis
  geprüft.
- Wikipedia-, Reddit-, YouTube- und LinkedIn-Präsenz der Marke nicht
  geprüft — die Domain ist laut Briefing zwei Wochen alt, das ist ohne
  Websuche nicht seriös zu beurteilen und würde vermutlich ohnehin nahe
  null liegen.
- `<link rel="license">` im `<head>` und Verhalten auf Kreis-/Regions-/
  Wanderwegseiten nicht stichprobenartig geprüft, nur Parkplatz-, Ziel- und
  Ortsseiten wie beauftragt.
- Schema-Auszählung stammt aus crawl.json (501 Seiten, nicht die volle
  16.400-Seiten-Site) — als Stichprobe zu werten, nicht als Vollerhebung.

## Einordnung: Datenverzeichnis ohne redaktionelle Autoren

Für Zitierfähigkeit zählt bei einer Seite wie dieser nicht Autorenschaft,
sondern: beantwortet ein Absatz eine konkrete Frage vollständig und
eigenständig, und ist die Quelle der Fakten nachvollziehbar? Beides ist bei
den Lede-Absätzen der Fall (siehe „Was funktioniert"). Ein Autorenprofil
wäre hier unpassend — es gibt keine Verfasser einzelner Fakten, nur einen
Datenimport aus OSM mit Abgleichsdatum. Die ODbL-Attribution im Footer und
in llms.txt ersetzt das Autoritätssignal, das andere Seiten über
Autorenschaft herstellen. Die eigentliche Schwachstelle liegt nicht am
fehlenden Autor, sondern an der Textverklebung in den Listenblöcken
(Critical-Befund oben), die den größten Teil des Seiteninhalts für
Sprachmodell-Extraktion unbrauchbar macht.
