import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Schlafsackberater, { type Angebot } from "@/components/ausruestung/Schlafsackberater";
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
  PackmassVergleich,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import { HUETTENSCHLAFSAECKE, FRAGEN, QUELLEN, alsProdukt } from "@/lib/ausruestung/huettenschlafsaecke";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Hüttenschlafsack: Pflicht, Seide oder Baumwolle — und warum er in die Mikrowelle muss";

export const metadata: Metadata = {
  title: titel("Hüttenschlafsack: Seide, Baumwolle, Pflicht und Mikrowelle"),
  description: beschreibung(
    "Warum der Hüttenschlafsack auf Alpenvereinshütten Pflicht ist, Seide, Baumwolle oder Mikrofaser, was Bettwanzen und die Mikrowelle damit zu tun haben — und sieben Modelle im Vergleich.",
  ),
  alternates: { canonical: "/ausruestung/huettenschlafsack" },
};

const KAPITEL: [string, string][] = [
  ["pflicht", "Ist ein Hüttenschlafsack Pflicht?"],
  ["was", "Hüttenschlafsack, Inlett, Schlafsack"],
  ["material", "Seide, Baumwolle oder Mikrofaser"],
  ["wanzen", "Bettwanzen und die Mikrowelle"],
  ["packmass", "Gewicht und Packmaß"],
  ["form", "Form, Verschluss, Kissenfach"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Hüttenschlafsäcke einzeln"],
  ["waschen", "Hüttenschlafsack waschen"],
  ["kalt", "Wenn du im Lager frierst"],
  ["mit", "Was sonst auf die Hütte mitmuss"],
  ["nichts", "Wann du keinen brauchst"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  B001DX8064: "Unsere erste Wahl",
  B001DX9YTQ: "Seide ohne Reißverschluss",
  B01NAV63BX: "Leicht und günstig",
  B0C5D1TC3J: "Leichteste Baumwolle",
  B07YHX12ZK: "Seide, auch extrabreit",
  B0DZVNDF6V: "Zum Aufklappen",
  B0CT6B4WGH: "Wenn du leicht frierst",
};

export default async function Huettenschlafsack() {
  const p = await preise(HUETTENSCHLAFSAECKE.map((h) => h.asin));
  const PRODUKTE = HUETTENSCHLAFSAECKE.map(alsProdukt);
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

  const angebote: Angebot[] = HUETTENSCHLAFSAECKE.map((h) => ({
    asin: h.asin,
    name: `${h.marke} ${h.name}`,
    material: h.material,
    gramm: h.gramm,
    mikrowelle: h.mikrowelle,
    url: urlVon(h.asin),
    anzeige: p.get(h.asin)?.anzeige ?? null,
    zeit: zeitVon(h.asin),
  }));

  // Packmaße, wo der Hersteller sie nennt, als "B × H" in Zentimetern.
  const packmasse = HUETTENSCHLAFSAECKE.filter((h) => h.packmass).map((h) => {
    const [a, b] = h.packmass!.match(/\d+/g)!.map(Number);
    return { name: h.marke === "Backpacker's Journey" ? "Backp. Journey" : h.marke, zusatz: h.material, b: Math.min(a, b), h: Math.max(a, b), gramm: h.gramm };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/huettenschlafsack`,
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
        aktuell="Hüttenschlafsack"
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
          Auf Alpenvereinshütten ist der Hüttenschlafsack vorgeschrieben. Er wiegt so wenig, dass
          man ihn kaum bemerkt — und entsprechend leicht beim Packen vergisst. Was ihn gut macht, ist nicht die Wärme, sondern Material,
          Gewicht — und seit einigen Jahren eine Frage, an die beim Kauf kaum jemand denkt: ob Metall
          daran ist.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            `${HUETTENSCHLAFSAECKE.length} Hüttenschlafsäcke verglichen`,
            "Seide, Baumwolle, Mikrofaser",
            "Berater",
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
          nichts.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Gewicht"
            kennwertLeer="k. A."
            zeilen={PRODUKTE.map((s) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[s.asin],
              url: partnerUrl(s.asin),
            }))}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{PREISHINWEIS} Gewichte laut Hersteller; „k. A.“: nicht angegeben.</p>
      </section>

      <div className="mt-12">
        <Inhalt eintraege={KAPITEL} />
      </div>

      {/* ─────────────────────────── 1 ─────────────────────────── */}
      <Kapitel id="pflicht" titel="Ist ein Hüttenschlafsack Pflicht?" unterzeile="Auf Alpenvereinshütten ja — und zwar schwarz auf weiß.">
        <p>
          In der Hütten- und Tarifordnung der Alpenvereine steht unter „Hygienische Auflagen“ ein
          einziger Satz:{" "}
          <a href={QUELLEN.hueoto} className="underline hover:text-accent" rel="noopener" target="_blank">
            „Für alle Schlafplätze ist die Verwendung eines Hüttenschlafsacks verpflichtend
            vorgeschrieben.“
          </a>{" "}
          Das gilt im Matratzenlager wie im Mehrbettzimmer.
        </p>
        <p>
          Der Grund ist schlicht, und der{" "}
          <a href={QUELLEN.davGast} className="underline hover:text-accent" rel="noopener" target="_blank">
            Deutsche Alpenverein
          </a>{" "}
          nennt ihn offen: Überwurfdecken und Bettwäsche werden nicht nach jeder Benutzung
          gereinigt. Jeden Tag zu waschen, wäre auf abgelegenen Hütten undenkbar, hieß es 2019 in
          einer dpa-Meldung. Der Hüttenschlafsack trennt dich von der Decke — und die Decke vom
          nächsten Gast.
        </p>
        <p>
          Wer ihn vergisst, kann auf vielen Hütten einen leihen oder kaufen. Der DAV-Shop rät, das{" "}
          <a href={QUELLEN.davShop} className="underline hover:text-accent" rel="noopener" target="_blank">
            vorher zu erfragen
          </a>
          . Auf einigen Hütten ist das Leihen inzwischen sogar vorgeschrieben — dazu unten mehr.
        </p>
        <Merksatz>
          Pack den Hüttenschlafsack als Erstes. Ohne ihn darf man auf einer Alpenvereinshütte nicht
          schlafen.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="was" titel="Hüttenschlafsack, Inlett, Schlafsack" unterzeile="Drei Namen, zwei Dinge — und einmal etwas ganz anderes." breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Hüttenschlafsack",
              text: "Ein dünner Sack aus Baumwolle, Seide oder Mikrofaser, unter der Hüttendecke. Er wärmt kaum, er trennt. 140 bis knapp 500 Gramm bei den Modellen hier.",
            },
            {
              titel: "Schlafsack-Inlett",
              text: "Dasselbe Stück Stoff, im eigenen Schlafsack benutzt: Es hält den Schlafsack sauber und, je nach Material, ein wenig wärmer. Deshalb verkaufen viele Hersteller ein Modell unter beiden Namen.",
            },
            {
              titel: "Schlafsack",
              text: "Mit Füllung aus Daunen oder Kunstfaser, für Nächte ohne Decke: im Zelt, im Biwak. Auf einer bewirtschafteten Alpenvereinshütte braucht man ihn nicht — dort liegen Decken.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="material" titel="Seide, Baumwolle oder Mikrofaser" unterzeile="Die eigentliche Kaufentscheidung." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Der DAV-Shop fasst es in drei Sätzen zusammen: Seide ist am leichtesten und am
            kompaktesten und wirkt bei Hitze kühlend. Baumwolle ist etwas schwerer, dafür günstiger.
            Wer es elastischer mag, nimmt Fleece. Dazu kommt Mikrofaser, die günstige Antwort auf
            Seide.
          </p>
        </div>
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Materialien für Hüttenschlafsäcke im Vergleich</caption>
            <thead className="bg-sand text-left text-muted">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-sand px-4 py-3 font-medium">&nbsp;</th>
                <th scope="col" className="px-4 py-3 font-medium">Seide</th>
                <th scope="col" className="px-4 py-3 font-medium">Baumwolle</th>
                <th scope="col" className="px-4 py-3 font-medium">Mikrofaser</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Gewicht hier", "140–180 g", "225–410 g", "230 g"],
                ["Auf der Haut", "glatt, kühl", "wie Bettwäsche", "glatt, für manche synthetisch"],
                ["Preis", "hoch", "niedrig bis mittel", "niedrig"],
                ["Pflege", "schonend", "unkompliziert", "unkompliziert, oft 30 °C"],
                ["Für wen", "Gewichtssparer, warme Lager", "die meisten", "kleines Budget"],
              ].map(([k, ...w]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {w.map((x, i) => (
                    <td key={i} className="px-4 py-3">{x}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Gewichte der Modelle in diesem Vergleich, laut Hersteller. Die übrigen Zeilen sind unsere
          Einordnung.
        </p>
        <p className="max-w-3xl">Wenn du dich nicht entscheiden kannst, drei Fragen:</p>
        <Schlafsackberater angebote={angebote} />
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="wanzen" titel="Bettwanzen und die Mikrowelle" unterzeile="Warum manche Hütten deinen Schlafsack erhitzen, bevor du ins Lager darfst.">
        <p>
          Im Juli 2019 berichtete die{" "}
          <a href={QUELLEN.dpa} className="underline hover:text-accent" rel="noopener" target="_blank">
            dpa
          </a>{" "}
          von der Knorrhütte am Weg zur Zugspitze: Wer dort übernachtet, steckt seinen
          Hüttenschlafsack am Eingang in die Mikrowelle, 30 Sekunden bei 600 Watt. Auch Nachbarhütten
          hatten solche Geräte angeschafft. Der Hüttenreferent der DAV-Sektion München nannte den
          Hüttenschlafsack den Übertragungsweg Nummer eins — zu 70 Prozent würden Bettwanzen darüber
          eingeschleppt.
        </p>
        <p>
          Andere Hütten gehen anders vor. Manche verleihen eigene Hüttenschlafsäcke gegen Aufpreis und
          waschen sie selbst, wie der DAV-Shop beschreibt; andere lassen Rucksäcke gar nicht erst in
          die Schlafräume. Mit mangelnder Sauberkeit hat das nichts zu tun: Bettwanzen sitzen oft in
          Ritzen und hinter Leisten, wo kein Putzen hinkommt, und in Holzhütten fühlen sie sich
          besonders wohl.
        </p>
        <p>Für den Kauf folgen daraus zwei Dinge:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Kein Metall.</strong> Ein Reißverschlussschieber aus Metall gehört nicht in die
            Mikrowelle. Klett, Kordel oder gar kein Verschluss sind die sichere Wahl. Armadic gibt
            für seinen Mikrofaser-Schlafsack ausdrücklich an, er sei in der Mikrowelle sterilisierbar.
          </li>
          <li>
            <strong>Die Waschtemperatur.</strong> Viele günstige Hüttenschlafsäcke vertragen nur
            30 °C. Das reicht gegen Schweiß, aber nicht sicher gegen Wanzen — mehr dazu unter{" "}
            <a href="#waschen" className="underline hover:text-accent">Waschen</a>.
          </li>
        </ul>
        <Merksatz>
          Nach der Hütte den Rucksack nicht aufs Bett stellen, sondern in der Badewanne öffnen und
          ausschütteln. So rät es das Umweltbundesamt allgemein nach Reisen.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="packmass" titel="Gewicht und Packmaß" unterzeile="Zwischen dem leichtesten und dem schwersten hier liegen 270 Gramm." breit>
        <p className="max-w-3xl">
          Das klingt nach wenig. Aber für eine Woche von Hütte zu Hütte nennen Bergführer höchstens
          acht Kilo für den ganzen Rucksack, und da ist jedes Teil eine Überlegung wert. Das Packmaß zählt
          fast mehr: Im Tagesrucksack, den viele auch für eine Nacht auf der Hütte nehmen, ist Platz
          knapper als Gewicht.
        </p>
        <PackmassVergleich eintraege={packmasse} vergleich={{ name: "0,5-l-Flasche", b: 7, h: 21 }} />
        <p className="max-w-3xl text-muted">
          Wie groß der Rucksack für eine Hüttentour sein sollte, steht im{" "}
          <Link href="/ausruestung/wanderrucksack" className="underline hover:text-accent">
            Rucksack-Vergleich
          </Link>{" "}
          — für ein, zwei Nächte sind es 25 bis 35 Liter.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="form" titel="Form, Verschluss, Kissenfach" breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Rechteck oder Mumie",
              text: "Das Rechteck ist die Regel und bequemer, wenn man sich im Schlaf dreht. Die Mumienform spart Stoff und Gewicht und wärmt am Kopf, ist aber an den Füßen eng — beim Reactor von Sea to Summit 55 cm.",
            },
            {
              titel: "Reißverschluss oder nicht",
              text: "Ein umlaufender Reißverschluss macht aus dem Schlafsack ein Laken oder eine Decke. Auf Hütten mit Mikrowelle ist er ein Nachteil. Wer ihn will, fragt vorher, ob die Hütte das akzeptiert.",
            },
            {
              titel: "Kissenfach",
              text: "Eine Tasche am Kopfende, in die das Hüttenkissen geschoben wird. Klingt nach Kleinigkeit und ist der Unterschied zwischen einem Kissen, das in der Nacht wegrutscht, und einem, das bleibt.",
            },
          ]}
        />
        <p className="max-w-3xl">
          Und die Breite: Die meisten sind 87 bis 90 Zentimeter breit. Wer breite Schultern hat oder
          sich im schmalen Sack eingewickelt fühlt, schaut nach einer extrabreiten Fassung — Browint
          bietet 110 Zentimeter.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[60rem] text-sm">
            <caption className="sr-only">Hüttenschlafsäcke im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {HUETTENSCHLAFSAECKE.map((h) => (
                  <th key={h.asin} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${h.asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{h.marke}</span>
                      {h.material}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (h) => <strong className="tabular-nums">{preisVon(h.asin)}</strong>],
                  ["Gewicht", (h) => (h.gramm ? `${h.gramm} g` : <span className="text-muted">k. A.</span>)],
                  ["Maße", (h) => h.masse ?? <span className="text-muted">k. A.</span>],
                  ["Packmaß", (h) => h.packmass ?? <span className="text-muted">k. A.</span>],
                  ["Verschluss", (h) => h.verschluss],
                  ["Mikrowelle", (h) => h.mikrowelle],
                  ["Waschen", (h) => h.waschen ?? <span className="text-muted">k. A.</span>],
                  ["Kissenfach", (h) => (h.kissen === null ? <span className="text-muted">k. A.</span> : h.kissen ? "ja" : "nein")],
                  [
                    "Angebot",
                    (h) => (
                      <a
                        href={urlVon(h.asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(h.asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {h.marke} {h.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (h: (typeof HUETTENSCHLAFSAECKE)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {HUETTENSCHLAFSAECKE.map((h) => (
                    <td key={h.asin} className="px-3 py-3 leading-snug">{f(h)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Alle Angaben aus den Herstellertexten zum jeweiligen Artikel. „k. A.“: nicht angegeben.
          „Mikrowelle“ gibt wieder, was der Hersteller sagt oder welcher Verschluss verbaut ist —
          geprüft hat das niemand. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Hüttenschlafsäcke einzeln" unterzeile="Zu jedem steht, wogegen er spricht und wer ihn nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
        <p className="max-w-3xl text-muted">
          Nicht dabei: die Hüttenschlafsäcke aus dem DAV-Shop, der eigene aus Baumwolle und Seide
          führt, aber nicht über Amazon verkauft.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="waschen" titel="Hüttenschlafsack waschen" unterzeile="Nach jeder Tour — und nach manchen Hütten gründlicher.">
        <p>
          Normalerweise genügt, was der Hersteller erlaubt: nach der Tour in die Maschine, bei
          Baumwolle und Mikrofaser oft 30 °C, bei Seide schonend. Offen trocknen, nicht im
          Packbeutel lagern.
        </p>
        <p>
          Anders nach einer Hütte, auf der Bettwanzen gemeldet waren, oder wenn du Stiche entdeckst.
          Das{" "}
          <a href={QUELLEN.uba} className="underline hover:text-accent" rel="noopener" target="_blank">
            Umweltbundesamt
          </a>{" "}
          nennt für befallene Textilien zwei Wege:
        </p>
        <ol className="space-y-3">
          {[
            ["Heiß waschen.", "Mindestens 40 °C, besser 60 °C, im längsten Waschprogramm mit ausreichend Waschmittel — oder im Trockner bei 60 °C."],
            ["Einfrieren.", "Was nicht heiß gewaschen werden darf, drei Tage bei −18 °C ins Tiefkühlfach, locker in einer fest verschlossenen Plastiktüte."],
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
        <Merksatz>
          Ein Hüttenschlafsack, der nur 30 °C verträgt, kommt nach einer Wanzenhütte ins
          Tiefkühlfach, nicht in die Maschine.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="kalt" titel="Wenn du im Lager frierst">
        <p>
          Ein Hüttenschlafsack aus Seide oder Baumwolle ändert an der Wärme wenig; die kommt von der
          Hüttendecke. Wer trotzdem friert, hat drei Möglichkeiten, bevor er einen richtigen
          Schlafsack hinaufträgt: eine zweite Decke erbitten, trockene Socken und eine Mütze
          anziehen — oder ein wärmeres Inlett wählen.
        </p>
        <p>
          Das Reactor-Inlett von Sea to Summit aus Thermolite ist hier das einzige, das dafür gebaut
          ist, und mit 284 Gramm nicht schwerer als manche Baumwollmodelle. Cocoon gibt für seine
          Baumwolle bis zu 3,9 Grad zusätzliche Wärme an — als Herstellerangabe ohne Prüfung.
        </p>
      </Kapitel>

      {/* ─────────────────────────── Hütte ─────────────────────────── */}
      <Kapitel id="mit" titel="Was sonst auf die Hütte mitmuss" unterzeile="Vier Dinge, die der Alpenverein Gästen mit auf den Weg gibt." breit>
        <Kartenraster
          eintraege={[
            {
              titel: "Bargeld",
              text: "Auf vielen Hütten ist keine Kartenzahlung möglich, schreibt der DAV. Übernachtung, Essen und Getränke für alle Nächte in bar einplanen.",
            },
            {
              titel: "Eine Reservierung",
              text: "Vor allem im Sommer zu Ferienzeiten. Je nach Hütte online, per Telefon oder E-Mail; einige Hütten nehmen eine Anzahlung, und wer nicht kommt, sagt früh ab.",
            },
            {
              titel: "Wissen, was Halbpension kostet",
              text: "Der Preis für die Halbpension enthält die Übernachtung nicht — die kommt dazu. Und nach 17 Uhr ist oft keine Bestellung à la carte mehr möglich, weil die Küche das Abendessen vorbereitet.",
            },
            {
              titel: "Einen vollen Akku",
              text: "Strom ist im Hochgebirge laut DAV mindestens zehnmal teurer als im Tal. Steckdosen gibt es vereinzelt, manchmal gegen einen Beitrag, WLAN in der Regel nicht. Eine Powerbank spart die Frage.",
            },
          ]}
        />
        <p className="max-w-3xl text-muted">
          Und die Mitgliedschaft: Alpenvereinsmitglieder zahlen auf Hütten der Kategorien I und II
          laut{" "}
          <a href={QUELLEN.davGast} className="underline hover:text-accent" rel="noopener" target="_blank">
            DAV
          </a>{" "}
          mindestens 12 Euro weniger pro Nacht. Wer mehrere Hüttentouren im Jahr plant, rechnet das
          einmal durch.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="nichts" titel="Wann du keinen brauchst">
        <p>
          Auf Alpenvereinshütten praktisch nie — die Hüttenordnung macht keine Ausnahme für
          Zweibettzimmer. Private Hütten und Berggasthöfe regeln das selbst; manche beziehen die
          Betten frisch wie ein Hotel. Das steht meist auf der Webseite oder in der
          Buchungsbestätigung, und wenn nicht, hilft ein Anruf.
        </p>
        <p>
          Und im eigenen Schlafsack im Zelt ist er kein Muss, sondern Komfort: Das Inlett hält den
          Schlafsack sauber, und ein Inlett lässt sich leichter waschen als ein Schlafsack.
        </p>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Baumwolle, die sich anfühlt wie Bettwäsche, alle Maße im Angebot, kein Reißverschluss
          angegeben. 410 Gramm sind nicht wenig — für die meisten Hüttentouren aber der beste
          Kompromiss aus Gefühl, Preis und Pflege.
        </p>
        <p className="mt-2 text-muted">
          Wenn jedes Gramm zählt, nimm den{" "}
          <a href="#B01NAV63BX" className="underline hover:text-accent">Armadic aus Mikrofaser</a> — 230
          Gramm, und laut Hersteller für die Mikrowelle geeignet.
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
          Wir haben diese Hüttenschlafsäcke nicht getestet und behaupten das auch nicht. Einen
          unabhängigen Test gibt es nicht. Was hier steht, ist eine Zusammenstellung aus der
          Hüttenordnung, Angaben des Alpenvereins, einer dpa-Meldung, dem Ratgeber des
          Umweltbundesamts und den Herstellerangaben.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            <a href={QUELLEN.hueoto} className="underline hover:text-accent" rel="noopener" target="_blank">
              Hütten- und Tarifordnung für Alpenvereinshütten
            </a>{" "}
            (ab 2022), Hygienische Auflagen.
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.davGast} className="underline hover:text-accent" rel="noopener" target="_blank">
              Zu Gast auf Alpenvereinshütten
            </a>
            ; DAV-Shop,{" "}
            <a href={QUELLEN.davShop} className="underline hover:text-accent" rel="noopener" target="_blank">
              Der Hüttenschlafsack
            </a>
            .
          </li>
          <li>
            dpa,{" "}
            <a href={QUELLEN.dpa} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wanze am Berg: Mikrowelle gegen Blutsauger
            </a>
            , 12. Juli 2019.
          </li>
          <li>
            Umweltbundesamt,{" "}
            <a href={QUELLEN.uba} className="underline hover:text-accent" rel="noopener" target="_blank">
              Ratgeber Bettwanzen
            </a>
            , 2023.
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
            <Link href="/ausruestung/wanderrucksack" className="font-medium hover:text-accent">Wanderrucksack im Vergleich</Link>
            <p className="text-sm text-muted">25 bis 35 Liter für ein, zwei Hüttennächte.</p>
          </li>
          <li>
            <Link href="/ausruestung/groedel" className="font-medium hover:text-accent">Grödel im Vergleich</Link>
            <p className="text-sm text-muted">Für den Zustieg im Herbst und Frühjahr.</p>
          </li>
          <li>
            <Link href="/region/berchtesgadener-land" className="font-medium hover:text-accent">Wanderparkplätze im Berchtesgadener Land</Link>
            <p className="text-sm text-muted">Ausgangspunkte für Touren zu Alpenvereinshütten.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
