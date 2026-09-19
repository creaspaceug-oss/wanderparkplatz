import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Affiliatelink from "@/components/Affiliatelink";
import Dunkelrechner, { type LampeLeuchtdauer } from "@/components/ausruestung/Dunkelrechner";
import Merkleiste from "@/components/ausruestung/Merkleiste";
import Vorladen from "@/components/ausruestung/Vorladen";
import {
  Kapitel,
  Merksatz,
  Inhalt,
  Uebersicht,
  Entscheidung,
  Produktbericht,
  Produktbild,
  Kartenraster,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import { STIRNLAMPEN, NOTFALL, FRAGEN, QUELLEN, alsProdukt } from "@/lib/ausruestung/stirnlampen";
import { beleuchtung } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Stirnlampe zum Wandern: Was Lumen wirklich sagen, wann es dunkel wird, welche hält";

export const metadata: Metadata = {
  title: titel("Stirnlampe Test: Wandern, Rotlicht, Akku — sieben im Vergleich"),
  description: beschreibung(
    "Was Lumen, Leuchtweite und Leuchtdauer wirklich bedeuten, was die Tests fanden, Rotlicht, Akku oder Batterie — und sieben Stirnlampen von Petzl bis Ledlenser mit ihren Schwächen.",
  ),
  alternates: { canonical: "/ausruestung/stirnlampe" },
};

const KAPITEL: [string, string][] = [
  ["zahlen", "Lumen, Leuchtweite, Leuchtdauer"],
  ["dunkel", "Wann wird es auf deiner Tour dunkel?"],
  ["test", "Stirnlampen im Test"],
  ["rotlicht", "Stirnlampe mit Rotlicht"],
  ["akku", "Akku, Batterie oder beides"],
  ["wasser", "IPX4, IP67, IP68"],
  ["sitz", "Gewicht und Sitz"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Stirnlampen einzeln"],
  ["joggen", "Stirnlampe zum Joggen"],
  ["notfall", "Die Lampe für den Notfall"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  B0FDM3F43J: "Unsere erste Wahl",
  B09NQK3P4K: "Wasserdicht mit Akku",
  B0FHJMGRXK: "Für die Wegsuche",
  B0CF9T15JY: "Die robusteste",
  B0F1KKYNR7: "Die leichteste",
  B0CKJ2HTJD: "Zum Laufen",
  B09G6M8JLK: "Zweitlampe fürs Auto",
};

export default async function Stirnlampe() {
  const [p, licht] = await Promise.all([preise([...STIRNLAMPEN.map((s) => s.asin), NOTFALL.asin]), beleuchtung()]);
  const PRODUKTE = STIRNLAMPEN.map(alsProdukt);
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
  const jetzt = new Date();
  const stand = jetzt.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const monat = Number(jetzt.toLocaleDateString("de-DE", { month: "numeric", timeZone: "Europe/Berlin" })) - 1;
  const preisVon = (asin: string) => p.get(asin)?.anzeige ?? "—";
  const urlVon = (asin: string) => p.get(asin)?.url ?? partnerUrl(asin);

  const lampen: LampeLeuchtdauer[] = STIRNLAMPEN.filter((s) => s.mitte?.h).map((s) => ({
    name: `${s.marke} ${s.name}`,
    lm: s.mitte!.lm,
    h: s.mitte!.h!,
    url: urlVon(s.asin),
    anzeige: p.get(s.asin)?.anzeige ?? null,
  }));
  const np = p.get(NOTFALL.asin);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/stirnlampe`,
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
        aktuell="Stirnlampe"
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
          Die meisten Stirnlampen werden über ihren Höchstwert verkauft: 400, 800, 2000 Lumen. Auf
          dem Rückweg zum Parkplatz zählt ein anderer Wert — wie lange die Lampe hell genug bleibt, um
          den Weg zu sehen. Im Test, über den die Stiftung Warentest zuletzt berichtete, hielten
          manche Lampen ihre volle Helligkeit zwei Minuten, die Petzl Tikka 37.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${STIRNLAMPEN.length} Stirnlampen verglichen`, "Dunkelheits-Rechner", "Testergebnisse", "Rotlicht, Akku, IP-Schutz"].map((t) => (
            <li key={t} className="rounded-full border border-line bg-card px-3 py-1">
              {t}
            </li>
          ))}
        </ul>
      </header>

      {/* ─────────────────────────── Übersicht ─────────────────────────── */}
      <section id="uebersicht" className="mt-8 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Alle sieben auf einen Blick</h2>
          <a href="#modelle" className="text-sm text-muted underline hover:text-accent">
            Zu den ausführlichen Einschätzungen
          </a>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">Anzeige:</strong> Bilder, Namen und grüne Knöpfe
          führen zu Amazon und tragen eine Partnerkennung. {PARTNER} Für dich ändert sich am Preis
          nichts. Die Spalte zeigt die Leuchtdauer auf der mittleren Stufe — den Wert, mit dem man
          tatsächlich geht.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Mittlere Stufe"
            kennwertLeer="nicht angegeben"
            zeilen={PRODUKTE.map((s) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[s.asin],
              url: partnerUrl(s.asin),
            }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{PREISHINWEIS} Leuchtwerte laut Hersteller nach ANSI/PLATO FL 1.</p>
      </section>

      <div className="mt-12">
        <Inhalt eintraege={KAPITEL} />
      </div>

      {/* ─────────────────────────── 1 ─────────────────────────── */}
      <Kapitel id="zahlen" titel="Lumen, Leuchtweite, Leuchtdauer" unterzeile="Drei Zahlen auf jeder Packung — und was sie verschweigen." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Die meisten Markenhersteller messen nach dem amerikanischen Standard ANSI/PLATO FL 1.
            Petzl erklärt das Verfahren offen, und wer es kennt, liest die Packung anders:
          </p>
        </div>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Lumen",
              text: "Gemessen 30 bis 120 Sekunden nach dem Einschalten, mit frischen Batterien. Der Höchstwert ist also der Wert der ersten zwei Minuten — nicht der Wert, mit dem die Lampe eine Stunde später noch leuchtet.",
            },
            {
              titel: "Leuchtweite",
              text: "Die Entfernung, bis zu der noch 0,25 Lux ankommen — etwa so viel wie bei Vollmond. Sie hängt weniger an den Lumen als an der Form des Lichtkegels: Ein gebündelter Strahl reicht weiter, ein breiter leuchtet den Weg vor den Füßen besser aus.",
            },
            {
              titel: "Leuchtdauer",
              text: "Die Zeit, bis die Lampe auf 10 Prozent ihrer Anfangsleistung gefallen ist. „12 Stunden“ heißt: nach 12 Stunden noch ein Zehntel so hell wie am Anfang — nicht 12 Stunden gleich hell.",
            },
          ]}
        />
        <div className="max-w-3xl space-y-5">
          <p>
            Wie groß der Unterschied in der Praxis ist, zeigte der Test der Schweizer Zeitschrift
            K-Tipp. Nach einer Viertelstunde Laden hielten zwei Lampen ihre volle Helligkeit nur
            zwei Minuten und drosselten dann, um Akku zu sparen. Die Petzl Tikka schaffte 37 Minuten.
          </p>
          <Merksatz>
            Vergleiche die mittlere Stufe, nicht den Höchstwert. Mit 100 bis 200 Lumen geht es sich
            auf einem Wanderweg gut — und dort entscheidet sich, ob die Lampe bis zum Parkplatz hält.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel
        id="dunkel"
        titel="Wann wird es auf deiner Tour dunkel?"
        unterzeile="Im Dezember geht die Sonne in Kassel kurz nach vier unter. Viele Touren enden später."
        breit
      >
        <p className="max-w-3xl">
          Die Stirnlampe braucht man selten für den Aufstieg, aber oft für das letzte Stück. Der
          Rechner zeigt für deine Tour, wann es dunkel wird, und welche Lampen aus diesem Vergleich
          lange genug halten:
        </p>
        <Dunkelrechner lampen={lampen} zeit={zeitVon(erste.asin)} monatStart={monat} />
        <div className="max-w-3xl space-y-5">
          <p>
            Und am Parkplatz selbst? Von {nf.format(licht.gesamt)} Wanderparkplätzen in unserem
            Verzeichnis ist nur an <strong>{nf.format(licht.ja)}</strong> in OpenStreetMap eine
            Beleuchtung eingetragen. An {nf.format(licht.nein)} steht ausdrücklich, dass es keine gibt,
            beim Rest weiß es niemand — was bei einem Waldparkplatz meist heißt: kein Licht. Wer im
            Dunkeln ankommt, sucht Auto, Schlüssel und Weg zum Wagen mit der Lampe.
          </p>
          <Merksatz>
            Die Lampe gehört in den Rucksack, nicht ins Auto. Am Auto braucht man sie erst, wenn man
            schon da ist.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="test" titel="Stirnlampen im Test" unterzeile="Die Stiftung Warentest hat über zwei Tests ausländischer Partner berichtet." breit>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-5">
            <p className="text-sm font-semibold text-accent">K-Tipp, Schweiz · Bericht vom 25.11.2021</p>
            <h3 className="mt-1 font-semibold">10 Stirnlampen, 7 überzeugten</h3>
            <ul className="mt-3 space-y-1.5 text-[0.97rem] leading-relaxed text-muted">
              <li><strong className="text-foreground">1. Decathlon Forclaz Trek 500 USB</strong> — günstig, damals rund 20 Euro</li>
              <li><strong className="text-foreground">2. Petzl Tikka</strong> — 37 Minuten volle Helligkeit, aber Feuchtigkeit im Tauchtest</li>
              <li><strong className="text-foreground">Ledlenser SE07R</strong> — bestes Licht</li>
              <li><strong className="text-foreground">Ansmann HD250RS, Varta H30R</strong> — volle Helligkeit nur zwei Minuten, Ansmann über fünf Stunden Ladezeit</li>
              <li><strong className="text-foreground">Letzte: Knog Quokka Run</strong> — zu schwach, Winkel nicht verstellbar</li>
            </ul>
            <a href={QUELLEN.warentest2021} className="mt-3 inline-block text-sm underline hover:text-accent" rel="noopener" target="_blank">
              Bericht bei test.de
            </a>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <p className="text-sm font-semibold text-accent">Råd & Rön, Schweden · Bericht vom 23.10.2014</p>
            <h3 className="mt-1 font-semibold">10 Stirnlampen, geprüft auf Helligkeit, Haltbarkeit, Verbrauch</h3>
            <ul className="mt-3 space-y-1.5 text-[0.97rem] leading-relaxed text-muted">
              <li><strong className="text-foreground">1. Silva Trail Runner II</strong> — vor allem im Praxistest</li>
              <li><strong className="text-foreground">2. Petzl Tikka XP</strong></li>
              <li><strong className="text-foreground">3. Ledlenser Seo 5</strong> — die hellste</li>
              <li><strong className="text-foreground">Preis-Leistung: Black Diamond Cosmo</strong></li>
            </ul>
            <a href={QUELLEN.warentest2014} className="mt-3 inline-block text-sm underline hover:text-accent" rel="noopener" target="_blank">
              Bericht bei test.de
            </a>
          </div>
        </div>
        <div className="max-w-3xl space-y-5">
          <p>
            Die Modelle sind inzwischen meist überarbeitet, die Marken aber dieselben geblieben: Petzl
            war in beiden Tests vorn, Ledlenser hatte beide Male das hellste Licht. Den Testsieger
            von 2021 verkauft Decathlon nur selbst — bei Amazon haben wir ihn nicht gefunden.
          </p>
          <p>
            Einen eigenen Stirnlampentest der Stiftung Warentest mit Noten gibt es in jüngerer Zeit
            nicht. Wer „Stirnlampe Test Stiftung Warentest“ sucht, landet bei diesen beiden Berichten.
          </p>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="rotlicht" titel="Stirnlampe mit Rotlicht" unterzeile="Kein Spielzeug, sondern das Licht, das man in der Hütte am häufigsten braucht.">
        <p>
          Rotes Dauerlicht erhält die Anpassung der Augen an die Dunkelheit und blendet andere nicht,
          schreibt Petzl. Das zählt in drei Situationen: im Hüttenlager, wenn die anderen schlafen;
          am Rastplatz, wenn man sich gegenseitig ins Gesicht leuchtet; und beim Blick auf Karte oder
          Handy, nach dem man sonst eine Minute lang nichts mehr sieht.
        </p>
        <p>
          Rotes Blinklicht ist etwas anderes: ein Signal, um im Notfall gesehen zu werden. Petzl gibt
          für die Tikka eine Sichtbarkeit von 700 Metern an. Alle Lampen in diesem Vergleich haben
          Rotlicht; bei der Silva sitzt es als Rücklicht am Hinterkopf.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="akku" titel="Akku, Batterie oder beides" unterzeile="Die Frage entscheidet sich an der Steckdose.">
        <p>
          Ein fester Akku ist bequem und günstig im Betrieb — solange man abends laden kann. Ist er
          auf einer Hüttentour leer, hilft keine Batterie. Batterien bekommt man überall und wechselt
          sie in Sekunden, aber sie kosten auf Dauer mehr und landen im Müll.
        </p>
        <p>
          Am flexibelsten sind Hybridlampen. Die Petzl Tikka und die Actik Core laufen mit dem
          Core-Akku oder mit drei AAA-Batterien, und Petzl schreibt, die Lampe erkenne die Quelle und
          passe die Leistung an. Die Silva Trail Runner Free 2 nimmt AAA-Batterien oder einen
          Hybridakku von Silva.
        </p>
        <p>
          Und Kälte: Silva legt der Trail Runner ein Verlängerungskabel bei, damit man das
          Batteriefach bei Kälte unter der Jacke tragen kann. Im Winter gehört der Ersatz — ob
          Batterien oder Powerbank — nah an den Körper, nicht in die Deckeltasche.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="wasser" titel="IPX4, IP67, IP68" unterzeile="Die Schutzart sagt, wie viel Wasser die Lampe verträgt." breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "IPX4 — spritzwassergeschützt",
              text: "Regen ja, untertauchen nein. Petzl nennt das „wetterfest“. Im K-Tipp-Test drang bei der Tikka unter Wasser Feuchtigkeit ein — genau das deckt IPX4 nicht ab.",
            },
            {
              titel: "IPX5, IP66 — Strahlwasser",
              text: "Hält Wasser aus, das aus einer Düse kommt. Silva und Nitecore geben das an. Für jedes Wetter mehr als genug.",
            },
            {
              titel: "IP67, IP68 — untertauchbar",
              text: "IP67 heißt laut den Herstellern hier: eine halbe Stunde in einem Meter Tiefe. IP68 geht darüber hinaus. Black Diamond Spot und Ledlenser HF6R.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="sitz" titel="Gewicht und Sitz">
        <p>
          Die Lampen hier wiegen zwischen 47 und 126 Gramm. Auf dem Kopf spürt man den Unterschied
          nach einer Stunde, im Rucksack kaum. Wichtiger als das Gewicht ist, dass nichts drückt:
          Die Stiftung Warentest rät, den Tragekomfort möglichst im Laden auszuprobieren — das
          Stirnband darf nicht drücken, muss aber beim Laufen fest genug sitzen, damit der
          Lichtkegel nicht springt.
        </p>
        <p>
          Lampen mit Batteriefach am Hinterkopf wie die Silva verteilen das Gewicht und springen
          weniger, stören aber beim Liegen. Wer die Lampe auch im Hüttenlager trägt, nimmt eine
          kompakte Lampe ohne Hinterkopfteil.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[56rem] text-sm">
            <caption className="sr-only">Stirnlampen im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-32 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {STIRNLAMPEN.map((s) => (
                  <th key={s.asin} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${s.asin}`} className="block hover:text-accent">
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
                  ["Preis", (s) => <strong className="tabular-nums">{preisVon(s.asin)}</strong>],
                  ["Maximal", (s) => (s.max ? `${s.max.lm} lm${s.max.m ? ` · ${s.max.m} m` : ""}` : <span className="text-muted">k. A.</span>)],
                  ["Mittlere Stufe", (s) => (s.mitte ? `${s.mitte.lm} lm · ${s.mitte.h} h` : <span className="text-muted">k. A.</span>)],
                  ["Gewicht", (s) => (s.gramm ? `${s.gramm} g` : <span className="text-muted">k. A.</span>)],
                  ["Schutz", (s) => s.schutz],
                  ["Energie", (s) => s.energie],
                  ["Rotlicht", (s) => s.rot],
                  ["Test", (s) => s.test ?? <span className="text-muted">—</span>],
                  [
                    "Angebot",
                    (s) => (
                      <a
                        href={urlVon(s.asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(s.asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {s.marke} {s.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (s: (typeof STIRNLAMPEN)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {STIRNLAMPEN.map((s) => (
                    <td key={s.asin} className="px-3 py-3 leading-snug">{f(s)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Leuchtwerte nach ANSI/PLATO FL 1 laut Hersteller; bei Petzl die Werte der mitgelieferten
          Energiequelle. „k. A.“: vom Hersteller nicht veröffentlicht. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Stirnlampen einzeln" unterzeile="Zu jeder steht, wogegen sie spricht und wer sie nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="joggen" titel="Stirnlampe zum Joggen" unterzeile="Was beim Laufen anders ist als beim Gehen.">
        <p>
          Beim Laufen springt der Kopf bei jedem Schritt. Eine Lampe, die beim Gehen ruhig sitzt,
          wackelt beim Joggen, und der Lichtkegel tanzt. Deshalb zählen hier zwei Dinge mehr als
          beim Wandern: ein fester Sitz und wenig Gewicht vorn.
        </p>
        <p>
          Die <a href="#B0CKJ2HTJD" className="underline hover:text-accent">Silva Trail Runner Free 2</a>{" "}
          ist dafür gebaut: Batteriefach am Hinterkopf, Kabel im Band, rotes Rücklicht für Autos auf
          der Straße. Ihr Vorgänger gewann 2014 den schwedischen Test. Wer es noch leichter will,
          nimmt die <a href="#B0F1KKYNR7" className="underline hover:text-accent">Nitecore NU25</a> mit 47
          Gramm.
        </p>
        <p className="text-muted">
          Schneller unterwegs heißt auch: weiter vorausschauen. Beim Laufen ist mehr Leuchtweite
          sinnvoll als beim Gehen — Petzl weist darauf hin, dass das Reservelicht seiner Lampen zwar
          zum Gehen reicht, für schnelle Aktivitäten wie Laufen aber zu schwach sein kann.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="notfall" titel="Die Lampe für den Notfall" breit>
        <p className="max-w-3xl">
          Der Deutsche Alpenverein zählt eine Stirnlampe zur Ausrüstung für den Notfall: Ein Unfall
          kostet Zeit, und es wird schnell dunkel. Für Touren ohne Nachtaufbruch nennt er eine kleine
          Notfallstirnlampe ab etwa 30 Gramm. Und ohne Handyempfang ist die Lampe das Werkzeug für das{" "}
          <Link href="/ausruestung/erste-hilfe-set#notruf" className="underline hover:text-accent">
            alpine Notsignal
          </Link>
          : sechsmal pro Minute blinken, eine Minute Pause.
        </p>
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
          <Produktbild preis={np} alt={`${NOTFALL.marke} ${NOTFALL.name}`} href={partnerUrl(NOTFALL.asin)} />
          <div>
            <p className="text-sm font-semibold text-accent">Bleibt immer im Rucksack</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight">
              {NOTFALL.marke} {NOTFALL.name}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{NOTFALL.text}</p>
            <Affiliatelink url={urlVon(NOTFALL.asin)} preis={np} name={`${NOTFALL.marke} ${NOTFALL.name}`} knapp />
          </div>
        </div>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Im Test auf Platz zwei, mit der längsten vollen Helligkeit. 100 Lumen für 12 Stunden auf
          Batterien, die an jeder Tankstelle zu haben sind, und nachrüstbar mit Akku. Für Wanderungen,
          die in der Dämmerung enden, gibt es kaum etwas Vernünftigeres.
        </p>
        <p className="mt-2 text-muted">
          Wenn du bei jedem Wetter unterwegs bist, nimm die{" "}
          <a href="#B09NQK3P4K" className="underline hover:text-accent">Black Diamond Spot 400-R</a> — IP67
          und 200 Lumen für 8 Stunden.
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
          Die Leuchtwerte stammen von den Herstellern und sind, wo angegeben, nach ANSI/PLATO FL 1
          gemessen. Die Testergebnisse stammen aus zwei Berichten der Stiftung Warentest über Tests
          ihrer Partner. Die Sonnenzeiten im Rechner sind berechnet, die Zahlen zur Beleuchtung der
          Parkplätze kommen aus unserem eigenen Datenbestand.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Stiftung Warentest,{" "}
            <a href={QUELLEN.warentest2021} className="underline hover:text-accent" rel="noopener" target="_blank">
              Stirnlampen-Test: Gute Stirnlampen für Sport und Heimwerken
            </a>{" "}
            (25.11.2021, Test von K-Tipp) und{" "}
            <a href={QUELLEN.warentest2014} className="underline hover:text-accent" rel="noopener" target="_blank">
              Stirnleuchten im Test: Lichtblicke im Dunkeln
            </a>{" "}
            (23.10.2014, Test von Råd & Rön).
          </li>
          <li>
            Petzl,{" "}
            <a href={QUELLEN.ansi} className="underline hover:text-accent" rel="noopener" target="_blank">
              How is lighting performance measured with the ANSI/PLATO FL1 protocol?
            </a>
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.dav} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wie funktionieren Erste-Hilfe-Sets?
            </a>{" "}
            (Notfallstirnlampe) und{" "}
            <a href={QUELLEN.notruf} className="underline hover:text-accent" rel="noopener" target="_blank">
              Notruf
            </a>{" "}
            (alpines Notsignal).
          </li>
          <li>
            Sonnenuntergang und Dämmerung: berechnet nach den Näherungsformeln der NOAA für den 15. des
            Monats. Beleuchtung: eigener Datenbestand aus OpenStreetMap, {nf.format(licht.gesamt)} Wanderparkplätze —
            mehr dazu unter <Link href="/ueber-uns" className="underline hover:text-accent">Über uns</Link>.
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
            <Link href="/ausruestung/erste-hilfe-set" className="font-medium hover:text-accent">Erste-Hilfe-Set im Vergleich</Link>
            <p className="text-sm text-muted">Mit Notsignal und Rettungsdecke.</p>
          </li>
          <li>
            <Link href="/ausruestung/groedel" className="font-medium hover:text-accent">Grödel im Vergleich</Link>
            <p className="text-sm text-muted">Für den Rückweg über vereiste Wege.</p>
          </li>
          <li>
            <Link href="/ausruestung/huettenschlafsack" className="font-medium hover:text-accent">Hüttenschlafsack im Vergleich</Link>
            <p className="text-sm text-muted">Für die Nacht, in der man das Rotlicht braucht.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
