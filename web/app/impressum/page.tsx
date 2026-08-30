import type { Metadata } from "next";
import { BETREIBER } from "@/lib/betreiber";

export const metadata: Metadata = {
  title: "Impressum – wanderparkplatz.info",
  description: `Anbieterkennzeichnung nach § 5 DDG für ${BETREIBER.name}.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/impressum" },
};

export default function Impressum() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Impressum</h1>

      <h2 className="mt-8 text-xl font-semibold">Angaben gemäß § 5 DDG</h2>
      <address className="mt-3 not-italic leading-relaxed">
        {BETREIBER.name}
        <br />
        {BETREIBER.strasse}
        <br />
        {BETREIBER.plz} {BETREIBER.ort}
        <br />
        {BETREIBER.land}
      </address>

      <h2 className="mt-8 text-xl font-semibold">Kontakt</h2>
      <p className="mt-3">
        E-Mail:{" "}
        <a href={`mailto:${BETREIBER.email}`} className="text-accent underline">
          {BETREIBER.email}
        </a>
      </p>

      <h2 className="mt-8 text-xl font-semibold">Verbraucherstreitbeilegung</h2>
      <p className="mt-3 text-muted">
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Kartendaten</h2>
      <p className="mt-3 text-muted">
        Die Standorte und Merkmale der Wanderparkplätze sowie die Wanderwege stammen aus
        OpenStreetMap. © OpenStreetMap-Mitwirkende, lizenziert unter der{" "}
        <a
          href="https://opendatacommons.org/licenses/odbl/"
          rel="noopener"
          className="text-accent underline"
        >
          Open Database License (ODbL)
        </a>
        . Die Verwaltungsgrenzen beruhen auf dem Datensatz{" "}
        <a
          href="https://github.com/isellsoap/deutschlandGeoJSON"
          rel="noopener"
          className="text-accent underline"
        >
          deutschlandGeoJSON
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold">Haftung für Inhalte</h2>
      <p className="mt-3 text-muted">
        Die Angaben zu Wanderparkplätzen werden aus offenen Daten übernommen und
        automatisiert aufbereitet. Sie können unvollständig oder veraltet sein — insbesondere
        Gebühren, Kapazitäten und Zufahrtsregelungen ändern sich. Maßgeblich ist immer die
        Beschilderung vor Ort. Für Schäden, die aus der Nutzung dieser Angaben entstehen,
        wird keine Haftung übernommen.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Haftung für Links</h2>
      <p className="mt-3 text-muted">
        Diese Website verweist auf externe Seiten Dritter, etwa auf Kartendienste zur
        Routenführung. Auf deren Inhalte haben wir keinen Einfluss. Zum Zeitpunkt der
        Verlinkung waren keine Rechtsverstöße erkennbar. Werden uns Rechtsverletzungen
        bekannt, entfernen wir die betreffenden Links umgehend.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Urheberrecht</h2>
      <p className="mt-3 text-muted">
        Die von uns erstellten Inhalte und Darstellungen unterliegen dem deutschen
        Urheberrecht. Die zugrunde liegenden Geodaten stehen unter der oben genannten
        ODbL-Lizenz und dürfen unter deren Bedingungen weiterverwendet werden.
      </p>
    </div>
  );
}
