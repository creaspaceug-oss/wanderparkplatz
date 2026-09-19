import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import { kennzahlen, bestand } from "@/lib/queries";
import { BETREIBER } from "@/lib/betreiber";
import { MIN_AUSSAGEN } from "@/lib/inhalt";
import { jsonLd, nf } from "@/lib/format";
import { SITE } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Über uns – Datenquellen, Methode und Betreiber",
  description:
    "Woher die Daten dieses Verzeichnisses stammen, wie sie aufbereitet und wie oft sie aktualisiert werden — und wo ihre Grenzen liegen.",
  alternates: { canonical: "/ueber-uns" },
};

const datum = (iso: string | null) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("de-DE", {
        dateStyle: "long",
        timeZone: "UTC",
      })
    : null;

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">{titel}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default async function UeberUns() {
  const [zahlen, b] = await Promise.all([kennzahlen(), bestand()]);
  const lauf = datum(b.lauf);
  const abruf = datum(b.abruf);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Über wanderparkplatz.info",
          url: `${SITE}/ueber-uns`,
          publisher: { "@id": `${SITE}/#betreiber` },
        })}
      />

      <Brotkrumen pfad={[{ name: "Startseite", url: "/" }]} aktuell="Über uns" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Über wanderparkplatz.info</h1>

      <p className="mt-4 text-lg leading-relaxed text-muted">
        Wer wandern will, sucht zuerst einen Platz fürs Auto. Wanderparkplätze stehen in
        Kartendiensten zwar drin, aber ohne das, worauf es ankommt: Welcher Weg beginnt hier?
        Kostet das Parken etwas? Passen überhaupt genug Autos hin? Dieses Verzeichnis trägt
        genau diese Angaben für {nf.format(zahlen.gesamt)} Wanderparkplätze in Deutschland
        zusammen — in {nf.format(zahlen.orte)} Orten, {nf.format(zahlen.kreise)} Kreisen und{" "}
        {nf.format(zahlen.laender)} Bundesländern.
      </p>

      <Abschnitt titel="Woher die Daten stammen">
        <p>
          Standorte, Namen, Gebühren, Stellplatzzahlen, Untergrund und Wanderwege kommen aus{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            rel="noopener"
            className="text-accent underline"
          >
            OpenStreetMap
          </a>{" "}
          und stehen unter der Open Database License. Abgerufen wird über die Overpass-API.
          Die Verwaltungsgrenzen, mit denen jeder Platz seiner Gemeinde und seinem Kreis
          zugeordnet wird, stammen aus dem Datensatz deutschlandGeoJSON.
        </p>
        <p>
          Die Fotos zeigen Wanderziele, nicht die Parkplätze selbst — von Parkplätzen gibt es
          praktisch keine Bilder. Ausgewählt werden sie nicht nach Koordinaten, sondern über
          das Bild, das in Wikidata beim jeweiligen Objekt hinterlegt ist. Der Umweg lohnt
          sich: Eine Suche nach Koordinaten lieferte für die Burg Hohenzollern ein Gemälde und
          für einen Wasserfall die Kirche des Nachbarorts. Urheber und Lizenz stehen an jedem
          Bild.
        </p>
      </Abschnitt>

      <Abschnitt titel="Wie aus Rohdaten Seiten werden">
        <p>
          Aufgenommen wird nur, was in OpenStreetMap ausdrücklich als Wanderparkplatz
          ausgezeichnet oder als Ausgangspunkt für Wanderungen gekennzeichnet ist. Ein
          gewöhnlicher Supermarktparkplatz taucht hier nicht auf.
        </p>
        <p>
          Anschließend werden Dubletten entfernt. Dieselbe Fläche ist in OpenStreetMap
          gelegentlich zweimal erfasst, einmal als Punkt und einmal als Fläche. Trägt ein
          zweiter Eintrag denselben Namen und liegt weniger als 60 Meter entfernt, bleibt der
          besser belegte übrig.
        </p>
        <p>
          Danach wird verknüpft, und zwar nach festen Entfernungen. Ein Wanderweg gilt als Weg
          ab diesem Platz, wenn er höchstens 200 Meter entfernt vorbeiführt. Bei Wanderzielen
          hängt die Grenze von der Art ab: fünf Kilometer bei Gipfeln, drei bei Burgen,
          Wasserfällen, Höhlen und Aussichtstürmen, zweieinhalb bei Aussichtspunkten. Beim
          Umfeld ebenso: Schutzhütten und Aussichtspunkte bis anderthalb Kilometer, eine
          Gaststätte bis zwölfhundert Meter, eine Haltestelle bis tausend, eine Toilette bis
          fünfhundert — dorthin geht man keinen Kilometer. Eine Infotafel muss innerhalb von
          dreihundert Metern stehen, um überhaupt erwähnenswert zu sein. Alle Entfernungen
          sind Luftlinie, der tatsächliche Weg ist je nach Gelände deutlich länger.
        </p>
      </Abschnitt>

      <Abschnitt titel="Wie oft aktualisiert wird">
        <p>
          Ein automatischer Lauf prüft jede Woche, was veraltet ist, und holt nur das nach.
          Die Parkplätze selbst werden nach 30 Tagen erneuert, Wanderwege, Ziele und das
          Umfeld nach 90 Tagen, Ortsangaben nach 180 und Postleitzahlen nach einem Jahr.
          Bestehende Seiten behalten dabei ihre Adresse, und Bewertungen bleiben erhalten.
          {lauf ? ` Zuletzt gelaufen ist der Abgleich am ${lauf}.` : ""}
        </p>
        {/* Lauf und Abruf getrennt nennen, sonst behauptet die Seite eine
            Frische, die sie nicht hat: Ein Lauf, der nichts Überfälliges
            findet, fragt OpenStreetMap gar nicht erst und kommt vollständig
            aus dem Zwischenspeicher. */}
        {abruf && (
          <p>
            Ein Lauf heißt nicht, dass neue Daten geholt wurden — er prüft zuerst, was
            überhaupt fällig ist. Die Angaben zu den Parkplätzen selbst stammen aus einem
            Abruf vom {abruf}.
          </p>
        )}
      </Abschnitt>

      <Abschnitt titel="Was dieses Verzeichnis nicht leisten kann">
        <p>
          Niemand fährt die Plätze ab und prüft sie vor Ort. Alle Angaben stammen von
          ehrenamtlich Kartierenden und können unvollständig oder veraltet sein. Das betrifft
          vor allem Gebühren und Zufahrtsregelungen, die sich häufig ändern. Maßgeblich ist
          immer die Beschilderung vor Ort.
        </p>
        <p>
          Auch der Bestand selbst hat Lücken. Eine Gebührenangabe liegt für{" "}
          {nf.format(zahlen.mit_gebuehrenangabe)} der {nf.format(zahlen.gesamt)} Plätze vor,
          eine Stellplatzzahl für {nf.format(zahlen.mit_stellplatzangabe)}. Wo nichts erfasst
          ist, steht auch nichts — geraten wird nicht.
        </p>
        <p>
          Seiten mit weniger als {MIN_AUSSAGEN} konkreten Angaben bleiben erreichbar und
          verlinkt, werden Suchmaschinen aber nicht zur Aufnahme angeboten. Eine Seite, die
          kaum mehr als einen Namen trägt, hilft niemandem.
        </p>
      </Abschnitt>

      <Abschnitt titel="Bewertungen">
        <p>
          Jede Parkplatzseite lässt sich bewerten, ohne Konto und ohne Anmeldung. Jede
          Bewertung wird vor der Veröffentlichung gesichtet.
          {b.bewertungen > 0
            ? ` Derzeit sind ${nf.format(b.bewertungen)} Bewertungen veröffentlicht.`
            : ""}
        </p>
        <p>
          Gespeichert wird dabei keine IP-Adresse, sondern nur ein damit gebildeter, nicht
          rückrechenbarer Prüfwert. Er dient allein dazu, Mehrfacheinsendungen zu erkennen.
          Einzelheiten stehen in der{" "}
          <Link href="/datenschutz" className="text-accent underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </Abschnitt>

      <Abschnitt titel="Fehler gefunden?">
        <p>
          Der wirksamste Weg führt nicht über uns: Wer eine falsche Angabe direkt in{" "}
          <a href="https://www.openstreetmap.org/" rel="noopener" className="text-accent underline">
            OpenStreetMap
          </a>{" "}
          berichtigt, verbessert damit alle Dienste, die diese Daten nutzen —
          Navigationsgeräte und Wander-Apps eingeschlossen. Die Korrektur erscheint hier mit
          dem nächsten Lauf.
        </p>
        <p>
          Geht es um die Darstellung auf dieser Seite, um eine falsche Verknüpfung oder um ein
          unpassendes Bild, schreib uns an{" "}
          <a href={`mailto:${BETREIBER.email}`} className="text-accent underline">
            {BETREIBER.email}
          </a>
          .
        </p>
      </Abschnitt>

      <Abschnitt titel="Wer dahintersteht">
        <p>
          Betrieben wird wanderparkplatz.info von {BETREIBER.name} in {BETREIBER.ort}. Die
          vollständige Anbieterkennzeichnung steht im{" "}
          <Link href="/impressum" className="text-accent underline">
            Impressum
          </Link>
          .
        </p>
      </Abschnitt>

      <p className="mt-10 text-sm text-muted">
        Umfang des Bestands: {nf.format(zahlen.gesamt)} Wanderparkplätze,{" "}
        {nf.format(b.wanderwege)} Wanderwege und {nf.format(b.ziele)} Wanderziele mit eigener
        Seite.
      </p>
    </div>
  );
}
