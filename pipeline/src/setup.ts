import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";
import { datenbankUrl } from "./db-url.ts";
import { ROOT } from "./paths.ts";

/**
 * Spielt alle SQL-Dateien in pipeline/sql/ in Namensreihenfolge ein.
 * Gefahrlos wiederholbar: die Dateien legen nur an, was fehlt, und lassen
 * Nutzerdaten unangetastet.
 */
const DB = datenbankUrl();

const verzeichnis = join(ROOT, "pipeline", "sql");
const dateien = (await readdir(verzeichnis)).filter((f) => f.endsWith(".sql")).sort();

const client = new pg.Client({ connectionString: DB });
await client.connect();
const ziel = (await client.query("SELECT current_database() AS d, version() AS v")).rows[0];
console.log(`Datenbank: ${ziel.d} (${ziel.v.split(",")[0]})`);

for (const datei of dateien) {
  process.stdout.write(`  ${datei} … `);
  await client.query(await readFile(join(verzeichnis, datei), "utf8"));
  console.log("ok");
}

const tabellen = (
  await client.query(
    "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'",
  )
).rows[0].n;
console.log(`Schema abgeglichen — ${tabellen} Tabellen vorhanden.`);

/*
 * Nachsehen, ob die Suche noch steht.
 *
 * suchindex und standort werden nicht vom Schema gefüllt, sondern vom Import.
 * Eine leere Tabelle bricht nichts und meldet nichts — die Seite liefert
 * einfach auf jede Eingabe "Keine Treffer". Genau so ist es einmal
 * unbemerkt passiert, weil diese Dateien die Tabellen damals verwarfen und
 * neu anlegten. Das tun sie nicht mehr; der Hinweis bleibt, weil eine
 * stumme kaputte Suche teurer ist als drei Zeilen Prüfung.
 */
const leer: string[] = [];
for (const t of ["suchindex", "standort"]) {
  const n = (await client.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;
  console.log(`  ${t}: ${n.toLocaleString("de-DE")} Zeilen`);
  if (n === 0) leer.push(t);
}
if (leer.length)
  console.warn(
    `\n⚠ ${leer.join(" und ")} ${leer.length === 1 ? "ist" : "sind"} leer — die Suche` +
      `\n  der laufenden Seite findet nichts. Ein Import füllt das wieder:` +
      `\n  npm run data:load  (oder den Arbeitsablauf "Daten aktualisieren" starten).\n`,
  );
await client.end();
