import type { Metadata } from "next";
import Link from "next/link";
import Block from "@/components/Block";
import Brotkrumen from "@/components/Brotkrumen";
import Affiliatelink from "@/components/Affiliatelink";
import { preise, partnerUrl } from "@/lib/amazon";
import { STOECKE, LAENGEN } from "@/lib/ausruestung/wanderstoecke";
import { gipfelReichweite } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";

/*
 * Stündlich. Amazon erlaubt kein Zwischenspeichern von Preisen über 24
 * Stunden; eine Stunde liegt weit darunter und hält die Last klein.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: titel("Wanderstöcke im Vergleich: Länge, Verschluss, faltbar oder Teleskop"),
  description: beschreibung(
    "Welche Stocklänge zu welcher Körpergröße passt, ob faltbar oder Teleskop, warum der Verschluss wichtiger ist als Carbon — und fünf Wanderstöcke von 29 bis 155 Euro mit ihren Schwächen.",
  ),
  alternates: { canonical: "/ausruestung/wanderstoecke" },
};

export default async function Wanderstoecke() {
  const [p, gipfel] = await Promise.all([
    preise(STOECKE.map((s) => s.asin)),
    gipfelReichweite(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Wanderstöcke im Vergleich: Länge, Verschluss, faltbar oder Teleskop",
          url: `${SITE}/ausruestung/wanderstoecke`,
          inLanguage: "de-DE",
          isAccessibleForFree: true,
          publisher: { "@type": "Organization", name: "wanderparkplatz.info", url: SITE },
        })}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Ausrüstung", url: "/ausruestung" },
        ]}
        aktuell="Wanderstöcke"
      />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderstöcke im Vergleich: Länge, Verschluss, faltbar oder Teleskop
      </h1>

      <div className="mt-5 space-y-4 text-lg leading-relaxed">
        <p>
          Die meisten Kaufberatungen beantworten die falsche Frage. Welches Modell es wird,
          entscheidet weniger über den Nutzen als zwei Dinge, die in Ranglisten kaum vorkommen:
          die Länge und der Verschluss. Ein Stock für 29 Euro in der richtigen Länge hilft mehr
          als einer für 155 Euro, der zehn Zentimeter zu lang ist.
        </p>
        <p className="text-muted">
          Deshalb steht hier die Längentabelle vor der Produktliste. Und weil es dazugehört:
          Getestet haben wir diese Stöcke nicht. Was unten steht, sind Herstellerangaben, die
          wir gegeneinandergehalten haben, plus die Einschätzung, welche davon im Gelände
          überhaupt zählen. Wo eine Angabe fehlt, steht das da.
        </p>
      </div>

      {/* ───────────────────────── Länge ───────────────────────── */}
      <Block
        klasse="mt-8"
        titel="Die richtige Länge"
        einleitung="Der meistgesuchte und meistfalsch beantwortete Punkt zum Thema."
      >
        <p className="leading-relaxed">
          Stock aufsetzen, Oberarm locker am Körper, Unterarm waagerecht. Steht der Ellbogen
          dann im rechten Winkel, passt die Länge. Das entspricht ungefähr Körpergröße mal 0,68.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-line text-left text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">Körpergröße</th>
                <th scope="col" className="py-2 pr-3 font-medium">Stocklänge</th>
              </tr>
            </thead>
            <tbody>
              {LAENGEN.map((l) => (
                <tr key={l.groesse} className="border-b border-line last:border-0">
                  <td className="py-2 pr-3">{l.groesse}</td>
                  <td className="py-2 pr-3 font-medium tabular-nums">{l.stock} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 leading-relaxed">
          Im Gelände wird nachgestellt: bergauf fünf bis zehn Zentimeter kürzer, bergab genauso
          viel länger. Wer das nutzen will, braucht einen verstellbaren Stock — bei einem mit
          fester Länge entfällt es.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          Der häufigste Fehler ist zu lang. Die Schultern gehen hoch, die Arme ermüden, und der
          Stock schiebt statt zu stützen. Wer unsicher ist, nimmt die kleinere der beiden
          infrage kommenden Längen.
        </p>
      </Block>

      {/* ───────────────────────── Bauart ───────────────────────── */}
      <Block klasse="mt-6" titel="Faltbar oder Teleskop">
        <div className="space-y-3 leading-relaxed">
          <p>
            <strong>Teleskopstöcke</strong> werden ineinandergeschoben, meist drei Segmente.
            Zusammengeschoben bleiben sie rund 65 Zentimeter lang. Dafür sind sie robuster, weil
            die Rohre ineinanderstecken statt nur über ein Seil verbunden zu sein, und lassen
            sich über die volle Länge verstellen.
          </p>
          <p>
            <strong>Faltbare Wanderstöcke</strong> werden wie ein Zeltgestänge zusammengesteckt,
            ein innenliegendes Seil hält die Segmente zusammen. Gefaltet messen sie 35 bis 40
            Zentimeter und verschwinden im Rucksack. Der Preis dafür: weniger Spielraum bei der
            Länge — manche Modelle sind gar nicht verstellbar — und ein Seil, das irgendwann
            ermüdet.
          </p>
          <p className="text-muted">
            Die Entscheidung hängt an einer Frage: Wie oft sind die Stöcke im Rucksack statt in
            der Hand? Wer sie auf Kletterpassagen, im Bus oder im Flugzeug verstaut, will einen
            Faltstock. Wer sie vom Parkplatz bis zurück in der Hand hat, fährt mit Teleskop
            besser und günstiger.
          </p>
        </div>
      </Block>

      {/* ───────────────────────── Verschluss ───────────────────────── */}
      <Block klasse="mt-6" titel="Der Verschluss — hier gehen billige Stöcke kaputt">
        <div className="space-y-3 leading-relaxed">
          <p>
            Ein <strong>Drehverschluss</strong> klemmt über Reibung: Das Innenrohr wird
            aufgespreizt, bis es am Außenrohr hält. Setzt sich Sand im Gewinde fest oder ist das
            Rohr nass, rutscht er unter Last durch. Man merkt es in dem Moment, in dem man sich
            draufstützt — meist im Abstieg und fast immer im ungünstigsten Moment.
          </p>
          <p>
            Ein <strong>Klemmverschluss</strong> — Leki nennt ihn Speed Lock, Black Diamond
            FlickLock, Komperdell Powerlock — drückt einen Hebel auf das Rohr. Man sieht von
            außen, ob er offen oder geschlossen ist, kann ihn mit Handschuhen bedienen und bei
            Bedarf nachziehen.
          </p>
          <p className="text-muted">
            Wenn du aus diesem Text eine Sache mitnimmst: Klemmverschluss. Die drei
            verstellbaren Markenstöcke unten haben einen. Der Distance Z braucht keinen, weil er
            sich gar nicht verstellen lässt. Und beim günstigsten verrät der Anbieter nicht,
            welche Art verbaut ist — das allein ist ein Grund, ihn nur mit Vorbehalt zu nennen.
          </p>
        </div>
      </Block>

      {/* ───────────────────────── Material ───────────────────────── */}
      <Block klasse="mt-6" titel="Aluminium oder Carbon">
        <div className="space-y-3 leading-relaxed">
          <p>
            Carbon ist leichter und steifer, Aluminium zäher. Der Unterschied zeigt sich nicht
            im Katalog, sondern im Schadensfall: Aluminium verbiegt und lässt sich oft noch
            nach Hause tragen. Carbon bricht.
          </p>
          <p>
            Die Gewichtsersparnis ist kleiner, als der Preisunterschied vermuten lässt. Der
            Komperdell wiegt 239 Gramm je Stock aus Aluminium, das Leki-Carbonpaar 534 Gramm,
            also 267 je Stock. Der Vergleich hinkt, denn der Leki ist faltbar und gedämpft, und
            beides kostet Gewicht. Aber genau das ist der Punkt: Die Bauart macht mehr aus als
            das Material. Carbon lohnt sich dort, wo es auf jedes Gramm ankommt und das Gelände
            gutmütig ist.
          </p>
          <p className="text-muted">
            Im blockigen Gelände, in dem sich ein Stock zwischen Felsen verklemmen kann, ist
            Aluminium die vernünftigere Wahl — unabhängig vom Budget.
          </p>
        </div>
      </Block>

      {/* ───────────────────────── Vergleichstabelle ───────────────────────── */}
      <Block
        klasse="mt-6"
        titel="Fünf Stöcke im Vergleich"
        fussnote="Alle Angaben aus den Herstellerangaben zum jeweiligen Artikel. Ein Strich heißt: Der Hersteller nennt den Wert für dieses Modell nicht. Amazons Gewichtsangabe ist das Versandgewicht und steht hier bewusst nicht."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-line text-left text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">Stock</th>
                <th scope="col" className="py-2 pr-3 font-medium">Bauart</th>
                <th scope="col" className="py-2 pr-3 font-medium">Material</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Gewicht/Paar</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Preis</th>
              </tr>
            </thead>
            <tbody>
              {STOECKE.map((s) => {
                const pr = p.get(s.asin);
                return (
                  <tr key={s.asin} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3">
                      <a href={`#${s.asin}`} className="font-medium hover:text-accent">
                        {s.marke} {s.name}
                      </a>
                    </td>
                    <td className="py-2 pr-3 text-muted">{s.bauart}</td>
                    <td className="py-2 pr-3 text-muted">{s.material}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {s.gramm_paar ? `${nf.format(s.gramm_paar)} g` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{pr?.anzeige ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Block>

      {/* ───────────────────────── Einzeln ───────────────────────── */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Die Stöcke einzeln</h2>
        <p className="mt-2 leading-relaxed text-muted">
          Zu jedem steht, wogegen er spricht und wer ihn nicht kaufen sollte. Ein Stock ohne
          Nachteil ist keiner, der keine hat — es ist einer, bei dem niemand hingesehen hat.
        </p>

        <div className="mt-5 space-y-6">
          {STOECKE.map((s) => {
            const pr = p.get(s.asin);
            return (
              <article
                key={s.asin}
                id={s.asin}
                className="scroll-mt-6 rounded-xl border border-line bg-card p-5 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Amazons Bild, nicht unseres: Die Programmbedingungen lassen
                      für gelistete Artikel keine eigenen Aufnahmen zu. Deshalb
                      steht die Herkunft auch in der Datenschutzerklärung. */}
                  {pr?.bild && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pr.bild}
                      alt={`${s.marke} ${s.name}`}
                      width={80}
                      height={100}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-24 w-20 shrink-0 rounded border border-line bg-background object-contain p-1"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {s.marke} {s.name}
                    </h3>
                    <p className="mt-1 leading-relaxed">{s.rolle}</p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-x-6 text-sm sm:grid-cols-2">
                  {[
                    ["Bauart", s.bauart],
                    ["Material", s.material],
                    ["Länge", s.laenge],
                    ["Verschluss", s.verschluss],
                    ["Griff", s.griff],
                    [
                      "Gewicht",
                      s.gramm_stueck
                        ? `${nf.format(s.gramm_stueck)} g je Stock`
                        : s.gramm_paar
                          ? `${nf.format(s.gramm_paar)} g je Paar`
                          : "vom Hersteller nicht genannt",
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-line py-2">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold">Dafür</h4>
                    <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                      {s.dafuer.map((x) => (
                        <li key={x} className="flex gap-2">
                          <span aria-hidden className="text-accent">+</span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Dagegen</h4>
                    <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
                      {s.dagegen.map((x) => (
                        <li key={x} className="flex gap-2">
                          <span aria-hidden>−</span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-5 rounded-lg border border-line bg-background p-3 text-sm leading-relaxed">
                  <strong className="font-semibold">Nichts für: </strong>
                  {s.nichtFuer}
                </p>

                <Affiliatelink
                  url={partnerUrl(s.asin)}
                  preis={pr}
                  name={`${s.marke} ${s.name}`}
                />
              </article>
            );
          })}
        </div>
      </section>

      {/* ───────────────────────── Gegenrede ───────────────────────── */}
      <Block klasse="mt-10" titel="Wann Stöcke nichts bringen">
        <div className="space-y-3 leading-relaxed">
          <p>
            Auf ebenem Weg kosten Stöcke Energie, statt welche zu sparen. Der Arm arbeitet mit,
            der Puls steigt, der Nutzen für die Gelenke ist gleich null. Wer überwiegend im
            Flachen unterwegs ist, braucht keine.
          </p>
          <p>
            Sie belegen außerdem beide Hände. Zum Fotografieren, Kartenlesen oder Festhalten
            müssen sie weg, und irgendwo hin müssen sie dann auch.
          </p>
          <p>
            Und sie hinterlassen Spuren. Auf weichem Untergrund neben dem Weg stechen Spitzen
            Löcher in die Grasnarbe. Deshalb gehören Gummifüße auf die Spitzen, sobald der
            Untergrund es zulässt — das ist kein Zubehörgeklingel, sondern der Unterschied
            zwischen einem Weg, der hält, und einem, der ausfranst.
          </p>
          <p className="text-muted">
            Wo sie wirklich helfen, ist der Abstieg. Dort nehmen zwei Stöcke einen erheblichen
            Teil der Last von den Knien — und Abstiege hat in Deutschland fast jede Tour:{" "}
            {gipfel.plaetze > 0 && (
              <>
                An <strong className="text-foreground">{nf.format(gipfel.plaetze)}</strong> der{" "}
                {nf.format(gipfel.gesamt)} Wanderparkplätze in unserem Verzeichnis liegt ein
                Gipfel in Reichweite.
              </>
            )}
          </p>
        </div>
      </Block>

      {/* ───────────────────────── Methode ───────────────────────── */}
      <Block klasse="mt-6" titel="Woher die Angaben stammen">
        <div className="space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Wir haben diese Stöcke nicht getestet und behaupten das auch nicht. Die technischen
            Angaben stammen aus den Herstellerangaben zum jeweiligen Artikel; wo ein Hersteller
            einen Wert nicht nennt, steht ein Strich statt einer Schätzung. Preise und
            Verfügbarkeit kommen stündlich über die Amazon-Schnittstelle und tragen ihren
            Abrufzeitpunkt.
          </p>
          <p>
            Die Auswahl ist redaktionell. Amazons Stichwortsuche nach „Wanderstöcke“ liefert
            weder Leki noch Black Diamond noch Komperdell, sondern Markennamen, die es außerhalb
            des Marktplatzes nicht gibt. Eine Liste daraus wäre keine Empfehlung, sondern eine
            Auswertung von Werbeplätzen.
          </p>
          <p>
            Die Zahlen zu den Ausgangspunkten stammen aus unserem eigenen Datenbestand,
            aufbereitet aus OpenStreetMap. Was dahintersteckt, steht unter{" "}
            <Link href="/ueber-uns" className="underline hover:text-accent">
              Über uns
            </Link>
            .
          </p>
        </div>
      </Block>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Passend dazu:{" "}
        <Link href="/wandern-ohne-auto" className="underline hover:text-accent">
          Wandern ohne Auto
        </Link>{" "}
        — welche Ausgangspunkte eine Haltestelle in Laufweite haben. Und{" "}
        <Link href="/toilette-am-wanderparkplatz" className="underline hover:text-accent">
          die Toilettenfrage
        </Link>
        , die sich vor der Tour genauso stellt.
      </p>
    </div>
  );
}
