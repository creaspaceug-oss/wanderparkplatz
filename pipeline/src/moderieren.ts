import pg from "pg";

/**
 * Moderation offener Bewertungen.
 *
 *   npm run -w pipeline moderieren              offene anzeigen
 *   npm run -w pipeline moderieren -- frei 12 13
 *   npm run -w pipeline moderieren -- ablehnen 14
 *   npm run -w pipeline moderieren -- frei-alle
 */
const DB = process.env.DATABASE_URL ?? "postgres://localhost:5432/wanderparkplatz";
const client = new pg.Client({ connectionString: DB });
await client.connect();

const [befehl, ...rest] = process.argv.slice(2);
const ids = rest.map(Number).filter(Number.isInteger);

async function zeigeOffene() {
  const { rows } = await client.query(
    `SELECT b.id, b.sterne, b.autor, b.text, b.erstellt, p.name, p.slug
       FROM bewertung b JOIN parkplatz p ON p.id = b.parkplatz_id
      WHERE b.status = 'neu'
      ORDER BY b.erstellt`,
  );
  if (!rows.length) {
    console.log("Keine offenen Bewertungen.");
    return;
  }
  console.log(`${rows.length} offene Bewertung(en):\n`);
  for (const r of rows) {
    console.log(`  #${r.id}  ${"★".repeat(r.sterne)}${"☆".repeat(5 - r.sterne)}  ${r.name}`);
    console.log(`      /wanderparkplatz/${r.slug}`);
    console.log(`      ${r.autor ?? "Anonym"} · ${new Date(r.erstellt).toLocaleString("de-DE")}`);
    if (r.text) console.log(`      „${r.text.replace(/\n/g, " ")}"`);
    console.log();
  }
  console.log("Freigeben:  npm run -w pipeline moderieren -- frei <id> [<id> …]");
  console.log("Ablehnen:   npm run -w pipeline moderieren -- ablehnen <id> [<id> …]");
}

async function setze(status: "frei" | "abgelehnt", welche: number[] | "alle") {
  const res =
    welche === "alle"
      ? await client.query(
          "UPDATE bewertung SET status = $1, geprueft = now() WHERE status = 'neu'",
          [status],
        )
      : await client.query(
          "UPDATE bewertung SET status = $1, geprueft = now() WHERE id = ANY($2) AND status = 'neu'",
          [status, welche],
        );
  console.log(`${res.rowCount} Bewertung(en) auf „${status}" gesetzt.`);
  if (status === "frei")
    console.log("Die Detailseiten übernehmen die Änderung beim nächsten Revalidieren (max. 24 h).");
}

switch (befehl) {
  case undefined:
  case "offen":
    await zeigeOffene();
    break;
  case "frei":
    if (!ids.length) console.error("Bitte IDs angeben.");
    else await setze("frei", ids);
    break;
  case "frei-alle":
    await setze("frei", "alle");
    break;
  case "ablehnen":
    if (!ids.length) console.error("Bitte IDs angeben.");
    else await setze("abgelehnt", ids);
    break;
  default:
    console.error(`Unbekannter Befehl: ${befehl}`);
    process.exitCode = 1;
}

await client.end();
