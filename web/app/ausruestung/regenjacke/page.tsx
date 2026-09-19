import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Jackenberater, { type JackenAngebot } from "@/components/ausruestung/Jackenberater";
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
import { JACKEN, FRAGEN, QUELLEN, alsProdukt, hauptAsin } from "@/lib/ausruestung/regenjacken";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const PFAD = "/ausruestung/regenjacke";
const TITEL = "Regenjacke zum Wandern: Was der Test zeigt, worauf es ankommt — und sechs Jacken für Damen und Herren";

export const metadata: Metadata = {
  title: titel("Regenjacke Wandern: Damen, Herren, Test und Vergleich"),
  description: beschreibung(
    "Welche Regenjacke zum Wandern: was der Saldo-Test über dichte Nähte und das Waschen zeigte, Wassersäule, Belüftung, Größe, PFC-frei — mit Jackenberater und sechs Jacken für Damen und Herren.",
  ),
  alternates: { canonical: PFAD },
};

const KAPITEL: [string, string][] = [
  ["berater", "Welche Regenjacke passt zu dir?"],
  ["test", "Regenjacken im Test"],
  ["wassersaeule", "Was die Wassersäule sagt — und was nicht"],
  ["atmung", "Atmungsaktivität und Belüftung"],
  ["passform", "Die richtige Größe"],
  ["hardshell", "Hardshell oder Softshell"],
  ["pflege", "Waschen und nachimprägnieren"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Jacken einzeln"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  escape: "Unsere erste Wahl",
  marmot: "Wenn du bergauf schwitzt",
  berghaus: "Höchste Wassersäulen-Angabe",
  weiltal: "Getestet, aber nur genügend",
  torrentshell: "Für oft und lange",
  columbia: "Schlicht, verstaubar",
};

const extern = "underline hover:text-accent";

export default async function Regenjacke() {
  // Erscheint erst zum Freigabezeitpunkt, bis dahin 404 (siehe lib/ausruestung/freigabe.ts).
  if (!sichtbar(PFAD)) notFound();

  const asins = JACKEN.flatMap((j) => [j.herren, j.damen].filter((x): x is string => Boolean(x)));
  const p = await preise(asins);
  const PRODUKTE = JACKEN.map(alsProdukt);
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
  const angebot = (asin?: string) => (asin ? { url: urlVon(asin), anzeige: p.get(asin)?.anzeige ?? null } : null);

  const angebote: Record<string, JackenAngebot> = Object.fromEntries(
    JACKEN.map((j) => [j.key, { key: j.key, name: `${j.marke} ${j.name}`, herren: angebot(j.herren), damen: angebot(j.damen) }]),
  );
  const regenhose = sichtbar("/ausruestung/regenhose");
  const impraegnieren = sichtbar("/ausruestung/schuhe-impraegnieren");

  const passformen = (j: (typeof JACKEN)[number]) =>
    (
      [
        ["Herren", j.herren],
        ["Damen", j.damen],
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
        aktuell="Regenjacke"
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
          Eine Jacke mit 24.000 Millimetern Wassersäule, die nach fünf Minuten Regen durchlässt: Das
          fand ein Schweizer Labortest, über den die Stiftung Warentest berichtete. Die Zahl auf dem
          Etikett sagt bei Regenjacken weniger, als man denkt. Worauf es wirklich ankommt, steht hier — und
          welche Jacke zu deinen Touren passt.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${JACKEN.length} Regenjacken verglichen`, "Jackenberater", "Damen und Herren", "Nach Saldo-Test und DAV"].map((t) => (
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
              fuer: FUER[JACKEN[i].key],
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
      <Kapitel id="berater" titel="Welche Regenjacke passt zu dir?" unterzeile="Eine Notfalljacke ist eine andere als die für eine Woche Hüttentour." breit>
        <p className="max-w-3xl">
          Oft bleibt die Regenjacke den ganzen Tag im Rucksack. Dann zählt vor allem das Gewicht. Wer dagegen regelmäßig im Regen läuft, braucht eine Jacke, die dicht hält, auch
          wenn sie schon ein paarmal gewaschen wurde. Drei Fragen:
        </p>
        <Jackenberater angebote={angebote} />
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="test" titel="Regenjacken im Test" unterzeile="Was ein Schweizer Labortest fand — und die Stiftung Warentest weitergab.">
        <p>
          Einen aktuellen eigenen Regenjacken-Test hat die Stiftung Warentest nicht. Im Oktober 2024
          berichtete sie aber über einen Test des Schweizer Verbrauchermagazins{" "}
          <a href={QUELLEN.warentest} className={extern} rel="noopener" target="_blank">
            Saldo
          </a>
          , der Wanderjacken im Labor-Dauerregen prüfte. Fünf der Jacken gibt es auch in Deutschland:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Vaude Escape Light (Damen): gut.</strong> Hielt lange trocken, war atmungsaktiv
            und frei von Perfluorcarbonen — die einzige gute der fünf.
          </li>
          <li>
            <strong>Jack Wolfskin Weiltal 2L (Herren): genügend.</strong> Im Regentest nur etwas
            besser als die schlechteste Jacke, aber frei von Perfluorcarbonen.
          </li>
          <li>
            <strong>Quechua MH 150 (Herren) und MH 500 (Damen): genügend.</strong> Die
            Decathlon-Eigenmarke ist in diesem Vergleich nicht aufgenommen.
          </li>
          <li>
            <strong>H&amp;M Storm Move (Herren): ungenügend.</strong> Trotz angegebener 24.000
            Millimeter Wassersäule hielt sie im Dauerregen nur etwa fünf Minuten dicht, nach fünfmaligem
            Waschen eine Minute.
          </li>
        </ul>
        <p>
          Die Schwachstelle vieler Jacken waren die Nähte: Beim Nähen durchsticht die Nadel die
          Membran, und wird die Naht nicht sorgfältig abgeklebt, hat der Regen leichtes Spiel. Vor
          Wind schützten dagegen alle Jacken gut, und die meisten waren auch atmungsaktiv.
        </p>
        <p className="text-muted">
          Wie ein solcher Regentest aussieht, beschreibt die Stiftung Warentest für ihren eigenen
          Funktionsjacken-Test von 2020: Jacken auf Prüfpuppen mit Baumwollhemd, zwei Stunden
          künstlicher Regen mit 100 Litern pro Quadratmeter und Stunde, danach wird die nasse Fläche
          des Hemds bewertet — neu und nach fünf Wäschen.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="wassersaeule" titel="Was die Wassersäule sagt — und was nicht">
        <p>
          Als wasserdicht gilt ein Stoff laut DIN ab 1.300 Millimetern Wassersäule, schreibt der{" "}
          <a href={QUELLEN.davWetterschutz} className={extern} rel="noopener" target="_blank">
            DAV
          </a>
          . Weil Rucksackträger, Sitzen und Knien den Druck erhöhen, empfiehlt die Eidgenössische
          Materialprüfanstalt mindestens 4.000 Millimeter. Die Jacken mit Herstellerangabe in diesem
          Vergleich nennen 10.000 bis 12.000.
        </p>
        <p>
          Die Wassersäule misst aber nur den Stoff. Ob die Nähte dicht sind und wie lange die Jacke
          nach dem Waschen noch abperlt, sagt sie nicht — genau daran scheiterten die Jacken im
          Saldo-Test.
          {regenhose ? (
            <>
              {" "}Bei Hosen ist der Druck durch Sitzen und Knien noch höher; unser{" "}
              <Link href="/ausruestung/regenhose" className={extern}>
                Regenhosen-Vergleich
              </Link>{" "}
              rechnet ihn aus.
            </>
          ) : null}
        </p>
        <Merksatz>
          Auf „Nähte getapt“ oder „versiegelt“ achten. Eine hohe Wassersäule ohne dichte Nähte ist
          wertlos.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="atmung" titel="Atmungsaktivität und Belüftung" unterzeile="Bergauf wirst du von innen nässer als von außen." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Eine regendichte Jacke zu bauen ist nicht schwer, schreibt der DAV — das „Ölzeug“ der
            Seeleute beweist es. Doch wer sich darin in den Bergen bewegt, wird durch Schwitzen von
            innen nässer als durch den Regen. Atmungsaktive Stoffe lassen Schweiß als Dampf nach
            außen; unter RET 6 gilt ein Stoff als sehr gut atmungsaktiv. Bildet der Schweiß aber
            Tropfen, bleibt er drin.
          </p>
          <p>
            Deshalb zählt neben dem Stoff die Belüftung. Der DAV nennt Reißverschlüsse, die beim
            Aufstieg kritische Stellen belüften, als Merkmal einer guten Wanderjacke, und das
            Zwiebelprinzip als Regel: so warm wie nötig, so frisch wie möglich.
          </p>
        </div>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "2 Lagen",
              text: "Membran und Oberstoff verbunden, Futter eingenäht. Leicht und bequem (DAV). Escape Light, Deluge Pro, Weiltal.",
            },
            {
              titel: "2,5 Lagen",
              text: "Statt Futter ein aufgedrucktes Schutzmuster. Sehr leicht und luftig (DAV). PreCip Eco.",
            },
            {
              titel: "3 Lagen",
              text: "Oberstoff, Membran und Futter fest verbunden. Etwas steifer, aber besonders leistungsfähig und langlebig (DAV). Torrentshell.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="passform" titel="Die richtige Größe" unterzeile="Die Regenjacke ist die äußerste Schicht — sie muss über alles passen.">
        <p>
          Der{" "}
          <a href={QUELLEN.davOutfit} className={extern} rel="noopener" target="_blank">
            DAV
          </a>{" "}
          sagt es ausdrücklich: Die Kleidungsschichten müssen zusammenpassen. Wenn die Hardshell nicht
          über den dicken Winterfleece passt, wird es schwierig. Ärmel und Rückenpartie sollten nicht
          zu kurz sein, unter den Achseln darf es nicht zu eng werden.
        </p>
        <p>
          Praktisch heißt das: mit Fleece anprobieren, Arme nach vorn und nach oben strecken, als
          würdest du nach Stöcken oder einem Griff greifen. Rutscht der Ärmel übers Handgelenk oder
          der Saum über den Hosenbund, ist die Jacke zu klein.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="hardshell" titel="Hardshell oder Softshell">
        <p>
          Der DAV trennt klar: Für kühle und windige Tage eine Softshell — weich, warm, dehnbar und
          sehr atmungsaktiv. Bei richtigem Regenwetter gehört eine Hardshell dazu, also eine
          wasserdichte, atmungsaktive Regenjacke. Die Softshell kann je nach Wetter als Außenschicht
          oder unter der Hardshell getragen werden.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Waschen und nachimprägnieren" unterzeile="Jede Wäsche kostet Abperleffekt — und trotzdem muss die Jacke gewaschen werden.">
        <p>
          Im Saldo-Test hielten alle Jacken nach mehrmaligem Waschen den Regen kürzer ab als neu: Die
          Waschmaschine spült mit dem Schmutz auch die wasserabweisende Beschichtung aus. Das zeigte
          sich laut Stiftung Warentest schon in ihrem eigenen Regenjacken-Test von 2020.
        </p>
        <p>
          Waschen muss man trotzdem, denn Schweiß und Schmutz behindern die Funktion. Der DAV rät:
          Pflegeleichtprogramm bei 40 Grad, Reißverschlüsse vorher schließen, schonend trocknen.
          Zwanzig zusätzliche Minuten im Trockner reaktivieren die Imprägnierung; lässt der Oberstoff
          danach trotzdem Wasser durch, mit Pumpspray oder Einwaschmittel nachimprägnieren. Viele
          Imprägniermittel enthalten allerdings selbst Fluorcarbone, warnt die Stiftung Warentest
          {impraegnieren ? (
            <>
              {" "}— welche nicht, steht in unserem Ratgeber{" "}
              <Link href="/ausruestung/schuhe-impraegnieren" className={extern}>
                Schuhe imprägnieren
              </Link>
            </>
          ) : null}
          . Das Pflegeetikett geht vor: Vaude etwa nennt für die Escape Light 30 Grad.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[56rem] text-sm">
            <caption className="sr-only">Regenjacken zum Wandern im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {JACKEN.map((j) => (
                  <th key={j.key} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${hauptAsin(j)}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{j.marke}</span>
                      {j.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Wassersäule", (j) => (j.wassersaeule ? `${j.wassersaeule.toLocaleString("de-DE")} mm` : <span className="text-muted">k. A.</span>)],
                  ["Gewicht", (j) => (j.gewicht ? `${j.gewicht} g` : <span className="text-muted">k. A.</span>)],
                  ["Aufbau", (j) => j.lagen],
                  ["Unterarm-RV", (j) => (j.belueftung ? "ja" : <span className="text-muted">nicht angegeben</span>)],
                  ["PFAS", (j) => j.pfas],
                  ["Saldo-Test", (j) => j.saldo ?? <span className="text-muted">nicht geprüft</span>],
                  [
                    "Angebot",
                    (j) => (
                      <div className="flex flex-col gap-1.5">
                        {passformen(j).map(([k, asin]) => (
                          <a
                            key={asin}
                            href={urlVon(asin)}
                            rel="sponsored nofollow noopener"
                            target="_blank"
                            className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                          >
                            {k} · {preisVon(asin)} <span aria-hidden>→</span>
                            <span className="sr-only"> {j.marke} {j.name} bei Amazon, Anzeige</span>
                          </a>
                        ))}
                      </div>
                    ),
                  ],
                ] as [string, (j: (typeof JACKEN)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {JACKEN.map((j) => (
                    <td key={j.key} className="px-3 py-3 leading-snug">{f(j)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Wassersäule und Gewicht von den Herstellerseiten oder aus dem Angebot; „k. A.“: nicht
          angegeben. Gewicht bei zwei Werten: Herren / Damen. Die Größe wählst du auf der Amazon-Seite.
          Preise und Verfügbarkeit: Stand {zeitVon(erste.asin)} Uhr. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Jacken einzeln" unterzeile="Zu jeder steht, wogegen sie spricht und wer sie nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Die einzige in Deutschland erhältliche Jacke, die im Saldo-Test „gut“ abschnitt: hielt lange
          trocken, atmungsaktiv, frei von Perfluorcarbonen. Dazu mindestens 10.000 Millimeter
          Wassersäule laut Vaude, für Damen und Herren.
        </p>
        <p className="mt-2 text-muted">
          Wenn du bergauf viel schwitzt: die{" "}
          <a href={`#${hauptAsin(JACKEN[1])}`} className="underline hover:text-accent">Marmot PreCip Eco</a> mit
          Unterarm-Reißverschlüssen.
        </p>
      </Entscheidung>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
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

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Die Testergebnisse stammen aus dem Bericht der Stiftung Warentest über den Saldo-Test,
          Grenzwerte, Aufbau, Passform und Pflege vom Deutschen Alpenverein. Wassersäule und Gewicht
          kommen von den Herstellern; wo sie fehlen, steht „k. A.“.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Stiftung Warentest,{" "}
            <a href={QUELLEN.warentest} className={extern} rel="noopener" target="_blank">
              Wanderjacken im Test: Viele sind nicht ganz dicht
            </a>{" "}
            (22.10.2024, korrigiert 24.10.2024; Test des Schweizer Magazins Saldo) und{" "}
            <a href={QUELLEN.warentestMethode} className={extern} rel="noopener" target="_blank">
              Funktionsjacken im Test: So haben wir getestet
            </a>{" "}
            (10/2020).
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.davWetterschutz} className={extern} rel="noopener" target="_blank">
              Wie funktioniert das? Wetterschutzbekleidung
            </a>{" "}
            und{" "}
            <a href={QUELLEN.davOutfit} className={extern} rel="noopener" target="_blank">
              Das richtige Wanderoutfit
            </a>
          </li>
          <li>
            Herstellerangaben:{" "}
            <a href={QUELLEN.vaude} className={extern} rel="noopener" target="_blank">Vaude Escape Light</a>,{" "}
            <a href={QUELLEN.berghaus} className={extern} rel="noopener" target="_blank">Berghaus Deluge Pro 3.0</a>; übrige aus dem Amazon-Angebot.
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
          {regenhose && (
            <li>
              <Link href="/ausruestung/regenhose" className="font-medium hover:text-accent">Regenhose im Vergleich</Link>
              <p className="text-sm text-muted">Die untere Hälfte des Regenschutzes.</p>
            </li>
          )}
          <li>
            <Link href="/ausruestung/wanderrucksack" className="font-medium hover:text-accent">Wanderrucksack im Vergleich</Link>
            <p className="text-sm text-muted">Mit Regenhülle für den Inhalt.</p>
          </li>
          <li>
            <Link href="/ausruestung/gamaschen" className="font-medium hover:text-accent">Gamaschen im Vergleich</Link>
            <p className="text-sm text-muted">Damit das Wasser nicht in die Schuhe läuft.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
