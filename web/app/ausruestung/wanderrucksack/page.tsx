import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Affiliatelink from "@/components/Affiliatelink";
import Volumenrechner, { type Angebot } from "@/components/ausruestung/Volumenrechner";
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
  RueckenlaengeBild,
  RueckensystemBild,
  PackBild,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import {
  RUCKSAECKE,
  TOUREN,
  FRAGEN,
  QUELLEN,
  TESTS,
  TESTSIEGER_2021,
  alsProdukt,
} from "@/lib/ausruestung/rucksaecke";
import { einkehrLuecke } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Wanderrucksack: Wie viel Liter, welche Rückenlänge, Damen oder Herren";

export const metadata: Metadata = {
  title: titel("Wanderrucksack: Liter, Rückenlänge, Damen oder Herren"),
  description: beschreibung(
    "Wie viel Liter du brauchst, wie du die Rückenlänge misst, was Damenmodelle anders machen, Netz- oder Kontaktrücken — und sieben Wanderrucksäcke von Deuter, Vaude und Osprey mit ihren Schwächen.",
  ),
  alternates: { canonical: "/ausruestung/wanderrucksack" },
};

const KAPITEL: [string, string][] = [
  ["groesse", "Wie viel Liter?"],
  ["damen", "Damen oder Herren"],
  ["rueckenlaenge", "Rückenlänge messen"],
  ["ruecken", "Netzrücken oder Kontaktrücken"],
  ["einstellen", "Hüftgurt und richtig einstellen"],
  ["packen", "Richtig packen"],
  ["regen", "Regen: Hülle, Packsack, wasserdicht"],
  ["gewicht", "Wie leicht muss er sein?"],
  ["tests", "Wanderrucksack im Test: Was Saldo und dTest fanden"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Rucksäcke einzeln"],
  ["trinkblase", "Trinkblase im Rucksack"],
  ["pflege", "Reinigen und lagern"],
  ["nichts", "Wann du keinen neuen brauchst"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  B0FHKWGD68: "Unsere erste Wahl",
  B0D6BXNYCK: "Rückenlänge verstellbar",
  B0B21SBFT6: "Preis-Leistung",
  B097Q25692: "Wenn jedes Gramm zählt",
  B0DSCP1V9L: "Für Grate und schnelle Touren",
  B08JQXWNDK: "Für Hüttentouren",
  B0BX2YWLTG: "Zum Ausprobieren",
};

const ja = (x: boolean | null) =>
  x === null ? <span className="text-muted">k. A.</span> : x ? "ja" : "nein";

export default async function Wanderrucksack() {
  const [p, einkehr] = await Promise.all([
    preise([
      ...RUCKSAECKE.flatMap((r) => [r.asin, ...(r.damen ? [r.damen.asin] : [])]),
      TESTSIEGER_2021.asin,
    ]),
    einkehrLuecke(),
  ]);
  const PRODUKTE = RUCKSAECKE.map(alsProdukt);
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

  // Alle Ausführungen für den Rechner: die Herren-/Unisex-Modelle und ihre Damen-Schwestern.
  const angebote: Angebot[] = RUCKSAECKE.flatMap((r) => [
    {
      name: `${r.marke} ${r.name}`,
      liter: r.liter,
      damen: false,
      url: urlVon(r.asin),
      anzeige: p.get(r.asin)?.anzeige ?? null,
      zeit: zeitVon(r.asin),
    },
    ...(r.damen
      ? [
          {
            name: `${r.marke} ${r.damen.name}`,
            liter: r.damen.liter,
            damen: true,
            url: urlVon(r.damen.asin),
            anzeige: p.get(r.damen.asin)?.anzeige ?? null,
            zeit: zeitVon(r.damen.asin),
          },
        ]
      : []),
  ]);

  const knopf = (asin: string, text: string) => (
    <a
      href={urlVon(asin)}
      rel="sponsored nofollow noopener"
      target="_blank"
      className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
    >
      {preisVon(asin)} <span aria-hidden>→</span>
      <span className="sr-only"> {text} bei Amazon, Anzeige</span>
    </a>
  );

  const brenta = RUCKSAECKE.find((r) => r.asin === "B0D6BXNYCK")!;
  const zugspitze = RUCKSAECKE.find((r) => r.asin === "B0B21SBFT6")!;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/wanderrucksack`,
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
        aktuell="Wanderrucksack"
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
          Die meisten Rucksäcke drücken nicht, weil sie schlecht sind, sondern weil sie nicht passen:
          zu lang, zu kurz, zu groß für das, was drin ist, oder mit dem Hüftgurt auf dem Bauch statt
          auf den Hüftknochen. Deshalb stehen hier Liter, Rückenlänge und das Einstellen vor der
          Produktliste — die Auswahl ist danach schnell getroffen.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            `${RUCKSAECKE.length} Rucksäcke, ${RUCKSAECKE.filter((r) => r.damen).length} mit Damen-Ausführung`,
            "Literrechner",
            "Rückenlänge messen",
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
          <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Alle sieben auf einen Blick</h2>
          <a href="#modelle" className="text-sm text-muted underline hover:text-accent">
            Zu den ausführlichen Einschätzungen
          </a>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">Anzeige:</strong> Bilder, Namen und grüne Knöpfe
          führen zu Amazon und tragen eine Partnerkennung. {PARTNER} Für dich ändert sich am Preis
          nichts. Die Damen-Ausführungen stehen im Kapitel{" "}
          <a href="#damen" className="underline hover:text-accent">Damen oder Herren</a>.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Volumen"
            zeilen={PRODUKTE.map((s) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[s.asin],
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
        id="groesse"
        titel="Wie viel Liter?"
        unterzeile="Weniger, als die meisten kaufen. Ein großer Rucksack wird nicht leichter, weil er halb leer ist."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Für eine Tagestour reichen 18 bis 25 Liter: Regenjacke, eine warme Schicht, Proviant,
            Wasser, Erste Hilfe. Für eine Hütte mit ein, zwei Übernachtungen kommen Hüttenschlafsack,
            Wechselwäsche und Waschzeug dazu, das sind 25 bis 35 Liter. Die Bergführer von
            Alpinewelten nennen 40 Liter für eine ganze Woche von Hütte zu Hütte{" "}
            <a href={QUELLEN.bergfuehrer} className="underline hover:text-accent" rel="noopener" target="_blank">
              „üppig und ausreichend“
            </a>{" "}
            — und schreiben gleich dazu, größer solle es auf keinen Fall werden.
          </p>
          <p>
            Zwei Dinge schieben die Zahl nach oben: Winter, weil dicke Kleidung Platz braucht, und
            Touren ohne Einkehr, weil dann Essen und Wasser für den ganzen Tag im Rucksack stecken.
          </p>
        </div>
        <Volumenrechner touren={TOUREN} angebote={angebote} ohneEinkehr={einkehr.ohne} gesamt={einkehr.gesamt} />
        <div className="max-w-3xl space-y-5">
          <Merksatz>
            Wer zwischen zwei Größen schwankt, nimmt für Tagestouren die kleinere. Ein Rucksack, der
            gerade so zugeht, trägt sich besser als einer, in dem alles nach unten sackt.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel
        id="damen"
        titel="Damen oder Herren"
        unterzeile="Kein Marketing: Damenmodelle sind anders gebaut, nicht nur anders gefärbt."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Damenrucksäcke haben ein kürzeres Tragesystem und sind an Schultern, Brust und Hüfte der
            weiblichen Anatomie angepasst. Deuter geht in seiner Beratung so weit, Frauen{" "}
            <a href={QUELLEN.rueckenlaenge} className="underline hover:text-accent" rel="noopener" target="_blank">
              stets ein SL-Modell
            </a>{" "}
            zu empfehlen — SL steht bei Deuter für die Damenpassform. Vaude baut eigene Damenmodelle
            mit „frauenspezifischer Konstruktion“, bei Osprey tragen sie eigene Namen: Der Talon für Herren hat den Tempest
            als Schwester.
          </p>
          <p>
            Umgekehrt kann eine Frau mit langem Rücken mit einem Unisex-Modell besser zurechtkommen
            und ein Mann mit kurzem Rücken mit einem Damenmodell. Entscheidend ist nicht, was auf
            dem Etikett steht, sondern ob die{" "}
            <a href="#rueckenlaenge" className="underline hover:text-accent">Rückenlänge</a> passt
            und der Hüftgurt auf dem Beckenkamm sitzt.
          </p>
        </div>
        {/* Zwei Spalten ohne Scrollen: Auf dem Handy muss die Damenspalte sichtbar
            sein, ohne dass man sie erst seitlich suchen muss. relative hält die
            absolut positionierten Vorlesetexte im Rahmen. */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-card">
          <table className="w-full table-fixed text-sm">
            <caption className="sr-only">Wanderrucksäcke in Herren- und Damenausführung</caption>
            <thead className="bg-sand text-left text-muted">
              <tr>
                <th scope="col" className="px-3 py-3 font-medium sm:px-5">Herren / Unisex</th>
                <th scope="col" className="px-3 py-3 font-medium sm:px-5">Damen</th>
              </tr>
            </thead>
            <tbody>
              {RUCKSAECKE.map((r) => (
                <tr key={r.asin} className="border-t border-line align-top">
                  <td className="px-3 py-3 sm:px-5">
                    <span className="block text-xs text-muted">{r.marke}</span>
                    <a href={`#${r.asin}`} className="font-semibold hover:text-accent">{r.name}</a>
                    <span className="text-muted"> · {r.liter} l</span>
                    <span className="mt-1.5 block">{knopf(r.asin, `${r.marke} ${r.name}`)}</span>
                  </td>
                  <td className="border-l border-line px-3 py-3 sm:px-5">
                    {r.damen ? (
                      <>
                        <span className="block text-xs text-muted">{r.marke}</span>
                        <span className="font-semibold">{r.damen.name}</span>
                        <span className="text-muted"> · {r.damen.liter} l</span>
                        <span className="mt-1.5 block">{knopf(r.damen.asin, `${r.marke} ${r.damen.name}`)}</span>
                        {r.damen.hinweis && <span className="mt-1 block text-xs text-muted">{r.damen.hinweis}</span>}
                      </>
                    ) : (
                      <span className="text-muted">keine Damenausführung</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-xs text-muted">
          Anzeige. Alle Knöpfe führen zu Amazon und tragen eine Partnerkennung. {PREISHINWEIS} Die
          Damenausführungen haben oft ein paar Liter weniger oder mehr — beim Vergleich auf die
          Literzahl achten.
        </p>
        <div className="max-w-3xl">
          <Merksatz>
            Der Osprey Tempest ist in einer erweiterten Passform für einen Hüftumfang bis 178
            Zentimeter zu haben. Wer mit Standard-Hüftgurten nie zurechtkam, sollte den kennen.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel
        id="rueckenlaenge"
        titel="Rückenlänge messen"
        unterzeile="Nicht die Körpergröße entscheidet, sondern der Abstand zwischen Nacken und Becken."
        breit
      >
        <p className="max-w-3xl">
          Zwei Menschen mit 1,75 Metern können Rückenlängen haben, die mehrere Zentimeter
          auseinanderliegen — der eine hat lange Beine, der andere einen langen Oberkörper. Deshalb
          wird gemessen, nicht geschätzt. Die Methode, wie Deuter sie beschreibt:
        </p>
        <RueckenlaengeBild />
        <div className="max-w-3xl space-y-5">
          <p>
            Mit dem Maß in der Hand zeigt die Größentabelle des Herstellers, welche Ausführung passt.
            Einheitlich sind diese Tabellen nicht — für jeden Hersteller neu nachsehen.
          </p>
          <p>
            Einige Rucksäcke lassen sich in der Rückenlänge verstellen. Bei den Modellen hier geben
            das <a href={`#${brenta.asin}`} className="underline hover:text-accent">Vaude Brenta</a>{" "}
            und der <a href="#B0DSCP1V9L" className="underline hover:text-accent">Osprey Talon</a>{" "}
            ausdrücklich an. Das ist praktisch, wenn der Rucksack in der Familie wandert, ersetzt aber
            nicht die Anprobe.
          </p>
          <Merksatz>
            Die Probe beim Anziehen: Der Ansatz der Schulterträger sollte zwischen den Schulterblättern
            liegen, wenn der Hüftgurt auf den Hüftknochen sitzt. Schweben die Träger über den
            Schultern, ist der Rucksack zu lang.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel
        id="ruecken"
        titel="Netzrücken oder Kontaktrücken"
        unterzeile="Trockener Rücken gegen stabilen Sitz. Beides zugleich gibt es nicht ganz."
        breit
      >
        <RueckensystemBild />
        <div className="max-w-3xl space-y-5">
          <p>
            Für die meisten Tagestouren im Sommer spricht fast alles für das Netz. Man kommt oben
            an, und das Hemd ist am Rücken nicht durchgeschwitzt — das spürt man spätestens in der
            Gipfelpause, wenn der Wind geht. Die heutigen Ausführungen der beiden Bestplatzierten im
            Schweizer Test von 2019, Vaude Brenta und Deuter Zugspitze, haben beide einen Netzrücken.
          </p>
          <p>
            Ein Kontaktrücken lohnt sich, wo der Rucksack jede Bewegung mitmachen muss: in Stellen,
            in denen man die Hände braucht, auf schmalen Graten, beim schnellen Gehen. Dort ist ein
            Rucksack, der ein paar Zentimeter weiter hinten sitzt, ein Hebel, der bei jedem Schritt
            zieht.
          </p>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel
        id="einstellen"
        titel="Hüftgurt und richtig einstellen"
        unterzeile="Der Hüftgurt trägt 70 bis 80 Prozent. Wer ihn locker lässt, trägt alles auf den Schultern."
        breit
      >
        <p className="max-w-3xl">
          Die Reihenfolge ist wichtig, weil jeder Gurt auf dem vorherigen aufbaut. So beschreibt es
          der{" "}
          <a href={QUELLEN.alpenverein} className="underline hover:text-accent" rel="noopener" target="_blank">
            Alpenverein Südtirol
          </a>
          , und so steht es sinngemäß auch in den Anleitungen der Hersteller:
        </p>
        <ol className="max-w-3xl space-y-4">
          {[
            ["Alle Gurte lockern.", "Dann den Rucksack beladen aufsetzen — mit dem Gewicht, das er auf Tour tragen wird. Leer eingestellt passt er voll nicht."],
            ["Hüftgurt auf die Hüftknochen.", "Leicht nach vorn beugen, den Gurt mittig auf Höhe der Hüftknochen legen, schließen, straff ziehen. Zu hoch schnürt er den Bauch ein, zu tief scheuert er in der Leiste. Ein kleiner Hüpfer hilft, damit der Rucksack sich setzt."],
            ["Schulterträger anziehen.", "Nicht zu stramm. Sie halten den Rucksack am Körper, tragen soll die Hüfte."],
            ["Brustgurt schließen.", "Nur leicht. Er hält die Schulterträger zusammen, damit sie nicht nach außen rutschen. Die Höhe so, wie es bequem ist."],
            ["Hüftstabilisatoren.", "Die kleinen Riemen seitlich am Hüftgurt: angezogen für mehr Halt im Gelände, locker für mehr Bewegungsfreiheit."],
            ["Lageverstellriemen.", "Die Riemen von der Schulter zum oberen Rucksack. Angezogen holen sie die Last an den Körper, gelockert lassen sie in leichtem Gelände mehr Luft an den Rücken."],
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
        <div className="max-w-3xl space-y-5">
          <p>
            Unterwegs darf man umverteilen. Der Alpenverein rät, zwischendurch bewusst die Schultern
            ganz zu entlasten oder umgekehrt den Hüftgurt zu lockern und mehr auf die Schultern zu
            nehmen — die Muskulatur ermüdet langsamer, wenn sie nicht stundenlang gleich belastet
            wird.
          </p>
          <Merksatz>
            Drückt der Rucksack nach einer Stunde auf den Schultern, sitzt fast immer der Hüftgurt zu
            locker oder zu hoch. Erst den nachziehen, dann über einen neuen Rucksack nachdenken.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel
        id="packen"
        titel="Richtig packen"
        unterzeile="Schweres in die Mitte, nah an den Rücken. Der Rest folgt daraus."
        breit
      >
        <p className="max-w-3xl">
          Je näher der Schwerpunkt des Rucksacks am eigenen Körperschwerpunkt liegt, desto weniger
          spürt man die Last und desto sicherer steht man. Das gilt vor allem ab etwa 30 Litern; bei
          einem Tagesrucksack mit fünf Kilo verzeiht es mehr.
        </p>
        <PackBild />
        <div className="max-w-3xl space-y-5">
          <p>
            Die Regenjacke gehört in eine Außentasche oder ganz nach oben, wo man sie ohne Auspacken
            erreicht. Seitentaschen gleichmäßig beladen — eine volle Flasche auf nur einer Seite
            zieht den Rucksack schief. Und die Trinkblase sitzt ohnehin im Fach am Rücken, dort, wo
            das Schwere hingehört.
          </p>
          <Merksatz>
            Der wichtigste Pack-Tipp des Alpenvereins ist der einfachste: Alles Überflüssige zu Hause
            lassen.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel
        id="regen"
        titel="Regen: Hülle, Packsack, wasserdicht"
        unterzeile="Kaum ein Wanderrucksack ist wasserdicht. Muss er auch nicht sein."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Die Stoffe sind meist wasserabweisend beschichtet, aber Nähte und Reißverschlüsse lassen
            bei Dauerregen Wasser durch. Was im Test den Unterschied machte, war die Regenhülle: Vaude
            Brenta und Deuter Zugspitze hielten starkem Regen „dank extra Hülle“ stand, berichtete die
            Stiftung Warentest über den Schweizer Test. Der 30-Euro-Rucksack von Decathlon hielt beim
            Tragekomfort mit, erwies sich aber als nicht sonderlich regendicht. Der teuerste im
            Test, ein Mammut für rund 95 Euro, wurde im Regentest durchnässt.
          </p>
        </div>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Regenhülle",
              text: "Eine Haube aus beschichtetem Stoff, die über den ganzen Rucksack gezogen wird. Oft in einem eigenen Fach am Boden. Schützt gegen Regen von oben, nicht gegen Wasser vom Rücken her.",
            },
            {
              titel: "Packsack innen",
              text: "Ein wasserdichter Beutel im Hauptfach — für Schlafsack und Wechselwäsche. Das zuverlässigste Mittel, weil das Wasser von keiner Seite herankommt. Ein großer Müllbeutel tut es zur Not auch.",
            },
            {
              titel: "Wasserdichter Rucksack",
              text: "Aus verschweißtem Material, mit Rollverschluss statt Reißverschluss. Dicht, aber meist ohne Netzrücken und mit weniger Fächern. Eher für Kanu und Rad als für die Wanderung.",
            },
          ]}
        />
        <div className="max-w-3xl">
          <Merksatz>
            Vier der sieben Rucksäcke hier bringen laut Angaben eine Regenhülle mit. Beim Speed Lite,
            beim Talon und beim Futura Pro 40 steht nichts davon — dort vor dem Kauf nachsehen oder
            auf den Packsack setzen.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel
        id="gewicht"
        titel="Wie leicht muss er sein?"
        unterzeile="Jedes Gramm am Rucksack trägst du auch, wenn er leer ist."
      >
        <p>
          Die Bergführer von Alpinewelten geben Richtwerte fürs Eigengewicht: Ein Rucksack um 30 Liter
          sollte unter einem Kilo bleiben, einer mit 40 Litern nicht über 1,3 Kilo. Für das
          Gesamtgewicht nennen sie eine Grenze, die sich viele nicht vorstellen können: Bei einer
          siebentägigen Alpenüberquerung{" "}
          <a href={QUELLEN.bergfuehrer} className="underline hover:text-accent" rel="noopener" target="_blank">
            höchstens 8 Kilo
          </a>
          , alles zusammen.
        </p>
        <p>
          Bei den Rucksäcken hier nennt nur Deuter für den Speed Lite ein Gewicht: 710 Gramm. Für den
          Osprey Talon und den SKYSPER steht im Händlertext je rund 1,1 Kilo. Alle anderen Hersteller
          schweigen — auch Deuter bei Futura und Zugspitze. Ein Netzrücken mit Rahmen wiegt mehr als
          ein Rucksack ohne, das lässt sich sagen, ohne eine Zahl zu erfinden.
        </p>
        <p className="text-muted">
          Ultraleichte Rucksäcke mit 300, 400 Gramm gibt es, meist ohne Rahmen und mit dünnem
          Hüftband statt Hüftgurt. Sie tragen sich gut, solange wenig drin ist — und schlecht, sobald
          es mehr wird. Für eine Tagestour mit drei Litern Wasser ist das eine Rechnung, die man vorher
          machen sollte.
        </p>
        <Merksatz>
          Wer Gewicht sparen will, fängt beim Inhalt an, nicht beim Rucksack. Eine halbvolle
          Thermoskanne zu viel wiegt mehr als der Unterschied zwischen zwei Tagesrucksäcken.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel
        id="tests"
        titel="Wanderrucksack im Test: Was Saldo und dTest fanden"
        unterzeile="Die Stiftung Warentest hat keinen eigenen Rucksacktest — aber über zwei berichtet."
        breit
      >
        <p className="max-w-3xl">
          Wer „Wanderrucksack Test“ sucht, findet viele Seiten mit Testsiegern. Unabhängige Labortests
          gibt es zwei, beide von Partnerorganisationen der Stiftung Warentest, beide mit Rangfolgen
          statt Noten, beide einige Jahre alt:
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-5">
            <p className="text-sm font-semibold text-accent">Saldo, Schweiz · {TESTS.saldo.datum}</p>
            <h3 className="mt-1 font-semibold">8 Tagesrucksäcke, 22 bis 30 Liter</h3>
            <ul className="mt-3 space-y-1.5 text-[0.97rem] leading-relaxed text-muted">
              <li><strong className="text-foreground">1. Vaude Brenta 25</strong> — bester Tragekomfort, regendicht mit Hülle</li>
              <li><strong className="text-foreground">Deuter Zugspitze</strong> — ebenfalls überzeugend, regendicht mit Hülle</li>
              <li><strong className="text-foreground">Quechua MH100</strong> (Decathlon, 30 €) — Komfort wie die Besten, aber nicht regendicht</li>
              <li><strong className="text-foreground">Letzter: Mammut Nirvana Ride</strong> — ungünstiger Schwerpunkt, im Regen durchnässt</li>
            </ul>
            <a href={TESTS.saldo.url} className="mt-3 inline-block text-sm underline hover:text-accent" rel="noopener" target="_blank">
              Bericht bei test.de
            </a>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <p className="text-sm font-semibold text-accent">dTest, Tschechien · {TESTS.dtest.datum}</p>
            <h3 className="mt-1 font-semibold">17 Tagesrucksäcke, 20 bis 30 Liter</h3>
            <ul className="mt-3 space-y-1.5 text-[0.97rem] leading-relaxed text-muted">
              <li><strong className="text-foreground">1. Deuter Trans Alpine 30</strong> — sehr gut belüftet, fest gearbeitet, dicht bei Regen; mit 1,25 kg der schwerste</li>
              <li><strong className="text-foreground">Gleichauf dahinter:</strong> Jack Wolfskin Moab Jam 24, Lowe Alpine Aeon 27, Mammut Lithium Zip 24</li>
              <li><strong className="text-foreground">Lidl Crivit 25</strong> (13 €) — Gurte hielten nicht</li>
              <li><strong className="text-foreground">Sportisimo Crossroad Cargo 30</strong> — Gurte rutschten durch die Schnallen</li>
            </ul>
            <a href={TESTS.dtest.url} className="mt-3 inline-block text-sm underline hover:text-accent" rel="noopener" target="_blank">
              Bericht bei test.de
            </a>
          </div>
        </div>
        <div className="max-w-3xl space-y-5">
          <p>
            Was man daraus mitnehmen kann, ist weniger ein Modell als ein Muster: Vorn lagen
            Rucksäcke, die gut saßen und im Regen dicht blieben. Hinten lagen der teuerste und die billigsten —
            der eine wegen schlechter Passform, die anderen wegen Gurten und Schnallen.
          </p>
          <p>
            Die Modelle von damals gibt es heute meist in überarbeiteter Form. Den Brenta führt Vaude
            heute unter anderem mit 24 Litern, den Zugspitze gibt es als Zugspitze 24; ob sie
            baugleich mit den getesteten sind, sagen die Hersteller nicht. Den Testsieger von 2021
            verkauft Deuter heute als Fahrradrucksack — ob es noch die getestete Ausführung ist,
            steht nirgends.
          </p>
        </div>
        <div className="flex max-w-3xl flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-5">
          <div className="w-24 shrink-0">
            <Produktbild preis={p.get(TESTSIEGER_2021.asin)} alt={`${TESTSIEGER_2021.marke} ${TESTSIEGER_2021.name}`} href={partnerUrl(TESTSIEGER_2021.asin)} klein />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {TESTSIEGER_2021.marke} {TESTSIEGER_2021.name}, aktuelle Ausführung
            </p>
            <p className="text-sm text-muted">Heute als Fahrradrucksack verkauft. Nicht Teil unseres Vergleichs.</p>
          </div>
          <Affiliatelink url={urlVon(TESTSIEGER_2021.asin)} preis={p.get(TESTSIEGER_2021.asin)} name={`${TESTSIEGER_2021.marke} ${TESTSIEGER_2021.name}`} knapp />
        </div>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: sonst ragen die absolut positionierten Vorlesetexte der
            Kaufknöpfe aus dem Scrollrahmen und ziehen die Seite auf dem Handy
            auseinander (siehe Stockseite). */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[56rem] text-sm">
            <caption className="sr-only">Wanderrucksäcke im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-32 bg-sand px-4 py-3 text-left font-medium text-muted">
                  &nbsp;
                </th>
                {RUCKSAECKE.map((r) => (
                  <th key={r.asin} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${r.asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{r.marke}</span>
                      {r.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (r) => <strong className="tabular-nums">{preisVon(r.asin)}</strong>],
                  ["Volumen", (r) => `${r.liter} Liter`],
                  ["Rücken", (r) => r.rueckenDetail],
                  ["Gewicht", (r) => (r.gramm ? `${nf.format(r.gramm)} g` : <span className="text-muted">k. A.</span>)],
                  ["Rückenlänge verstellbar", (r) => ja(r.rueckenlaengeVerstellbar)],
                  ["Regenhülle", (r) => ja(r.regenhuelle)],
                  ["Trinkblase", (r) => (r.trinkblase ? "Vorrichtung" : <span className="text-muted">k. A.</span>)],
                  ["Damen", (r) => (r.damen ? `${r.damen.name}, ${r.damen.liter} l` : <span className="text-muted">—</span>)],
                  ["Besonders", (r) => r.besonderheit],
                  ["Angebot", (r) => knopf(r.asin, `${r.marke} ${r.name}`)],
                ] as [string, (r: (typeof RUCKSAECKE)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">
                    {k}
                  </th>
                  {RUCKSAECKE.map((r) => (
                    <td key={r.asin} className="px-3 py-3 leading-snug">
                      {f(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Alle technischen Angaben aus den Herstellerangaben zum jeweiligen Artikel; die Gewichte von
          Osprey Talon und SKYSPER aus dem Händlertext. „k. A.“ heißt: Der Hersteller sagt dazu
          nichts, und raten wollen wir nicht. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel
        id="modelle"
        titel="Die Rucksäcke einzeln"
        unterzeile="Zu jedem steht, wogegen er spricht und wer ihn nicht kaufen sollte."
        breit
      >
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
        <p className="max-w-3xl text-muted">
          Nicht dabei: Der Quechua MH100 von Decathlon, der im Schweizer Test beim Tragekomfort mit
          den Besten mithielt und nur im Regen schwächelte. Bei Amazon haben wir ihn nicht gefunden,
          Decathlon verkauft ihn selbst. Wer einen günstigen Einstieg sucht und eine Regenhülle
          dazukauft, ist dort gut aufgehoben.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel id="trinkblase" titel="Trinkblase im Rucksack">
        <p>
          Die meisten Wanderrucksäcke haben ein Fach innen am Rücken, einen Haken zum Aufhängen und
          eine Öffnung für den Schlauch. Deuter nennt beim Speed Lite ausdrücklich die hauseigene
          Streamer-Blase, Osprey beim Talon eine Hülle für ein Trinkreservoir. Dass die Blase dort
          sitzt, wo auch das Schwere hingehört — mittig, nah am Rücken —, ist kein Zufall.
        </p>
        <p>
          Welche Blase, wie groß und warum die Öffnung über die Reinigung entscheidet, steht im{" "}
          <Link href="/ausruestung/trinkblase" className="underline hover:text-accent">
            Trinkblasen-Vergleich
          </Link>
          .
        </p>
      </Kapitel>

      {/* ─────────────────────────── 13 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Reinigen und lagern">
        <p>
          Von Hand, nicht in der Waschmaschine: Die Trommel kann Beschichtung und Schnallen
          beschädigen, darauf weist auch die Stiftung Warentest hin. Lauwarmes Wasser, ein Schwamm,
          bei Bedarf etwas milde Seife. Danach offen und kopfüber trocknen lassen, nicht in der Sonne
          und nicht auf der Heizung.
        </p>
        <p>
          Gelagert wird er trocken. Ein Rucksack, der nach einer Regentour zusammengelegt in den
          Keller kommt, riecht beim nächsten Mal — oder schimmelt. Vorher alle Fächer leeren; ein
          vergessener Apfel im Deckelfach ist nach drei Wochen eine eigene Geschichte.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 14 ─────────────────────────── */}
      <Kapitel id="nichts" titel="Wann du keinen neuen brauchst">
        <p>
          Wenn dein alter Rucksack drückt, liegt es oft an der Einstellung und nicht am Rucksack.
          Hüftgurt auf die Hüftknochen, Schulterträger lockerer, Lageverstellriemen anziehen — das
          kostet zehn Minuten und keinen Euro.
        </p>
        <p>
          Wenn du zweimal im Jahr zwei Stunden gehst, trägt auch der Stadtrucksack. Ein
          Wanderrucksack spielt seine Stärken erst aus, wenn Gewicht drin ist und der Weg länger wird.
        </p>
        <p>
          Und wenn der Rucksack eigentlich passt und nur ein Teil kaputt ist — eine Schnalle, ein
          Reißverschluss —, lohnt die Reparatur. Vaude legt seine Rucksäcke ausdrücklich darauf aus.
        </p>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Netzrücken, der den Rücken trocken hält, Hüftflossen, die sich nach vorn festziehen lassen,
          Regenhülle dabei, und mit dem Futura 25 SL eine Damenausführung derselben Bauart. Für
          Tagestouren vom Mittelgebirge bis zur Almwanderung gibt es wenig, was man vermissen würde.
        </p>
        <p className="mt-2 text-muted">
          Wenn der Preis zu hoch ist, nimm den{" "}
          <a href={`#${zugspitze.asin}`} className="underline hover:text-accent">Deuter Zugspitze 24</a> — im
          Schweizer Test neben dem Sieger hervorgehoben, mit Netzrücken und Regenhülle.
        </p>
      </Entscheidung>

      {/* ─────────────────────────── 15 ─────────────────────────── */}
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

      {/* ─────────────────────────── 16 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Wir haben diese Rucksäcke nicht getestet und behaupten das auch nicht. Was hier steht, ist
          eine Zusammenstellung aus Herstellerangaben, zwei unabhängigen Tests, über die die Stiftung
          Warentest berichtet hat, und den Empfehlungen von Bergführern und Alpenverein — plus die
          Einschätzung, welche Merkmale im Alltag zählen.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Stiftung Warentest,{" "}
            <a href={TESTS.saldo.url} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wanderrucksäcke im Test
            </a>{" "}
            ({TESTS.saldo.datum}, Test der Schweizer Zeitschrift Saldo) und{" "}
            <a href={TESTS.dtest.url} className="underline hover:text-accent" rel="noopener" target="_blank">
              Rucksäcke im Test
            </a>{" "}
            ({TESTS.dtest.datum}, Test des tschechischen dTest).
          </li>
          <li>
            Alpenverein Südtirol,{" "}
            <a href={QUELLEN.alpenverein} className="underline hover:text-accent" rel="noopener" target="_blank">
              Rucksack richtig packen und einstellen
            </a>
            , Bergeerleben 01/19: Hüftgurt trägt 70 bis 80 Prozent, Reihenfolge beim Einstellen, Packzonen.
          </li>
          <li>
            Alpinewelten,{" "}
            <a href={QUELLEN.bergfuehrer} className="underline hover:text-accent" rel="noopener" target="_blank">
              Der richtige Wanderrucksack
            </a>
            : Volumen je Tourart, Eigengewicht, 8 Kilo für eine Woche.
          </li>
          <li>
            Bergzeit,{" "}
            <a href={QUELLEN.volumen} className="underline hover:text-accent" rel="noopener" target="_blank">
              Welche Rucksackgröße
            </a>
            : Literspannen je Tourart, im Winter eine Größenklasse mehr.
          </li>
          <li>
            Deuter,{" "}
            <a href={QUELLEN.rueckenlaenge} className="underline hover:text-accent" rel="noopener" target="_blank">
              Rückenlänge messen
            </a>
            : Messmethode und die Empfehlung von SL-Modellen für Frauen.
          </li>
          <li>
            Technische Angaben: Herstellerangaben zum jeweiligen Artikel. Preise und Bilder: Amazon,
            stündlich abgerufen. {PREISHINWEIS}
          </li>
          <li>
            Wanderparkplätze ohne Einkehr ({nf.format(einkehr.ohne)} von {nf.format(einkehr.gesamt)}):
            eigener Datenbestand aus OpenStreetMap, Einkehr im Umkreis von 1.200 Metern — mehr dazu
            unter <Link href="/ueber-uns" className="underline hover:text-accent">Über uns</Link>.
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
            <p className="text-sm text-muted">Größe, Öffnung, Reinigung.</p>
          </li>
          <li>
            <Link href="/ausruestung/wanderstoecke" className="font-medium hover:text-accent">Wanderstöcke im Vergleich</Link>
            <p className="text-sm text-muted">Länge, Verschluss, faltbar oder Teleskop.</p>
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
