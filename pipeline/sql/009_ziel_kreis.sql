-- Kreis des nächstgelegenen Parkplatzes am Ziel.
--
-- Dient allein der Unterscheidbarkeit der Seitentitel: "Steinberg" gibt es
-- 33-mal. Das Bundesland löst 1.875 Dubletten auf 1.107 auf, der Kreis auf
-- 405. Gespeichert statt bei jedem Aufruf nachgeschlagen.
ALTER TABLE ziel ADD COLUMN IF NOT EXISTS kreis_id integer REFERENCES kreis(id);
CREATE INDEX IF NOT EXISTS ziel_kreis_idx ON ziel (kreis_id);
