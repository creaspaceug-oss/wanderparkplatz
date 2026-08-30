import type { Metadata } from "next";
import Link from "next/link";
import Umkreissuche from "@/components/Umkreissuche";
import { bundeslaender, topKreise, kennzahlen } from "@/lib/queries";
import { jsonLd, nf } from "@/lib/format";
import { SITE, SITE_NAME } from "@/lib/site";
import { BETREIBER } from "@/lib/betreiber";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Wanderparkplatz in meiner Nähe – Verzeichnis für Deutschland",
  description:
    "Wanderparkplatz in der Nähe finden: Ort oder Postleitzahl eingeben oder Standort freigeben — mit Wanderwegen ab dem Platz, Stellplätzen und Gebühren.",
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    frage: "Wie finde ich einen Wanderparkplatz in meiner Nähe?",
    antwort:
      "Zwei Wege führen zum Ziel: Gib oben einen Ort oder eine Postleitzahl ein, oder lass deinen Standort ermitteln. Beides zeigt die erfassten Wanderparkplätze im Umkreis von 10, 25 oder 50 Kilometern, sortiert nach Luftlinie. Wer eine Tour im Voraus plant, gibt einfach das Zielgebiet ein — der eigene Standort wird dafür nicht gebraucht.",
  },
  {
    frage: "Welche Wanderwege starten an einem Wanderparkplatz?",
    antwort:
      "Auf jeder Parkplatzseite stehen die markierten Wanderwege, die innerhalb von 200 Metern am Platz vorbeiführen — mit Name, Markierung (etwa „rote Raute\u201c) und Einordnung als örtlicher Rundweg, regionaler Wanderweg oder Fernwanderweg. Die Angaben stammen aus den Wanderrouten in OpenStreetMap; maßgeblich ist die Beschilderung vor Ort.",
  },
  {
    frage: "Sind Wanderparkplätze kostenlos?",
    antwort:
      "Die meisten Wanderparkplätze in Deutschland sind kostenfrei, besonders im Wald und an Waldrändern. In stark besuchten Regionen wie dem Alpenvorland, der Sächsischen Schweiz oder an bekannten Gipfeln erheben Kommunen und Forstbetriebe zunehmend Parkgebühren. Auf jeder Detailseite steht, was für den jeweiligen Parkplatz erfasst ist.",
  },
  {
    frage: "Darf ich auf einem Wanderparkplatz im Wohnmobil übernachten?",
    antwort:
      "Wanderparkplätze sind Parkplätze, keine Stellplätze. Übernachten ist dort in aller Regel nicht erlaubt; erlaubt ist meist nur die einmalige Übernachtung zur Wiederherstellung der Fahrtüchtigkeit, sofern kein Verbotsschild steht. In Naturschutzgebieten und Nationalparks gilt fast immer ein ausdrückliches Verbot. Achte auf die Beschilderung vor Ort.",
  },
  {
    frage: "Woher stammen die Daten?",
    antwort:
      "Alle Standorte und Merkmale stammen aus OpenStreetMap und stehen unter der ODbL-Lizenz. Angaben zu Gebühren, Kapazität und Zufahrt sind ehrenamtlich erfasst und können veralten — die Beschilderung vor Ort ist immer maßgeblich.",
  },
  {
    frage: "Was unterscheidet einen Wanderparkplatz von einem normalen Parkplatz?",
    antwort:
      "Ein Wanderparkplatz ist ein ausgewiesener Ausgangspunkt für Wanderungen: Er liegt an einem markierten Wanderweg, ist oft mit einer Infotafel oder Wanderkarte versehen und meist unbefestigt. Im Verzeichnis sind ausschließlich Parkplätze erfasst, die in OpenStreetMap ausdrücklich als Wanderparkplatz ausgewiesen sind.",
  },
];

export default async function Startseite() {
  const [laender, kreise, zahlen] = await Promise.all([
    bundeslaender(),
    topKreise(24),
    kennzahlen(),
  ]);

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

      <section className="mx-auto max-w-5xl px-4 pt-12 pb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Wanderparkplatz in meiner Nähe
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          {nf.format(zahlen.gesamt)} ausgewiesene Wanderparkplätze in Deutschland — mit den
          Wanderwegen, die dort vorbeiführen, samt Stellplatzzahl, Gebühren und Untergrund.
          Ort eingeben oder Standort freigeben.
        </p>

        <div className="mt-8">
          <Umkreissuche />
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Wanderparkplätze", nf.format(zahlen.gesamt)],
            ["davon kostenfrei erfasst", nf.format(zahlen.kostenfrei)],
            ["Landkreise", nf.format(zahlen.kreise)],
            ["Orte", nf.format(zahlen.orte)],
          ].map(([label, wert]) => (
            <div key={label} className="rounded-lg border border-line bg-card p-4">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{wert}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Wanderparkplätze nach Bundesland</h2>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Regionen mit den meisten Wanderparkplätzen</h2>
        <p className="mt-2 text-muted">
          Landkreise, in denen besonders viele Ausgangspunkte erfasst sind.
        </p>
        <ul className="mt-5 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {kreise.map((k) => (
            <li key={k.slug} className="flex items-baseline justify-between gap-2 border-b border-line py-2">
              <Link href={`/kreis/${k.slug}`} className="truncate hover:text-accent">
                {k.name}
                <span className="ml-1 text-sm text-muted">{k.bl_name}</span>
              </Link>
              <span className="shrink-0 text-sm tabular-nums text-muted">{k.poi_count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Häufige Fragen zu Wanderparkplätzen</h2>
        <div className="mt-5 divide-y divide-line">
          {FAQ.map((f) => (
            <details key={f.frage} className="group py-4">
              <summary className="cursor-pointer font-medium marker:text-accent">
                {f.frage}
              </summary>
              <p className="mt-3 text-muted">{f.antwort}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
