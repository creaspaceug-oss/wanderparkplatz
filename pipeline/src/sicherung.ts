import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, isAbsolute, resolve } from "node:path";
import pg from "pg";
import { datenbankUrl } from "./db-url.ts";
import { ROOT } from "./paths.ts";

/**
 * Sicherung der nutzergenerierten Daten.
 *
 * Gesichert wird ausschließlich, was sich nicht wiederherstellen lässt:
 * Parkplätze, Wege, Ziele und Orte entstehen jederzeit neu aus OpenStreetMap,
 * Bewertungen nicht. Ein Verlust der Tabelle `bewertung` ist endgültig.
 *
 *   npm run -w pipeline sicherung                    schreibt eine Sicherung
 *   npm run -w pipeline sicherung -- --einspielen <datei>   spielt sie zurück
 *
 * Die Zuordnung läuft über (osm_type, osm_id) des Parkplatzes, nicht über
 * dessen laufende Nummer: Die kann sich bei einem Neuaufbau der Datenbank
 * ändern, die OSM-Identität nicht.
 */
const DB = datenbankUrl();
const VERZEICHNIS = join(ROOT, "data", "sicherung");

interface GesicherteBewertung {
  osm_type: string;
  osm_id: string;
  sterne: number;
  text: string | null;
  autor: string | null;
  besucht_am: string | null;
  status: string;
  absender_hash: string;
  erstellt: string;
  geprueft: string | null;
}

const client = new pg.Client({ connectionString: DB });
await client.connect();

const argumente = process.argv.slice(2);
const einspielenIndex = argumente.indexOf("--einspielen");

if (einspielenIndex >= 0) {
  const datei = argumente[einspielenIndex + 1];
  if (!datei) {
    console.error("Bitte die Datei angeben: --einspielen <datei>");
    process.exit(1);
  }
  // npm-Workspaces setzen das Arbeitsverzeichnis auf das Paket; ein relativer
  // Pfad zeigt sonst nach pipeline/ statt an den Repo-Ursprung.
  const pfad = isAbsolute(datei) ? datei : resolve(ROOT, datei);
  const inhalt = JSON.parse(await readFile(pfad, "utf8"));
  const zeilen: GesicherteBewertung[] = inhalt.bewertungen ?? [];
  console.log(`Spiele ${zeilen.length} Bewertungen aus ${pfad} ein …`);

  let eingespielt = 0;
  let ohneParkplatz = 0;
  for (const b of zeilen) {
    const { rows } = await client.query<{ id: number }>(
      "SELECT id FROM parkplatz WHERE osm_type = $1 AND osm_id = $2",
      [b.osm_type, b.osm_id],
    );
    if (!rows.length) {
      ohneParkplatz++;
      continue;
    }
    // Dieselbe Bewertung nicht doppelt einspielen
    const { rowCount } = await client.query(
      `INSERT INTO bewertung
         (parkplatz_id, sterne, text, autor, besucht_am, status, absender_hash, erstellt, geprueft)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
        WHERE NOT EXISTS (
          SELECT 1 FROM bewertung
           WHERE parkplatz_id = $1 AND absender_hash = $7 AND erstellt = $8)`,
      [rows[0].id, b.sterne, b.text, b.autor, b.besucht_am, b.status, b.absender_hash, b.erstellt, b.geprueft],
    );
    eingespielt += rowCount ?? 0;
  }
  console.log(
    `Fertig. ${eingespielt} eingespielt` +
      (ohneParkplatz ? `, ${ohneParkplatz} ohne passenden Parkplatz übersprungen` : "") +
      `, ${zeilen.length - eingespielt - ohneParkplatz} waren bereits vorhanden.`,
  );
} else {
  const { rows } = await client.query<GesicherteBewertung>(`
    SELECT p.osm_type, p.osm_id::text, b.sterne, b.text, b.autor, b.besucht_am,
           b.status, b.absender_hash, b.erstellt, b.geprueft
      FROM bewertung b JOIN parkplatz p ON p.id = b.parkplatz_id
     ORDER BY b.erstellt`);

  const stand = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  await mkdir(VERZEICHNIS, { recursive: true });
  const datei = join(VERZEICHNIS, `bewertungen-${stand}.json`);
  await writeFile(
    datei,
    JSON.stringify({ erstellt: new Date().toISOString(), anzahl: rows.length, bewertungen: rows }, null, 1),
  );

  const { rows: z } = await client.query(
    "SELECT count(*)::int AS n, count(*) FILTER (WHERE status = 'frei')::int AS frei FROM bewertung",
  );
  console.log(`Sicherung geschrieben: ${datei}
  ${z[0].n} Bewertungen (${z[0].frei} veröffentlicht)`);
  if (z[0].n === 0)
    console.log("  Hinweis: Es liegen noch keine Bewertungen vor — die Sicherung ist leer.");
}

await client.end();
