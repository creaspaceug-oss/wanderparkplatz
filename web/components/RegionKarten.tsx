import Link from "next/link";
import Image from "next/image";
import { nf } from "@/lib/format";
import { bilderFuer, urheberKurz } from "@/lib/bild";
import type { Wanderregion } from "@/lib/wanderregionen";

/**
 * Regionskacheln mit Bild. Wird von Startseite und Regionsübersicht genutzt.
 *
 * Die Namensnennung steht bei den Kacheln gesammelt unter dem Raster statt an
 * jedem Bild — bei zwölf Kacheln nebeneinander wäre eine Zeile je Bild
 * unlesbar. Urheber und Lizenz bleiben damit vollständig genannt, wie es
 * CC BY-SA verlangt.
 */
export default async function RegionKarten({
  regionen,
  max,
  // Nur setzen, wo die Kacheln tatsächlich oben auf der Seite stehen.
  // Auf der Startseite folgen sie weiter unten und dürfen nicht vorladen.
  obenAufDerSeite = false,
}: {
  regionen: (Wanderregion & { bestand: number })[];
  max?: number;
  obenAufDerSeite?: boolean;
}) {
  const sichtbar = max ? regionen.slice(0, max) : regionen;
  const bilder = await bilderFuer(sichtbar.map((r) => r.wikidata));
  const mitBild = sichtbar.filter((r) => bilder.has(r.wikidata));

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sichtbar.map((r, i) => {
          const b = bilder.get(r.wikidata);
          return (
            <li key={r.slug}>
              <Link
                href={`/region/${r.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card transition hover:border-accent"
              >
                {b && (
                  <span className="relative block aspect-[16/10] overflow-hidden bg-line">
                    <Image
                      src={b.url}
                      alt={`Landschaft im ${r.name}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                      priority={obenAufDerSeite && i < 3}
                      loading={obenAufDerSeite && i < 3 ? undefined : "lazy"}
                    />
                  </span>
                )}
                <span className="flex flex-1 flex-col p-4">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{r.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-muted">
                      {nf.format(r.bestand)}
                    </span>
                  </span>
                  <span className="mt-1 text-sm text-muted">{r.kurz}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {mitBild.length > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Fotos:{" "}
          {mitBild.map((r, i) => {
            const b = bilders(bilder, r.wikidata);
            return (
              <span key={r.slug}>
                {i > 0 && " · "}
                {r.name}:{" "}
                <a href={b.quelle_url} rel="noopener nofollow" className="underline">
                  {urheberKurz(b.urheber)}
                </a>
                {b.lizenz ? ` (${b.lizenz})` : ""}
              </span>
            );
          })}
          {" · Wikimedia Commons"}
        </p>
      )}
    </>
  );
}

/** Hilfsgriff, damit TypeScript den Zugriff nach dem filter() akzeptiert. */
function bilders(m: Awaited<ReturnType<typeof bilderFuer>>, id: string) {
  return m.get(id)!;
}
