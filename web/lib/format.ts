export const nf = new Intl.NumberFormat("de-DE");

export const km = (v: number) =>
  v.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** JSON-LD sicher einbetten: </script> im Datenstrom würde den Block sprengen. */
export function jsonLd(data: unknown) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export const gebuehrText = (g: boolean | null, info: string | null) => {
  if (g === false) return "kostenfrei";
  if (g === true) return info ? `gebührenpflichtig (${info})` : "gebührenpflichtig";
  return null;
};

/** Deutsche Aufzählung: "A", "A und B", "A, B und C". */
export function aufzaehlung(teile: string[]): string {
  if (teile.length <= 1) return teile[0] ?? "";
  return `${teile.slice(0, -1).join(", ")} und ${teile.at(-1)}`;
}
