import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Affiliatelink from "@/components/Affiliatelink";
import Laengenrechner from "@/components/ausruestung/Laengenrechner";
import {
  Kapitel,
  Merksatz,
  Inhalt,
  Schnellkarte,
  Produktbericht,
  Produktbild,
  PackmassBild,
  SchlaufeBild,
  Kartenraster,
} from "@/components/ausruestung/Bausteine";
import { preise, partnerUrl } from "@/lib/amazon";
import {
  STOECKE,
  LAENGEN,
  FAKTOR,
  FRAGEN,
  WARENTEST,
  HOLZSTOCK,
} from "@/lib/ausruestung/wanderstoecke";
import { gipfelReichweite } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

const TITEL = "Wanderstöcke im Vergleich: Länge, Verschluss, faltbar oder Teleskop";

export const metadata: Metadata = {
  title: titel(TITEL),
  description: beschreibung(
    "Die richtige Stocklänge mit Rechner, faltbar oder Teleskop, was die Stiftung Warentest herausfand — und sechs Wanderstöcke von 29 bis 150 Euro mit ihren Schwächen.",
  ),
  alternates: { canonical: "/ausruestung/wanderstoecke" },
};

const KAPITEL: [string, string][] = [
  ["brauchst-du", "Brauchst du überhaupt Stöcke?"],
  ["laenge", "Die richtige Länge"],
  ["bauart", "Faltbar oder Teleskop"],
  ["verschluss", "Der Verschluss"],
  ["material", "Aluminium, Carbon, Dämpfung"],
  ["griff", "Griff und Schlaufe"],
  ["spitze", "Spitze, Teller, Gummipuffer"],
  ["warentest", "Was die Stiftung Warentest fand"],
  ["vergleich", "Alle sechs im Vergleich"],
  ["modelle", "Die Stöcke einzeln"],
  ["holz", "Und der Holzstock?"],
  ["discounter", "Stöcke von Lidl, Aldi, Tchibo"],
  ["technik", "Richtig gehen mit Stöcken"],
  ["aeltere", "Für Ältere und bei Knieproblemen"],
  ["unterwegs", "Flugzeug, Bahn, Parkplatz"],
  ["pflege", "Pflege und Ersatzteile"],
  ["nichts", "Wann Stöcke nichts bringen"],
  ["fragen", "Häufige Fragen"],
  ["methode", "Woher die Angaben stammen"],
];

/** "110–145 cm" → [110, 145]. Feste Längen liefern null. */
function bereich(laenge: string): [number, number] | null {
  const m = laenge.match(/(\d+)\s*–\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export default async function Wanderstoecke() {
  const [p, gipfel] = await Promise.all([
    preise([...STOECKE.map((s) => s.asin), HOLZSTOCK.asin]),
    gipfelReichweite(),
  ]);
  const nach = (asin: string) => STOECKE.find((s) => s.asin === asin)!;
  const khumbu = nach("B0F63PVSJP");
  const makalu = nach("B09RPP5R95");
  const anykuu = nach("B0DPFQVN3X");

  const stand = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const verstellbar = STOECKE.flatMap((s) => {
    const b = bereich(s.laenge);
    return b ? [{ name: `${s.marke} ${s.name}`, min: b[0], max: b[1], anker: s.asin }] : [];
  });
  const preisVon = (asin: string) => p.get(asin)?.anzeige ?? "—";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITEL,
            url: `${SITE}/ausruestung/wanderstoecke`,
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

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Ausrüstung", url: "/ausruestung" },
        ]}
        aktuell="Wanderstöcke"
      />

      {/* ─────────────────────────── Einstieg ─────────────────────────── */}
      <header className="mt-4 overflow-hidden rounded-3xl bg-sand px-6 py-9 sm:px-10 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Kaufberatung · Stand {stand}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
          {TITEL}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Die meisten Kaufberatungen beantworten die falsche Frage. Welches Modell es wird,
          entscheidet weniger über den Nutzen als zwei Dinge, die in Ranglisten kaum vorkommen:
          die Länge und der Verschluss. Ein Stock für 29 Euro in der richtigen Länge hilft mehr
          als einer für 150 Euro, der zehn Zentimeter zu lang ist.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            `${STOECKE.length} Stöcke verglichen`,
            `Stiftung Warentest ${WARENTEST.heft} ausgewertet`,
            "Längenrechner",
            "nichts davon selbst getestet",
          ].map((t) => (
            <li key={t} className="rounded-full border border-line bg-card px-3 py-1">
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {STOECKE.map((s) => (
            <a
              key={s.asin}
              href={`#${s.asin}`}
              aria-label={`${s.marke} ${s.name}: zur Einschätzung`}
              className="group block"
            >
              <div className="flex h-24 items-center justify-center rounded-xl bg-white p-2 transition group-hover:shadow-md sm:h-28">
                {p.get(s.asin)?.bild && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.get(s.asin)!.bild!}
                    alt=""
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <p className="mt-1.5 truncate text-center text-xs text-muted">{s.marke}</p>
            </a>
          ))}
        </div>
      </header>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
        <strong className="text-foreground">Wie wir hier Geld verdienen:</strong> Die grünen
        Knöpfe führen zu Amazon und tragen eine Partnerkennung. Kaufst du darüber, bekommen wir
        eine Provision; der Preis ändert sich für dich nicht. Die Auswahl ist davon unabhängig:
        Der günstigste Stock steht hier mit dem deutlichsten Vorbehalt, obwohl er sich am
        leichtesten verkaufen ließe.
      </p>

      {/* ─────────────────────────── Schnellauswahl ─────────────────────────── */}
      <section id="empfehlung" className="mt-10 scroll-mt-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Die kurze Antwort</h2>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-muted">
          Wer nicht weiterlesen will: einer dieser drei. Warum, steht darunter.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Schnellkarte s={khumbu} preis={p.get(khumbu.asin)} fuer="Wenn es nur ein Paar sein soll" />
          <Schnellkarte s={makalu} preis={p.get(makalu.asin)} fuer="Wenn die Stöcke in den Rucksack müssen" />
          <Schnellkarte s={anykuu} preis={p.get(anykuu.asin)} fuer="Wenn du erst ausprobieren willst" />
        </div>
      </section>

      <div className="mt-12">
        <Inhalt eintraege={KAPITEL} />
      </div>

      {/* ─────────────────────────── 1 ─────────────────────────── */}
      <Kapitel
        id="brauchst-du"
        titel="Brauchst du überhaupt Stöcke?"
        unterzeile="Im Abstieg ja. Im Flachen eher nicht."
      >
        <p>
          Der Nutzen von Wanderstöcken ist gut untersucht, und er ist kleiner und zugleich
          konkreter, als die Werbung behauptet. Eine oft zitierte Messung von Hermann Schwameder
          und Kollegen aus Salzburg fand beim Bergabgehen mit Stöcken{" "}
          <strong>zwischen 12 und 25 Prozent geringere Kräfte im Kniegelenk</strong> als ohne.
          Der Grund ist nicht nur die Last, die über die Arme abfließt, sondern auch die Haltung:
          Mit Stöcken lehnt man sich weiter nach vorn, und das verkürzt den Hebel am Knie.
        </p>
        <p>
          Das ist der Kern. Wanderstöcke sind ein Werkzeug für den Abstieg, für unsicheren Tritt
          — nasse Wurzeln, Geröll, Schnee — und für das Queren von Bächen. Wer das kaum vor sich
          hat, braucht sie kaum.
        </p>
        <p>
          In Deutschland hat man es fast immer vor sich. An{" "}
          <strong>{nf.format(gipfel.plaetze)}</strong> der {nf.format(gipfel.gesamt)}{" "}
          Wanderparkplätze in unserem Verzeichnis liegt ein Gipfel in Reichweite. Wer dort
          losgeht, kommt auch wieder herunter.
        </p>
        <Merksatz>
          Stöcke lohnen sich, wenn es bergab geht. Wo es flach bleibt, kosten sie mehr Kraft, als
          sie sparen — mehr dazu am Ende unter{" "}
          <a href="#nichts" className="underline">Wann Stöcke nichts bringen</a>.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 2 ─────────────────────────── */}
      <Kapitel
        id="laenge"
        titel="Die richtige Länge"
        unterzeile="Der meistgesuchte und am häufigsten falsch beantwortete Punkt zum Thema."
        breit
      >
        <div className="max-w-3xl space-y-5">
          <p>
            Stock senkrecht aufsetzen, Oberarm locker am Körper, Unterarm waagerecht. Steht der
            Ellbogen dann im rechten Winkel, stimmt die Länge. Umgerechnet ist das ungefähr
            Körpergröße mal 0,68 — der Rechner macht genau das und zeigt dir zusätzlich, welcher
            Stock aus diesem Vergleich die Länge überhaupt erreicht.
          </p>
        </div>

        <Laengenrechner faktor={FAKTOR} stoecke={verstellbar} />

        <div className="grid max-w-3xl gap-6 sm:grid-cols-[14rem_1fr]">
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">Stocklänge nach Körpergröße</caption>
              <thead className="bg-sand">
                <tr className="text-left text-muted">
                  <th scope="col" className="px-4 py-2.5 font-medium">Körpergröße</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {LAENGEN.map((l) => (
                  <tr key={l.groesse} className="border-t border-line">
                    <td className="px-4 py-2">{l.groesse}</td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">{l.stock} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4">
            <p>
              <strong>Im Gelände wird nachgestellt.</strong> Bergauf fünf bis zehn Zentimeter
              kürzer, damit der Stock nicht vor dir in den Hang sticht. Bergab genauso viel
              länger, damit du ihn weit genug vorn aufsetzen kannst, ohne dich zu bücken. Das geht
              nur mit einem verstellbaren Stock.
            </p>
            <p>
              <strong>Der häufigste Fehler ist zu lang.</strong> Die Schultern wandern nach oben,
              die Arme ermüden, und der Stock schiebt, statt zu stützen. Wer zwischen zwei Längen
              schwankt, nimmt die kürzere.
            </p>
            <p className="text-muted">
              So stellst du ihn ein: Bei Teleskopstöcken erst das untere Segment auf die
              Markierung deiner Länge ziehen und schließen, dann das mittlere zur Feinabstimmung.
              Das untere Segment ist das dünnste — es sollte nie über die Stopp-Markierung
              hinaus ausgezogen werden.
            </p>
          </div>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 3 ─────────────────────────── */}
      <Kapitel id="bauart" titel="Faltbar oder Teleskop" unterzeile="Eine Frage des Rucksacks, nicht der Qualität.">
        <p>
          <strong>Teleskopstöcke</strong> werden ineinandergeschoben, meist in drei Segmenten.
          Zusammengeschoben bleiben sie rund 65 Zentimeter lang. Dafür lassen sie sich über einen
          großen Bereich verstellen und sind robust, weil die Rohre ineinanderstecken.
        </p>
        <p>
          <strong>Faltbare Wanderstöcke</strong> werden wie ein Zeltgestänge zusammengesteckt, ein
          innenliegendes Seil hält die Segmente zusammen. Gefaltet messen sie 35 bis 40
          Zentimeter und verschwinden im Rucksack. Der Preis dafür: ein kleinerer Verstellbereich
          — oft nur 20 Zentimeter — und ein Seil, das irgendwann ermüdet.
        </p>
        <PackmassBild />
        <p>
          Eine dritte Bauart sind <strong>Faltstöcke mit fester Länge</strong>, etwa der Distance
          Z von Black Diamond. Kein Verschluss, kein Verstellen, nichts, das rutschen kann. Die
          Länge muss dafür beim Kauf stimmen, und teilen kann man sie nur mit Menschen derselben
          Größe.
        </p>
        <Merksatz>
          Die Entscheidung hängt an einer Frage: Wie oft sind die Stöcke im Rucksack statt in der
          Hand? Wer sie auf Kletterpassagen, im Bus oder im Flugzeuggepäck verstaut, will einen
          Faltstock. Wer sie vom Parkplatz bis zurück in der Hand hat, fährt mit einem
          Teleskopstock besser und günstiger.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 4 ─────────────────────────── */}
      <Kapitel id="verschluss" titel="Der Verschluss" unterzeile="Hier gehen billige Stöcke kaputt.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-warn-soft/60 p-5">
            <h3 className="font-semibold text-warn">Drehverschluss</h3>
            <p className="mt-2 text-[0.98rem] leading-relaxed">
              Klemmt über Reibung: Das Innenrohr wird aufgespreizt, bis es am Außenrohr hält.
              Setzt sich Sand im Gewinde fest oder ist das Rohr nass, rutscht er unter Last durch —
              meist im Abstieg und fast immer im ungünstigsten Moment.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-accent-soft p-5">
            <h3 className="font-semibold text-accent">Klemmverschluss</h3>
            <p className="mt-2 text-[0.98rem] leading-relaxed">
              Ein Hebel drückt eine Manschette auf das Rohr. Man sieht von außen, ob er offen oder
              zu ist, kann ihn mit Handschuhen bedienen und mit einer Schraube nachstellen, wenn
              er nachlässt.
            </p>
          </div>
        </div>
        <p>
          Jeder Hersteller gibt seinem Klemmverschluss einen eigenen Namen — Speed Lock bei Leki,
          FlickLock bei Black Diamond, Powerlock bei Komperdell. Gemeint ist dasselbe Prinzip.
        </p>
        <Merksatz>
          Wenn du aus diesem Text eine Sache mitnimmst: Klemmverschluss. Alle verstellbaren
          Markenstöcke hier haben einen. Beim günstigsten verrät der Anbieter nicht, welche Art
          verbaut ist — und das allein ist ein Grund, ihn nur mit Vorbehalt zu nennen.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 5 ─────────────────────────── */}
      <Kapitel id="material" titel="Aluminium, Carbon, Dämpfung">
        <p>
          Carbon ist steifer und bei gleicher Bauart leichter, Aluminium zäher. Der Unterschied
          zeigt sich nicht im Katalog, sondern im Schadensfall: Aluminium verbiegt und lässt sich
          oft noch bis zum Parkplatz tragen. Carbon bricht.
        </p>
        <p>
          Die Gewichtsersparnis ist kleiner, als der Preisunterschied vermuten lässt. Der
          Carbon-Faltstock von Leki wiegt 254 Gramm je Stock, der Komperdell aus Aluminium 239.
          Der Vergleich hinkt, weil der eine gefaltet und der andere geschoben wird — aber genau
          das ist der Punkt: <strong>Die Bauart macht mehr aus als das Material.</strong> Carbon
          lohnt sich, wenn es auf jedes Gramm ankommt und das Gelände gutmütig ist. Im blockigen
          Gelände, in dem sich ein Stock zwischen Felsen verklemmt, ist Aluminium die vernünftigere
          Wahl — unabhängig vom Budget.
        </p>
        <p>
          <strong>Dämpfung</strong>, bei Leki „Antishock“ oder „AS“, federt das Aufsetzen ab. Sie
          kostet Gewicht und Geld, und manche mögen das leichte Nachgeben gar nicht, weil der Stock
          dann nicht mehr sofort trägt. Beide Stöcke, die bei der Stiftung Warentest vorn lagen,
          haben keine.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 6 ─────────────────────────── */}
      <Kapitel id="griff" titel="Griff und Schlaufe" breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Den Griff hältst du stundenlang in einer Hand, die schwitzt. Das macht ihn wichtiger,
            als er aussieht — und es ist kein Zufall, dass das einzige „mangelhaft“ im Warentest an
            Schadstoffen im Griff lag.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Kork", "Passt sich mit der Zeit der Hand an, bleibt auch bei Schweiß griffig. Teurer und empfindlicher."],
              ["Schaumstoff", "Leicht, warm, günstig. Saugt Schweiß und wird mit den Jahren speckig. Die vernünftige Wahl für die meisten."],
              ["Kunststoff", "Robust und leicht zu reinigen, im Sommer schnell rutschig. Eher etwas für Winter und Handschuhe."],
            ].map(([t, x]) => (
              <div key={t} className="rounded-xl border border-line bg-card p-4">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{x}</p>
              </div>
            ))}
          </div>
          <p>
            Wichtiger als das Material ist eine <strong>Griffverlängerung</strong>: ein Stück
            Schaumstoff unterhalb des eigentlichen Griffs. Bei kurzen Steilstücken und beim Queren
            eines Hangs greifst du dort tiefer, statt den Stock zu verstellen.
          </p>
          <p>
            Und die <strong>Schlaufe</strong> wird fast immer falsch benutzt. Richtig angelegt trägt
            sie einen Teil der Last, sodass du den Griff nicht festklammern musst:
          </p>
        </div>
        <div className="max-w-3xl">
          <SchlaufeBild />
        </div>
        <p className="max-w-3xl">
          <strong>Eine Ausnahme:</strong> Auf ausgesetzten Passagen und am Klettersteig gehören die
          Hände aus den Schlaufen und die Stöcke an den Rucksack. Stürzt du, willst du die Hände
          frei haben und nicht an zwei Stöcken hängen.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 7 ─────────────────────────── */}
      <Kapitel id="spitze" titel="Spitze, Teller, Gummipuffer">
        <p>
          Die <strong>Spitze</strong> aus Hartmetall oder Wolframcarbid hält auf Fels und Schotter
          deutlich länger als eine aus Stahl. Sie ist ein Verschleißteil und bei den großen
          Herstellern einzeln zu bekommen.
        </p>
        <p>
          Der kleine <strong>Teller</strong> über der Spitze verhindert, dass der Stock zwischen
          Steinen oder im weichen Boden versinkt. Für Schnee gibt es größere zum Aufschrauben —
          wer im Winter wandert, sollte darauf achten, dass sie austauschbar sind.
        </p>
        <p>
          <strong>Gummipuffer</strong> gehören auf die Spitze, sobald es über Asphalt, Pflaster
          oder Holzbohlen geht. Sie dämpfen das Klacken, schonen die Spitze — und vor allem den
          Weg. Auf weichem Boden stechen blanke Spitzen Löcher in die Grasnarbe, und an stark
          begangenen Wegen sieht man, was daraus wird.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 8 ─────────────────────────── */}
      <Kapitel
        id="warentest"
        titel="Was die Stiftung Warentest fand"
        unterzeile={`Zwölf Stöcke im Labor und auf dem Weg, veröffentlicht in ${WARENTEST.heft}.`}
      >
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [String(WARENTEST.modelle), "Modelle geprüft"],
            [`${WARENTEST.teleskop} / ${WARENTEST.falt}`, "Teleskop / faltbar"],
            ["15–200 €", "Preisspanne"],
            ["1 ×", "mangelhaft, wegen Schadstoffen im Griff"],
          ].map(([z, t]) => (
            <div key={t} className="rounded-xl border border-line bg-card p-4">
              <dt className="sr-only">{t}</dt>
              <dd className="text-2xl font-bold tabular-nums">{z}</dd>
              <dd className="mt-1 text-sm leading-snug text-muted">{t}</dd>
            </div>
          ))}
        </dl>
        <p>
          Geprüft wurde in vier Bereichen: wie sich die Stöcke beim Wandern anfühlen, wie
          einfach sie sich verstellen und transportieren lassen, wie sicher und haltbar sie im
          Labor sind, und welche Schadstoffe in den Griffen stecken. Ein Modell erwies sich dabei
          als weniger belastbar und drohte sich unter Last zu verbiegen oder zu brechen.
        </p>
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full text-[0.95rem]">
            <caption className="sr-only">Frei zugängliche Gesamtnoten</caption>
            <thead className="bg-sand text-left text-sm text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Stock</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Bauart</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Leki Makalu FX Carbon", "Faltstock", "1,8", "#B09RPP5R95"],
                ["Leki Khumbu", "Teleskop", "1,9", "#B0F63PVSJP"],
                ["Decathlon Forclaz MT500", "Teleskop", "2,2", null],
              ].map(([n, b, note, a]) => (
                <tr key={n} className="border-t border-line">
                  <td className="px-4 py-2.5">
                    {a ? <a href={a} className="font-medium hover:text-accent">{n}</a> : n}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{b}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted">
          Das sind alle Noten, die frei zugänglich zitiert werden. Die übrigen neun Ergebnisse
          stehen hinter der Bezahlschranke der{" "}
          <a href={WARENTEST.url} className="underline hover:text-accent" rel="noopener" target="_blank">
            Stiftung Warentest
          </a>
          , darunter der Black Diamond Trail Back, der ebenfalls im Test lag. Den Decathlon
          Forclaz MT500 führen wir nicht, weil er bei Amazon nicht zu finden war — mit 2,2 ist er
          aber ein guter Grund, bei Decathlon nachzusehen.
        </p>
        <Merksatz>
          Was daraus folgt: Beide Sieger sind von Leki, beide haben einen Klemmverschluss, keiner
          hat eine Dämpfung. Und der Teleskop-Sieger kostet weniger als die Hälfte des
          Gesamtsiegers.
        </Merksatz>
      </Kapitel>

      {/* ─────────────────────────── 9 ─────────────────────────── */}
      <Kapitel id="vergleich" titel="Alle sechs im Vergleich" breit>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[52rem] text-sm">
            <caption className="sr-only">Wanderstöcke im Vergleich</caption>
            <thead>
              <tr className="bg-sand align-bottom">
                <th scope="col" className="sticky left-0 z-10 w-36 bg-sand px-4 py-3 text-left font-medium text-muted">
                  &nbsp;
                </th>
                {STOECKE.map((s) => (
                  <th key={s.asin} scope="col" className="px-3 py-3 text-left font-semibold">
                    <a href={`#${s.asin}`} className="block hover:text-accent">
                      <span className="block text-xs font-normal text-muted">{s.marke}</span>
                      {s.name}
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Preis", (s) => <strong className="tabular-nums">{preisVon(s.asin)}</strong>],
                  ["Warentest", (s) => (s.warentest ? <strong>{s.warentest.note}</strong> : <span className="text-muted">—</span>)],
                  ["Bauart", (s) => s.bauart],
                  ["Material", (s) => s.material],
                  ["Gewicht", (s) => (s.gramm_stueck ? `${s.gramm_stueck} g/Stock` : <span className="text-muted">k. A.</span>)],
                  ["Länge", (s) => s.laenge],
                  ["Verschluss", (s) => s.verschluss],
                  ["Griff", (s) => s.griff],
                ] as [string, (s: (typeof STOECKE)[number]) => React.ReactNode][]
              ).map(([k, f]) => (
                <tr key={k} className="border-t border-line align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted">
                    {k}
                  </th>
                  {STOECKE.map((s) => (
                    <td key={s.asin} className="px-3 py-3 leading-snug">
                      {f(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Alle technischen Angaben aus den Herstellerangaben zum jeweiligen Artikel. „k. A.“ heißt:
          Der Hersteller nennt das Gewicht für dieses Modell nicht, und schätzen wollen wir es
          nicht. Amazons eigenes Gewichtsfeld ist das Versandgewicht und steht hier bewusst nicht.
          Preise von Amazon, stündlich abgerufen.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 10 ─────────────────────────── */}
      <Kapitel
        id="modelle"
        titel="Die Stöcke einzeln"
        unterzeile="Zu jedem steht, wogegen er spricht und wer ihn nicht kaufen sollte. Ein Stock ohne Nachteil ist keiner, der keine hat — es ist einer, bei dem niemand hingesehen hat."
        breit
      >
        <div className="space-y-8">
          {STOECKE.map((s, i) => (
            <Produktbericht key={s.asin} s={s} preis={p.get(s.asin)} nummer={i + 1} urlErsatz={partnerUrl(s.asin)} />
          ))}
        </div>
      </Kapitel>

      {/* ─────────────────────────── 11 ─────────────────────────── */}
      <Kapitel id="holz" titel="Und der Holzstock?" unterzeile="Ein anderes Werkzeug für eine andere Art zu gehen." breit>
        <div className="max-w-3xl space-y-5">
          <p>
            Nach dem klassischen Wanderstock aus Holz wird in Deutschland häufiger gesucht als nach
            fast jeder Einzelfrage zu Trekkingstöcken. Das hat seinen Grund: Er ist etwas anderes.
            Ein einzelner Stock, feste Länge, schwerer, dafür warm in der Hand, leise auf dem Weg
            und langlebig, solange das Holz trocken lagert.
          </p>
          <p>
            Was er gut kann: Gleichgewicht halten auf dem Spaziergang, beim Queren eines Bachs,
            auf matschigem Waldweg. Was er nicht kann: die Knie im Abstieg entlasten. Dafür braucht
            es zwei Stöcke, die gleichmäßig tragen — ein einzelner verteilt die Last einseitig.
          </p>
          <p>
            Die Längentabelle oben gilt für ihn nicht streng, weil man einen Holzstock oft höher
            greift, am Stab statt am Knauf. Als Anhaltspunkt: 120 Zentimeter liegen in dem
            Bereich, den die Tabelle für 1,75 bis 1,82 Meter Körpergröße nennt. Wer kleiner ist,
            fasst tiefer.
          </p>
        </div>
        <div className="grid max-w-3xl gap-6 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[12rem_1fr] sm:p-6">
          <Produktbild preis={p.get(HOLZSTOCK.asin)} alt={`${HOLZSTOCK.marke} ${HOLZSTOCK.name}`} />
          <div>
            <p className="text-sm font-semibold text-accent">Wenn es einer aus Holz sein soll</p>
            <h3 className="mt-1 text-xl font-bold tracking-tight">
              {HOLZSTOCK.marke} {HOLZSTOCK.name}
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 text-sm">
              {HOLZSTOCK.merkmale.map(([k, v]) => (
                <div key={k} className="border-t border-line py-1.5">
                  <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Ein Stock aus einer deutschen Werkstatt statt aus dem Marktplatzsortiment. Die
              Angaben stammen vom Anbieter; geprüft hat ihn niemand, den wir zitieren könnten.
            </p>
            <Affiliatelink url={partnerUrl(HOLZSTOCK.asin)} preis={p.get(HOLZSTOCK.asin)} name={`${HOLZSTOCK.marke} ${HOLZSTOCK.name}`} knapp />
          </div>
        </div>
      </Kapitel>

      {/* ─────────────────────────── 12 ─────────────────────────── */}
      <Kapitel
        id="discounter"
        titel="Stöcke von Lidl, Aldi und Tchibo"
        unterzeile="Aktionsware wechselt von Woche zu Woche. Deshalb kein Urteil über ein Modell, sondern worauf du im Laden achtest."
      >
        <p>
          Das Warentest-Feld begann bei 15 Euro, und billig heißt nicht automatisch schlecht. Es
          heißt nur, dass du selbst prüfen musst, was bei einem Markenstock der Name verspricht.
          Sechs Punkte, in dieser Reihenfolge:
        </p>
        <ol className="space-y-3">
          {[
            ["Verschluss.", "Klemmhebel statt Drehverschluss. Das ist das Ausschlusskriterium."],
            ["Verstellbereich.", "Schau in die Tabelle oben, ob deine Länge drin ist — mit zehn Zentimetern Luft nach oben für den Abstieg."],
            ["Geruch.", "Riecht der Griff stark nach Chemie, lass ihn liegen. Genau dort fand die Stiftung Warentest das Problem."],
            ["Spitze.", "Hartmetall oder Wolframcarbid. Steht nichts dazu, ist es meist Stahl."],
            ["Zubehör.", "Gummipuffer im Lieferumfang und ein austauschbarer Teller."],
            ["Gewicht.", "Ist keines angegeben, wiege selbst — über 300 Gramm je Stock merkst du am Ende des Tages."],
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
      </Kapitel>

      {/* ─────────────────────────── 13 ─────────────────────────── */}
      <Kapitel id="technik" titel="Richtig gehen mit Stöcken" unterzeile="Fünf Situationen, fünf Handgriffe.">
        <dl className="space-y-5">
          {[
            ["In der Ebene", "Gegengleich wie beim normalen Gehen: rechter Stock mit linkem Fuß. Die Stöcke setzen neben dem Körper auf, nicht weit davor. Wer das Gefühl hat, sich die Stöcke nachzuziehen, hat sie zu lang."],
            ["Bergauf", "Kürzer stellen und auf Höhe der Füße aufsetzen, nicht davor. Abdrücken statt ziehen. In steilen Stufen beide Stöcke gleichzeitig einsetzen und dich zwischen ihnen hochschieben."],
            ["Bergab", "Länger stellen und vor dem Körper aufsetzen, dann den Schritt folgen lassen. Knie leicht gebeugt, kleine Schritte. Das ist der Moment, für den du die Stöcke dabeihast."],
            ["Quer zum Hang", "Den bergseitigen Stock tiefer an der Griffverlängerung fassen, den talseitigen normal. Verstellen musst du dafür nichts."],
            ["Stufen und Felsabsätze", "Erst beide Stöcke eine Stufe tiefer aufsetzen, dann heruntersteigen. Nicht auf einen einzigen Stock springen."],
          ].map(([t, x]) => (
            <div key={t} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt className="font-semibold">{t}</dt>
              <dd className="leading-relaxed">{x}</dd>
            </div>
          ))}
        </dl>
      </Kapitel>

      {/* ─────────────────────────── 14 ─────────────────────────── */}
      <Kapitel id="aeltere" titel="Für Ältere und bei Knieproblemen">
        <p>
          Hier sind Wanderstöcke am nützlichsten, und hier muss man am genauesten sein. Ein
          Wanderstock ist keine Gehhilfe im medizinischen Sinn. Wer ihn braucht, um überhaupt
          sicher zu gehen, sollte das mit einem Arzt oder einer Physiotherapeutin besprechen —
          dafür gibt es andere Hilfsmittel.
        </p>
        <p>
          Wer dagegen gut zu Fuß ist und die Knie im Abstieg schonen will, profitiert genau von dem
          Effekt, den die Salzburger Messung zeigt. Worauf es dann ankommt:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Ein Paar</strong>, nicht ein einzelner Stock — nur zwei entlasten gleichmäßig.</li>
          <li><strong>Teleskop mit Klemmverschluss</strong>: großer Verstellbereich, mit wenig Kraft zu bedienen, auf einen Blick zu kontrollieren.</li>
          <li><strong>Ein großer, weicher Griff</strong> mit Verlängerung, damit die Hand nicht verkrampft.</li>
          <li><strong>Gummipuffer</strong>, weil Spaziergänge oft über Asphalt führen, wo blanke Spitzen wegrutschen.</li>
        </ul>
        <p>
          Aus diesem Vergleich passen dafür der{" "}
          <a href="#B0F63PVSJP" className="underline hover:text-accent">Leki Khumbu</a> und der{" "}
          <a href="#B0CRVSPJXM" className="underline hover:text-accent">Black Diamond Trail Back</a>.
          Gewicht spielt eine kleinere Rolle als Bedienbarkeit.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 15 ─────────────────────────── */}
      <Kapitel id="unterwegs" titel="Im Flugzeug, in der Bahn, am Parkplatz" breit>
        <Kartenraster
          spalten={3}
          eintraege={[
            {
              titel: "Im Flugzeug",
              text: (
                <>
                  Ins aufgegebene Gepäck. An der Sicherheitskontrolle gelten Wanderstöcke als
                  Gegenstände, mit denen man zuschlagen kann. Manche kommen trotzdem damit durch —
                  verlassen kann man sich darauf nicht, entschieden wird an der Kontrolle, nicht bei
                  der Fluggesellschaft. Ein Faltstock passt immerhin in den Koffer.
                </>
              ),
            },
            {
              titel: "In Bahn und Bus",
              text: (
                <>
                  Keine Einschränkung. Gummipuffer drauf, damit niemand eine Spitze ins Schienbein
                  bekommt. Welche Ausgangspunkte eine Haltestelle in Laufweite haben, steht in{" "}
                  <Link href="/wandern-ohne-auto" className="underline hover:text-accent">
                    Wandern ohne Auto
                  </Link>
                  .
                </>
              ),
            },
            {
              titel: "Am Wanderparkplatz",
              text: (
                <>
                  Länge einstellen, bevor du losgehst — nicht erst am ersten Anstieg. Und falls du
                  noch einen Ausgangspunkt suchst:{" "}
                  <Link href="/" className="underline hover:text-accent">
                    Wanderparkplätze in deiner Nähe
                  </Link>
                  .
                </>
              ),
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 16 ─────────────────────────── */}
      <Kapitel id="pflege" titel="Pflege und Ersatzteile" unterzeile="Fünf Dinge, die einen Stock ein paar Jahre länger halten lassen." breit>
        <Kartenraster
          eintraege={[
            {
              titel: "Nach Regen auseinanderziehen",
              text: "Und trocknen lassen. Feuchtigkeit im Rohr ist der Anfang von Korrosion und der Grund, warum Verschlüsse irgendwann rutschen.",
            },
            {
              titel: "Nicht fetten, nicht ölen",
              text: "Ein Klemmverschluss hält über Reibung. Wer die Rohre schmiert, sorgt genau für das, was er verhindern wollte.",
            },
            {
              titel: "Verschluss nachstellen",
              text: "Lässt der Hebel nach, die Stellschraube eine Viertel- oder halbe Umdrehung anziehen. Mehr braucht es meist nicht.",
            },
            {
              titel: "Verschleißteile tauschen",
              text: "Spitzen, Teller, Gummipuffer und Schlaufen verkaufen Leki, Komperdell und Black Diamond einzeln. Bei Stöcken ohne Markennamen gibt es sie in der Regel nicht.",
            },
            {
              titel: "Verbogenes nicht zurückbiegen",
              text: "Aluminium ist an der Stelle geschwächt und knickt beim nächsten Mal früher. Ein Carbonrohr mit Riss oder aufgefasertem Rand gehört sofort aussortiert.",
            },
          ]}
        />
      </Kapitel>

      {/* ─────────────────────────── 17 ─────────────────────────── */}
      <Kapitel id="nichts" titel="Wann Stöcke nichts bringen">
        <p>
          Auf ebenem Weg kosten Stöcke Energie, statt welche zu sparen. Der Arm arbeitet mit, der
          Puls steigt, der Nutzen für die Gelenke ist gering. Wer überwiegend im Flachen unterwegs
          ist, braucht keine.
        </p>
        <p>
          Sie belegen außerdem beide Hände. Zum Fotografieren, Kartenlesen oder Festhalten müssen
          sie weg, und irgendwo hin müssen sie dann auch.
        </p>
        <p>
          Und sie hinterlassen Spuren. Wer ohne Gummipuffer über weichen Boden neben dem Weg geht,
          sticht Löcher in die Grasnarbe. Das ist kein Grund, auf Stöcke zu verzichten — aber einer,
          die Puffer dabeizuhaben.
        </p>
      </Kapitel>

      {/* ─────────────────────────── 18 ─────────────────────────── */}
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

      {/* ─────────────────────────── 19 ─────────────────────────── */}
      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Wir haben diese Stöcke nicht getestet und behaupten das auch nicht. Was hier steht, ist
          eine Zusammenstellung — aus den Herstellerangaben, aus dem Labortest der Stiftung
          Warentest und aus der Forschung zur Kniebelastung — plus die Einschätzung, welche davon
          im Gelände zählen.
        </p>
        <p>
          Die Auswahl ist redaktionell. Amazons Suche nach „Wanderstöcke“ liefert weder Leki noch
          Black Diamond noch Komperdell, sondern Markennamen, die es außerhalb des Marktplatzes
          nicht gibt. Eine Liste daraus wäre keine Empfehlung, sondern eine Auswertung von
          Werbeplätzen.
        </p>
        <ul className="space-y-2 text-[0.95rem] text-muted">
          <li>
            Stiftung Warentest,{" "}
            <a href={WARENTEST.url} className="underline hover:text-accent" rel="noopener" target="_blank">
              Wanderstöcke im Test
            </a>
            , {WARENTEST.heft}, erschienen am {WARENTEST.datum}. Gesamtnoten nach der frei
            zugänglichen{" "}
            <a href={WARENTEST.zusammenfassung} className="underline hover:text-accent" rel="noopener" target="_blank">
              Zusammenfassung bei familie.de
            </a>
            .
          </li>
          <li>
            Schwameder, Roithner, Müller, Niessen:{" "}
            <a href="https://pubmed.ncbi.nlm.nih.gov/10622357/" className="underline hover:text-accent" rel="noopener" target="_blank">
              Knee joint forces during downhill walking with hiking poles
            </a>
            . Journal of Sports Sciences 17 (1999), S. 969–978.
          </li>
          <li>
            Technische Angaben: Herstellerangaben zum jeweiligen Artikel. Preise und Bilder:
            Amazon, stündlich abgerufen.
          </li>
          <li>
            Zahl der Ausgangspunkte mit Gipfel in Reichweite: eigener Datenbestand, aufbereitet aus
            OpenStreetMap — mehr dazu unter{" "}
            <Link href="/ueber-uns" className="underline hover:text-accent">Über uns</Link>.
          </li>
        </ul>
      </Kapitel>

      <aside className="mt-14 rounded-2xl bg-sand p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Passend dazu</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          <li>
            <Link href="/wandern-ohne-auto" className="font-medium hover:text-accent">Wandern ohne Auto</Link>
            <p className="text-sm text-muted">Welche Ausgangspunkte eine Haltestelle in Laufweite haben.</p>
          </li>
          <li>
            <Link href="/toilette-am-wanderparkplatz" className="font-medium hover:text-accent">Toilette am Wanderparkplatz</Link>
            <p className="text-sm text-muted">Die Frage, die sich vor der Tour genauso stellt.</p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
