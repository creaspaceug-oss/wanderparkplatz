/**
 * Verbindungszeichenfolge mit klarer Fehlermeldung.
 *
 * Ohne DATABASE_URL fielen die Skripte bisher still auf localhost zurück. Auf
 * dem eigenen Rechner ist das richtig, in einem CI-Lauf führt es zu einem
 * Verbindungsfehler, dessen Meldung auf das Skript zeigt statt auf das
 * fehlende Geheimnis — genau das ist beim ersten wöchentlichen Lauf passiert.
 */
const LOKAL = "postgres://localhost:5432/wanderparkplatz";

/** Läuft das hier in einer automatisierten Umgebung? */
const automatisiert = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);

export function datenbankUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  if (automatisiert) {
    console.error(
      "\nDATABASE_URL ist nicht gesetzt.\n\n" +
        "In einem automatisierten Lauf gibt es keine lokale Datenbank, auf die\n" +
        "zurückgefallen werden könnte. Das Geheimnis ist im Repository unter\n" +
        "Settings → Secrets and variables → Actions zu hinterlegen.\n",
    );
    process.exit(1);
  }

  console.warn(`Hinweis: DATABASE_URL nicht gesetzt, verwende ${LOKAL}`);
  return LOKAL;
}
