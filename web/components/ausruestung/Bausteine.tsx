import type { Preisstand } from "@/lib/amazon";
import type { Produkt } from "@/lib/ausruestung/typen";
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
  vorrang,
  href,
}: {
  preis?: Preisstand;
  alt: string;
  gross?: boolean;
  /** Für Tabellenzeilen: hohe Bildflächen machen jede Zeile doppelt so hoch wie nötig. */
  klein?: boolean;
  /**
   * Für Bilder, die ohne Scrollen sichtbar sind. "lazy" wartet, bis das
   * Layout steht und der Browser festgestellt hat, dass das Bild im Bild ist —
   * oben auf der Seite ist das genau die Verzögerung, die man als Nachladen
   * sieht.
   */
  vorrang?: boolean;
  href?: string;
}) {
  const box = gross ? "h-56 sm:h-64" : klein ? "h-20 md:h-[5.5rem]" : "h-40";
  const quelle = (klein ? preis?.bildKlein : null) ?? preis?.bild;
  const inhalt = quelle ? (
    // Amazons Bild, nicht unseres: Die Programmbedingungen lassen für
    // gelistete Artikel keine eigenen Aufnahmen zu.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={quelle}
      alt={alt}
      loading={vorrang ? "eager" : "lazy"}
      fetchPriority={vorrang ? "high" : "auto"}
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

/** Hinweis-Chip im Bericht — etwa eine Testnote. Nur, wenn es einen gibt. */
export function Siegel({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1 text-sm">
      {text}
    </span>
  );
}

/** Der ausführliche Bericht zu einem Produkt. */
export function Produktbericht({
  s,
  preis,
  nummer,
  urlErsatz,
}: {
  s: Produkt;
  preis?: Preisstand;
  nummer: number;
  urlErsatz: string;
}) {
  const daten = s.eckdaten;
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
            <Siegel text={s.siegel} />
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
  kennwertTitel,
  kennwertLeer = "—",
}: {
  zeilen: { s: Produkt; preis?: Preisstand; fuer: string; url: string }[];
  /** Überschrift der dritten Spalte — bei Stöcken "Warentest". */
  kennwertTitel: string;
  kennwertLeer?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <div className="hidden grid-cols-[6.5rem_1fr_11rem_12.5rem] gap-4 border-b border-line bg-sand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
        <span />
        <span>Produkt</span>
        <span>{kennwertTitel}</span>
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
              <Produktbild preis={preis} alt={`${s.marke} ${s.name}`} href={url} klein vorrang={i < 3} />
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
                {s.kurz} ·{" "}
                <a href={`#${s.asin}`} className="underline hover:text-accent">
                  Einschätzung
                </a>
              </p>
            </div>
            <div className="hidden text-sm md:block">
              {s.kennwert ? (
                <>
                  <span className="text-lg font-bold tabular-nums">{s.kennwert.wert}</span>{" "}
                  {s.kennwert.zusatz && <span className="text-muted">({s.kennwert.zusatz})</span>}
                  {s.kennwert.unter && <span className="block text-xs text-muted">{s.kennwert.unter}</span>}
                </>
              ) : (
                <span className="text-muted">{kennwertLeer}</span>
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
  s: Produkt;
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

/**
 * Die drei Arten, eine Trinkblase zu öffnen — und was das für die Reinigung
 * heißt. Die Öffnung entscheidet mehr über den Alltag als jedes andere
 * Merkmal, deshalb bekommt sie ein eigenes Bild.
 */
export function OeffnungenBild() {
  const arten: { titel: string; urteil: string; gut: boolean | null; text: string; form: React.ReactNode }[] = [
    {
      titel: "Schraubdeckel",
      urteil: "umständlich zu reinigen",
      gut: false,
      text: "Eine runde Öffnung von ein paar Zentimetern. Füllen geht gut, aber in die Ecken kommt nur eine Bürste.",
      form: <circle cx="60" cy="26" r="11" fill="none" stroke="currentColor" strokeWidth="4" />,
    },
    {
      titel: "Schiebeverschluss",
      urteil: "einfach",
      gut: true,
      text: "Die ganze Oberkante öffnet sich, eine Schiene schiebt sich darüber. Die Blase lässt sich weit aufklappen, manche auf links drehen.",
      form: (
        <>
          <line x1="22" y1="22" x2="98" y2="22" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
          <rect x="14" y="16" width="16" height="12" rx="3" fill="var(--accent)" />
        </>
      ),
    },
    {
      titel: "Weite Öffnung",
      urteil: "am einfachsten",
      gut: true,
      text: "Eine große, feste Öffnung, in die eine ganze Hand passt. Reinigen wie bei einer Schüssel.",
      form: <ellipse cx="60" cy="24" rx="30" ry="9" fill="none" stroke="var(--accent)" strokeWidth="4" />,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {arten.map((a) => (
        <figure key={a.titel} className="rounded-xl border border-line bg-card p-5">
          <svg viewBox="0 0 120 130" className="mx-auto h-28 w-auto text-foreground" aria-hidden>
            <path
              d="M18 18 H102 V96 C102 118 84 124 60 124 C36 124 18 118 18 96 Z"
              fill="currentColor"
              fillOpacity=".06"
              stroke="currentColor"
              strokeOpacity=".4"
              strokeWidth="2"
            />
            {a.form}
            <path d="M60 124 C60 128 64 130 70 130" fill="none" stroke="currentColor" strokeOpacity=".4" strokeWidth="3" />
          </svg>
          <figcaption className="mt-3">
            <h3 className="font-semibold">{a.titel}</h3>
            <p className={`text-sm font-medium ${a.gut ? "text-accent" : "text-warn"}`}>Reinigung: {a.urteil}</p>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{a.text}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * Rückenlänge messen: vom siebten Halswirbel bis zur Oberkante des
 * Beckenkamms. Rückansicht, weil man genau so misst — zu zweit, von hinten.
 * Links die Messung, rechts, wo der Hüftgurt danach sitzen muss.
 */
export function RueckenlaengeBild() {
  return (
    <figure className="grid gap-6 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[minmax(0,18rem)_1fr] sm:items-center sm:p-6">
      <svg
        viewBox="0 0 290 290"
        className="mx-auto h-auto w-full max-w-[18rem] text-foreground"
        role="img"
        aria-label="Rückansicht: Gemessen wird vom hervorstehenden siebten Halswirbel entlang der Wirbelsäule bis zur Oberkante des Beckenkamms, auf Höhe eines Gürtels."
      >
        <defs>
          <marker id="rl-pfeil" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" />
          </marker>
        </defs>
        {/* Kopf, Hals, Rumpf */}
        <circle cx="100" cy="36" r="24" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
        <path
          d="M88 58 L88 70 C60 74 34 80 30 100 L40 190 C44 214 52 226 56 240 L144 240 C148 226 156 214 160 190 L170 100 C166 80 140 74 112 70 L112 58 Z"
          fill="currentColor"
          fillOpacity=".08"
          stroke="currentColor"
          strokeOpacity=".35"
          strokeWidth="2"
        />
        {/* Becken angedeutet */}
        <path d="M50 232 C70 214 130 214 150 232" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
        {/* Wirbelsäule */}
        <line x1="100" y1="72" x2="100" y2="236" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" strokeDasharray="3 5" />
        {/* Gürtel auf Höhe des Beckenkamms */}
        <rect x="36" y="216" width="128" height="10" rx="3" fill="var(--warn)" fillOpacity=".55" />
        {/* Messstrecke entlang der Wirbelsäule */}
        <line x1="100" y1="80" x2="100" y2="213" stroke="var(--accent)" strokeWidth="3" markerStart="url(#rl-pfeil)" markerEnd="url(#rl-pfeil)" />
        <circle cx="100" cy="74" r="5" fill="var(--accent)" />
        {/* Beschriftung rechts, mit Hinweislinien */}
        <line x1="108" y1="74" x2="182" y2="74" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" />
        <text x="186" y="78" fontSize="12" fill="currentColor">7. Halswirbel</text>
        <line x1="104" y1="148" x2="182" y2="148" stroke="var(--accent)" strokeOpacity=".5" strokeWidth="1" />
        <text x="186" y="153" fontSize="14" fontWeight="700" fill="var(--accent)">Rückenlänge</text>
        <line x1="166" y1="221" x2="182" y2="221" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" />
        <text x="186" y="219" fontSize="12" fill="currentColor">Oberkante</text>
        <text x="186" y="233" fontSize="12" fill="currentColor">Beckenkamm</text>
        <text x="186" y="248" fontSize="11" fill="var(--warn)">Gürtel als Marke</text>
      </svg>
      <figcaption className="space-y-3 text-[0.97rem] leading-relaxed">
        <ol className="space-y-2.5">
          {[
            ["Kopf nach vorn neigen.", "Der Wirbel, der dann am Nackenansatz am deutlichsten heraustritt, ist der siebte Halswirbel. Dort beginnt die Messung."],
            ["Gürtel umlegen.", "Mit den Fingern die Hüftknochen seitlich ertasten und den Gürtel genau auf ihre Oberkante legen."],
            ["Entlang der Wirbelsäule messen.", "Vom Halswirbel bis zur Linie des Gürtels. Aufrecht stehen, nicht ins Hohlkreuz."],
          ].map(([t, x], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <span>
                <strong>{t}</strong> {x}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">
          Allein geht es kaum. Zu zweit, mit einem weichen Maßband, dauert es eine Minute.
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * Netzrücken und Kontaktrücken im Schnitt, von der Seite. Der Abstand ist die
 * Belüftung — und derselbe Abstand schiebt den Schwerpunkt nach hinten.
 */
export function RueckensystemBild() {
  const tafel = (netz: boolean) => (
    <svg
      viewBox="0 0 200 220"
      className="mx-auto h-52 w-auto text-foreground"
      role="img"
      aria-label={
        netz
          ? "Netzrücken im Schnitt: Zwischen Rücken und Rucksack liegt ein Luftspalt, der Rucksack sitzt weiter hinten."
          : "Kontaktrücken im Schnitt: Der Rucksack liegt direkt am Rücken an, der Schwerpunkt liegt näher am Körper."
      }
    >
      {/* Rücken im Profil */}
      <path
        d="M60 10 C52 40 48 70 54 100 C60 130 58 160 48 200"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".5"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {netz ? (
        <>
          {/* gespanntes Netz, dahinter der gebogene Rucksack */}
          <path d="M64 30 C60 70 60 120 64 170" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="4 3" />
          <path d="M92 26 C80 70 80 130 92 176 L150 176 C160 130 160 70 150 26 Z" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeOpacity=".45" strokeWidth="2" />
          {[60, 95, 130].map((y) => (
            <path key={y} d={`M66 ${y} h14`} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity=".8" />
          ))}
          <circle cx="121" cy="104" r="6" fill="var(--warn)" />
        </>
      ) : (
        <>
          <path d="M60 26 C52 70 52 130 60 176 L128 176 C138 130 138 70 128 26 Z" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeOpacity=".45" strokeWidth="2" />
          <circle cx="95" cy="104" r="6" fill="var(--warn)" />
        </>
      )}
      <text x="100" y="206" textAnchor="middle" fontSize="11" fill="var(--warn)">● Schwerpunkt</text>
    </svg>
  );
  return (
    <figure className="grid gap-6 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2 sm:p-6">
      {[
        {
          netz: true,
          titel: "Netzrücken",
          text: "Ein gespanntes Netz liegt am Rücken, der Rucksack selbst steht ein paar Zentimeter dahinter. Die Luft zieht durch — der Rücken bleibt deutlich trockener. Dafür sitzt die Last weiter hinten.",
        },
        {
          netz: false,
          titel: "Kontaktrücken",
          text: "Gepolsterte Flächen oder Schaumstoff mit Kanälen liegen direkt an. Der Rucksack geht jede Bewegung mit, der Schwerpunkt bleibt nah am Körper. Dafür schwitzt man mehr.",
        },
      ].map((x) => (
        <div key={x.titel}>
          {tafel(x.netz)}
          <h3 className="mt-2 font-semibold">{x.titel}</h3>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{x.text}</p>
        </div>
      ))}
    </figure>
  );
}

/**
 * Packzonen im Rucksack — nach der Empfehlung des Alpenvereins Südtirol:
 * Schweres in die Mitte nah an den Rücken, selten Gebrauchtes nach unten,
 * oft Gebrauchtes nach oben und in den Deckel.
 */
export function PackBild() {
  const zonen: { y: number; h: number; farbe: string; deckkraft: number; titel: string; text: string }[] = [
    { y: 18, h: 34, farbe: "var(--accent)", deckkraft: 0.25, titel: "Deckel", text: "Handy, Karte, Mütze, Riegel, Erste-Hilfe-Set — nichts Schweres, das gegen den Kopf schlägt" },
    { y: 54, h: 52, farbe: "var(--accent)", deckkraft: 0.4, titel: "Oben", text: "Leichtes: die warme Schicht, Kleidung zum Wechseln unterwegs" },
    { y: 108, h: 70, farbe: "var(--warn)", deckkraft: 0.55, titel: "Mitte, am Rücken", text: "Das Schwere, nah am Rücken: Trinkblase oder Thermosflasche, Verpflegung, Kocher" },
    { y: 180, h: 46, farbe: "currentColor", deckkraft: 0.18, titel: "Unten", text: "Leicht und voluminös, erst abends gebraucht: Hüttenschlafsack, Wechselwäsche" },
  ];
  return (
    <figure className="grid gap-6 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[12rem_1fr] sm:items-center sm:p-6">
      <svg viewBox="0 0 150 240" className="mx-auto h-64 w-auto text-foreground" role="img" aria-label="Packzonen: Deckel und oben für häufig Gebrauchtes, Mitte am Rücken für Schweres, unten für Dinge, die erst abends gebraucht werden.">
        <clipPath id="pack-form">
          <path d="M20 40 C20 20 40 14 75 14 C110 14 130 20 130 40 L134 206 C134 222 120 228 75 228 C30 228 16 222 16 206 Z" />
        </clipPath>
        <g clipPath="url(#pack-form)">
          {zonen.map((z) => (
            <rect key={z.titel} x="0" y={z.y} width="150" height={z.h} fill={z.farbe} fillOpacity={z.deckkraft} />
          ))}
          {/* Rücken ist links: das Schwere liegt nah dran */}
          <rect x="16" y="108" width="12" height="70" fill="var(--warn)" fillOpacity=".5" />
        </g>
        <path d="M20 40 C20 20 40 14 75 14 C110 14 130 20 130 40 L134 206 C134 222 120 228 75 228 C30 228 16 222 16 206 Z" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" />
        <text x="4" y="238" fontSize="10" fill="currentColor" fillOpacity=".7">← Rücken</text>
        {zonen.map((z, i) => (
          <text key={z.titel} x="75" y={z.y + z.h / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
            {i + 1}
          </text>
        ))}
      </svg>
      <figcaption>
        <ol className="space-y-3">
          {zonen.map((z, i) => (
            <li key={z.titel} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <span className="text-[0.97rem] leading-relaxed">
                <strong>{z.titel}.</strong> <span className="text-muted">{z.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

/**
 * Spikes, Grödel, Steigeisen — drei Sohlen von unten. Die Unterschiede sind
 * sichtbar: wenige kurze Stifte, eine Kette mit Zacken, ein starrer Rahmen
 * mit Frontzacken. Was die Zeichnung zeigt, steht darunter in Worten.
 */
export function TraktionBild() {
  const sohle = "M40 12 C60 6 78 14 80 40 C82 70 74 88 72 110 C70 136 76 160 68 180 C62 194 34 196 28 180 C20 160 26 136 24 110 C22 88 16 64 18 40 C20 18 26 14 40 12 Z";
  const arten: { titel: string; unter: string; text: string; inhalt: React.ReactNode }[] = [
    {
      titel: "Schuhspikes",
      unter: "Gehweg, Glatteis",
      text: "Ein Gummirahmen mit wenigen kurzen Stiften. Für flache, vereiste Wege im Alltag.",
      inhalt: (
        <>
          <path d={sohle} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="6" />
          {[[38, 40], [62, 44], [44, 76], [52, 150], [40, 170], [60, 168]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="currentColor" fillOpacity=".7" />
          ))}
        </>
      ),
    },
    {
      titel: "Grödel",
      unter: "Winterwanderweg, vereister Pfad",
      text: "Zacken von rund einem Zentimeter an Ketten, gehalten von einem Gummirahmen. Passen über fast jeden Schuh.",
      inhalt: (
        <>
          <path d={sohle} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="6" />
          <path d="M30 40 L50 58 L72 40 M26 78 L50 58 L74 78 M28 150 L48 164 L70 150 M34 180 L48 164 L64 180" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" />
          {[[30, 40], [72, 40], [26, 78], [74, 78], [50, 58], [28, 150], [70, 150], [48, 164], [34, 180], [64, 180]].map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x - 4} ${y + 3} L${x} ${y - 5} L${x + 4} ${y + 3} Z`} fill="var(--accent)" />
          ))}
        </>
      ),
    },
    {
      titel: "Steigeisen",
      unter: "Firn, steile Schneefelder, Gletscher",
      text: "Ein starrer Rahmen aus Stahl oder Aluminium mit langen Zacken und zwei Frontzacken. Braucht eine Bindung und den passenden Schuh.",
      inhalt: (
        <>
          <path d={sohle} fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
          <path d="M26 30 H74 V92 H26 Z M30 142 H70 V184 H30 Z" fill="none" stroke="var(--warn)" strokeWidth="4" strokeLinejoin="round" />
          <path d="M50 92 V142" stroke="var(--warn)" strokeWidth="4" />
          {[[26, 30], [74, 30], [26, 92], [74, 92], [30, 142], [70, 142], [30, 184], [70, 184]].map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x - 5} ${y + 4} L${x} ${y - 7} L${x + 5} ${y + 4} Z`} fill="var(--warn)" />
          ))}
          <path d="M40 30 L38 4 L46 30 M54 30 L62 4 L60 30" fill="var(--warn)" stroke="var(--warn)" strokeWidth="2" strokeLinejoin="round" />
        </>
      ),
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {arten.map((a) => (
        <figure key={a.titel} className="rounded-xl border border-line bg-card p-5">
          <svg viewBox="0 0 100 200" className="mx-auto h-40 w-auto text-foreground" aria-hidden>
            {a.inhalt}
          </svg>
          <figcaption className="mt-3">
            <h3 className="font-semibold">{a.titel}</h3>
            <p className="text-sm font-medium text-accent">{a.unter}</p>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{a.text}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * Packmaße im Maßstab zueinander — nur für Angebote, die eines nennen. Ein
 * Rechteck je Modell, dazu eine Trinkflasche als Größenvergleich, deren Maße
 * als Richtwert gekennzeichnet sind.
 */
export function PackmassVergleich({
  eintraege,
  vergleich,
}: {
  eintraege: { name: string; zusatz?: string; b: number; h: number; gramm?: number | null }[];
  vergleich?: { name: string; b: number; h: number };
}) {
  const alle = [...eintraege, ...(vergleich ? [{ ...vergleich, gramm: null, vergleich: true }] : [])] as {
    name: string; zusatz?: string; b: number; h: number; gramm?: number | null; vergleich?: boolean;
  }[];
  const skala = 6; // Pixel je Zentimeter im viewBox
  const spalte = 92;
  const hoehe = Math.max(...alle.map((e) => e.h)) * skala + 74;
  return (
    <figure className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${alle.length * spalte} ${hoehe}`}
          className="mx-auto h-auto w-full min-w-[30rem] max-w-3xl text-foreground"
          role="img"
          aria-label={`Packmaße im Vergleich: ${alle.map((e) => `${e.name}${e.zusatz ? ` ${e.zusatz}` : ""} ${e.b} × ${e.h} cm`).join(", ")}.`}
        >
          {alle.map((e, i) => {
            const w = e.b * skala;
            const h = e.h * skala;
            const x = i * spalte + (spalte - w) / 2;
            const y = hoehe - 58 - h;
            return (
              <g key={`${e.name}-${e.zusatz ?? ""}`}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={Math.min(w, h) / 3}
                  fill={e.vergleich ? "none" : "var(--accent)"}
                  fillOpacity={e.vergleich ? 0 : 0.8}
                  stroke={e.vergleich ? "currentColor" : "none"}
                  strokeOpacity=".45"
                  strokeDasharray={e.vergleich ? "4 3" : undefined}
                  strokeWidth="2"
                />
                <text x={i * spalte + spalte / 2} y={hoehe - 40} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">
                  {e.name}
                </text>
                <text x={i * spalte + spalte / 2} y={hoehe - 26} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity=".8">
                  {e.zusatz ?? ""}
                </text>
                <text x={i * spalte + spalte / 2} y={hoehe - 11} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity=".65">
                  {e.b} × {e.h} cm{e.gramm ? ` · ${e.gramm} g` : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm text-muted">
        Packmaße laut Hersteller, maßstabsgetreu zueinander. Gestrichelt zum Vergleich eine
        Trinkflasche, Maße als Richtwert.
      </figcaption>
    </figure>
  );
}

/**
 * Das alpine Notsignal als Zeitleiste: sechs Zeichen in einer Minute, eine
 * Minute Pause, dann von vorn. Die Antwort der Retter: drei Zeichen pro
 * Minute. So beschreibt es der DAV; das Bild macht den Rhythmus sichtbar,
 * den man sich im Ernstfall merken muss.
 */
export function NotsignalBild() {
  const x0 = 90;
  const breite = 520; // zwei Minuten
  const px = (s: number) => x0 + (s / 120) * breite;
  const reihe = (y: number, sekunden: number[], farbe: string) =>
    sekunden.map((s) => <circle key={`${y}-${s}`} cx={px(s)} cy={y} r="9" fill={farbe} />);
  return (
    <figure className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 640 170"
          className="mx-auto h-auto w-full min-w-[32rem] text-foreground"
          role="img"
          aria-label="Alpines Notsignal: sechs Zeichen innerhalb einer Minute, also alle zehn Sekunden, dann eine Minute Pause und wiederholen. Antwort: drei Zeichen pro Minute, alle zwanzig Sekunden."
        >
          {/* Zeitachse */}
          <line x1={px(0)} y1="136" x2={px(120)} y2="136" stroke="currentColor" strokeOpacity=".35" />
          {[0, 30, 60, 90, 120].map((s) => (
            <g key={s}>
              <line x1={px(s)} y1="131" x2={px(s)} y2="141" stroke="currentColor" strokeOpacity=".35" />
              <text x={px(s)} y="158" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".7">
                {s === 0 ? "0" : `${s} s`}
              </text>
            </g>
          ))}
          {/* Minute eins: Signal, Minute zwei: Pause */}
          <rect x={px(60)} y="22" width={px(120) - px(60)} height="44" rx="8" fill="currentColor" fillOpacity=".05" />
          <text x={px(90)} y="49" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity=".6">
            eine Minute Pause
          </text>
          <text x="0" y="49" fontSize="13" fontWeight="700" fill="var(--warn)">Notsignal</text>
          {reihe(44, [0, 10, 20, 30, 40, 50], "var(--warn)")}
          <text x="0" y="104" fontSize="13" fontWeight="700" fill="var(--accent)">Antwort</text>
          {reihe(99, [0, 20, 40, 60, 80, 100], "var(--accent)")}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm text-muted">
        Sechs Zeichen pro Minute — rufen, pfeifen, mit der Stirnlampe blinken —, dann eine Minute
        Pause, dann von vorn. Die Retter antworten mit drei Zeichen pro Minute.
      </figcaption>
    </figure>
  );
}
