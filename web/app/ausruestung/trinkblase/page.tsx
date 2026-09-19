import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Affiliatelink from "@/components/Affiliatelink";
import Wasserrechner from "@/components/ausruestung/Wasserrechner";
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
  OeffnungenBild,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import {
  TRINKBLASEN,
  ZUBEHOER,
  ERSATZTEILE,
  FRAGEN,
  QUELLEN,
  LITER_JE_STUNDE,
  alsProdukt,
} from "@/lib/ausruestung/trinkblasen";
import { einkehrLuecke } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Trinkblase fürs Wandern: Größe, Öffnung, Reinigung";

export const metadata: Metadata = {
  title: titel(`${TITEL} — sechs im Vergleich`),
  description: beschreibung(
    "Welche Trinkblase, 2 oder 3 Liter, warum die Öffnung über die Reinigung entscheidet, wie du sie richtig reinigst und trocknest — und sechs Trinkblasen von Deuter bis CamelBak mit ihren Schwächen.",
  ),
  alternates: { canonical: "/ausruestung/trinkblase" },
};

const KAPITEL: [string, string][] = [
  ["brauchst-du", "Trinkblase oder Flasche?"],
  ["groesse", "1,5, 2 oder 3 Liter"],
  ["oeffnung", "Die Öffnung entscheidet"],
  ["schlauch", "Schlauch, Beißventil, Absperrung"],
  ["material", "Material und Geschmack"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Blasen einzeln"],
  ["reinigen", "Reinigen, trocknen, lagern"],
  ["ersatzteile", "Ersatzteile: Mundstück und Schlauch"],
  ["rucksack", "Welcher Rucksack passt"],
  ["winter", "Im Winter"],
  ["nachfuellen", "Unterwegs nachfüllen"],
  ["nichts", "Wann eine Blase nichts bringt"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  B0D5R98FL3: "Unsere erste Wahl",
  B0BWLZP54Y: "Wenn jedes Gramm zählt",
  B07MR7SS8X: "Wenn sie schon einmal verschimmelt ist",
  B07KWDYZJT: "Für Handschuhe und viel Durchfluss",
  B0BRBRBXV9: "Für schmale Rucksäcke",
  B0CJ9CML66: "Zum Ausprobieren",
};

export default async function Trinkblase() {
  const [p, einkehr] = await Promise.all([
    preise([
      ...new Set([
        ...TRINKBLASEN.flatMap((t) => [t.asin, ...(t.groessen ?? []).map((g) => g.asin)]),
        ...ERSATZTEILE.map((e) => e.asin),
        ZUBEHOER.isolierung.asin,
        ZUBEHOER.reinigung.asin,
      ]),
    ]),
    einkehrLuecke(),
  ]);
  const PRODUKTE = TRINKBLASEN.map(alsProdukt);
  const deuter = PRODUKTE.find((t) => t.asin === "B0D5R98FL3")!;
  const dp = p.get(deuter.asin);
  const zeitDeuter = dp?.abgerufen
    ? new Date(dp.abgerufen).toLocaleString("de-DE", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
      })
    : null;
  const stand = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const preisVon = (asin: string) => p.get(asin)?.anzeige ?? "—";
  const zeitVon = (asin: string) => {
    const a = p.get(asin)?.abgerufen;
    return a
      ? new Date(a).toLocaleString("de-DE", {
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin",
        })
      : null;
  };
  const MIT_GROESSEN = TRINKBLASEN.filter((t) => t.groessen?.length);
  const deuterGroessen = Object.fromEntries(
    (TRINKBLASEN.find((t) => t.asin === "B0D5R98FL3")?.groessen ?? []).map((g) => [
      String(g.liter),
      { url: p.get(g.asin)?.url ?? partnerUrl(g.asin), anzeige: p.get(g.asin)?.anzeige ?? null, zeit: zeitVon(g.asin) },
    ]),
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
            url: `${SITE}/ausruestung/trinkblase`,
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
        aktuell="Trinkblase"
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
          Eine Trinkblase löst ein Problem, das man erst bemerkt, wenn es weg ist: Mit der Flasche
          im Rucksack trinkt man zu selten, weil man jedes Mal anhalten müsste. Mit dem Schlauch an
          der Schulter trinkt man nebenbei. Den Preis dafür zahlt man nicht beim Kauf, sondern
          beim Reinigen — deshalb steht hier die Öffnung vor der Produktliste.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            `${TRINKBLASEN.length} Trinkblasen verglichen`,
            "Wasserrechner",
            "Reinigungsanleitung",
            "nichts davon selbst getestet",
          ].map((t) => (
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
          nichts. Verglichen wird jeweils die 2-Liter-Ausführung — nur bei gleicher Größe sind
          Gewichte vergleichbar.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Gewicht"
            zeilen={PRODUKTE.map((s) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[s.asin],
              url: partnerUrl(s.asin),
            }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{PREISHINWEIS} Ein Strich beim Gewicht heißt: Der Hersteller nennt keines, oder nur eines, das für alle Größen gleich lautet und deshalb nicht stimmen kann.</p>
      </section>

      <div className="mt-12">
        <Inhalt eintraege={KAPITEL} />
      </div>

      {/* ─────────────────────────── 1 ─────────────────────────── */}
      <Kapitel id="brauchst-du" titel="Trinkblase oder Flasche?" unterzeile="Die ehrliche Antwort hängt an der Tourlänge." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Der Schweizer Alpen-Club rät, schon bei der ersten Rast zu trinken und danach
            regelmäßig — nicht erst bei Durst, weil der sich unter Belastung zu spät meldet. Genau
            das macht eine Trinkblase leicht: Der Schlauch hängt an der Schulter, ein Schluck kostet
            keinen Halt. Mit der Flasche im Seitenfach trinkt man, wenn man sowieso stehen bleibt.
          </p>
        </div>
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-accent-soft p-5">
            <h3 className="font-semibold text-accent">Für die Blase</h3>
            <ul className="mt-2 space-y-1.5 text-[0.97rem] leading-relaxed">
              <li>Trinken ohne anzuhalten, in kleinen Schlucken</li>
              <li>Beide Hände frei, auch mit Stöcken</li>
              <li>Das Gewicht liegt nah am Rücken statt seitlich</li>
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-warn-soft/60 p-5">
            <h3 className="font-semibold text-warn">Für die Flasche</h3>
            <ul className="mt-2 space-y-1.5 text-[0.97rem] leading-relaxed">
              <li>Man sieht, wie viel noch drin ist</li>
              <li>Nachfüllen ohne den Rucksack auszupacken</li>
              <li>Spülen in zwei Minuten statt Bürste und Trockenbügel</li>
            </ul>
          </div>
        </div>
        <div className="max-w-3xl">
          <Merksatz>
            Für die Runde um den See reicht eine Flasche. Ab drei, vier Stunden mit Aufstieg lohnt
            sich die Blase — dann trinkst du mit ihr tatsächlich mehr.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel
        id="groesse"
        titel="1,5, 2 oder 3 Liter"
        unterzeile="Die meistgesuchte Frage — und die, bei der die meisten zu groß kaufen."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Für eine Tageswanderung empfiehlt der{" "}
            <a href={QUELLEN.wanderverband} className="underline hover:text-accent" rel="noopener" target="_blank">
              Deutsche Wanderverband
            </a>{" "}
            1,5 bis 2 Liter. Bei Hitze und vielen Höhenmetern mehr. Der Rechner übersetzt das in
            eine Blasengröße:
          </p>
        </div>
        <Wasserrechner
          jeStunde={LITER_JE_STUNDE}
          ohneEinkehr={einkehr.ohne}
          gesamt={einkehr.gesamt}
          angebotName="Deuter Streamer II"
          angebote={deuterGroessen}
        />
        <div className="max-w-3xl space-y-5">
          <p>
            <strong>2 Liter</strong> sind die richtige Größe für die meisten Tagestouren.{" "}
            <strong>3 Liter</strong> lohnen sich bei Hitze, auf langen Touren ohne Einkehr und für
            mehrere Tage. <strong>1,5 Liter</strong> passen in Laufwesten und kleine Tagesrucksäcke.
          </p>
          <Merksatz>
            Eine volle 3-Liter-Blase wiegt drei Kilo. Wer sie meistens nur halb füllt, trägt eine
            größere Blase, als er braucht — und eine halb volle schwappt.
          </Merksatz>
          <p>
            Drei der Blasen aus diesem Vergleich gibt es in allen drei Größen. Aufbau, Öffnung
            und Ventil sind jeweils dieselben — nur Inhalt, Maße und Gewicht ändern sich.
          </p>
        </div>
        {/* relative: absolut positionierte Vorlesetexte müssen im Scrollrahmen bleiben. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Trinkblasen in 1,5, 2 und 3 Litern</caption>
            <thead className="bg-sand text-left text-muted">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-sand px-4 py-3 font-medium">Blase</th>
                {[1.5, 2, 3].map((l) => (
                  <th key={l} scope="col" className="px-4 py-3 font-medium">
                    {l.toLocaleString("de-DE")} Liter
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MIT_GROESSEN.map((t) => (
                <tr key={t.asin} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-semibold">
                    <a href={`#${t.asin}`} className="hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{t.marke}</span>
                      {t.name.replace(/\s*\d.*$/, "")}
                    </a>
                  </th>
                  {[1.5, 2, 3].map((l) => {
                    const g = t.groessen!.find((x) => x.liter === l);
                    if (!g) return <td key={l} className="px-4 py-3 text-muted">—</td>;
                    return (
                      <td key={l} className="px-4 py-3">
                        <a
                          href={p.get(g.asin)?.url ?? partnerUrl(g.asin)}
                          rel="sponsored nofollow noopener"
                          target="_blank"
                          className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                        >
                          {preisVon(g.asin)} <span aria-hidden>→</span>
                          <span className="sr-only"> {t.marke} {l.toLocaleString("de-DE")} Liter bei Amazon, Anzeige</span>
                        </a>
                        {g.hinweis && <span className="mt-1 block text-xs text-muted">{g.hinweis}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-xs text-muted">
          Anzeige. Alle Knöpfe führen zu Amazon und tragen eine Partnerkennung. {PREISHINWEIS} Maße
          und Gewichte, soweit der Hersteller sie je Größe nennt.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="oeffnung" titel="Die Öffnung entscheidet" unterzeile="Nicht beim Trinken, sondern beim Reinigen." breit>
        <p className="max-w-3xl">
          Ob man eine Trinkblase nach einem Jahr noch benutzt, hängt fast nur daran, wie leicht sie
          sich sauber halten lässt. Und das entscheidet die Öffnung.
        </p>
        <OeffnungenBild />
        <div className="max-w-3xl">
          <Merksatz>
            Wenn du aus diesem Text eine Sache mitnimmst: Schiebeverschluss oder weite Öffnung.
            Fünf der sechs Blasen hier haben eine davon — nur die CamelBak setzt auf einen
            Schraubdeckel.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="schlauch" titel="Schlauch, Beißventil, Absperrung" breit>
        <Kartenraster
          eintraege={[
            {
              titel: "Beißventil",
              text: "Man beißt leicht darauf, das Ventil öffnet sich, man saugt. Gute Ventile schließen danach von selbst. Das Mundstück verschleißt am ehesten und lässt sich meist einzeln nachkaufen.",
            },
            {
              titel: "Absperrung",
              text: "Ein Hebel oder Drehknopf am Schlauch, der ihn ganz sperrt. Im Rucksack auf der Rückbank drückt sonst etwas auf das Ventil, und das Wasser landet im Polster.",
            },
            {
              titel: "Schnellkupplung",
              text: "Der Schlauch lässt sich mit einem Klick von der Blase lösen. Zum Nachfüllen ziehst du nur die Blase heraus, der Schlauch bleibt am Rucksack verlegt.",
            },
            {
              titel: "Ersatzschlauch",
              text: "Die Kupplungen sind oft herstellereigen. Ein Ersatzschlauch muss zum Anschluss passen — am sichersten vom selben Hersteller, sonst vor dem Kauf nachsehen.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="material" titel="Material und Geschmack">
        <p>
          Viele Blasen sind heute aus TPU, einem Kunststoff, der von sich aus flexibel bleibt.
          „BPA-frei“ steht auf den meisten Verpackungen und unterscheidet deshalb kaum noch.
        </p>
        <p>
          Unabhängig geprüft hat das niemand. Die Stiftung Warentest und Öko-Test haben{" "}
          <a href={QUELLEN.warentestFlaschen} className="underline hover:text-accent" rel="noopener" target="_blank">
            Trinkflaschen getestet
          </a>
          , aber keine Trinkblasen. Wer von einem „Trinkblasen-Testsieger“ liest, liest einen
          eigenen Vergleich — so wie diesen, der das auch sagt.
        </p>
        <p>
          Neue Blasen schmecken oft nach Kunststoff. Vor dem ersten Einsatz mit warmem Wasser und
          etwas Natron oder Zitronensaft füllen, einige Stunden stehen lassen, gründlich ausspülen.
          Hält sich der Geschmack danach, liegt es am Material und nicht am Schmutz.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: sonst ragen die absolut positionierten Vorlesetexte der
            Kaufknöpfe aus dem Scrollrahmen und ziehen die Seite auf dem Handy
            auseinander (siehe Stockseite). */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[52rem] text-sm">
            <caption className="sr-only">Trinkblasen im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-32 bg-sand px-4 py-3 text-left font-medium text-muted">
                  &nbsp;
                </th>
                {TRINKBLASEN.map((t) => (
                  <th key={t.asin} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${t.asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{t.marke}</span>
                      {t.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (t) => <strong className="tabular-nums">{preisVon(t.asin)}</strong>],
                  ["Inhalt", (t) => `${t.liter} Liter`],
                  ["Öffnung", (t) => t.oeffnungDetail],
                  ["Gewicht", (t) => (t.gramm ? `${t.gramm} g` : <span className="text-muted">k. A.</span>)],
                  ["Maße", (t) => t.masse ?? <span className="text-muted">k. A.</span>],
                  ["Ventil", (t) => t.absperrung],
                  ["Besonders", (t) => t.besonderheit],
                  [
                    "Angebot",
                    (t) => (
                      <a
                        href={p.get(t.asin)?.url ?? partnerUrl(t.asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(t.asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {t.marke} {t.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (t: (typeof TRINKBLASEN)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">
                    {k}
                  </th>
                  {TRINKBLASEN.map((t) => (
                    <td key={t.asin} className="px-3 py-3 leading-snug">
                      {f(t)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Alle technischen Angaben aus den Herstellerangaben zum jeweiligen Artikel. „k. A.“ heißt:
          Der Hersteller nennt den Wert für diese Ausführung nicht, und schätzen wollen wir ihn nicht.
          {" "}{PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel
        id="modelle"
        titel="Die Blasen einzeln"
        unterzeile="Zu jeder steht, wogegen sie spricht und wer sie nicht kaufen sollte."
        breit
      >
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel
        id="reinigen"
        titel="Reinigen, trocknen, lagern"
        unterzeile="Eine Blase, die nach jeder Tour ausgespült und offen getrocknet wird, braucht selten mehr."
        breit
      >
        <ol className="max-w-3xl space-y-4">
          {[
            ["Sofort leeren und ausspülen.", "Nach der Tour, nicht am nächsten Tag. Zwölf Stunden Restwasser im warmen Auto sind ein guter Anfang für Schimmel."],
            ["Zucker sofort raus.", "Saft, Tee mit Zucker, Iso-Getränke: danach gründlich klar spülen. Reines Wasser verzeiht mehr."],
            ["Alle paar Touren gründlich.", "Warmes Wasser mit etwas Spülmittel oder Natron. Nicht heißer, als der Hersteller erlaubt — steht nichts dabei, handwarm."],
            ["Schlauch und Ventil einzeln.", "Den Schlauch mit einer langen Bürste durchziehen, das Mundstück abnehmen und separat reinigen. Dort setzt sich gern Belag fest."],
            ["Klar spülen, bis nichts mehr riecht.", "Kein Spülmittel, kein Natron, kein Geruch mehr."],
            ["Offen trocknen.", "Kopfüber, und so, dass die Folie nicht zusammenklebt — mit einem Trockenbügel, einem Kochlöffel oder einem zusammengerollten Küchentuch darin."],
            ["Schlauch hängend, beide Enden offen.", "Sonst bleibt innen ein Wasserfaden stehen."],
            ["Nicht ganz trocken? Ins Gefrierfach.", "Kälte tötet Keime nicht, aber sie vermehren sich dort nicht. Deckel ab, Schlauch ab, dann friert nichts zu."],
          ].map(([t, x], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <span>
                <strong>{t}</strong> {x}
              </span>
            </li>
          ))}
        </ol>
        <p className="max-w-3xl text-muted">
          In die Spülmaschine nur, wenn der Hersteller es ausdrücklich erlaubt. Reinigungstabletten
          bieten mehrere Hersteller an; nötig sind sie nicht, wenn die Blase regelmäßig trocken wird.
        </p>
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
          <Produktbild preis={p.get(ZUBEHOER.reinigung.asin)} alt={ZUBEHOER.reinigung.name} href={partnerUrl(ZUBEHOER.reinigung.asin)} />
          <div>
            <p className="text-sm font-semibold text-accent">Wenn du keine passende Bürste hast</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight">
              {ZUBEHOER.reinigung.marke} {ZUBEHOER.reinigung.name}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{ZUBEHOER.reinigung.text}</p>
            <Affiliatelink url={partnerUrl(ZUBEHOER.reinigung.asin)} preis={p.get(ZUBEHOER.reinigung.asin)} name={ZUBEHOER.reinigung.name} knapp />
          </div>
        </div>
      </Kapitel>

      {/* ─────────────────────────── Ersatzteile ─────────────────────────── */}
      <Kapitel
        id="ersatzteile"
        titel="Ersatzteile: Mundstück und Schlauch"
        unterzeile="Die Blase hält lange. Das Mundstück nicht."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Meist gibt zuerst das Beißventil nach: Das Silikon wird weich, reißt am
            Schlitz ein, schließt nicht mehr richtig. Danach der Schlauch, in dem sich trotz
            Bürste irgendwann ein Belag hält. Beides lässt sich einzeln tauschen — wenn man das
            passende Teil findet.
          </p>
          <p>
            Genau da liegt die Falle. Die Kupplungen zwischen Blase und Schlauch sind meist
            herstellereigen, und auch die Mundstücke haben unterschiedliche Durchmesser. Sogenannte
            universelle Mundstücke vom Marktplatz passen manchmal, zusagen tut es niemand. Sicher
            ist nur das Originalteil:
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <ul className="divide-y divide-line">
            {ERSATZTEILE.map((e) => (
              <li key={e.asin} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="font-medium">{e.teil}</p>
                  <p className="text-sm text-muted">passt an: {e.zu}</p>
                </div>
                <a
                  href={p.get(e.asin)?.url ?? partnerUrl(e.asin)}
                  rel="sponsored nofollow noopener"
                  target="_blank"
                  className="inline-block rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110 dark:text-background"
                >
                  {preisVon(e.asin)} <span aria-hidden>→</span>
                  <span className="sr-only"> {e.teil} bei Amazon, Anzeige</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="max-w-3xl text-xs text-muted">
          Anzeige. Alle Knöpfe führen zu Amazon und tragen eine Partnerkennung. {PREISHINWEIS} Die
          Zuordnung folgt den Produktnamen der Hersteller; für die SASMO gibt es einen eigenen
          isolierten Ersatzschlauch, siehe <a href="#winter" className="underline">Im Winter</a>.
        </p>
        <p className="max-w-3xl text-muted">
          Ein Tipp für den Kauf: Wer einen Ersatzschlauch braucht, nimmt gleich ein zweites
          Mundstück dazu. Es wiegt ein paar Gramm, und ein eingerissenes Ventil auf Tour heißt
          sonst: tropfen bis zum Parkplatz.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="rucksack" titel="Welcher Rucksack passt">
        <p>
          Der Rucksack braucht drei Dinge: ein Fach innen am Rücken, in dem die Blase aufrecht
          hängt, einen Haken oder Klett oben zum Aufhängen und eine Öffnung, durch die der Schlauch
          nach außen geht. Viele Wanderrucksäcke haben das — ob deiner dazugehört, siehst du an
          genau diesen drei Dingen.
        </p>
        <p>
          Die Maße entscheiden mehr als die Literangabe. Die Deuter misst laut Hersteller 35 × 17
          Zentimeter, in der 3-Liter-Ausführung 40 × 20, die Source 35,5 × 19,2 — das Fach sollte
          ein paar Zentimeter mehr haben, sonst schiebst du eine volle Blase gegen den Widerstand
          hinein. Wie man den passenden Rucksack findet, steht im{" "}
          <Link href="/ausruestung/wanderrucksack" className="underline hover:text-accent">
            Rucksack-Vergleich
          </Link>
          .
        </p>
        <Merksatz>
          Füll die Blase, bevor du den Rucksack packst. Eine volle Blase in einen vollen Rucksack zu
          schieben gelingt selten ohne Auspacken.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="winter" titel="Im Winter" unterzeile="Die Blase friert selten. Der Schlauch fast immer." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Die Blase liegt am warmen Rücken, der Schlauch hängt mit ein paar Schlucken Wasser außen
            in der Kälte. Deshalb friert er zuerst, und dann ist die ganze Blase unerreichbar.
            Zwei Dinge helfen:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Nach jedem Schluck zurückblasen.</strong> Das Wasser aus dem Schlauch in die
              Blase pusten. Ein leerer Schlauch friert kaum ein.
            </li>
            <li>
              <strong>Eine Isolierung</strong> — eine Hülle für den vorhandenen Schlauch oder gleich
              ein isolierter Ersatzschlauch. Das Mundstück unter die Jacke stecken.
            </li>
          </ul>
          <p className="text-muted">
            Bei starkem Frost ist eine Thermoskanne die zuverlässigere Reserve. „Frostbeständig“, wie
            es in manchen Produkttexten steht, heißt, dass die Blase nicht kaputtgeht — nicht, dass
            das Wasser flüssig bleibt.
          </p>
        </div>
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
          <Produktbild preis={p.get(ZUBEHOER.isolierung.asin)} alt={ZUBEHOER.isolierung.name} href={partnerUrl(ZUBEHOER.isolierung.asin)} />
          <div>
            <p className="text-sm font-semibold text-accent">Wenn der Schlauch einfriert</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight">
              {ZUBEHOER.isolierung.marke} {ZUBEHOER.isolierung.name}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{ZUBEHOER.isolierung.text}</p>
            <Affiliatelink url={partnerUrl(ZUBEHOER.isolierung.asin)} preis={p.get(ZUBEHOER.isolierung.asin)} name={ZUBEHOER.isolierung.name} knapp />
          </div>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="nachfuellen" titel="Unterwegs nachfüllen" unterzeile="Die Größe der Blase hängt daran, ob du nachfüllen kannst.">
        <p>
          An <strong>{nf.format(einkehr.ohne)}</strong> der {nf.format(einkehr.gesamt)}{" "}
          Wanderparkplätze in unserem Verzeichnis liegt im Umkreis von 1,2 Kilometern keine
          Einkehr. <strong>{nf.format(einkehr.gipfelOhne)}</strong> davon haben einen Gipfel in
          Reichweite — also Aufstieg ohne Nachschub am Start. Unterwegs mag eine Hütte kommen; am
          Parkplatz weißt du es nicht.
        </p>
        <p>
          Auf jeder Parkplatzseite steht unter „In Laufweite“, ob eine Einkehr in der Nähe ist. Wer
          dort nichts findet, plant mit der vollen Menge ab dem Auto.{" "}
          <Link href="/" className="underline hover:text-accent">
            Wanderparkplätze in deiner Nähe
          </Link>
          .
        </p>
        <p>
          Brunnen am Weg sind nicht automatisch Trinkwasser — steht „Kein Trinkwasser“ dran, gilt
          das. Wer regelmäßig aus Quellen und Bächen nachfüllen will, braucht einen Wasserfilter.
          Die Deuter lässt sich laut Hersteller mit einem 28-mm-Filter kombinieren; welcher Filter
          taugt, ist ein eigenes Thema und nicht Teil dieses Vergleichs.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel id="nichts" titel="Wann eine Blase nichts bringt">
        <p>
          Auf kurzen Runden ist sie mehr Aufwand als Nutzen: Füllen, Einsetzen, Reinigen, Trocknen
          — für einen Liter, den man auch aus der Flasche getrunken hätte.
        </p>
        <p>
          Wenn unterwegs Einkehren liegen, reicht eine kleine Flasche, und man füllt nach.
        </p>
        <p>
          Und wer weiß, dass er sie nach der Tour nicht sofort ausspült und trocknet, sollte bei der
          Flasche bleiben. Eine Blase, die zwei Wochen feucht im Schrank lag, ist kein
          Ausrüstungsgegenstand mehr, sondern ein Fall für den Müll.
        </p>
      </Kapitel>

      <Entscheidung s={deuter} preis={dp} url={partnerUrl(deuter.asin)}>
        <p>
          Schiebeverschluss über die ganze Breite, auf links drehbar zum Reinigen, flach genug für
          schmale Fächer, in drei Größen zu haben. Nichts davon ist aufregend, aber alles davon
          zählt nach dem zehnten Einsatz mehr als ein besonderes Ventil. Gebaut von HydraPak.
        </p>
        <p className="mt-2 text-muted">
          Wenn deine letzte Blase verschimmelt ist, nimm stattdessen die{" "}
          <a href="#B07MR7SS8X" className="underline hover:text-accent">Platypus Big Zip</a> — sie
          hält sich selbst offen.
        </p>
      </Entscheidung>

      {/* ─────────────────────────── 13 ─────────────────────────── */}
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

      {/* ─────────────────────────── 14 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Wir haben diese Trinkblasen nicht getestet und behaupten das auch nicht. Was hier steht,
          ist eine Zusammenstellung aus den Herstellerangaben und den Empfehlungen zweier
          Wanderverbände, plus die Einschätzung, welche Merkmale im Alltag zählen. Einen
          unabhängigen Labortest von Trinkblasen gibt es nicht.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Deutscher Wanderverband,{" "}
            <a href={QUELLEN.wanderverband} className="underline hover:text-accent" rel="noopener" target="_blank">
              Essen und Trinken
            </a>
            : 1,5 bis 2 Liter für eine Tageswanderung.
          </li>
          <li>
            Peter Schürch,{" "}
            <a href={QUELLEN.sac} className="underline hover:text-accent" rel="noopener" target="_blank">
              Flüssigkeitsaufnahme bei Bergtouren
            </a>
            , Die Alpen 2/1999, Schweizer Alpen-Club: 1 bis 2 Liter für größere Touren, trinken ab
            der ersten Rast.
          </li>
          <li>
            Technische Angaben: Herstellerangaben zum jeweiligen Artikel, verglichen in der
            2-Liter-Ausführung. Preise und Bilder: Amazon, stündlich abgerufen. {PREISHINWEIS}
          </li>
          <li>
            Wanderparkplätze ohne Einkehr: eigener Datenbestand aus OpenStreetMap, Einkehr im
            Umkreis von 1.200 Metern — mehr dazu unter{" "}
            <Link href="/ueber-uns" className="underline hover:text-accent">Über uns</Link>.
          </li>
          <li>
            {PARTNER} {HERKUNFT}
          </li>
        </ul>
      </Kapitel>

      <Merkleiste
        name={`${deuter.marke} ${deuter.name}`}
        preis={dp?.anzeige}
        zeit={zeitDeuter}
        bild={dp?.bildKlein}
        url={dp?.url ?? partnerUrl(deuter.asin)}
        oben="uebersicht"
        unten="methode"
      />

      <aside className="mt-14 rounded-2xl bg-sand p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Passend dazu</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          <li>
            <Link href="/ausruestung/wanderstoecke" className="font-medium hover:text-accent">Wanderstöcke im Vergleich</Link>
            <p className="text-sm text-muted">Länge, Verschluss, faltbar oder Teleskop.</p>
          </li>
          <li>
            <Link href="/ausruestung/wanderrucksack" className="font-medium hover:text-accent">Wanderrucksack im Vergleich</Link>
            <p className="text-sm text-muted">Liter, Rückenlänge, Damen oder Herren.</p>
          </li>
          <li>
            <Link href="/wandern-ohne-auto" className="font-medium hover:text-accent">Wandern ohne Auto</Link>
            <p className="text-sm text-muted">Ausgangspunkte mit Haltestelle in Laufweite.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
