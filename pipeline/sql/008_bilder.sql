-- Bilder aus Wikimedia Commons, ausgewählt über die Wikidata-Eigenschaft P18.
--
-- Bewusst nicht über die Geosuche: die liefert, was zufällig in der Nähe
-- verortet ist — bei der Burg Hohenzollern ein Gemälde von Friedrich I., beim
-- Triberger Wasserfall eine Wallfahrtskirche. P18 ist das kuratierte Bild
-- genau dieses Objekts.
--
-- Urheber und Lizenz sind Pflichtangaben: die meisten Dateien stehen unter
-- CC BY oder CC BY-SA und dürfen ohne Namensnennung nicht verwendet werden.
ALTER TABLE ziel ADD COLUMN IF NOT EXISTS wikidata text;
ALTER TABLE ort  ADD COLUMN IF NOT EXISTS wikidata text;

CREATE TABLE IF NOT EXISTS bild (
  wikidata    text PRIMARY KEY,
  datei       text NOT NULL,
  url         text NOT NULL,          -- Vorschaubild, breite Kante 1200 px
  breite      integer NOT NULL,
  hoehe       integer NOT NULL,
  lizenz      text,
  lizenz_url  text,
  urheber     text,
  quelle_url  text NOT NULL,          -- Dateibeschreibungsseite auf Commons
  geholt      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ziel_wikidata_idx ON ziel (wikidata) WHERE wikidata IS NOT NULL;
CREATE INDEX IF NOT EXISTS ort_wikidata_idx  ON ort  (wikidata) WHERE wikidata IS NOT NULL;
