import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Gamaschenberater, { type GamaschenAngebot } from "@/components/ausruestung/Gamaschenberater";
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
import { GAMASCHEN, FRAGEN, QUELLEN, alsProdukt, standardGroesse } from "@/lib/ausruestung/gamaschen";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Gamaschen zum Wandern: Welche Höhe, dicht oder atmungsaktiv, und helfen sie gegen Zecken?";

export const metadata: Metadata = {
  title: titel("Gamaschen zum Wandern: Höhe, Material, Zecken"),
  description: beschreibung(
    "Wann Gamaschen beim Wandern helfen, kurz, wadenlang oder lang, dicht oder atmungsaktiv, die richtige Größe, was das RKI zu Zecken sagt — und sechs Gamaschen im Vergleich.",
  ),
  alternates: { canonical: "/ausruestung/gamaschen" },
};

const KAPITEL: [string, string][] = [
  ["wann", "Wann Gamaschen helfen"],
  ["hoehe", "Kurz, wadenlang oder lang"],
  ["material", "Dicht oder atmungsaktiv"],
  ["aufbau", "Verschluss, Haken, Steg"],
  ["groesse", "Die richtige Größe"],
  ["anlegen", "Gamaschen richtig anlegen"],
  ["zecken", "Gamaschen gegen Zecken"],
  ["regen", "Im Regen und im Schnee"],
  ["vergleich", "Technische Daten im Vergleich"],
  ["modelle", "Die Gamaschen einzeln"],
  ["pflege", "Pflege"],
  ["nichts", "Wann du keine brauchst"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  "Gaiter 420 HD": "Unsere erste Wahl",
  "Quagmire eVent": "Dicht und atmungsaktiv",
  "Hiking Gaiter": "Wadenlang, für Tagestouren",
  "INSTAgaiter Low": "Für Trail und Sommer",
  "Gaiter 420 HD Short": "Kurz, gegen Steinchen",
  "Gamaschen wasserdicht": "Günstig und lang",
};

/** Kürzel, mit denen der Berater auf die Modelle verweist. */
const BERATER: Record<string, string> = {
  tatonka: "Gaiter 420 HD",
  quagmire: "Quagmire eVent",
  salewa: "Hiking Gaiter",
  kahtoola: "INSTAgaiter Low",
  short: "Gaiter 420 HD Short",
};

export default async function Gamaschen() {
  const p = await preise(GAMASCHEN.flatMap((g) => g.groessen.map((x) => x.asin)));
  const PRODUKTE = GAMASCHEN.map(alsProdukt);
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

  const angebote: Record<string, GamaschenAngebot> = Object.fromEntries(
    Object.entries(BERATER).map(([k, name]) => {
      const g = GAMASCHEN.find((x) => x.name === name)!;
      const asin = standardGroesse(g).asin;
      return [k, { k, name: `${g.marke} ${g.name}`, url: urlVon(asin), anzeige: p.get(asin)?.anzeige ?? null, zeit: zeitVon(asin) }];
    }),
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

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/gamaschen`,
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
        aktuell="Gamaschen"
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
          Gamaschen lösen ein Problem, das jeder kennt, der morgens durch taunasses Gras gegangen ist:
          Nach einer halben Stunde sind die Socken nass, obwohl die Schuhe dicht sind. Das Wasser
          kommt von oben. Welche Gamasche hilft, hängt weniger an der Marke als an zwei Fragen — wie
          hoch, und dicht oder atmungsaktiv.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${GAMASCHEN.length} Gamaschen verglichen`, "Berater nach Gelände", "Größen einzeln", "Zecken laut RKI"].map((t) => (
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
          nichts. Alle Größen stehen unter{" "}
          <a href="#groesse" className="underline hover:text-accent">Die richtige Größe</a>.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="Höhe"
            zeilen={PRODUKTE.map((s, i) => ({
              s,
              preis: p.get(s.asin),
              fuer: FUER[GAMASCHEN[i].name],
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
      <Kapitel id="wann" titel="Wann Gamaschen helfen" unterzeile="Sie halten fern, was von oben in den Schuh kommt." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Sea to Summit beschreibt Gamaschen als leichte, abnehmbare Überzüge, die Füße, Schuhe und
            Socken vor Wasser, Schmutz, Sand, Schnee und Steinchen schützen — höhere Modelle auch die
            Unterschenkel. Ein dichter Wanderschuh hilft wenig, wenn das Wasser über den Rand läuft:
            aus nassem Gras, das an der Hose hängt, aus Schnee, in den man einsinkt, aus Schlamm, der
            über den Knöchel reicht.
          </p>
          <p>Welche Gamasche zu deinen Touren passt:</p>
        </div>
        <Gamaschenberater angebote={angebote} />
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="hoehe" titel="Kurz, wadenlang oder lang" unterzeile="Die Höhe entscheidet, wogegen eine Gamasche hilft." breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Kurz, um 25 cm",
              text: "Knöchelgamaschen für Halbschuhe und Trailrunner. Sie halten Staub, Sand, Samen und Steinchen aus dem Schuh, vor allem bei trockenem, warmem Wetter. Gegen nasses Gras helfen sie kaum.",
            },
            {
              titel: "Wadenlang, um 30 cm",
              text: "Reichen über den Knöchel eines Wanderstiefels bis zur Wade. Der Kompromiss für die meisten Tageswanderungen: nasses Gras, Matsch, Pfützen — und im Sommer noch erträglich.",
            },
            {
              titel: "Lang, bis unters Knie",
              text: "Schützen das ganze Schienbein vor Gestrüpp, Schlamm, Wasser, Schnee und Geröll. Für Schneeschuhtouren, Winterwanderungen und lange Regentage.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="material" titel="Dicht oder atmungsaktiv" unterzeile="Beides zugleich kostet deutlich mehr.">
        <p>
          <strong>Beschichtete Gamaschen</strong> wie die Tatonka 420 HD sind aus Nylon mit einer
          PU-Schicht. Sie halten Wasser zuverlässig ab, lassen aber keinen Dampf durch — unter einer
          langen Gamasche wird es im Aufstieg an einem warmen Tag feucht, vom eigenen Schweiß.
        </p>
        <p>
          <strong>Gamaschen mit Membran</strong> wie die Sea to Summit Quagmire aus eVent sind dicht
          und atmungsaktiv. Dafür kosten sie deutlich mehr.
        </p>
        <p>
          <strong>Wasserabweisende, dehnbare Stoffe</strong> wie bei der Kahtoola INSTAgaiter
          atmen gut, halten aber nur Spritzwasser ab. Für Sommer und Trail genau richtig, für Regen
          nicht.
        </p>
        <Merksatz>
          Unten, wo Steine und Steigeisen reiben, sollte der Stoff am dicksten sein. Gute Gamaschen
          sind dort verstärkt — Sea to Summit etwa mit 1000-Denier-Cordura.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="aufbau" titel="Verschluss, Haken, Steg" unterzeile="Drei Teile, an denen man eine gute Gamasche erkennt." breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Verschluss vorn",
              text: "Klett oder Reißverschluss über die ganze Länge. Breiter Klett ist mit Handschuhen und Schnee einfacher; ein Reißverschluss schließt glatter, wird mit Schnee darin aber schwergängig.",
            },
            {
              titel: "Haken für die Schnürsenkel",
              text: "Er hält die Gamasche vorn am Schuh und dichtet die Unterkante ab. Je besser diese Dichtung, desto weniger Regen und Schlamm kommen hinein, schreibt Sea to Summit.",
            },
            {
              titel: "Steg unter dem Schuh",
              text: "Hält die Gamasche unten und reibt bei jedem Schritt am Boden — er verschleißt zuerst. Deshalb lohnt ein Blick darauf, ob er aus Hypalon ist, einem robusten Kautschuk, oder sich austauschen lässt.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="groesse" titel="Die richtige Größe" unterzeile="Gemessen an Wade und Schuh." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Zu locker, und Wasser, Schlamm und Schnee kommen oben und unten hinein. Zu eng, und die
            Gamasche lässt sich nicht richtig schließen. Maßgeblich sind der Wadenumfang und das
            Volumen des Schuhs — bei voluminösen Berg- und Skistiefeln rät Sea to Summit, eine Nummer
            größer zu nehmen. Und vor dem ersten Einsatz: mit der Gamasche ein paar Schritte gehen und
            prüfen, ob etwas reibt oder einschnürt.
          </p>
        </div>
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {GAMASCHEN.map((g) => (
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
                      {x.hinweis && <span className="block font-normal text-muted">{x.hinweis}</span>}
                    </>,
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="max-w-3xl text-xs text-muted">
          Anzeige. Alle Knöpfe führen zu Amazon und tragen eine Partnerkennung. Preise und
          Verfügbarkeit: Stand {zeitVon(erste.asin)} Uhr. {PREISHINWEIS} Maße nur, wo das Angebot sie
          nennt; sonst steht die Tabelle auf den Produktbildern.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="anlegen" titel="Gamaschen richtig anlegen" breit>
        <ol className="max-w-3xl space-y-4">
          {[
            ["Links und rechts beachten.", "Viele Gamaschen sind seitenverschieden. Der Haken für die Schnürsenkel zeigt nach vorn, der Verschluss auch."],
            ["Um den Unterschenkel legen und schließen.", "Mit ganz geöffnetem Verschluss um das Bein, dann vorn zudrücken oder zuziehen."],
            ["Nach unten auf den Schuh schieben.", "Die Unterkante liegt auf dem Schuh auf, nicht darüber."],
            ["Haken in die Schnürsenkel.", "Er zieht die Gamasche vorn an den Schuh und macht die Unterkante dicht."],
            ["Steg unter die Sohle.", "In die Wölbung vor dem Absatz, fest anziehen. Neu einstellen, wenn du die Gamaschen an anderen Schuhen trägst."],
            ["Oben schließen, nicht zu fest.", "Ein Riemen oder eine Kordel oben verhindert, dass die Gamasche rutscht. Etwas Spiel lässt Luft durch."],
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
        <p className="max-w-3xl text-muted">Die Schritte folgen dem Gamaschen-Leitfaden von Sea to Summit.</p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="zecken" titel="Gamaschen gegen Zecken" unterzeile="Kein Schutzschild — aber eine Hilfe, die das RKI beschreibt.">
        <p>
          Das{" "}
          <a href={QUELLEN.rki} className="underline hover:text-accent" rel="noopener" target="_blank">
            Robert Koch-Institut
          </a>{" "}
          rät für hohes Gras, Gebüsch und Unterholz zu geschlossener Kleidung — feste Schuhe, lange
          Hosen, lange Ärmel. Das biete einen gewissen Schutz. Werden die Hosenbeine zusätzlich in die
          Socken gesteckt, muss die Zecke außen auf der Kleidung nach oben laufen, wo man sie leichter
          findet.
        </p>
        <p>
          Eine Gamasche über Hosenbein und Schuh erfüllt denselben Zweck, und sie sieht dabei weniger
          seltsam aus. Tatonka und Kahtoola nennen Zecken ausdrücklich. Das RKI rät außerdem zu
          Repellentien, zu heller Kleidung und dazu, den Körper nach dem Aufenthalt im Freien
          abzusuchen — besonders Kniekehle, Genitalbereich und Haaransatz.
        </p>
        <p>
          Wie wichtig das ist, zeigt die{" "}
          <a href={QUELLEN.rkiKarte} className="underline hover:text-accent" rel="noopener" target="_blank">
            FSME-Karte des RKI
          </a>
          : Im Februar 2026 waren 185 Kreise als Risikogebiete ausgewiesen, vor allem in Bayern,
          Baden-Württemberg, Südhessen, Sachsen und Thüringen. Gegen FSME gibt es eine Impfung, gegen
          Borreliose, die bundesweit vorkommt, nicht.
        </p>
        <Merksatz>
          Gamaschen verhindern keinen Zeckenstich, sie machen die Zecke sichtbar, bevor sie die Haut
          erreicht. Absuchen nach der Tour bleibt Pflicht — eine Zeckenkarte gehört ins{" "}
          <Link href="/ausruestung/erste-hilfe-set" className="underline hover:text-accent">
            Erste-Hilfe-Set
          </Link>
          .
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="regen" titel="Im Regen und im Schnee">
        <p>
          <strong>Bei starkem Regen gehört die Gamasche unter die Regenhose,</strong> nicht darüber.
          Sonst läuft das Wasser an der Hose herunter, in die Gamasche und in den Schuh. So rät es Sea to
          Summit in seinem Leitfaden.
        </p>
        <p>
          Im Schnee ist es umgekehrt: Dort kommt der Schnee von unten, beim Einsinken. Lange Gamaschen
          über der Hose halten ihn draußen. Für Winterwanderungen auf vereisten Wegen gehören dazu{" "}
          <Link href="/ausruestung/groedel" className="underline hover:text-accent">Grödel</Link>.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Technische Daten im Vergleich" breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[52rem] text-sm">
            <caption className="sr-only">Gamaschen im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-28 bg-sand px-4 py-3 text-left font-medium text-muted">&nbsp;</th>
                {GAMASCHEN.map((g) => (
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
                  ["Höhe", (g) => (g.hoeheCm ? `${g.hoehe}, ${g.hoeheCm} cm` : g.hoehe)],
                  ["Wasser", (g) => g.dicht],
                  ["Material", (g) => g.material],
                  ["Verschluss", (g) => g.verschluss],
                  ["Steg", (g) => g.steg],
                  ["Gewicht", (g) => (g.gramm ? `${g.gramm} g` : <span className="text-muted">k. A.</span>)],
                  ["Größen", (g) => g.groessen.map((x) => x.k).join(", ")],
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
                ] as [string, (g: (typeof GAMASCHEN)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {GAMASCHEN.map((g) => (
                    <td key={g.name} className="px-3 py-3 leading-snug">{f(g)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Alle Angaben aus den Herstellertexten; bei Sea to Summit zusätzlich aus dessen
          Gamaschen-Leitfaden. „k. A.“: nicht angegeben. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Gamaschen einzeln" unterzeile="Zu jeder steht, wogegen sie spricht und wer sie nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
        <p className="max-w-3xl text-muted">
          Für Kinder gibt es die Tatonka 420 HD auch als Junior-Ausführung.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Pflege">
        <p>
          Nach der Tour den Schmutz mit Bürste, Wasser und etwas mildem Waschmittel entfernen und die
          Gamaschen an der Luft vollständig trocknen lassen, bevor sie in den Schrank kommen — so
          beschreibt es Sea to Summit. Getrockneter Schlamm im Klett oder im Reißverschluss lässt einen
          Verschluss mit der Zeit schlechter schließen.
        </p>
        <p>
          Den Steg regelmäßig ansehen. Sea to Summit beschreibt ihn bei der Quagmire als austauschbar,
          Kahtoola gibt auf den Steg der INSTAgaiter eine Garantie über 1000 Meilen. Bei den anderen
          Modellen steht dazu nichts im Angebot.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel id="nichts" titel="Wann du keine brauchst">
        <p>
          Auf trockenen Forstwegen und festen Pfaden im Sommer bringen Gamaschen nichts außer Wärme.
          Wer mit hohen Wanderstiefeln auf befestigten Wegen geht, braucht sie auch bei leichtem Regen
          nicht — der Schaft reicht.
        </p>
        <p>
          Und gegen Zecken tun es auf kurzen Runden auch in die Socken gesteckte Hosenbeine, so wie das
          RKI es beschreibt. Die Gamasche ist die bequemere, nicht die einzige Lösung.
        </p>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Lang, dicht, mit Hypalon-Steg und Metallhaken, Höhe und Wadenumfang für jede Größe im
          Angebot. Für Schnee, Regen, nasses Gras und Zecken — und in der kurzen Fassung auch für
          Schotterwege.
        </p>
        <p className="mt-2 text-muted">
          Wenn du viel im Sommer gehst, nimm die wadenlange{" "}
          <a href={`#${standardGroesse(GAMASCHEN[2]).asin}`} className="underline hover:text-accent">Salewa Hiking Gaiter</a>{" "}
          mit 140 Gramm.
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
          Einen unabhängigen Test von Gamaschen gibt es nicht. Die Angaben stammen aus den
          Herstellertexten, dem Gamaschen-Leitfaden von Sea to Summit und den Empfehlungen des Robert
          Koch-Instituts zum Schutz vor Zecken.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Sea to Summit,{" "}
            <a href={QUELLEN.sts} className="underline hover:text-accent" rel="noopener" target="_blank">
              Der Gamaschen Guide: Wie du sie auswählst, verwendest und pflegst
            </a>
            .
          </li>
          <li>
            Robert Koch-Institut,{" "}
            <a href={QUELLEN.rki} className="underline hover:text-accent" rel="noopener" target="_blank">
              Antworten auf häufig gestellte Fragen zu Zecken
            </a>{" "}
            und{" "}
            <a href={QUELLEN.rkiKarte} className="underline hover:text-accent" rel="noopener" target="_blank">
              Neue Karte der FSME-Risikogebiete
            </a>{" "}
            (Epidemiologisches Bulletin 9/2026).
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
            <Link href="/ausruestung/groedel" className="font-medium hover:text-accent">Grödel im Vergleich</Link>
            <p className="text-sm text-muted">Für vereiste Wege im Winter.</p>
          </li>
          <li>
            <Link href="/ausruestung/erste-hilfe-set" className="font-medium hover:text-accent">Erste-Hilfe-Set im Vergleich</Link>
            <p className="text-sm text-muted">Mit Zeckenkarte.</p>
          </li>
          <li>
            <Link href="/ausruestung/wanderstoecke" className="font-medium hover:text-accent">Wanderstöcke im Vergleich</Link>
            <p className="text-sm text-muted">Für Matsch, Schnee und Abstiege.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
