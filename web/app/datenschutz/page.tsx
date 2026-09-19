import type { Metadata } from "next";
import { BETREIBER } from "@/lib/betreiber";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – wanderparkplatz.info",
  description:
    "Welche Daten diese Website verarbeitet: Server-Logs, Standortabfrage, Bewertungen und Reichweitenmessung — ohne Cookies und ohne Tracking durch Dritte.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/datenschutz" },
};

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{titel}</h2>
      <div className="mt-3 space-y-3 text-muted">{children}</div>
    </section>
  );
}

export default function Datenschutz() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Datenschutzerklärung</h1>
      <p className="mt-4 text-muted">
        Diese Website kommt ohne Cookies, ohne Login und ohne Werbenetzwerke aus. Verarbeitet
        wird nur, was für den Betrieb und die genannten Funktionen nötig ist.
      </p>

      <Abschnitt titel="Verantwortlicher">
        <address className="not-italic">
          {BETREIBER.name}
          <br />
          {BETREIBER.strasse}
          <br />
          {BETREIBER.plz} {BETREIBER.ort}
          <br />
          {BETREIBER.land}
          <br />
          <a href={`mailto:${BETREIBER.email}`} className="text-accent underline">
            {BETREIBER.email}
          </a>
        </address>
      </Abschnitt>

      <Abschnitt titel="Hosting und Server-Logdateien">
        <p>
          Die Website wird bei der Vercel Inc. (USA) betrieben. Beim Abruf einer Seite
          verarbeitet der Server technisch notwendige Zugriffsdaten: IP-Adresse, Zeitpunkt der
          Anfrage, aufgerufene Adresse, übertragene Datenmenge, Referrer sowie Browser- und
          Betriebssystemkennung. Diese Daten sind für die Auslieferung der Seite und für die
          Abwehr von Angriffen erforderlich.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt im
          sicheren und störungsfreien Betrieb. Mit Vercel besteht ein Vertrag zur
          Auftragsverarbeitung nach Art. 28 DSGVO. Soweit Daten in die USA übermittelt werden,
          stützt sich die Übermittlung auf die darin vereinbarten Standardvertragsklauseln.
          Die serverseitige Verarbeitung ist auf die Region Frankfurt am Main festgelegt; ausgeliefert werden die Seiten zusätzlich über das weltweite Auslieferungsnetz von Vercel.
        </p>
      </Abschnitt>

      <Abschnitt titel="Standortabfrage">
        <p>
          Über die Schaltfläche „Meinen Standort verwenden“ fragt die Website die
          Geolocation-Schnittstelle deines Browsers ab. Das geschieht ausschließlich, wenn du
          die Abfrage im Browser ausdrücklich bestätigst — Rechtsgrundlage ist damit Art. 6
          Abs. 1 lit. a DSGVO. Die Koordinaten werden an unseren Server übertragen, dort
          allein zur Berechnung der nächstgelegenen Wanderparkplätze verwendet und
          anschließend verworfen. Es findet keine Speicherung, keine Profilbildung und keine
          Weitergabe statt. Die Einwilligung kannst du jederzeit in den Einstellungen deines
          Browsers widerrufen.
        </p>
        <p>
          Alternativ kannst du einen Ort oder eine Postleitzahl eingeben. Dabei wird kein
          Standort erhoben.
        </p>
      </Abschnitt>

      <Abschnitt titel="Bewertungen">
        <p>
          Wenn du einen Wanderparkplatz bewertest, speichern wir die Sternezahl sowie die
          freiwilligen Angaben Text, Name und Besuchsdatum. Diese Angaben werden nach einer
          Prüfung auf der jeweiligen Parkplatzseite veröffentlicht. Der angegebene Name ist
          frei wählbar; die Angabe echter Personendaten ist nicht erforderlich.
        </p>
        <p>
          Zusätzlich speichern wir eine Absenderkennung: einen mit einem geheimen Schlüssel
          gesalzenen Hashwert aus IP-Adresse und Browserkennung. Die IP-Adresse selbst wird
          nicht gespeichert und lässt sich aus dem Hashwert nicht zurückrechnen. Die Kennung
          dient allein dazu, Mehrfach- und Massenbewertungen zu unterbinden. Rechtsgrundlage
          ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt in der Abwehr von
          Missbrauch und in der Verlässlichkeit der veröffentlichten Bewertungen.
        </p>
        <p>
          Veröffentlichte Bewertungen bleiben gespeichert, bis du ihre Löschung verlangst.
          Eine formlose Nachricht an{" "}
          <a href={`mailto:${BETREIBER.email}`} className="text-accent underline">
            {BETREIBER.email}
          </a>{" "}
          genügt; bitte nenne den Parkplatz und den ungefähren Zeitpunkt.
        </p>
      </Abschnitt>

      <Abschnitt titel="Reichweitenmessung">
        <p>
          Zur Auswertung der Nutzung setzen wir Vercel Web Analytics und Vercel Speed Insights
          ein, Dienste der Vercel Inc. Beide Dienste arbeiten ohne Cookies und ohne Zugriff auf
          Informationen in deinem Endgerät; ein Einwilligungsbanner nach § 25 TDDDG ist deshalb
          nicht erforderlich. Erhoben werden aufgerufene Seiten, Referrer, grobe
          Herkunftsregion, Gerätetyp sowie Messwerte zur Ladegeschwindigkeit. Aus diesen Daten
          wird ein nicht umkehrbarer Kennwert je Besuch gebildet, der nach 24 Stunden verfällt;
          es werden keine geräteübergreifenden Profile gebildet und einzelne Personen nicht
          wiedererkannt.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt in
          der bedarfsgerechten Gestaltung und der technischen Optimierung des Angebots.
        </p>
      </Abschnitt>

      <Abschnitt titel="Amazon-Partnerprogramm">
        <p>
          Auf den Seiten unter <em>/ausruestung/</em> verweisen wir auf Produkte bei Amazon.
          Diese Verweise tragen eine Partnerkennung; kommt darüber ein Kauf zustande, erhalten
          wir eine Provision. Für dich ändert sich der Preis dadurch nicht. Solche Verweise sind
          an Ort und Stelle als Anzeige gekennzeichnet.
        </p>
        <p>
          Die Produktbilder werden von <em>m.media-amazon.com</em> geladen (Amazon Europe Core
          S.à r.l., 38 avenue John F. Kennedy, 1855 Luxemburg). Dabei wird deine IP-Adresse
          dorthin übertragen, ebenso Angaben zu Browser und Betriebssystem. Die
          Programmbedingungen lassen für gelistete Artikel keine eigenen Aufnahmen zu.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; das berechtigte Interesse liegt darin,
          Produkte überhaupt abbilden zu können. Preise und Verfügbarkeit fragen wir serverseitig
          ab — dabei werden keine Daten von dir übermittelt.
        </p>
        <p>
          Erst wenn du einen solchen Verweis anklickst, gelangst du zu Amazon, wo dann deren
          Datenschutzbestimmungen gelten.
        </p>
      </Abschnitt>

      <Abschnitt titel="Cookies und Dienste Dritter">
        <p>
          Diese Website setzt keine Cookies und bindet keine Werbenetzwerke oder
          Social-Media-Dienste ein; zum Amazon-Partnerprogramm siehe den Abschnitt darüber. Schriftarten werden vom eigenen Server ausgeliefert; es
          besteht keine Verbindung zu Google Fonts.
        </p>
        <p>
          <strong className="font-semibold">Karten von OpenStreetMap.</strong> Auf den
          Parkplatzseiten ist ein Kartenausschnitt der OpenStreetMap Foundation (St John’s
          Innovation Centre, Cowley Road, Cambridge, CB4 0WS, Vereinigtes Königreich)
          eingebettet. Er wird beim Aufruf der Seite geladen; dabei wird deine IP-Adresse an
          OpenStreetMap übertragen, ebenso Angaben zu Browser und Betriebssystem. Ohne diese
          Übertragung lässt sich die Karte technisch nicht ausliefern.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in
          der Darstellung der Lage eines Parkplatzes — für ein Parkplatzverzeichnis ist sie
          nicht Beiwerk, sondern der Gegenstand des Angebots. Die Einbettung setzt keine
          Cookies. Übertragen wird nur, was für den Abruf nötig ist; die Herkunftsseite wird
          nicht mitgeschickt. Es gelten die{" "}
          <a
            href="https://osmfoundation.org/wiki/Privacy_Policy"
            rel="noopener"
            target="_blank"
            className="underline hover:text-accent"
          >
            Datenschutzbestimmungen der OpenStreetMap Foundation
          </a>
          .
        </p>
        <p>
          Die Links zu Google Maps und Apple Karten führen erst nach einem Klick zum
          jeweiligen Anbieter, wo dann dessen Datenschutzbestimmungen gelten.
        </p>
      </Abschnitt>

      <Abschnitt titel="Kontaktaufnahme">
        <p>
          Schreibst du uns eine E-Mail, verarbeiten wir deine Angaben zur Bearbeitung der
          Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, bei vertragsbezogenen
          Anfragen Art. 6 Abs. 1 lit. b DSGVO. Die Nachrichten werden gelöscht, sobald der
          Vorgang abgeschlossen ist und keine Aufbewahrungspflichten entgegenstehen.
        </p>
      </Abschnitt>

      <Abschnitt titel="Deine Rechte">
        <p>
          Dir stehen gegenüber dem Verantwortlichen die Rechte auf Auskunft (Art. 15),
          Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
          Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21 DSGVO) zu. Erteilte
          Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen.
        </p>
        <p>
          Unabhängig davon kannst du dich bei einer Aufsichtsbehörde beschweren. Für uns
          zuständig ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
          Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart.
        </p>
      </Abschnitt>

      <Abschnitt titel="Stand">
        <p>Diese Datenschutzerklärung gilt ab August 2026.</p>
      </Abschnitt>
    </div>
  );
}
