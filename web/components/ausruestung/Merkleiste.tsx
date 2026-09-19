"use client";

import { useEffect, useState } from "react";

/**
 * Schmale Leiste am unteren Rand mit der Hauptempfehlung.
 *
 * Bewusst zurückhaltend, weil eine feste Seitenleiste schon einmal als störend
 * abgelehnt wurde:
 * - erscheint erst, wenn die Übersicht oben aus dem Bild gescrollt ist —
 *   solange die Empfehlung ohnehin sichtbar ist, wäre sie doppelt,
 * - verschwindet wieder, sobald das Seitenende erreicht ist,
 * - lässt sich wegklicken und bleibt dann für die Sitzung weg.
 *
 * Alle Inhalte kommen fertig vom Server; die Komponente entscheidet nur, ob
 * sie zu sehen ist.
 */
export default function Merkleiste({
  name,
  note,
  preis,
  zeit,
  bild,
  url,
  oben,
  unten,
}: {
  name: string;
  note?: string;
  preis?: string | null;
  zeit?: string | null;
  bild?: string | null;
  url: string;
  /** id des Elements, nach dem die Leiste erscheint. */
  oben: string;
  /** id des Elements, ab dem sie wieder verschwindet. */
  unten: string;
}) {
  const [nachOben, setNachOben] = useState(false);
  const [amEnde, setAmEnde] = useState(false);
  // Im Anfangszustand gelesen statt in einem Effekt. Server und erster
  // Browserdurchlauf rendern trotzdem dasselbe: Unsichtbar ist die Leiste
  // anfangs so oder so, weil nachOben erst nach dem Scrollen wahr wird.
  const [weg, setWeg] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem("merkleiste-weg") === "1";
    } catch {
      // Privater Modus oder gesperrter Speicher: dann eben jedes Mal.
      return false;
    }
  });

  useEffect(() => {
    const a = document.getElementById(oben);
    const b = document.getElementById(unten);
    if (!a || !b) return;
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.target === a) setNachOben(!e.isIntersecting && e.boundingClientRect.top < 0);
        if (e.target === b) setAmEnde(e.isIntersecting || e.boundingClientRect.top < 0);
      }
    });
    beobachter.observe(a);
    beobachter.observe(b);
    return () => beobachter.disconnect();
  }, [oben, unten]);

  const sichtbar = nachOben && !amEnde && !weg;

  const schliessen = () => {
    setWeg(true);
    try {
      sessionStorage.setItem("merkleiste-weg", "1");
    } catch {}
  };

  return (
    <div
      aria-hidden={!sichtbar}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition duration-300 motion-reduce:transition-none sm:px-4 sm:pb-4 ${
        sichtbar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-line bg-card/95 p-2.5 pr-3 shadow-lg backdrop-blur sm:gap-4 sm:p-3">
        {bild && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bild}
            alt=""
            referrerPolicy="no-referrer"
            className="hidden h-12 w-12 shrink-0 rounded-lg bg-white object-contain p-1 sm:block"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">
            Unsere erste Wahl{note ? ` · Warentest ${note}` : ""}
          </p>
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-[0.65rem] text-muted">
            Anzeige{zeit ? ` · Preis und Verfügbarkeit: Stand ${zeit} Uhr` : ""}
          </p>
        </div>
        <a
          href={url}
          rel="sponsored nofollow noopener"
          target="_blank"
          tabIndex={sichtbar ? 0 : -1}
          className="shrink-0 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 dark:text-background"
        >
          {preis ?? "Ansehen"} <span aria-hidden>→</span>
          <span className="sr-only"> bei Amazon, Anzeige</span>
        </a>
        <button
          type="button"
          onClick={schliessen}
          tabIndex={sichtbar ? 0 : -1}
          aria-label="Leiste schließen"
          className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-sand hover:text-foreground"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
