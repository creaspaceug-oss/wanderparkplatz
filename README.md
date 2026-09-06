# Wanderparkplatz-Verzeichnis

Verzeichnis ausgewiesener Wanderparkplätze in Deutschland. Zielkeyword der
Startseite ist **„Wanderparkplatz in meiner Nähe"** — eine Suchanfrage mit
Standortbezug, die eine echte Umkreissuche braucht und nicht durch eine
statische Textseite bedient werden kann.

## Aufbau

```
pipeline/     Datenbeschaffung und -aufbereitung (Node + TypeScript, kein Build-Schritt)
  queries.ts    Overpass-Abfragen, Kachelraster über Deutschland
  src/overpass  HTTP-Client mit Cache, Slot-Wartelogik und Mirror-Fallback
  src/geo       Haversine, Point-in-Polygon, Gitterindex für Nachbarschaftssuchen
  src/normalize OSM-Tags → deutschsprachige Felder + Datenqualitäts-Score
  src/build     Räumliche Zuordnung, Dublettenabbau, Slugs, Aggregation
  src/load      Import nach PostgreSQL
  sql/schema    Tabellen und Indizes
web/          Next.js 16 (App Router, Turbopack, Tailwind 4)
data/         Rohdaten und Zwischenergebnisse (nicht versioniert)
```

## Einrichtung

```bash
npm install
createdb wanderparkplatz
npm run db:setup
```

`web/.env.local` setzt `DATABASE_URL` und `NEXT_PUBLIC_SITE_URL`.

## Daten aktualisieren

```bash
npm run data:fetch    # alle Quellen (Cache: 14 bzw. 30 Tage)
npm run data:build    # Zuordnung, Normalisierung, Dublettenabbau
npm run data:load     # Import nach PostgreSQL
```

Einzelne Schritte: `npm run -w pipeline fetch admin|pois|places|plz|trails`.
Der Wanderweg-Abruf ist mit Abstand der teuerste — er lädt Weggeometrien und
Routenmitgliedschaften und läuft entsprechend lange.
Abgebrochene Läufe lassen sich gefahrlos wiederholen — fertige Kacheln liegen
im Cache und werden übersprungen.

## Bewertungen moderieren

```bash
npm run -w pipeline moderieren                # offene anzeigen
npm run -w pipeline moderieren -- frei 12 13  # freigeben
npm run -w pipeline moderieren -- ablehnen 14
```

Voreinstellung ist Vormoderation (`BEWERTUNG_FREIGABE=vor`). Auf `sofort`
umstellen heißt, dass unmoderierte Texte unmittelbar öffentlich stehen — ohne
Anmeldung ein reales Missbrauchsrisiko. Freigegebene Bewertungen erscheinen mit
der nächsten Revalidierung der Detailseite, also binnen 24 Stunden.

`BEWERTUNG_SALT` muss gesetzt sein, sonst sind Bewertungen deaktiviert: der
Absender wird als gesalzener Hash aus IP und User-Agent gespeichert, und ohne
Salt wäre der Hash einer IP-Adresse rückrechenbar.

## Deployment auf Vercel

Die Anwendung braucht zur Bauzeit **und** zur Laufzeit eine erreichbare
PostgreSQL-Datenbank: die Regions- und Detailseiten werden beim Build
vorgerendert, die Umkreis-, Such- und Bewertungsrouten laufen dynamisch.

**1. Datenbank.** Eine verwaltete PostgreSQL in der EU anlegen (Neon lässt sich
über den Vercel-Marktplatz anbinden und setzt `DATABASE_URL` selbst). Region
Frankfurt wählen — die Datenschutzerklärung nennt Frankfurt als Ort der
serverseitigen Verarbeitung. Danach Schema und Daten einspielen:

```bash
export DATABASE_URL='postgres://…'   # gepoolter Endpunkt
npm run data:load                    # gleicht das Schema ab und spielt Daten ein
```

`data:load` ruft `db:setup` selbst auf, gleicht also vor jedem Import das
Schema ab. Das ist Absicht: Eine Migration, die nur lokal eingespielt wurde,
führt sonst erst beim nächsten Deployment zum Abbruch — mit einer Meldung wie
`column z.kreis_id does not exist`, die auf den Build zeigt statt auf die
vergessene Migration. Beide Schritte sind gefahrlos wiederholbar und lassen
Bewertungen unangetastet.

**2. Vercel-Projekt.** Repository verbinden und in den Projekteinstellungen als
*Root Directory* `web` eintragen — Vercel installiert die npm-Workspaces dann
weiterhin vom Repository-Wurzelverzeichnis aus. Unter *Functions → Region*
Frankfurt (`fra1`) wählen; `web/vercel.json` setzt das ebenfalls, im
Hobby-Tarif zählt aber die Projekteinstellung.

**3. Umgebungsvariablen** für *Production*, *Preview* und *Development* setzen,
Vorlage siehe `.env.example`:

| Variable | Wert |
| --- | --- |
| `DATABASE_URL` | gepoolter Verbindungsstring |
| `NEXT_PUBLIC_SITE_URL` | `https://www.wanderparkplatz.info` (oder weglassen) |
| `BEWERTUNG_SALT` | `openssl rand -hex 32` |
| `BEWERTUNG_FREIGABE` | `vor` |

**4. Domain.** Beide Varianten im Projekt hinterlegen und eine davon per
Weiterleitung auf die andere zeigen lassen — sonst konkurrieren zwei Adressen
um dieselben Inhalte. Welche Variante gewinnt, ist gleichgültig; entscheidend
ist, dass `KANONISCH` in `web/lib/site.ts` beziehungsweise
`NEXT_PUBLIC_SITE_URL` **dieselbe** Variante nennt. Läuft beides auseinander,
zeigen sämtliche Canonicals, alle Sitemap-URLs und die Vorschaubilder auf eine
weiterleitende Adresse. Der Build warnt, wenn er eine Abweichung von der
Produktionsdomain erkennt.

**5. Der Build braucht die Datenbank.** Regions- und Detailseiten werden zur
Bauzeit vorgerendert. Fehlt `DATABASE_URL`, bricht der Build ab — mit einer
Meldung, die genau das sagt. Die Datenbank muss vor dem ersten Deployment
eingerichtet **und** gefüllt sein. Der Build selbst läuft je nach Tarif in einer
US-Region; das betrifft nur den Bauvorgang, nicht die Auslieferung — für die
zählt die unter *Functions → Region* eingestellte Region.

**6. Nach dem ersten Deployment.** Die Domain in der Google Search Console
bestätigen (per DNS-TXT-Eintrag, dann ist kein Code nötig) und
`https://www.wanderparkplatz.info/sitemap.xml` einreichen. In der Search
Console beide Varianten als Property anlegen, damit die Weiterleitung
nachvollziehbar bleibt.

Bei jeder Datenaktualisierung: `npm run data:fetch && npm run data:build`,
danach `npm run data:load` gegen die Produktionsdatenbank. Ein neues Deployment
ist nötig, damit die vorgerenderten Seiten den neuen Stand übernehmen.

## Entwicklung

```bash
npm run dev           # Next.js Dev-Server
npm run -w web build  # Produktionsbuild inkl. Vorrendern
```

## Entwurfsentscheidungen

**Kein PostGIS.** Die Umkreissuche grenzt über eine Bounding Box auf dem
B-Tree-Index `(lat, lon)` vor und rechnet die exakte Haversine-Distanz nur auf
der Restmenge — bei dieser Datenmenge unter 5 ms. Der einzige echte
Geo-Operationsbedarf, die Zuordnung Punkt → Landkreis, passiert offline in der
Pipeline. Dadurch läuft die Anwendung auf jedem gewöhnlichen PostgreSQL.

**Kacheln statt Verwaltungsgebieten in Overpass.** Abfragen mit
`area[...]` plus Namens-Regex laufen in großen Bundesländern auf allen
öffentlichen Mirrors in Gateway-Timeouts. Ein Raster aus 64 Bounding-Box-Kacheln
über Deutschland ist die schnellste Zugriffsart; Objekte jenseits der Grenze
fallen beim Point-in-Polygon-Schritt heraus.

**Datenqualitäts-Score statt „alles indexieren".** Programmatisch erzeugte
Seiten mit drei Datenpunkten sind Thin Content. `daten_score` (0–100) bewertet,
wie gut ein Datensatz belegt ist, steuert die Sortierung in Listen und
priorisiert, welche Seiten vorab gerendert werden. Rund 63 % der Plätze
erreichen ≥ 45 Punkte.

**Ortsseiten nur mit Bestand.** Von rund 13.000 Orten in Deutschland bekommen
nur die eine Seite, denen mindestens ein Parkplatz zugeordnet ist. Sonst
entstünden tausende leere Seiten.

**Beschreibungstexte aus Merkmalen.** `web/lib/beschreibung.ts` setzt aus den
erfassten Attributen Fließtext zusammen. Die Variantenwahl hängt an der OSM-ID,
damit benachbarte Seiten sich sprachlich unterscheiden und nicht als
Textdubletten gelesen werden.

**Zwei getrennte Suchen.** Die *Standortsuche* (Ort oder Postleitzahl →
Koordinate → Umkreis) speist sich aus `standort` und enthält bewusst auch Orte
ohne Parkplatzbestand — wer „Husum" eingibt, soll eine Antwort bekommen. Die
*Seitensuche* im Kopfbereich speist sich aus `suchindex` und führt zu
bestehenden Seiten. Postleitzahlen kommen aus den Grenzrelationen
(`boundary=postal_code`), nicht aus den Ortsknoten: nur ein Viertel davon trägt
überhaupt eine PLZ. Ziffernfolgen laufen über einen Präfixvergleich statt über
Ähnlichkeit — „790" soll 79098 finden, nicht das ähnlich geschriebene 79908.

**Wanderwege ab dem Parkplatz.** Die Zuordnung entsteht lokal: Overpass liefert
die Geometrie der Wege im Umkreis und die Mitgliederlisten der Routen, den
Abstand rechnet der Build-Schritt. Ein `way(r.routen)` würde stattdessen die
Mitglieder aller Routen materialisieren — bei Fernwanderwegen zehntausende
Wege. Gemessen wird Punkt-zu-Strecke, nicht Punkt-zu-Stützpunkt: ein Weg kann
dicht am Parkplatz vorbeiführen, während seine Stützpunkte hundert Meter
entfernt liegen. Aus `osmc:symbol` wird die Markierung in lesbares Deutsch
übersetzt („schwarzes Rechteck mit ‚A2'"), inklusive Adjektivendung nach Genus
des Formworts.

**Suche ohne Suchmaschine.** Ein gemeinsamer `suchindex` über Parkplätze,
Orte, Kreise und Bundesländer bedient die Vorschlagsliste mit einer Abfrage.
Getippt wird selten korrekt: statt `similarity` kommt `word_similarity` zum
Einsatz, das die Eingabe gegen die beste Wortfolge im Text vergleicht statt
gegen den ganzen String — sonst fände „abtskuche" den Eintrag
„Wanderparkplatz Abtsküche, Mettmann, Nordrhein-Westfalen" nie. Die Schwelle
wird pro Verbindung gesetzt, nicht per `ALTER DATABASE`, damit jede
Deployment-Datenbank dasselbe Verhalten zeigt.

**Bewertungen überleben den Datenimport.** Der Import läuft als Upsert auf
`(osm_type, osm_id)`; aus OpenStreetMap verschwundene Plätze werden nur
`aktiv = false` gesetzt statt gelöscht. Ein `TRUNCATE … CASCADE` würde jede
Nutzerbewertung mitreißen.

**Stabile Slugs.** Ein durchgezählter Kollisionssuffix ließe URLs zwischen
Objekten wandern, sobald neue Daten eintreffen. Slugs werden deshalb aus dem
Objekt selbst abgeleitet (Name, Ort, sonst ein Hash der OSM-Identität), und ein
einmal vergebener Slug bleibt beim Import unangetastet.

**Korrekturen an den Verwaltungsdaten.** GADM hängt kreisfreien Städten ein
„Städte" an, führt vier Namen englisch (Cologne, Munich, Nuremberg, Hanover)
und stuft drei Gebiete falsch ein. Region Hannover (73×61 km), Städteregion
Aachen (26×51 km) und Regionalverband Saarbrücken (31×30 km) sind über die
Ausdehnung ihrer Polygone eindeutig keine Städte. Alle drei werden in
`pipeline/src/build.ts` korrigiert.

**Dublettenabbau in zwei Stufen.** Erst über die OSM-ID, dann über
Namensgleichheit innerhalb von 60 Metern — derselbe Platz ist häufig einmal als
Punkt und einmal als Fläche erfasst.

## Datenquellen und Lizenz

- Standorte und Merkmale: OpenStreetMap, ODbL. Die Namensnennung steht im
  Footer und muss dort bleiben.
- Verwaltungsgrenzen: [deutschlandGeoJSON](https://github.com/isellsoap/deutschlandGeoJSON).

## Offen

- Impressum und Datenschutzerklärung sind Platzhalter und vor dem Livegang
  auszufüllen bzw. juristisch zu prüfen. Die Datenschutzerklärung muss die
  Verarbeitung bei Bewertungen abdecken.
- Für Bewertungen fehlt eine Meldefunktion für rechtswidrige Inhalte.
- Umfeld-POIs (`parkplatz_nearby`) sind im Schema angelegt, aber noch nicht
  befüllt — gedacht für Einkehr, ÖPNV-Haltestelle und Aussichtspunkte.
- Es gibt keine eigenen Wanderweg-Seiten; die Wege stehen nur auf den
  Parkplatzseiten.
- Keine Kartenansicht.
