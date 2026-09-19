-- Wann der Bestand zuletzt mit OpenStreetMap abgeglichen wurde.
--
-- Bis hierher zeigte die Seite dafür max(parkplatz.aktualisiert). Das ist
-- etwas anderes: diese Spalte rückt absichtlich nur vor, wenn sich an einem
-- Platz inhaltlich etwas geändert hat, damit das lastmod in der Sitemap
-- belastbar bleibt. Eine Woche, in der sich in OpenStreetMap nichts tut,
-- ließ die Seite deshalb altern, obwohl der Abgleich pünktlich lief.
--
-- Ein Eintrag je Lauf statt einer Zeile, die überschrieben wird: so lässt
-- sich nachsehen, ob der wöchentliche Lauf wirklich jede Woche kam. Bei 52
-- Zeilen im Jahr braucht das keine Aufräumroutine.
CREATE TABLE IF NOT EXISTS import_lauf (
  id          serial      PRIMARY KEY,
  gelaufen    timestamptz NOT NULL DEFAULT now(),
  parkplaetze integer     NOT NULL,
  -- Abrufstand je Datensatz, übernommen aus data/raw/_status.json.
  --
  -- Der Lauf und der Abruf sind zwei verschiedene Zeitpunkte: Der Import
  -- läuft wöchentlich, fragt Overpass aber nur nach dem, was die Frist
  -- überschritten hat. Ein Lauf kann also vollständig aus dem Kachelspeicher
  -- kommen — dann ist der Lauf von heute und der Bestand drei Wochen alt.
  -- Beides getrennt festzuhalten ist der einzige Weg, auf der Seite keine
  -- Frische zu behaupten, die nicht da ist.
  abrufstand  jsonb
);

-- Der letzte Lauf vor dieser Tabelle, aus dem Protokoll der Aktion
-- übernommen (Lauf 34820244472, beendet am 14.09.2026 um 07:59 UTC).
-- Ohne ihn stünde auf der Seite bis zum nächsten Lauf gar kein Datum.
-- Der Abrufstand fehlt, weil er nur im Kachelspeicher des Läufers lag.
INSERT INTO import_lauf (gelaufen, parkplaetze)
SELECT timestamptz '2026-09-14 07:59:24+00', 4543
 WHERE NOT EXISTS (SELECT 1 FROM import_lauf);
