import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Packliste from "@/components/ausruestung/Packliste";
import { PACKLISTE, PACKEN, QUELLEN } from "@/lib/ausruestung/packliste";
import { titel, beschreibung } from "@/lib/meta";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { jsonLd } from "@/lib/format";
import { SITE } from "@/lib/site";

/* Stündlich, damit zeitgesteuert freigegebene Seiten ohne neues Deployment erscheinen. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: titel("Wanderausrüstung: Packliste und Vergleiche mit Schwächen"),
  description: beschreibung(
    "Was auf eine Wanderung mitmuss — Packliste nach dem Alpenverein zum Abhaken, dazu Kaufberatungen, die zu jedem Produkt sagen, wogegen es spricht.",
  ),
  alternates: { canonical: "/ausruestung" },
};

/**
 * Übersicht der Ausrüstungsvergleiche.
 *
 * Bewusst getrennt vom Verzeichnis: Die Parkplatz-, Orts- und Kreisseiten
 * tragen keine Partnerverweise. Verlinkt wird von hier ins Verzeichnis, nicht
 * umgekehrt.
 */
const SEITEN = [
  {
    pfad: "/ausruestung/wanderschuhe",
    titel: "Wanderschuhe",
    text: "Welche Kategorie zu deinem Gelände passt, was zwei Tests über die Dichtigkeit zeigen, Anprobe, breite Füße, PFAS, und sechs Schuhe für Damen und Herren.",
  },
  {
    pfad: "/ausruestung/regenjacke",
    titel: "Regenjacke",
    text: "Was der Saldo-Test über dichte Nähte und das Waschen zeigte, Wassersäule, Belüftung, Größe, PFC-frei, und sechs Jacken für Damen und Herren.",
  },
  {
    pfad: "/ausruestung/regenhose",
    titel: "Regenhose",
    text: "Wie viel Wassersäule wirklich nötig ist, warum Knien mehr Druck macht als Regen, Seitenreißverschluss, Pflege, und sechs Hosen für Damen und Herren.",
  },
  {
    pfad: "/ausruestung/schuhe-impraegnieren",
    titel: "Schuhe imprägnieren",
    text: "Wachs oder Spray je nach Leder, was Gore-Tex-Schuhe brauchen, was die Stiftung Warentest fand, sicher sprühen, und sieben Mittel.",
  },
  {
    pfad: "/ausruestung/wandersocken",
    titel: "Wandersocken",
    text: "Welche Polsterung zu welchem Schuh, Merino oder Kunstfaser, die richtige Größe, Blasen vermeiden, und sechs Socken für Damen und Herren.",
  },
  {
    pfad: "/ausruestung/wasserfilter",
    titel: "Wasserfilter",
    text: "Was ein Outdoor-Filter zurückhält und was nicht, Filter, Tabletten oder Abkochen, Frost, und acht Lösungen von Katadyn bis LifeStraw.",
  },
  {
    pfad: "/ausruestung/gamaschen",
    titel: "Gamaschen",
    text: "Kurz, wadenlang oder lang, dicht oder atmungsaktiv, die richtige Größe, was das RKI zu Zecken sagt, und sechs Gamaschen.",
  },
  {
    pfad: "/ausruestung/stirnlampe",
    titel: "Stirnlampe",
    text: "Was Lumen, Leuchtweite und Leuchtdauer wirklich bedeuten, wann es auf deiner Tour dunkel wird, und sieben Stirnlampen von Petzl bis Ledlenser.",
  },
  {
    pfad: "/ausruestung/erste-hilfe-set",
    titel: "Erste-Hilfe-Set",
    text: "Was laut Alpenverein hineingehört, welche Größe, welche Seite der Rettungsdecke nach außen, und sieben Sets an der DAV-Liste gemessen.",
  },
  {
    pfad: "/ausruestung/huettenschlafsack",
    titel: "Hüttenschlafsack",
    text: "Warum er auf Alpenvereinshütten Pflicht ist, Seide, Baumwolle oder Mikrofaser, was Bettwanzen und die Mikrowelle damit zu tun haben, und sieben Modelle.",
  },
  {
    pfad: "/ausruestung/groedel",
    titel: "Grödel",
    text: "Wann Grödel reichen und wann es Steigeisen braucht, welche Größe passt, und sechs Grödel von Snowline bis Kahtoola.",
  },
  {
    pfad: "/ausruestung/wanderrucksack",
    titel: "Wanderrucksack",
    text: "Wie viel Liter du brauchst, wie du die Rückenlänge misst, Damen oder Herren, und sieben Rucksäcke von Deuter, Vaude und Osprey.",
  },
  {
    pfad: "/ausruestung/wanderstoecke",
    titel: "Wanderstöcke",
    text: "Die richtige Länge nach Körpergröße, warum der Verschluss wichtiger ist als das Material, und sechs Stöcke vom Einstieg bis zum Warentest-Sieger.",
  },
  {
    pfad: "/ausruestung/trinkblase",
    titel: "Trinkblase",
    text: "Wie viel Wasser du brauchst, warum die Öffnung über die Reinigung entscheidet, und sechs Trinkblasen von Deuter bis CamelBak.",
  },
];

const GRUPPEN: { titel: string; text: string; pfade: string[] }[] = [
  {
    titel: "Regen und Wetter",
    text: "Was dich trocken hält — und was die Tests darüber sagen.",
    pfade: ["/ausruestung/regenjacke", "/ausruestung/regenhose", "/ausruestung/gamaschen"],
  },
  {
    titel: "Füße",
    text: "Der häufigste Grund, eine Tour abzubrechen, sitzt im Schuh.",
    pfade: ["/ausruestung/wanderschuhe", "/ausruestung/wandersocken", "/ausruestung/schuhe-impraegnieren", "/ausruestung/groedel"],
  },
  {
    titel: "Tragen und trinken",
    text: "Rucksack, Wasser, Stöcke.",
    pfade: ["/ausruestung/wanderrucksack", "/ausruestung/trinkblase", "/ausruestung/wasserfilter", "/ausruestung/wanderstoecke"],
  },
  {
    titel: "Sicherheit und Übernachtung",
    text: "Wenn es dunkel wird, etwas passiert oder du auf der Hütte bleibst.",
    pfade: ["/ausruestung/stirnlampe", "/ausruestung/erste-hilfe-set", "/ausruestung/huettenschlafsack"],
  },
];

export default function Ausruestung() {
  const frei = SEITEN.filter((s) => sichtbar(s.pfad));
  const nach = (pfad: string) => frei.find((s) => s.pfad === pfad);
  const sichtbare = Array.from(
    new Set(PACKLISTE.flatMap((g) => g.posten.map((p) => p.pfad)).filter((p): p is string => Boolean(p) && sichtbar(p!))),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Wanderausrüstung",
            url: `${SITE}/ausruestung`,
            inLanguage: "de-DE",
            isAccessibleForFree: true,
            hasPart: frei.map((s) => ({
              "@type": "Article",
              headline: s.titel,
              url: `${SITE}${s.pfad}`,
            })),
          },
        ])}
      />

      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Ausrüstung" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Wanderausrüstung</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed">
        Zwei Dinge stehen hier: eine Packliste zum Abhaken, die auf der Liste des Deutschen
        Alpenvereins beruht, und {frei.length} Kaufberatungen. Die Beratungen nennen zu jedem Produkt
        auch, wogegen es spricht und wer es nicht kaufen sollte — mit einer Quelle für jede Angabe.
      </p>

      <h2 id="packliste" className="mt-12 scroll-mt-6 text-2xl font-bold tracking-tight">
        Packliste zum Abhaken
      </h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-muted">
        Der{" "}
        <a
          href={QUELLEN.davPackliste}
          className="underline hover:text-accent"
          rel="noopener"
          target="_blank"
        >
          Deutsche Alpenverein
        </a>{" "}
        hat für Frühjahrstouren eine Packliste veröffentlicht. Sie ist die Grundlage dieser Liste;
        was für Hütten- und Wintertouren dazukommt, ist als Ergänzung markiert.
      </p>
      <div className="mt-5">
        <Packliste sichtbare={sichtbare} />
      </div>

      <h2 id="packen" className="mt-12 scroll-mt-6 text-2xl font-bold tracking-tight">
        Den Rucksack richtig packen
      </h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-muted">
        Ein schlecht gepackter Rucksack drückt auf den Rücken und zieht nach hinten, schreibt der
        DAV. Seine Regeln, von unten nach oben:
      </p>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2">
        {PACKEN.map((p, i) => (
          <li key={p.titel} className="rounded-xl border border-line bg-card p-5">
            <span className="text-sm font-semibold text-accent">Schritt {i + 1}</span>
            <h3 className="mt-1 font-semibold">{p.titel}</h3>
            <p className="mt-1 leading-relaxed text-muted">{p.text}</p>
          </li>
        ))}
      </ol>

      <h2 id="vergleiche" className="mt-12 scroll-mt-6 text-2xl font-bold tracking-tight">
        Die Kaufberatungen
      </h2>
      {GRUPPEN.map((g) => {
        const seiten = g.pfade.map(nach).filter((s): s is (typeof SEITEN)[number] => Boolean(s));
        if (seiten.length === 0) return null;
        return (
          <section key={g.titel} className="mt-8">
            <h3 className="text-xl font-semibold">{g.titel}</h3>
            <p className="mt-1 text-muted">{g.text}</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {seiten.map((s) => (
                <li key={s.pfad} className="rounded-xl border border-line bg-card p-5">
                  <Link href={s.pfad} className="text-lg font-semibold hover:text-accent">
                    {s.titel}
                  </Link>
                  <p className="mt-1 leading-relaxed text-muted">{s.text}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <h2 id="methode" className="mt-12 scroll-mt-6 text-2xl font-bold tracking-tight">
        Wie diese Seiten entstehen
      </h2>
      <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-muted">
        <li>
          Jede technische Angabe stammt aus der Produktbeschreibung des Herstellers oder von seiner
          Website und ist als solche gekennzeichnet.
        </li>
        <li>
          Wo es Tests gibt — Stiftung Warentest, Alpenverein, Behörden —, stehen deren Ergebnisse
          mit Datum und Link dabei.
        </li>
        <li>
          Zu jedem Produkt steht, wogegen es spricht und für wen es nicht taugt. Fehlt eine Angabe
          beim Hersteller, steht „k. A.“ statt einer Zahl aus zweiter Hand.
        </li>
        <li>
          Preise kommen stündlich von Amazon; Verweise dorthin sind Anzeigen mit Partnerkennung und
          als solche gekennzeichnet.
        </li>
      </ul>
      <p className="mt-6 max-w-3xl text-sm text-muted">
        Quellen dieser Seite:{" "}
        <a href={QUELLEN.davPackliste} className="underline hover:text-accent" rel="noopener" target="_blank">
          DAV-Packliste für Wanderungen
        </a>{" "}
        und{" "}
        <a href={QUELLEN.davOutfit} className="underline hover:text-accent" rel="noopener" target="_blank">
          Das richtige Wanderoutfit
        </a>
        .
      </p>
    </div>
  );
}
