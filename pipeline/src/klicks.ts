/**
 * Was die Partnerverweise bringen — nach Seite und nach Abschnitt.
 *
 * Die Zahl allein sagt wenig; interessant ist das Verhältnis. Eine Seite mit
 * vielen Besuchern und wenigen Klicks hat ein Platzierungsproblem, eine Seite
 * mit wenigen Besuchern und vielen Klicks verdient mehr Besucher. Die
 * Besucherzahlen stehen in der Search Console, die Klicks hier.
 *
 *   npm run -w pipeline klicks             letzte 30 Tage
 *   npm run -w pipeline klicks -- --tage 7 anderer Zeitraum
 */
import pg from "pg";
import { datenbankUrl } from "./db-url.ts";

const i = process.argv.indexOf("--tage");
const tage = i >= 0 ? Number(process.argv[i + 1]) : 30;

const client = new pg.Client({ connectionString: datenbankUrl() });
await client.connect();

const seit = `now() - interval '${Number.isFinite(tage) ? tage : 30} days'`;

const { rows: gesamt } = await client.query<{ n: number }>(
  `SELECT count(*)::int AS n FROM partnerklick WHERE zeit >= ${seit}`,
);
console.log(`\n${gesamt[0].n} Klicks auf Partnerverweise in ${tage} Tagen\n`);

const tabelle = async (titel: string, sql: string) => {
  const { rows } = await client.query(sql);
  console.log(titel);
  if (rows.length === 0) console.log("  (noch nichts gezählt)");
  else console.table(rows);
};

await tabelle(
  "Nach Seite",
  `SELECT pfad, count(*)::int AS klicks
     FROM partnerklick WHERE zeit >= ${seit}
    GROUP BY pfad ORDER BY klicks DESC LIMIT 25`,
);

await tabelle(
  "Nach Abschnitt",
  `SELECT platz, count(*)::int AS klicks
     FROM partnerklick WHERE zeit >= ${seit}
    GROUP BY platz ORDER BY klicks DESC`,
);

await tabelle(
  "Nach Produkt",
  `SELECT asin, count(*)::int AS klicks
     FROM partnerklick WHERE zeit >= ${seit} AND asin IS NOT NULL
    GROUP BY asin ORDER BY klicks DESC LIMIT 20`,
);

await client.end();
