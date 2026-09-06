import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parkplatzBySlug, inDerNaehe, alleSlugs, trailsAmPlatz, umfeldAmPlatz } from "@/lib/db";
import { beschreibung, metaBeschreibung } from "@/lib/beschreibung";
import { jsonLd, km, gebuehrText } from "@/lib/format";
import { titel } from "@/lib/meta";
import { istIndexierbar } from "@/lib/inhalt";
import { VORRENDERN } from "@/lib/vorrendern";
import { bewertungenFuer } from "@/lib/bewertung";
import BewertungFormular from "@/components/BewertungFormular";
import Bewertungen from "@/components/Bewertungen";
import Sterne from "@/components/Sterne";
import Umfeld from "@/components/Umfeld";
import { SITE } from "@/lib/site";

/** OSM-Netzstufe → Einordnung für Leser. */
const NETZ: Record<string, string> = {
  iwn: "internationaler Fernwanderweg",
  nwn: "nationaler Fernwanderweg",
  rwn: "regionaler Wanderweg",
  lwn: "örtlicher Wanderweg",
};

// Täglich statt wöchentlich: freigegebene Bewertungen sollen zeitnah erscheinen.
export const revalidate = 86400;
export const dynamicParams = true;

/** Nur die datenreichsten Seiten vorab bauen; der Rest entsteht bei Abruf. */
export async function generateStaticParams() {
  const rows = await alleSlugs("parkplatz", VORRENDERN.parkplatz);
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/wanderparkplatz/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await parkplatzBySlug(slug);
  if (!p) return { title: "Wanderparkplatz nicht gefunden" };
  // Ortsname nur anhängen, wenn er nicht schon im Namen steckt; der Zusatz
  // "Parken & Wanderwege" nur, solange er ins Titelbudget passt.
  const ort = p.ort_name && !p.name.includes(p.ort_name) ? ` bei ${p.ort_name}` : "";
  const basis = `${p.name}${ort}`;
  const trails = await trailsAmPlatz(p.id);
  return {
    title: titel(basis.length <= 38 ? `${basis} – Parken & Wanderwege` : basis),
    description: metaBeschreibung(p, trails.length),
    alternates: { canonical: `/wanderparkplatz/${p.slug}` },
    // Seiten mit zu wenig Substanz bleiben erreichbar und verlinkt, aber
    // außerhalb des Index — sie würden sonst die Bewertung der Domain drücken.
    ...(istIndexierbar(p.aussagen) ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title: basis, description: metaBeschreibung(p, trails.length), type: "website" },
  };
}

function Faktenzeile({ label, wert }: { label: string; wert: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{wert}</dd>
    </div>
  );
}

const jaNein = (v: boolean | null) => (v == null ? null : v ? "ja" : "nein");

export default async function Detailseite({ params }: PageProps<"/wanderparkplatz/[slug]">) {
  const { slug } = await params;
  const p = await parkplatzBySlug(slug);
  if (!p) notFound();

  const [nahe, bewertungen, trails, umfeld] = await Promise.all([
    inDerNaehe(p.id, p.lat, p.lon, 20, 8),
    bewertungenFuer(p.id),
    trailsAmPlatz(p.id),
    umfeldAmPlatz(p.id),
  ]);
  const schnitt = p.bewertung_schnitt ? Number(p.bewertung_schnitt) : null;
  const absaetze = beschreibung(p, trails);
  const koord = `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`;

  const fakten: [string, React.ReactNode][] = [
    ["Stellplätze", p.stellplaetze ?? null],
    ["Gebühren", gebuehrText(p.gebuehr, p.gebuehr_info)],
    ["Untergrund", p.oberflaeche],
    ["Zufahrt", p.zugang],
    ["Öffnungszeiten", p.oeffnungszeiten],
    ["Höhenbegrenzung", p.max_hoehe_m ? `${Number(p.max_hoehe_m).toLocaleString("de-DE", { minimumFractionDigits: 2 })} m` : null],
    ["Beleuchtet", jaNein(p.beleuchtet)],
    ["Barrierefreie Stellplätze", jaNein(p.barrierefrei)],
    ["Toilette", jaNein(p.wc)],
    ["Wohnmobile", jaNein(p.wohnmobil)],
    ["Höhe über NN", p.hoehe_m != null ? `${p.hoehe_m} m` : null],
    ["Betreiber", p.betreiber],
    ["Koordinaten", <span key="k" className="tabular-nums">{koord}</span>],
  ];
  const belegt = fakten.filter(([, v]) => v != null && v !== "");

  const breadcrumb = [
    { name: "Startseite", url: "/" },
    ...(p.bl_slug ? [{ name: p.bl_name!, url: `/bundesland/${p.bl_slug}` }] : []),
    ...(p.kreis_slug ? [{ name: p.kreis_name!, url: `/kreis/${p.kreis_slug}` }] : []),
    ...(p.ort_slug ? [{ name: p.ort_name!, url: `/ort/${p.ort_slug}` }] : []),
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ParkingFacility",
              "@id": `${SITE}/wanderparkplatz/${p.slug}#platz`,
              name: p.name,
              description: absaetze.join(" "),
              url: `${SITE}/wanderparkplatz/${p.slug}`,
              geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lon },
              ...(p.stellplaetze ? { maximumAttendeeCapacity: p.stellplaetze } : {}),
              ...(p.gebuehr === false ? { isAccessibleForFree: true } : {}),
              ...(p.gebuehr === true ? { isAccessibleForFree: false } : {}),
              ...(p.oeffnungszeiten ? { openingHours: p.oeffnungszeiten } : {}),
              // Nur mit tatsächlich vorhandenen Bewertungen — erfundene
              // Aggregate sind ein Verstoß gegen Googles Richtlinien.
              ...(p.bewertung_anzahl > 0 && schnitt
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: schnitt,
                      ratingCount: p.bewertung_anzahl,
                      bestRating: 5,
                      worstRating: 1,
                    },
                  }
                : {}),
              ...(p.barrierefrei != null
                ? {
                    accessibilityFeature: p.barrierefrei
                      ? "wheelchairAccessibleParking"
                      : "noWheelchairAccessibleParking",
                  }
                : {}),
              address: {
                "@type": "PostalAddress",
                addressCountry: "DE",
                ...(p.ort_name ? { addressLocality: p.ort_name } : {}),
                ...(p.bl_name ? { addressRegion: p.bl_name } : {}),
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [...breadcrumb, { name: p.name, url: `/wanderparkplatz/${p.slug}` }].map(
                (b, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: b.name,
                  item: `${SITE}${b.url}`,
                }),
              ),
            },
          ],
        })}
      />

      <nav aria-label="Brotkrumen" className="flex flex-wrap gap-1 text-sm text-muted">
        {breadcrumb.map((b, i) => (
          <span key={b.url} className="flex gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            <Link href={b.url} className="hover:text-accent">
              {b.name}
            </Link>
          </span>
        ))}
      </nav>

      <h1 className="mt-3 text-3xl font-bold tracking-tight">{p.name}</h1>
      {p.ort_name && (
        <p className="mt-2 text-muted">
          Wanderparkplatz {p.ort_km != null && p.ort_km >= 0.8 ? "bei" : "in"}{" "}
          <Link href={`/ort/${p.ort_slug}`} className="hover:text-accent">
            {p.ort_name}
          </Link>
          {p.kreis_name && (
            <>
              {" · "}
              <Link href={`/kreis/${p.kreis_slug}`} className="hover:text-accent">
                {p.kreis_name}
              </Link>
            </>
          )}
        </p>
      )}

      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        {absaetze.map((a) => (
          <p key={a.slice(0, 40)}>{a}</p>
        ))}
      </div>

      {trails.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Wanderwege ab diesem Parkplatz
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {trails.map((t) => (
              <li key={t.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                <span className="font-medium">
                  {t.ref && (
                    <span className="mr-2 rounded border border-line px-1.5 py-0.5 text-xs tabular-nums text-muted">
                      {t.ref}
                    </span>
                  )}
                  {t.name}
                </span>
                <span className="text-sm text-muted">
                  {[
                    NETZ[t.netz ?? ""] ?? null,
                    t.markierung,
                    t.laenge_km ? `${Number(t.laenge_km).toLocaleString("de-DE")} km` : null,
                    t.distanz_m <= 30 ? "direkt am Platz" : `${t.distanz_m} m entfernt`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Wegeverlauf und Markierung stammen aus OpenStreetMap. Vor Ort gilt die
            Beschilderung.
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Daten zum Parkplatz</h2>
        <dl className="mt-4">
          {belegt.map(([label, wert]) => (
            <Faktenzeile key={label} label={label} wert={wert} />
          ))}
        </dl>
        {belegt.length < 5 && (
          <p className="mt-4 rounded-lg bg-accent-soft p-3 text-sm">
            Für diesen Parkplatz sind bislang nur wenige Merkmale erfasst. Ergänzungen sind
            über OpenStreetMap jederzeit möglich.
          </p>
        )}
      </section>

      <Umfeld items={umfeld} />

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Anfahrt</h2>
        <p className="mt-3 text-muted">
          Koordinaten <span className="tabular-nums text-foreground">{koord}</span> — in der
          Navigation direkt eingebbar.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            className="rounded-lg border border-line bg-card px-4 py-2 hover:border-accent"
            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`}
            rel="noopener nofollow"
            target="_blank"
          >
            Route bei Google Maps
          </a>
          <a
            className="rounded-lg border border-line bg-card px-4 py-2 hover:border-accent"
            href={`https://maps.apple.com/?daddr=${p.lat},${p.lon}`}
            rel="noopener nofollow"
            target="_blank"
          >
            Route bei Apple Karten
          </a>
          <a
            className="rounded-lg border border-line bg-card px-4 py-2 hover:border-accent"
            href={`https://www.openstreetmap.org/${p.osm_type ?? "node"}/${p.osm_id ?? ""}`}
            rel="noopener nofollow"
            target="_blank"
          >
            In OpenStreetMap ansehen
          </a>
        </div>
      </section>

      {nahe.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Wanderparkplätze in der Nähe</h2>
          <ul className="mt-4 divide-y divide-line">
            {nahe.map((n) => (
              <li key={n.slug} className="flex items-baseline gap-3 py-2.5">
                <span className="w-16 shrink-0 tabular-nums text-sm text-muted">{km(n.km)} km</span>
                <span>
                  <Link href={`/wanderparkplatz/${n.slug}`} className="font-medium hover:text-accent">
                    {n.name}
                  </Link>
                  {n.ort_name && <span className="block text-sm text-muted">{n.ort_name}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Bewertungen</h2>
        {p.bewertung_anzahl > 0 && schnitt ? (
          <p className="mt-2 flex items-center gap-2 text-muted">
            <Sterne wert={schnitt} groesse="text-lg" />
            <span>
              <span className="font-medium text-foreground">
                {schnitt.toLocaleString("de-DE", { minimumFractionDigits: 1 })}
              </span>{" "}
              von 5 · {p.bewertung_anzahl}{" "}
              {p.bewertung_anzahl === 1 ? "Bewertung" : "Bewertungen"}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-muted">
            Noch keine Bewertung. Warst du hier? Deine Einschätzung hilft anderen — gerade
            bei Angaben, die OpenStreetMap nicht führt: Andrang am Wochenende, Zustand der
            Zufahrt, aktuelle Gebühren.
          </p>
        )}

        <Bewertungen items={bewertungen} />

        <div className="mt-6">
          <BewertungFormular slug={p.slug} />
        </div>
      </section>

      <p className="mt-10 text-sm text-muted">
        Angaben aus OpenStreetMap, zuletzt abgeglichen am{" "}
        {new Date(p.aktualisiert ?? Date.now()).toLocaleDateString("de-DE")}. Gebühren und
        Zufahrtsregeln ändern sich — die Beschilderung vor Ort gilt.
      </p>
    </article>
  );
}
