import Link from "next/link";
import { nf } from "@/lib/format";

/**
 * Hinweis auf die Auswertung "Wandern ohne Auto", mit der Zahl der Region.
 *
 * Ein Verweis, der eine eigene Aussage trägt, statt nur zu verlinken: Wer auf
 * einer Kreisseite liest, dass hier zwei Drittel der Ausgangspunkte eine
 * Haltestelle haben, hat schon etwas gelernt, bevor er klickt.
 *
 * Ohne belastbare Zahl erscheint nichts. Unter zehn Plätzen ist ein Anteil
 * eine Zufallszahl, und ein Kreis ohne jede Haltestelle braucht keinen
 * Aufhänger zum Weiterlesen.
 */
export default function OhneAuto({
  daten,
  region,
}: {
  daten: { plaetze: number; mit: number; prozent: string; median: number | null };
  /** Wie die Region im Satz steht, etwa "im Landkreis Reutlingen". */
  region: string;
}) {
  if (!daten || daten.plaetze < 10 || daten.mit === 0) return null;

  return (
    <section className="rounded-xl border border-line bg-accent-soft p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Hinkommen ohne Auto</h2>
      <p className="mt-2 leading-relaxed">
        {`An ${nf.format(daten.mit)} der ${nf.format(daten.plaetze)} Wanderparkplätze ${region} liegt eine Haltestelle in Laufweite, das sind ${daten.prozent} Prozent.` +
          (daten.median != null
            ? ` Im Mittel sind es ${nf.format(daten.median)} Meter bis dorthin.`
            : "")}
      </p>
      <p className="mt-3 text-sm text-muted">
        Aus unserer Auswertung{" "}
        <Link href="/wandern-ohne-auto" className="underline hover:text-accent">
          Wandern ohne Auto
        </Link>
        , die alle Bundesländer und Landkreise vergleicht. Die Zahl belegt, dass eine
        Haltestelle existiert, nicht wie oft dort ein Bus fährt.
      </p>
    </section>
  );
}
