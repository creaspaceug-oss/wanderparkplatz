const UMLAUT: Record<string, string> = {
  ä: "ae", ö: "oe", ü: "ue", ß: "ss", é: "e", è: "e", ê: "e",
  á: "a", à: "a", â: "a", ô: "o", û: "u", ç: "c", ñ: "n",
};

/** Muss zur Normalform im Suchindex passen (pipeline/src/geo.ts). */
export function suchform(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüßéèêáàâôûçñ]/g, (c) => UMLAUT[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
