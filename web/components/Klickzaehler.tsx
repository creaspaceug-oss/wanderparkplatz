"use client";

import { useEffect } from "react";

/**
 * Zählt Klicks auf Partnerverweise — ein Hörer für die ganze Seite.
 *
 * Statt jeden Verweis einzeln zu verdrahten, hängt ein einziger Hörer am
 * Dokument und erkennt Partnerverweise an ihrem rel="sponsored". So zählt
 * auch, was später dazukommt, ohne dass jemand daran denken muss.
 *
 * sendBeacon statt fetch: Der Browser schickt die Meldung zu Ende, während er
 * schon zu Amazon wechselt. Ein fetch würde beim Seitenwechsel abgebrochen —
 * und ausgerechnet die erfolgreichen Klicks fehlten in der Zählung.
 *
 * Gemeldet werden Pfad, Abschnitt und Produkt. Keine Kennung, kein Cookie,
 * nichts, was auf eine Person zurückführt.
 */
const PLAETZE = ["uebersicht", "berater", "vergleich", "modelle", "groesse", "leiste", "entscheidung"];

export default function Klickzaehler() {
  useEffect(() => {
    const hoerer = (e: MouseEvent) => {
      const ziel = e.target as HTMLElement | null;
      const link = ziel?.closest?.("a[rel~='sponsored']") as HTMLAnchorElement | null;
      if (!link) return;

      // Die Amazon-Adresse trägt die ASIN in /dp/<ASIN>.
      const asin = /\/dp\/([A-Z0-9]{10})/.exec(link.href)?.[1] ?? "";

      // Abschnitt: der nächste Vorfahre mit bekannter id. Die Merkleiste liegt
      // außerhalb der Abschnitte und meldet sich über data-platz.
      const abschnitt = link.closest("[data-platz]")?.getAttribute("data-platz")
        ?? link.closest(PLAETZE.map((p) => `#${p}`).join(","))?.id
        ?? "sonstiges";

      navigator.sendBeacon?.(
        "/api/klick",
        new Blob([JSON.stringify({ pfad: location.pathname, asin, platz: abschnitt })], {
          type: "application/json",
        }),
      );
    };

    // capture: Ein Klick auf das Bild im Verweis soll genauso zählen, und
    // manche Verweise rufen stopPropagation auf.
    document.addEventListener("click", hoerer, true);
    return () => document.removeEventListener("click", hoerer, true);
  }, []);

  return null;
}
