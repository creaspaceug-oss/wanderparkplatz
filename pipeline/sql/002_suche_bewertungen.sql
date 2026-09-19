-- Suche und Bewertungen.
--
-- Wichtig: Bewertungen sind nutzergeneriert und dürfen einen Datenimport
-- überleben. Deshalb wird parkplatz ab jetzt per Upsert auf (osm_type, osm_id)
-- aktualisiert statt geleert, und verschwundene Objekte werden nur noch
-- inaktiv gesetzt.

ALTER TABLE parkplatz
  ADD COLUMN IF NOT EXISTS aktiv boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS bewertung_anzahl integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bewertung_schnitt numeric(2,1);

CREATE INDEX IF NOT EXISTS parkplatz_aktiv_idx ON parkplatz (aktiv) WHERE aktiv;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ---------------------------------------------------------------- Suche
-- Ein gemeinsamer Index über alle Seitentypen: eine Abfrage bedient die
-- Vorschlagsliste für Parkplätze, Orte, Kreise und Bundesländer.
--
-- Anlegen, nicht neu anlegen. Hier stand ein DROP, und im Ablauf des Imports
-- fiel das nie auf: db:setup läuft unmittelbar vor dem Import, der die
-- Tabelle ohnehin leert und neu füllt. Wer db:setup einzeln aufruft — etwa
-- um eine neue Migration einzuspielen — legte damit die Suche der laufenden
-- Seite still, ohne eine Fehlermeldung zu sehen. Genau das ist passiert.
CREATE TABLE IF NOT EXISTS suchindex (
  id          serial PRIMARY KEY,
  typ         text NOT NULL,          -- parkplatz | ort | kreis | bundesland
  slug        text NOT NULL,
  titel       text NOT NULL,
  untertitel  text,
  gewicht     integer NOT NULL DEFAULT 0,   -- Bestandsgröße, steuert das Ranking
  such_text   text NOT NULL,                -- kleingeschrieben, ohne Umlaute
  UNIQUE (typ, slug)
);
CREATE INDEX IF NOT EXISTS suchindex_trgm_idx ON suchindex USING gin (such_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS suchindex_praefix_idx ON suchindex (such_text text_pattern_ops);

-- ----------------------------------------------------------- Bewertungen
CREATE TABLE IF NOT EXISTS bewertung (
  id            serial PRIMARY KEY,
  parkplatz_id  integer NOT NULL REFERENCES parkplatz(id) ON DELETE CASCADE,
  sterne        smallint NOT NULL CHECK (sterne BETWEEN 1 AND 5),
  text          text CHECK (text IS NULL OR char_length(text) <= 1500),
  autor         text CHECK (autor IS NULL OR char_length(autor) <= 60),
  besucht_am    date,
  status        text NOT NULL DEFAULT 'neu'
                CHECK (status IN ('neu', 'frei', 'abgelehnt')),
  -- Nur gesalzener Hash, keine IP im Klartext (Art. 5 Abs. 1 lit. c DSGVO)
  absender_hash text NOT NULL,
  erstellt      timestamptz NOT NULL DEFAULT now(),
  geprueft      timestamptz
);
CREATE INDEX IF NOT EXISTS bewertung_platz_idx ON bewertung (parkplatz_id, status);
CREATE INDEX IF NOT EXISTS bewertung_neu_idx ON bewertung (erstellt DESC) WHERE status = 'neu';
CREATE INDEX IF NOT EXISTS bewertung_absender_idx ON bewertung (absender_hash, erstellt DESC);

-- Aggregat am Parkplatz mitführen: die Detailseite soll nicht bei jedem
-- Aufruf über alle Bewertungen aggregieren müssen.
CREATE OR REPLACE FUNCTION bewertung_aggregat() RETURNS trigger AS $$
DECLARE
  ziel integer := COALESCE(NEW.parkplatz_id, OLD.parkplatz_id);
BEGIN
  UPDATE parkplatz p
     SET bewertung_anzahl  = agg.n,
         bewertung_schnitt = agg.schnitt
    FROM (
      SELECT count(*)::int AS n,
             round(avg(sterne)::numeric, 1) AS schnitt
        FROM bewertung
       WHERE parkplatz_id = ziel AND status = 'frei'
    ) agg
   WHERE p.id = ziel;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bewertung_aggregat_trg ON bewertung;
CREATE TRIGGER bewertung_aggregat_trg
  AFTER INSERT OR UPDATE OR DELETE ON bewertung
  FOR EACH ROW EXECUTE FUNCTION bewertung_aggregat();
