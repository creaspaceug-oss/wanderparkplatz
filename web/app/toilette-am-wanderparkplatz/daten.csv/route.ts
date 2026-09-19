import { wcNachLand, wcNachKreis, wcPlaetze } from "@/lib/db";
import { SITE } from "@/lib/site";

export const revalidate = 604800;

/**
 * Die Auswertung als CSV.
 *
 * Anders als beim Nahverkehr stehen hier auch die Einzelplätze drin, nicht
 * nur die Aggregate. Der Gebrauchswert liegt genau dort: Wer wissen will, wo
 * eine Toilette ist, braucht die Liste, nicht den Landesdurchschnitt.
 *
 * Semikolon statt Komma als Trennzeichen und eine Byte-Reihenfolge-Marke am
 * Anfang — beides, damit Excel in deutscher Einstellung die Datei ohne
 * Importdialog richtig öffnet.
 */
const feld = (v: string | number | null) => {
  const s = v == null ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const komma = (v: string | null) => feld(String(v ?? "").replace(".", ","));

export async function GET() {
  const [laender, kreise, plaetze] = await Promise.all([
    wcNachLand(),
    wcNachKreis(1),
    wcPlaetze(),
  ]);

  const zeilen: string[] = [];
  // Eine Datei, zwei Korngrößen: die Spalte "ebene" trennt sie. Zwei
  // getrennte Dateien wären sauberer, aber niemand lädt zwei Dateien.
  zeilen.push(
    [
      "ebene",
      "name",
      "landkreis",
      "bundesland",
      "adresse",
      "wanderparkplaetze",
      "mit_toilette_bis_500m",
      "anteil_prozent",
      "median_entfernung_m",
      "entfernung_m",
    ].join(";"),
  );

  for (const r of laender)
    zeilen.push(
      ["bundesland", feld(r.name), "", feld(r.name), `${SITE}/bundesland/${r.slug}`,
       r.plaetze, r.mit, komma(r.prozent), r.median ?? "", ""].join(";"),
    );

  for (const r of kreise)
    zeilen.push(
      ["landkreis", feld(r.name), feld(r.name), "", `${SITE}/kreis/${r.slug}`,
       r.plaetze, r.mit, komma(r.prozent), r.median ?? "", ""].join(";"),
    );

  for (const p of plaetze)
    zeilen.push(
      ["parkplatz", feld(p.name), feld(p.kreis), feld(p.land),
       `${SITE}/wanderparkplatz/${p.slug}`, "", "", "", "", p.distanz_m].join(";"),
    );

  const kopf =
    `# Toiletten im Umkreis deutscher Wanderparkplaetze\r\n` +
    `# Quelle: ${SITE}/toilette-am-wanderparkplatz\r\n` +
    `# Datengrundlage: OpenStreetMap-Mitwirkende, lizenziert unter ODbL\r\n` +
    `# Toilette = amenity=toilets innerhalb von 500 m Luftlinie, je Platz der naechste Eintrag\r\n` +
    `# Die Zahlen belegen, dass dort eine Toilette kartiert ist — nicht, dass sie\r\n` +
    `# oeffentlich, geoeffnet oder kostenlos ist. Die Erfassung ist unvollstaendig.\r\n`;

  return new Response(`﻿${kopf}${zeilen.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="toilette-am-wanderparkplatz.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=604800",
    },
  });
}
