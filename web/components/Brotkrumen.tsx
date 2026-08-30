import Link from "next/link";
import { jsonLd } from "@/lib/format";
import { SITE } from "@/lib/site";

export interface Krume {
  name: string;
  url: string;
}

export default function Brotkrumen({ pfad, aktuell }: { pfad: Krume[]; aktuell: string }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [...pfad, { name: aktuell, url: "" }].map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: b.name,
            ...(b.url ? { item: `${SITE}${b.url}` } : {}),
          })),
        })}
      />
      <nav aria-label="Brotkrumen" className="flex flex-wrap gap-1 text-sm text-muted">
        {pfad.map((b, i) => (
          <span key={b.url} className="flex gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            <Link href={b.url} className="hover:text-accent">
              {b.name}
            </Link>
          </span>
        ))}
      </nav>
    </>
  );
}
