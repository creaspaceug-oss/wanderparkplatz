import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Brotkrumen from "@/components/Brotkrumen";
import {
  zielBySlug, parkplaetzeAmZiel, zielSeiten, nahegelegeneZiele, wegeZumZiel, umfeldAmZiel,
} from "@/lib/db";
import { zielTitel } from "@/lib/zielart";
import { jsonLd, nf } from "@/lib/format";
import { titelVariante, beschreibung } from "@/lib/meta";
import { SITE } from "@/lib/site";
import { bildFuer } from "@/lib/bild";
import CommonsBild from "@/components/CommonsBild";
import WegeListe from "@/components/WegeListe";
import Umfeld from "@/components/Umfeld";
import Block from "@/components/Block";
import Karte from "@/components/Karte";
import Faktenkarte from "@/components/Faktenkarte";
import { zieltext } from "@/lib/detailtext";

export const revalidate = 604800;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await zielSeiten(400)).map((z) => ({ slug: z.slug }));
}

const meter = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

export async function generateMetadata({ params }: PageProps<"/ziel/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const z = await zielBySlug(slug);
  if (!z) return { title: "Ziel nicht gefunden" };
  // "Steinberg" gibt es 33-mal, "Galgenberg" 25-mal. Der Kreis trennt
  // schärfer als das Bundesland: 1.875 Namensdubletten sinken damit auf
  // 405 statt nur auf 1.107.
  const kreis = z.kreis_name ? ` (${z.kreis_name})` : "";
  const land = z.bl_name ? ` (${z.bl_name})` : "";
  const zusatz = kreis || land;
  const anzahl = nf.format(z.parkplatz_count);
  const punkte = `${anzahl} ${z.parkplatz_count === 1 ? "Ausgangspunkt" : "Ausgangspunkte"}`;
  return {
    // Gesucht wird "Wanderparkplatz <Name>", nicht "Parkplatz <Name>" — die
    // Wortwahl im Titel folgt deshalb der Suchanfrage.
    //
    // Die Staffelung kostet nichts und bringt viel: Sie drückt die Zahl der
    // abgeschnittenen Titel von 2.464 auf 26, ohne die Zahl der Dubletten
    // nennenswert zu erhöhen (242 vorher, 258 nachher). Vor dem Kreis fällt
    // die Angabe der Plätze weg, erst danach der Kreis selbst.
    title: titelVariante(
      `Wanderparkplatz ${z.name}${zusatz} – ${punkte}`,
      `Wanderparkplatz ${z.name}${zusatz} – ${anzahl} Plätze`,
      `Wanderparkplatz ${z.name}${zusatz}`,
      `Wanderparkplatz ${z.name}${land}`,
      `Wanderparkplatz ${z.name}`,
    ),
    description: beschreibung(
      `Wanderparkplätze am ${z.name}` +
        `${z.hoehe_m ? ` (${nf.format(z.hoehe_m)} m)` : ""}` +
        `${z.bl_name ? ` in ${z.bl_name}` : ""}: ${punkte}` +
        ` mit Stellplätzen, Gebühren und Entfernung zum Ziel.`,
    ),
    alternates: { canonical: `/ziel/${z.slug}` },
  };
}

export default async function ZielSeite({ params }: PageProps<"/ziel/[slug]">) {
  const { slug } = await params;
  const z = await zielBySlug(slug);
  if (!z) notFound();

  const [plaetze, nahe, bild, wege, umfeld] = await Promise.all([
    parkplaetzeAmZiel(z.id),
    nahegelegeneZiele(z.id),
    bildFuer(z.wikidata),
    wegeZumZiel(z.id),
    umfeldAmZiel(z.id),
  ]);
  if (!plaetze.length) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Wanderparkplätze am ${z.name}`,
          url: `${SITE}/ziel/${z.slug}`,
          about: {
            "@type": z.art === "burg" ? "LandmarksOrHistoricalBuildings" : "Landform",
            name: z.name,
            geo: { "@type": "GeoCoordinates", latitude: z.lat, longitude: z.lon },
            ...(z.hoehe_m ? { elevation: `${z.hoehe_m} m` } : {}),
          },
        })}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Wanderziele", url: "/ziele" },
        ]}
        aktuell={z.name}
      />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Wanderparkplätze am {z.name}
      </h1>
      <p className="mt-2 text-muted">
        {[
          zielTitel(z.art),
          z.hoehe_m ? `${nf.format(z.hoehe_m)} m über dem Meeresspiegel` : null,
          z.bl_name,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <aside className="order-1 space-y-6 lg:order-2">
          <section className="rounded-xl border border-line bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Lage</h2>
            <Karte lat={z.lat} lon={z.lon} titel={z.name} hoeheKm={3} />
            <p className="mt-3 text-sm text-muted">
              Der Marker zeigt das Ziel, nicht den Parkplatz. Koordinaten{" "}
              <span className="tabular-nums text-foreground">
                {z.lat.toFixed(5)}, {z.lon.toFixed(5)}
              </span>
              .
            </p>
          </section>

          <Faktenkarte
            titel="Daten zum Ziel"
            eintraege={[
              ["Art", zielTitel(z.art)],
              ["Höhe", z.hoehe_m != null ? `${nf.format(z.hoehe_m)} m` : null],
              ["Ausgangspunkte", nf.format(z.parkplatz_count)],
              ["Landkreis", z.kreis_name ?? null],
              ["Bundesland", z.bl_name ?? null],
            ]}
          />
        </aside>

        <div className="order-2 space-y-6 lg:order-1">
          {bild && (
            <CommonsBild
              bild={bild}
              alt={`${z.name} — ${zielTitel(z.art)}`}
              breite={1200}
              hoehe={675}
              prioritaet
            />
          )}

          {/* Ohne Artikel formuliert: "für den Großer Waxenstein" wäre falsch,
              und Eigennamen lassen sich nicht zuverlässig beugen. */}
          <div className="space-y-4 text-lg leading-relaxed text-muted">
            {zieltext(z, plaetze, wege, umfeld).map((a) => (
              <p key={a.slice(0, 40)}>{a}</p>
            ))}
          </div>

          <Block titel="Parkplätze, nach Entfernung">
            <ul className="divide-y divide-line">
              {plaetze.map((pl) => (
                <li key={pl.slug} className="flex items-start justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <Link
                      href={`/wanderparkplatz/${pl.slug}`}
                      className="font-medium hover:text-accent"
                    >
                      {pl.name}
                    </Link>
                    <span className="block text-sm text-muted">
                      {[
                        pl.ort_name,
                        pl.stellplaetze ? `${pl.stellplaetze} Stellplätze` : null,
                        pl.gebuehr === false
                          ? "kostenfrei"
                          : pl.gebuehr === true
                            ? "gebührenpflichtig"
                            : null,
                        pl.oberflaeche,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-sm tabular-nums text-muted">
                    {meter(pl.distanz_m)}
                  </span>
                </li>
              ))}
            </ul>
          </Block>

          {wege.length > 0 && (
            <Block
              titel="Wanderwege ab diesen Parkplätzen"
              fussnote="Markierte Wege, die höchstens 200 Meter an einem der Parkplätze vorbeiführen."
            >
              <WegeListe items={wege} maxSichtbar={10} />
            </Block>
          )}

          {umfeld.length > 0 && (
            <Block
              titel="In Laufweite"
              fussnote="Luftlinie ab dem nächstgelegenen Parkplatz. Öffnungszeiten und Fahrpläne sind nicht erfasst."
            >
              <Umfeld items={umfeld} />
            </Block>
          )}

          {nahe.length > 0 && (
            <Block titel="Weitere Ziele in der Umgebung">
              <ul className="flex flex-wrap gap-2">
                {nahe.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/ziel/${n.slug}`}
                      className="inline-block rounded-full border border-line px-3 py-1.5 text-sm hover:border-accent"
                    >
                      {n.name}
                      {n.hoehe_m && (
                        <span className="ml-1 tabular-nums text-muted">{n.hoehe_m} m</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>
      </div>
    </div>
  );
}
