import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";
import { ROOT } from "./paths.ts";

/**
 * Spielt alle SQL-Dateien in pipeline/sql/ in Namensreihenfolge ein.
 * Gefahrlos wiederholbar: die Dateien legen nur an, was fehlt, und lassen
 * Nutzerdaten unangetastet.
 */
const DB = process.env.DATABASE_URL;
if (!DB) {
  console.error("DATABASE_URL ist nicht gesetzt.");
  process.exit(1);
}

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
console.log(`Fertig — ${tabellen} Tabellen vorhanden. Weiter mit: npm run data:load`);
await client.end();
