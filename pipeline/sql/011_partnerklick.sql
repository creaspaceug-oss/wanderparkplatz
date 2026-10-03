-- Klicks auf Partnerverweise zählen.
--
-- Bisher endet jede Messung an der Seitengrenze: Die Search Console zeigt,
-- wer auf die Ausrüstungsseiten kommt, Amazon zeigt Bestellungen — dazwischen
-- liegt ein blinder Fleck. Welche Seite, welcher Abschnitt und welches Produkt
-- überhaupt einen Klick auslösen, ist damit nicht zu sehen, und ohne diese
-- Zahl ist jede Platzierungsentscheidung geraten.
--
-- Bewusst nicht gespeichert: IP-Adresse, Browserkennung, Sitzung, Cookie.
-- Gezählt wird das Ereignis, nicht die Person. Damit bleibt die Tabelle frei
-- von personenbezogenen Daten — und genau deshalb braucht sie weder
-- Einwilligung noch Aufbewahrungsfrist.
--
-- Eine Zeile je Klick statt eines Tageszählers: Bei einigen hundert Klicks im
-- Monat kostet das nichts und erlaubt später Auswertungen, die heute niemand
-- vorhersieht — etwa nach Wochentag oder nach Reihenfolge innerhalb einer
-- Seite.
CREATE TABLE IF NOT EXISTS partnerklick (
  id    serial      PRIMARY KEY,
  zeit  timestamptz NOT NULL DEFAULT now(),
  -- Seite, auf der geklickt wurde, ohne Abfrageteil.
  pfad  text        NOT NULL,
  -- Produkt, sofern aus der Amazon-Adresse lesbar.
  asin  text,
  -- Abschnitt der Seite: uebersicht, berater, vergleich, modelle, leiste.
  -- Daran entscheidet sich, ob die obere Tabelle oder der Fließtext trägt.
  platz text
);

CREATE INDEX IF NOT EXISTS partnerklick_zeit_idx ON partnerklick (zeit DESC);
CREATE INDEX IF NOT EXISTS partnerklick_pfad_idx ON partnerklick (pfad);
