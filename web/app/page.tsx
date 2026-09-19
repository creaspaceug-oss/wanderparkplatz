import type { Metadata } from "next";
import Link from "next/link";
import Umkreissuche from "@/components/Umkreissuche";
import ParkplatzListe from "@/components/ParkplatzListe";
import RegionKarten from "@/components/RegionKarten";
import ParkplatzKarten from "@/components/ParkplatzKarten";
import { bundeslaender, topKreise, kennzahlen } from "@/lib/queries";
import { oepnvGesamt } from "@/lib/db";
import { regionBestaende, groessteParkplaetze, vorzeigeMitBild } from "@/lib/db";
import { WANDERREGIONEN } from "@/lib/wanderregionen";
import { jsonLd, nf } from "@/lib/format";
import { SITE, SITE_NAME } from "@/lib/site";
import { BETREIBER } from "@/lib/betreiber";
import { sichtbar } from "@/lib/ausruestung/freigabe";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Wanderparkplatz in meiner Nähe – Verzeichnis für Deutschland",
  description:
    "Wanderparkplatz oder Waldparkplatz in der Nähe finden: Ort oder Postleitzahl eingeben oder Standort freigeben — mit Wanderwegen, Stellplätzen und Gebühren.",
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    frage: "Wie finde ich einen Wanderparkplatz in meiner Nähe?",
    antwort:
      "Zwei Wege führen zum Ziel: Gib oben einen Ort oder eine Postleitzahl ein, oder lass deinen Standort ermitteln. Beides zeigt die erfassten Wanderparkplätze im Umkreis von 10, 25 oder 50 Kilometern, sortiert nach Luftlinie. Wer eine Tour im Voraus plant, gibt einfach das Zielgebiet ein — der eigene Standort wird dafür nicht gebraucht.",
  },
  {
    frage: "Was unterscheidet einen Wanderparkplatz von einem normalen Parkplatz?",
    antwort:
      "Ein Wanderparkplatz ist ein ausgewiesener Ausgangspunkt für Wanderungen: Er liegt an einem markierten Wanderweg, trägt oft eine Infotafel oder Wanderkarte und ist meist unbefestigt. In diesem Verzeichnis sind ausschließlich Parkplätze erfasst, die in OpenStreetMap ausdrücklich als Wanderparkplatz ausgewiesen oder als Ausgangspunkt für Wanderungen gekennzeichnet sind — nicht jeder Waldparkplatz taucht hier auf.",
  },
  {
    // "waldparkplatz in der nähe" und Varianten sind ein eigener, spürbarer
    // Suchstrom. Gemeint ist dieselbe Sache, also gehört die Gleichsetzung
    // auf die Seite statt in ein eigenes, dünnes Verzeichnis.
    frage: "Ist ein Waldparkplatz dasselbe wie ein Wanderparkplatz?",
    antwort:
      "Im Alltag meinen beide Wörter denselben Platz. „Waldparkplatz“ beschreibt die Lage — eine Fläche am Waldrand oder an einer Forststraße —, „Wanderparkplatz“ die Funktion als ausgewiesener Ausgangspunkt. Die meisten Plätze in diesem Verzeichnis sind beides: Sie liegen im Wald und sind zugleich als Startpunkt beschildert. Wer einen Waldparkplatz in der Nähe sucht, bekommt hier dieselben Ergebnisse. Geläufig sind außerdem Wanderer-Parkplatz und Parkplatz für Wanderer.",
  },
  {
    frage: "Welche Wanderwege starten an einem Wanderparkplatz?",
    antwort:
      "Auf jeder Parkplatzseite stehen die markierten Wanderwege, die innerhalb von 200 Metern am Platz vorbeiführen — mit Name, Markierung (etwa „rote Raute“) und Einordnung als örtlicher Rundweg, regionaler Wanderweg oder Fernwanderweg. Die Angaben stammen aus den Wanderrouten in OpenStreetMap; maßgeblich ist die Beschilderung vor Ort.",
  },
  {
    frage: "Sind Wanderparkplätze kostenlos?",
    antwort:
      "Ganz überwiegend ja. Von den Plätzen, für die eine Gebührenangabe vorliegt, sind rund 97 Prozent kostenfrei. Das gilt vor allem für Wald- und Feldrandparkplätze. In stark besuchten Regionen wie dem Alpenvorland, der Sächsischen Schweiz oder an bekannten Gipfeln führen Kommunen und Forstbetriebe zunehmend Parkgebühren ein, häufig per Automat oder Parkschein-App. Auf jeder Detailseite steht, was erfasst ist.",
  },
  {
    frage: "Darf ich auf einem Wanderparkplatz im Wohnmobil übernachten?",
    antwort:
      "Wanderparkplätze sind Parkplätze, keine Stellplätze. Erlaubt ist in der Regel allein die einmalige Übernachtung zur Wiederherstellung der Fahrtüchtigkeit, sofern kein Verbotsschild steht. Alles, was nach Camping aussieht — Markise, Tisch, Stühle, mehrere Nächte —, ist nicht zulässig. In Naturschutzgebieten und Nationalparks gilt fast immer ein ausdrückliches Verbot.",
  },
  {
    frage: "Wie voll sind Wanderparkplätze?",
    antwort:
      "Wanderparkplätze sind meist klein: Wo eine Stellplatzzahl erfasst ist, liegt der Mittelwert bei zehn Plätzen. An bekannten Ausgangspunkten sind sie an sonnigen Wochenenden vormittags belegt. Wer sicher gehen will, startet früh, weicht auf einen benachbarten Platz aus oder reist mit Bus und Bahn an. Wildes Parken am Straßenrand behindert Rettungs- und Forstfahrzeuge und wird zunehmend abgeschleppt.",
  },
  {
    frage: "Woher stammen die Daten?",
    antwort:
      "Alle Standorte, Merkmale und Wanderwege stammen aus OpenStreetMap und stehen unter der ODbL-Lizenz. Die Angaben sind ehrenamtlich erfasst und können unvollständig oder veraltet sein — insbesondere Gebühren und Zufahrtsregelungen ändern sich. Die Beschilderung vor Ort ist immer maßgeblich.",
  },
];

function Abschnitt({
  titel,
  einleitung,
  children,
}: {
  titel: string;
  einleitung?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="text-2xl font-semibold tracking-tight">{titel}</h2>
      {einleitung && <p className="mt-2 max-w-2xl text-muted">{einleitung}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function Startseite() {
  const [laender, kreise, zahlen, bestaende, groesste, vorzeige, oepnv] = await Promise.all([
    bundeslaender(),
    topKreise(18),
    kennzahlen(),
    regionBestaende(WANDERREGIONEN),
    groessteParkplaetze(6),
    vorzeigeMitBild(6, 54),
    oepnvGesamt(),
  ]);

  const proSlug = new Map(bestaende.map((b) => [b.slug, b.n]));
  const regionen = WANDERREGIONEN.map((r) => ({ ...r, bestand: proSlug.get(r.slug) ?? 0 }))
    .filter((r) => r.bestand > 0)
    .sort((a, b) => b.bestand - a.bestand);

  const anteilFrei = zahlen.mit_gebuehrenangabe
    ? Math.round((zahlen.kostenfrei / zahlen.mit_gebuehrenangabe) * 100)
    : 0;
  const anteilUnbefestigt = zahlen.mit_oberflaeche
    ? Math.round((zahlen.unbefestigt / zahlen.mit_oberflaeche) * 100)
    : 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE}/#betreiber`,
              name: BETREIBER.name,
              url: SITE,
              email: BETREIBER.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: BETREIBER.strasse,
                postalCode: BETREIBER.plz,
                addressLocality: BETREIBER.ort,
                addressCountry: BETREIBER.landCode,
              },
            },
            {
              "@type": "WebSite",
              "@id": `${SITE}/#website`,
              url: SITE,
              name: SITE_NAME,
              description: `Verzeichnis von ${zahlen.gesamt} Wanderparkplätzen in Deutschland mit Wanderwegen, Stellplätzen und Gebühren.`,
              inLanguage: "de-DE",
              publisher: { "@id": `${SITE}/#betreiber` },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.frage,
                acceptedAnswer: { "@type": "Answer", text: f.antwort },
              })),
            },
          ],
        })}
      />

      {/* ------------------------------------------------------------ Einstieg */}
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Wanderparkplatz in meiner Nähe
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {nf.format(zahlen.gesamt)} ausgewiesene Wander- und Waldparkplätze in Deutschland
          — mit den markierten Wanderwegen, die dort vorbeiführen, mit Stellplatzzahl,
          Gebühren und Untergrund. Standort freigeben oder einfach den Zielort eingeben.
        </p>

        <div className="mt-8">
          <Umkreissuche />
        </div>

        {regionen.length > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span>Beliebte Regionen:</span>
            {regionen.slice(0, 6).map((r) => (
              <Link key={r.slug} href={`/region/${r.slug}`} className="underline hover:text-accent">
                {r.name}
              </Link>
            ))}
          </p>
        )}

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Wanderparkplätze", nf.format(zahlen.gesamt), "in ganz Deutschland"],
            ["kostenfrei", `${anteilFrei} %`, `von ${nf.format(zahlen.mit_gebuehrenangabe)} mit Angabe`],
            ["Orte", nf.format(zahlen.orte), `in ${nf.format(zahlen.kreise)} Landkreisen`],
            ["Stellplätze", nf.format(zahlen.stellplaetze_summe ?? 0), `aus ${nf.format(zahlen.mit_stellplatzangabe)} Angaben`],
          ].map(([label, wert, zusatz]) => (
            <div key={label} className="rounded-lg border border-line bg-card p-4">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{wert}</dd>
              <dd className="mt-0.5 text-xs text-muted">{zusatz}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* -------------------------------------------------- Was die Seiten bieten */}
      <Abschnitt
        titel="Was auf jeder Parkplatzseite steht"
        einleitung="Nicht nur ein Punkt auf der Karte — sondern das, worüber man vor der Abfahrt Bescheid wissen will."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              titel: "Wanderwege ab dem Platz",
              text: "Welche markierten Wege unmittelbar vorbeiführen, mit ihrer Markierung — etwa „schwarzes Rechteck mit A2“ — und der Einordnung als Rundweg, regionaler Weg oder Fernwanderweg.",
            },
            {
              titel: "Kosten und Kapazität",
              text: "Gebührenpflicht samt Höhe, sofern erfasst, die Zahl der Stellplätze, Öffnungszeiten und Zufahrtsbeschränkungen wie Höhenbegrenzungen.",
            },
            {
              titel: "Untergrund und Anfahrt",
              text: "Ob asphaltiert oder Naturboden — nach Regen ein Unterschied. Dazu die Koordinaten zum Abtippen und Direktlinks in die gängigen Navigations-Apps.",
            },
          ].map((k) => (
            <div key={k.titel} className="rounded-xl border border-line bg-card p-5">
              <h3 className="font-semibold">{k.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{k.text}</p>
            </div>
          ))}
        </div>
      </Abschnitt>

      {/* ------------------------------------------------ Beispiele aus dem Bestand */}
      <Abschnitt
        titel="Wanderparkplätze in ganz Deutschland"
        einleitung="Eine Auswahl über alle Bundesländer verteilt. Jeder Eintrag führt zur Seite mit den Wanderwegen ab dem Platz, dem Umfeld und der Anfahrt. Abgebildet ist jeweils ein Wanderziel in der Nähe — von Parkplätzen selbst gibt es keine Fotos."
      >
        <ParkplatzKarten items={vorzeige} />
        <p className="mt-5 text-sm text-muted">
          Das ist ein Ausschnitt aus {nf.format(zahlen.gesamt)} erfassten Plätzen. Über die
          Suche oben, die{" "}
          <Link href="/regionen" className="text-accent underline">
            Wanderregionen
          </Link>{" "}
          oder die{" "}
          <Link href="/bundeslaender" className="text-accent underline">
            Bundesländer
          </Link>{" "}
          kommst du an den vollständigen Bestand.
        </p>
      </Abschnitt>

      {/* ------------------------------------------------------------- Regionen */}
      {regionen.length > 0 && (
        <Abschnitt
          titel="Wanderparkplätze nach Wanderregion"
          einleitung="Wanderregionen folgen der Landschaft, nicht den Verwaltungsgrenzen — hier der Einstieg über das Gebirge oder die Landschaft, in der du unterwegs sein willst."
        >
          <RegionKarten regionen={regionen} max={12} />
          {regionen.length > 12 && (
            <p className="mt-4">
              <Link href="/regionen" className="text-accent underline">
                Alle {regionen.length} Wanderregionen ansehen
              </Link>
            </p>
          )}
        </Abschnitt>
      )}

      {/* --------------------------------------------------------- Bundesländer */}
      <Abschnitt
        titel="Wanderparkplätze nach Bundesland"
        einleitung="Der Bestand folgt der Wanderdichte: Mittelgebirge und Alpenvorland liegen deutlich vor den Küsten- und Tieflandregionen."
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {laender.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/bundesland/${l.slug}`}
                className="flex items-baseline justify-between rounded-lg border border-line bg-card px-4 py-3 hover:border-accent"
              >
                <span className="font-medium">{l.name}</span>
                <span className="text-sm tabular-nums text-muted">{nf.format(l.poi_count)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Abschnitt>

      {/* ------------------------------------------------------------ Auswertung */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-line bg-accent-soft p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            Datenauswertung
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Wandern ohne Auto: Wie gut sind Deutschlands Wanderparkplätze an Bus und
            Bahn angebunden?
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            An {nf.format(oepnv.mit)} der {nf.format(oepnv.plaetze)} erfassten
            Ausgangspunkte liegt eine Haltestelle in Laufweite, im Mittel{" "}
            {nf.format(oepnv.median)} Meter entfernt. Nur{" "}
            {((oepnv.mit_bahnhof / oepnv.plaetze) * 100).toFixed(1).replace(".", ",")}{" "}
            Prozent liegen an einem Bahnhof. Alle Bundesländer und Landkreise im
            Vergleich, mit Datensatz zum Herunterladen.
          </p>
          <Link
            href="/wandern-ohne-auto"
            className="mt-5 inline-block rounded-lg border border-accent bg-card px-4 py-2 font-medium hover:border-foreground"
          >
            Zur Auswertung
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------ Ausrüstung */}
      {/*
        Nur Verweise auf die Vergleiche, keine Kaufknöpfe. Die Startseite gehört
        zum Verzeichnis, und das Verzeichnis bleibt frei von Partnerlinks —
        verlinkt wird von den Ausrüstungsseiten hinein, nicht umgekehrt.
      */}
      <Abschnitt
        titel="Ausrüstung für die Tour"
        einleitung="Kaufberatungen, die zu jedem Produkt sagen, wogegen es spricht."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              pfad: "/ausruestung/groedel",
              titel: "Grödel für den Winter",
              text: "Wann sie reichen, wann es Steigeisen braucht, und welche Größe passt.",
              marke: "Faustregel · 6 Grödel",
            },
            {
              pfad: "/ausruestung/huettenschlafsack",
              titel: "Hüttenschlafsack",
              text: "Pflicht auf Alpenvereinshütten: Seide, Baumwolle oder Mikrofaser — und warum er in die Mikrowelle muss.",
              marke: "Berater · 7 Modelle",
            },
            {
              pfad: "/ausruestung/erste-hilfe-set",
              titel: "Erste-Hilfe-Set zum Wandern",
              text: "Was laut Alpenverein hineingehört — und sieben Sets an dieser Liste gemessen.",
              marke: "Set-Check · 7 Sets",
            },
            {
              pfad: "/ausruestung/stirnlampe",
              titel: "Stirnlampe zum Wandern",
              text: "Was Lumen wirklich sagen und wann es auf deiner Tour dunkel wird.",
              marke: "Dunkelheits-Rechner · 7 Lampen",
            },
            {
              pfad: "/ausruestung/gamaschen",
              titel: "Gamaschen zum Wandern",
              text: "Welche Höhe, dicht oder atmungsaktiv, und was sie gegen Zecken bringen.",
              marke: "Berater · 6 Gamaschen",
            },
            {
              pfad: "/ausruestung/wasserfilter",
              titel: "Wasserfilter für unterwegs",
              text: "Was ein Filter zurückhält, was nicht — und welcher für deine Tour reicht.",
              marke: "Wasserberater · 8 Lösungen",
            },
            {
              pfad: "/ausruestung/regenhose",
              titel: "Regenhose zum Wandern",
              text: "Wie dicht sie sein muss und welcher Reißverschluss über den Stiefel passt.",
              marke: "Druckrechner · 6 Hosen",
            },
            {
              pfad: "/ausruestung/schuhe-impraegnieren",
              titel: "Schuhe imprägnieren",
              text: "Wachs oder Spray, was Gore-Tex-Schuhe brauchen und was der Test empfiehlt.",
              marke: "Pflegeplaner · 7 Mittel",
            },
            {
              pfad: "/ausruestung/wandersocken",
              titel: "Wandersocken",
              text: "Welche Polsterung zu welchem Schuh passt — und wie du Blasen vermeidest.",
              marke: "Sockenfinder · 6 Socken",
            },
            {
              pfad: "/ausruestung/wanderrucksack",
              titel: "Wanderrucksack im Vergleich",
              text: "Wie viel Liter, wie du die Rückenlänge misst und was Damenmodelle anders machen.",
              marke: "Literrechner · 7 Rucksäcke",
            },
            {
              pfad: "/ausruestung/wanderstoecke",
              titel: "Wanderstöcke im Vergleich",
              text: "Welche Länge zu deiner Körpergröße passt, warum der Verschluss wichtiger ist als Carbon, und was die Stiftung Warentest herausfand.",
              marke: "Längenrechner · 6 Stöcke",
            },
            {
              pfad: "/ausruestung/trinkblase",
              titel: "Trinkblase fürs Wandern",
              text: "2 oder 3 Liter, warum die Öffnung über die Reinigung entscheidet, und wie sie nicht verschimmelt.",
              marke: "Wasserrechner · 6 Trinkblasen",
            },
          ]
            .filter((k) => sichtbar(k.pfad))
            .map((k) => (
            <Link
              key={k.pfad}
              href={k.pfad}
              className="group flex flex-col rounded-xl border border-line bg-card p-5 transition hover:border-accent hover:shadow-sm"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-accent">{k.marke}</span>
              <span className="mt-1.5 text-lg font-semibold group-hover:text-accent">{k.titel}</span>
              <span className="mt-2 leading-relaxed text-muted">{k.text}</span>
              <span className="mt-auto pt-4 text-sm font-medium text-accent">
                Zum Vergleich <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </Abschnitt>

      {/* -------------------------------------------------- Auswertung des Bestands */}
      <Abschnitt
        titel="Was der Datenbestand zeigt"
        einleitung="Auswertungen über alle erfassten Plätze — Zahlen, die sich sonst nirgends nachschlagen lassen."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">Fast immer kostenfrei</h3>
            <p className="mt-2 leading-relaxed text-muted">
              Von {nf.format(zahlen.mit_gebuehrenangabe)} Plätzen mit Gebührenangabe sind{" "}
              {nf.format(zahlen.kostenfrei)} kostenfrei — {anteilFrei} Prozent. Gebühren
              konzentrieren sich auf wenige, stark besuchte Ausgangspunkte; die Regel ist das
              nicht.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">Klein statt weitläufig</h3>
            <p className="mt-2 leading-relaxed text-muted">
              Wo eine Stellplatzzahl erfasst ist, liegt der Mittelwert bei{" "}
              {zahlen.stellplaetze_median ?? 10} Plätzen. Ein Wanderparkplatz ist typischerweise
              eine Ausbuchtung am Waldrand — kein Parkhaus. Genau deshalb sind sie an schönen
              Wochenenden schnell belegt.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">Jeder zweite unbefestigt</h3>
            <p className="mt-2 leading-relaxed text-muted">
              Von {nf.format(zahlen.mit_oberflaeche)} Plätzen mit Angabe zum Untergrund sind{" "}
              {anteilUnbefestigt} Prozent unbefestigt — Schotter, Kies, Wiese oder Naturboden.
              Nach längerem Regen ist mit weichem Grund und Pfützen zu rechnen.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">Barrierefreiheit bleibt die Ausnahme</h3>
            <p className="mt-2 leading-relaxed text-muted">
              Nur bei {nf.format(zahlen.barrierefrei)} Plätzen sind barrierefreie Stellplätze
              erfasst. Das heißt nicht, dass es nirgends welche gibt — es heißt vor allem, dass
              dieses Merkmal in den Daten kaum gepflegt ist.
            </p>
          </div>
        </div>
      </Abschnitt>

      {/* ------------------------------------------------------- Größte Plätze */}
      {groesste.length > 0 && (
        <Abschnitt
          titel="Die größten Wanderparkplätze"
          einleitung="Plätze mit der höchsten erfassten Stellplatzzahl — dort ist die Chance am größten, auch am Sonntagmorgen noch einen Platz zu finden."
        >
          <ParkplatzListe items={groesste} />
        </Abschnitt>
      )}

      {/* ------------------------------------------------------------ Landkreise */}
      <Abschnitt
        titel="Landkreise mit dem größten Bestand"
        einleitung="Wo besonders viele Ausgangspunkte erfasst sind."
      >
        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {kreise.map((k) => (
            <li
              key={k.slug}
              className="flex items-baseline justify-between gap-2 border-b border-line py-2"
            >
              <Link href={`/kreis/${k.slug}`} className="truncate hover:text-accent">
                {k.name}
                <span className="ml-1 text-sm text-muted">{k.bl_name}</span>
              </Link>
              <span className="shrink-0 text-sm tabular-nums text-muted">{k.poi_count}</span>
            </li>
          ))}
        </ul>
      </Abschnitt>

      {/* -------------------------------------------------------------- Ratgeber */}
      <Abschnitt
        titel="Gut zu wissen vor der Abfahrt"
        einleitung="Was am Wanderparkplatz regelmäßig für Ärger sorgt — und wie sich das vermeiden lässt."
      >
        <div className="space-y-6 leading-relaxed">
          <div>
            <h3 className="font-semibold">Nicht auf Forstwegen parken</h3>
            <p className="mt-2 text-muted">
              Forst- und Wirtschaftswege sind für den öffentlichen Verkehr in aller Regel
              gesperrt, auch wenn keine Schranke davorsteht. Sie müssen zudem für Rettungs- und
              Löschfahrzeuge befahrbar bleiben. Ist der ausgewiesene Parkplatz voll, ist die
              nächste Ausweichfläche der bessere Weg — falsch abgestelltes Fahrzeug wird in
              beliebten Gebieten zunehmend abgeschleppt.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Im Winter ist die Zufahrt oft nicht geräumt</h3>
            <p className="mt-2 text-muted">
              Waldparkplätze und ihre Zufahrten gehören meist nicht zum Räum- und Streudienst.
              In Mittelgebirgslagen kann eine Straße befahrbar aussehen und ab der Abzweigung
              zum Parkplatz nicht mehr sein. Winterreifen sind bei winterlichen Verhältnissen
              ohnehin vorgeschrieben; bei unbefestigtem Untergrund kommt Matsch hinzu, sobald
              es taut.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Übernachten im Fahrzeug</h3>
            <p className="mt-2 text-muted">
              Auf öffentlichen Parkplätzen ist die einmalige Übernachtung zur Wiederherstellung
              der Fahrtüchtigkeit grundsätzlich geduldet, solange kein Verbotsschild etwas
              anderes sagt. Sobald es nach Camping aussieht — Markise, Stühle, mehrere Nächte —,
              ist die Grenze überschritten. In Naturschutzgebieten und Nationalparks gilt fast
              durchweg ein ausdrückliches Verbot; dort wird auch kontrolliert.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Anreise ohne Auto lohnt sich öfter als gedacht</h3>
            <p className="mt-2 text-muted">
              Gerade an überlaufenen Ausgangspunkten ist die Anreise mit Bus oder Bahn die
              entspanntere Wahl — und ermöglicht Streckenwanderungen statt Rundwegen, weil man
              nicht zum Auto zurückmuss. In vielen Wanderregionen verkehren an Wochenenden
              eigene Wanderbusse.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Wertsachen nicht im Auto lassen</h3>
            <p className="mt-2 text-muted">
              Abgelegene Waldparkplätze sind über Stunden unbeobachtet. Sichtbar zurückgelassene
              Taschen und Geräte sind dort ein bekanntes Ziel. Am besten alles mitnehmen, was
              nicht fest verbaut ist.
            </p>
          </div>
        </div>
      </Abschnitt>

      {/* ------------------------------------------------------------------ FAQ */}
      <Abschnitt titel="Häufige Fragen zu Wanderparkplätzen">
        <div className="divide-y divide-line">
          {FAQ.map((f) => (
            <details key={f.frage} className="group py-4">
              <summary className="cursor-pointer font-medium marker:text-accent">
                {f.frage}
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.antwort}</p>
            </details>
          ))}
        </div>
      </Abschnitt>

      {/* ------------------------------------------------------------ Transparenz */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-semibold">Woher die Daten kommen</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Standorte, Merkmale und Wanderwege stammen aus OpenStreetMap und stehen unter der
            Open Database License. Die Angaben werden ehrenamtlich erfasst — sie sind
            unterschiedlich vollständig und können veralten. Wo eine Angabe fehlt, steht sie
            hier nicht; erfunden wird nichts. Wenn dir etwas auffällt, lässt es sich direkt in
            OpenStreetMap korrigieren und erscheint mit der nächsten Aktualisierung auch hier.
          </p>
        </div>
      </section>
    </>
  );
}
