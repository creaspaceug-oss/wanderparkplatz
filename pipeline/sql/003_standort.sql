-- Geocoder für die Standortsuche: Ort- oder PLZ-Eingabe → Koordinate.
--
-- Bewusst getrennt vom suchindex: der verweist auf Seiten, dieser hier liefert
-- Koordinaten für die Umkreissuche und enthält auch Orte ohne Parkplatzbestand.
--
-- Anlegen, nicht neu anlegen — siehe die Begründung bei suchindex in 002.
CREATE TABLE IF NOT EXISTS standort (
  id        serial PRIMARY KEY,
  typ       text NOT NULL,              -- ort | plz
  name      text NOT NULL,
  zusatz    text,                       -- "Stadt · Baden-Württemberg" bzw. Ortsname
  lat       double precision NOT NULL,
  lon       double precision NOT NULL,
  einwohner integer,
  gewicht   integer NOT NULL DEFAULT 0,
  such_text text NOT NULL
);
CREATE INDEX IF NOT EXISTS standort_trgm_idx ON standort USING gin (such_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS standort_praefix_idx ON standort (such_text text_pattern_ops);
CREATE INDEX IF NOT EXISTS standort_gewicht_idx ON standort (gewicht DESC);

-- Wanderwege am Parkplatz
ALTER TABLE trail
  ADD COLUMN IF NOT EXISTS markierung text;
