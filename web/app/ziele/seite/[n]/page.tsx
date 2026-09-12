import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import Blaetterung from "@/components/Blaetterung";
import { zieleBlatt, anzahlZiele } from "@/lib/db";
import { zielTitel } from "@/lib/zielart";
import { titel, beschreibung } from "@/lib/meta";
import { nf } from "@/lib/format";

export const revalidate = 604800;
export const dynamicParams = true;

/** Genug, um die Seitenzahl klein zu halten, wenig genug für 60 kB HTML. */
const PRO_SEITE = 250;

const nummer = (roh: string) => (/^\d+$/.test(roh) ? Number(roh) : 0);

export async function generateStaticParams() {
  const seiten = Math.ceil((await anzahlZiele()) / PRO_SEITE);
  return Array.from({ length: seiten }, (_, i) => ({ n: String(i + 1) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/ziele/seite/[n]">): Promise<Metadata> {
  const { n } = await params;
  const seite = nummer(n);
  const seiten = Math.ceil((await anzahlZiele()) / PRO_SEITE);
  if (seite < 1 || seite > seiten) return { title: "Seite nicht gefunden" };

  return {
    title: titel(`Wanderziele mit Parkplatz – Seite ${seite} von ${nf.format(seiten)}`),
    description: beschreibung(
      `Alle Gipfel, Burgen, Wasserfälle, Höhlen und Aussichtstürme mit Wanderparkplatz,` +
        ` alphabetisch geordnet. Seite ${seite} von ${nf.format(seiten)}.`,
    ),
    alternates: { canonical: `/ziele/seite/${seite}` },
  };
}

export default async function ZieleBlattSeite({ params }: PageProps<"/ziele/seite/[n]">) {
  const { n } = await params;
  const seite = nummer(n);
  const gesamt = await anzahlZiele();
  const seiten = Math.ceil(gesamt / PRO_SEITE);
  if (seite < 1 || seite > seiten) notFound();

  const ziele = await zieleBlatt((seite - 1) * PRO_SEITE, PRO_SEITE);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Wanderziele", url: "/ziele" },
        ]}
        aktuell={`Seite ${seite}`}
      />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderziele mit Parkplatz
      </h1>
      <p className="mt-4 text-lg text-muted">
        Alle {nf.format(gesamt)} Ziele mit eigener Seite, nach Namen geordnet. Seite{" "}
        {seite} von {nf.format(seiten)}.
      </p>

      <ul className="mt-8 divide-y divide-line">
        {ziele.map((z) => (
          <li key={z.slug} className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="min-w-0">
              <Link href={`/ziel/${z.slug}`} className="font-medium hover:text-accent">
                {z.name}
              </Link>{" "}
              <span className="block text-sm text-muted">
                {[zielTitel(z.art), z.hoehe_m ? `${nf.format(z.hoehe_m)} m` : null, z.bl_name]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>{" "}
            <span className="shrink-0 text-sm tabular-nums text-muted">
              {z.parkplatz_count}
            </span>
          </li>
        ))}
      </ul>

      <Blaetterung basis="/ziele/seite" seite={seite} seiten={seiten} />

      <p className="mt-6 text-sm text-muted">
        Die Zahl rechts nennt die erfassten Wanderparkplätze, von denen aus das Ziel
        erreichbar ist. Nach Art geordnet stehen die Ziele auf der{" "}
        <Link href="/ziele" className="underline hover:text-accent">
          Übersicht
        </Link>
        .
      </p>
    </div>
  );
}
