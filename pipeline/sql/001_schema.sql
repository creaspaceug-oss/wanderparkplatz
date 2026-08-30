-- Grundschema. Ohne PostGIS: die Umkreissuche grenzt über eine Bounding Box
-- auf dem B-Tree-Index (lat, lon) vor und rechnet die exakte Haversine-Distanz
-- nur auf der Restmenge.
--
-- Gefahrlos wiederholbar — bewusst ohne DROP: an parkplatz.id hängen
-- Nutzerbewertungen, die ein erneuter Aufruf sonst mitreißen würde.

CREATE TABLE IF NOT EXISTS bundesland (
  id          serial PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  iso         text NOT NULL UNIQUE,       -- DE-BW
  lat         double precision NOT NULL,  -- Schwerpunkt der Parkplätze
  lon         double precision NOT NULL,
  poi_count   integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kreis (
  id             serial PRIMARY KEY,
  slug           text NOT NULL UNIQUE,
  name           text NOT NULL,
  typ            text,                    -- Landkreis / Kreisfreie Stadt
  bundesland_id  integer NOT NULL REFERENCES bundesland(id),
  lat            double precision NOT NULL,
  lon            double precision NOT NULL,
  poi_count      integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS kreis_bundesland_idx ON kreis (bundesland_id);

CREATE TABLE IF NOT EXISTS ort (
  id             serial PRIMARY KEY,
  slug           text NOT NULL UNIQUE,
  name           text NOT NULL,
  typ            text,                    -- city / town / village
  einwohner      integer,
  kreis_id       integer REFERENCES kreis(id),
  bundesland_id  integer REFERENCES bundesland(id),
  lat            double precision NOT NULL,
  lon            double precision NOT NULL,
  poi_count      integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ort_kreis_idx ON ort (kreis_id);
CREATE INDEX IF NOT EXISTS ort_bundesland_idx ON ort (bundesland_id);

CREATE TABLE IF NOT EXISTS parkplatz (
  id             serial PRIMARY KEY,
  osm_type       text NOT NULL,
  osm_id         bigint NOT NULL,
  slug           text NOT NULL UNIQUE,
  name           text NOT NULL,
  lat            double precision NOT NULL,
  lon            double precision NOT NULL,

  bundesland_id  integer REFERENCES bundesland(id),
  kreis_id       integer REFERENCES kreis(id),
  ort_id         integer REFERENCES ort(id),
  ort_km         double precision,        -- Luftlinie zum nächsten Ort
  ort_richtung   text,                    -- "nordwestlich"

  -- aus OSM-Tags normalisiert
  stellplaetze    integer,
  gebuehr         boolean,                -- true = kostenpflichtig
  gebuehr_info    text,
  oberflaeche     text,
  zugang          text,
  oeffnungszeiten text,
  beleuchtet      boolean,
  barrierefrei    boolean,
  max_hoehe_m     numeric(4,2),
  wohnmobil       boolean,
  wc              boolean,
  betreiber       text,
  hoehe_m         integer,

  tier           smallint NOT NULL DEFAULT 1,  -- 1 = ausgewiesener Wanderparkplatz
  daten_score    smallint NOT NULL DEFAULT 0,  -- 0–100: Belegtheit des Datensatzes
  tags           jsonb NOT NULL DEFAULT '{}',
  aktualisiert   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (osm_type, osm_id)
);
-- Bbox-Vorfilter der Umkreissuche
CREATE INDEX IF NOT EXISTS parkplatz_lat_lon_idx    ON parkplatz (lat, lon);
CREATE INDEX IF NOT EXISTS parkplatz_bundesland_idx ON parkplatz (bundesland_id);
CREATE INDEX IF NOT EXISTS parkplatz_kreis_idx      ON parkplatz (kreis_id);
CREATE INDEX IF NOT EXISTS parkplatz_ort_idx        ON parkplatz (ort_id);
CREATE INDEX IF NOT EXISTS parkplatz_score_idx      ON parkplatz (daten_score DESC);

CREATE TABLE IF NOT EXISTS trail (
  id        serial PRIMARY KEY,
  osm_id    bigint NOT NULL UNIQUE,
  name      text NOT NULL,
  slug      text,
  netz      text,       -- lwn / rwn / nwn / iwn
  ref       text,
  laenge_km numeric(7,2)
);

CREATE TABLE IF NOT EXISTS parkplatz_trail (
  parkplatz_id integer NOT NULL REFERENCES parkplatz(id) ON DELETE CASCADE,
  trail_id     integer NOT NULL REFERENCES trail(id) ON DELETE CASCADE,
  distanz_m    integer NOT NULL,
  PRIMARY KEY (parkplatz_id, trail_id)
);

-- Gastronomie, ÖPNV, Aussichtspunkte, WC im Umfeld
CREATE TABLE IF NOT EXISTS parkplatz_nearby (
  id           serial PRIMARY KEY,
  parkplatz_id integer NOT NULL REFERENCES parkplatz(id) ON DELETE CASCADE,
  kategorie    text NOT NULL,   -- einkehr | oepnv | aussicht | wc | infotafel | schutzhuette
  name         text,
  distanz_m    integer NOT NULL,
  lat          double precision,
  lon          double precision
);
CREATE INDEX IF NOT EXISTS parkplatz_nearby_idx ON parkplatz_nearby (parkplatz_id, kategorie);
