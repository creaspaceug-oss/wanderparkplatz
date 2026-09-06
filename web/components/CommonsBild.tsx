import Image from "next/image";
import type { Bild } from "@/lib/bild";
import { urheberKurz } from "@/lib/bild";

/**
 * Bild aus Wikimedia Commons samt Namensnennung.
 *
 * Die Nennung ist keine Höflichkeit: Die meisten Dateien stehen unter CC BY
 * oder CC BY-SA und dürfen ohne Urheber, Lizenz und Verweis auf die Quelle
 * nicht verwendet werden. Deshalb steht die Zeile fest im Bauteil und lässt
 * sich nicht abschalten.
 */
export default function CommonsBild({
  bild,
  alt,
  breite = 800,
  hoehe = 450,
  prioritaet = false,
  klasse = "",
}: {
  bild: Bild;
  alt: string;
  breite?: number;
  hoehe?: number;
  prioritaet?: boolean;
  klasse?: string;
}) {
  return (
    <figure className={klasse}>
      <div
        className="relative overflow-hidden rounded-xl border border-line bg-card"
        style={{ aspectRatio: `${breite} / ${hoehe}` }}
      >
        <Image
          src={bild.url}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority={prioritaet}
        />
      </div>
      <figcaption className="mt-1.5 text-xs text-muted">
        Foto:{" "}
        <a href={bild.quelle_url} rel="noopener nofollow" className="underline hover:text-accent">
          {urheberKurz(bild.urheber)}
        </a>
        {bild.lizenz && (
          <>
            {", "}
            {bild.lizenz_url ? (
              <a
                href={bild.lizenz_url}
                rel="noopener nofollow license"
                className="underline hover:text-accent"
              >
                {bild.lizenz}
              </a>
            ) : (
              bild.lizenz
            )}
          </>
        )}
        {" · Wikimedia Commons"}
      </figcaption>
    </figure>
  );
}
