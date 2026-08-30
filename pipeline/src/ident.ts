/**
 * Kurzer, stabiler Anhänger aus der OSM-Identität (FNV-1a). Löst
 * Slug-Kollisionen ohne Abhängigkeit von der Verarbeitungsreihenfolge —
 * ein durchgezählter Suffix ließe URLs zwischen Objekten wandern, sobald
 * sich der Datenbestand ändert.
 */
export function kennung(osmType: string, osmId: number | string): string {
  let h = 0x811c9dc5;
  for (const ch of `${osmType}/${osmId}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(6, "0").slice(-5);
}
