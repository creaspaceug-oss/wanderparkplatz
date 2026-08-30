import type { Metadata } from "next";
import RegionListe from "@/components/RegionListe";
import Brotkrumen from "@/components/Brotkrumen";
import { bundeslaender, topKreise, kennzahlen } from "@/lib/queries";
import { nf } from "@/lib/format";

export const revalidate = 604800;

export const metadata: Metadata = {
  title: "Wanderparkplätze nach Bundesland – Überblick",
  description:
    "Alle Bundesländer im Überblick: Wie viele Wanderparkplätze in Baden-Württemberg, Bayern, Hessen und den übrigen Ländern erfasst sind.",
  alternates: { canonical: "/bundeslaender" },
};

export default async function BundeslaenderSeite() {
  const [laender, kreise, zahlen] = await Promise.all([
    bundeslaender(),
    topKreise(40),
    kennzahlen(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Bundesländer" />
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze nach Bundesland
      </h1>
      <p className="mt-4 text-lg text-muted">
        {nf.format(zahlen.gesamt)} Wanderparkplätze in {nf.format(zahlen.kreise)} Landkreisen
        und kreisfreien Städten. Der Bestand folgt der Wanderdichte: Mittelgebirge und
        Alpenvorland liegen deutlich vor den Küsten- und Tieflandregionen.
      </p>
      <RegionListe items={laender} basis="bundesland" titel="Alle Bundesländer" />
      <RegionListe items={kreise} basis="kreis" titel="Landkreise mit dem größten Bestand" />
    </div>
  );
}
