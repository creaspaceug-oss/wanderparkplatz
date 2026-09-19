import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Affiliatelink from "@/components/Affiliatelink";
import Groedelberater, { type GroessenAngebot } from "@/components/ausruestung/Groedelberater";
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
  TraktionBild,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import {
  GROEDEL,
  CITY,
  STEIGEISEN,
  FRAGEN,
  QUELLEN,
  alsProdukt,
  standardGroesse,
} from "@/lib/ausruestung/groedel";
import { hoheGipfel } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Grödel: Wann du sie brauchst, welche Größe passt — und wann es Steigeisen sein müssen";

export const metadata: Metadata = {
  title: titel("Grödel: Größe, Test und Grödel oder Steigeisen"),
  description: beschreibung(
    "Was Grödel sind, wann sie reichen und wann es Steigeisen braucht, welche Größe passt — und sechs Grödel von Snowline bis Kahtoola mit ihren Schwächen.",
  ),
  alternates: { canonical: "/ausruestung/groedel" },
};

const KAPITEL: [string, string][] = [
  ["was", "Was sind Grödel?"],
  ["wann", "Wann du Grödel brauchst"],
  ["oder", "Grödel oder Steigeisen"],
  ["groesse", "Die richtige Größe"],
  ["zacken", "Zacken, Kette, Gummi"],
  ["anlegen", "Grödel anlegen und damit gehen"],
  ["test", "Grödel im Test"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Grödel einzeln"],
  ["alltag", "Spikes für Schuhe im Alltag"],
  ["pflege", "Trocknen, lagern, ersetzen"],
  ["nichts", "Wann Grödel nichts bringen"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  "Chainsen Pro": "Unsere erste Wahl",
  "Ice Master Light": "Für hartes Eis",
  Microspikes: "Wenn sie lange halten sollen",
  "Puez Mtn Spike": "Für steile Bergwege",
  "Chainsen Light": "Für den Rucksack, auf Verdacht",
  "Grödel 19 Zähne": "Zum Ausprobieren",
};

export default async function Groedel() {
  const alleAsins = [
    ...GROEDEL.flatMap((g) => g.groessen.map((x) => x.asin)),
    ...CITY.groessen.map((x) => x.asin),
    STEIGEISEN.asin,
  ];
  const [p, hoch] = await Promise.all([preise(alleAsins), hoheGipfel()]);

  const PRODUKTE = GROEDEL.map(alsProdukt);
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
  const stufe = (m: number) => hoch.stufen.find((s) => s.schwelle === m)?.plaetze ?? 0;

  const groessenAngebote: GroessenAngebot[] = GROEDEL.flatMap((g) =>
    g.groessen
      .filter((x) => x.schuh)
      .map((x) => ({
        modell: `${g.marke} ${g.name}`,
        k: x.k,
        schuh: x.schuh!,
        url: urlVon(x.asin),
        anzeige: p.get(x.asin)?.anzeige ?? null,
        zeit: zeitVon(x.asin),
      })),
  );

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

  const cp = p.get(standardGroesse(CITY).asin);
  const sp = p.get(STEIGEISEN.asin);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/groedel`,
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
        aktuell="Grödel"
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
          Grödel sind das kleinste Stück Winterausrüstung mit dem größten Unterschied: rund 300
          Gramm im Rucksack, und ein vereister Forstweg wird wieder ein Weg. Sie haben aber eine Grenze,
          die man kennen muss, bevor man sie kauft — auf harten, steilen Schneefeldern geben sie
          eine Sicherheit, die sie nicht halten können.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            `${GROEDEL.length} Grödel verglichen`,
            "Grödel oder Steigeisen: Faustregel",
            "Größenfinder",
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
          nichts. Die Preise gelten für die Größe, die zu Schuhgröße 42 passt — alle Größen stehen
          unter <a href="#groesse" className="underline hover:text-accent">Die richtige Größe</a>.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Zacken"
            kennwertLeer="k. A."
            zeilen={PRODUKTE.map((s, i) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[GROEDEL[i].name],
              url: partnerUrl(s.asin),
            }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{PREISHINWEIS} „k. A.“: Der Hersteller nennt die Zahl im Angebot nicht.</p>
      </section>

      <div className="mt-12">
        <Inhalt eintraege={KAPITEL} />
      </div>

      {/* ─────────────────────────── 1 ─────────────────────────── */}
      <Kapitel id="was" titel="Was sind Grödel?" unterzeile="Schneeketten für den Schuh — mehr ist es nicht, und das ist ihr Vorteil." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Ein Grödel ist ein Gummirahmen, der über den Schuh gezogen wird, darunter Ketten mit
            kurzen Metallzacken. Die Zacken beißen ins Eis und in festen Schnee, der Gummi hält das
            Ganze am Schuh. Es braucht keine Bindung, keinen besonderen Schuh und keine Übung:
            anziehen, losgehen, ausziehen, wenn der Weg wieder frei ist.
          </p>
          <p>
            Im Handel heißen dieselben Dinge auch Schuhketten, Eisspikes, Schneeketten für Schuhe oder, nach einem Modell von
            Kahtoola, Microspikes. Davon zu unterscheiden sind zwei Verwandte:
          </p>
        </div>
        <TraktionBild />
        <div className="max-w-3xl">
          <Merksatz>
            Grödel liegen dazwischen: mehr Halt als Alltagsspikes, viel weniger als ein Steigeisen.
            Wer das im Kopf behält, kauft das Richtige.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="wann" titel="Wann du Grödel brauchst" unterzeile="Nicht nur im Hochwinter — und nicht nur in den Alpen." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Im Winter auf festgetretenen, vereisten Wanderwegen, auch im Mittelgebirge. Morgens nach
            einer klaren Nacht ist es am glattesten, in Schattenlagen und auf Forststraßen, wo
            Schmelzwasser über Nacht gefriert. Genau dort, wo viele Touren am Parkplatz beginnen.
          </p>
          <p>
            Und in der Übergangszeit in den Bergen. Der Deutsche Alpenverein warnt jedes Frühjahr
            vor{" "}
            <a href={QUELLEN.schneefelder} className="underline hover:text-accent" rel="noopener" target="_blank">
              Altschneefeldern
            </a>
            : Unten ist längst Frühling, weiter oben und besonders auf Nordhängen liegt noch Schnee —
            in den Bayerischen Voralpen etwa zwischen 1.300 und 1.600 Metern. Grödel oder leichte
            Steigeisen gehören dann laut DAV ins Gepäck, ebenso im Herbst, wenn nordseitige Passagen
            vereisen.
          </p>
          <p>
            Wie viele Touren das betrifft, lässt sich aus unserem Verzeichnis ablesen. Im Umkreis von
            5 Kilometern um den Parkplatz liegt ein Gipfel
          </p>
        </div>
        <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
          {[1000, 1300, 1500].map((m) => (
            <div key={m} className="rounded-xl border border-line bg-card p-4">
              <p className="text-sm text-muted">ab {nf.format(m)} m</p>
              <p className="text-3xl font-bold tabular-nums">{nf.format(stufe(m))}</p>
              <p className="text-sm text-muted">Wanderparkplätze</p>
            </div>
          ))}
        </div>
        <div className="max-w-3xl space-y-4">
          <p className="text-muted">
            Die Höhe des Parkplatzes selbst steht in OpenStreetMap fast nie; die der Gipfel meistens.
            Wo die Ausgangspunkte mit Gipfeln ab 1.300 Metern liegen — nicht nur in den Alpen:
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">Landkreise mit Wanderparkplätzen, die einen Gipfel ab 1.300 m im Umkreis von 5 km haben</caption>
              <thead className="bg-sand text-left text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Landkreis</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Plätze</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Höchster Gipfel</th>
                </tr>
              </thead>
              <tbody>
                {hoch.kreise.map((k) => (
                  <tr key={k.slug} className="border-t border-line align-top">
                    <td className="px-4 py-2.5">
                      <Link href={`/kreis/${k.slug}`} className="font-medium hover:text-accent">
                        {k.kreis}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{nf.format(k.plaetze)}</td>
                    <td className="px-4 py-2.5">
                      {k.gipfel} <span className="whitespace-nowrap tabular-nums text-muted">{nf.format(k.hoehe_m)} m</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            Gipfel bis 5 km Luftlinie vom Parkplatz. Ein Gipfel in Reichweite heißt nicht, dass der
            Weg im Winter offen oder ohne Steigeisen gangbar ist.
          </p>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel
        id="oder"
        titel="Grödel oder Steigeisen"
        unterzeile="Die Frage, die über die Sicherheit entscheidet — nicht über den Preis."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Der DAV schreibt es deutlich: Leichtsteigeisen bieten{" "}
            <a href={QUELLEN.leichtsteigeisen} className="underline hover:text-accent" rel="noopener" target="_blank">
              „deutlich mehr Sicherheit als Grödel“
            </a>
            , und auf hart gefrorenen Altschneefeldern gehe ohne Steigeisen meistens nichts mehr.
            Der Grund ist Physik. Wer auf einem harten, 40 Grad steilen Firnfeld ins Rutschen kommt,
            erreicht nach Untersuchungen, die der DAV zitiert, fast die Geschwindigkeit des freien
            Falls. Kurze Zacken an einer Kette halten das nicht auf.
          </p>
          <p>
            Die Faustregel unten folgt diesen beiden Artikeln. Sie ersetzt nicht den Blick auf das
            Schneefeld vor dir — der DAV rät, umzudrehen, wenn schon die ersten Schritte nicht sicher
            sind.
          </p>
        </div>
        <Groedelberater angebote={groessenAngebote} />
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
          <Produktbild preis={sp} alt={`${STEIGEISEN.marke} ${STEIGEISEN.name}`} href={partnerUrl(STEIGEISEN.asin)} />
          <div>
            <p className="text-sm font-semibold text-warn">Wenn es ein Steigeisen sein muss</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight">
              {STEIGEISEN.marke} {STEIGEISEN.name}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
              {STEIGEISEN.text} Kein Leichtsteigeisen — die liegen laut DAV bei 250 bis 850 Gramm —,
              sondern ein vollwertiges Steigeisen. Wer damit zum ersten Mal geht, übt vorher.
            </p>
            <Affiliatelink url={urlVon(STEIGEISEN.asin)} preis={sp} name={`${STEIGEISEN.marke} ${STEIGEISEN.name}`} knapp />
          </div>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel
        id="groesse"
        titel="Die richtige Größe"
        unterzeile="Gemessen am Wanderschuh, nicht am Straßenschuh."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Grödel werden nach Schuhgröße verkauft, meist in Stufen von drei bis vier Größen. Zu
            groß, und sie rutschen beim Gehen zur Seite, bis die Zacken neben statt unter der Sohle
            liegen. Zu klein, und der Gummi ist dauernd überdehnt — er reißt früher, meist an den
            Ösen, wo die Kette hängt.
          </p>
          <p>
            Maßgeblich ist der Schuh, über den sie kommen. Ein Winterstiefel fällt manchmal eine
            Nummer größer aus als der Halbschuh. Wer auf der Grenze zweier Größen liegt, probiert beide über
            dem echten Schuh. Die Größen und Preise aller Modelle:
          </p>
        </div>
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {GROEDEL.map((g) => (
            <div key={g.name} className="grid gap-3 p-4 sm:grid-cols-[12rem_1fr] sm:items-center sm:px-5">
              <a href={`#${standardGroesse(g).asin}`} className="font-semibold hover:text-accent">
                <span className="block text-xs font-normal text-muted">{g.marke}</span>
                {g.name}
              </a>
              <div className="flex flex-wrap gap-2">
                {g.groessen.map((x) =>
                  knopf(
                    x.asin,
                    `${g.marke} ${g.name} Größe ${x.k}`,
                    <>
                      {x.k}
                      {x.schuh && <span className="font-normal text-muted"> · {x.schuh[0]}–{x.schuh[1]}</span>}
                    </>,
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="max-w-3xl text-xs text-muted">
          Anzeige. Alle Knöpfe führen zu Amazon und tragen eine Partnerkennung. Preise und
          Verfügbarkeit: Stand {zeitVon(erste.asin)} Uhr. {PREISHINWEIS} Schuhgrößen
          nur, wo das Angebot sie nennt. Wo sie fehlen, steht die Tabelle meist auf den Produktbildern.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="zacken" titel="Zacken, Kette, Gummi" unterzeile="Drei Teile, drei Schwachstellen." breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Zacken",
              text: "Länge schlägt Anzahl. Die Markenmodelle hier nennen 10 bis 13 Millimeter. Längere Zacken greifen auf hartem Eis besser, stolpern aber eher über Steine und Wurzeln. Wichtig ist, dass auch unter der Ferse Zacken sitzen — bergab steht man auf ihr.",
            },
            {
              titel: "Kette",
              text: "Edelstahl rostet kaum und bleibt beweglich. Die Kette muss locker genug sein, dass Schnee herausfällt, statt sich zwischen den Gliedern zu Klumpen zu stollen.",
            },
            {
              titel: "Gummi und Ösen",
              text: "Der Gummi muss auch bei Frost dehnbar bleiben — Kahtoola nennt −30 °C, Snowline für die Light −50 °C. Kahtoola nennt die Ösen, wo Gummi und Kette sich treffen, die Schwachstelle; Kahtoola und Snowline verstärken sie eigens.",
            },
          ]}
        />
        <div className="max-w-3xl">
          <Merksatz>
            Zieh neue Grödel vor dem ersten Winter zu Hause über die Wanderschuhe — mit Socken, in
            der Diele. Wer auf dem vereisten Parkplatz zum ersten Mal an einem steifen Gummi zerrt,
            merkt dort, dass die Größe nicht stimmt.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="anlegen" titel="Grödel anlegen und damit gehen" breit>
        <ol className="max-w-3xl space-y-4">
          {[
            ["Vorn zuerst.", "Die Spitze des Schuhs in die vordere Schlaufe, dann den Gummi mit einem Zug über die Ferse. Eine Lasche hinten, wie bei Camp, hilft dabei."],
            ["Mittig ausrichten.", "Die Ketten liegen gerade unter der Sohle, die Zacken zeigen nach unten, nichts hängt seitlich über. Wo ein Riemen oder Klett dabei ist, jetzt schließen."],
            ["Ganze Sohle aufsetzen.", "Nicht auf der Ferse abrollen wie auf Asphalt, sondern flach auftreten, damit alle Zacken greifen. Etwas breitbeiniger gehen, sonst verhaken sich die Zacken an der anderen Hose."],
            ["Bergab kurze Schritte.", "Das Gewicht über die Füße, nicht nach hinten lehnen. Stöcke geben dabei den meisten zusätzlichen Halt."],
            ["Auf freien Abschnitten ausziehen.", "Auf Fels, Steinplatten und Asphalt greifen Metallzacken schlecht und nutzen sich ab."],
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
          Mit Stöcken? Unbedingt, sobald es bergab geht. Wie lang sie sein sollten und welche sich im
          Winter bewähren, steht im{" "}
          <Link href="/ausruestung/wanderstoecke" className="underline hover:text-accent">
            Stock-Vergleich
          </Link>
          .
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel
        id="test"
        titel="Grödel im Test"
        unterzeile="Die Stiftung Warentest hat keine getestet. Zwei andere haben es getan."
        breit
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-5">
            <p className="text-sm font-semibold text-accent">Bergzeit · Dezember 2025</p>
            <h3 className="mt-1 font-semibold">16 Modelle, ausprobiert von einem Händler</h3>
            <ul className="mt-3 space-y-1.5 text-[0.97rem] leading-relaxed text-muted">
              <li><strong className="text-foreground">Wandern und Rodeln:</strong> LACD Snow Spikes Easy vorn, dazu Camp Ice Master Light (302 g) und Snowline Chainsen Light (230 g)</li>
              <li><strong className="text-foreground">Bergwandern:</strong> Salewa MTN Spikes, 18 Zacken, 374 g</li>
              <li><strong className="text-foreground">Trailrunning:</strong> Grivel Explorer Light, 200 g</li>
              <li><strong className="text-foreground">Alltag:</strong> Snowline Chainsen City, 60 g</li>
            </ul>
            <a href={QUELLEN.bergzeit} className="mt-3 inline-block text-sm underline hover:text-accent" rel="noopener" target="_blank">
              Zum Bergzeit-Test
            </a>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <p className="text-sm font-semibold text-accent">Saldo, Schweiz · Heft 19/2023</p>
            <h3 className="mt-1 font-semibold">Schuhspikes für den Alltag</h3>
            <p className="mt-3 text-[0.97rem] leading-relaxed text-muted">
              Der Titel fasst das Ergebnis zusammen: „Die günstigsten Schuhspikes haften auf Eis am
              besten“. Die Einzelergebnisse stehen hinter einer Bezahlschranke. Snowline teilt mit,
              die Chainsen City hätten die beste Note bekommen. Saldo zitiert die Schweizer
              Unfallversicherung Suva: Bei Eis- und Schneeglätte gebe es bis zu viermal mehr Stürze
              als an anderen Tagen.
            </p>
            <a href={QUELLEN.saldo} className="mt-3 inline-block text-sm underline hover:text-accent" rel="noopener" target="_blank">
              Zum Saldo-Test
            </a>
          </div>
        </div>
        <p className="max-w-3xl">
          Einordnen muss man beides: Bergzeit verkauft die getesteten Grödel selbst, und Saldo hat
          Alltagsspikes geprüft, nicht Grödel für den Berg. Als Hinweis darauf, welche Modelle sich
          bewähren, taugen sie trotzdem — und sie decken sich mit dem, was die Hersteller angeben.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[52rem] text-sm">
            <caption className="sr-only">Grödel im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-32 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {GROEDEL.map((g) => (
                  <th key={g.name} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${standardGroesse(g).asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{g.marke}</span>
                      {g.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (g) => <strong className="tabular-nums">{preisVon(standardGroesse(g).asin)}</strong>],
                  ["Zacken", (g) => (g.zacken ? `${g.zacken}${g.zackenMm ? ` × ${g.zackenMm} mm` : ""}` : <span className="text-muted">k. A.</span>)],
                  ["Gewicht", (g) => (g.gramm ? `${g.gramm} g (${g.grammQuelle})` : <span className="text-muted">k. A.</span>)],
                  ["Befestigung", (g) => g.befestigung],
                  ["Größen", (g) => g.groessen.map((x) => x.k).join(", ")],
                  ["Einsatz", (g) => g.einsatz],
                  ["Besonders", (g) => g.besonderheit],
                  [
                    "Angebot",
                    (g) => (
                      <a
                        href={urlVon(standardGroesse(g).asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(standardGroesse(g).asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {g.marke} {g.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (g: (typeof GROEDEL)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {GROEDEL.map((g) => (
                    <td key={g.name} className="px-3 py-3 leading-snug">{f(g)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Zacken und Befestigung aus den Herstellerangaben, Gewichte aus dem Bergzeit-Test, wo
          vermerkt. Preise für die Größe zu Schuhgröße 42. „k. A.“: nicht angegeben. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Grödel einzeln" unterzeile="Zu jedem steht, wogegen er spricht und wer ihn nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
        <p className="max-w-3xl text-muted">
          Nicht dabei: Die LACD Snow Spikes Easy, die Bergzeit fürs Wandern vorn sah, und die Grivel
          Explorer Light, die dort fürs Trailrunning überzeugten. Bei Amazon fanden wir sie nur in
          einzelnen Größen oder mit unvollständigem Angebot.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="alltag" titel="Spikes für Schuhe im Alltag" unterzeile="Für Gehweg, Haltestelle und den Weg vom Auto zum Wanderweg.">
        <p>
          Wer „Spikes für Schuhe“ sucht, meint meist nicht den Berg, sondern den Gehweg bei Glatteis.
          Dafür sind Grödel mit langen Zacken zu viel, und auf Fliesen und glattem Stein im Bus
          oder im Geschäft können Metallzacken sogar rutschen. Alltagsspikes haben wenige, kurze Stifte, wiegen
          fast nichts und passen in die Jackentasche — anziehen draußen, ausziehen vor der Tür.
        </p>
        <p>
          Gerade für Ältere, bei denen ein Sturz schwerer wiegt, ist das eine der günstigsten
          Vorsichtsmaßnahmen im Winter. Wichtig ist nur, dass sie schnell an- und auszuziehen sind,
          ohne sich tief zu bücken — im Zweifel auf einer Bank oder im Sitzen.
        </p>
        <div className="grid gap-5 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
          <Produktbild preis={cp} alt={`${CITY.marke} ${CITY.name}`} href={partnerUrl(standardGroesse(CITY).asin)} />
          <div>
            <p className="text-sm font-semibold text-accent">{CITY.abzeichen}</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight">{CITY.marke} {CITY.name}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{CITY.einordnung}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CITY.groessen.map((x) => knopf(x.asin, `${CITY.marke} ${CITY.name} Größe ${x.k}`, x.k))}
            </div>
            <p className="mt-2 text-xs text-muted">Anzeige · Preise und Verfügbarkeit: Stand {zeitVon(standardGroesse(CITY).asin)} Uhr. {PREISHINWEIS}</p>
          </div>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Trocknen, lagern, ersetzen">
        <p>
          Nach der Tour aus dem Beutel nehmen und trocknen lassen, nicht auf der Heizung. Auch
          Edelstahl kann Flugrost ansetzen, wenn er wochenlang nass im Beutel liegt. Streusalz vom
          Parkplatz mit klarem Wasser abspülen.
        </p>
        <p>
          Vor dem Winter einmal durchsehen: Sind die Ösen eingerissen? Ist ein Kettenglied offen?
          Sind die Zacken so abgenutzt, dass sie rund statt spitz sind? Dann ersetzen. Grödel sind
          keine Anschaffung fürs Leben, und ein Riss im Gummi kündigt sich selten an, bevor er
          durchgeht.
        </p>
        <Merksatz>
          Grödel immer im Beutel transportieren. Die Zacken reißen sonst Löcher in Rucksack,
          Daunenjacke und Isomatte.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel id="nichts" titel="Wann Grödel nichts bringen">
        <p>
          <strong>Im tiefen Pulverschnee.</strong> Die Zacken greifen ins Leere, man sinkt trotzdem
          ein. Da helfen Schneeschuhe, keine Grödel.
        </p>
        <p>
          <strong>Auf harten, steilen Schneefeldern und Gletschern.</strong> Dort geben sie ein
          Gefühl von Halt, das sie im Ernstfall nicht halten. Das ist die gefährlichste Art, Grödel
          falsch einzusetzen.
        </p>
        <p>
          <strong>Auf Fels und nassen Steinplatten.</strong> Metall auf Stein rutscht. Wer über
          einen Blockgrat oder eine Felsstufe muss, zieht sie vorher aus.
        </p>
        <p>
          <strong>Auf Asphalt und geräumten Wegen.</strong> Dort nutzen sie sich nur ab und machen
          den Schritt unsicher.
        </p>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Für Winterwanderungen im Mittelgebirge und auf vereisten Wegen in den Bergen. Fünf Größen
          von 32 bis 52, jede mit Schuhgrößen im Angebot, laut Snowline als Gleitschutz geprüft. Nichts
          Aufregendes — genau das, was man von Grödeln will.
        </p>
        <p className="mt-2 text-muted">
          Wenn du öfter auf hartem Eis unterwegs bist, nimm den{" "}
          <a href={`#${standardGroesse(GROEDEL[1]).asin}`} className="underline hover:text-accent">Camp Ice Master Light</a>{" "}
          mit 13 Millimeter langen Zacken.
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
          Wir haben diese Grödel nicht getestet und behaupten das auch nicht. Was hier steht, ist
          eine Zusammenstellung aus Herstellerangaben, dem Praxistest eines Händlers, einem
          Verbrauchertest aus der Schweiz und den Empfehlungen des Deutschen Alpenvereins — plus
          die Einschätzung, welche Merkmale im Alltag zählen.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.leichtsteigeisen} className="underline hover:text-accent" rel="noopener" target="_blank">
              Leichtsteigeisen: Was man wissen muss
            </a>
            : Grödel und Leichtsteigeisen, Bindungen, Gewichte, Pflege.
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.schneefelder} className="underline hover:text-accent" rel="noopener" target="_blank">
              Vorsicht Rutschgefahr: Schneefelder
            </a>
            : Altschneefelder, Rutschgeschwindigkeit, Ausrüstung.
          </li>
          <li>
            Bergzeit,{" "}
            <a href={QUELLEN.bergzeit} className="underline hover:text-accent" rel="noopener" target="_blank">
              Grödel im Test
            </a>
            , Dezember 2025: 16 Modelle, Gewichte und Zackenzahl.
          </li>
          <li>
            Saldo,{" "}
            <a href={QUELLEN.saldo} className="underline hover:text-accent" rel="noopener" target="_blank">
              Die günstigsten Schuhspikes haften auf Eis am besten
            </a>
            , Heft 19/2023.
          </li>
          <li>
            Gipfel im Umkreis: eigener Datenbestand aus OpenStreetMap, Gipfel mit eingetragener Höhe
            bis 5 km Luftlinie vom Parkplatz — mehr dazu unter{" "}
            <Link href="/ueber-uns" className="underline hover:text-accent">Über uns</Link>.
          </li>
          <li>
            Technische Angaben: Herstellerangaben zum jeweiligen Artikel. Preise und Bilder: Amazon,
            stündlich abgerufen. {PREISHINWEIS}
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
            <Link href="/ausruestung/wanderstoecke" className="font-medium hover:text-accent">Wanderstöcke im Vergleich</Link>
            <p className="text-sm text-muted">Bergab auf Eis der zweitwichtigste Halt.</p>
          </li>
          <li>
            <Link href="/ausruestung/wanderrucksack" className="font-medium hover:text-accent">Wanderrucksack im Vergleich</Link>
            <p className="text-sm text-muted">Im Winter eine Größenklasse mehr.</p>
          </li>
          <li>
            <Link href="/region/zugspitzregion" className="font-medium hover:text-accent">Wanderparkplätze in der Zugspitzregion</Link>
            <p className="text-sm text-muted">Ausgangspunkte unter Alpspitze, Kramerspitz und Waxenstein.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
