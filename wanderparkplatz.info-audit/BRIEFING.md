# Auftrag: SEO-Audit wanderparkplatz.info

## Werkzeuge — WICHTIG
Das Python-Umfeld der Skills liegt in einem venv, das in dieser Sitzung noch
nicht im PATH steht. Jeder Aufruf braucht davor:

    export PATH="/Users/martin/.claude/skills/seo/.venv/bin:$PATH"
    export DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib

Danach stehen requests, bs4, lxml, playwright (mit Chromium), trafilatura,
matplotlib und weasyprint bereit. Die Skripte liegen unter
`/Users/martin/.claude/skills/seo/scripts/`.
Das systemweite `python3` (Homebrew 3.14) ist defekt — pyexpat lädt nicht.

## Nicht verfügbar
- Google-API-Zugangsdaten (Search Console, PageSpeed, GA4, CrUX) fehlen.
  `google_auth.py --check` schlägt fehl. Keine Felddaten, nur Labormessung.
- DataForSEO, Moz, Ahrefs: keine Zugänge.

## Vorhandene Daten
`/Users/martin/wanderparkplatz/wanderparkplatz.info-audit/crawl.json`
501 gecrawlte Seiten als JSON-Array. Felder je Seite: url, status, ms, bytes,
titel, description, canonical, robots, h1[], h2, woerter, schema[], bilder,
bilderOhneAlt, iframes.

## Die Seite in Kürze
Verzeichnis deutscher Wanderparkplätze, Quelle OpenStreetMap unter ODbL.
Rund 16.400 Adressen in acht nach Typ getrennten Sitemaps: Parkplätze 4.321,
Ziele 7.062, Orte 3.067, Wanderwege 1.634, Kreise 330, Bundesländer 14,
Regionen 29, statische Seiten 6.
Next.js auf Vercel, Postgres bei Neon, serverseitig gerendert mit ISR.
Kanonisch ist `https://www.wanderparkplatz.info`, die Adresse ohne www
leitet mit 308 dorthin.
Hauptkeyword: "wanderparkplatz in meiner nähe".
Die Domain ist seit dem 31.08.2026 im Index, also rund zwei Wochen alt.
Gestern und heute wurden Titel, Inhalte und Layout großflächig geändert.

## Was ich schon weiß — bitte nicht nur wiederholen
- lastmod steht seit heute in allen Sitemaps außer Startseite und Regionen.
- 223 Parkplatzseiten stehen bewusst auf noindex (unter drei Sachangaben).
- Rund 30 Kreisseiten bleiben unter 250 Wörtern, weil dort real nur ein
  Parkplatz existiert.
- robots.txt erlaubt alles außer /api/ und nennt die Sitemap.
- llms.txt existiert.

Interessant ist, was darüber hinausgeht.

## Ergebnisformat
Schreibe deinen Befund nach
`/Users/martin/wanderparkplatz/wanderparkplatz.info-audit/findings/<dimension>.md`
Struktur: Was funktioniert / Befunde mit Schweregrad (Critical, High, Medium,
Low) / je Befund Beleg und konkrete Empfehlung.
Belege mit Zahlen oder Adressen. Keine allgemeinen Ratschläge ohne Messung.
Antworte am Ende mit einer Zusammenfassung in höchstens 15 Zeilen.
