import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ParkplatzListe from "@/components/ParkplatzListe";
import RegionListe from "@/components/RegionListe";
import Faktenkarte from "@/components/Faktenkarte";
import OhneAuto from "@/components/OhneAuto";
import WegeListe from "@/components/WegeListe";
import ZieleListe from "@/components/ZieleListe";
import Umfeld from "@/components/Umfeld";
import Block from "@/components/Block";
import Brotkrumen from "@/components/Brotkrumen";
import SammlungLd from "@/components/SammlungLd";
import CommonsBild from "@/components/CommonsBild";
import {
  parkplaetzeInRegion,
  kreiseInRegion,
  regionBestaende,
  wanderwegeImUmkreis,
  zieleImUmkreis,
  umfeldImUmkreis,
  oepnvImUmkreis,
} from "@/lib/db";
import { WANDERREGIONEN, regionBySlug } from "@/lib/wanderregionen";
import { nf, aufzaehlung } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";
import { bildFuer } from "@/lib/bild";

/*
 * Bewusst kürzer als bei Kreis- und Ortsseiten: ob eine Region Bestand hat,
 * ändert sich mit jedem Datenimport. Eine Region, die neu Parkplätze bekommt,
 * soll binnen eines Tages erscheinen und nicht erst nach einer Woche.
 */
export const revalidate = 86400;

const MAX_LISTE = 120;

/**
 * Nur Regionen mit Bestand vorrendern.
 *
 * Sonst wird für leere Regionen ein notFound() fest ins Build geschrieben und
 * als 404 zwischengespeichert — auch dann noch, wenn längst Daten vorliegen.
 * Regionen ohne Bestand entstehen stattdessen bei Abruf und liefern ein 404,
 * das sich mit der nächsten Revalidierung von selbst korrigiert.
 */
export async function generateStaticParams() {
  const bestaende = await regionBestaende(WANDERREGIONEN);
  const mitBestand = new Set(bestaende.filter((b) => b.n > 0).map((b) => b.slug));
  return WANDERREGIONEN.filter((r) => mitBestand.has(r.slug)).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/region/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = regionBySlug(slug);
  if (!r) return { title: "Region nicht gefunden" };
  const [bestand] = await regionBestaende([r]);
  return {
    title: titel(`Wanderparkplatz ${r.name} (${nf.format(bestand?.n ?? 0)})`),
    description: beschreibung(
      `${nf.format(bestand?.n ?? 0)} Wanderparkplätze ${r.dativ}: Wanderwege ab dem Platz, Wanderziele in Reichweite, Gebühren und Anfahrt. ${r.kurz}.`,
    ),
    alternates: { canonical: `/region/${r.slug}` },
  };
}

export default async function RegionSeite({ params }: PageProps<"/region/[slug]">) {
  const { slug } = await params;
  const r = regionBySlug(slug);
  if (!r) notFound();

  const [plaetze, kreise, bestaende, bild, wege, ziele, umfeld, ohneAuto] = await Promise.all([
    parkplaetzeInRegion(r.lat, r.lon, r.radiusKm, MAX_LISTE),
    kreiseInRegion(r.lat, r.lon, r.radiusKm),
    regionBestaende([r]),
    bildFuer(r.wikidata),
    wanderwegeImUmkreis(r.lat, r.lon, r.radiusKm, 16),
    zieleImUmkreis(r.lat, r.lon, r.radiusKm, 12),
    umfeldImUmkreis(r.lat, r.lon, r.radiusKm),
    oepnvImUmkreis(r.lat, r.lon, r.radiusKm),
  ]);
  const bestand = bestaende[0];

  // Ohne Bestand hat die Seite keinen Inhalt, der eine Indexierung rechtfertigt.
  if (!bestand || bestand.n === 0) notFound();

  const anteilFrei = Math.round((bestand.kostenfrei / bestand.n) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SammlungLd
        name={`Wanderparkplätze ${r.dativ}`}
        pfad={`/region/${r.slug}`}
        art="Place"
        ueber={r.name}
        anzahl={bestand.n}
        lat={r.lat}
        lon={r.lon}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Wanderregionen", url: "/regionen" },
        ]}
        aktuell={r.name}
      />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Wanderparkplätze {r.dativ}</h1>

      {bild && (
        <CommonsBild
          bild={bild}
          alt={`Landschaft ${r.dativ}`}
          breite={1200}
          hoehe={675}
          prioritaet
          klasse="mt-5"
        />
      )}

      <div className="mt-5 space-y-4 text-lg text-muted">
        <p className="text-foreground leading-relaxed">{r.text}</p>
        {/* Als ein String zusammengesetzt: in JSX getrennte Teile erzeugen
            sonst Leerzeichen vor Komma und Punkt. */}
        <p>
          {`Im Umkreis von ${r.radiusKm} Kilometern um die Mitte der Region sind ${nf.format(bestand.n)} Wanderparkplätze erfasst` +
            (bestand.kostenfrei > 0
              ? `, davon ${nf.format(bestand.kostenfrei)} nachweislich kostenfrei (${anteilFrei} %)`
              : "") +
            `. Die Region liegt in ${aufzaehlung(r.laender)}.`}
        </p>
        {wege.length > 0 && (
          <p>
            {`Ab diesen Parkplätzen ${wege.length === 1 ? "führt ein markierter Wanderweg" : `führen ${nf.format(wege.length)} markierte Wanderwege`} weiter` +
              (ziele.length
                ? `, und ${ziele.length === 1 ? "ein Wanderziel liegt" : `${nf.format(ziele.length)} Wanderziele liegen`} in Reichweite`
                : "") +
              "."}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <aside className="order-1 space-y-6 lg:order-2">
          <Faktenkarte
            titel={`Daten ${r.dativ}`}
            eintraege={[
              ["Wanderparkplätze", nf.format(bestand.n)],
              ["davon kostenfrei", bestand.kostenfrei > 0 ? nf.format(bestand.kostenfrei) : null],
              ["Landkreise mit Bestand", kreise.length ? nf.format(kreise.length) : null],
              ["Markierte Wanderwege", wege.length ? nf.format(wege.length) : null],
              ["Wanderziele", ziele.length ? nf.format(ziele.length) : null],
              ["Bundesländer", aufzaehlung(r.laender)],
              ["Radius um die Mitte", `${r.radiusKm} km`],
            ]}
            hinweis={
              r.fernwege.length > 0
                ? `Bekannte Fernwanderwege der Region: ${aufzaehlung(r.fernwege)}.`
                : undefined
            }
          />

          <Block titel="Weitere Wanderregionen">
            <ul className="flex flex-wrap gap-2">
              {WANDERREGIONEN.filter((x) => x.slug !== r.slug)
                .slice(0, 12)
                .map((x) => (
                  <li key={x.slug}>
                    <Link
                      href={`/region/${x.slug}`}
                      className="inline-block rounded-full border border-line bg-background px-3 py-1.5 text-sm hover:border-accent"
                    >
                      {x.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </Block>
        </aside>

        <div className="order-2 space-y-6 lg:order-1">
          <Block
            titel={`${plaetze.length >= MAX_LISTE ? "Wanderparkplätze" : "Alle Wanderparkplätze"} ${r.dativ}`}
            einleitung={
              plaetze.length >= MAX_LISTE
                ? `Angezeigt werden die ${nf.format(MAX_LISTE)} Plätze mit den vollständigsten Angaben. Über die Landkreise kommst du an den vollständigen Bestand.`
                : undefined
            }
          >
            <ParkplatzListe items={plaetze} />
          </Block>

          {kreise.length > 0 && (
            <Block
              titel={`Landkreise ${r.dativ}`}
              fussnote="Die Region überschneidet sich mit Verwaltungsgrenzen — ein Landkreis kann teils innerhalb, teils außerhalb liegen."
            >
              <RegionListe items={kreise} basis="kreis" spalten={2} />
            </Block>
          )}

          {wege.length > 0 && (
            <Block titel={`Wanderwege ${r.dativ}`}>
              <WegeListe items={wege} maxSichtbar={10} />
            </Block>
          )}

          {ziele.length > 0 && (
            <Block
              titel={`Wanderziele ${r.dativ}`}
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz."
            >
              <ZieleListe items={ziele} />
            </Block>
          )}

          <OhneAuto daten={ohneAuto} region={r.dativ} />

          {umfeld.length > 0 && (
            <Block
              titel="In Laufweite"
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz. Öffnungszeiten und Fahrpläne sind nicht erfasst."
            >
              <Umfeld items={umfeld} />
            </Block>
          )}
        </div>
      </div>
    </div>
  );
}
