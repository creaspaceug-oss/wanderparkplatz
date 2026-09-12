# Performance / Core Web Vitals

**Methode:** Labormessung mit Playwright + Chromium (CDP), keine Google-Felddaten
verfügbar (CrUX/PSI-Zugang fehlt laut BRIEFING). Mobil simuliert mit CPU-Drosselung
4× und Netzwerk-Drosselung ~1,6 Mbit/s down / 150 ms RTT (Lighthouse-„Slow 4G“-Profil),
Desktop ungedrosselt. Je Seite/Gerät 3 Messläufe, unten stehen Mediane. TBT ist eine
Labor-Näherung für INP (Summe der Long-Task-Zeit über 50 ms), kein INP-Messwert selbst,
da INP echte Nutzerinteraktion braucht. Diese Zahlen sind **keine Felddaten** und keine
75.-Perzentil-Werte — nur Einzelrender unter Laborbedingungen, mit teils hoher Varianz
durch Netzwerk-Jitter der Messumgebung (bei Wiederholungsmessungen schwankte allein die
TTFB derselben, cache-getroffenen Seite zwischen 0,4 s und 3,6 s; siehe unten).

## Messwerte (Median aus 3 Läufen)

### Mobil (gedrosselt: CPU 4×, ~1,6 Mbit/s, RTT 150 ms)

| Seite | LCP | CLS | TBT (≈INP-Näherung) | TTFB | Gewicht | Requests | LCP-Element |
|---|---|---|---|---|---|---|---|
| Startseite | 1924 ms | 0,000 | 70 ms | 892 ms | 821 KB | 38 | `<p>` Subtext unter H1 |
| /wanderparkplatz/koenigstuhl | 1240 ms | 0,000 | **609 ms** | 486 ms | 852 KB | 43 | `<p>` Adresszeile (Text, nicht Bild) |
| /ziel/rehbergturm | 824 ms | 0,000 | 168 ms | 210 ms | 930 KB | 35 | `<h1>` Titel (Text) |
| /kreis/reutlingen | 904 ms | 0,000 | 30 ms | 306 ms | 352 KB | 39 | `<p>` Einleitungstext (kein Bild/Karte auf Kreisseiten) |
| /ort/gohrisch | 932 ms | 0,000 | 272 ms | 285 ms | 811 KB | 39 | `<h1>` Titel (Text) |

### Desktop (ungedrosselt)

| Seite | LCP | CLS | TBT (≈INP-Näherung) | TTFB | Gewicht | Requests | LCP-Element |
|---|---|---|---|---|---|---|---|
| Startseite | 548 ms | 0,000 | 0 ms | 262 ms | 1234 KB | 61 | `<p>` Subtext unter H1 |
| /wanderparkplatz/koenigstuhl | 792 ms | 0,000 | 51 ms | 530 ms | 850 KB | 55 | `<img>` Commons-Bild (next/image) |
| /ziel/rehbergturm | 516 ms | 0,000 | 55 ms | 292 ms | 898 KB | 44 | `<img>` Commons-Bild (next/image) |
| /kreis/reutlingen | 416 ms | 0,000 | 0 ms | 210 ms | 501 KB | 55 | `<p>` Einleitungstext (kein Bild/Karte) |
| /ort/gohrisch | 884 ms | 0,000 | 61 ms | 285 ms | 768 KB | 42 | `<img>` Commons-Bild (next/image) |

Alle 10 Kombinationen liegen bei den Medianwerten im „Gut“-Bereich für LCP (≤2,5 s) und
CLS (≤0,1). Einzelne Ausreißer-Läufe erreichten LCP-Werte bis 10,1 s (Startseite Desktop)
bzw. 4,7 s (Ziel/Parkplatz), die aber an genauso hohen TTFB-Ausreißern hingen (bis 3,6 s
per Curl auf dieselbe gecachte Seite gemessen) — das ist Netzwerk-Jitter der Messumgebung,
kein reproduzierbarer Effekt von Bild oder Karte. Ohne CrUX-Zugang lässt sich das
75.-Perzentil nicht verifizieren.

## Gezielte Frage: Verschlechtern Commons-Bild oder OSM-Karte LCP/CLS?

**CLS: Nein, in keinem der 30 Messläufe.** Beide neuen Elemente reservieren ihren Platz
korrekt:
- Das `next/image`-Bild sitzt in einem Wrapper mit `style="aspect-ratio:1200 / 675"`
  (Beleg: HTML von `/wanderparkplatz/koenigstuhl`), das Bild selbst hat kein `width`/
  `height`-Attribut, braucht es aber auch nicht — der Wrapper reserviert die Fläche.
- Der OSM-`<iframe>` hat eine feste Klasse `h-[340px] w-full`, ebenfalls layoutstabil.
- CLS blieb bei allen 5 Seiten/2 Geräten/3 Läufen bei 0,000.

**LCP: Auf Desktop wird das Commons-Bild auf 3 von 5 Seitentypen zum LCP-Element**
(Parkplatz-, Ziel-, Ortsseite — dort liegt es im zweispaltigen Layout oberhalb des Falzes).
Es bleibt trotzdem im „Gut“-Bereich (416–884 ms Median), weil next/image das Bild über
die Vercel-Bildpipeline auf ~35–45 KB für die Desktop-Breite (`w=640`) komprimiert.
Auf **Mobil** ist das Bild nie LCP-Element, weil es im gestapelten Layout unterhalb des
ersten Viewports liegt (`top: 732–1793px` je nach Seite) — dort gewinnt immer H1 oder ein
Textabsatz. Die Kreisseiten haben weder Bild noch Karte, dort bleibt Text durchgehend
LCP-Element.

## Befunde

### High: OSM-`<iframe loading="lazy">` lädt trotzdem sofort — auf jeder Parkplatz-, Ziel- und Ortsseite
Beleg: Auf allen 5 gemessenen Seiten mit Karte (Parkplatz-, Ziel-, Ortsseite) lag das
`<iframe>` beim ersten Rendern bereits im oder direkt am Viewport (`top`-Werte zwischen
-119 px und +43 px, je nach Gerät). `loading="lazy"` verzögert nur Ressourcen, die
außerhalb des Viewports liegen — hier greift das nicht. Netzwerkmitschnitt (CDP) zeigt,
dass beim initialen Seitenaufbau ohne Scrollen bereits nachgeladen wird:
`embed.html` (1,2 KB) + `embed-*.css` (9,3 KB) + `embed-*.js` (**302,6 KB**) + 6
Kachel-PNGs von `tile.openstreetmap.org` (zusammen ~129 KB) — macht **~360 KB über 8–10
zusätzliche Requests** zu einer Drittanbieter-Domain, auf jeder betroffenen Seite, unabhängig
vom `lazy`-Attribut. Auf Mobil mit 1,6-Mbit/s-Drosselung konkurriert das direkt mit dem
eigentlichen LCP-Kandidaten um Bandbreite.
Empfehlung: Karte erst per `IntersectionObserver`/Klick-zum-Laden aktivieren (Platzhalter
mit reserviertem `h-[340px]` bleibt bestehen, Karte lädt erst bei echter Sichtbarkeit oder
Nutzerinteraktion), oder auf eine leichtgewichtige statische Kartenvorschau (Bild) mit
Lazy-Load-echtem Iframe erst on-demand umstellen. Das eliminiert ~360 KB / 8–10 Requests
beim Erstaufbau von rund 4.300 Parkplatz-, 7.000 Ziel- und 3.000 Ortsseiten.

### Medium: Parkplatzseiten mobil mit auffällig hoher Haupt-Thread-Last (TBT)
Beleg: `/wanderparkplatz/koenigstuhl` mobil hatte in allen 3 Läufen die mit Abstand
höchste TBT-Näherung aller gemessenen Seiten (609 ms / 978 ms / 320 ms, Median 609 ms,
6–9 Long Tasks), während die bildlose Kreisseite bei 0–31 ms liegt. Zeitliche Korrelation
mit dem gleichzeitigen Laden von next/image (Bildverarbeitung/Decode) und dem 302,6-KB-OSM-
Skript im selben Ladefenster ist plausibel, aber nicht isoliert nachgewiesen (kein Task-
Attribution-Profiling durchgeführt). 609 ms TBT liegt deutlich über dem, was für ein
gutes INP (≤200 ms) realistisch ist, auch wenn TBT kein 1:1-INP-Ersatz ist.
Empfehlung: Chrome-Trace mit Task-Attribution auf `/wanderparkplatz/koenigstuhl` mobil
aufzeichnen, um zu klären, ob das OSM-Skript, die Bild-Dekodierung oder eigener Client-JS
die Long Tasks verursacht; anschließend gezielt aufteilen bzw. das OSM-Skript aus dem
Ladefenster nehmen (siehe High-Befund oben — dürfte einen Großteil der Last mit entfernen).

### Low: Kein `fetchpriority="high"` und kein `<link rel=preload>` für das LCP-Bild auf Desktop
Beleg: Auf Parkplatz-, Ziel- und Ortsseite ist das Commons-`<img>` auf Desktop das
LCP-Element, aber `fetchpriority` ist nicht gesetzt (`null` in allen Messungen) und es
gibt keinen Preload-Hint im `<head>`. Aktuell noch unkritisch, da LCP im Median unter
900 ms bleibt — wird aber relevant, sobald TTFB oder Bildgröße wachsen.
Empfehlung: `priority`/`fetchPriority="high"` auf das Hero-Bild dieser drei Templates
setzen, sobald an next/image gearbeitet wird — geringer Aufwand, kein Risiko.

### Was funktioniert
- CLS ist auf allen gemessenen Seiten/Geräten 0,000 — sowohl das neue Commons-Bild als
  auch die neue OSM-Karte reservieren ihren Platz korrekt (aspect-ratio-Wrapper bzw.
  feste iframe-Höhe). Kein Nachschieben von Inhalten beobachtet.
- LCP liegt im Median auf allen 10 Seite/Gerät-Kombinationen im „Gut“-Bereich (≤2,5 s),
  auf Kreisseiten sogar durchgehend unter 1 s (416–1224 ms), da dort weder Bild noch
  Karte eingebunden sind.
- Bildgröße der Commons-Fotos über next/image ist mit ~35–45 KB pro ausgeliefertem Bild
  angemessen komprimiert (responsive srcset bis `w=3840` vorhanden, aber Browser wählt
  passende Breite).

## Hinweis zur Messumgebung
TTFB derselben, laut Header gecachten Seite (`x-vercel-cache: HIT`) schwankte bei
wiederholten Curl-Abrufen zwischen 0,38 s und 3,6 s — auch auf Seiten ohne Bild/Karte
(Startseite, Kreisseite). Das deutet auf Netzwerk-Jitter der Messumgebung oder Vercel-
Edge-Routing-Varianz hin, nicht auf ein Problem der neuen Elemente. Ohne CrUX-Felddaten
lässt sich das nicht von echter Serverlast unterscheiden — sollte nachgezogen werden,
sobald PageSpeed-/CrUX-Zugang verfügbar ist.
