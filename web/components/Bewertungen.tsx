import Sterne from "./Sterne";
import type { Bewertung } from "@/lib/bewertung";

export default function Bewertungen({ items }: { items: Bewertung[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-5 divide-y divide-line">
      {items.map((b) => (
        <li key={b.id} className="py-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Sterne wert={b.sterne} />
            <span className="text-sm font-medium">{b.autor ?? "Anonym"}</span>
            <span className="text-sm text-muted">
              {new Date(b.erstellt).toLocaleDateString("de-DE")}
              {b.besucht_am &&
                ` · besucht ${new Date(b.besucht_am).toLocaleDateString("de-DE", {
                  month: "long",
                  year: "numeric",
                })}`}
            </span>
          </div>
          {b.text && <p className="mt-2 whitespace-pre-line">{b.text}</p>}
        </li>
      ))}
    </ul>
  );
}
