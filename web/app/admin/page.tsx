import type { Metadata } from "next";
import Link from "next/link";
import Anmeldung from "./Anmeldung";
import { abmeldenAktion, moderiereAktion } from "./aktionen";
import { angemeldet, zugangEingerichtet } from "@/lib/admin";
import {
  offeneBewertungen,
  bewertungsZahlen,
  klicksNachSeite,
  klicksNachAbschnitt,
  klicksNachProdukt,
  letzterImport,
} from "@/lib/verwaltung";
import { nf } from "@/lib/format";

/*
 * Nichts zwischenspeichern: Die Seite zeigt den Stand der Datenbank und
 * hängt am Keks des Aufrufers.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verwaltung",
  robots: { index: false, follow: false },
};

const TAGE = 30;

const zeit = (w: string | Date) =>
  new Date(w).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Tabelle({ kopf, zeilen }: { kopf: [string, string]; zeilen: [string, number][] }) {
  if (zeilen.length === 0) return <p className="text-sm text-muted">Noch nichts gezählt.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-muted">
          <th className="py-1 font-medium">{kopf[0]}</th>
          <th className="py-1 text-right font-medium">{kopf[1]}</th>
        </tr>
      </thead>
      <tbody>
        {zeilen.map(([a, b]) => (
          <tr key={a} className="border-b border-line/60 last:border-0">
            <td className="py-1.5 pr-3">{a}</td>
            <td className="py-1.5 text-right tabular-nums">{nf.format(b)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function Verwaltung() {
  if (!zugangEingerichtet()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Verwaltung</h1>
        <p className="mt-4 text-muted">
          Der Bereich ist geschlossen, weil kein Passwort hinterlegt ist. Setze{" "}
          <code className="rounded bg-sand px-1">ADMIN_PASSWORT</code> in den
          Umgebungsvariablen — in Vercel unter Settings → Environment Variables, lokal in{" "}
          <code className="rounded bg-sand px-1">web/.env.local</code>.
        </p>
      </div>
    );
  }

  if (!(await angemeldet())) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Verwaltung</h1>
        <p className="mt-3 text-muted">Bitte anmelden.</p>
        <Anmeldung />
      </div>
    );
  }

  const [offen, zahlen, seiten, abschnitte, produkte, importe] = await Promise.all([
    offeneBewertungen(),
    bewertungsZahlen(),
    klicksNachSeite(TAGE),
    klicksNachAbschnitt(TAGE),
    klicksNachProdukt(TAGE),
    letzterImport(),
  ]);

  const klicksGesamt = seiten.reduce((n, s) => n + s.klicks, 0);
  const lauf = importe[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Verwaltung</h1>
        <form action={abmeldenAktion}>
          <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-accent">
            Abmelden
          </button>
        </form>
      </div>

      {/* ───────────────────────── Bewertungen ───────────────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight">
          Bewertungen {offen.length > 0 && <span className="text-accent">({offen.length} offen)</span>}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {zahlen.map((z) => `${nf.format(z.n)} ${z.status}`).join(" · ") || "noch keine"}
        </p>

        {offen.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line bg-card p-5 text-muted">
            Nichts zu tun — keine offenen Bewertungen.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {offen.map((b) => (
              <li key={b.id} className="rounded-xl border border-line bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    <span className="text-accent">{"★".repeat(b.sterne)}</span>
                    <span className="text-muted">{"☆".repeat(5 - b.sterne)}</span>{" "}
                    <Link href={`/wanderparkplatz/${b.slug}`} className="hover:text-accent" target="_blank">
                      {b.name}
                    </Link>
                  </p>
                  <p className="text-sm text-muted">
                    {b.autor?.trim() || "ohne Namen"} · {zeit(b.erstellt)}
                    {b.besucht_am ? ` · besucht am ${new Date(b.besucht_am).toLocaleDateString("de-DE")}` : ""}
                  </p>
                </div>
                {b.text && <p className="mt-3 whitespace-pre-line leading-relaxed">{b.text}</p>}
                <div className="mt-4 flex gap-2">
                  <form action={moderiereAktion}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="frei" />
                    <button
                      type="submit"
                      className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110 dark:text-background"
                    >
                      Freigeben
                    </button>
                  </form>
                  <form action={moderiereAktion}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="abgelehnt" />
                    <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-accent">
                      Ablehnen
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {offen.length > 1 && (
          <form action={moderiereAktion} className="mt-4">
            {offen.map((b) => (
              <input key={b.id} type="hidden" name="id" value={b.id} />
            ))}
            <input type="hidden" name="status" value="frei" />
            <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-accent">
              Alle {offen.length} freigeben
            </button>
          </form>
        )}
      </section>

      {/* ───────────────────────── Klicks ───────────────────────── */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Partnerklicks</h2>
        <p className="mt-1 text-sm text-muted">
          {nf.format(klicksGesamt)} Klicks in {TAGE} Tagen. Gezählt wird das Ereignis, nicht die
          Person — ohne IP, ohne Kennung, ohne Keks.
        </p>
        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">Nach Seite</h3>
            <div className="mt-3">
              <Tabelle
                kopf={["Seite", "Klicks"]}
                zeilen={seiten.map((s) => [s.pfad.replace("/ausruestung/", ""), s.klicks])}
              />
            </div>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">Nach Abschnitt</h3>
            <div className="mt-3">
              <Tabelle kopf={["Abschnitt", "Klicks"]} zeilen={abschnitte.map((a) => [a.platz, a.klicks])} />
            </div>
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold">Nach Produkt</h3>
            <div className="mt-3">
              <Tabelle kopf={["ASIN", "Klicks"]} zeilen={produkte.map((p) => [p.asin, p.klicks])} />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Datenstand ───────────────────────── */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Datenstand</h2>
        {lauf ? (
          <p className="mt-2 text-muted">
            Letzter Import: {zeit(lauf.gelaufen)} mit {nf.format(lauf.parkplaetze)} Parkplätzen. Der
            wöchentliche Lauf startet montags um 02:17 Uhr.
          </p>
        ) : (
          <p className="mt-2 text-muted">Noch kein Import verzeichnet.</p>
        )}
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {importe.slice(1).map((i) => (
            <li key={i.gelaufen}>
              {zeit(i.gelaufen)} — {nf.format(i.parkplaetze)} Parkplätze
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
