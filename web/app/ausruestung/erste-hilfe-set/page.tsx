import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Affiliatelink from "@/components/Affiliatelink";
import SetCheck, { type Nachkauf } from "@/components/ausruestung/SetCheck";
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
  NotsignalBild,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl, PREISHINWEIS, HERKUNFT, PARTNER } from "@/lib/amazon";
import {
  SETS,
  DAV_LISTE,
  NACHKAUF,
  ZUBEHOER,
  KLASSEN,
  FRAGEN,
  QUELLEN,
  alsProdukt,
  abdeckung,
} from "@/lib/ausruestung/erstehilfe";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Erste-Hilfe-Set zum Wandern: Was hineingehört, welche Größe, welche Seite der Rettungsdecke";

export const metadata: Metadata = {
  title: titel("Erste-Hilfe-Set Wandern: Inhalt nach DAV, sieben im Vergleich"),
  description: beschreibung(
    "Was laut Alpenverein in ein Erste-Hilfe-Set für Wanderungen gehört, welche Größe, welche Seite der Rettungsdecke nach außen — und sieben Sets von Deuter bis Tatonka an der DAV-Liste gemessen.",
  ),
  alternates: { canonical: "/ausruestung/erste-hilfe-set" },
};

const KAPITEL: [string, string][] = [
  ["inhalt", "Was hineingehört"],
  ["groesse", "Mini, Standard oder erweitert"],
  ["rettungsdecke", "Rettungsdecke: welche Seite?"],
  ["notruf", "Notruf und alpines Notsignal"],
  ["blasen", "Blasen, Zecken, Medikamente"],
  ["zusatz", "Was der DAV zusätzlich empfiehlt"],
  ["weglassen", "Was du weglassen kannst"],
  ["vergleich", "Alle Sets an der DAV-Liste"],
  ["modelle", "Die Sets einzeln"],
  ["pflege", "Kontrollieren und erneuern"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

const FUER: Record<string, string> = {
  B09MQMXXF7: "Unsere erste Wahl",
  B0DSVZQ3C1: "Leicht, mit Rettungsdecke ergänzen",
  B001QXDQPG: "Für Gruppen und mehrere Tage",
  B0015NQLNQ: "Für kleine Verletzungen",
  B07Q4647Y9: "Flach für die Deckeltasche",
  B001QXDQOM: "Grundausstattung",
  B001QXDOXU: "Nur für die Hosentasche",
};

export default async function ErsteHilfeSet() {
  const p = await preise([
    ...SETS.map((s) => s.asin),
    ...Object.values(NACHKAUF).map((n) => n!.asin),
    ZUBEHOER.biwaksack.asin,
    ZUBEHOER.schiene.asin,
  ]);
  const PRODUKTE = SETS.map(alsProdukt);
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

  const nachkauf: Record<string, Nachkauf> = Object.fromEntries(
    Object.entries(NACHKAUF).map(([k, n]) => [k, { name: n!.name, url: urlVon(n!.asin), anzeige: p.get(n!.asin)?.anzeige ?? null }]),
  );
  const rd = NACHKAUF.rettungsdecke!;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/erste-hilfe-set`,
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
        aktuell="Erste-Hilfe-Set"
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
          Ein Erste-Hilfe-Set wiegt ein paar hundert Gramm und wird auf den meisten Touren nie
          geöffnet. Umso wichtiger ist, dass im entscheidenden Moment das Richtige drin ist. Der
          Deutsche Alpenverein hat aufgeschrieben, was das ist — fünfzehn Positionen. An dieser Liste
          messen wir hier jedes Set, und mit dem Set-Check kannst du dein eigenes prüfen.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[`${SETS.length} Sets an der DAV-Liste gemessen`, "Set-Check", "Notsignal", "Rettungsdecke: welche Seite"].map((t) => (
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
          nichts. Die Spalte „DAV-Liste“ zählt, wie viele der fünfzehn empfohlenen Positionen das Set
          laut Hersteller enthält.
        </p>
        <div className="mt-5">
          <Uebersicht
            kennwertTitel="DAV-Liste"
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
      <Kapitel id="inhalt" titel="Was hineingehört" unterzeile="Fünfzehn Positionen, aufgeschrieben vom Deutschen Alpenverein." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            „Besser haben als brauchen“, schreibt der{" "}
            <a href={QUELLEN.dav} className="underline hover:text-accent" rel="noopener" target="_blank">
              Deutsche Alpenverein
            </a>
            , und nennt für ein Standard-Päckchen zur Tagestour eine genaue Liste: vom Verbandpäckchen
            für stark blutende Wunden über die Rettungsfolie bis zum Traubenzucker. Dazu kommen vier
            Anforderungen an die Hülle — robust und wasserabweisend, übersichtlich nach Themen sortiert,
            in Signalfarbe, damit man sie schnell findet, und für Kletterer mit einer Schlaufe für den
            Gurt.
          </p>
          <p>
            Kaum ein fertiges Set enthält alles. Die Frage ist also nicht, welches Set vollständig ist,
            sondern welches am wenigsten ergänzt werden muss. Wähle ein Set oder prüfe dein eigenes:
          </p>
        </div>
        <SetCheck
          sets={SETS.map((s) => ({ asin: s.asin, name: `${s.marke} ${s.name}`, hat: s.hat }))}
          liste={DAV_LISTE}
          nachkauf={nachkauf}
          zeit={zeitVon(rd.asin)}
        />
        <div className="max-w-3xl">
          <Merksatz>
            Nach dem Kauf einmal alles auspacken und wieder einräumen. Der DAV rät das ausdrücklich:
            Material nützt nur, wenn man weiß, was drin ist und wo.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel id="groesse" titel="Mini, Standard oder erweitert" unterzeile="Der DAV unterscheidet drei Größen — nach der Tour, nicht nach dem Rucksack." breit>
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">Größen von Erste-Hilfe-Sets nach DAV</caption>
            <thead className="bg-sand text-left text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Päckchen</th>
                <th scope="col" className="px-4 py-3 font-medium">Für</th>
                <th scope="col" className="px-4 py-3 font-medium">Gewicht</th>
                <th scope="col" className="px-4 py-3 font-medium">Maße</th>
                <th scope="col" className="px-4 py-3 font-medium">Preis laut DAV</th>
              </tr>
            </thead>
            <tbody>
              {KLASSEN.map((k) => (
                <tr key={k.k} className="border-t border-line align-top">
                  <th scope="row" className="px-4 py-3 text-left font-semibold">{k.k}</th>
                  <td className="px-4 py-3">{k.fuer}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">{k.gramm}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">{k.masse}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">{k.preis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="max-w-3xl space-y-5">
          <p>
            Für Wanderungen ist das Standard-Päckchen die richtige Größe. Das Mini-Päckchen enthält laut
            DAV nur Handschuhe, zwei Verbandpäckchen, zwei Kompressen, Rettungsfolie und einen Meter
            Tape — genug, um eine Blutung zu stillen und jemanden warm zu halten, mehr nicht.
          </p>
          <p>
            Das erweiterte Päckchen ist das Standard-Päckchen in größerer Menge: zwei Paar
            Handschuhe, vier Verbandpäckchen, vier Kompressen. Der DAV nennt eine Alternative, die
            Gruppen oft übersehen: zwei Standard-Päckchen kaufen und aufteilen.
          </p>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="rettungsdecke" titel="Rettungsdecke: welche Seite?" unterzeile="Die Frage, die jeder stellt — und die weniger zählt als das Wie." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Der DAV schreibt es in seine Liste: <strong>silberne Seite zum Patienten, goldene nach
            außen.</strong> So empfehlen es auch Hersteller und Lehrbücher. Für die Wärme ist der
            Unterschied allerdings kleiner, als die Regel vermuten lässt — Messungen, auf die{" "}
            <a href={QUELLEN.wikipedia} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wikipedia
            </a>{" "}
            verweist, fanden kaum Unterschiede zwischen den Seiten.
          </p>
          <p>
            Einen guten Grund für Gold außen gibt es trotzdem: Die goldene Fläche macht eine
            verletzte Person im Schnee und auf dem Gletscher besser sichtbar, schreiben Forscher der
            Tiroler Bergrettung und der Medizinischen Universität Innsbruck in einer{" "}
            <a href={QUELLEN.wallner} className="underline hover:text-accent" rel="noopener" target="_blank">
              Übersichtsarbeit von 2022
            </a>
            .
          </p>
        </div>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Gegen Kälte",
              text: "Gold außen, silber innen. Die Person komplett einwickeln, nur das Gesicht frei, und die Folie dicht schließen — der Wind ist der größere Feind als die Farbe. Von unten isolieren: Die Folie selbst dämmt nicht, der Rucksack als Unterlage schon.",
            },
            {
              titel: "Gegen Sonne und Hitze",
              text: "Silber außen, und nicht einwickeln, sondern als Schattensegel über der Person aufspannen.",
            },
            {
              titel: "Mehr als eine Decke",
              text: "Der DAV schreibt: Ein Biwaksack schützt besser vor Unterkühlung als eine Rettungsdecke. Wer abseits unterwegs ist, packt beides ein — die Folie wiegt fast nichts.",
            },
          ]}
        />
        <div className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
          <Produktbild preis={p.get(rd.asin)} alt={rd.name} href={partnerUrl(rd.asin)} />
          <div>
            <p className="text-sm font-semibold text-accent">Wenn im Set keine ist</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight">{rd.name}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
              Einzeln verpackt, gold und silber. Gehört in jedes Set, dem sie fehlt — beim Deuter Active
              und beim Lifesystems Trek etwa.
            </p>
            <Affiliatelink url={urlVon(rd.asin)} preis={p.get(rd.asin)} name={rd.name} knapp />
          </div>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="notruf" titel="Notruf und alpines Notsignal" unterzeile="Das wichtigste Teil der Ersten Hilfe ist nicht im Set." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Die <strong>112</strong> gilt europaweit, hat Vorrang im Netz und funktioniert auch
            mit fremdem oder gesperrtem Handy. Wenn keine Verbindung zustande kommt, rät der{" "}
            <a href={QUELLEN.notruf} className="underline hover:text-accent" rel="noopener" target="_blank">
              DAV
            </a>
            : in den Flugmodus wechseln und noch einmal 112 wählen — das Telefon schaltet den
            Flugmodus ab und sucht das nächste ausreichend starke Netz, auch das eines anderen
            Anbieters.
          </p>
          <p>
            Außerhalb Deutschlands und Südtirols landet die 112 oft nicht direkt bei der Bergrettung,
            sondern etwa bei der Polizei. In Österreich gibt es deshalb den Alpinnotruf{" "}
            <strong>140</strong>, in der Schweiz die Rega unter <strong>1414</strong>. Und den eigenen
            Standort sollte man auch in Worten beschreiben können, denn nicht jede Leitstelle kann
            GPS-Daten aus einer App auswerten.
          </p>
          <p>Wenn es nirgends Empfang gibt, bleibt das alpine Notsignal:</p>
        </div>
        <NotsignalBild />
        <div className="max-w-3xl">
          <Merksatz>
            Handy mit vollem Akku, auf Tour im Flugmodus und nah am Körper — so empfiehlt es der DAV.
            Der Notruf braucht Strom, auch wenn man den ganzen Tag keinen Anruf erwartet.
          </Merksatz>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="blasen" titel="Blasen, Zecken, Medikamente" unterzeile="Drei Dinge, bei denen man es leicht falsch macht.">
        <p>
          <strong>Blasenpflaster</strong> gehören laut DAV ins Set, aber mit einer Einschränkung: Die
          hautbildenden Pflaster sind nur zur Regeneration gedacht. Beim Gehen verkleben sie mit der
          Socke, und beim Ausziehen reißt die Blase auf. Wer weitergehen muss, klebt sie längs mit Tape
          über — auch deshalb gehört eine Taperolle ins Set.
        </p>
        <p>
          <strong>Zecken</strong> sitzen nach einer Wanderung durch hohes Gras oft da, wo man sie nicht
          sieht. Eine Zeckenkarte wiegt ein paar Gramm und steht auf der DAV-Liste, fehlt aber fast allen
          fertigen Sets — nur das Tatonka Mini hat eine Zeckenzange.
        </p>
        <p>
          <strong>Medikamente</strong> sieht der DAV kritisch. Auch rezeptfreie Mittel wie Aspirin
          können im falschen Moment ernsten Schaden anrichten. Wenn überhaupt, dann für den eigenen
          Bedarf — an andere weitergeben dürfen sie nur dafür ausgebildete Profis. Wer selbst
          regelmäßig ein Medikament braucht, packt es natürlich trotzdem ein, und zwar nicht nur für
          einen Tag.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="zusatz" titel="Was der DAV zusätzlich empfiehlt" unterzeile="Nicht im Set, aber im Rucksack." breit>
        <div className="grid gap-5 md:grid-cols-2">
          {[ZUBEHOER.biwaksack, ZUBEHOER.schiene].map((z) => (
            <div key={z.asin} className="grid gap-4 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[7rem_1fr]">
              <Produktbild preis={p.get(z.asin)} alt={z.name} href={partnerUrl(z.asin)} klein />
              <div>
                <h3 className="font-bold tracking-tight">{z.name}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{z.text}</p>
                <Affiliatelink url={urlVon(z.asin)} preis={p.get(z.asin)} name={z.name} knapp />
              </div>
            </div>
          ))}
        </div>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Stirnlampe",
              text: (
                <>
                  Ein Unfall kostet immer Zeit, und es wird schnell dunkel. Für Touren ohne Nachtaufbruch
                  genügt laut DAV eine kleine Notfallstirnlampe ab etwa 30 Gramm — mit ihr gibt man auch
                  das Notsignal. Welche Lampe für Wanderungen taugt, steht im{" "}
                  <Link href="/ausruestung/stirnlampe" className="underline hover:text-accent">Stirnlampen-Vergleich</Link>.
                </>
              ),
            },
            {
              titel: "Fettgaze",
              text: "Zum Abdecken von Schürfwunden, die nicht an der Kompresse festkleben sollen.",
            },
            {
              titel: "Wundnahtstreifen",
              text: "Für Platzwunden und Schnitte, nach dem Säubern. Der DAV warnt: nach dem Verschließen am selben Tag ärztlichen Rat einholen.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="weglassen" titel="Was du weglassen kannst">
        <p>
          <strong>Verbandklammern.</strong> Sie lösen sich bei Bewegung, etwa durch Reibung am Ärmel,
          und ihre Haken können die Einmalhandschuhe beschädigen. Tape hält besser.
        </p>
        <p>
          <strong>Knicklichter.</strong> Ein Einwegprodukt, das überflüssig ist, wenn eine Stirnlampe
          dabei ist.
        </p>
        <p>
          <strong>Eine eigene Sitzunterlage für Verletzte.</strong> Die Rückseite des Rucksacks
          isoliert auch. Alle drei Punkte stammen aus der Liste des DAV, was es „nicht unbedingt“
          braucht.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Alle Sets an der DAV-Liste" unterzeile="Grün heißt: laut Hersteller enthalten." breit>
        {/* relative: absolut positionierte Vorlesetexte bleiben im Scrollrahmen. */}
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[56rem] text-sm">
            <caption className="sr-only">Erste-Hilfe-Sets im Vergleich mit der DAV-Liste</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-44 bg-sand px-4 py-3 text-left font-medium text-muted">DAV-Liste</th>
                {SETS.map((s) => (
                  <th key={s.asin} scope="col" className="px-2 py-3 text-center font-semibold">
                    <a href={`#${s.asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{s.marke}</span>
                      {s.name.replace("First Aid ", "")}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAV_LISTE.map((pos) => (
                <tr key={pos.k} className="border-t border-line">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-2 text-left font-normal">{pos.text}</th>
                  {SETS.map((s) => {
                    const ja = s.hat.includes(pos.k);
                    return (
                      <td key={s.asin} className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${ja ? "bg-accent text-white dark:text-background" : "bg-sand text-muted"}`}
                        >
                          {ja ? "✓" : "–"}
                        </span>
                        <span className="sr-only">{ja ? "enthalten" : "fehlt"}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {(
                [
                  ["Summe", (s) => <strong className="tabular-nums">{abdeckung(s)} / {DAV_LISTE.length}</strong>],
                  ["Gewicht", (s) => (s.gramm ? `${s.gramm} g` : <span className="text-muted">k. A.</span>)],
                  ["Inhalt laut", (s) => <span className="text-xs text-muted">{s.inhaltQuelle}</span>],
                  [
                    "Angebot",
                    (s) => (
                      <a
                        href={urlVon(s.asin)}
                        rel="sponsored nofollow noopener"
                        target="_blank"
                        className="inline-block rounded-lg bg-accent px-2 py-1.5 text-xs font-semibold text-white hover:brightness-110 dark:text-background"
                      >
                        {preisVon(s.asin)} <span aria-hidden>→</span>
                        <span className="sr-only"> {s.marke} {s.name} bei Amazon, Anzeige</span>
                      </a>
                    ),
                  ],
                ] as [string, (s: (typeof SETS)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t-2 border-line bg-sand/40">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">{k}</th>
                  {SETS.map((s) => (
                    <td key={s.asin} className="px-2 py-3 text-center">{f(s)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Inhalt nach den Listen auf den Herstellerseiten, bei Lifesystems und Ortovox nach dem
          Amazon-Angebot. Gezählt wird, ob eine Position vorhanden ist, nicht in welcher Menge. {PREISHINWEIS}
        </p>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="modelle" titel="Die Sets einzeln" unterzeile="Zu jedem steht, was fehlt und wer es nicht kaufen sollte." breit>
        <div className="space-y-8">
          {PRODUKTE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
        <p className="max-w-3xl text-muted">
          Für Gruppen gibt es das Deuter-Set auch als First Aid Kit Pro, mit doppeltem
          Verbandsmaterial und zwei Paar Handschuhen, 370 Gramm laut Deuter.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Kontrollieren und erneuern" unterzeile="Verbandsmaterial altert, auch ungeöffnet.">
        <p>
          Sterilität, Elastizität und Klebekraft lassen mit der Zeit nach. Der DAV rät: nach dem
          Verfallsdatum austauschen, und wo keines steht, spätestens dann, wenn Verpackungen vergilben,
          zerfransen oder spröde werden. Die Außenhülle gelegentlich auf Dichtheit prüfen.
        </p>
        <p>
          Das alte Material nicht wegwerfen — Wundauflagen und Binden taugen noch zum Üben. Und üben
          ist der Punkt, den der DAV ausdrücklich macht: regelmäßig, oder in einem Kurs zur
          Notfallversorgung im Gelände.
        </p>
        <Merksatz>
          Nach jeder Tour, auf der du etwas verbraucht hast, das Set sofort auffüllen. Das fehlende
          Pflaster merkt man sonst erst beim nächsten Mal.
        </Merksatz>
      </Kapitel>

      <Entscheidung s={erste} preis={ep} url={partnerUrl(erste.asin)}>
        <p>
          Zehn von fünfzehn DAV-Positionen, darunter Rettungsdecke, Dreieckstuch und Pinzette, in 300
          Gramm — genau die Gewichtsklasse, die der DAV für Tagestouren nennt. Eine Zeckenkarte und ein
          Beatmungstuch dazu, und es ist fast vollständig.
        </p>
        <p className="mt-2 text-muted">
          Wenn es leichter sein soll, nimm das{" "}
          <a href="#B0DSVZQ3C1" className="underline hover:text-accent">Deuter Active</a> und leg eine
          Rettungsdecke dazu.
        </p>
      </Entscheidung>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
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

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Gemessen wird an einer einzigen, öffentlich nachlesbaren Liste: der des Deutschen
          Alpenvereins für ein Standard-Päckchen zur Tagestour. Welches Set welche Position enthält,
          stammt aus den Inhaltslisten der Hersteller.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.dav} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wie funktionieren Erste-Hilfe-Sets?
            </a>
            , zuletzt geändert 21. Februar 2023: Liste, Größen, Gewichte, Preise, Ergänzungen.
          </li>
          <li>
            Deutscher Alpenverein,{" "}
            <a href={QUELLEN.notruf} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wie funktioniert das? Notruf
            </a>
            : 112, Flugmodus, 140, 1414, alpines Notsignal.
          </li>
          <li>
            Wallner et al.,{" "}
            <a href={QUELLEN.wallner} className="underline hover:text-accent" rel="noopener" target="_blank">
              Rescue Blankets as Multifunctional Rescue Equipment in Alpine and Wilderness Emergencies
            </a>
            , International Journal of Environmental Research and Public Health, 2022.
          </li>
          <li>
            Inhaltslisten: deuter.com, tatonka.com; Lifesystems und Ortovox nach dem Amazon-Angebot.
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
            <Link href="/ausruestung/wanderrucksack" className="font-medium hover:text-accent">Wanderrucksack im Vergleich</Link>
            <p className="text-sm text-muted">Das Set gehört oben in den Deckel.</p>
          </li>
          <li>
            <Link href="/ausruestung/groedel" className="font-medium hover:text-accent">Grödel im Vergleich</Link>
            <p className="text-sm text-muted">Damit es gar nicht erst so weit kommt.</p>
          </li>
          <li>
            <Link href="/ausruestung/huettenschlafsack" className="font-medium hover:text-accent">Hüttenschlafsack im Vergleich</Link>
            <p className="text-sm text-muted">Für die Nacht auf der Hütte.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
