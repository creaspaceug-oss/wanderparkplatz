import { cache } from "react";

/**
 * Anbindung an die Amazon Creators API — nur für Preis, Bild und Verfügbarkeit.
 *
 * Bewusst eng gefasst. Die API liefert Titel, herstellergeschriebene
 * Aufzählungspunkte, Preis und Bild; das ist ein Katalog, kein Vergleich. Was
 * ein Produkt taugt, steht in wanderstoecke.ts und ist von Hand geprüft.
 *
 * Eine Falle, die teuer wäre: `itemInfo.productInfo.itemDimensions.weight` ist
 * das VERSANDGEWICHT. Für den Black Diamond Trail Back stehen dort 1,23 kg,
 * das Paar wiegt real rund 500 g. Dieses Feld wird hier deshalb gar nicht erst
 * ausgelesen — Gewichte kommen aus der gepflegten Liste.
 */

const TOKEN_URL = "https://api.amazon.co.uk/auth/o2/token";
const ITEMS_URL = "https://creatorsapi.amazon/catalog/v1/getItems";
/** Mehr nimmt getItems nicht an — ab elf ASINs antwortet Amazon mit 400. */
const JE_ABRUF = 10;
const MARKT = "www.amazon.de";

export interface Preisstand {
  /** Bruttopreis in Euro, so wie Amazon ihn im Moment des Abrufs nennt. */
  betrag: number | null;
  /** Fertig formatiert, etwa "89,90 €". */
  anzeige: string | null;
  /** Unverbindliche Preisempfehlung, falls Amazon eine nennt. */
  uvp: number | null;
  /**
   * Ersparnis gegenüber der UVP in Prozent — nur wenn Amazon sie im selben
   * Abruf liefert. Rabatte dürfen laut Programmbedingungen nur aus der API
   * kommen, nie aus einer eigenen Rechnung oder einem gespeicherten Wert.
   */
  ersparnis: number | null;
  bild: string | null;
  url: string;
  /** Zeitpunkt des Abrufs — Amazon verlangt, dass er dabeisteht. */
  abgerufen: string;
}

let token: { wert: string; gueltigBis: number } | null = null;

async function zugang(): Promise<string> {
  if (token && token.gueltigBis > Date.now() + 60_000) return token.wert;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.AMAZON_CREATOR_CREDENTIAL_ID,
      client_secret: process.env.AMAZON_CREATOR_SECRET,
      scope: process.env.AMAZON_CREATOR_SCOPE ?? "creatorsapi::default",
    }),
    cache: "no-store",
  });
  const d = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!d.access_token) throw new Error(`Amazon-Zugang: ${d.error_description ?? res.status}`);
  token = { wert: d.access_token, gueltigBis: Date.now() + (d.expires_in ?? 3600) * 1000 };
  return token.wert;
}

interface AmazonTreffer {
  asin: string;
  detailPageURL: string;
  images?: { primary?: { large?: { url?: string } } };
  itemInfo?: { title?: { displayValue?: string } };
  offersV2?: {
    listings?: {
      price?: {
        money?: { amount?: number; displayAmount?: string };
        savingBasis?: { money?: { amount?: number } };
        savings?: { percentage?: number };
      };
    }[];
  };
}

/**
 * Preise je Produktgruppe in einem Rutsch holen.
 *
 * Amazon erlaubt kein Zwischenspeichern über 24 Stunden. Die Seite
 * revalidiert stündlich, das liegt weit darunter. Fällt der Abruf aus, gibt
 * die Funktion null zurück und die Seite zeigt den Preis schlicht nicht an —
 * ein veralteter Preis wäre schlimmer als gar keiner.
 */
export const preise = cache(async (asins: string[]): Promise<Map<string, Preisstand>> => {
  const map = new Map<string, Preisstand>();
  const tag = process.env.AMAZON_PARTNER_TAG;
  if (!tag || !process.env.AMAZON_CREATOR_CREDENTIAL_ID) return map;

  let kopf: string;
  try {
    kopf = await zugang();
  } catch (err) {
    console.error("Amazon:", (err as Error).message);
    return map;
  }

  const abgerufen = new Date().toISOString();

  // getItems nimmt bis zu zehn ASINs auf einmal. Bis hierher lief jede ASIN
  // als eigene Stichwortsuche, nacheinander, weil Amazon parallele Anfragen
  // drosselt — auf der Trinkblasenseite mit 20 Produkten dauerte das 25
  // Sekunden, und Next.js bricht das Erzeugen einer Seite nach 60 ab. Jetzt
  // sind es zwei Abrufe mit zusammen unter zwei Sekunden.
  const hole = async (paket: string[]) => {
    const res = await fetch(ITEMS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kopf}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-marketplace": MARKT,
      },
      body: JSON.stringify({
        itemIds: paket,
        partnerTag: tag,
        marketplace: MARKT,
        resources: ["images.primary.large", "itemInfo.title", "offersV2.listings.price"],
      }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = (await res.json()) as { itemsResult?: { items?: AmazonTreffer[] } };
    return d.itemsResult?.items ?? [];
  };

  const eindeutig = [...new Set(asins)];
  for (let i = 0; i < eindeutig.length; i += JE_ABRUF) {
    const paket = eindeutig.slice(i, i + JE_ABRUF);
    let treffer: AmazonTreffer[] = [];
    for (let versuch = 1; versuch <= 2; versuch++) {
      try {
        treffer = await hole(paket);
        break;
      } catch (err) {
        if (versuch === 2) console.error(`Amazon ${paket.join(",")}:`, (err as Error).message);
        else await new Promise((r) => setTimeout(r, 1200));
      }
    }
    for (const t of treffer) {
      if (!paket.includes(t.asin)) continue;
      const p = t.offersV2?.listings?.[0]?.price;
      map.set(t.asin, {
        betrag: p?.money?.amount ?? null,
        anzeige: p?.money?.displayAmount ?? null,
        uvp: p?.savingBasis?.money?.amount ?? null,
        ersparnis: p?.savings?.percentage ?? null,
        bild: t.images?.primary?.large?.url ?? null,
        url: t.detailPageURL,
        abgerufen,
      });
    }
  }
  return map;
});

/**
 * Verweis mit Partnerkennung, falls die API nichts geliefert hat.
 *
 * Nicht die schöne Variante — die URL aus der API trägt zusätzlich linkCode
 * und psc —, aber sie funktioniert und die Kennung ist drin.
 */
/**
 * Die Hinweise, die Amazon vorschreibt, an einer Stelle.
 *
 * PREISHINWEIS muss neben jeder Preisangabe stehen (oder per Verweis
 * erreichbar sein) und nennt ausdrücklich auch die Verfügbarkeit — nicht nur
 * den Preis. HERKUNFT und PARTNER sind die Pflichtsätze des Programms.
 */
export const PREISHINWEIS =
  "Preise und Verfügbarkeit entsprechen dem angegebenen Zeitpunkt und können sich seitdem geändert haben.";
export const HERKUNFT =
  "Bestimmte Inhalte auf dieser Seite stammen von Amazon. Sie werden ohne Gewähr bereitgestellt und können jederzeit geändert oder entfernt werden.";
export const PARTNER = "Als Amazon-Partner verdienen wir an qualifizierten Verkäufen.";

export const partnerUrl = (asin: string) =>
  `https://www.amazon.de/dp/${asin}?tag=${process.env.AMAZON_PARTNER_TAG ?? ""}`;
