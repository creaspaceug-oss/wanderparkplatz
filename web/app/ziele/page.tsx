import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import { zielSeiten } from "@/lib/db";
import { ZIELART } from "@/lib/zielart";
import { nf } from "@/lib/format";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Wanderziele mit Parkplatz",
  description:
    "Gipfel, Burgen, Wasserfälle, Höhlen und Aussichtstürme in Deutschland — mit den Wanderparkplätzen, von denen aus sie erreichbar sind.",
  alternates: { canonical: "/ziele" },
};

const REIHENFOLGE = ["gipfel", "burg", "wasserfall", "turm", "hoehle", "aussicht"];

export default async function ZieleSeite() {
  const alle = await zielSeiten();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Wanderziele" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Wanderziele mit Parkplatz</h1>
      <p className="mt-4 text-lg text-muted">
        {nf.format(alle.length)} Ziele, für die mindestens zwei Wanderparkplätze als
        Ausgangspunkt erfasst sind. Gezählt wird die Luftlinie: bis zu fünf Kilometer bei
        Gipfeln, weniger bei Burgen und Aussichtspunkten.
      </p>

      {REIHENFOLGE.map((art) => {
        const gruppe = alle.filter((z) => z.art === art);
        if (!gruppe.length) return null;
        return (
          <section key={art} className="mt-10">
            <h2 className="text-xl font-semibold">
              {ZIELART[art]?.plural ?? art}{" "}
              <span className="font-normal text-muted">({nf.format(gruppe.length)})</span>
            </h2>
            <ul className="mt-4 divide-y divide-line">
              {gruppe.slice(0, 150).map((z) => (
                <li key={z.slug} className="flex items-baseline justify-between gap-3 py-2.5">
                  <Link href={`/ziel/${z.slug}`} className="min-w-0 hover:text-accent">
                    <span className="font-medium">{z.name}</span>{" "}
                    <span className="block text-sm text-muted">
                      {[z.hoehe_m ? `${nf.format(z.hoehe_m)} m` : null, z.bl_name]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </Link>{" "}
                  <span className="shrink-0 text-sm tabular-nums text-muted">
                    {z.parkplatz_count}
                  </span>
                </li>
              ))}
            </ul>
            {gruppe.length > 150 && (
              <p className="mt-3 text-sm text-muted">
                Angezeigt sind die 150 Ziele mit den meisten Parkplätzen. Alle{" "}
                {nf.format(gruppe.length)} stehen im{" "}
                <Link href="/ziele/seite/1" className="underline hover:text-accent">
                  vollständigen Verzeichnis
                </Link>
                .
              </p>
            )}
          </section>
        );
      })}

      {/* Ohne diesen Weg hingen 6.295 Zielseiten intern in der Luft: Die
          Gruppen zeigen je nur die stärksten 150 Einträge. */}
      <p className="mt-10 text-muted">
        Alle {nf.format(alle.length)} Ziele nach Namen geordnet stehen im{" "}
        <Link href="/ziele/seite/1" className="underline hover:text-accent">
          vollständigen Verzeichnis
        </Link>
        .
      </p>
    </div>
  );
}
