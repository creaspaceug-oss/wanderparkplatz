import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import { trailSeiten } from "@/lib/db";
import { nf } from "@/lib/format";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Wanderwege mit Parkplätzen am Weg",
  description:
    "Fernwanderwege und regionale Wanderwege in Deutschland — mit den Wanderparkplätzen, die unmittelbar am Wegverlauf liegen.",
  alternates: { canonical: "/wanderwege" },
};

const NETZ_TITEL: Record<string, string> = {
  iwn: "Internationale Fernwanderwege",
  nwn: "Nationale Fernwanderwege",
  rwn: "Regionale Wanderwege",
  lwn: "Örtliche Wanderwege",
};

const km = (v: string | null) =>
  v ? `${Number(v).toLocaleString("de-DE", { maximumFractionDigits: 0 })} km` : null;

export default async function WanderwegeSeite() {
  const alle = await trailSeiten();

  const gruppen = ["iwn", "nwn", "rwn"].map((netz) => ({
    netz,
    wege: alle.filter((t) => t.netz === netz),
  }));
  const oertlich = alle.filter((t) => t.netz !== "iwn" && t.netz !== "nwn" && t.netz !== "rwn");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Wanderwege" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderwege mit Parkplätzen am Weg
      </h1>
      <p className="mt-4 text-lg text-muted">
        {nf.format(alle.length)} Wanderwege, an denen mindestens zwei Wanderparkplätze erfasst
        sind. Ein Weg erscheint hier, sobald über die reine Parkplatzliste hinaus etwas über
        ihn bekannt ist — eine überörtliche Einordnung oder seine Länge.
      </p>

      {gruppen.map(
        ({ netz, wege }) =>
          wege.length > 0 && (
            <section key={netz} className="mt-10">
              <h2 className="text-xl font-semibold">
                {NETZ_TITEL[netz]}{" "}
                <span className="font-normal text-muted">({nf.format(wege.length)})</span>
              </h2>
              <ul className="mt-4 divide-y divide-line">
                {wege.slice(0, netz === "rwn" ? 120 : 400).map((t) => (
                  <li key={t.slug} className="flex items-baseline justify-between gap-3 py-2.5">
                    <Link href={`/wanderweg/${t.slug}`} className="min-w-0 hover:text-accent">
                      {t.ref && (
                        <span className="mr-2 rounded border border-line px-1.5 py-0.5 text-xs tabular-nums text-muted">
                          {t.ref}
                        </span>
                      )}{" "}
                      <span className="font-medium">{t.name}</span>{" "}
                      <span className="block text-sm text-muted">
                        {[km(t.laenge_km), t.markierung].filter(Boolean).join(" · ")}
                      </span>
                    </Link>{" "}
                    <span className="shrink-0 text-sm tabular-nums text-muted">
                      {t.parkplatz_count}
                    </span>
                  </li>
                ))}
              </ul>
              {wege.length > (netz === "rwn" ? 120 : 400) && (
                <p className="mt-3 text-sm text-muted">
                  Angezeigt sind die {nf.format(netz === "rwn" ? 120 : 400)} Wege mit den
                  meisten Parkplätzen.
                </p>
              )}
            </section>
          ),
      )}

      {oertlich.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Örtliche Rundwege{" "}
            <span className="font-normal text-muted">({nf.format(oertlich.length)})</span>
          </h2>
          <p className="mt-2 text-muted">
            Kurze Runden, meist von einem einzelnen Ort oder Verein ausgeschildert. Sie stehen
            auf den Seiten der Parkplätze, an denen sie vorbeiführen.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {oertlich.slice(0, 60).map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/wanderweg/${t.slug}`}
                  className="inline-block rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-accent"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ohne diesen Weg hingen 1.170 Wegseiten intern in der Luft: Die
          Gruppen zeigen je nur die stärksten Einträge. */}
      <p className="mt-10 text-muted">
        Alle {nf.format(alle.length)} Wege nach Namen geordnet stehen im{" "}
        <Link href="/wanderwege/seite/1" className="underline hover:text-accent">
          vollständigen Verzeichnis
        </Link>
        .
      </p>
    </div>
  );
}
