import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Block from "@/components/Block";
import Saeulen from "@/components/Saeulen";
import Datentabelle from "@/components/Datentabelle";
import PlatzTabelle from "@/components/PlatzTabelle";
import {
  wcGesamt, wcNachLand, wcNachKreis, wcNachGroesse, wcNachNachbarschaft,
  wcPlaetze, wcLuecken, wcEintraege,
} from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";
import { BETREIBER } from "@/lib/betreiber";
import { bestand } from "@/lib/queries";

export const revalidate = 604800;

/** Suchradius für Toiletten, siehe UMFELD_MAX_M in der Aufbereitung. */
const RADIUS_M = 500;

export async function generateMetadata(): Promise<Metadata> {
  const g = await wcGesamt();
  return {
    title: "Toilette am Wanderparkplatz: Wo es eine gibt — und wo nicht",
    description: beschreibung(
      `Auswertung von ${nf.format(g.plaetze)} Wanderparkplätzen: An ${String(g.prozent).replace(".", ",")} Prozent` +
        ` liegt eine Toilette in Laufweite. Alle ${nf.format(g.mit)} Plätze mit Toilette zum Durchsuchen,` +
        ` dazu Bundesländer und Landkreise im Vergleich.`,
    ),
    alternates: { canonical: "/toilette-am-wanderparkplatz" },
  };
}

const meter = (m: number | null) => (m == null ? "—" : `${nf.format(m)} m`);
const prozent = (v: string) => `${String(v).replace(".", ",")} %`;

/** Unter zehn Plätzen ist ein Prozentwert eine Zufallszahl. */
const DUENN = 10;

export default async function ToiletteAmWanderparkplatz() {
  const [g, laender, kreise, groesse, nachbarschaft, plaetze, luecken, eintraege, b] =
    await Promise.all([
    wcGesamt(),
    wcNachLand(),
    wcNachKreis(5),
    wcNachGroesse(),
    wcNachNachbarschaft(),
    wcPlaetze(),
    wcLuecken(8),
    wcEintraege(),
    bestand(),
  ]);

  const stand = b.lauf
    ? new Date(`${b.lauf}T00:00:00Z`).toLocaleDateString("de-DE", {
        dateStyle: "long",
        timeZone: "UTC",
      })
    : null;

  const ohne = g.plaetze - g.mit;
  const kleinste = groesse[0];
  const groesste = groesse[groesse.length - 1];
  const faktor = groesste && kleinste
    ? (Number(groesste.prozent) / Number(kleinste.prozent)).toFixed(0)
    : "9";
  const einkehr = nachbarschaft.find((n) => n.merkmal.startsWith("Gaststätte"));
  const aussicht = nachbarschaft.find((n) => n.merkmal.startsWith("Aussichtspunkt"));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Dataset",
              name: "Toiletten im Umkreis deutscher Wanderparkplätze",
              description:
                `Für ${nf.format(g.plaetze)} in OpenStreetMap ausgewiesene Wanderparkplätze in Deutschland die Entfernung zur nächsten Toilette innerhalb von ${RADIUS_M} Metern, aggregiert nach Bundesland, Landkreis und Größe des Platzes.`,
              url: `${SITE}/toilette-am-wanderparkplatz`,
              license: "https://opendatacommons.org/licenses/odbl/",
              isBasedOn: "https://www.openstreetmap.org/",
              creator: { "@type": "Organization", name: BETREIBER.name },
              temporalCoverage: "2026",
              spatialCoverage: { "@type": "Place", name: "Deutschland" },
              distribution: {
                "@type": "DataDownload",
                encodingFormat: "text/csv",
                contentUrl: `${SITE}/toilette-am-wanderparkplatz/daten.csv`,
              },
            },
            {
              "@type": "Article",
              headline:
                "Toilette am Wanderparkplatz: An wie vielen Ausgangspunkten gibt es eine?",
              url: `${SITE}/toilette-am-wanderparkplatz`,
              publisher: { "@id": `${SITE}/#betreiber` },
            },
          ],
        })}
      />

      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Toilette am Wanderparkplatz" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Toiletten am Wanderparkplatz
      </h1>
      <p className="mt-3 text-lg text-muted">
        An wie vielen der {nf.format(g.plaetze)} deutschen Wanderparkplätze steht eine
        Toilette in Laufweite? Eine Auswertung — und eine ehrliche Einordnung, was die
        Zahl wert ist.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            zahl: prozent(g.prozent),
            text: `der ${nf.format(g.plaetze)} Wanderparkplätze haben eine Toilette in ${RADIUS_M} Metern`,
          },
          { zahl: meter(g.median), text: "beträgt die mittlere Entfernung dorthin" },
          {
            zahl: nf.format(g.ohne_alles),
            text: "Plätze haben weder Toilette noch Gaststätte im Umkreis",
          },
        ].map((k) => (
          <div key={k.zahl} className="rounded-xl border border-line bg-card p-5">
            <div className="text-3xl font-bold tabular-nums">{k.zahl}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted">{k.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4 text-lg leading-relaxed">
        <p>
          An {nf.format(g.mit)} der {nf.format(g.plaetze)} in OpenStreetMap ausgewiesenen
          Wanderparkplätze liegt eine Toilette innerhalb von {RADIUS_M} Metern. Das sind{" "}
          {prozent(g.prozent)}.
        </p>
        <p>
          Diese Zahl ist der schwächste Teil der Auswertung, und es wäre unredlich, damit
          aufzumachen, ohne das dazuzusagen.
        </p>
      </div>

      <Block klasse="mt-8" titel="Was diese Zahl nicht ist">
        <div className="space-y-4 leading-relaxed">
          <p>
            Eine Bushaltestelle wird in OpenStreetMap systematisch erfasst. Sie ist
            Infrastruktur, sie trägt einen Namen, jemand hängt Linien und Fahrpläne daran.
            Ein Klo am Waldrand trägt niemand ein, außer er steht zufällig davor und hat die
            App offen. Von den {nf.format(eintraege.gesamt)} erfassten Toiletten haben{" "}
            {nf.format(eintraege.ohne_namen)} nicht einmal einen Namen — es sind gesetzte
            Punkte, sonst nichts.
          </p>
          <p>
            {prozent(g.prozent)} ist deshalb eine Untergrenze und keine Messung. Wer daraus
            liest, an den übrigen {nf.format(ohne)} Plätzen gebe es keine Toilette, liest
            mehr hinein, als dasteht. Er weiß nur, dass dort keine eingetragen ist.
          </p>
          <p>
            Was die Lücke überlebt, sind die Verhältnisse. Ob ein großer Platz häufiger eine
            Toilette hat als ein kleiner, lässt sich auch dann beantworten, wenn beide
            Gruppen gleichermaßen unvollständig kartiert sind. Dort steht das eigentliche
            Ergebnis.
          </p>
        </div>
      </Block>

      <Block
        klasse="mt-6"
        titel="Die Toilette folgt dem Andrang, nicht dem Weg"
        einleitung={`Anteil der Plätze mit Toilette, nach Zahl der Stellplätze. Gerechnet auf den ${nf.format(groesse.reduce((s, r) => s + r.plaetze, 0))} Plätzen, für die eine Stellplatzzahl erfasst ist.`}
        fussnote="Die Werte stehen zusätzlich in der Tabelle darunter, das Bild ist nur die Abkürzung."
      >
        <Saeulen
          daten={groesse.map((r) => ({
            beschriftung: r.klasse,
            wert: Number(r.prozent),
          }))}
          einheit="Anteil der Plätze mit Toilette, in Prozent"
          nachkomma={1}
        />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-line text-muted">
                <th scope="col" className="py-2 pr-3 text-left font-medium">Stellplätze</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">Plätze</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">mit Toilette</th>
                <th scope="col" className="py-2 text-right font-medium">Anteil</th>
              </tr>
            </thead>
            <tbody>
              {groesse.map((r) => (
                <tr key={r.klasse} className="border-b border-line">
                  <td className="py-2 pr-3">{r.klasse}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf.format(r.plaetze)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf.format(r.mit)}</td>
                  <td className="py-2 text-right font-medium tabular-nums">
                    {prozent(r.prozent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        <p>
          Von {prozent(kleinste?.prozent ?? "0")} auf {prozent(groesste?.prozent ?? "0")}.
          Ein Platz für hundert Autos hat rund {faktor}-mal so oft eine Toilette wie einer
          für weniger als zehn.
        </p>
        <p>
          Der naheliegende Einwand: Große Plätze werden auch genauer kartiert, der Anstieg
          wäre dann bloß ein Abbild des Kartierungsfleißes. Dagegen spricht die
          Grundgesamtheit. Diese Staffel ist nur auf den Plätzen gerechnet, für die jemand
          die Stellplätze gezählt hat — und wer Stellplätze zählt, hat sich den Platz
          angesehen. Innerhalb dieser Gruppe hat jeder Platz Aufmerksamkeit bekommen, der
          kleine wie der große. Der Unterschied bleibt trotzdem.
        </p>
      </div>

      <Block klasse="mt-8" titel="Sie gehört fast immer jemand anderem">
        <div className="space-y-4 leading-relaxed">
          <p>
            Die Toilette am Wanderparkplatz ist selten eine Toilette für Wanderer. An
            Plätzen mit einer Gaststätte in der Nähe liegt der Anteil bei{" "}
            {prozent(einkehr?.mit_merkmal ?? "0")}, ohne Gaststätte bei{" "}
            {prozent(einkehr?.ohne ?? "0")}. Bei Aussichtspunkten ist der Abstand kleiner,
            aber gleichgerichtet: {prozent(aussicht?.mit_merkmal ?? "0")} gegenüber{" "}
            {prozent(aussicht?.ohne ?? "0")}.
          </p>
          <p>
            Das Muster ist überall dasselbe. Die Toilette steht dort, wo ohnehin Leute sind
            — am Gasthaus, am Aussichtsturm, am Freibad, am Ausflugsziel. Sie ist keine
            Wanderinfrastruktur, sondern ein Nebenprodukt von Publikumsverkehr.
          </p>
          <p>
            Das erklärt, warum sie ausgerechnet dort fehlt, wo man sie am ehesten bräuchte:
            am kleinen Waldparkplatz, von dem eine lange Runde losgeht.{" "}
            {nf.format(g.ohne_alles)} Plätze haben weder eine Toilette noch eine Gaststätte
            im Umkreis. Das ist mehr als ein Drittel aller Ausgangspunkte.
          </p>
        </div>
      </Block>

      <Block klasse="mt-6" titel="Wenn es eine gibt, ist sie nah">
        <div className="space-y-4 leading-relaxed">
          <p>
            Wo eine Toilette eingetragen ist, liegt sie im Mittel {meter(g.median)} vom
            Parkplatz entfernt. {nf.format(g.b50)} Plätze haben eine in fünfzig Metern,{" "}
            {nf.format(g.b150)} in hundertfünfzig. Den Fall „Toilette vorhanden, aber
            unbrauchbar weit weg“ gibt es praktisch nicht.
          </p>
          <p className="text-sm text-muted">
            Das liegt zum Teil an der Methode: Gesucht wird nur bis {RADIUS_M} Meter. Bei
            Haltestellen reicht der Umkreis bis tausend Meter, bei einer Gaststätte bis
            zwölfhundert. Zu einem Klo geht man keinen Kilometer, deshalb die engere Grenze.
            Sie schneidet einen Teil der Fälle ab — der abgeschnittene Teil wäre für die
            Frage aber ohnehin ohne Wert.
          </p>
        </div>
      </Block>

      <Block
        klasse="mt-8"
        titel={`Alle ${nf.format(plaetze.length)} Plätze mit Toilette`}
        einleitung="Nach Landkreis sortiert. Suchfeld nimmt Platz, Landkreis oder Bundesland."
        fussnote="Entfernung ist Luftlinie zum nächsten eingetragenen Eintrag. Ob die Toilette offen, sauber oder kostenpflichtig ist, steht in den Daten nicht."
      >
        <PlatzTabelle zeilen={plaetze} />
      </Block>

      <Block
        klasse="mt-6"
        titel="Die Bundesländer im Vergleich"
        fussnote={`Länder mit weniger als ${DUENN} erfassten Plätzen sind gekennzeichnet — dort ist ein Anteil eine Zufallszahl.`}
      >
        <Datentabelle
          zeilen={laender}
          basis="bundesland"
          regionWort="Bundesland"
          mitTitel="mit Toilette"
          duennAb={DUENN}
        />
      </Block>

      <Block
        klasse="mt-6"
        titel={`Alle ${nf.format(kreise.length)} Landkreise`}
        einleitung="Nur Kreise mit mindestens fünf erfassten Wanderparkplätzen."
      >
        <Datentabelle
          zeilen={kreise}
          basis="kreis"
          regionWort="Landkreis"
          mitTitel="mit Toilette"
          duennAb={DUENN}
        />
      </Block>

      <Block
        klasse="mt-6"
        titel="Wo die Lücke am größten ist"
        einleitung="Nach Anteil zu sortieren führt in die Irre, wenn man wissen will, wo sich etwas ändern müsste. Hier stehen die absoluten Zahlen."
      >
        <ul className="divide-y divide-line">
          {luecken.map((l) => (
            <li key={l.slug} className="flex items-baseline justify-between gap-3 py-2.5">
              <Link href={`/kreis/${l.slug}`} className="hover:text-accent">
                {l.name}
              </Link>
              <span className="shrink-0 text-sm tabular-nums text-muted">
                {nf.format(l.ohne)} von {nf.format(l.plaetze)} ohne
              </span>
            </li>
          ))}
        </ul>
      </Block>

      <Block klasse="mt-8" titel="Und wenn keine da ist">
        <div className="space-y-4 leading-relaxed">
          <p>
            Für die große Mehrheit der Ausgangspunkte ist das der Normalfall. Dann gilt, was
            im Wald ohnehin gilt — ein paar Punkte, die häufiger falsch gemacht als gewusst
            werden:
          </p>
          <p>
            <strong className="font-semibold">Abstand zum Wasser.</strong> Mindestens dreißig
            Meter zu Bächen, Seen und Quellen, lieber mehr. In Wasserschutzgebieten der Zonen
            I und II gar nicht; die sind ausgeschildert.
          </p>
          <p>
            <strong className="font-semibold">Das Wegegebot beachten.</strong> Das
            Betretungsrecht des Waldes nach § 14 Bundeswaldgesetz erlaubt das Betreten zur
            Erholung, nicht alles Übrige. In Naturschutzgebieten gilt häufig ein Wegegebot,
            dann darf man den Weg nicht verlassen. Es steht auf der Tafel am Eingang.
          </p>
          <p>
            <strong className="font-semibold">Vergraben, nicht liegen lassen.</strong> Fünfzehn
            bis zwanzig Zentimeter tief, in humusreicher Erde — dort arbeiten die
            Bodenorganismen. Nicht in Felsnischen, Höhlen oder unter Überhängen: Dort bleibt
            es trocken und zersetzt sich über Jahre nicht.
          </p>
          <p>
            <strong className="font-semibold">Papier kommt wieder mit.</strong> Es verrottet je
            nach Witterung sehr langsam, Feuchttücher praktisch gar nicht. Ein Gefrierbeutel
            im Rucksack löst das vollständig und wiegt nichts.
          </p>
          <p>
            <strong className="font-semibold">Abstand zu Wegen und Rastplätzen.</strong> Sechzig
            bis siebzig Schritte reichen meistens und ersparen dem Nächsten den Fund.
          </p>
        </div>
      </Block>

      <Block klasse="mt-8" titel="Wie diese Zahlen entstanden sind">
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Grundlage sind {nf.format(g.plaetze)} Parkplätze, die in OpenStreetMap als
            Wanderparkplatz ausgewiesen oder als Ausgangspunkt für Wanderungen gekennzeichnet
            sind. Für jeden davon ist die Luftlinie zum nächsten Objekt mit{" "}
            <code className="rounded bg-background px-1">amenity=toilets</code> innerhalb von{" "}
            {RADIUS_M} Metern berechnet. Je Platz zählt der nächstgelegene Eintrag.
          </p>
          <p>
            Was die Daten nicht hergeben: ob die Toilette öffentlich zugänglich ist, ob sie
            geöffnet hat, ob sie etwas kostet, ob sie barrierefrei ist. Ein Eintrag im
            Gastraum einer Wirtschaft sieht in den Daten aus wie ein öffentliches WC am
            Parkplatz. Die Auswertung sagt, dass dort eine Toilette kartiert ist — mehr
            nicht.
          </p>
          <p>
            Luftlinie ist nicht Fußweg. Ein Bach oder eine Bahnstrecke dazwischen macht aus
            zweihundert Metern schnell einen Kilometer.
          </p>
          <p>
            Die Angaben in OpenStreetMap sind ehrenamtlich erfasst und regional
            unterschiedlich vollständig — bei Toiletten stärker als bei allem anderen, was
            hier ausgewertet wird. Die Zahlen werden mit jedem Datenabgleich neu berechnet
            und können sich daher von früheren Fassungen unterscheiden.
            {stand ? ` Stand der Auswertung: ${stand}.` : ""}
          </p>
          <p>
            Verwandte Auswertung:{" "}
            <Link href="/wandern-ohne-auto" className="underline hover:text-accent">
              Wandern ohne Auto
            </Link>
            , zur Anbindung derselben Plätze an Bus und Bahn.
          </p>
        </div>
      </Block>

      <Block
        klasse="mt-6"
        titel="Daten herunterladen"
        einleitung="Der vollständige Datensatz als CSV, zur eigenen Auswertung."
      >
        <p className="leading-relaxed">
          <a
            href="/toilette-am-wanderparkplatz/daten.csv"
            className="font-medium underline hover:text-accent"
          >
            daten.csv
          </a>{" "}
          enthält alle Bundesländer und Landkreise mit Plätzen, Treffern, Anteil und Median
          sowie die {nf.format(plaetze.length)} Einzelplätze mit Entfernung. Semikolon als
          Trennzeichen, damit Excel in deutscher Einstellung die Spalten erkennt.
        </p>
        <p className="mt-3 text-sm text-muted">
          Daten: OpenStreetMap-Mitwirkende, lizenziert unter der ODbL. Weiterverwendung unter
          derselben Lizenz, mit Namensnennung.
        </p>
      </Block>
    </div>
  );
}
