import Link from "next/link";
import Image from "next/image";
import type { VorzeigePlatz } from "@/lib/db";
import { urheberKurz } from "@/lib/bild";
import { gebuehrText } from "@/lib/format";

const meter = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

/**
 * Bebilderte Parkplatzkacheln.
 *
 * Das Bild zeigt ein Wanderziel in der Nähe, nicht den Parkplatz — von
 * Parkplätzen selbst gibt es keine Fotos. Die Beschriftung sagt das
 * ausdrücklich, damit niemand ein Gipfelfoto für den Platz hält.
 *
 * Urheber und Lizenz stehen gesammelt unter dem Raster: bei über fünfzig
 * Kacheln wäre eine Nachweiszeile je Bild unlesbar, weggelassen werden darf
 * sie aber nicht.
 */
export default function ParkplatzKarten({ items }: { items: VorzeigePlatz[] }) {
  if (!items.length) return null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <li key={p.slug}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card">
              <Link href={`/wanderparkplatz/${p.slug}`} className="group block">
                <span className="relative block aspect-[16/10] overflow-hidden bg-line">
                  <Image
                    src={p.bild_url}
                    alt={`${p.ziel_name} — Wanderziel nahe ${p.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                    // Ausnahmslos verzögert: dieser Abschnitt liegt immer
                    // unterhalb des sichtbaren Bereichs. Vorgeladene Bilder
                    // würden hier nur den LCP der Startseite verschlechtern.
                    loading="lazy"
                  />
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold leading-snug">
                  <Link href={`/wanderparkplatz/${p.slug}`} className="hover:text-accent">
                    {p.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {[
                    p.ort_name,
                    p.bl_name,
                    p.stellplaetze ? `${p.stellplaetze} Stellplätze` : null,
                    gebuehrText(p.gebuehr, p.gebuehr_info),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Bild zeigt{" "}
                  <Link href={`/ziel/${p.ziel_slug}`} className="underline hover:text-accent">
                    {p.ziel_name}
                  </Link>
                  , {meter(p.ziel_distanz_m)} entfernt
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Fotos der abgebildeten Wanderziele:{" "}
        {items.map((p, i) => (
          <span key={p.slug}>
            {i > 0 && " · "}
            {p.ziel_name}:{" "}
            <a href={p.bild_quelle} rel="noopener nofollow" className="underline">
              {urheberKurz(p.bild_urheber)}
            </a>
            {p.bild_lizenz ? ` (${p.bild_lizenz})` : ""}
          </span>
        ))}
        {" · Wikimedia Commons"}
      </p>
    </>
  );
}
