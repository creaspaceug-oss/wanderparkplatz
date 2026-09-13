# Auftrag: quelloffenes Aufräumprogramm für macOS

Baue ein natives macOS-Programm mit Oberfläche, das findet, was Platz belegt,
und **bewertet**, was davon gefahrlos weg kann. Quelloffen, MIT-Lizenz.

Der Name ist frei wählbar. Oberfläche und alle Meldungen auf Deutsch.

## Warum das Programm gebraucht wird

Der übliche Fall ist ein MacBook Air mit 8 GB fest verlötetem Speicher und
einer zu 96 Prozent vollen SSD. Der Arbeitsspeicher lässt sich nicht
erweitern. Was sich erweitern lässt, ist der freie Platz auf der Platte — und
genau der entscheidet, wie gut macOS auslagern kann. Unterhalb von rund zehn
Prozent frei wird das System spürbar zäh, unabhängig vom Arbeitsspeicher.

Die vorhandenen Programme taugen wenig. Die kommerziellen versprechen
"Speicher freigeben" und tun nichts Messbares. Die kostenlosen zeigen eine
Liste großer Ordner ohne jede Einordnung. Was fehlt, ist die Bewertung: Was
kommt von selbst zurück, was ist unwiederbringlich, und woher weiß man das.

**Der Ton ist Teil der Aufgabe.** Keine Prozentanzeigen, keine Ampelfarben,
keine Sätze wie "Dein Mac ist zu 87 Prozent optimiert". Das Programm soll wie
ein Werkzeug aussehen, nicht wie die Abzockprogramme, mit denen es sonst
verwechselt wird.

## Was es finden muss

Diese Fundklassen stammen aus einer echten Aufräumaktion, die Mengenangaben
sind reale Messwerte. Nutze sie als Prüffälle.

| Fundklasse | Beispiel | Typisch |
|---|---|---|
| Abhängigkeiten ruhender Projekte | `node_modules`, `vendor`, `target`, `.venv` | 12 GB über 28 Projekte |
| Werkzeug-Zwischenspeicher | JetBrains-Indizes, Playwright-Browser, pip, Homebrew | 7 GB |
| Abgebrochene Installationen | `~/Library/Application Support/com.docker.install/in_progress` | 2 GB |
| Verwaiste Werkzeuge | Ordner eines Programms, das seit Monaten nicht lief | 600 MB |
| Mehrfache Kopien | dasselbe Projekt in `Downloads`, als `…-backup` und im Arbeitsordner | 400 MB |
| Vergessene Entwicklungsserver | `next dev`, `serve`, Worker, seit Tagen im Hintergrund | Ports belegt |
| Xcode | abgeleitete Daten, Gerätehilfsdateien, Simulator-Abbilder | oft zweistellig |

Bei den Abhängigkeiten ruhender Projekte ist die entscheidende Frage nicht die
Größe, sondern **wie lange dort nicht mehr gearbeitet wurde**. Nimm dafür das
Datum des letzten Commits, nicht den Zeitstempel der Dateien: Ein
Sicherungslauf oder ein Verschieben setzt Zeitstempel reihenweise neu und
lässt tote Projekte frisch aussehen. Ohne Git nimm die jüngste Änderung an
einer Quelldatei, unter Auslassung von `node_modules`, `.git`, `.next` und
vergleichbaren Bauverzeichnissen.

## Die Bewertung ist der Kern

Jeder Fund bekommt eine von vier Einstufungen. Ohne sie ist das Programm
wertlos, weil es dann nur eine Liste ist.

1. **Regenerierbar** — kommt von selbst oder mit einem Befehl zurück.
   Der Rückholbefehl steht an jedem Fund, etwa `npm install`.
2. **Verwaist** — gehört zu etwas, das nicht mehr existiert oder läuft.
   Vor dem Vorschlag prüfen, ob wirklich nichts mehr darauf zugreift.
3. **Nutzerdaten** — Downloads, Dokumente, Datenbanken mit Verlauf.
   Werden angezeigt, aber **nie vorausgewählt und nie stillschweigend
   gelöscht**.
4. **Unklar** — alles, was sich nicht sicher zuordnen lässt. Anzeigen,
   erklären, nicht vorschlagen.

## Die Oberfläche

Ein Fenster, drei Bereiche. Kein Assistent, keine Schritt-für-Schritt-Führung.

**Links die Fundklassen** als Liste, je mit Größe. Darunter dauerhaft
sichtbar: freier Platz, Gesamtgröße, belegter Anteil, und die Auslagerung mit
ihrer Menge. Letzteres nur als Angabe, nie mit einem Knopf daneben.

**Mitte die Funde** der gewählten Klasse, je Zeile: Name, Pfad, Größe,
Einstufung als Wort statt als Farbe, und die Begründung in einem halben Satz
("seit 5 Monaten kein Commit"). Ein Häkchen je Zeile.

**Rechts die Einzelheiten** zum markierten Fund: was tatsächlich drinliegt,
wann zuletzt darauf zugegriffen wurde, ob ein Prozess darauf läuft, und der
Rückholweg im Klartext.

Regeln für die Bedienung:

- **Vorausgewählt ist nur, was regenerierbar ist.** Verwaistes, Nutzerdaten
  und Unklares beginnen ohne Häkchen. Es gibt keinen Knopf "alles auswählen",
  der über diese Grenze hinweggeht.
- **Zwei Summen, immer getrennt**: "gefahrlos" und "deine Entscheidung".
  Niemals eine einzige große Zahl, die beides vermischt.
- **Vor dem Löschen ein Blatt** mit der vollständigen Liste dessen, was
  verschwindet, der Summe und den Warnungen. Erst dort ist der Löschknopf.
- **Kein Fortschrittsbalken als Show.** Wenn es zwei Sekunden dauert, zeigt es
  nichts an.

Ein zweiter Reiter für **Prozesse**: vergessene Entwicklungsserver mit
Projektpfad, Laufzeit, belegtem Port und Speicher. Beenden einzeln, nie
sammelweise.

## Sicherheitsregeln, nicht verhandelbar

Diese Regeln stehen über jedem Bedienkomfort. Ein Aufräumprogramm, das einmal
etwas Falsches löscht, ist für immer unbrauchbar.

- **Erst hineinsehen, dann vorschlagen.** Kein Vorschlag allein aufgrund eines
  Namensmusters.
- **Nie mit erhöhten Rechten.** Kein Rechte-Dialog, kein Hilfsdienst. Was
  Rechte bräuchte, wird angezeigt und dem Menschen überlassen.
- **Feste Sperrliste**, die keine Regel aushebeln kann: `/System`, `/Library`
  außerhalb des Benutzerordners, `/private`, `~/Library/Keychains`,
  `~/Library/Mobile Documents` (iCloud), `.git`, alles unterhalb von
  Zeitmaschinen-Sicherungen.
- **Zugangsdaten erkennen und warnen.** Liegt im Löschbereich eine `.env`,
  `auth.json`, `credentials`, `*.pem` oder `id_*`, dann im Bestätigungsblatt
  die **Namen** der Einträge zeigen, nie die Werte. Reale Erfahrung: In einem
  Werkzeugordner, der wegsollte, lagen fünfzehn Umgebungsvariablen und ein
  Anbieterprofil. Ohne Vorwarnung wären Schlüssel weg gewesen, die es nirgends
  sonst gab.
- **Laufende Prozesse prüfen**, bevor etwas angefasst wird.
- **Kein Papierkorb bei Platzmangel.** Verschieben gibt keinen Platz frei.
  Entweder richtig löschen oder es lassen — und das in der Oberfläche sagen.
- **Ein Protokoll** jeder Löschung als Textdatei im Benutzerordner: Zeitpunkt,
  Pfad, Größe, Einstufung. Damit hinterher nachvollziehbar ist, was geschah.

## Was es ausdrücklich nicht tun soll

- Keine Arbeitsspeicher-Reinigung. `purge` und Verwandte bringen nichts,
  ausgelagerte Seiten holt macOS absichtlich nicht zurück. Speicherdruck wird
  mit Auslagerungsmenge belegt, nicht mit einem Knopf zum Freiräumen.
- Keine Programme deinstallieren. Das ist ein anderes Werkzeug.
- Kein Hintergrunddienst, kein Anmeldeobjekt, kein Menüleistensymbol, keine
  Benachrichtigungen, keine geplante Ausführung.
- Keine Telemetrie, kein Netzzugriff. Das Programm arbeitet ausschließlich
  lokal und kommt ohne Konto aus.
- Keine Systemwartung, keine Rechte-Reparatur.

## Technische Vorgaben

- **Swift und SwiftUI**, ab macOS 14. Keine fremden Pakete, kein Electron.
  Ergebnis ist eine `.app`, die man in den Programme-Ordner zieht.
- Universalprogramm für Apple Silicon und Intel.
- **Ohne Sandkasten.** Ein Aufräumprogramm im App-Sandkasten kommt an die
  interessanten Orte nicht heran. Damit scheidet der App Store aus, was für
  ein quelloffenes Programm ohnehin der richtige Weg ist.
- Auf `~/Documents`, `~/Downloads` und `~/Desktop` verlangt macOS eine
  Freigabe. Fehlt sie, beim ersten Start verständlich erklären, welche und
  warum, mit einem Knopf, der direkt die zuständige Systemeinstellung öffnet.
  Nicht an einem Fehler scheitern und nicht ungefragt danach fragen.
- Die Größenmessung darf nicht naiv sein: harte Verweise und Klone auf APFS
  nicht doppelt zählen, sonst verspricht das Programm Platz, den es nicht
  gibt. Prüfe die Dateikennung, nicht nur den Pfad.
- Das Suchen läuft nebenläufig und lässt sich abbrechen. Die Oberfläche friert
  nie ein.
- **Ein Kern ohne Oberfläche**, auf den die Oberfläche aufsetzt. Nur so lässt
  sich die Logik prüfen, und später kommt ohne Umbau ein Kommandozeilenzugang
  dazu.
- Tests gegen ein nachgebildetes Heimatverzeichnis, nie gegen das echte.

## Verteilung

Ohne Entwicklerzertifikat lässt sich das Programm zwar bauen, aber nicht ohne
Weiteres öffnen; macOS blockiert es. Drei Wege, alle vertretbar:

1. **Homebrew-Cask** mit Anleitung für den ersten Start. Für ein quelloffenes
   Programm der übliche Weg, kostet nichts.
2. **Entwicklerzertifikat mit Beglaubigung**, rund hundert Euro im Jahr, dafür
   öffnet es sich ohne Umweg.
3. **Selbst bauen** aus dem Quelltext. Sollte in der Anleitung stehen, ist
   aber für die meisten keine Antwort.

Entscheide das nicht selbst, sondern lege die drei Wege mit Aufwand und Folgen
vor.

## Reihenfolge

Liefere in dieser Reihenfolge, jeder Schritt für sich benutzbar:

1. Der Kern ohne Oberfläche: messen und einstufen, keine Löschfunktion.
2. Fenster mit den drei Bereichen, nur anzeigen.
3. Abhängigkeiten ruhender Projekte samt Aktivitätserkennung über Git.
4. Werkzeug-Zwischenspeicher, mit gepflegter Liste statt Rateregel.
5. Löschen, mit Bestätigungsblatt und Protokoll.
6. Reiter für Prozesse.

Xcode, Docker-Abbilder und Simulatoren kommen zuletzt. Dort ist am meisten zu
holen und am meisten kaputtzumachen.

## Was einen guten Abschluss ausmacht

Das Programm ist fertig, wenn jemand dem Bericht glauben kann, ohne selbst
nachzusehen. Jede Zeile belegt, woher die Zahl kommt und was der Rückweg ist.
Lieber drei Fundklassen, die stimmen, als zwanzig, bei denen man sich nicht
sicher ist.
