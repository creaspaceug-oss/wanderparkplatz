-- Ähnlichkeitsschwelle für die Suche, als Vorgabe der Datenbank.
--
-- Die Standardschwelle von word_similarity ist 0.6 — zu streng für deutsche
-- Ortsnamen mit Umlauten ("abtskuche" statt "abtskueche"). Maßgeblich ist sie
-- für den Operator <% in der WHERE-Klausel; der Vergleich des Punktwerts
-- steht daneben ausdrücklich im Abfragetext.
--
-- Bis hierher setzte die Anwendung den Wert beim Verbindungsaufbau, ohne das
-- Ergebnis abzuwarten. Zwei Folgen: pg warnte bei jedem Seitenaufruf, dass auf
-- derselben Verbindung zwei Abfragen gleichzeitig laufen (ab pg 9 ein Fehler),
-- und die erste Suche auf einer frischen Verbindung konnte noch mit 0.6 laufen
-- und weniger finden — sporadisch und schwer zu reproduzieren.
--
-- Der naheliegende Weg, der Startparameter "options" der Verbindung, scheitert
-- an Neon: Der Pooler weist pg_trgm.word_similarity_threshold dort ab. Als
-- Vorgabe der Datenbank gesetzt gilt der Wert dagegen ab dem Verbindungsaufbau
-- für jede neue Verbindung, ohne eine einzige zusätzliche Abfrage.
--
-- Dynamisch, weil die Datenbank verschieden heißt: lokal wanderparkplatz,
-- bei Neon neondb.
--
-- ACHTUNG: Dieselbe Zahl steht in web/lib/db.ts als AEHNLICHKEIT und wird
-- dort für den Vergleich des Punktwerts gebraucht. Beide müssen übereinstimmen.
DO $$
BEGIN
  EXECUTE format(
    'ALTER DATABASE %I SET pg_trgm.word_similarity_threshold = 0.42',
    current_database());
END $$;
