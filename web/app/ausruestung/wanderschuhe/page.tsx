import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Schuhberater, { type SchuhAngebot } from "@/components/ausruestung/Schuhberater";
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
import { SCHUHE, KATEGORIE_TEXT, FRAGEN, QUELLEN, alsProdukt, hauptAsin } from "@/lib/ausruestung/wanderschuhe";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { stand as seitenstand } from "@/lib/stand";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const PFAD = "/ausruestung/wanderschuhe";
const TITEL = "Wanderschuhe: Welche Kategorie du brauchst, was die Tests zeigen — und sechs Schuhe für Damen und Herren";

export const metadata: Metadata = {
  title: titel("Wanderschuhe Test: Damen, Herren, Kategorien im Vergleich"),
  description: beschreibung(
    "Welche Wanderschuh-Kategorie zu deinem Gelände passt, was Stiftung Warentest und Que choisir über Dichtigkeit fanden, Anprobe, breite Füße, PFAS — mit Kategorie-Berater und sechs Schuhen.",
  ),
  alternates: { canonical: PFAD },
};

const KAPITEL: [string, string][] = [
  ["berater", "Welche Kategorie brauchst du?"],
  ["test", "Wanderschuhe im Test"],
  ["wasserdicht", "Wasserdicht — mit Einschränkung"],
  ["schaft", "Halbschuh oder halbhoher Schaft"],
  ["passform", "Die Anprobe entscheidet"],
  ["breite", "Breite Füße"],
  ["pfas", "PFAS: Was sich gerade ändert"],
  ["pflege", "Pflege und Nachimprägnieren"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Schuhe einzeln"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  xultra: "Leicht, Testsieger",
  litetrail: "Leicht und am dichtesten",
  peakfreak: "Bequem für trockene Tage",
  renegade: "Unsere erste Wahl",
  moab: "Für breitere Füße",
  island: "Für alpines Gelände",
};

const extern = "underline hover:text-accent";

export default async function Wanderschuhe() {
  const datum = seitenstand("/ausruestung/wanderschuhe");
  if (!sichtbar(PFAD)) notFound();

  const asins = SCHUHE.flatMap((s) => [s.herren, s.damen].filter((x): x is string => Boolean(x)));
  const p = await preise(asins);
  const PRODUKTE = SCHUHE.map(alsProdukt);
  const erste = PRODUKTE.find((x) => x.asin === hauptAsin(SCHUHE[3]))!;
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
  const angebot = (asin?: string) => (asin ? { url: urlVon(asin), anzeige: p.get(asin)?.anzeige ?? null } : null);

  const angebote: Record<string, SchuhAngebot> = Object.fromEntries(
    SCHUHE.map((s) => [
      s.key,
      { key: s.key, name: `${s.marke} ${s.name}`, kategorie: s.kategorie, herren: angebot(s.herren), damen: angebot(s.damen) },
    ]),
  );
  const impraegnieren = sichtbar("/ausruestung/schuhe-impraegnieren");
  const socken = sichtbar("/ausruestung/wandersocken");

  const passformen = (s: (typeof SCHUHE)[number]) =>
    (
      [
        ["Herren", s.herren],
        ["Damen", s.damen],
      ] as [string, string | undefined][]
    ).filter((x): x is [string, string] => Boolean(x[1]));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}${PFAD}`,
            inLanguage: "de-DE",
            ...(datum.veroeffentlicht ? { datePublished: datum.veroeffentlicht } : {}),
            ...(datum.geaendert ? { dateModified: datum.geaendert } : {}),
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
        aktuell="Wanderschuhe"
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
          Der beste Schuh im Test wurde im nassen Gras nach 15 Minuten feucht. Der Zweitplatzierte
          nach zehn. Das ist keine Schande, sondern der Unterschied zwischen Labor und Prospekt — und
          der Grund, warum die Frage nicht „welcher Schuh“ lautet, sondern „welche Kategorie, für
          welches Gelände“.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${SCHUHE.length} Schuhe verglichen`, "Kategorie-Berater", "Damen und Herren", "Zwei Tests ausgewertet"].map((t) => (
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
          nichts. Schuhe haben bei Amazon je Größe und Farbe einen eigenen Eintrag — verlinkt ist
          eine Variante, der Preis kann bei anderen Größen abweichen.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Kategorie"
            zeilen={PRODUKTE.map((s, i) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[SCHUHE[i].key],
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
      <Kapitel
        id="berater"
        titel="Welche Kategorie brauchst du?"
        unterzeile="Der Alpenverein teilt Wanderschuhe in vier Stufen — danach richtet sich alles Weitere."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Der{" "}
            <a href={QUELLEN.davOutfit} className={extern} rel="noopener" target="_blank">
              Deutsche Alpenverein
            </a>{" "}
            unterscheidet leichte Schuhe für kürzere Wanderungen und Trailrunning (Kategorie A),
            klassische Wanderstiefel (B), Schuhe für alpines Gelände (C) und feste Bergstiefel für
            extreme Touren (D). Ab Kategorie B sollten die Schuhe einen hohen Schaft und eine
            mehrzonige Schnürung haben.
          </p>
          <p>
            Die Kategorie folgt dem Gelände — und dem Gewicht auf dem Rücken, denn beides muss die
            Sohle tragen:
          </p>
        </div>
        <Schuhberater angebote={angebote} />
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {(Object.keys(KATEGORIE_TEXT) as (keyof typeof KATEGORIE_TEXT)[]).map((k) => (
            <div key={k} className="rounded-xl border border-line bg-card p-4">
              <dt className="font-semibold">Kategorie {k}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{KATEGORIE_TEXT[k]}</dd>
            </div>
          ))}
        </dl>
        <p className="max-w-3xl text-sm text-muted">
          Kategorie D steht für feste Bergstiefel für extreme Touren — Steigeisen, Hochtour,
          Expedition. Solche Schuhe kauft man nicht nach einem Vergleich im Netz, sondern nach
          Beratung im Fachgeschäft; deshalb fehlen sie hier.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="test" titel="Wanderschuhe im Test" unterzeile="Zwei Tests, zwei verschiedene Bilder.">
        <p>
          Die{" "}
          <a href={QUELLEN.warentestSchuhe} className={extern} rel="noopener" target="_blank">
            Stiftung Warentest
          </a>{" "}
          hat 2022 zehn Wanderschuhe zwischen rund 130 und 270 Euro geprüft, jeweils in der Damen-
          und der Herrenausführung, darunter Modelle von Lowa, Meindl, Salewa und Jack Wolfskin. Die
          Urteile reichten von sehr gut bis ausreichend; zwei Schuhe waren sehr gut. Geprüft wurde im
          Wasserbad auf Dichtigkeit, an den Schnürhaken wurde gezogen, bis sie rissen, dazu
          Abriebfestigkeit des Futters und ein Alterungstest der Sohle. Die Einzelnoten stehen hinter
          der Bezahlschranke.
        </p>
        <p>
          Frei lesbar ist dagegen der{" "}
          <a href={QUELLEN.warentestLeicht} className={extern} rel="noopener" target="_blank">
            Bericht über den Test leichter Wanderschuhe
          </a>{" "}
          der französischen Verbraucherzeitschrift Que choisir — mit Namen und Zahlen:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Salomon X Ultra 4 GTX:</strong> Testsieger. Guter Halt, bequem, blieb beim
            Durchqueren eines Bachs trocken — im Labor nach 15 Minuten in hohem Gras feucht.
          </li>
          <li>
            <strong>Columbia Peakfreak 2:</strong> Platz zwei, bequem und atmungsaktiv, Sohle mit
            hervorragendem Halt auf nassem Untergrund. Feuchte Füße nach zehn Minuten.
          </li>
          <li>
            <strong>Meindl Lite Trail GTX:</strong> ließ von allen am wenigsten Wasser durch.
          </li>
          <li>
            <strong>Hoka Speedgoat 6 GTX und Merrell Moab Speed 2 GTX:</strong> waren ebenfalls
            schnell undicht.
          </li>
        </ul>
        <Merksatz>
          Beide Tests prüfen dieselbe Sache unterschiedlich streng. Im Gelände blieben die Schuhe
          dicht, im Labor nicht — wer viel im Morgentau läuft, sollte die Laborwerte ernster nehmen
          als das Prospekt.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="wasserdicht" titel="Wasserdicht — mit Einschränkung" breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Im Praxistest dicht",
              text: "Bei Que choisir blieben die Füße selbst beim Durchqueren eines kleinen Bachs trocken. Auch im Warentest-Feld hielten bei einer mehrstündigen Wanderung samt Bachdurchquerung alle Schuhe dicht.",
            },
            {
              titel: "Im Labor früher nass",
              text: "Die Simulation einer Wanderung durch hohes, nasses Gras brachte schon nach zehn bis fünfzehn Minuten Feuchtigkeit durch den Stoff. Im Wasserbad der Stiftung Warentest blieben manche Schuhe sechs Stunden trocken, andere waren weit früher durchfeuchtet.",
            },
            {
              titel: "Was das heißt",
              text: "Unterschiede in der Fertigung schlagen durch, nicht nur im Modell. Die Membran sitzt tief im Schuh — nass wird zuerst das Obermaterial, und über die Naht am Schaft läuft das Wasser hinein.",
            },
          ]}
        />
        <p className="max-w-3xl">
          Gegen nasses Gras hilft kein Schuh allein. Was hilft, sind Gamaschen, die den Übergang
          zwischen Hose und Schaft schließen
          {sichtbar("/ausruestung/gamaschen") ? (
            <>
              {" "}— mehr dazu im{" "}
              <Link href="/ausruestung/gamaschen" className={extern}>
                Gamaschen-Vergleich
              </Link>
            </>
          ) : null}
          .
        </p>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="schaft" titel="Halbschuh oder halbhoher Schaft">
        <p>
          Leichte Wanderschuhe mit freiem Knöchel haben meist eine flexiblere Sohle, sind weicher und
          bequemer. Sie stabilisieren den Knöchel aber nicht, und ihre Sohle dämpft Stöße beim
          Auftreten schwächer ab — deshalb ordnet die Stiftung Warentest sie kurzen Wanderungen und
          Tagestouren in einfachem Gelände zu.
        </p>
        <p>
          Der halbhohe Schaft führt den Knöchel auf unebenem Boden und nimmt einen Teil der Last ab,
          wenn der Rucksack schwer ist. Er kostet Gewicht und Beweglichkeit. Wer im Mittelgebirge
          über Wurzeln und Steine geht, fährt damit besser; wer auf Forststraßen bleibt, trägt es
          umsonst.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="passform" titel="Die Anprobe entscheidet" unterzeile="Kein Testergebnis ersetzt den eigenen Fuß.">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Nachmittags oder abends anprobieren.</strong> Die Füße schwellen über den Tag an.
            Beide Quellen sagen dasselbe: Der DAV rät zur Anprobe am Nachmittag, die Stiftung
            Warentest zum Probetragen am Abend.
          </li>
          <li>
            <strong>Die eigenen Wandersocken mitbringen.</strong> Sauber, versteht sich — sie
            schaffen die realistische Tragesituation
            {socken ? (
              <>
                {" "}
                (<Link href="/ausruestung/wandersocken" className={extern}>welche passen</Link>)
              </>
            ) : null}
            . Einlagen gehören ebenfalls mit in den Laden.
          </li>
          <li>
            <strong>Im Laden gehen, nicht sitzen.</strong> Fest schnüren, herumlaufen, auf Stühle und
            Treppenstufen steigen, wippen und hüpfen — so beschreibt es der DAV. Manche Läden haben
            Teststrecken.
          </li>
          <li>
            <strong>Einlaufen.</strong> Vor der ersten größeren Tour mehrere Stunden tragen, auch zu
            Hause.
          </li>
          <li>
            <strong>Einlegesohlen prüfen.</strong> Mitgelieferte Sohlen sind laut Que choisir oft zu
            flach; Modelle mit mehr Spannung stützen das Fußgewölbe besser.
          </li>
        </ol>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="breite" titel="Breite Füße">
        <p>
          Die Testpersonen bei Que choisir bewerteten den Tragekomfort derselben Schuhe sehr
          unterschiedlich — manche Modelle fallen schmal aus, andere besonders breit. Das ist kein
          Mangel der Schuhe, sondern der Grund, warum zwei Menschen mit derselben Größe verschiedene
          Modelle brauchen.
        </p>
        <p>
          Lowa weist für den Renegade einen Leisten für mittelbreite Füße aus. Meindl führt von
          mehreren Modellen eigene Weitvarianten, etwa den Island als Wide. Amerikanische Marken wie
          Merrell gelten als breiter geschnitten. Wer am Ballen Druckstellen bekommt, probiert diese
          Richtung, bevor er eine Nummer größer kauft — ein zu großer Schuh lässt die Ferse rutschen,
          und das gibt Blasen.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="pfas" titel="PFAS: Was sich gerade ändert">
        <p>
          Que choisir fand in der Hälfte der geprüften Schuhe per- und polyfluorierte
          Alkylsubstanzen. Sie machen Material wasserabweisend, bauen sich in der Umwelt aber kaum ab
          — daher der Name Ewigkeitschemikalien. Für einige sind gesundheitliche Risiken belegt, für
          viele steht die Bewertung aus.
        </p>
        <p>
          Laut Stiftung Warentest treten in der EU ab Oktober 2026 schrittweise Verbote für PFAS in
          Schuhen und Textilien in Kraft. Das heißt nicht, dass Schuhe im Regal von heute auf morgen
          anders sind — aber die Richtung ist gesetzt.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Pflege und Nachimprägnieren">
        <p>
          Die Imprägnierung des Obermaterials ist Verschleißteil: Sie geht durch Abrieb und Waschen
          verloren, und ein vollgesogenes Obermaterial macht den Schuh schwer und kalt, auch wenn die
          Membran hält. Der DAV rät, Bergschuhe regelmäßig nachzuimprägnieren und dabei ein Mittel
          ohne Fluorkarbone zu wählen.
          {impraegnieren ? (
            <>
              {" "}Welches Mittel zu welchem Leder passt, steht in unserem Ratgeber{" "}
              <Link href="/ausruestung/schuhe-impraegnieren" className={extern}>
                Schuhe imprägnieren
              </Link>
              .
            </>
          ) : null}
        </p>
        <p>
          Auch bei gutem Schuhwerk löst sich irgendwann die Sohle, schreibt die Stiftung Warentest.
          Einige Modelle lassen sich wiederbesohlen — das ist der Unterschied zwischen einem Schuh
          für fünf Jahre und einem für fünfzehn.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[60rem] text-sm">
            <caption className="sr-only">Wanderschuhe im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {SCHUHE.map((s) => (
                  <th key={s.key} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${hauptAsin(s)}`} className="block hover:text-accent">
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
                  ["Kategorie", (s) => s.kategorie],
                  ["Schaft", (s) => (s.schaft === "Halbschuh" ? "Halbschuh" : "halbhoch")],
                  ["Membran", (s) => s.membran],
                  ["Obermaterial", (s) => s.obermaterial],
                  ["Gewicht", (s) => s.gewicht ?? <span className="text-muted">k. A.</span>],
                  ["Passform", (s) => s.passform],
                  ["Im Test", (s) => s.test ?? <span className="text-muted">nicht geprüft</span>],
                  [
                    "Angebot",
                    (s) => (
                      <div className="flex flex-col gap-1.5">
                        {passformen(s).map(([k, asin]) => (
                          <a
                            key={asin}
                            href={urlVon(asin)}
                            rel="sponsored nofollow noopener"
                            target="_blank"
                            className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                          >
                            {k} · {preisVon(asin)} <span aria-hidden>→</span>
                            <span className="sr-only"> {s.marke} {s.name} bei Amazon, Anzeige</span>
                          </a>
                        ))}
                      </div>
                    ),
                  ],
                ] as [string, (s: (typeof SCHUHE)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {SCHUHE.map((s) => (
                    <td key={s.key} className="px-3 py-3 leading-snug">{f(s)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Kategorien nach der Einteilung des DAV, zugeordnet von uns; technische Angaben aus den
          Herstellertexten. „k. A.“: nicht angegeben. Die Preise gelten für die verlinkte Größe und
          Farbe. Stand {zeitVon(erste.asin)} Uhr. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Schuhe einzeln" unterzeile="Zu jedem steht, wogegen er spricht und wer ihn nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Für die meisten Touren in Deutschland ist Kategorie B die richtige Wahl: halbhoher Schaft,
          Gore-Tex, Leder — und ein Leisten, den Lowa für mittelbreite Füße ausweist. Der Renegade
          deckt Tagestour, Fernwanderweg und Mehrtagestour ab, ohne in einer davon zu stören.
        </p>
        <p className="mt-2 text-muted">
          Wenn du auf Wegen bleibst und leicht unterwegs sein willst: der{" "}
          <a href={`#${hauptAsin(SCHUHE[1])}`} className="underline hover:text-accent">Meindl Lite Trail</a>, der
          im Test am wenigsten Wasser durchließ.
        </p>
      </Entscheidung>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
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

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Die Kategorien und die Hinweise zur Anprobe stammen vom Deutschen Alpenverein, die
          Testergebnisse von der Stiftung Warentest und aus ihrem Bericht über den Test der
          französischen Que choisir. Technische Angaben kommen aus den Herstellertexten; wo etwas
          fehlt, steht „k. A.“ statt einer Zahl aus zweiter Hand. Welche Kategorie wir einem Schuh
          zuordnen, ist unsere Einschätzung anhand von Schaft, Sohle und Herstellerangabe.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Stiftung Warentest,{" "}
            <a href={QUELLEN.warentestSchuhe} className={extern} rel="noopener" target="_blank">
              Wanderschuhe im Test
            </a>{" "}
            (10/2022) und{" "}
            <a href={QUELLEN.warentestLeicht} className={extern} rel="noopener" target="_blank">
              Leichte Wanderschuhe im Test: Hohes Gras ist der Endgegner
            </a>{" "}
            (Bericht über den Test von Que choisir).
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.davSchuhe} className={extern} rel="noopener" target="_blank">
              Tipps für die Wahl von Wanderschuhen
            </a>{" "}
            und{" "}
            <a href={QUELLEN.davOutfit} className={extern} rel="noopener" target="_blank">
              Das richtige Wanderoutfit
            </a>
          </li>
          <li>Technische Angaben: Herstellerangaben aus dem jeweiligen Amazon-Angebot.</li>
          <li>Preise und Bilder: Amazon, stündlich abgerufen. {PREISHINWEIS}</li>
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
          {socken && (
            <li>
              <Link href="/ausruestung/wandersocken" className="font-medium hover:text-accent">Wandersocken im Vergleich</Link>
              <p className="text-sm text-muted">Gehören zur Anprobe dazu.</p>
            </li>
          )}
          {impraegnieren && (
            <li>
              <Link href="/ausruestung/schuhe-impraegnieren" className="font-medium hover:text-accent">Schuhe imprägnieren</Link>
              <p className="text-sm text-muted">Wachs oder Spray, je nach Leder.</p>
            </li>
          )}
          <li>
            <Link href="/ausruestung/gamaschen" className="font-medium hover:text-accent">Gamaschen im Vergleich</Link>
            <p className="text-sm text-muted">Gegen nasses Gras hilft nur der Übergang.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
