# Technical SEO — wanderparkplatz.info

Geprüft: Crawlbarkeit, Indexierbarkeit, Weiterleitungsketten, Canonicals,
Sicherheits-Header, HTTP-Version, Kompression, Caching, URL-Struktur,
Paginierung, hreflang, Rendering ohne JavaScript. Basis: 501-Seiten-Stichprobe
`crawl.json` plus gezielte Live-Abrufe (curl, HTTP/2, `--compressed`) je eines
Vertreters von wanderparkplatz, ziel, wanderweg, ort, kreis, bundesland,
region, Startseite, /suche, /impressum. Sitemap-Gültigkeit und lastmod-Daten
wurden bereits vom Koordinator geprüft und hier nicht wiederholt.

**Nicht geprüft** (explizit ausgenommen, nicht als "in Ordnung" werten):
IndexNow-Einreichung/Key-Datei, Rich-Results-Validierung der Schema.org-Daten,
Feldmessung von LCP/INP/CLS (keine CrUX/PSI-Zugänge), vollständige
/ort/-Stichprobe (siehe Befund unten), mobile mit echtem Touch-Gerät.

## Was funktioniert

- **HTTPS/HSTS**: Alle getesteten Seiten laufen über HTTP/2 mit
  `strict-transport-security: max-age=63072000; includeSubDomains; preload`
  — auf Startseite, robots.txt und Detailseite geprüft.
- **Sicherheits-Header** (bis auf CSP, siehe unten) sind auf allen getesteten
  Seiten identisch gesetzt: `x-content-type-options: nosniff`,
  `x-frame-options: SAMEORIGIN`, `referrer-policy: strict-origin-when-cross-origin`,
  restriktive `permissions-policy`.
- **Kompression**: `content-encoding: gzip` auf allen getesteten HTML-Antworten
  (Start, /suche, /impressum, wanderparkplatz, ziel, wanderweg, ort, kreis,
  bundesland, region).
- **Canonicals**: In der 501-Seiten-Stichprobe 0 fehlende und 0 abweichende
  Canonicals — jede Seite zeigt selbstreferenziell auf sich. Stichprobe mit
  Tracking-Parameter bestätigt das: `/?utm_source=test` liefert
  `<link rel="canonical" href="https://www.wanderparkplatz.info"/>`, also
  sauber auf die Parameter-freie URL normalisiert.
- **Redirects, einfacher Fall**: `http://www.wanderparkplatz.info/` → 308 →
  `https://www.wanderparkplatz.info/` (ein Hop). Trailing Slash auf
  Detailseiten wird korrigiert: `/wanderparkplatz/wanderparkplatz-in-forbach/`
  → 308 → `/wanderparkplatz/wanderparkplatz-in-forbach` (ein Hop).
- **404-Handling**: Unbekannte Pfade liefern echten Status 404
  (`x-matched-path: /404`), kein Soft-404 mit Status 200.
- **hreflang**: Keine hreflang-Alternates im Quelltext — für eine
  einsprachige `de`-Seite korrekt, kein falsches Signal. `<html lang="de">`
  ist konsistent gesetzt (geprüft auf Start- und Suchseite).
- **Rendering ohne JavaScript**: Alle 501 Seiten in `crawl.json` wurden per
  reinem HTTP-Abruf (ohne JS) mit Status 200, H1, Wortzahl und Schema
  erfasst — das bestätigt serverseitiges Rendering in der Breite. Direktprüfung
  von `/suche` per `curl` (kein JS) zeigt echten Text im `<body>`
  (Navigation, Rechtstexte, Datenquellen-Hinweis), keine leere SPA-Hülle;
  Header `x-nextjs-prerender: 1` bestätigt das auf der Startseite zusätzlich.
- **Meta-Robots korrekt gescoped**: In der Stichprobe stehen nur `/suche`,
  `/impressum`, `/datenschutz` auf `noindex, follow` — konsistent mit dem
  Zweck dieser Seiten. Kein `X-Robots-Tag`-Header auf Start-, ort- oder
  wanderweg-Seite gefunden, der ein Meta-Tag widersprüchlich überschreiben
  würde.
- **Strukturierte Daten, Abdeckung**: 498 von 501 Seiten tragen mindestens
  ein Schema; `ParkingFacility` liegt bei exakt 60/60 der wanderparkplatz-Seiten
  in der Stichprobe (1:1), `BreadcrumbList` bei 496/501.

## Befunde

### High

**1. Doppelte `<title>`-Tags durch Kürzung bei Wanderweg-Seiten.**
Beleg: In der 501-Seiten-Stichprobe gibt es 16 Gruppen mit identischem Titel
über mehrere URLs hinweg, alle bei Wanderwegen und alle durch Abschneiden bei
54 Zeichen plus „…" entstanden. Beispiel: der Titel
„Wanderparkplatz European Long distance path E1 - part…" ist identisch für
9 verschiedene URLs, u. a.
`/wanderweg/european-long-distance-path-e1-part-germany-nordrhein-westfalen-north`
und `/wanderweg/european-long-distance-path-e1-part-germany-nordrhein-westfalen-south`
— der unterscheidende Teil (Bundesland/Abschnitt) liegt hinter der
Kürzungsgrenze und verschwindet. Weitere Gruppen: „Wanderparkplatz
Europäischer Fernwanderweg E6…" (7×), „…Hugenotten- und Waldenserpfad,
Etappe…" (6×), „…Fernwanderweg E11…" (4×), „…Internationaler
Bergwanderweg…" (4×). 323 von 501 Stichprobenseiten sind Wanderweg-Seiten,
hochgerechnet auf alle 1.634 Wanderweg-Seiten der Sitemap ist mit einer
dreistelligen Zahl betroffener Duplicate-Titles zu rechnen.
Empfehlung: Titel-Template umbauen, sodass der unterscheidende Teil
(Bundesland/Abschnitt/Nummer) vor der Kürzungsgrenze steht, oder
Kürzungslänge dynamisch am eindeutigen Suffix ausrichten statt an fester
Zeichenzahl.

**2. Hub-Seiten verlinken nur einen Bruchteil ihrer Zielseiten im
rohen HTML — Entdeckung ohne JS/Sitemap eingeschränkt.**
Beleg: `/wanderwege` liefert 522 KB HTML, enthält aber nur 464 eindeutige
`/wanderweg/…`-Links im Quelltext — bei 1.634 Wanderweg-Seiten insgesamt.
`/ziele` liefert 678 KB HTML mit 767 eindeutigen `/ziel/…`-Links bei 7.062
Ziel-Seiten insgesamt. Keine Paginierung (kein `rel="next"/"prev"`, kein
`?page=`-Parameter) ist vorhanden, die zu den restlichen Einträgen führen
würde. Crawler, die kein JavaScript ausführen oder das Nachladen nicht
auslösen, finden den überwiegenden Teil dieser Seiten ausschließlich über die
Sitemap, nicht über interne Links — das schwächt die interne Linkkraft für
den Großteil der Wanderweg- und Ziel-Seiten unabhängig von der
Sitemap-Präsenz.
Empfehlung: Echte serverseitige Paginierung (mit `rel="next"/"prev"` oder
crawlbaren `?page=`-Links) auf `/wanderwege` und `/ziele` einführen, damit
auch ohne JS-Ausführung alle Zielseiten über interne Links erreichbar sind.

### Medium

**3. Zweistufige Redirect-Kette für die HTTP-non-www-Variante.**
Beleg: `http://wanderparkplatz.info/` → 308 → `https://wanderparkplatz.info/`
→ 308 → `https://www.wanderparkplatz.info/`. Zwei Hops statt einem für diesen
Einstiegspunkt (z. B. alte Backlinks, manuell eingetippte Adressen ohne
Schema/www).
Empfehlung: `http://wanderparkplatz.info/` direkt mit einem 308 auf
`https://www.wanderparkplatz.info/` leiten.

**4. Keine Content-Security-Policy.**
Beleg: Auf keiner der geprüften Antworten (Start, robots.txt,
wanderparkplatz-Detail) erscheint ein `content-security-policy`-Header,
obwohl HSTS, `X-Frame-Options` und `X-Content-Type-Options` konsequent gesetzt
sind — die Header-Strategie ist also an dieser Stelle unvollständig.
Empfehlung: CSP ergänzen (mindestens `default-src`/`frame-ancestors`),
konsistent mit den bereits vorhandenen Headern.

**5. Vier Bundesland-Seiten unter 250 Wörtern — zusätzlich zu den bereits
bekannten Kreis-Fällen.**
Beleg: Saarland 215 Wörter (16 Parkplätze), Brandenburg 192 Wörter (12),
Mecklenburg-Vorpommern 153 Wörter (9), Hamburg 81 Wörter (1 Parkplatz) —
4 von 14 Bundesland-Seiten in der Stichprobe. Hamburg mit 81 Wörtern bei
einem einzigen verzeichneten Parkplatz ist die dünnste Aggregatseite der
gesamten Stichprobe unterhalb der Startseite.
Empfehlung: Für Bundesländer mit wenigen Einträgen ergänzenden Kontexttext
vorsehen (Kurzbeschreibung, Verweise auf Nachbarregionen), analog zur bereits
identifizierten Maßnahme für dünne Kreisseiten.

**6. `parkplaetze.xml` enthält auch die 223 bewusst auf `noindex` gesetzten
Parkplatzseiten.**
Beleg: `sitemaps/parkplaetze.xml` hat exakt 4.321 `<loc>`-Einträge — die
Gesamtzahl aller Parkplatzseiten laut Briefing, nicht 4.321 − 223 = 4.098.
Empfehlung: `noindex`-Seiten aus der Sitemap ausschließen, damit kein
widersprüchliches Signal entsteht (Sitemap sagt „indexieren", Meta-Tag sagt
„nicht indexieren").

### Low

**7. Groß-/Kleinschreibung im Slug führt zu 404 statt Redirect.**
Beleg: `/wanderparkplatz/Wanderparkplatz-in-Forbach` (Großschreibung) liefert
Status 404, statt mit 301/308 auf die kanonische Kleinschreibung
`/wanderparkplatz/wanderparkplatz-in-forbach` weiterzuleiten. Kein
Duplicate-Content-Risiko, aber verschenkte Linkkraft bei falsch
großgeschriebenen externen Links.
Empfehlung: Case-insensitive Redirect auf den kanonischen Slug einrichten.

**8. HTML-Antworten cachen mit `max-age=0, must-revalidate`, kein
`stale-while-revalidate`.**
Beleg: Identisch auf allen 9 getesteten Seitentypen:
`cache-control: public, max-age=0, must-revalidate`. Der Edge-Cache von
Vercel liefert zwar `Age`/`ETag`/`x-vercel-cache: HIT`, der Browser muss aber
bei jeder Navigation revalidieren. Eher ein Performance- als ein
Crawling-Thema, potenziell relevant für wiederholte Besuche/INP.
Empfehlung: `stale-while-revalidate` ergänzen, sofern mit dem
ISR-Revalidierungsmodell vereinbar.

**9. `/suche` in einem Einzelabruf mit 9,48 s auffällig langsam
(Cache-MISS).**
Beleg: `curl -w time_total` für `/suche` ergab 9,48 s gegenüber 0,2–4,7 s bei
allen anderen getesteten Seiten; Header bestätigen
`cache-control: private, no-cache, no-store` und `x-vercel-cache: MISS` — die
Seite läuft nie über den Edge-Cache. Einzelmessung, kein Feldwert; als
Hinweis auf mögliches LCP/INP-Risiko bei einer als Haupteinstieg beworbenen
Funktion zu werten, nicht als belastbarer CWV-Befund.
Empfehlung: TTFB von `/suche` unter Last erneut mit Lab- oder Feldwerkzeug
prüfen, sobald Zugänge verfügbar sind (aktuell keine PageSpeed/CrUX-Zugänge).

**10. Datenlücke: `/ort/`-Seiten fehlen vollständig in der 501-Crawl-Stichprobe.**
Beleg: 0 von 501 Stichprobenseiten sind vom Typ `/ort/`, obwohl
`sitemaps/orte.xml` 3.067 URLs enthält — der zweitgrößte Seitentyp der Seite
ist in `crawl.json` nicht vertreten. Stellvertretend direkt geprüft:
`/ort/gruiten` liefert Status 200, `gzip`, HTTP/2, korrekten
Self-Canonical, individuellen Titel „Wanderparkplatz Gruiten (Mettmann):
12 Ausgangspunkte", kein `robots`-Meta — technisch unauffällig, aber eine
Einzelstichprobe ersetzt keine Breitenprüfung.
Empfehlung: `crawl.json`-Erhebung um `/ort/`-Seiten ergänzen, bevor daraus
Aussagen zu Duplicate/Thin Content bei Orten abgeleitet werden.

## Technischer Score

72/100 — solide Basis (Canonicals, Security-Header bis auf CSP, Kompression,
Redirects im Regelfall, echtes SSR ohne JS-Zwang, saubere hreflang-Abstinenz),
gemindert durch die Duplicate-Title-Häufung bei Wanderwegen (High), die
eingeschränkte interne Verlinkung der großen Hub-Seiten ohne Paginierung
(High) und mehrere Medium-Befunde bei Redirect-Hops, CSP und Sitemap/noindex-
Konsistenz.
