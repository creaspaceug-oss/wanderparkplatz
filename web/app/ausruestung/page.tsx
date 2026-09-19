import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import { titel, beschreibung } from "@/lib/meta";

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
        Kaufberatungen, die zu jedem Produkt sagen, wogegen es spricht. Getestet haben wir
        nichts davon selbst, und das steht auf jeder Seite dabei.
      </p>
      <ul className="mt-8 space-y-4">
        {SEITEN.map((s) => (
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
