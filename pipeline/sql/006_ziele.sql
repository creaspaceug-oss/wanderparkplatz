-- Wanderziele: Gipfel, Burgen, Wasserfälle, Höhlen, Aussichtstürme.
--
-- "Parkplatz Feldberg" ist ein eigenes Suchmuster. Das Ziel liegt dabei oft
-- mehrere Kilometer vom Ausgangspunkt entfernt — anders als beim Umfeld,
-- das in Laufweite des Parkplatzes selbst liegt.
CREATE TABLE IF NOT EXISTS ziel (
  id              serial PRIMARY KEY,
  osm_type        text NOT NULL,
  osm_id          bigint NOT NULL,
  slug            text NOT NULL,
  name            text NOT NULL,
  art             text NOT NULL,   -- gipfel | burg | wasserfall | hoehle | turm | aussicht
  hoehe_m         integer,
  lat             double precision NOT NULL,
  lon             double precision NOT NULL,
  bundesland_id   integer REFERENCES bundesland(id),
  parkplatz_count integer NOT NULL DEFAULT 0,
  eigene_seite    boolean NOT NULL DEFAULT false,
  UNIQUE (osm_type, osm_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ziel_slug_idx ON ziel (slug);
CREATE INDEX IF NOT EXISTS ziel_seite_idx ON ziel (eigene_seite) WHERE eigene_seite;
CREATE INDEX IF NOT EXISTS ziel_art_idx ON ziel (art);

CREATE TABLE IF NOT EXISTS parkplatz_ziel (
  parkplatz_id integer NOT NULL REFERENCES parkplatz(id) ON DELETE CASCADE,
  ziel_id      integer NOT NULL REFERENCES ziel(id) ON DELETE CASCADE,
  distanz_m    integer NOT NULL,
  PRIMARY KEY (parkplatz_id, ziel_id)
);
CREATE INDEX IF NOT EXISTS parkplatz_ziel_ziel_idx ON parkplatz_ziel (ziel_id, distanz_m);
