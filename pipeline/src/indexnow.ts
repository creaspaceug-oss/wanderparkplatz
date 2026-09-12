/**
 * Geänderte Adressen bei IndexNow melden.
 *
 * IndexNow ist ein gemeinsamer Endpunkt von Bing, Yandex, Seznam und Naver:
 * Eine Meldung erreicht alle. Google beteiligt sich nicht — dort bleibt es
 * beim Crawlen nach Sitemap und lastmod.
 *
 * Die Adressen kommen aus den ausgelieferten Sitemaps, nicht aus der
 * Datenbank. Das hat zwei Vorteile: Gemeldet wird genau das, was auch
 * tatsächlich online steht, und das lastmod je Adresse liegt schon vor —
 * daran entscheidet sich, was seit dem letzten Lauf neu ist.
 *
 *   npm run -w pipeline indexnow              seit 7 Tagen Geändertes
 *   npm run -w pipeline indexnow -- --tage 30 anderer Zeitraum
 *   npm run -w pipeline indexnow -- --alles   alles, für die Erstmeldung
 *   npm run -w pipeline indexnow -- --probe   nur zeigen, nichts senden
 */

const HOST = "www.wanderparkplatz.info";
const BASIS = `https://${HOST}`;

/**
 * Der Schlüssel ist kein Geheimnis: Er liegt öffentlich unter
 * /<schluessel>.txt und dient allein dem Nachweis, dass die Meldung vom
 * Betreiber der Domain stammt. Hier steht er im Klartext, damit Datei und
 * Meldung nicht auseinanderlaufen können.
 */
const SCHLUESSEL = "9c9bce2cb89234b6169cb09bb03d4432";
const SCHLUESSEL_URL = `${BASIS}/${SCHLUESSEL}.txt`;

/** IndexNow nimmt höchstens 10.000 Adressen je Meldung. */
const JE_MELDUNG = 10_000;

const argumente = process.argv.slice(2);
const flagge = (name: string) => argumente.includes(`--${name}`);
const wert = (name: string) => {
  const i = argumente.indexOf(`--${name}`);
  return i >= 0 ? argumente[i + 1] : undefined;
};

const alles = flagge("alles");
const probe = flagge("probe");
const tage = Number(wert("tage") ?? 7);

interface Adresse {
  loc: string;
  lastmod?: string;
}

async function hole(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "wanderparkplatz.info/1.0 (+https://www.wanderparkplatz.info)" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

/** Eigene Sitemaps, eigenes Format — ein XML-Parser wäre hier Beiwerk. */
function ausXml(xml: string, tag: "sitemap" | "url"): Adresse[] {
  const bloecke = xml.match(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, "g")) ?? [];
  return bloecke.map((b) => ({
    loc: b.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "",
    lastmod: b.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
  }));
}

async function schluesselPruefen() {
  try {
    const inhalt = (await hole(SCHLUESSEL_URL)).trim();
    if (inhalt !== SCHLUESSEL) {
      console.error(
        `\nSchlüsseldatei stimmt nicht überein.` +
          `\n  erwartet: ${SCHLUESSEL}` +
          `\n  gefunden: ${inhalt.slice(0, 60)}` +
          `\n\nDie Datei unter web/public/ und die Angabe in dieser Datei müssen gleich sein.`,
      );
      process.exit(1);
    }
  } catch (err) {
    console.error(
      `\nSchlüsseldatei nicht erreichbar: ${SCHLUESSEL_URL}` +
        `\n${(err as Error).message}` +
        `\n\nOhne sie weist IndexNow jede Meldung mit HTTP 403 ab. Liegt die Datei` +
        `\nunter web/public/ und ist sie ausgeliefert?`,
    );
    process.exit(1);
  }
}

async function melde(adressen: string[]): Promise<boolean> {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: SCHLUESSEL,
      keyLocation: SCHLUESSEL_URL,
      urlList: adressen,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  // 200 angenommen, 202 angenommen und Schlüssel wird noch geprüft.
  if (res.status === 200 || res.status === 202) {
    console.log(`  ✓ ${adressen.length} Adressen gemeldet (HTTP ${res.status})`);
    return true;
  }
  const grund: Record<number, string> = {
    400: "fehlerhafte Anfrage",
    403: "Schlüssel nicht anerkannt",
    422: "Adressen gehören nicht zu diesem Host",
    429: "zu viele Meldungen",
  };
  console.error(
    `  ✗ HTTP ${res.status}${grund[res.status] ? ` — ${grund[res.status]}` : ""}: ${(await res.text()).slice(0, 200)}`,
  );
  return false;
}

// ------------------------------------------------------------------ Ablauf
await schluesselPruefen();

const index = ausXml(await hole(`${BASIS}/sitemap.xml`), "sitemap");
console.log(`${index.length} Sitemaps im Verzeichnis.`);

const alle: Adresse[] = [];
for (const s of index) alle.push(...ausXml(await hole(s.loc), "url"));
console.log(`${alle.length} Adressen insgesamt.`);

const grenze = Date.now() - tage * 86_400_000;
const gewaehlt = alles
  ? alle
  : alle.filter((a) => !a.lastmod || new Date(a.lastmod).getTime() >= grenze);

// Ohne lastmod lässt sich nichts ausschließen — solche Adressen kommen mit.
const ohneStand = gewaehlt.filter((a) => !a.lastmod).length;
console.log(
  alles
    ? "Gemeldet wird der gesamte Bestand."
    : `Davon ${gewaehlt.length} in den letzten ${tage} Tagen geändert` +
        (ohneStand ? ` (${ohneStand} ohne lastmod, sicherheitshalber dabei)` : "") +
        ".",
);

if (!gewaehlt.length) {
  console.log("Nichts zu melden.");
  process.exit(0);
}

if (probe) {
  console.log("\nProbelauf, es wird nichts gesendet. Die ersten zehn:");
  for (const a of gewaehlt.slice(0, 10)) console.log(`  ${a.loc}`);
  process.exit(0);
}

let ok = true;
for (let i = 0; i < gewaehlt.length; i += JE_MELDUNG) {
  const teil = gewaehlt.slice(i, i + JE_MELDUNG).map((a) => a.loc);
  console.log(`Meldung ${Math.floor(i / JE_MELDUNG) + 1}: ${teil.length} Adressen …`);
  if (!(await melde(teil))) ok = false;
}

console.log(ok ? "\nFertig." : "\nMit Fehlern beendet.");
process.exit(ok ? 0 : 1);
