-- Kennzahlen je Wanderweg, damit Seiten und Sitemap sie nicht bei jedem
-- Aufruf neu berechnen müssen.
ALTER TABLE trail
  ADD COLUMN IF NOT EXISTS parkplatz_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eigene_seite boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS trail_seite_idx ON trail (eigene_seite) WHERE eigene_seite;
CREATE UNIQUE INDEX IF NOT EXISTS trail_slug_idx ON trail (slug) WHERE slug IS NOT NULL;
