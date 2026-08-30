/** Sternleiste zur Anzeige. Halbe Sterne über eine Breitenmaske. */
export default function Sterne({
  wert,
  groesse = "text-base",
}: {
  wert: number;
  groesse?: string;
}) {
  const anteil = Math.max(0, Math.min(100, (wert / 5) * 100));
  return (
    <span className={`relative inline-block ${groesse} leading-none`} aria-hidden>
      <span className="text-line">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-amber-500"
        style={{ width: `${anteil}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}
