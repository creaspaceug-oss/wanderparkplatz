import { oepnvNachLand, oepnvNachKreis } from "@/lib/db";
import { SITE } from "@/lib/site";

export const revalidate = 604800;

/**
 * Die Auswertung als CSV.
 *
 * Der Datensatz ist der Teil, der Verweise bringt: Wer die Zahlen nachrechnen
 * oder weiterverwenden will, soll das ohne Abschreiben können.
 *
 * Semikolon statt Komma als Trennzeichen und eine Byte-Reihenfolge-Marke am
 * Anfang — beides, damit Excel in deutscher Einstellung die Datei ohne
 * Importdialog richtig öffnet. Wer mit ordentlichem Werkzeug arbeitet, kommt
 * mit beidem ebenfalls zurecht.
 */
const feld = (v: string | number | null) => {
  const s = v == null ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const [laender, kreise] = await Promise.all([oepnvNachLand(), oepnvNachKreis(1)]);

  const zeilen: string[] = [];
  zeilen.push(
    [
      "ebene",
      "region",
      "adresse",
      "wanderparkplaetze",
      "mit_haltestelle_bis_1000m",
      "anteil_prozent",
      "median_entfernung_m",
    ].join(";"),
  );

  for (const r of laender)
    zeilen.push(
      [
        "bundesland",
        feld(r.name),
        `${SITE}/bundesland/${r.slug}`,
        r.plaetze,
        r.mit,
        feld(String(r.prozent).replace(".", ",")),
        r.median ?? "",
      ].join(";"),
    );

  for (const r of kreise)
    zeilen.push(
      [
        "landkreis",
        feld(r.name),
        `${SITE}/kreis/${r.slug}`,
        r.plaetze,
        r.mit,
        feld(String(r.prozent).replace(".", ",")),
        r.median ?? "",
      ].join(";"),
    );

  const kopf =
    `# Wandern ohne Auto — Anbindung deutscher Wanderparkplätze an den Nahverkehr\r\n` +
    `# Quelle: ${SITE}/wandern-ohne-auto\r\n` +
    `# Datengrundlage: OpenStreetMap-Mitwirkende, lizenziert unter ODbL\r\n` +
    `# Haltestelle = Bus, Bahn, Halt oder Tram innerhalb von 1000 m Luftlinie\r\n` +
    `# Die Zahlen belegen, dass eine Haltestelle existiert, nicht dass dort ein Bus faehrt.\r\n`;

  return new Response(`﻿${kopf}${zeilen.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wandern-ohne-auto.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=604800",
    },
  });
}
