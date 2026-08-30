"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Treffer {
  titel: string;
  untertitel: string | null;
  typ: string;
  url: string;
}

const SYMBOL: Record<string, string> = {
  parkplatz: "P",
  ort: "Ort",
  kreis: "Kreis",
  bundesland: "Land",
};

export default function Suche({ autoFokus = false }: { autoFokus?: boolean }) {
  const router = useRouter();
  const listenId = useId();
  const [q, setQ] = useState("");
  const [treffer, setTreffer] = useState<Treffer[]>([]);
  const [offen, setOffen] = useState(false);
  const [aktiv, setAktiv] = useState(-1);
  const [laedt, setLaedt] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Entprellt, und alte Antworten dürfen neuere nicht überschreiben.
  useEffect(() => {
    if (q.trim().length < 2) {
      setTreffer([]);
      setLaedt(false);
      return;
    }
    const abbruch = new AbortController();
    setLaedt(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suche?q=${encodeURIComponent(q)}`, {
          signal: abbruch.signal,
        });
        const daten = await res.json();
        setTreffer(daten.treffer ?? []);
        setAktiv(-1);
      } catch {
        /* abgebrochen */
      } finally {
        setLaedt(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      abbruch.abort();
    };
  }, [q]);

  useEffect(() => {
    const zu = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener("mousedown", zu);
    return () => document.removeEventListener("mousedown", zu);
  }, []);

  function tasten(e: React.KeyboardEvent) {
    if (e.key === "Escape") return setOffen(false);
    if (!treffer.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktiv((i) => (i + 1) % treffer.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((i) => (i <= 0 ? treffer.length - 1 : i - 1));
    } else if (e.key === "Enter" && aktiv >= 0) {
      e.preventDefault();
      router.push(treffer[aktiv].url);
      setOffen(false);
    }
  }

  return (
    <div ref={box} className="relative w-full max-w-md">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/suche?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <label htmlFor={`${listenId}-eingabe`} className="sr-only">
          Wanderparkplatz, Ort oder Landkreis suchen
        </label>
        <input
          id={`${listenId}-eingabe`}
          type="search"
          autoFocus={autoFokus}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffen(true);
          }}
          onFocus={() => setOffen(true)}
          onKeyDown={tasten}
          placeholder="Parkplatz, Ort oder Landkreis …"
          autoComplete="off"
          role="combobox"
          aria-expanded={offen && treffer.length > 0}
          aria-controls={listenId}
          aria-autocomplete="list"
          aria-activedescendant={aktiv >= 0 ? `${listenId}-${aktiv}` : undefined}
          className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </form>

      {offen && q.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-card shadow-lg">
          {treffer.length > 0 ? (
            <ul id={listenId} role="listbox">
              {treffer.map((t, i) => (
                <li key={t.url} id={`${listenId}-${i}`} role="option" aria-selected={i === aktiv}>
                  <a
                    href={t.url}
                    onMouseEnter={() => setAktiv(i)}
                    className={`flex items-baseline gap-2 px-3 py-2 text-sm ${
                      i === aktiv ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span className="w-10 shrink-0 text-[11px] uppercase tracking-wide text-muted">
                      {SYMBOL[t.typ] ?? ""}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{t.titel}</span>
                      {t.untertitel && (
                        <span className="block truncate text-xs text-muted">{t.untertitel}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted">
              {laedt ? "Suche läuft …" : "Keine Treffer. Andere Schreibweise versuchen?"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
