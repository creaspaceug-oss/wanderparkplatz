/**
 * Abgeleitete Felder neu berechnen, ohne vollständigen Import.
 *
 * Nötig, wenn sich im Code eine Schwelle ändert — etwa wie viele Parkplätze
 * ein Weg für eine eigene Seite braucht. Die Daten selbst bleiben unberührt;
 * gerechnet wird nur, was ohnehin aus dem Bestand folgt. Der wöchentliche
 * Import macht dasselbe am Ende jedes Laufs.
 *
 *   npm run -w pipeline ableiten          berechnen
 *   npm run -w pipeline ableiten -- --probe   nur zeigen, was sich ändern würde
 */
import pg from "pg";
import { datenbankUrl } from "./db-url.ts";
import { WEGESEITEN, ZIELSEITEN, AUSSAGEN } from "./abgeleitet.ts";

const probe = process.argv.includes("--probe");
const client = new pg.Client({ connectionString: datenbankUrl() });
await client.connect();

const zaehle = async () => {
  const { rows } = await client.query<{
    wegeseiten: number;
    zielseiten: number;
    indexierbar: number;
  }>(`SELECT (SELECT count(*) FROM trail WHERE eigene_seite)::int AS wegeseiten,
             (SELECT count(*) FROM ziel  WHERE eigene_seite)::int AS zielseiten,
             (SELECT count(*) FROM parkplatz WHERE aktiv AND aussagen >= 3)::int AS indexierbar`);
  return rows[0];
};

const vorher = await zaehle();

// Eine Transaktion: Eine halb berechnete Datenbank wäre schlimmer als eine
// veraltete, weil Seiten und Sitemap dann auseinanderlaufen. Der Probelauf
// rechnet in derselben Transaktion und rollt sie zurück — nur so zeigt er,
// was sich tatsächlich ändern würde, statt bloß den Ist-Stand.
await client.query("BEGIN");
for (const sql of [WEGESEITEN, ZIELSEITEN, AUSSAGEN]) await client.query(sql);
const nachher = await zaehle();
await client.query(probe ? "ROLLBACK" : "COMMIT");

const zeile = (feld: keyof typeof vorher, name: string) => {
  const diff = nachher[feld] - vorher[feld];
  const pfeil = diff === 0 ? "unverändert" : `${diff > 0 ? "+" : ""}${diff}`;
  console.log(`${name.padEnd(22)} ${String(vorher[feld]).padStart(6)} → ${String(nachher[feld]).padStart(6)}  (${pfeil})`);
};
zeile("wegeseiten", "Wegeseiten");
zeile("zielseiten", "Zielseiten");
zeile("indexierbar", "Parkplätze im Index");
console.log(probe ? "\nProbelauf — zurückgerollt, nichts geschrieben." : "\nGeschrieben.");
await client.end();
