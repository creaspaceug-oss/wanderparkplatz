import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Druckrechner, { type DruckHose } from "@/components/ausruestung/Druckrechner";
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
import { HOSEN, ZIP_NAME, FRAGEN, QUELLEN, alsProdukt, hauptAsin } from "@/lib/ausruestung/regenhosen";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const PFAD = "/ausruestung/regenhose";
const TITEL = "Regenhose zum Wandern: Wie dicht sie sein muss, welcher Reißverschluss — und sechs Hosen für Damen und Herren";

export const metadata: Metadata = {
  title: titel("Regenhose Wandern: Damen, Herren, Wassersäule im Vergleich"),
  description: beschreibung(
    "Welche Regenhose zum Wandern: wie viel Wassersäule wirklich nötig ist, warum Knien mehr Druck macht als Regen, Seitenreißverschluss, Lagen, Pflege — mit Druckrechner und sechs Hosen.",
  ),
  alternates: { canonical: PFAD },
};

const KAPITEL: [string, string][] = [
  ["rechner", "Wie dicht muss eine Regenhose sein?"],
  ["naehte", "Was die Wassersäule nicht sagt"],
  ["reissverschluss", "Seitenreißverschluss: ganz, halb oder gar nicht"],
  ["lagen", "2, 2,5 oder 3 Lagen"],
  ["atmung", "Atmungsaktivität"],
  ["pflege", "Waschen und nachimprägnieren"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Hosen einzeln"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  fluid: "Unsere erste Wahl",
  drop: "Für den Notfall im Rucksack",
  marmot: "Leicht, mit durchgehendem Reißverschluss",
  schoeffel: "Unisex",
  columbia: "Mit Tasche und Futter",
  cmp: "Für Damen, durchgehender Reißverschluss",
};

const extern = "underline hover:text-accent";

export default async function Regenhose() {
  // Erscheint erst zum Freigabezeitpunkt, bis dahin 404 (siehe lib/ausruestung/freigabe.ts).
  if (!sichtbar(PFAD)) notFound();

  const asins = HOSEN.flatMap((h) => [h.herren, h.damen, h.unisex].filter((x): x is string => Boolean(x)));
  const p = await preise(asins);
  const PRODUKTE = HOSEN.map(alsProdukt);
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

  const druckHosen: DruckHose[] = HOSEN.map((h) => ({
    key: h.key,
    name: `${h.marke} ${h.name}`,
    wassersaeule: h.wassersaeule,
    url: urlVon(hauptAsin(h)),
  }));
  const impraegnieren = sichtbar("/ausruestung/schuhe-impraegnieren");

  const passformen = (h: (typeof HOSEN)[number]) =>
    (
      [
        ["Herren", h.herren],
        ["Damen", h.damen],
        ["Unisex", h.unisex],
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
        aktuell="Regenhose"
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
          Eine Regenhose muss mehr aushalten als eine Jacke. Nicht wegen des Regens, sondern wegen
          dir: Wer sich auf einen nassen Stein setzt oder hinkniet, um einen Schuh zu binden, presst
          das Wasser mit seinem Gewicht in den Stoff. Wie viel Druck dabei entsteht, rechnet
          diese Seite aus — und sagt, welche Hose ihn aushält.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${HOSEN.length} Regenhosen verglichen`, "Druckrechner", "Damen und Herren", "Nach DAV und Warentest"].map((t) => (
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
          nichts. Die Größe wählst du auf der Amazon-Seite; Damenmodelle unter{" "}
          <a href="#vergleich" className="underline hover:text-accent">Technische Daten</a>.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Wassersäule"
            zeilen={PRODUKTE.map((s, i) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[HOSEN[i].key],
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
        id="rechner"
        titel="Wie dicht muss eine Regenhose sein?"
        unterzeile="Dichter, als die Norm verlangt — weil du dich hinsetzt."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Wie dicht ein Stoff ist, wird in Millimetern Wassersäule gemessen. Als wasserdicht gilt ein
            Stoff laut DIN ab 1.300 Millimetern, schreibt der{" "}
            <a href={QUELLEN.davWetterschutz} className={extern} rel="noopener" target="_blank">
              Deutsche Alpenverein
            </a>
            . Durch Sitzen, Knien oder Rucksackträger steigt der Druck aber; deshalb empfiehlt die
            Eidgenössische Materialprüfanstalt in St. Gallen (EMPA) mindestens 4.000 Millimeter.
          </p>
          <p>
            Bei einer Jacke sind es die Rucksackträger. Bei einer Hose sitzt du drauf. Wie
            viel das ausmacht, ist Physik — Gewicht geteilt durch Fläche:
          </p>
        </div>
        <Druckrechner hosen={druckHosen} />
        <Merksatz>
          Knien ist der Härtetest: Das halbe Körpergewicht auf der Fläche einer Kniescheibe ergibt
          nach dieser Abschätzung mehr Druck, als eine Hose mit 10.000 mm aushält. Kurz geht, lange
          nicht.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="naehte" titel="Was die Wassersäule nicht sagt" unterzeile="Ob die Nähte dicht sind.">
        <p>
          Das Schweizer Verbrauchermagazin Saldo hat Wanderjacken im Labor-Dauerregen getestet, die{" "}
          <a href={QUELLEN.warentestJacken} className={extern} rel="noopener" target="_blank">
            Stiftung Warentest
          </a>{" "}
          berichtete darüber. Eine Jacke mit angegebenen 24.000 Millimetern Wassersäule hielt nur etwa
          fünf Minuten dicht, nach fünfmaligem Waschen eine Minute. Die Schwachstelle vieler Jacken
          waren die Nähte: Die Nadel durchsticht die Membran, und wird die Naht danach nicht sorgfältig
          abgeklebt, hat der Regen leichtes Spiel.
        </p>
        <p>
          Für Hosen gibt es keinen vergleichbaren Test. Die Lehre gilt trotzdem: Auf „Nähte getapt“
          oder „versiegelt“ achten — und einer hohen Zahl allein nicht trauen. Der DAV nennt
          sauber abgedichtete Nähte ausdrücklich als Voraussetzung für die Wasserdichtigkeit eines
          Kleidungsstücks.
        </p>
        <p className="text-muted">
          Nebenbei: Die Warentest-Meldung nennt 3.000 Millimeter als Schwelle für „wasserdicht“, der
          DAV die 1.300 der DIN. Beides steht so in den Quellen; für eine Regenhose ist ohnehin die
          EMPA-Empfehlung von 4.000 Millimetern die sinnvollere Messlatte.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel
        id="reissverschluss"
        titel="Seitenreißverschluss: ganz, halb oder gar nicht"
        unterzeile="Entscheidet, ob du die Hose im Regen anziehst oder es bleiben lässt."
        breit
      >
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Durchgehend",
              text: "Über die ganze Beinlänge, oft teilbar. Die Hose geht über jeden Wanderstiefel, ohne dass du dich hinsetzen oder die Schuhe ausziehen musst. Offen lässt sie Luft an die Beine. Schwerer, weil Reißverschluss und Abdeckleiste Gewicht haben.",
            },
            {
              titel: "Dreiviertel",
              text: "Reicht vom Knöchel bis übers Knie. Über schlanke Wanderschuhe genügt das oft, über hohe Bergstiefel wird es eng. Leichter als durchgehend.",
            },
            {
              titel: "Keiner",
              text: "Nur ein weiter oder verstellbarer Beinabschluss. Am leichtesten und kleinsten — gut als Notfallhose, die fast nie aus dem Rucksack kommt.",
            },
          ]}
        />
        <p className="max-w-3xl">
          Wer die Regenhose wirklich trägt, sobald es regnet, nimmt einen durchgehenden
          Reißverschluss. Wer sie nur für den Notfall dabeihat, spart Gewicht und lässt ihn weg.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="lagen" titel="2, 2,5 oder 3 Lagen" unterzeile="Wie die Membran verbaut ist.">
        <p>
          Eine Membran ist nur hundertstel Millimeter dünn und wird deshalb mit anderen Stoffen
          verbunden. Der{" "}
          <a href={QUELLEN.davWetterschutz} className={extern} rel="noopener" target="_blank">
            DAV
          </a>{" "}
          unterscheidet:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>2 Lagen:</strong> Membran und Oberstoff sind verbunden, ein Futter wird eingenäht.
            Leicht und bequem.
          </li>
          <li>
            <strong>2,5 Lagen:</strong> Statt Futter ein aufgedrucktes Kunststoffmuster, das die Haut
            von der Membran fernhält. Sehr leicht und luftig.
          </li>
          <li>
            <strong>3 Lagen:</strong> Oberstoff, Membran und Futter fest verbunden. Etwas steifer,
            aber besonders leistungsfähig und langlebig.
          </li>
        </ul>
        <p>
          Die Hosen in diesem Vergleich, deren Hersteller den Aufbau nennt, sind zwei- oder
          zweieinhalblagig. Wer die Hose selten braucht, nimmt die leichtere Bauweise; wer sie oft
          und lange trägt, profitiert von der Haltbarkeit mehrerer fest verbundener Lagen.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="atmung" titel="Atmungsaktivität" unterzeile="Bergauf schwitzt du von innen nasser, als der Regen von außen macht.">
        <p>
          So beschreibt es der DAV am Beispiel des „Ölzeugs“ der Seeleute: regendicht, aber wer sich
          darin in den Bergen bewegt, wird durch Schwitzen von innen nässer als durch den Regen. Gemessen wird Atmungsaktivität als RET-Wert — unter
          RET 6 gilt ein Stoff als sehr gut atmungsaktiv. Wichtig: Das gilt nur für Schweiß als Dampf.
          Bildet er Tropfen, bleibt er drin wie Regenwasser.
        </p>
        <p>
          Die Hersteller in diesem Vergleich nennen, wenn überhaupt, einen anderen Wert: Gramm
          Wasserdampf pro Quadratmeter in 24 Stunden — Schöffel 10.000, CMP 4.000. Das ist ein anderes
          Messverfahren als der RET-Wert; direkt umrechnen lassen sich die beiden nicht. Innerhalb
          derselben Angabe gilt: je höher, desto luftiger.
        </p>
        <Merksatz>
          Die beste Belüftung ist ein offener Seitenreißverschluss. Keine Membran schafft so viel
          Luftaustausch.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Waschen und nachimprägnieren" unterzeile="Eine Regenhose will gewaschen werden.">
        <p>
          Schweiß und Schmutz behindern die Funktion der Stoffe, deshalb rät der DAV, auch
          Membranbekleidung zu waschen: Pflegeleichtprogramm, 40 Grad, Reißverschlüsse vorher
          schließen, an der Luft oder im Trockner trocknen. Zwanzig zusätzliche Minuten im Trockner
          reaktivieren die Imprägnierung. Lässt der Oberstoff danach trotzdem Wasser durch, hilft ein
          Pumpspray oder eine Einwaschimprägnierung.
        </p>
        <p>
          Wie nötig das ist, zeigte der Saldo-Test: Alle Jacken hielten nach mehrmaligem Waschen den
          Regen kürzer ab als neu, weil die Wäsche die wasserabweisende Ausrüstung mit ausspült. Die
          Stiftung Warentest verweist dafür auf ihren Test von Imprägniermitteln
          {impraegnieren ? (
            <>
              {" "}— mehr dazu in unserem Ratgeber{" "}
              <Link href="/ausruestung/schuhe-impraegnieren" className={extern}>
                Schuhe imprägnieren
              </Link>
            </>
          ) : null}
          .
        </p>
        <p>
          Beim Kauf zählt auch die Ausrüstung: Für Jacken nennt der DAV eine Imprägnierung ohne
          Fluorkarbone (PFC) aus Umweltsicht ideal — für Hosen gilt dasselbe. Beide Vaude-Hosen hier sind laut Hersteller
          ohne PFAS ausgerüstet, die Marmot laut Hersteller PFC-frei; bei den übrigen steht dazu nichts
          im Angebot.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[56rem] text-sm">
            <caption className="sr-only">Regenhosen zum Wandern im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {HOSEN.map((h) => (
                  <th key={h.key} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${hauptAsin(h)}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{h.marke}</span>
                      {h.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Wassersäule", (h) => (h.wassersaeule ? `${h.wassersaeule.toLocaleString("de-DE")} mm` : <span className="text-muted">k. A.</span>)],
                  ["Gewicht", (h) => (h.gewicht ? `${h.gewicht} g` : <span className="text-muted">k. A.</span>)],
                  ["Aufbau", (h) => h.lagen],
                  ["Seiten-RV", (h) => ZIP_NAME[h.zip]],
                  ["PFAS", (h) => h.pfas],
                  [
                    "Angebot",
                    (h) => (
                      <div className="flex flex-col gap-1.5">
                        {passformen(h).map(([k, asin]) => (
                          <a
                            key={asin}
                            href={urlVon(asin)}
                            rel="sponsored nofollow noopener"
                            target="_blank"
                            className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                          >
                            {k} · {preisVon(asin)} <span aria-hidden>→</span>
                            <span className="sr-only"> {h.marke} {h.name} bei Amazon, Anzeige</span>
                          </a>
                        ))}
                      </div>
                    ),
                  ],
                ] as [string, (h: (typeof HOSEN)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {HOSEN.map((h) => (
                    <td key={h.key} className="px-3 py-3 leading-snug">{f(h)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Wassersäule und Gewicht von den Herstellerseiten oder aus dem Angebot; „k. A.“: nicht
          angegeben. Die Größe wählst du auf der Amazon-Seite. Preise und Verfügbarkeit: Stand{" "}
          {zeitVon(erste.asin)} Uhr. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Hosen einzeln" unterzeile="Zu jeder steht, wogegen sie spricht und wer sie nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Durchgehende Reißverschlüsse, mindestens 10.000 Millimeter Wassersäule laut Vaude, ohne
          PFAS, mit Damen- und Herrenschnitt. Das ist die Regenhose, die man auch wirklich anzieht,
          wenn es zu regnen beginnt — weil man dafür nicht die Stiefel ausziehen muss.
        </p>
        <p className="mt-2 text-muted">
          Wenn sie nur für den Notfall in den Rucksack soll: die{" "}
          <a href={`#${hauptAsin(HOSEN[1])}`} className="underline hover:text-accent">Vaude Drop Pants II</a> mit 180 Gramm.
        </p>
      </Entscheidung>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
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

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Grenzwerte, Aufbau und Pflege stammen vom Deutschen Alpenverein, die Erfahrungen mit Nähten
          und Waschen aus dem Saldo-Test, über den die Stiftung Warentest berichtete. Wassersäule und
          Gewicht kommen von den Herstellern; wo sie fehlen, steht „k. A.“. Der Druckrechner ist eine
          Abschätzung: Gewichtsanteil und Auflagefläche sind Annahmen, die du im Rechner siehst und
          verstellen kannst.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.davWetterschutz} className={extern} rel="noopener" target="_blank">
              Wie funktioniert das? Wetterschutzbekleidung
            </a>{" "}
            (DAV Panorama 01/17, aktualisiert 03/21) und{" "}
            <a href={QUELLEN.davOutfit} className={extern} rel="noopener" target="_blank">
              Das richtige Wanderoutfit
            </a>
          </li>
          <li>
            Stiftung Warentest,{" "}
            <a href={QUELLEN.warentestJacken} className={extern} rel="noopener" target="_blank">
              Wanderjacken im Test: Viele sind nicht ganz dicht
            </a>{" "}
            (Test des Schweizer Magazins Saldo).
          </li>
          <li>
            Herstellerangaben:{" "}
            <a href={QUELLEN.vaudeFluid} className={extern} rel="noopener" target="_blank">Vaude Fluid Full-Zip II</a>,{" "}
            <a href={QUELLEN.vaudeDrop} className={extern} rel="noopener" target="_blank">Vaude Drop II</a>,{" "}
            <a href={QUELLEN.marmot} className={extern} rel="noopener" target="_blank">Marmot PreCip Eco</a>; übrige aus dem Amazon-Angebot.
          </li>
          <li>
            Preise und Bilder: Amazon, stündlich abgerufen. {PREISHINWEIS}
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
            <p className="text-sm text-muted">Schließen die Lücke zwischen Hose und Schuh.</p>
          </li>
          <li>
            <Link href="/ausruestung/wanderrucksack" className="font-medium hover:text-accent">Wanderrucksack im Vergleich</Link>
            <p className="text-sm text-muted">Mit Regenhülle — und Platz für die Regenhose.</p>
          </li>
          <li>
            <Link href="/ausruestung/erste-hilfe-set" className="font-medium hover:text-accent">Erste-Hilfe-Set im Vergleich</Link>
            <p className="text-sm text-muted">Mit Rettungsdecke gegen Auskühlen.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
