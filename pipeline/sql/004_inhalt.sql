-- Inhaltsumfang einer Detailseite, in konkreten Aussagen.
--
-- daten_score misst nur die OSM-Attribute des Parkplatzes und taugt seit der
-- Anreicherung nicht mehr als Maßstab: eine Seite ohne ein einziges Attribut
-- kann vier Wanderwege und sechs Umfeld-Einträge tragen. Gezählt wird deshalb,
-- wie viele konkrete Angaben die Seite überhaupt machen kann.
ALTER TABLE parkplatz ADD COLUMN IF NOT EXISTS aussagen integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS parkplatz_aussagen_idx ON parkplatz (aussagen);
