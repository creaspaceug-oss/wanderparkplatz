import { nf } from "@/lib/format";

/**
 * Säulenbild als SVG, serverseitig gezeichnet.
 *
 * Keine Diagrammbibliothek: Das hier sind sechs Rechtecke. Eine Bibliothek
 * kostete mehr JavaScript als die ganze Seite wiegt und brächte nichts, was
 * ein Pfad nicht kann.
 *
 * Farben kommen aus den Stilvariablen, damit das Bild im hellen wie im
 * dunklen Erscheinungsbild lesbar bleibt. Die Werte stehen zusätzlich als
 * Text unter dem Bild — ein Bild allein ist weder vorlesbar noch zitierbar.
 */
export default function Saeulen({
  daten,
  einheit = "",
  nachkomma,
}: {
  daten: { beschriftung: string; wert: number }[];
  einheit?: string;
  /**
   * Feste Nachkommastellen für die Werte über den Säulen. Ohne diese Angabe
   * kürzt die Zahlformatierung "10,0" zu "10" — neben "6,1" und "22,5" sieht
   * das nach Versehen aus.
   */
  nachkomma?: number;
}) {
  if (!daten.length) return null;

  const hoechster = Math.max(...daten.map((d) => d.wert));
  const zahl = (v: number) =>
    nachkomma == null
      ? nf.format(v)
      : v.toLocaleString("de-DE", {
          minimumFractionDigits: nachkomma,
          maximumFractionDigits: nachkomma,
        });
  const B = 100; // Breite je Säule im Koordinatensystem
  const H = 220; // Höhe der Zeichenfläche
  const breite = daten.length * B;

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${breite} ${H + 56}`}
        className="w-full"
        role="img"
        aria-label={`Säulenbild: ${daten.map((d) => `${d.beschriftung} ${zahl(d.wert)}`).join(", ")}`}
      >
        {daten.map((d, i) => {
          const h = Math.round((d.wert / hoechster) * H);
          const x = i * B;
          return (
            <g key={d.beschriftung}>
              <rect
                x={x + 10}
                y={H - h}
                width={B - 20}
                height={h}
                rx="3"
                className="fill-[var(--accent)]"
              />
              <text
                x={x + B / 2}
                y={H - h - 8}
                textAnchor="middle"
                className="fill-[var(--foreground)] text-[13px] font-medium"
              >
                {zahl(d.wert)}
              </text>
              <text
                x={x + B / 2}
                y={H + 22}
                textAnchor="middle"
                className="fill-[var(--muted)] text-[12px]"
              >
                {d.beschriftung}
              </text>
            </g>
          );
        })}
        <line x1="0" y1={H} x2={breite} y2={H} className="stroke-[var(--line)]" strokeWidth="1" />
      </svg>
      {einheit && <figcaption className="mt-1 text-sm text-muted">{einheit}</figcaption>}
    </figure>
  );
}
