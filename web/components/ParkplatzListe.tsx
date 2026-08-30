import Link from "next/link";
import type { Parkplatz } from "@/lib/db";
import { gebuehrText } from "@/lib/format";

export default function ParkplatzListe({ items }: { items: Parkplatz[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((p) => {
        const merkmale = [
          p.ort_name,
          p.stellplaetze ? `${p.stellplaetze} Stellplätze` : null,
          gebuehrText(p.gebuehr, p.gebuehr_info),
          p.oberflaeche,
          p.wc ? "Toilette" : null,
        ].filter(Boolean);
        return (
          <li key={p.slug} className="py-3">
            <Link href={`/wanderparkplatz/${p.slug}`} className="font-medium hover:text-accent">
              {p.name}
            </Link>
            {merkmale.length > 0 && (
              <p className="mt-0.5 text-sm text-muted">{merkmale.join(" · ")}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
