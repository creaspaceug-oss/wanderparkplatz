import type { Metadata } from "next";
import Link from "next/link";
import Brotkrumen from "@/components/Brotkrumen";
import Packliste from "@/components/ausruestung/Packliste";
import { Kapitel, Merksatz, Kartenraster } from "@/components/ausruestung/Bausteine";
import { HUETTENLISTE, QUELLEN_HUB } from "@/lib/ausruestung/packliste";
import { sichtbar } from "@/lib/ausruestung/freigabe";
import { jsonLd } from "@/lib/format";
import { titel, beschreibung } from "@/lib/meta";

/* Täglich: Die Seite verweist auf Vergleiche, die zeitgesteuert erscheinen. */
export const revalidate = 86400;

const PFAD = "/ausruestung/huettentour";

export const metadata: Metadata = {
  title: titel("Hüttentour: Packliste nach dem Alpenverein zum Abhaken"),
  description: beschreibung(
    "Was auf eine Hüttentour mitmuss: die Packliste des Alpenvereins zum Abhaken, vom Hüttenschlafsack über Ohrstöpsel bis zum Bargeld — mit Erklärung, warum welcher Punkt draufsteht.",
  ),
  alternates: { canonical: PFAD },
};

const FRAGEN = [
  {
    frage: "Was muss ich auf einer Alpenvereinshütte selbst mitbringen?",
    antwort:
      "Einen Hüttenschlafsack, Hausschuhe, ein kleines Handtuch und den Waschbeutel. Dazu Ohrstöpsel fürs Lager, eine Stirn- oder Taschenlampe für die Nacht und den DAV-Ausweis. Das steht so in der Packliste des Deutschen Alpenvereins.",
  },
  {
    frage: "Wie viel Liter Rucksack brauche ich für eine Hüttentour?",
    antwort:
      "Der Alpenverein nennt 30 bis 40 Liter, je nach Länge der Tour. Eine Regenhülle gehört dazu.",
  },
  {
    frage: "Brauche ich Bargeld auf der Hütte?",
    antwort:
      "Ja. Auf vielen Hütten ist elektronisches Bezahlen nicht möglich, weil Netzabdeckung oder Stromversorgung fehlen. Der Alpenverein führt ausreichend Bargeld deshalb ausdrücklich auf der Liste.",
  },
  {
    frage: "Wie viel Wasser soll ich dabeihaben?",
    antwort:
      "Der Alpenverein empfiehlt eine Trink- oder Thermosflasche mit idealerweise mindestens zwei Litern. Wasser ist schwer: Wer unterwegs an Quellen nachfüllt, spart Gewicht — braucht dafür aber ein Verfahren, das Keime zurückhält.",
  },
];

export default function Huettentour() {
  const sichtbare = Array.from(
    new Set(
      HUETTENLISTE.flatMap((g) => g.posten.map((p) => p.pfad)).filter(
        (p): p is string => Boolean(p) && sichtbar(p!),
      ),
    ),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FRAGEN.map((f) => ({
            "@type": "Question",
            name: f.frage,
            acceptedAnswer: { "@type": "Answer", text: f.antwort },
          })),
        })}
      />

      <Brotkrumen
        pfad={[
          { name: "Startseite", url: "/" },
          { name: "Ausrüstung", url: "/ausruestung" },
        ]}
        aktuell="Hüttentour"
      />

      <header className="mt-4 overflow-hidden rounded-3xl bg-sand px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem]">
          Hüttentour: Die Packliste des Alpenvereins zum Abhaken
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Das oberste Motto lautet: nur das Wichtigste mitnehmen, ohne auf die Sicherheitsausrüstung
          zu verzichten. So schreibt es der Deutsche Alpenverein — denn das Gepäck trägt man über
          weite Strecken und durch anstrengende Auf- und Abstiege.
        </p>
      </header>

      <Kapitel id="packliste" titel="Packliste zum Abhaken" unterzeile="Nach der Liste des Deutschen Alpenvereins." breit>
        <p className="max-w-3xl">
          Die Gliederung stammt aus der{" "}
          <a href={QUELLEN_HUB.davHuette} className="underline hover:text-accent" rel="noopener" target="_blank">
            Packliste für die Hüttenübernachtung
          </a>{" "}
          des DAV. Zwei Punkte haben wir ergänzt und als solche markiert.
        </p>
        <Packliste sichtbare={sichtbare} liste={HUETTENLISTE} ueberschrift="für die Hüttenübernachtung" />
      </Kapitel>

      <Kapitel id="warum" titel="Warum diese Punkte draufstehen" breit>
        <Kartenraster
          eintraege={[
            {
              titel: "Hüttenschlafsack",
              text: "Auf Alpenvereinshütten ist er verlangt. Die Hütten stellen Decken, aber kein Bettzeug — der Schlafsack ist die Trennschicht dazwischen.",
            },
            {
              titel: "Ohrstöpsel",
              text: "Im Matratzenlager schläft man zu acht oder zu zwanzig. Der DAV führt sie nicht aus Bequemlichkeit auf der Liste, sondern weil eine durchwachte Nacht die Tour am nächsten Tag unsicherer macht.",
            },
            {
              titel: "Bargeld",
              text: "Viele Hütten können nicht elektronisch abrechnen, weil Netz oder Strom fehlen. Wer ohne Bargeld ankommt, hat ein Problem, das sich oben nicht mehr lösen lässt.",
            },
            {
              titel: "Biwaksack",
              text: "Er wiegt wenig und bleibt im Rucksack, bis etwas passiert. Der DAV nennt ihn zusammen mit dem Erste-Hilfe-Set als die Sicherheitsausrüstung, bei der nicht gespart wird.",
            },
          ]}
        />
        <Merksatz>
          Vor der Buchung auf die Website der Hütte schauen — der DAV rät ausdrücklich dazu.
          Besonderheiten stehen dort, nicht in einer allgemeinen Liste.
        </Merksatz>
      </Kapitel>

      <Kapitel id="vergleiche" titel="Die Ausrüstung dazu">
        <p>
          Zu den Punkten, bei denen die Wahl schwerfällt, haben wir eigene Vergleiche — mit Quellen
          für jede Angabe und dem, was gegen ein Produkt spricht:
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["/ausruestung/huettenschlafsack", "Hüttenschlafsack", "Seide, Baumwolle oder Mikrofaser — und was Bettwanzen damit zu tun haben."],
            ["/ausruestung/wanderrucksack", "Wanderrucksack", "Wie viel Liter, Rückenlänge messen, Damen- und Herrenmodelle."],
            ["/ausruestung/wanderschuhe", "Wanderschuhe", "Welche Kategorie das Gelände verlangt."],
            ["/ausruestung/wasserfilter", "Wasserfilter", "Wenn unterwegs aus Quellen geschöpft wird."],
            ["/ausruestung/erste-hilfe-set", "Erste-Hilfe-Set", "An der DAV-Liste gemessen."],
            ["/ausruestung/wandersocken", "Wandersocken", "Mehrere Tage, mehrere Paar."],
          ]
            .filter(([pfad]) => sichtbar(pfad))
            .map(([pfad, name, text]) => (
              <li key={pfad} className="rounded-xl border border-line bg-card p-4">
                <Link href={pfad} className="font-semibold hover:text-accent">
                  {name}
                </Link>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
        </ul>
      </Kapitel>

      <Kapitel id="fragen" titel="Häufige Fragen">
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {FRAGEN.map((f) => (
            <details key={f.frage} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.frage}
                <span aria-hidden className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.antwort}</p>
            </details>
          ))}
        </div>
      </Kapitel>

      <Kapitel id="methode" titel="Woher die Angaben stammen">
        <p>
          Liste und Gliederung stammen aus dem Artikel{" "}
          <a href={QUELLEN_HUB.davHuette} className="underline hover:text-accent" rel="noopener" target="_blank">
            Packliste für die Hüttenübernachtung
          </a>{" "}
          des Deutschen Alpenvereins vom 10. Juli 2025. Ergänzungen von uns — Wasserfilter und
          Regenhose — sind in der Liste markiert. Diese Seite enthält keine Partnerverweise; die
          stehen auf den verlinkten Vergleichen, dort gekennzeichnet.
        </p>
      </Kapitel>
    </div>
  );
}
