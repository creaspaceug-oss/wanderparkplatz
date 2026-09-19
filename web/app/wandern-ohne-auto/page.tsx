import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Block from "@/components/Block";
import Saeulen from "@/components/Saeulen";
import Datentabelle from "@/components/Datentabelle";
import {
  oepnvGesamt, oepnvNachLand, oepnvNachKreis, oepnvVerteilung, oepnvBeispiele,
  oepnvStadtLand, oepnvLuecken,
} from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";
import { BETREIBER } from "@/lib/betreiber";

export const revalidate = 604800;

const STAND = "13. September 2026";

// Fest eingetragene Zahlen veralten mit dem nächsten Import. Die Beschreibung
// holt sie deshalb aus derselben Abfrage wie die Seite.
export async function generateMetadata(): Promise<Metadata> {
  const g = await oepnvGesamt();
  return {
    title: "Wandern ohne Auto: Wanderparkplätze und der ÖPNV",
    description: beschreibung(
      `Auswertung von ${nf.format(g.plaetze)} Wanderparkplätzen: An ${String(g.prozent).replace(".", ",")} Prozent` +
        ` liegt eine Haltestelle in Laufweite, im Mittel ${nf.format(g.median)} Meter entfernt.` +
        ` Alle Bundesländer und Landkreise im Vergleich, mit Datensatz zum Herunterladen.`,
    ),
    alternates: { canonical: "/wandern-ohne-auto" },
  };
}

const meter = (m: number | null) => (m == null ? "—" : `${nf.format(m)} m`);

/** Postgres liefert "70.9", im Deutschen steht dort ein Komma. */
const prozent = (v: string) => `${String(v).replace(".", ",")} %`;

/** Unter zehn Plätzen ist ein Prozentwert eine Zufallszahl. */
const DUENN = 10;

export default async function WandernOhneAuto() {
  const [g, laender, kreise, verteilung, beispiele, stadtLand, luecken] = await Promise.all([
    oepnvGesamt(),
    oepnvNachLand(),
    oepnvNachKreis(5),
    oepnvVerteilung(),
    oepnvBeispiele(8),
    oepnvStadtLand(),
    oepnvLuecken(10),
  ]);

  const ohne = g.plaetze - g.mit;
  const bahnProzent = ((g.mit_bahnhof / g.plaetze) * 100).toFixed(1).replace(".", ",");
  // Gesucht wird bis 1.000 m, deshalb fällt genau dieser Wert in einen
  // eigenen Korb. Er gehört an das Ende des letzten Bereichs, nicht daneben.
  const koerbe = verteilung
    .filter((v) => v.von < 1000)
    .map((v) => ({
      beschriftung: v.von === 800 ? "800–1.000" : `${v.von}–${v.von + 199}`,
      wert: v.anzahl + (v.von === 800 ? (verteilung.find((x) => x.von >= 1000)?.anzahl ?? 0) : 0),
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Dataset",
              name: "Anbindung deutscher Wanderparkplätze an den öffentlichen Nahverkehr",
              description:
                `Für ${nf.format(g.plaetze)} in OpenStreetMap ausgewiesene Wanderparkplätze in Deutschland die Entfernung zur nächsten Haltestelle des öffentlichen Nahverkehrs innerhalb von 1.000 Metern, aggregiert nach Bundesland und Landkreis.`,
              url: `${SITE}/wandern-ohne-auto`,
              license: "https://opendatacommons.org/licenses/odbl/",
              isBasedOn: "https://www.openstreetmap.org/",
              creator: { "@type": "Organization", name: BETREIBER.name },
              temporalCoverage: "2026",
              spatialCoverage: { "@type": "Place", name: "Deutschland" },
              distribution: {
                "@type": "DataDownload",
                encodingFormat: "text/csv",
                contentUrl: `${SITE}/wandern-ohne-auto/daten.csv`,
              },
            },
            {
              "@type": "Article",
              headline: "Wandern ohne Auto: Wie gut sind Deutschlands Wanderparkplätze an Bus und Bahn angebunden?",
              url: `${SITE}/wandern-ohne-auto`,
              publisher: { "@id": `${SITE}/#betreiber` },
            },
          ],
        })}
      />

      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Wandern ohne Auto" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Wandern ohne Auto
      </h1>
      <p className="mt-3 text-lg text-muted">
        Wie gut sind Deutschlands Wanderparkplätze an Bus und Bahn angebunden? Eine
        Auswertung von {nf.format(g.plaetze)} Ausgangspunkten.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { zahl: prozent(g.prozent), text: `der ${nf.format(g.plaetze)} Wanderparkplätze haben eine Haltestelle in Laufweite` },
          { zahl: meter(g.median), text: "beträgt die mittlere Entfernung dorthin" },
          { zahl: `${bahnProzent} %`, text: "liegen in der Nähe eines Bahnhofs — es ist ein Busland" },
        ].map((k) => (
          <div key={k.zahl} className="rounded-xl border border-line bg-card p-5">
            <div className="text-3xl font-bold tabular-nums">{k.zahl}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{k.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4 text-lg leading-relaxed">
        <p>
          Wandern gilt als Freizeitvergnügen, das ein Auto voraussetzt. Die Daten
          widersprechen dem: An {nf.format(g.mit)} der {nf.format(g.plaetze)} in
          OpenStreetMap ausgewiesenen Wanderparkplätze liegt eine Haltestelle des
          öffentlichen Nahverkehrs innerhalb von tausend Metern. Das sind{" "}
          {prozent(g.prozent)}.
        </p>
        <p>
          Aufschlussreicher als der Anteil ist die Entfernung. Wo es eine Haltestelle
          gibt, liegt sie im Mittel {meter(g.median)} vom Parkplatz entfernt, also
          unmittelbar daneben. {nf.format(g.b300)} Ausgangspunkte haben eine Haltestelle
          in dreihundert Metern, {nf.format(g.b500)} in fünfhundert. Es gibt kaum den
          Fall, dass eine Haltestelle zwar existiert, aber unerreichbar weit weg liegt.
        </p>
        <p>
          Umgekehrt bleiben {nf.format(ohne)} Wanderparkplätze ohne jede Haltestelle im
          Umkreis von einem Kilometer. Dorthin führt kein Weg außer der Straße.
        </p>
      </div>

      <Block
        klasse="mt-10"
        titel="Wie weit ist es zur Haltestelle?"
        einleitung={`Entfernung vom Wanderparkplatz zur nächstgelegenen Haltestelle, in Metern. Nur die ${nf.format(g.mit)} Plätze, die überhaupt eine haben.`}
      >
        <Saeulen daten={koerbe} einheit="Anzahl der Wanderparkplätze je Entfernungsbereich" />
      </Block>

      <Block
        klasse="mt-6"
        titel="Bus, nicht Bahn"
        fussnote="Gezählt wurden Haltestellen, deren Name das Wort „Bahnhof“ enthält. Haltepunkte ohne dieses Wort im Namen fehlen in dieser Zahl, sie ist also eher zu niedrig als zu hoch."
      >
        <p className="leading-relaxed">
          Nur {nf.format(g.mit_bahnhof)} Wanderparkplätze liegen in der Nähe eines
          Bahnhofs, das sind {bahnProzent} Prozent. Die Anbindung deutscher
          Wandergebiete ist fast vollständig eine Bussache. Das ist folgenreich: Busse
          fahren auf dem Land seltener, am Wochenende oft gar nicht — und das Wochenende
          ist die Zeit, in der gewandert wird.
        </p>
      </Block>

      <Block
        klasse="mt-6"
        titel="Die Bundesländer im Vergleich"
        einleitung="Sortiert nach dem Anteil der Wanderparkplätze mit Haltestelle in Laufweite."
        fussnote={`Bundesländer mit weniger als ${DUENN} erfassten Wanderparkplätzen sind gekennzeichnet — dort ist der Anteil eine Zufallszahl. Berlin und Bremen führen keine ausgewiesenen Wanderparkplätze.`}
      >
        <Datentabelle
          zeilen={laender}
          basis="bundesland"
          duennAb={DUENN}
          regionWort="Bundesland"
        />
      </Block>

      <Block
        klasse="mt-6"
        titel="Stadt und Land"
        fussnote="Die Zahlen enthalten nur Kreise, denen Wanderparkplätze zugeordnet sind."
      >
        <div className="space-y-3 leading-relaxed">
          <p>
            Das Gefälle zwischen den Ländern hat eine einfache Ursache. In kreisfreien
            Städten haben {stadtLand.find((r) => r.art.startsWith("kreisfrei"))?.prozent.replace(".", ",")} Prozent
            der Wanderparkplätze eine Haltestelle in Laufweite, in Landkreisen{" "}
            {stadtLand.find((r) => r.art.startsWith("Landkreise"))?.prozent.replace(".", ",")} Prozent.
            Auch die Entfernung unterscheidet sich deutlich.
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-line text-left text-sm text-muted">
                <th className="py-2 pr-3 font-medium">Art</th>
                <th className="py-2 pr-3 text-right font-medium">Plätze</th>
                <th className="py-2 pr-3 text-right font-medium">mit Haltestelle</th>
                <th className="py-2 pr-3 text-right font-medium">Anteil</th>
                <th className="py-2 text-right font-medium">Median</th>
              </tr>
            </thead>
            <tbody>
              {stadtLand.map((r) => (
                <tr key={r.art} className="border-b border-line">
                  <td className="py-2 pr-3">{r.art}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf.format(r.plaetze)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf.format(r.mit)}</td>
                  <td className="py-2 pr-3 text-right font-medium tabular-nums">
                    {prozent(r.prozent)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-muted">{meter(r.median)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 leading-relaxed">
          Das ist wenig überraschend und trotzdem der Kern des Befunds: Gewandert wird
          auf dem Land, und dort ist die Anbindung schwächer. Die {nf.format(ohne)}{" "}
          Wanderparkplätze ohne Haltestelle liegen fast vollständig in Landkreisen.
        </p>
      </Block>

      <Block
        klasse="mt-6"
        titel="Wo ein Wanderbus am meisten brächte"
        einleitung="Landkreise mit den meisten Ausgangspunkten ohne jede Haltestelle — absolut gezählt, nicht anteilig."
        fussnote="Ein Kreis mit vierzig unerschlossenen Plätzen ist für eine Verkehrsplanung interessanter als einer mit dreien bei schlechterer Quote."
      >
        <ul className="divide-y divide-line">
          {luecken.map((l) => (
            <li key={l.slug} className="flex items-baseline justify-between gap-4 py-2.5">
              <Link href={`/kreis/${l.slug}`} className="hover:text-accent">
                {l.name}
              </Link>{" "}
              <span className="shrink-0 text-sm tabular-nums text-muted">
                <span className="font-medium text-foreground">{nf.format(l.ohne_halt)}</span> von{" "}
                {nf.format(l.plaetze)}
              </span>
            </li>
          ))}
        </ul>
      </Block>

      <Block
        klasse="mt-6"
        titel={`Alle ${nf.format(kreise.length)} Landkreise`}
        einleitung="Such deinen Kreis oder sortiere nach einer Spalte. Jeder Name führt zu den Wanderparkplätzen dort."
        fussnote={`Kreise mit weniger als ${DUENN} erfassten Wanderparkplätzen sind gekennzeichnet — dort ist der Anteil eine Zufallszahl. Aufgenommen sind Kreise ab fünf Plätzen.`}
      >
        <Datentabelle zeilen={kreise} basis="kreis" duennAb={DUENN} regionWort="Landkreis" />
      </Block>

      {beispiele.length > 0 && (
        <Block
          klasse="mt-6"
          titel="Wo die Haltestelle direkt am Parkplatz steht"
          einleitung="Acht Ausgangspunkte, an denen zwischen Bushalt und Parkplatz kaum ein Schritt liegt."
        >
          <ul className="divide-y divide-line">
            {beispiele.map((b) => (
              <li key={b.slug} className="flex items-start justify-between gap-4 py-3">
                <span className="min-w-0">
                  <Link
                    href={`/wanderparkplatz/${b.slug}`}
                    className="font-medium hover:text-accent"
                  >
                    {b.platz}
                  </Link>{" "}
                  <span className="block text-sm text-muted">
                    {[b.ort, b.land].filter(Boolean).join(" · ")} — Haltestelle {b.halt}
                  </span>
                </span>{" "}
                <span className="shrink-0 pt-0.5 text-sm tabular-nums text-muted">
                  {b.distanz_m} m
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block klasse="mt-6" titel="Wie diese Zahlen entstanden sind">
        <div className="space-y-3 leading-relaxed text-muted">
          <p>
            Grundlage sind {nf.format(g.plaetze)} Parkplätze, die in OpenStreetMap
            ausdrücklich als Wanderparkplatz ausgewiesen oder als Ausgangspunkt für
            Wanderungen gekennzeichnet sind. Als Haltestelle zählt, was dort als
            Bushaltestelle, Bahnhof, Haltepunkt oder Straßenbahnhalt erfasst ist.
          </p>
          <p>
            Für jeden Parkplatz wurde die Luftlinie zur nächstgelegenen Haltestelle
            innerhalb von tausend Metern berechnet. Gibt es keine, gilt der Platz als
            ohne Anbindung. Der angegebene Median ist der mittlere Wert aller Plätze mit
            Haltestelle, nicht der Durchschnitt — einzelne Ausreißer verschieben ihn
            nicht.
          </p>
          <p className="rounded-lg border border-line bg-accent-soft p-4 text-foreground">
            <strong className="font-semibold">Was diese Zahlen nicht sagen.</strong> Sie
            belegen, dass eine Haltestelle existiert, nicht dass dort ein Bus fährt. Ein
            Schulbus zweimal am Tag ist keine Anbindung, steht in den Daten aber
            genauso da wie ein Halbstundentakt. Fahrpläne liegen dieser Auswertung nicht
            zugrunde. Wer die Frage vollständig beantworten will, müsste Fahrplandaten
            hinzuziehen; die Infrastrukturfrage ist damit beantwortet, die Frage nach
            der tatsächlichen Bedienung nicht.
          </p>
          <p>
            Die Angaben in OpenStreetMap sind ehrenamtlich erfasst und regional
            unterschiedlich vollständig. Ein niedriger Anteil kann bedeuten, dass es
            keine Haltestellen gibt — oder dass sie niemand eingetragen hat. Stand der
            Auswertung: {STAND}.
          </p>
          <p>
            Verwandte Auswertung:{" "}
            <Link href="/toilette-am-wanderparkplatz" className="underline hover:text-accent">
              Toiletten am Wanderparkplatz
            </Link>
            , dieselben Ausgangspunkte, andere Frage — und mit einer deutlich
            lückenhafteren Datenlage, was dort auch so dasteht.
          </p>
        </div>
      </Block>

      <Block
        klasse="mt-6"
        titel="Daten herunterladen"
        einleitung="Die vollständige Auswertung als CSV, je Zeile eine Region."
      >
        <a
          href="/wandern-ohne-auto/daten.csv"
          className="inline-block rounded-lg border border-accent bg-accent-soft px-4 py-2 font-medium hover:border-foreground"
        >
          Datensatz als CSV
        </a>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Die Auswertung steht unter der{" "}
          <a
            href="https://opendatacommons.org/licenses/odbl/"
            rel="noopener"
            className="underline hover:text-accent"
          >
            Open Database License
          </a>
          , wie die zugrunde liegenden Daten von OpenStreetMap. Verwendung ist
          ausdrücklich erwünscht, auch gewerblich, solange Quelle und Lizenz genannt
          werden.
        </p>
        <div className="mt-4 rounded-lg border border-line p-4 text-sm">
          <p className="font-medium">So lässt sich die Auswertung zitieren:</p>
          <p className="mt-2 leading-relaxed text-muted">
            {BETREIBER.name} ({STAND}): Wandern ohne Auto — Anbindung deutscher
            Wanderparkplätze an den öffentlichen Nahverkehr. Datengrundlage:
            OpenStreetMap-Mitwirkende, ODbL. {SITE}/wandern-ohne-auto
          </p>
        </div>
      </Block>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Fragen zur Methode oder ein Fehler entdeckt? Schreib an{" "}
        <a href={`mailto:${BETREIBER.email}`} className="underline hover:text-accent">
          {BETREIBER.email}
        </a>
        . Wie das Verzeichnis insgesamt entsteht, steht{" "}
        <Link href="/ueber-uns" className="underline hover:text-accent">
          in der Beschreibung
        </Link>
        .
      </p>
    </div>
  );
}
