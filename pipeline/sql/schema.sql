-- Wanderparkplatz-Verzeichnis: Schema ohne PostGIS.
-- Umkreissuche läuft über Bounding-Box-Vorfilter (B-Tree auf lat/lon)
-- plus exakte Haversine-Distanz auf der kleinen Restmenge.

DROP TABLE IF EXISTS parkplatz_trail, parkplatz_nearby, parkplatz, ort, kreis, bundesland, trail CASCADE;

CREATE TABLE bundesland (
  id          serial PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  iso         text NOT NULL UNIQUE,       -- DE-BW
  lat         double precision NOT NULL,  -- Schwerpunkt der Parkplätze
  lon         double precision NOT NULL,
  poi_count   integer NOT NULL DEFAULT 0
);

CREATE TABLE kreis (
  id             serial PRIMARY KEY,
  slug           text NOT NULL UNIQUE,
  name           text NOT NULL,
  typ            text,                    -- Landkreis / Kreisfreie Stadt
  bundesland_id  integer NOT NULL REFERENCES bundesland(id),
  lat            double precision NOT NULL,
  lon            double precision NOT NULL,
  poi_count      integer NOT NULL DEFAULT 0
);
CREATE INDEX ON kreis (bundesland_id);

CREATE TABLE ort (
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
CREATE INDEX ON ort (kreis_id);
CREATE INDEX ON ort (bundesland_id);

CREATE TABLE parkplatz (
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
  ort_richtung   text,                    -- "nordwestlich von …"

  -- aus OSM-Tags normalisiert
  stellplaetze   integer,
  gebuehr        boolean,                 -- true = kostenpflichtig
  gebuehr_info   text,
  oberflaeche    text,
  zugang         text,
  oeffnungszeiten text,
  beleuchtet     boolean,
  barrierefrei   boolean,
  max_hoehe_m    numeric(4,2),
  wohnmobil      boolean,
  wc             boolean,
  betreiber      text,
  hoehe_m        integer,

  tier           smallint NOT NULL DEFAULT 1,  -- 1 = ausgewiesener Wanderparkplatz
  daten_score    smallint NOT NULL DEFAULT 0,  -- 0–100: wie gut belegt der Datensatz ist
  tags           jsonb NOT NULL DEFAULT '{}',
  aktualisiert   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (osm_type, osm_id)
);
-- Bbox-Vorfilter der Umkreissuche
CREATE INDEX parkplatz_lat_lon_idx ON parkplatz (lat, lon);
CREATE INDEX ON parkplatz (bundesland_id);
CREATE INDEX ON parkplatz (kreis_id);
CREATE INDEX ON parkplatz (ort_id);
CREATE INDEX ON parkplatz (daten_score DESC);

CREATE TABLE trail (
  id        serial PRIMARY KEY,
  osm_id    bigint NOT NULL UNIQUE,
  name      text NOT NULL,
  slug      text,
  netz      text,       -- lwn / rwn / nwn / iwn
  ref       text,
  laenge_km numeric(7,2)
);

CREATE TABLE parkplatz_trail (
  parkplatz_id integer NOT NULL REFERENCES parkplatz(id) ON DELETE CASCADE,
  trail_id     integer NOT NULL REFERENCES trail(id) ON DELETE CASCADE,
  distanz_m    integer NOT NULL,
  PRIMARY KEY (parkplatz_id, trail_id)
);

-- Gastronomie, ÖPNV, Aussichtspunkte, WC im Umfeld
CREATE TABLE parkplatz_nearby (
  id           serial PRIMARY KEY,
  parkplatz_id integer NOT NULL REFERENCES parkplatz(id) ON DELETE CASCADE,
  kategorie    text NOT NULL,   -- einkehr | oepnv | aussicht | wc | infotafel | schutzhuette
  name         text,
  distanz_m    integer NOT NULL,
  lat          double precision,
  lon          double precision
);
CREATE INDEX ON parkplatz_nearby (parkplatz_id, kategorie);
