import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Packliste from "@/components/ausruestung/Packliste";
import { Kapitel, Merksatz, Kartenraster } from "@/components/ausruestung/Bausteine";
import { WINTERLISTE, QUELLEN_HUB } from "@/lib/ausruestung/packliste";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { hoheGipfel } from "@/lib/db";
import { jsonLd, nf } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";

/* Täglich: Die Seite verweist auf Vergleiche, die zeitgesteuert erscheinen. */
export const revalidate = 86400;

const PFAD = "/ausruestung/winterwandern";

export const metadata: Metadata = {
  title: titel("Winterwandern: Ausrüstung nach dem Alpenverein"),
  description: beschreibung(
    "Was sich im Winter ändert: Grödel gegen Vereisung, Gamaschen gegen Schnee, Zeitpuffer bis zur Dunkelheit — die Winterausrüstung nach dem Alpenverein, mit Liste zum Abhaken.",
  ),
  alternates: { canonical: PFAD },
};

const FRAGEN = [
  {
    frage: "Welche Ausrüstung brauche ich zum Winterwandern?",
    antwort:
      "Der Deutsche Alpenverein nennt über die Standardausrüstung mit Biwaksack und Erste-Hilfe-Set hinaus: Wanderstöcke, Grödel oder Spikes (alternativ Leichtsteigeisen), Gamaschen, Mütze, Handschuhe, eine isolierende Bekleidungsschicht und eine Thermoskanne mit heißem Getränk. Eine Stirn- oder Taschenlampe muss ebenfalls mit.",
  },
  {
    frage: "Wie viel Zeitpuffer brauche ich im Winter?",
    antwort:
      "Ein bis zwei Stunden bis zum Einbruch der Dunkelheit, rät der DAV. Probleme mit Gelände und Orientierung oder das An- und Ablegen von Grödeln und Gamaschen verzögern den Zeitplan deutlich.",
  },
  {
    frage: "Wann brauche ich Lawinenausrüstung?",
    antwort:
      "Sobald längere, durchgängige Schneehänge begangen werden. Dann sind LVS-Gerät, Schaufel und Sonde nötig — und die Kompetenz, Lawinenlagebericht und Gelände zu beurteilen. Fehlt diese Kompetenz, gilt laut DAV Verzicht. Kleine verschneite Passagen unter zehn mal zehn Metern, verschneite Forstwege oder flache Schneefelder sind dagegen in der Regel vernachlässigbar.",
  },
  {
    frage: "Was hilft gegen vereiste Wege?",
    antwort:
      "Grödel. Der DAV rät, vereiste Passagen mit Füßen oder Stöcken zu ertasten, sie am Rand zu umgehen oder bei längeren Abschnitten Grödel anzulegen. In hart gefrorenem Firn ist auf Abrutschgefahr zu achten.",
  },
];

export default async function Winterwandern() {
  const sichtbare = Array.from(
    new Set(
      WINTERLISTE.flatMap((g) => g.posten.map((p) => p.pfad)).filter(
        (p): p is string => Boolean(p) && sichtbar(p!),
      ),
    ),
  );
  const { stufen, kreise } = await hoheGipfel();
  const ab1300 = stufen.find((s) => s.schwelle === 1300);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FRAGEN.map((f) => ({
            "@type": "Question",
            name: f.frage,
            acceptedAnswer: { "@type": "Answer", text: f.antwort },
          })),
        })}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Ausrüstung", url: "/ausruestung" },
        ]}
        aktuell="Winterwandern"
      />

      <header className="mt-4 overflow-hidden rounded-3xl bg-sand px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
          Winterwandern: Was sich an der Ausrüstung ändert
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Im Winter kommt wenig dazu — aber das Wenige entscheidet. Vereiste Passagen, kurze Tage und
          Schnee, der den Weg verdeckt: Der Deutsche Alpenverein nennt dafür eine knappe Liste und
          einen Zeitpuffer von ein bis zwei Stunden bis zur Dunkelheit.
        </p>
        {ab1300 && (
          <p className="mt-4 max-w-2xl text-sm text-muted">
            In unserem Verzeichnis haben {nf.format(ab1300.plaetze)} Wanderparkplätze einen Gipfel ab
            1.300 Metern in Reichweite — verteilt auf {nf.format(kreise.length)} Landkreise.
          </p>
        )}
      </header>

      <Kapitel id="liste" titel="Die Winterausrüstung zum Abhaken" unterzeile="Nach dem Artikel „Sicher Winterwandern“ des DAV." breit>
        <Packliste sichtbare={sichtbare} liste={WINTERLISTE} ueberschrift="für die Wintertour" />
      </Kapitel>

      <Kapitel id="unterwegs" titel="Worauf es unterwegs ankommt" breit>
        <Kartenraster
          eintraege={[
            {
              titel: "Orientierung",
              text: "Schnee oder Laub verdecken den Verlauf kleiner Steige. Auf Wegzeichen achten, überlegen, wie ein logischer Verlauf aussähe — und rechtzeitig umkehren, wenn der Weg nicht mehr zu finden ist.",
            },
            {
              titel: "Vereisung",
              text: "Vereiste Passagen sind nicht immer zu erkennen. Mit Füßen oder Stöcken ertasten, am Rand umgehen, bei längeren Abschnitten Grödel anlegen.",
            },
            {
              titel: "Schnee",
              text: "Kleine verschneite Flächen unter zehn mal zehn Metern, verschneite Forstwege und flache Schneefelder sind hinsichtlich Lawinengefahr meist vernachlässigbar. Für durchgängige Hänge braucht es Notfallausrüstung und Beurteilungskompetenz — fehlt sie, gilt Verzicht.",
            },
            {
              titel: "Zeit",
              text: "Ein bis zwei Stunden Puffer bis zur Dunkelheit. Das An- und Ablegen von Grödeln und Gamaschen kostet mehr Zeit, als man denkt.",
            },
          ]}
        />
        <Merksatz>
          Südseitig und niedrig bleibt im milden Winter oft schneefrei, nordseitig und höher nicht.
          Breite, waldfreie Rücken und Grate sind laut DAV oft bis weit hinauf aper.
        </Merksatz>
      </Kapitel>

      <Kapitel id="vergleiche" titel="Die Ausrüstung dazu">
        <p>Zu den Winterpunkten, bei denen die Wahl schwerfällt, haben wir eigene Vergleiche:</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["/ausruestung/groedel", "Grödel", "Wann sie reichen und wann es Steigeisen braucht."],
            ["/ausruestung/gamaschen", "Gamaschen", "Kurz, wadenlang oder lang — und wie dicht."],
            ["/ausruestung/stirnlampe", "Stirnlampe", "Mit Rechner, wann es auf deiner Tour dunkel wird."],
            ["/ausruestung/wanderschuhe", "Wanderschuhe", "Welche Kategorie das Wintergelände verlangt."],
            ["/ausruestung/wandersocken", "Wandersocken", "Polsterung und Material für kalte Tage."],
            ["/ausruestung/regenjacke", "Regenjacke", "Die äußere Schicht über der Isolation."],
          ]
            .filter(([pfad]) => sichtbar(pfad))
            .map(([pfad, name, text]) => (
              <li key={pfad} className="rounded-xl border border-line bg-card p-4">
                <Link href={pfad} className="font-semibold hover:text-accent">
                  {name}
                </Link>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
        </ul>
      </Kapitel>

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

      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Ausrüstung, Zeitpuffer und die Hinweise zu Orientierung, Vereisung und Schnee stammen aus
          dem Artikel{" "}
          <a href={QUELLEN_HUB.davWinter} className="underline hover:text-accent" rel="noopener" target="_blank">
            Sicher Winterwandern
          </a>{" "}
          des Deutschen Alpenvereins (DAV Panorama 1/2026, Text: Max Bolland). Die Zahl der
          Parkplätze mit hohen Gipfeln in Reichweite kommt aus unserem eigenen Bestand. Diese Seite
          enthält keine Partnerverweise; die stehen auf den verlinkten Vergleichen.
        </p>
      </Kapitel>
    </div>
  );
}
