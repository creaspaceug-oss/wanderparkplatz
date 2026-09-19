import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Sockenfinder, { type FinderSocke } from "@/components/ausruestung/Sockenfinder";
import Merkleiste from "@/components/ausruestung/Merkleiste";
import Vorladen from "@/components/ausruestung/Vorladen";
import {
  Kapitel,
  Merksatz,
  Inhalt,
  Uebersicht,
  Entscheidung,
  Produktbericht,
  Kartenraster,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import { SOCKEN, FRAGEN, QUELLEN, alsProdukt, standardGroesse } from "@/lib/ausruestung/wandersocken";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Wandersocken: Welche Polsterung zu welchem Schuh, Merino oder Kunstfaser — und wie du Blasen vermeidest";

export const metadata: Metadata = {
  title: titel("Wandersocken: Test, Merino, Damen und Herren im Vergleich"),
  description: beschreibung(
    "Welche Wandersocken zu welchem Schuh passen, Merino oder Kunstfaser, die richtige Größe, Blasen vermeiden, was ein Schweizer Sockentest fand — und sechs Wandersocken für Damen und Herren.",
  ),
  alternates: { canonical: "/ausruestung/wandersocken" },
};

const KAPITEL: [string, string][] = [
  ["warum", "Warum Wandersocken?"],
  ["material", "Merino, Wolle oder Kunstfaser"],
  ["polster", "Polsterung und Schuhkategorie"],
  ["groesse", "Die richtige Größe"],
  ["blasen", "Blasen vermeiden"],
  ["schuhkauf", "Socken beim Schuhkauf"],
  ["test", "Wandersocken im Test"],
  ["waschen", "Wandersocken waschen"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Socken einzeln"],
  ["paare", "Wie viele Paar?"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  "TK2 Explore": "Unsere erste Wahl",
  "TK5 Wander": "Für leichte Schuhe und Sommer",
  "Hiker Micro Crew": "Wenn sie ewig halten soll",
  "Hike Midweight Merino Performance": "Für Stiefel",
  "Trekking Fibre Tech": "Für Membranschuhe und Kälte",
  "Merino Wandersocken, 3 Paar": "Mehrere Paare, günstig",
};

/** Kürzel, mit denen der Sockenfinder auf die Modelle verweist. */
const FINDER: Record<string, string> = {
  tk2: "TK2 Explore",
  tk5: "TK5 Wander",
  darn: "Hiker Micro Crew",
  bridgedale: "Hike Midweight Merino Performance",
  rohner: "Trekking Fibre Tech",
  danish: "Merino Wandersocken, 3 Paar",
};

export default async function Wandersocken() {
  // Erscheint erst zum Freigabezeitpunkt, bis dahin 404 (siehe lib/ausruestung/freigabe.ts).
  if (!sichtbar("/ausruestung/wandersocken")) notFound();

  const p = await preise(SOCKEN.flatMap((s) => s.groessen.map((g) => g.asin)));
  const PRODUKTE = SOCKEN.map(alsProdukt);
  const erste = PRODUKTE[0];
  const ep = p.get(erste.asin);
  const zeitVon = (asin: string) => {
    const a = p.get(asin)?.abgerufen;
    return a
      ? new Date(a).toLocaleString("de-DE", {
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
        })
      : null;
  };
  const stand = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const preisVon = (asin: string) => p.get(asin)?.anzeige ?? "—";
  const urlVon = (asin: string) => p.get(asin)?.url ?? partnerUrl(asin);

  const finder: FinderSocke[] = Object.entries(FINDER).map(([key, name]) => {
    const s = SOCKEN.find((x) => x.name === name)!;
    return {
      key,
      name: `${s.marke} ${s.name}`,
      groessen: s.groessen.map((g) => ({ ...g, url: urlVon(g.asin), anzeige: p.get(g.asin)?.anzeige ?? null })),
    };
  });

  const knopf = (asin: string, text: string, beschriftung: React.ReactNode) => (
    <a
      key={asin}
      href={urlVon(asin)}
      rel="sponsored nofollow noopener"
      target="_blank"
      className="inline-flex flex-col rounded-lg border border-line bg-card px-3 py-1.5 text-left text-xs transition hover:border-accent"
    >
      <span className="font-semibold">{beschriftung}</span>
      <span className="tabular-nums text-accent">
        {preisVon(asin)} <span aria-hidden>→</span>
      </span>
      <span className="sr-only"> {text} bei Amazon, Anzeige</span>
    </a>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/wandersocken`,
            inLanguage: "de-DE",
            dateModified: new Date().toISOString(),
            isAccessibleForFree: true,
            author: { "@type": "Organization", name: "wanderparkplatz.info", url: SITE },
            publisher: { "@type": "Organization", name: "wanderparkplatz.info", url: SITE },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FRAGEN.map((f) => ({
              "@type": "Question",
              name: f.frage,
              acceptedAnswer: { "@type": "Answer", text: f.antwort },
            })),
          },
        ])}
      />

      <Vorladen
        bilder={PRODUKTE.slice(0, 3)
          .map((x) => p.get(x.asin)?.bildKlein)
          .filter((x): x is string => Boolean(x))}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Ausrüstung", url: "/ausruestung" },
        ]}
        aktuell="Wandersocken"
      />

      {/* ─────────────────────────── Einstieg ─────────────────────────── */}
      <header className="mt-4 overflow-hidden rounded-3xl bg-sand px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Kaufberatung · Stand {stand}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
          {TITEL}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Die meisten Blasen entstehen nicht im Schuh, sondern in der Socke: dort, wo sie Falten
          wirft, Schweiß aufsaugt oder zu dünn ist für den Schuh. Eine gute Wandersocke kostet einen
          Bruchteil des Schuhs und entscheidet mit darüber, ob der Schuh passt. Deshalb steht hier
          zuerst, welche Socke zu welchem Schuh gehört.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${SOCKEN.length} Wandersocken verglichen`, "Sockenfinder mit Größe", "Damen und Herren", "Blasen vermeiden"].map((t) => (
            <li key={t} className="rounded-full border border-line bg-card px-3 py-1">
              {t}
            </li>
          ))}
        </ul>
      </header>

      {/* ─────────────────────────── Übersicht ─────────────────────────── */}
      <section id="uebersicht" className="mt-8 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Alle sechs auf einen Blick</h2>
          <a href="#modelle" className="text-sm text-muted underline hover:text-accent">
            Zu den ausführlichen Einschätzungen
          </a>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">Anzeige:</strong> Bilder, Namen und grüne Knöpfe
          führen zu Amazon und tragen eine Partnerkennung. {PARTNER} Für dich ändert sich am Preis
          nichts. Preise für Herrengröße 42 oder das Grundangebot — alle Größen unter{" "}
          <a href="#groesse" className="underline hover:text-accent">Die richtige Größe</a>.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Polsterung"
            zeilen={PRODUKTE.map((s, i) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[SOCKEN[i].name],
              url: partnerUrl(s.asin),
            }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{PREISHINWEIS}</p>
      </section>

      <div className="mt-12">
        <Inhalt eintraege={KAPITEL} />
      </div>

      {/* ─────────────────────────── 1 ─────────────────────────── */}
      <Kapitel id="warum" titel="Warum Wandersocken?" unterzeile="Weil Blasen durch Reibung entstehen — und nasse Haut schneller nachgibt." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Der{" "}
            <a href={QUELLEN.oeavBlasen} className="underline hover:text-accent" rel="noopener" target="_blank">
              Österreichische Alpenverein
            </a>{" "}
            beschreibt es so: Blasen bilden sich durch Reibung zwischen Socke oder Schuh und Haut. Die
            oberste Hautschicht löst sich, darunter sammelt sich Flüssigkeit. Als Ursachen nennt er
            neue oder schlecht sitzende Schuhe, neue Socken, Wasser im Schuh, ungewohnt steile oder
            lange Strecken — und hält fest, dass nasse Füße wesentlich blasenanfälliger sind.
          </p>
          <p>
            Eine Wandersocke setzt an beidem an: Polster an den Stellen, die reiben, flache Nähte,
            und ein Material, das Schweiß von der Haut wegführt, statt ihn aufzusaugen. Welche zu
            deinem Schuh passt, in deiner Größe:
          </p>
        </div>
        <Sockenfinder socken={finder} zeit={zeitVon(erste.asin)} />
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="material" titel="Merino, Wolle oder Kunstfaser" unterzeile="Fast jede Wandersocke ist eine Mischung — die Frage ist, woraus.">
        <p>
          Merinowolle ist laut{" "}
          <a href={QUELLEN.davMerino} className="underline hover:text-accent" rel="noopener" target="_blank">
            DAV
          </a>{" "}
          mit 16,5 bis 24 Mikrometern etwa halb so dick wie herkömmliche Schurwolle, deshalb kratzt
          sie nicht. Die Fasern können bis zu einem Drittel ihres Trockengewichts an Feuchtigkeit
          aufnehmen und ins Faserinnere transportieren. Weil unter der Kleidung kein feuchtes Klima
          entsteht, vermehren sich Geruchsbakterien langsamer — Merino riecht weniger schnell.
        </p>
        <p>
          Reine Merinosocken gibt es trotzdem kaum. Nylon und Polyamid machen sie haltbar,
          Elasthan hält sie in Form. Bei den Socken in diesem Vergleich liegt der angegebene
          Merino-Anteil zwischen 18 und 61 Prozent — und nicht jede nennt ihn überhaupt.
        </p>
        <p>
          Eine Ausnahme nennt der{" "}
          <a href={QUELLEN.oeavBlasen} className="underline hover:text-accent" rel="noopener" target="_blank">
            Österreichische Alpenverein
          </a>
          : In Schuhen mit Gore-Tex-Membran gewährleiste nur eine Synthetiksocke trockene Füße, weil sie
          den Schweiß von der Haut nimmt und sofort nach außen weitergibt. Für solche Schuhe ist die
          Rohner Fibre Tech gemacht.
        </p>
        <Merksatz>
          „Merino“ im Namen heißt nicht viel Merino. Die Bridgedale Hike Midweight Merino hat laut
          Hersteller 18 Prozent. Wer Wert darauf legt, liest die Zusammensetzung.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="polster" titel="Polsterung und Schuhkategorie" unterzeile="Die Socke muss zum Schuh passen, nicht zum Wetterbericht." breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Leicht gepolstert",
              text: "Für Halbschuhe, Trailrunner und Multifunktionsschuhe. Falke ordnet seine TK5 der Schuhkategorie A zu. Kühler im Sommer, und sie passt in schmale Schuhe.",
            },
            {
              titel: "Mittelstark gepolstert",
              text: "Für den normalen Wanderschuh. Falke ordnet die TK2 den Kategorien A bis B zu — also Wanderschuhen bis hin zu leichten Stiefeln für das Mittelgebirge.",
            },
            {
              titel: "Stark gepolstert",
              text: "Für schwere Stiefel, Kälte und lange Touren mit schwerem Rucksack. Mehr Dämpfung, mehr Wärme — und mehr Volumen, das der Schuh fassen muss.",
            },
          ]}
        />
        <p className="max-w-3xl">
          Eine dickere Socke macht den Fuß dicker. Wer seine Schuhe mit dünnen Socken gekauft hat und
          im Winter dicke trägt, hat einen zu engen Schuh. Deshalb gehört die Socke zum Schuhkauf —
          mehr dazu weiter unten.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="groesse" titel="Die richtige Größe" unterzeile="Zu groß wirft Falten, und Falten reiben." breit>
        <p className="max-w-3xl">
          Wandersocken werden in Schuhgrößenbereichen verkauft, bei Falke getrennt für Damen und
          Herren. Liegst du zwischen zwei Bereichen, empfiehlt Falke die kleinere Größe — eine Socke,
          die leicht spannt, sitzt faltenfreier als eine, die Spiel hat. Alle Größen der Modelle hier:
        </p>
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {SOCKEN.map((s) => (
            <div key={s.name} className="grid gap-3 p-4 sm:grid-cols-[12rem_1fr] sm:items-center sm:px-5">
              <a href={`#${standardGroesse(s).asin}`} className="font-semibold hover:text-accent">
                <span className="block text-xs font-normal text-muted">{s.marke}</span>
                {s.name}
              </a>
              <div className="flex flex-wrap gap-2">
                {s.groessen.map((g) =>
                  knopf(
                    g.asin,
                    `${s.marke} ${s.name} ${g.damen ? "Damen " : ""}${g.k}`,
                    <>
                      {g.damen && g.von !== undefined ? "Damen " : ""}
                      {g.k}
                    </>,
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="max-w-3xl text-xs text-muted">
          Anzeige. Alle Knöpfe führen zu Amazon und tragen eine Partnerkennung. Preise und
          Verfügbarkeit: Stand {zeitVon(erste.asin)} Uhr. {PREISHINWEIS} Wo keine Schuhgröße steht,
          wählt man sie auf der Amazon-Seite.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="blasen" titel="Blasen vermeiden" unterzeile="Reagieren, bevor es eine Blase ist.">
        <p>
          Sobald sich das kleinste Anzeichen einer Druckstelle zeigt, rät der Österreichische
          Alpenverein: stehen bleiben und abkleben — nicht bis zur nächsten Hütte warten. Vorbeugend
          ein Blasenpflaster aufzukleben, davon rät er dagegen ab.
        </p>
        <p>
          Viele schwören auf zwei Socken: eine sehr dünne, eng anliegende Kunstfasersocke unter der
          Wollsocke. Dann entsteht die Reibung zwischen den beiden Socken, nicht an der Haut. Der
          Schuh muss dafür Platz haben.
        </p>
        <p>
          Ist die Blase da: Hautbildende Blasenpflaster sind laut{" "}
          <a href={QUELLEN.davEh} className="underline hover:text-accent" rel="noopener" target="_blank">
            DAV
          </a>{" "}
          nur zur Regeneration gedacht. Bei Aktivität verkleben sie mit der Socke, und beim Ausziehen
          reißt die Blase auf. Was sonst
          ins Set gehört, steht im{" "}
          <Link href="/ausruestung/erste-hilfe-set" className="underline hover:text-accent">
            Erste-Hilfe-Vergleich
          </Link>
          .
        </p>
        <Merksatz>
          Nasse Socken sofort wechseln. Nasse Füße sind laut Alpenverein wesentlich
          blasenanfälliger — ein trockenes Ersatzpaar gehört in jeden Rucksack.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="schuhkauf" titel="Socken beim Schuhkauf">
        <p>
          Der{" "}
          <a href={QUELLEN.davSchuhe} className="underline hover:text-accent" rel="noopener" target="_blank">
            DAV
          </a>{" "}
          rät, zur Anprobe die Socken mitzunehmen, mit denen man wandern will — gern etwas dickere,
          polsternde Wandersocken —, und im Zweifel gleich mitzukaufen. Anprobieren am besten
          nachmittags, wenn die Füße dicker sind. Und im Laden herumgehen, auf Stühle und Stufen
          steigen, wippen und hüpfen.
        </p>
        <p>
          Wer dann im Winter dickere Socken trägt als beim Kauf, macht den Schuh enger. Umgekehrt
          rutscht der Fuß in einem Schuh, der mit dicken Socken gekauft wurde, im Sommer mit dünnen
          Socken — und Rutschen heißt Reibung.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="test" titel="Wandersocken im Test" unterzeile="Einen Wandersocken-Test der Stiftung Warentest gibt es nicht. Einen Sockentest schon.">
        <p>
          Im August 2024 berichtete die{" "}
          <a href={QUELLEN.warentest} className="underline hover:text-accent" rel="noopener" target="_blank">
            Stiftung Warentest
          </a>{" "}
          über einen Test des Schweizer Magazins Gesundheitstipp: zehn Sport- und Laufsocken, keine
          Wandersocken — aber die Prüfungen sind dieselben, die auch beim Wandern zählen.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Scheuertest:</strong> Jede Socke wurde 100.000-mal gegen ein festes Gewebe
            gerieben. Odlo und Wrightsock hatten danach ein Loch unter der Sohle, Adidas an den Zehen.
          </li>
          <li>
            <strong>Waschen bei 60 Grad:</strong> Odlo und X-Socks schrumpften um sechs Größen, von
            42 auf 36.
          </li>
          <li>
            <strong>Schweiß:</strong> Die besten Socken — On Performance Mid Sock und Nike
            Multiplier — leiteten Schweiß ab, statt ihn aufzusaugen. Wer in feuchten Socken läuft,
            bekommt leichter Blasen.
          </li>
        </ul>
        <p className="text-muted">
          Was man daraus mitnimmt: Haltbarkeit und Waschverhalten unterscheiden sich stark, auch bei
          bekannten Marken. Bei Wandersocken sind Garantien deshalb mehr als Werbung — Darn Tough gibt
          eine auf Lebenszeit, Danish Endurance ein Jahr gegen Löcher.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="waschen" titel="Wandersocken waschen" unterzeile="Zwei Empfehlungen, die sich widersprechen — und was daraus folgt.">
        <p>
          Der DAV rät für Merinokleidung zu 30 bis 40 Grad, einem Wollwaschmittel ohne Protease —
          ein Enzym, das die Wolle angreift —, keinem Weichspüler und keinem Trockner. Die Tester vom
          Gesundheitstipp wuschen dagegen bei 60 Grad, um Keime in den Kunstfasern abzutöten — Schweiß
          an den Füßen sei ein idealer Nährboden für Bakterien und Pilze. Das Ergebnis: Zwei Socken liefen um sechs
          Größen ein.
        </p>
        <Merksatz>
          Die Waschtemperatur auf dem Etikett gilt. Wer Fußpilz fürchtet, wäscht Kunstfasersocken
          heißer, wenn der Hersteller es erlaubt — Merinosocken nicht.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[56rem] text-sm">
            <caption className="sr-only">Wandersocken im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {SOCKEN.map((s) => (
                  <th key={s.name} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${standardGroesse(s).asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{s.marke}</span>
                      {s.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (s) => <strong className="tabular-nums">{preisVon(standardGroesse(s).asin)}</strong>],
                  ["Polsterung", (s) => s.polster],
                  ["Material", (s) => s.material],
                  ["Merino", (s) => (s.merino ? `${s.merino} %` : <span className="text-muted">k. A.</span>)],
                  ["Schuh", (s) => s.schuh],
                  ["Garantie", (s) => s.garantie ?? <span className="text-muted">—</span>],
                  ["Waschen", (s) => s.waschen ?? <span className="text-muted">k. A.</span>],
                  ["Damen", (s) => (s.groessen.some((g) => g.damen) ? "ja" : "unisex")],
                  [
                    "Angebot",
                    (s) => (
                      <a
                        href={urlVon(standardGroesse(s).asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(standardGroesse(s).asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {s.marke} {s.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (s: (typeof SOCKEN)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {SOCKEN.map((s) => (
                    <td key={s.name} className="px-3 py-3 leading-snug">{f(s)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Alle Angaben aus den Herstellertexten zum jeweiligen Artikel. „k. A.“: nicht angegeben.
          Preise für Herrengröße 42 oder das Grundangebot. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Socken einzeln" unterzeile="Zu jeder steht, wogegen sie spricht und wer sie nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="paare" titel="Wie viele Paar?">
        <p>
          Für die Tagestour ein Paar am Fuß und ein trockenes im Rucksack. Für die Hüttentour hängt
          es daran, ob man unterwegs wäscht: Merino riecht laut DAV weniger schnell, weil sich
          Geruchsbakterien im trockeneren Klima schlechter vermehren — zwei Paar im Wechsel reichen
          dann oft für mehrere Tage, eines am Fuß, eines zum Lüften am Rucksack.
        </p>
        <p>
          Wer Blasen fürchtet, wechselt mittags. Ein frisches Paar ist die billigste Blasenprophylaxe,
          die es gibt.
        </p>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Für den normalen Wanderschuh gemacht, links und rechts anatomisch gestrickt, getrennt für
          Damen und Herren, mit Schuhgröße im Angebot. Die TK2 ist die Socke, mit der man zum
          Schuhkauf geht.
        </p>
        <p className="mt-2 text-muted">
          Wenn du Socken nur einmal kaufen willst, nimm die{" "}
          <a href={`#${standardGroesse(SOCKEN[2]).asin}`} className="underline hover:text-accent">Darn Tough Hiker</a> —
          mit Garantie auf Lebenszeit.
        </p>
      </Entscheidung>

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel id="fragen" titel="Häufige Fragen">
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {FRAGEN.map((f) => (
            <details key={f.frage} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.frage}
                <span aria-hidden className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.antwort}</p>
            </details>
          ))}
        </div>
      </Kapitel>

      {/* ─────────────────────────── 13 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Die Angaben stammen aus den Herstellertexten, aus Artikeln des Deutschen und des
          Österreichischen Alpenvereins und aus dem Bericht der Stiftung Warentest über einen Schweizer
          Sockentest.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Stiftung Warentest,{" "}
            <a href={QUELLEN.warentest} className="underline hover:text-accent" rel="noopener" target="_blank">
              Sportsocken im Test: Zwei schrumpfen, drei scheuern durch
            </a>{" "}
            (14.08.2024, Test des Schweizer Gesundheitstipp).
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.davMerino} className="underline hover:text-accent" rel="noopener" target="_blank">
              Mit Merinowolle unterwegs
            </a>
            ,{" "}
            <a href={QUELLEN.davSchuhe} className="underline hover:text-accent" rel="noopener" target="_blank">
              Tipps für die Wahl von Wanderschuhen
            </a>{" "}
            und{" "}
            <a href={QUELLEN.davEh} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wie funktionieren Erste-Hilfe-Sets?
            </a>
          </li>
          <li>
            Österreichischer Alpenverein, Sektion Hohenems,{" "}
            <a href={QUELLEN.oeavBlasen} className="underline hover:text-accent" rel="noopener" target="_blank">
              Blasen?
            </a>
          </li>
          <li>
            Technische Angaben: Herstellerangaben. Preise und Bilder: Amazon, stündlich abgerufen. {PREISHINWEIS}
          </li>
          <li>
            {PARTNER} {HERKUNFT}
          </li>
        </ul>
      </Kapitel>

      <Merkleiste
        name={`${erste.marke} ${erste.name}`}
        preis={ep?.anzeige}
        zeit={zeitVon(erste.asin)}
        bild={ep?.bildKlein}
        url={ep?.url ?? partnerUrl(erste.asin)}
        oben="uebersicht"
        unten="methode"
      />

      <aside className="mt-14 rounded-2xl bg-sand p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Passend dazu</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          <li>
            <Link href="/ausruestung/gamaschen" className="font-medium hover:text-accent">Gamaschen im Vergleich</Link>
            <p className="text-sm text-muted">Damit die Socken trocken bleiben.</p>
          </li>
          <li>
            <Link href="/ausruestung/erste-hilfe-set" className="font-medium hover:text-accent">Erste-Hilfe-Set im Vergleich</Link>
            <p className="text-sm text-muted">Mit Tape für die Blase.</p>
          </li>
          <li>
            <Link href="/ausruestung/wanderstoecke" className="font-medium hover:text-accent">Wanderstöcke im Vergleich</Link>
            <p className="text-sm text-muted">Entlasten Füße und Knie im Abstieg.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
