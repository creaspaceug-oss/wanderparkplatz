import { q } from "@/lib/db";
import { SITE } from "@/lib/site";
import { BETREIBER } from "@/lib/betreiber";

export const revalidate = 86400;

/**
 * llms.txt — Kurzbeschreibung des Angebots für KI-Systeme.
 *
 * Anders als robots.txt regelt die Datei keinen Zugriff, sondern erklärt, was
 * hier steht, woher es stammt und wie es zu zitieren ist. Das erhöht die
 * Chance, korrekt und mit Quellenangabe wiedergegeben zu werden.
 */
export async function GET() {
  const [z] = await q<{
    parkplaetze: number; orte: number; kreise: number;
    wege: number; ziele: number; regionen: number;
  }>(
    `SELECT (SELECT count(*) FROM parkplatz WHERE aktiv)::int        AS parkplaetze,
            (SELECT count(*) FROM ort   WHERE poi_count > 0)::int    AS orte,
            (SELECT count(*) FROM kreis WHERE poi_count > 0)::int    AS kreise,
            (SELECT count(*) FROM trail WHERE eigene_seite)::int     AS wege,
            (SELECT count(*) FROM ziel  WHERE eigene_seite)::int     AS ziele,
            (SELECT count(*) FROM bundesland WHERE poi_count > 0)::int AS regionen`,
  );

  const text = `# Wanderparkplatz-Verzeichnis

> Verzeichnis ausgewiesener Wanderparkplätze in Deutschland: ${z.parkplaetze} Ausgangs-
> punkte für Wanderungen, jeweils mit den markierten Wanderwegen, die dort
> vorbeiführen, mit Stellplatzzahl, Gebühren, Untergrund und Umfeld.

Betreiber: ${BETREIBER.name}, ${BETREIBER.ort}, ${BETREIBER.email}

## Was hier zu finden ist

- ${z.parkplaetze} Wanderparkplätze mit Koordinaten, Stellplatzzahl, Gebühren,
  Untergrund, Zufahrtsbeschränkungen und Höhenlage
- ${z.wege} Wanderwege mit Netzstufe, Markierung und Länge, jeweils verknüpft mit
  den Parkplätzen am Weg
- ${z.ziele} Wanderziele (Gipfel, Burgen, Höhlen, Wasserfälle, Aussichtstürme) mit
  den Parkplätzen, von denen aus sie erreichbar sind
- Umfeld je Parkplatz: Einkehr, Haltestelle, Toilette, Infotafel, Aussichtspunkt
- Gliederung nach ${z.regionen} Bundesländern, ${z.kreise} Landkreisen, ${z.orte} Orten
  und 29 Wanderregionen

## Aufbau der Adressen

- ${SITE}/wanderparkplatz/<name> — einzelner Parkplatz
- ${SITE}/ort/<ort> — Parkplätze eines Orts
- ${SITE}/kreis/<kreis> — Parkplätze eines Landkreises
- ${SITE}/region/<region> — Parkplätze einer Wanderregion
- ${SITE}/wanderweg/<weg> — Parkplätze an einem Wanderweg
- ${SITE}/ziel/<ziel> — Parkplätze an einem Wanderziel
- ${SITE}/sitemap.xml — vollständiges Verzeichnis aller Adressen

## Herkunft und Verlässlichkeit

Standorte, Merkmale, Wanderwege und Ziele stammen aus OpenStreetMap und stehen
unter der Open Database License (ODbL). Die Angaben sind ehrenamtlich erfasst
und unterschiedlich vollständig. Wo eine Angabe fehlt, steht sie nicht auf der
Seite — geschätzt oder ergänzt wird nichts.

Gebühren und Zufahrtsregelungen ändern sich; maßgeblich ist immer die
Beschilderung vor Ort. Entfernungsangaben sind Luftlinie, nicht Wegstrecke.

Fotos stammen aus Wikimedia Commons und sind auf den Seiten mit Urheber und
Lizenz ausgewiesen. Sie zeigen in der Regel ein Wanderziel in der Nähe, nicht
den Parkplatz selbst; die Bildunterschrift sagt das jeweils dazu.

## Zitierhinweis

Bei Verwendung bitte Angabe der Quelle als „Wanderparkplatz-Verzeichnis,
${SITE}" sowie der zugrunde liegenden Daten als „© OpenStreetMap-Mitwirkende,
ODbL".
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
