import type { Metadata } from "next";
import Link from "next/link";
import Suche from "@/components/Suche";
import { suche, PFAD } from "@/lib/db";
import { suchform } from "@/lib/suchform";

// Ergebnisseiten gehören nicht in den Index — sie erzeugen beliebig viele
// URLs mit dünnem, austauschbarem Inhalt.
export const metadata: Metadata = {
  title: "Wanderparkplatz suchen – Ort, Landkreis oder Name",
  description:
    "Wanderparkplätze, Orte und Landkreise durchsuchen. Tippfehler werden toleriert, die ersten Buchstaben genügen.",
  robots: { index: false, follow: true },
  // Eigenes Canonical: sonst erbt die Seite das des Layouts und behauptete,
  // die Startseite zu sein — im Widerspruch zum noindex.
  alternates: { canonical: "/suche" },
};

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  parkplatz: "Wanderparkplatz",
  ort: "Ort",
  kreis: "Landkreis",
  bundesland: "Bundesland",
};

export default async function SuchSeite({ searchParams }: PageProps<"/suche">) {
  const { q } = await searchParams;
  const roh = typeof q === "string" ? q : "";
  const norm = suchform(roh).slice(0, 60);
  const treffer = norm.length >= 2 ? await suche(norm, 40) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Suche</h1>
      <div className="mt-6">
        <Suche autoFokus />
      </div>

      {roh && (
        <p className="mt-6 text-muted">
          {treffer.length === 0
            ? `Keine Treffer für „${roh}".`
            : `${treffer.length} Treffer für „${roh}"`}
        </p>
      )}

      {treffer.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {treffer.map((t) => (
            <li key={`${t.typ}-${t.slug}`} className="py-3">
              <Link href={`${PFAD[t.typ]}/${t.slug}`} className="font-medium hover:text-accent">
                {t.titel}
              </Link>
              <p className="mt-0.5 text-sm text-muted">
                {LABEL[t.typ]}
                {t.untertitel && ` · ${t.untertitel}`}
              </p>
            </li>
          ))}
        </ul>
      )}

      {roh && treffer.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          Tipp: Es reichen die ersten Buchstaben, und Tippfehler werden toleriert. Alternativ
          über <Link href="/bundeslaender" className="text-accent underline">die Bundesländer</Link>{" "}
          einsteigen.
        </p>
      )}
    </div>
  );
}
