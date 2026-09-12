import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Blaetterung from "@/components/Blaetterung";
import { wegeBlatt, anzahlWege } from "@/lib/db";
import { titel, beschreibung } from "@/lib/meta";
import { nf } from "@/lib/format";

export const revalidate = 604800;
export const dynamicParams = true;

const PRO_SEITE = 250;

const NETZ: Record<string, string> = {
  iwn: "internationaler Fernwanderweg",
  nwn: "nationaler Fernwanderweg",
  rwn: "regionaler Wanderweg",
  lwn: "örtlicher Wanderweg",
};

const laenge = (v: string | null) =>
  v ? `${Number(v).toLocaleString("de-DE", { maximumFractionDigits: 0 })} km` : null;

const nummer = (roh: string) => (/^\d+$/.test(roh) ? Number(roh) : 0);

export async function generateStaticParams() {
  const seiten = Math.ceil((await anzahlWege()) / PRO_SEITE);
  return Array.from({ length: seiten }, (_, i) => ({ n: String(i + 1) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/wanderwege/seite/[n]">): Promise<Metadata> {
  const { n } = await params;
  const seite = nummer(n);
  const seiten = Math.ceil((await anzahlWege()) / PRO_SEITE);
  if (seite < 1 || seite > seiten) return { title: "Seite nicht gefunden" };

  return {
    title: titel(`Wanderwege mit Parkplatz – Seite ${seite} von ${nf.format(seiten)}`),
    description: beschreibung(
      `Alle markierten Wanderwege, an denen Wanderparkplätze erfasst sind,` +
        ` alphabetisch geordnet. Seite ${seite} von ${nf.format(seiten)}.`,
    ),
    alternates: { canonical: `/wanderwege/seite/${seite}` },
  };
}

export default async function WegeBlattSeite({ params }: PageProps<"/wanderwege/seite/[n]">) {
  const { n } = await params;
  const seite = nummer(n);
  const gesamt = await anzahlWege();
  const seiten = Math.ceil(gesamt / PRO_SEITE);
  if (seite < 1 || seite > seiten) notFound();

  const wege = await wegeBlatt((seite - 1) * PRO_SEITE, PRO_SEITE);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Wanderwege", url: "/wanderwege" },
        ]}
        aktuell={`Seite ${seite}`}
      />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderwege mit Parkplatz
      </h1>
      <p className="mt-4 text-lg text-muted">
        Alle {nf.format(gesamt)} Wege mit eigener Seite, nach Namen geordnet. Seite {seite}{" "}
        von {nf.format(seiten)}.
      </p>

      <ul className="mt-8 divide-y divide-line">
        {wege.map((t) => (
          <li key={t.slug} className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="min-w-0">
              {t.ref && (
                <span className="mr-2 rounded border border-line px-1.5 py-0.5 text-xs tabular-nums text-muted">
                  {t.ref}
                </span>
              )}{" "}
              <Link href={`/wanderweg/${t.slug}`} className="font-medium hover:text-accent">
                {t.name}
              </Link>{" "}
              <span className="block text-sm text-muted">
                {[NETZ[t.netz ?? ""] ?? null, laenge(t.laenge_km), t.markierung]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>{" "}
            <span className="shrink-0 text-sm tabular-nums text-muted">
              {t.parkplatz_count}
            </span>
          </li>
        ))}
      </ul>

      <Blaetterung basis="/wanderwege/seite" seite={seite} seiten={seiten} />

      <p className="mt-6 text-sm text-muted">
        Die Zahl rechts nennt die Wanderparkplätze am Weg. Nach Einordnung geordnet stehen
        die Wege auf der{" "}
        <Link href="/wanderwege" className="underline hover:text-accent">
          Übersicht
        </Link>
        .
      </p>
    </div>
  );
}
