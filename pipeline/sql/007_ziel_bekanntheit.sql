-- Bekanntheitssignal für Ziele.
--
-- Ein Wikipedia- oder Wikidata-Eintrag ist in OpenStreetMap ein belastbarer
-- Hinweis darauf, dass ein Objekt über seine Umgebung hinaus bekannt ist.
-- 32 % der Ziele tragen ihn — bei Burgen 57 %, bei Aussichtspunkten 2 %.
ALTER TABLE ziel ADD COLUMN IF NOT EXISTS bekannt boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS ziel_bekannt_idx ON ziel (bekannt) WHERE bekannt;
