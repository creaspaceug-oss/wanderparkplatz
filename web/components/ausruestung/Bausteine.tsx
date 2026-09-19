import type { Preisstand } from "@/lib/amazon";
import type { Stock } from "@/lib/ausruestung/wanderstoecke";
import { nf } from "@/lib/format";
import Affiliatelink from "@/components/Affiliatelink";

/*
 * Bausteine der Ausrüstungsseiten.
 *
 * Eine Datei statt sieben: Sie gehören zusammen, werden nur hier verwendet und
 * teilen sich Typen. Wer eine zweite Produktgruppe baut, nimmt dieselben.
 */

/** Anker-Abschnitt mit großer Überschrift — Fließtext statt Kasten. */
export function Kapitel({
  id,
  titel,
  unterzeile,
  breit,
  children,
}: {
  id: string;
  titel: string;
  unterzeile?: string;
  /** Für Tabellen und Produktberichte; Fließtext bleibt schmal, sonst wird die Zeile zu lang. */
  breit?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-6 border-t border-line pt-10">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">{titel}</h2>
        {unterzeile && <p className="mt-2 text-lg leading-relaxed text-muted">{unterzeile}</p>}
      </div>
      <div
        className={`mt-6 space-y-5 text-[1.05rem] leading-[1.75] ${breit ? "" : "max-w-3xl"}`}
      >
        {children}
      </div>
    </section>
  );
}

/** Hervorgehobener Merksatz. Sparsam — einer je Kapitel höchstens. */
export function Merksatz({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border-l-4 border-accent bg-accent-soft px-5 py-4 font-medium leading-relaxed">
      {children}
    </p>
  );
}

/** Inhaltsverzeichnis — bei einer Seite dieser Länge keine Zierde, sondern Werkzeug. */
export function Inhalt({ eintraege }: { eintraege: [string, string][] }) {
  return (
    <nav aria-label="Inhalt" className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Inhalt</h2>
      {/* Spalten statt Raster: gelesen wird von oben nach unten, nicht zeilenweise. */}
      <ol className="mt-3 gap-x-8 text-[0.95rem] sm:columns-2">
        {eintraege.map(([id, text], i) => (
          <li key={id} className="flex break-inside-avoid gap-3 py-0.5">
            <span className="w-5 shrink-0 text-right tabular-nums text-muted">{i + 1}</span>
            <a href={`#${id}`} className="hover:text-accent hover:underline">
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Produktbild von Amazon, in einer ruhigen Fläche freigestellt.
 *
 * Mit `href` wird das Bild selbst zum Verweis. Leser klicken auf Bilder
 * häufiger als auf Text — und wer auf das Bild eines Stocks klickt, will den
 * Stock sehen, nicht zu einem Anker weiter unten springen. Als Anzeige
 * ausgezeichnet wie jeder andere Partnerverweis.
 */
export function Produktbild({
  preis,
  alt,
  gross,
  klein,
  href,
}: {
  preis?: Preisstand;
  alt: string;
  gross?: boolean;
  /** Für Tabellenzeilen: hohe Bildflächen machen jede Zeile doppelt so hoch wie nötig. */
  klein?: boolean;
  href?: string;
}) {
  const box = gross ? "h-56 sm:h-64" : klein ? "h-20 md:h-[5.5rem]" : "h-40";
  const inhalt = preis?.bild ? (
    // Amazons Bild, nicht unseres: Die Programmbedingungen lassen für
    // gelistete Artikel keine eigenen Aufnahmen zu.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={preis.bild}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-[1.04]"
    />
  ) : null;
  const flaeche = `${box} flex w-full items-center justify-center rounded-xl bg-white ${klein ? "p-2" : "p-4"}`;
  const ziel = preis?.url ?? href;
  if (!inhalt) return <div className={`${box} w-full rounded-xl bg-sand`} aria-hidden />;
  if (!ziel) return <div className={flaeche}>{inhalt}</div>;
  return (
    <a
      href={ziel}
      rel="sponsored nofollow noopener"
      target="_blank"
      aria-label={`${alt} bei Amazon ansehen (Anzeige)`}
      className={`group relative ${flaeche} ring-accent/40 transition hover:ring-2`}
    >
      {inhalt}
      <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-foreground/75 px-1.5 py-0.5 text-[0.65rem] font-medium text-background opacity-0 transition group-hover:opacity-100">
        Anzeige · bei Amazon
      </span>
    </a>
  );
}

export function Abzeichen({ text, stark }: { text: string; stark?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        stark ? "bg-accent text-white dark:text-background" : "bg-accent-soft text-accent"
      }`}
    >
      {text}
    </span>
  );
}

export function Testnote({ s }: { s: Stock }) {
  if (!s.warentest) return null;
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1 text-sm">
      <span className="text-muted">Stiftung Warentest</span>
      <strong className="tabular-nums">{s.warentest.note}</strong>
      <span className="text-muted">({s.warentest.urteil})</span>
    </span>
  );
}

/** Eine der drei Empfehlungen ganz oben. */
export function Schnellkarte({
  s,
  preis,
  fuer,
}: {
  s: Stock;
  preis?: Preisstand;
  /** Für wen — ein kurzer Satz über der Karte. */
  fuer: string;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-accent">{fuer}</p>
      <div className="mt-3">
        <Produktbild preis={preis} alt={`${s.marke} ${s.name}`} href={preis?.url} />
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug">
        {s.marke} {s.name}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{s.rolle}</p>
      <ul className="mt-3 space-y-1 text-sm">
        <li>{s.bauart} · {s.material}</li>
        {s.gramm_stueck && <li>{nf.format(s.gramm_stueck)} g je Stock</li>}
        {s.warentest && (
          <li>
            Warentest <strong>{s.warentest.note}</strong> — {s.warentest.rang}
          </li>
        )}
      </ul>
      <div className="mt-auto pt-3">
        <a href={`#${s.asin}`} className="text-sm text-muted underline hover:text-accent">
          Zur ausführlichen Einschätzung
        </a>
        <Affiliatelink url={preis?.url ?? ""} preis={preis} name={`${s.marke} ${s.name}`} knapp />
      </div>
    </article>
  );
}

/** Der ausführliche Bericht zu einem Stock. */
export function Produktbericht({
  s,
  preis,
  nummer,
  urlErsatz,
}: {
  s: Stock;
  preis?: Preisstand;
  nummer: number;
  urlErsatz: string;
}) {
  const daten: [string, string][] = [
    ["Bauart", s.bauart],
    ["Material", s.material],
    ["Länge", s.laenge],
    ["Verschluss", s.verschluss],
    ["Griff", s.griff],
    ["Gewicht", s.gramm_stueck ? `${nf.format(s.gramm_stueck)} g je Stock` : "vom Hersteller nicht genannt"],
  ];
  return (
    <article id={s.asin} className="scroll-mt-6 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="grid gap-6 p-5 sm:grid-cols-[15rem_1fr] sm:p-7">
        <div>
          <Produktbild preis={preis} alt={`${s.marke} ${s.name}`} gross href={urlErsatz} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm tabular-nums text-muted">{nummer}.</span>
            {s.abzeichen && <Abzeichen text={s.abzeichen} stark={nummer === 1} />}
            <Testnote s={s} />
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight">
            {s.marke} {s.name}
          </h3>
          <p className="mt-1 text-lg">{s.rolle}</p>
          <p className="mt-3 leading-relaxed text-muted">{s.einordnung}</p>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
            {daten.map(([k, v]) => (
              <div key={k} className="border-t border-line py-2">
                <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid border-t border-line sm:grid-cols-2">
        <div className="p-5 sm:p-7">
          <h4 className="flex items-center gap-2 font-semibold text-accent">
            <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft">+</span>
            Dafür
          </h4>
          <ul className="mt-3 space-y-2.5 leading-relaxed">
            {s.dafuer.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="border-t border-line bg-warn-soft/60 p-5 sm:border-l sm:border-t-0 sm:p-7">
          <h4 className="flex items-center gap-2 font-semibold text-warn">
            <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full bg-warn-soft">−</span>
            Dagegen
          </h4>
          <ul className="mt-3 space-y-2.5 leading-relaxed">
            {s.dagegen.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-line bg-sand p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <p className="max-w-xl leading-relaxed">
          <strong className="font-semibold">Nichts für: </strong>
          {s.nichtFuer}
        </p>
        <div className="shrink-0 sm:text-right">
          <Affiliatelink url={preis?.url ?? urlErsatz} preis={preis} name={`${s.marke} ${s.name}`} knapp />
        </div>
      </div>
    </article>
  );
}

/** Packmaß im Maßstab: gefaltet gegen zusammengeschoben. */
export function PackmassBild() {
  const zeilen: [string, number, string][] = [
    ["Faltstock, vierteilig", 38, "var(--accent)"],
    ["Faltstock, feste Länge", 40, "var(--accent)"],
    ["Teleskopstock, dreiteilig", 65, "currentColor"],
  ];
  return (
    <figure className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <svg viewBox="0 0 480 150" className="w-full text-foreground" role="img" aria-label="Packmaß: Faltstöcke rund 38 bis 40 cm, Teleskopstöcke rund 65 cm.">
        {zeilen.map(([t, cm, farbe], i) => (
          <g key={t} transform={`translate(0 ${i * 46 + 10})`}>
            <text x="0" y="14" fontSize="13" fill="currentColor" fillOpacity=".75">{t}</text>
            <rect x="0" y="22" width={cm * 5.2} height="12" rx="6" fill={farbe} fillOpacity={farbe === "currentColor" ? 0.35 : 1} />
            <text x={cm * 5.2 + 8} y="33" fontSize="13" fontWeight="600" fill="currentColor">
              {cm} cm
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-sm text-muted">
        Richtwerte, maßstabsgetreu zueinander. Im Tagesrucksack steht der Teleskopstock oben heraus, der Faltstock verschwindet darin.
      </figcaption>
    </figure>
  );
}

/**
 * Die Handschlaufe: von unten durchgreifen, damit die Last auf der Schlaufe liegt.
 *
 * Ein Pfeil für die Richtung der Hand statt einer gezeichneten Hand — eine
 * Hand in drei Strichen erkennt niemand, eine Richtung schon.
 */
export function SchlaufeBild() {
  const tafel = (richtig: boolean) => {
    const farbe = richtig ? "var(--accent)" : "var(--warn)";
    const mid = richtig ? "pfeil-r" : "pfeil-f";
    return (
      <svg
        viewBox="0 0 170 180"
        className="mx-auto h-44 w-auto text-foreground"
        role="img"
        aria-label={
          richtig
            ? "Richtig: Die Hand kommt von unten durch die Schlaufe und fasst dann den Griff."
            : "Falsch: Die Hand greift von oben in die Schlaufe."
        }
      >
        <defs>
          <marker id={mid} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={farbe} />
          </marker>
        </defs>
        {/* Stock und Griff */}
        <rect x="104" y="96" width="10" height="80" rx="3" fill="currentColor" fillOpacity=".25" />
        <rect x="96" y="26" width="26" height="74" rx="11" fill="currentColor" fillOpacity=".55" />
        {/* Schlaufe */}
        <path
          d="M98 34 C66 34 50 86 62 112 C72 132 94 108 98 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeOpacity=".8"
        />
        {/* Richtung der Hand */}
        {richtig ? (
          <path d="M40 172 C46 140 62 104 90 68" fill="none" stroke={farbe} strokeWidth="4" strokeDasharray="1 7" strokeLinecap="round" markerEnd={`url(#${mid})`} />
        ) : (
          <path d="M46 14 C54 38 60 62 67 92" fill="none" stroke={farbe} strokeWidth="4" strokeDasharray="1 7" strokeLinecap="round" markerEnd={`url(#${mid})`} />
        )}
        <text x={richtig ? 18 : 4} y={richtig ? 168 : 18} fontSize="12" fill={farbe} fontWeight="600">
          Hand
        </text>
      </svg>
    );
  };
  return (
    <figure className="grid gap-6 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2 sm:p-6">
      {[
        { richtig: true, text: "Hand von unten durch die Schlaufe schieben, dann den Griff fassen. Die Schlaufe liegt zwischen Daumen und Handfläche und trägt einen Teil der Last." },
        { richtig: false, text: "Von oben hineingegriffen hängt die Schlaufe nutzlos am Handgelenk. Die ganze Last liegt im Griff, die Hand ermüdet." },
      ].map(({ richtig, text }) => (
        <div key={String(richtig)}>
          {tafel(richtig)}
          <p className={`mt-2 text-sm leading-relaxed ${richtig ? "" : "text-muted"}`}>
            <strong className={richtig ? "text-accent" : "text-warn"}>{richtig ? "Richtig. " : "Falsch. "}</strong>
            {text}
          </p>
        </div>
      ))}
    </figure>
  );
}

/** Kleine Karten mit Titel und Text — für Abschnitte, die sonst eine Textwand wären. */
export function Kartenraster({
  eintraege,
  spalten = 2,
}: {
  eintraege: { titel: string; text: React.ReactNode }[];
  spalten?: 2 | 3;
}) {
  return (
    <div className={`grid gap-4 ${spalten === 3 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
      {eintraege.map((e) => (
        <div key={e.titel} className="rounded-xl border border-line bg-card p-5">
          <h3 className="font-semibold">{e.titel}</h3>
          <div className="mt-2 text-[0.97rem] leading-relaxed text-muted">{e.text}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Alle Stöcke auf einen Blick, direkt unter dem Titel.
 *
 * Das ist das Muster, das auf Vergleichsseiten am verlässlichsten trägt: Wer
 * schon weiß, was er will, findet es sofort, und wer vergleichen will, sieht
 * die ganze Auswahl, bevor er liest. Auf dem Handy werden die Zeilen zu
 * Karten — eine Tabelle mit fünf Spalten ist dort nicht lesbar.
 */
export function Uebersicht({
  zeilen,
}: {
  zeilen: { s: Stock; preis?: Preisstand; fuer: string; url: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <div className="hidden grid-cols-[6.5rem_1fr_11rem_12.5rem] gap-4 border-b border-line bg-sand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
        <span />
        <span>Stock</span>
        <span>Warentest</span>
        <span className="text-right">Preis</span>
      </div>
      <ol>
        {zeilen.map(({ s, preis, fuer, url }, i) => (
          <li
            key={s.asin}
            className={`grid grid-cols-[5.5rem_1fr] items-center gap-x-4 gap-y-3 border-t border-line px-4 py-4 first:border-t-0 md:grid-cols-[6.5rem_1fr_11rem_12.5rem] md:px-5 ${
              i === 0 ? "bg-accent-soft/60" : ""
            }`}
          >
            <div className="row-span-2 md:row-span-1">
              <Produktbild preis={preis} alt={`${s.marke} ${s.name}`} href={url} klein />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent">{fuer}</p>
              <p className="mt-0.5 font-semibold leading-snug">
                <a
                  href={preis?.url ?? url}
                  rel="sponsored nofollow noopener"
                  target="_blank"
                  className="hover:text-accent hover:underline"
                >
                  {s.marke} {s.name}
                </a>
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {s.bauart} · {s.material}
                {s.gramm_stueck ? ` · ${s.gramm_stueck} g` : ""} ·{" "}
                <a href={`#${s.asin}`} className="underline hover:text-accent">
                  Einschätzung
                </a>
              </p>
            </div>
            <div className="hidden text-sm md:block">
              {s.warentest ? (
                <>
                  <span className="text-lg font-bold tabular-nums">{s.warentest.note}</span>{" "}
                  <span className="text-muted">({s.warentest.urteil})</span>
                  <span className="block text-xs text-muted">{s.warentest.rang}</span>
                </>
              ) : (
                <span className="text-muted">keine zitierbare Note</span>
              )}
            </div>
            <div className="md:text-right">
              <Affiliatelink url={url} preis={preis} name={`${s.marke} ${s.name}`} knapp />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Der Kasten am Schluss: eine Entscheidung, nicht noch eine Liste. */
export function Entscheidung({
  s,
  preis,
  url,
  children,
}: {
  s: Stock;
  preis?: Preisstand;
  url: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 grid items-center gap-6 overflow-hidden rounded-3xl bg-accent-soft p-6 sm:grid-cols-[12rem_1fr] sm:p-8">
      <Produktbild preis={preis} alt={`${s.marke} ${s.name}`} href={url} />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Wenn du dich jetzt entscheiden musst
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {s.marke} {s.name}
        </h2>
        <div className="mt-3 max-w-2xl text-[1.05rem] leading-relaxed">{children}</div>
        <Affiliatelink url={url} preis={preis} name={`${s.marke} ${s.name}`} knapp />
      </div>
    </section>
  );
}
