import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Wasserberater, { type FilterAngebot } from "@/components/ausruestung/Wasserberater";
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
  PorenBild,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import { FILTER, FRAGEN, QUELLEN, alsProdukt } from "@/lib/ausruestung/wasserfilter";
import { einkehrLuecke } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";
import { sichtbar } from "@/lib/ausruestung/freigabe";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Wasserfilter für Outdoor und Wandern: Was er zurückhält, was nicht — und welcher passt";

export const metadata: Metadata = {
  title: titel("Wasserfilter Outdoor: Test, Viren, Wandern — acht im Vergleich"),
  description: beschreibung(
    "Welche Erreger ein Outdoor-Wasserfilter zurückhält und welche nicht, Filter, Tabletten oder Abkochen, was die Tests sagen — und acht Lösungen von Katadyn bis LifeStraw im Vergleich.",
  ),
  alternates: { canonical: "/ausruestung/wasserfilter" },
};

const KAPITEL: [string, string][] = [
  ["brauche", "Brauchst du einen Wasserfilter?"],
  ["erreger", "Was ein Filter zurückhält — und was nicht"],
  ["systeme", "Flasche, Squeeze, Strohhalm, Pumpe, Presse"],
  ["alternativen", "Abkochen, Tabletten, UV-Licht"],
  ["frost", "Frost: der unsichtbare Defekt"],
  ["test", "Wasserfilter im Test"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Filter einzeln"],
  ["reinigen", "Reinigen und lagern"],
  ["nachfuellen", "Wo du unterwegs Wasser findest"],
  ["nichts", "Wann du keinen brauchst"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  B075X5R67T: "Unsere erste Wahl",
  B00B1OSU4W: "Für alles einsetzbar",
  B00TOX6UM6: "Klein, für den Notfall",
  B09SBPP9R9: "Zum direkten Trinken",
  B093VHYHWW: "Für Reisen, mit Virenschutz",
  B075TTTX2R: "Für Gruppen",
  B0043DB1ZI: "Als Backup",
  B073R8F3HP: "Günstig, viel Kapazität",
};

export default async function Wasserfilter() {
  // Erscheint erst zum Freigabezeitpunkt, bis dahin 404 (siehe lib/ausruestung/freigabe.ts).
  if (!sichtbar("/ausruestung/wasserfilter")) notFound();
  const [p, einkehr] = await Promise.all([preise(FILTER.map((f) => f.asin)), einkehrLuecke()]);
  const PRODUKTE = FILTER.map(alsProdukt);
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

  const angebote: FilterAngebot[] = FILTER.map((f) => ({
    name: `${f.marke} ${f.name}`,
    liter: f.prinzip === "Tabletten" ? null : f.liter,
    durchfluss: f.durchfluss,
    viren: f.viren,
    tabletten: f.prinzip === "Tabletten",
    url: urlVon(f.asin),
    anzeige: p.get(f.asin)?.anzeige ?? null,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/wasserfilter`,
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
        aktuell="Wasserfilter"
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
          Ein Wasserfilter macht aus jedem Bach eine Quelle — mit einer Einschränkung, die man vor dem
          Kauf kennen muss: Die gängigen Outdoor-Filter halten Bakterien und Parasiten zurück,
          aber keine Viren. In den Alpen ist das meist kein Problem, auf Reisen schon. Deshalb steht
          hier die Frage, was ein Filter kann, vor der Frage, welcher.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${FILTER.length} Lösungen verglichen`, "Wasserberater", "Porengröße nach CDC", "Frost, Abkochen, Tabletten"].map((t) => (
            <li key={t} className="rounded-full border border-line bg-card px-3 py-1">
              {t}
            </li>
          ))}
        </ul>
      </header>

      {/* ─────────────────────────── Übersicht ─────────────────────────── */}
      <section id="uebersicht" className="mt-8 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Alle acht auf einen Blick</h2>
          <a href="#modelle" className="text-sm text-muted underline hover:text-accent">
            Zu den ausführlichen Einschätzungen
          </a>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">Anzeige:</strong> Bilder, Namen und grüne Knöpfe
          führen zu Amazon und tragen eine Partnerkennung. {PARTNER} Für dich ändert sich am Preis
          nichts. Die Spalte zeigt, wie viele Liter ein Filter laut Hersteller schafft, bevor er
          getauscht werden muss.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Kapazität"
            kennwertLeer="k. A."
            zeilen={PRODUKTE.map((s) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[s.asin],
              url: partnerUrl(s.asin),
            }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{PREISHINWEIS} Bei den Tabletten: Liter je Packung.</p>
      </section>

      <div className="mt-12">
        <Inhalt eintraege={KAPITEL} />
      </div>

      {/* ─────────────────────────── 1 ─────────────────────────── */}
      <Kapitel id="brauche" titel="Brauchst du einen Wasserfilter?" unterzeile="Auf der Tagestour selten, auf mehreren Tagen oft." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Auch klares, kaltes, fließendes Wasser kann Krankheitserreger enthalten, schreibt die{" "}
            <a href={QUELLEN.bergwelten} className="underline hover:text-accent" rel="noopener" target="_blank">
              Bergwelten-Redaktion
            </a>
            . In hochalpinen Regionen sei das Risiko vergleichsweise gering, weil viele Bäche von
            Quellen oder Schmelzwasser gespeist werden — hundertprozentig sicher sei es trotzdem nicht,
            denn lebende oder verendete Wildtiere tragen Erreger ein. Für eine Tagestour in den Alpen
            muss deshalb nicht zwangsläufig ein Filter mit; wer regelmäßig aus Bächen trinkt oder
            mehrere Tage unterwegs ist, ist mit einem deutlich sicherer.
          </p>
          <p>Welche Methode zu deinem Wasser passt, und ob der Filter für die Tour reicht:</p>
        </div>
        <Wasserberater filter={angebote} zeit={zeitVon(erste.asin)} />
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="erreger" titel="Was ein Filter zurückhält — und was nicht" unterzeile="Es hängt an der Porengröße, und die CDC hat die Grenzen aufgeschrieben." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Die US-Gesundheitsbehörde{" "}
            <a href={QUELLEN.cdc} className="underline hover:text-accent" rel="noopener" target="_blank">
              CDC
            </a>{" "}
            teilt Filter nach der Porengröße ein: Bis 1 Mikrometer halten sie Parasiten wie Giardia
            zurück, aber keine Bakterien und Viren. Bis 0,3 Mikrometer halten sie Bakterien und
            Parasiten zurück, aber keine Viren. Umkehrosmose hält laut CDC alle drei zurück.
          </p>
        </div>
        <PorenBild />
        <div className="max-w-3xl space-y-5">
          <p>
            Die Hohlfaserfilter von Katadyn und Sawyer haben laut Hersteller 0,1 Mikrometer. Sie
            fallen in die zweite Gruppe. Katadyn schreibt in der Anleitung der BeFree ausdrücklich, sie
            beseitige keine Partikel unter 0,1 Mikrometer und keine Chemikalien.
          </p>
          <Merksatz>
            In den Alpen werden Erkrankungen nach Einschätzung der Bergwelten-Redaktion deutlich
            häufiger durch Bakterien und Parasiten verursacht als durch Viren. Dort reicht ein
            Hohlfaserfilter. Auf Reisen in Länder mit unsicherem Trinkwasser nicht.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="systeme" titel="Flasche, Squeeze, Strohhalm, Pumpe, Presse" unterzeile="Fünf Bauarten mit derselben Frage: Wie kommt das Wasser durch den Filter?" breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Filterflasche",
              text: "Weiche Flasche mit Filter im Deckel. Eintauchen, zuschrauben, trinken. Am einfachsten für Wanderer — Katadyn BeFree.",
            },
            {
              titel: "Squeeze-Filter",
              text: "Ein Filter zwischen Beutel und Flasche, Mund oder Trinkblase. Vielseitig, auch zum Befüllen für mehrere — Sawyer Squeeze und Mini.",
            },
            {
              titel: "Strohhalm",
              text: "Direkt aus Bach oder See trinken. Für den Notfall, weniger zum Abfüllen — LifeStraw.",
            },
            {
              titel: "Pumpe",
              text: "Schlauch ins Wasser, pumpen. Erreicht auch flache Rinnsale und versorgt mehrere Personen — Katadyn Hiker Pro.",
            },
            {
              titel: "Presse mit Virenschutz",
              text: "Wie eine Kaffeepresse, mit mehrstufiger Kartusche, die laut Hersteller auch Viren und Chemikalien zurückhält — Grayl GeoPress.",
            },
            {
              titel: "Tabletten",
              text: "Kein Filter, sondern Desinfektion mit Chlor und Silber. Leicht, frostsicher, aber mit Wartezeit — Micropur Forte.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="alternativen" titel="Abkochen, Tabletten, UV-Licht" unterzeile="Was ohne Filter geht — und was jede Methode nicht kann.">
        <p>
          <strong>Abkochen</strong> tötet laut CDC alle Erreger, Viren, Bakterien und Parasiten.
          Klares Wasser eine Minute sprudelnd kochen, oberhalb von 6500 Fuß — rund 2000 Metern — drei
          Minuten. Die zuverlässigste Methode, unterwegs aber oft unpraktisch: Sie braucht Kocher,
          Brennstoff und Zeit.
        </p>
        <p>
          <strong>Tabletten</strong> wie Micropur Forte arbeiten mit Chlor und Silberionen. Laut
          Packung brauchen sie 30 Minuten gegen Bakterien und Viren, 2 Stunden gegen Giardia. Die CDC
          schreibt, dass Chlor gegen Parasiten nicht gut wirkt — und dass man, wenn Abkochen nicht
          geht, erst filtern und dann desinfizieren soll.
        </p>
        <p>
          <strong>UV-Licht</strong>, etwa mit einem SteriPEN, macht laut Bergwelten Bakterien, Viren
          und Protozoen in rund 90 Sekunden pro Liter unschädlich, ohne den Geschmack zu verändern.
          Das Wasser muss aber klar sein, und das Gerät braucht Strom oder Batterien.
        </p>
        <Merksatz>
          Weder Tabletten noch UV-Licht entfernen Schwebstoffe oder Mikroplastik. Trübes Wasser erst
          vorfiltern oder absetzen lassen.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="frost" titel="Frost: der unsichtbare Defekt" unterzeile="Ein gefrorener Filter sieht aus wie vorher — und filtert womöglich nicht mehr.">
        <p>
          Hohlfasermembranen bestehen aus feinen Röhrchen, in denen Wasser steht. Friert es, können
          die Fasern Schaden nehmen, ohne dass man es sieht. Katadyn schreibt in der{" "}
          <a href={QUELLEN.katadyn} className="underline hover:text-accent" rel="noopener" target="_blank">
            Anleitung der BeFree
          </a>
          : nicht bei Temperaturen unter dem Gefrierpunkt verwenden, eine gefrorene Membran könne
          Mikroorganismen hindurchlassen.
        </p>
        <p>
          Im Herbst und auf Hütten heißt das: den Filter nachts in den Schlafsack oder die
          Jackeninnentasche nehmen, nicht im Rucksack vor der Tür lassen. Wer im Winter unterwegs
          ist, nimmt Tabletten als Ersatz mit — sie frieren nicht.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="test" titel="Wasserfilter im Test" unterzeile="Die Stiftung Warentest hat Reisefilter nie selbst untersucht.">
        <p>
          Das schreibt sie selbst: In einem Kommentar vom März 2024 teilt die Stiftung Warentest mit,
          sie habe bis jetzt keine Reisefilter untersucht. Der einzige Bericht stammt von{" "}
          <a href={QUELLEN.warentest} className="underline hover:text-accent" rel="noopener" target="_blank">
            2008
          </a>{" "}
          und gibt einen Test der Schweizer Konsumenteninfo AG wieder: fünf Systeme, am besten schnitt
          damals der MSR MiniWorks EX ab, der als einziger Wasser fast ohne Fremdgeschmack lieferte;
          empfehlenswert war auch der Katadyn Combi. Chemische Mittel wie Micropur Forte entfernten
          Keime ebenfalls, brauchten aber eine halbe Stunde.
        </p>
        <p>
          Wer „Wasserfilter Outdoor Test Stiftung Warentest“ sucht, stößt leicht auf den
          Wasserfilter-Test von 2022 — der betraf Tischwasserfilter für die Küche, nicht Filter für
          unterwegs.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[62rem] text-sm">
            <caption className="sr-only">Wasserfilter im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {FILTER.map((f) => (
                  <th key={f.asin} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${f.asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{f.marke}</span>
                      {f.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (f) => <strong className="tabular-nums">{preisVon(f.asin)}</strong>],
                  ["Prinzip", (f) => f.prinzip],
                  ["Poren", (f) => (f.poren ? `${String(f.poren).replace(".", ",")} µm` : <span className="text-muted">k. A.</span>)],
                  ["Viren", (f) => (f.viren ? "ja, laut Hersteller" : "nein")],
                  ["Kapazität", (f) => (f.liter ? `${f.liter.toLocaleString("de-DE")} l` : <span className="text-muted">k. A.</span>)],
                  ["Durchfluss", (f) => (f.durchfluss ? `${String(f.durchfluss).replace(".", ",")} l/min` : <span className="text-muted">k. A.</span>)],
                  ["Gewicht", (f) => (f.gramm ? `${f.gramm} g` : <span className="text-muted">k. A.</span>)],
                  ["Besonders", (f) => f.besonderheit],
                  [
                    "Angebot",
                    (f) => (
                      <a
                        href={urlVon(f.asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(f.asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {f.marke} {f.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (f: (typeof FILTER)[number]) => React.ReactNode][]
              ).map(([k, fn]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {FILTER.map((f) => (
                    <td key={f.asin} className="px-3 py-3 leading-snug">{fn(f)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Alle Angaben aus den Herstellertexten zum jeweiligen Artikel; bei den Tabletten ist die
          Kapazität die Literzahl einer Packung. „k. A.“: nicht angegeben. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Filter einzeln" unterzeile="Zu jedem steht, wogegen er spricht und wer ihn nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="reinigen" titel="Reinigen und lagern" breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Schütteln",
              text: "Die BeFree reinigt man laut Katadyn, indem man den Filter im Wasser schüttelt. Keine Rückspülung, kein Werkzeug.",
            },
            {
              titel: "Rückspülen",
              text: "LifeStraw legt dem Peak-Strohhalm Rückspülzubehör bei, für Sawyer-Filter gibt es Reinigungskolben. Damit drückt man sauberes Wasser rückwärts durch den Filter und löst Schmutz aus den Fasern.",
            },
            {
              titel: "Ausspülen",
              text: "Das Filterelement der Hiker Pro nimmt man laut Katadyn heraus und schwenkt es in klarem Wasser. Ist es verbraucht, gibt es Ersatzelemente.",
            },
          ]}
        />
        <p className="max-w-3xl">
          Nach der Tour den Filter nicht nass im Rucksack liegen lassen und vor Frost schützen. Wer
          im Herbst ins Auto am Wanderparkplatz steigt und den Rucksack über Nacht im Kofferraum
          lässt, hat bei Minusgraden womöglich einen Filter, dem man nicht mehr trauen kann.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="nachfuellen" titel="Wo du unterwegs Wasser findest" unterzeile="Ein Filter ist so gut wie die nächste Quelle.">
        <p>
          An <strong>{nf.format(einkehr.ohne)}</strong> der {nf.format(einkehr.gesamt)}{" "}
          Wanderparkplätze in unserem Verzeichnis liegt im Umkreis von 1,2 Kilometern keine Einkehr,
          an der man nachfüllen könnte. Unterwegs mag eine Hütte oder ein Brunnen kommen; am Parkplatz
          weißt du es nicht. Ein Filter macht den Bach am Weg zur Nachfüllstation — vorausgesetzt, es
          gibt einen.
        </p>
        <p>
          Brunnen mit dem Schild „Kein Trinkwasser“ sind kein Trinkwasser, auch wenn das Wasser klar
          aussieht. Wie viel man für eine Tour braucht, rechnet der Wasserrechner im{" "}
          <Link href="/ausruestung/trinkblase" className="underline hover:text-accent">
            Trinkblasen-Vergleich
          </Link>{" "}
          aus. Dort steht auch, welche Blase sich mit einem Filter kombinieren lässt.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="nichts" titel="Wann du keinen brauchst">
        <p>
          Auf Tagestouren, auf denen du alles Wasser vom Parkplatz mitnimmst, und auf Wegen mit
          Hütten und Brunnen, an denen man nachfüllen kann. Und im Winter, wenn Bäche gefroren sind
          und der Filter selbst gefährdet ist — dann sind Thermoskanne und Tabletten die bessere
          Wahl.
        </p>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Flasche in den Bach, zuschrauben, trinken. 63 Gramm, 2 Liter pro Minute, 1000 Liter
          Kapazität, gereinigt durch Schütteln. Für Wanderungen in den Alpen und im Mittelgebirge
          gibt es kaum etwas Einfacheres.
        </p>
        <p className="mt-2 text-muted">
          Wenn du außerhalb Europas unterwegs bist, nimm die{" "}
          <a href="#B093VHYHWW" className="underline hover:text-accent">Grayl GeoPress</a> — sie hält
          laut Hersteller auch Viren zurück.
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
          Einen aktuellen unabhängigen Test von Outdoor-Wasserfiltern gibt es nicht. Die Angaben
          stammen aus den Herstellertexten, der Anleitung von Katadyn, der Übersicht der CDC zur
          Wasseraufbereitung unterwegs und dem Wasserfilter-Ratgeber der Bergwelten-Redaktion.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            CDC,{" "}
            <a href={QUELLEN.cdc} className="underline hover:text-accent" rel="noopener" target="_blank">
              Water Treatment Options When Hiking, Camping, or Traveling
            </a>
            , zuletzt geprüft 30.01.2025: Porengrößen, Abkochen, Desinfektion.
          </li>
          <li>
            Bergwelten,{" "}
            <a href={QUELLEN.bergwelten} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wasserfilter: Sicher trinken aus Bach und Fluss
            </a>
            .
          </li>
          <li>
            Katadyn,{" "}
            <a href={QUELLEN.katadyn} className="underline hover:text-accent" rel="noopener" target="_blank">
              Bedienungsanleitung BeFree
            </a>
            : Frost, Grenzen der Membran.
          </li>
          <li>
            Stiftung Warentest,{" "}
            <a href={QUELLEN.warentest} className="underline hover:text-accent" rel="noopener" target="_blank">
              Reise-Wasserfilter: Keim- und chlorfrei
            </a>{" "}
            (28.08.2008, Test der Konsumenteninfo AG), mit dem Kommentar der Redaktion vom 25.03.2024.
          </li>
          <li>
            Wanderparkplätze ohne Einkehr: eigener Datenbestand aus OpenStreetMap, Umkreis 1.200 Meter —
            mehr unter <Link href="/ueber-uns" className="underline hover:text-accent">Über uns</Link>.
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
            <Link href="/ausruestung/trinkblase" className="font-medium hover:text-accent">Trinkblase im Vergleich</Link>
            <p className="text-sm text-muted">Mit Wasserrechner — und Filter-Anschluss.</p>
          </li>
          <li>
            <Link href="/ausruestung/erste-hilfe-set" className="font-medium hover:text-accent">Erste-Hilfe-Set im Vergleich</Link>
            <p className="text-sm text-muted">Falls es doch der falsche Bach war.</p>
          </li>
          <li>
            <Link href="/ausruestung/wanderrucksack" className="font-medium hover:text-accent">Wanderrucksack im Vergleich</Link>
            <p className="text-sm text-muted">Platz für Wasser für den ganzen Tag.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
