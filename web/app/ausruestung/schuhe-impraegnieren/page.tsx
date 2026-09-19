import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Pflegeplaner, { type PflegeAngebot } from "@/components/ausruestung/Pflegeplaner";
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
import { MITTEL, MATERIAL_NAME, FRAGEN, QUELLEN, alsProdukt } from "@/lib/ausruestung/impraegnierung";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const PFAD = "/ausruestung/schuhe-impraegnieren";
const TITEL = "Schuhe imprägnieren: Wachs oder Spray, was Gore-Tex-Schuhe brauchen — und welches Mittel der Test empfiehlt";

export const metadata: Metadata = {
  title: titel("Schuhe imprägnieren: Wanderschuhe, Gore-Tex, Mittel im Test"),
  description: beschreibung(
    "Wanderschuhe richtig imprägnieren: Wachs oder Spray je nach Leder, was Gore-Tex-Schuhe brauchen, was die Stiftung Warentest fand, sicher sprühen — mit Pflegeplaner und sieben Mitteln.",
  ),
  alternates: { canonical: PFAD },
};

const KAPITEL: [string, string][] = [
  ["planer", "Brauchen deine Schuhe eine Imprägnierung?"],
  ["membran", "Gore-Tex-Schuhe imprägnieren"],
  ["mittel", "Wachs oder Spray"],
  ["anleitung", "Schritt für Schritt"],
  ["neu", "Neue Schuhe imprägnieren?"],
  ["test", "Imprägniermittel im Test"],
  ["sicher", "Sicher sprühen"],
  ["vergleich", "Die Mittel im Vergleich"],
  ["modelle", "Die Mittel einzeln"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  holmenkol: "Unsere erste Wahl",
  nikwaxSL: "Für gemischte Wanderschuhe",
  nikwaxSet: "Reinigen und imprägnieren",
  nikwaxWachs: "Für Glattleder",
  meindl: "Glattleder, vom Schuhhersteller",
  nikwaxNubuk: "Für Nubuk und Velours",
  grangers: "Ein Spray für alles",
};

const extern = "underline hover:text-accent";

export default async function SchuheImpraegnieren() {
  // Erscheint erst zum Freigabezeitpunkt, bis dahin 404 (siehe lib/ausruestung/freigabe.ts).
  if (!sichtbar(PFAD)) notFound();

  const p = await preise(MITTEL.map((m) => m.asin));
  const PRODUKTE = MITTEL.map(alsProdukt);
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

  const angebote: Record<string, PflegeAngebot> = Object.fromEntries(
    MITTEL.map((m) => [
      m.key,
      { k: m.key, name: `${m.marke} ${m.name}`, form: `${m.form} · ${m.inhalt}`, url: urlVon(m.asin), anzeige: p.get(m.asin)?.anzeige ?? null },
    ]),
  );
  const socken = sichtbar("/ausruestung/wandersocken");

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
        aktuell="Schuhe imprägnieren"
      />

      {/* ─────────────────────────── Einstieg ─────────────────────────── */}
      <header className="mt-4 overflow-hidden rounded-3xl bg-sand px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Pflegeanleitung und Kaufberatung · Stand {stand}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
          {TITEL}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Eine Membran macht den Schuh dicht, aber nicht trocken von außen. Saugt sich das Leder
          darüber voll, wird der Schuh schwer und atmet schlechter. Welches Mittel dagegen hilft,
          entscheidet das Obermaterial — und ob der Schuh die Pflege gerade überhaupt braucht, zeigt
          ein Tropfen Wasser.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${MITTEL.length} Mittel verglichen`, "Pflegeplaner", "Nach DAV-Anleitung", "Warentest 2023"].map((t) => (
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
          nichts.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Form"
            zeilen={PRODUKTE.map((s, i) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[MITTEL[i].key],
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
        id="planer"
        titel="Brauchen deine Schuhe eine Imprägnierung?"
        unterzeile="Ein Tropfen Wasser sagt es dir. Der Rest hängt am Material."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Die{" "}
            <a href={QUELLEN.warentest} className={extern} rel="noopener" target="_blank">
              Stiftung Warentest
            </a>{" "}
            empfiehlt einen einfachen Test: ein wenig Wasser auf den Schuh tropfen. Bleibt die
            Oberfläche trocken und die Tropfen perlen ab, ist der Schuh noch ausreichend vor Nässe und
            Schmutz geschützt. Zieht das Wasser ein, ist es Zeit.
          </p>
          <p>
            Wie du dann vorgehst, steht in der Pflegeanleitung des{" "}
            <a href={QUELLEN.davPflege} className={extern} rel="noopener" target="_blank">
              Deutschen Alpenvereins
            </a>
            . Der Planer setzt sie für deinen Schuh zusammen:
          </p>
        </div>
        <Pflegeplaner angebote={angebote} zeit={zeitVon(erste.asin)} />
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="membran" titel="Gore-Tex-Schuhe imprägnieren" unterzeile="Ja — gerade die.">
        <p>
          Die Membran sitzt innen, zwischen Futter und Obermaterial. Sie hält Wasser ab, aber nicht
          davon, das Leder oder Gewebe darüber zu durchnässen. Imprägniertes Obermaterial saugt sich
          nicht mit Wasser voll, schreibt der DAV, die Schuhe bleiben dadurch leichter und
          atmungsaktiver. Bei Regenjacken beschreibt der DAV dasselbe Prinzip: Durchfeuchtet der
          Oberstoff, beeinträchtigt das die Funktion der Membran.
        </p>
        <p>
          <a href={QUELLEN.gore} className={extern} rel="noopener" target="_blank">
            Gore-Tex
          </a>{" "}
          selbst rät, die Schuhe nach dem Reinigen mit einem Imprägnierspray zu behandeln — und
          verweist für alles Weitere auf die Pflegehinweise im Schuh, weil der Schuhhersteller am
          besten weiß, was sein Modell braucht. Der DAV ergänzt: Schweiß, Hautfett und Schmutz mindern
          die Funktion der Membran, deshalb müssen Membranschuhe von Zeit zu Zeit auch gewaschen
          werden.
        </p>
        <Merksatz>
          An Membranschuhe keine öligen und fettenden Pflegemittel. Das schreibt der DAV
          ausdrücklich — Wachs für Glattleder ja, Lederfett nein.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="mittel" titel="Wachs oder Spray" unterzeile="Das Obermaterial entscheidet, nicht die Marke." breit>
        <Kartenraster
          eintraege={[
            {
              titel: MATERIAL_NAME.glatt,
              text: "Schuhwachs, sagt der DAV. Mit Schwamm oder Tuch einreiben, besonders an den Nähten. Bei Membranschuhen darf das Leder noch etwas feucht sein.",
            },
            {
              titel: MATERIAL_NAME.rau,
              text: "Spray statt Wachs, sagt der DAV, und zum Schluss die Raulederbürste.",
            },
            {
              titel: MATERIAL_NAME.textil,
              text: "Spray, wie bei einer Regenjacke. Der DAV verweist hier ausdrücklich auf die Imprägnierung von Hardshells.",
            },
            {
              titel: MATERIAL_NAME.misch,
              text: "Der häufigste Wanderschuh. Ein Spray, das Leder und Gewebe gleichermaßen verträgt — die Hersteller weisen solche Mittel eigens aus.",
            },
          ]}
        />
        <p className="max-w-3xl">
          Die Sprays der Stiftung Warentest waren Universalmittel für Textilfasern und Leder. Die
          ebenfalls getesteten Einwasch-Imprägnierer sind dagegen vor allem für Outdoor- und
          Funktionskleidung gedacht, die in der Waschmaschine behandelt wird.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="anleitung" titel="Schritt für Schritt" unterzeile="Nach der Pflegeanleitung des DAV.">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Reinigen.</strong> Schuhe ausschütteln, groben Schmutz entfernen, Bürste und
            lauwarme Seifenlauge genügen. Bei einer gründlichen Wäsche laufen Membranschuhe innen mit
            Seifenlauge voll; das Futter nur mit einem weichen Schwamm auswischen, keine Bürste.
          </li>
          <li>
            <strong>Trocknen.</strong> Zwei bis drei Tage bei Zimmertemperatur, keine direkte Sonne,
            keine Hitzequellen, mit Zeitungspapier ausstopfen und das Papier regelmäßig wechseln. Bei
            unzureichender Trocknung droht laut DAV, dass sich das Sohleninnere zersetzt (Hydrolyse).
          </li>
          <li>
            <strong>Imprägnieren.</strong> Spray aufsprühen oder Wachs einreiben. Lederschuhe mit
            Membran dürfen dabei noch etwas feucht sein; manche Sprays gehören laut Hersteller sogar
            auf den nassen Schuh.
          </li>
          <li>
            <strong>Einarbeiten und warten.</strong> Überschuss mit einem Tuch einarbeiten,
            24 Stunden einwirken lassen. Rauleder zum Schluss mit der Raulederbürste behandeln.
          </li>
        </ol>
        <p>
          Und die Waschmaschine? Da widersprechen sich die Quellen. Der DAV erlaubt sie für
          Membranschuhe aus Synthetik mit Funktionswaschmittel, Schongang, höchstens 30 Grad und
          400 Umdrehungen. Gore-Tex nennt höchstens 40 Grad und 800 Umdrehungen — aber nur, wenn der
          Schuhhersteller die Maschine erlaubt, und mit möglichem Verlust der Gewährleistung.
          Lederschuhe wäscht man laut Gore-Tex nur von Hand.
        </p>
        <Merksatz>
          Im Zweifel gilt das Etikett im Schuh — und die vorsichtigere Einstellung.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="neu" titel="Neue Schuhe imprägnieren?" unterzeile="Ja, direkt nach dem Kauf.">
        <p>
          Das rät die Stiftung Warentest: Schuhe gleich nach dem Kauf imprägnieren, weil nicht alle
          ab Werk gut gegen Nässe und Schmutz gewappnet sind. Das Spray gleichmäßig auftragen und die
          Schuhe danach auslüften lassen. Später gilt: nachimprägnieren, sobald das Wasser nicht mehr
          abperlt.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="test" titel="Imprägniermittel im Test" unterzeile="14 Mittel, sechs gut, sechs mangelhaft.">
        <p>
          Im September 2023 veröffentlichte die{" "}
          <a href={QUELLEN.warentest} className={extern} rel="noopener" target="_blank">
            Stiftung Warentest
          </a>{" "}
          einen Test von elf Imprägniersprays und drei Einwasch-Imprägnierern. Die Mittel wurden im
          Labor auf Polyester und Polyamid, die Universalsprays auch auf Leder aufgetragen und bis
          zu zehnmal beregnet. Die Schmutzabweisung prüften die Tester mit Lehm, Mayonnaise und einer
          Salzlösung, wie sie im Winter auf gestreuten Wegen weiße Ränder hinterlässt.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Sechs gut, sechs mangelhaft.</strong> Fünf Sprays versprühten per- und
            polyfluorierte Chemikalien (PFAS) und wurden deshalb abgewertet.
          </li>
          <li>
            <strong>Vorn:</strong> Holmenkol Natural Proof und Toko Eco Proof Textile, laut{" "}
            <a href={QUELLEN.holmenkol} className={extern} rel="noopener" target="_blank">
              Hersteller
            </a>{" "}
            und{" "}
            <a href={QUELLEN.warentestBericht} className={extern} rel="noopener" target="_blank">
              Berichten über den Test
            </a>{" "}
            beide mit 1,7.
          </li>
          <li>
            <strong>Preistipp:</strong> Imprägnol Universal 100 % PFC-frei, Gesamtnote 2,4 — beim
            Nässeschutz nur befriedigend, aber gut bei Handhabung, Umwelt und Gesundheit, wie die
            Redaktion in den Kommentaren erklärt. Die gleichnamige Variante ohne „PFC-frei“ im Namen
            ist ein anderes Produkt.
          </li>
          <li>
            <strong>Abgewertet:</strong> Collonil Carbon Pro. Die Tester fanden organisch gebundenes
            Fluor in relevanter Menge, beim Nässeschutz reichte es nur für ausreichend. Ob Collonil die
            Rezeptur seither geändert hat, ist laut Stiftung Warentest nicht bekannt.
          </li>
          <li>
            <strong>Kosten:</strong> zwischen 54 Cent und 7,80 Euro pro Anwendung.
          </li>
        </ul>
        <p className="text-muted">
          Die meisten Schuhmittel in diesem Vergleich waren nicht im Test. Sie stehen hier, weil der
          DAV für Glattleder Wachs und für Rauleder spezielle Sprays nennt, und die getesteten Sprays
          Universalmittel sind.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="sicher" titel="Sicher sprühen" unterzeile="Das Risiko steckt im Sprühnebel — und der hängt an der Dose.">
        <p>
          Aus Vergiftungsfällen mit Imprägniersprays in Deutschland, den Niederlanden und der Schweiz
          ist bekannt, dass sie Atemnot bis hin zum Lungenödem auslösen können, schreibt das{" "}
          <a href={QUELLEN.bfr2006} className={extern} rel="noopener" target="_blank">
            Bundesinstitut für Risikobewertung
          </a>
          . Dafür müssen die Tröpfchen bis in die Lungenbläschen gelangen, und so fein werden sie nur
          aus Spraydosen mit Treibgas. Aus einer Pumpflasche sind sie laut BfR nicht kleiner als
          100 Mikrometer und erreichen das Lungengewebe nicht.
        </p>
        <p>
          Auch die Stiftung Warentest bemängelte, dass mehrere Sprays potenziell lungenschädigende
          Tröpfchen verteilen. In einem späteren{" "}
          <a href={QUELLEN.bfr2020} className={extern} rel="noopener" target="_blank">
            Forschungsprojekt des BfR
          </a>{" "}
          nahmen Lungenzellen weniger auf, wenn nur wenige, kurze Sprühstöße abgegeben wurden; auch
          der Abstand zur Düse und die Belüftung spielten eine Rolle.
        </p>
        <Merksatz>
          Pumpspray statt Treibgas, draußen sprühen, wenige kurze Stöße, Abstand halten. Alle
          Sprays in diesem Vergleich sind Pumpsprays.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Die Mittel im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[60rem] text-sm">
            <caption className="sr-only">Imprägniermittel für Schuhe im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {MITTEL.map((m) => (
                  <th key={m.key} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${m.asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{m.marke}</span>
                      {m.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (m) => <strong className="tabular-nums">{preisVon(m.asin)}</strong>],
                  ["Form", (m) => m.form],
                  ["Inhalt", (m) => m.inhalt],
                  ["Für", (m) => m.materialien.map((x) => MATERIAL_NAME[x]).join(", ")],
                  ["PFAS", (m) => m.pfas],
                  ["Membran", (m) => m.membran],
                  ["Warentest", (m) => m.warentest ?? <span className="text-muted">nicht geprüft</span>],
                  [
                    "Angebot",
                    (m) => (
                      <a
                        href={urlVon(m.asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(m.asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {m.marke} {m.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (m: (typeof MITTEL)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {MITTEL.map((m) => (
                    <td key={m.key} className="px-3 py-3 leading-snug">{f(m)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Angaben aus den Herstellertexten zum jeweiligen Artikel. „k. A.“: nicht angegeben.
          Preise und Verfügbarkeit: Stand {zeitVon(erste.asin)} Uhr. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Mittel einzeln" unterzeile="Zu jedem steht, wogegen es spricht und für welchen Schuh es nicht taugt." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Testsieger bei der Stiftung Warentest, fluorfrei, aus der Pumpflasche statt aus der
          Treibgasdose, und für Schuhe wie für Jacke und Rucksack. Für Textil- und Mischschuhe mit
          Membran ist Natural Proof das Mittel, mit dem man am wenigsten falsch macht.
        </p>
        <p className="mt-2 text-muted">
          Für klassische Lederstiefel nimm das{" "}
          <a href={`#${MITTEL[3].asin}`} className="underline hover:text-accent">Nikwax-Imprägnierwachs</a>,
          für Nubuk das{" "}
          <a href={`#${MITTEL[5].asin}`} className="underline hover:text-accent">Nikwax-Nubukspray</a>.
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
          Die Pflegeschritte stammen aus der Anleitung des Deutschen Alpenvereins und von Gore-Tex,
          die Testergebnisse aus dem frei lesbaren Teil des Warentest-Berichts, den Antworten der
          Redaktion darunter und — wo die Noten hinter der Bezahlschranke liegen — aus Angaben der
          Hersteller und Berichten über den Test. Die Hinweise zur Sicherheit stammen vom
          Bundesinstitut für Risikobewertung.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Stiftung Warentest,{" "}
            <a href={QUELLEN.warentest} className={extern} rel="noopener" target="_blank">
              Imprägniermittel im Test: Regen – na und?
            </a>{" "}
            (31.08.2023, test 9/2023).
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.davPflege} className={extern} rel="noopener" target="_blank">
              Bergbekleidung und Schuhe pflegen und reparieren
            </a>
          </li>
          <li>
            Gore-Tex,{" "}
            <a href={QUELLEN.gore} className={extern} rel="noopener" target="_blank">
              Wie pflegt man GORE-TEX Schuhe?
            </a>
          </li>
          <li>
            Bundesinstitut für Risikobewertung,{" "}
            <a href={QUELLEN.bfr2006} className={extern} rel="noopener" target="_blank">
              Ursache für Vergiftungsfälle mit Nano-Spray noch nicht vollständig aufgeklärt
            </a>{" "}
            (2006) und{" "}
            <a href={QUELLEN.bfr2020} className={extern} rel="noopener" target="_blank">
              Wenn das Imprägnierspray auf die Lunge schlägt
            </a>{" "}
            (2020).
          </li>
          <li>
            Testnoten Holmenkol und Toko:{" "}
            <a href={QUELLEN.holmenkol} className={extern} rel="noopener" target="_blank">
              Holmenkol
            </a>{" "}
            und{" "}
            <a href={QUELLEN.warentestBericht} className={extern} rel="noopener" target="_blank">
              ElternKindTipps
            </a>
            .
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
          {socken && (
            <li>
              <Link href="/ausruestung/wandersocken" className="font-medium hover:text-accent">Wandersocken im Vergleich</Link>
              <p className="text-sm text-muted">Trockener Schuh, trockene Socke, keine Blasen.</p>
            </li>
          )}
          <li>
            <Link href="/ausruestung/gamaschen" className="font-medium hover:text-accent">Gamaschen im Vergleich</Link>
            <p className="text-sm text-muted">Damit kein Wasser von oben in den Schuh läuft.</p>
          </li>
          <li>
            <Link href="/ausruestung/groedel" className="font-medium hover:text-accent">Grödel im Vergleich</Link>
            <p className="text-sm text-muted">Für den Schuh im Winter.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
