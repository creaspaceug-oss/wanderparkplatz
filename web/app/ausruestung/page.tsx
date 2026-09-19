import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import { titel, beschreibung } from "@/lib/meta";
import { sichtbar } from "@/lib/ausruestung/freigabe";

/* Stündlich, damit zeitgesteuert freigegebene Seiten ohne neues Deployment erscheinen. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: titel("Wanderausrüstung: Vergleiche mit Schwächen"),
  description: beschreibung(
    "Kaufberatungen zur Wanderausrüstung, die sagen, wogegen ein Produkt spricht und wer es nicht kaufen sollte.",
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

export default function Ausruestung() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Ausrüstung" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Ausrüstung</h1>
      <p className="mt-5 text-lg leading-relaxed">
        Kaufberatungen, die zu jedem Produkt sagen, wogegen es spricht — mit Quellen für jede Angabe.
      </p>
      <ul className="mt-8 space-y-4">
        {SEITEN.filter((s) => sichtbar(s.pfad)).map((s) => (
          <li key={s.pfad} className="rounded-xl border border-line bg-card p-5">
            <Link href={s.pfad} className="text-lg font-semibold hover:text-accent">
              {s.titel}
            </Link>
            <p className="mt-1 leading-relaxed text-muted">{s.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Verweise zu Amazon auf diesen Seiten sind Anzeigen mit Partnerkennung und als solche
        gekennzeichnet.
      </p>
    </div>
  );
}
