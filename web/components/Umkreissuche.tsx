"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

interface Treffer {
  slug: string;
  name: string;
  km: number;
  ort: string | null;
  stellplaetze: number | null;
  gebuehr: boolean | null;
  oberflaeche: string | null;
}

interface Ziel {
  name: string;
  zusatz: string | null;
  typ: "ort" | "plz";
  lat: number;
  lon: number;
}

type Status = "bereit" | "ortet" | "sucht" | "fertig" | "fehler";

const RADIEN = [10, 25, 50];

export default function Umkreissuche() {
  const id = useId();
  const [status, setStatus] = useState<Status>("bereit");
  const [fehler, setFehler] = useState("");
  const [radius, setRadius] = useState(25);
  const [treffer, setTreffer] = useState<Treffer[]>([]);
  const [bezug, setBezug] = useState<string>("");

  // Standorteingabe
  const [eingabe, setEingabe] = useState("");
  const [ziele, setZiele] = useState<Ziel[]>([]);
  const [offen, setOffen] = useState(false);
  const [aktiv, setAktiv] = useState(-1);
  const letztesZiel = useRef<{ lat: number; lon: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eingabe.trim().length < 2) {
      setZiele([]);
      return;
    }
    const ab = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/standort?q=${encodeURIComponent(eingabe)}`, {
          signal: ab.signal,
        });
        setZiele((await res.json()).treffer ?? []);
        setAktiv(-1);
      } catch {
        /* abgebrochen */
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ab.abort();
    };
  }, [eingabe]);

  useEffect(() => {
    const zu = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener("mousedown", zu);
    return () => document.removeEventListener("mousedown", zu);
  }, []);

  async function suche(lat: number, lon: number, r: number, label: string) {
    letztesZiel.current = { lat, lon };
    setStatus("sucht");
    setBezug(label);
    try {
      const res = await fetch(`/api/umkreis?lat=${lat}&lon=${lon}&r=${r}`);
      if (!res.ok) throw new Error("Die Suche ist fehlgeschlagen.");
      const daten = await res.json();
      setTreffer(daten.treffer ?? []);
      setStatus("fertig");
    } catch (e) {
      setStatus("fehler");
      setFehler((e as Error).message);
    }
  }

  function perGps(r = radius) {
    setRadius(r);
    if (!("geolocation" in navigator)) {
      setStatus("fehler");
      setFehler("Dein Browser unterstützt keine Standortermittlung. Gib stattdessen einen Ort ein.");
      return;
    }
    setStatus("ortet");
    navigator.geolocation.getCurrentPosition(
      (pos) => suche(pos.coords.latitude, pos.coords.longitude, r, "deinem Standort"),
      (err) => {
        setStatus("fehler");
        setFehler(
          err.code === err.PERMISSION_DENIED
            ? "Standortzugriff wurde abgelehnt. Gib stattdessen einen Ort oder eine Postleitzahl ein."
            : "Dein Standort ließ sich nicht ermitteln. Gib stattdessen einen Ort ein.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function waehle(z: Ziel) {
    setEingabe(z.typ === "plz" ? `${z.name} ${z.zusatz ?? ""}`.trim() : z.name);
    setOffen(false);
    suche(z.lat, z.lon, radius, z.typ === "plz" ? `Postleitzahl ${z.name}` : z.name);
  }

  function radiusWechseln(r: number) {
    setRadius(r);
    const z = letztesZiel.current;
    if (z && status === "fertig") void suche(z.lat, z.lon, r, bezug);
  }

  function tasten(e: React.KeyboardEvent) {
    if (e.key === "Escape") return setOffen(false);
    if (!ziele.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktiv((i) => (i + 1) % ziele.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((i) => (i <= 0 ? ziele.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      waehle(ziele[aktiv >= 0 ? aktiv : 0]);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
      <div ref={box} className="relative">
        <label htmlFor={`${id}-ort`} className="block text-sm font-medium">
          Wo suchst du?
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id={`${id}-ort`}
            type="search"
            value={eingabe}
            onChange={(e) => {
              setEingabe(e.target.value);
              setOffen(true);
            }}
            onFocus={() => setOffen(true)}
            onKeyDown={tasten}
            placeholder="Ort oder Postleitzahl, z. B. Freiburg oder 79098"
            autoComplete="off"
            role="combobox"
            aria-expanded={offen && ziele.length > 0}
            aria-controls={`${id}-liste`}
            aria-autocomplete="list"
            className="flex-1 rounded-lg border border-line bg-background px-3 py-3 outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            type="button"
            onClick={() => perGps()}
            disabled={status === "ortet"}
            className="rounded-lg bg-accent px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "ortet" ? "Standort wird ermittelt …" : "Meinen Standort verwenden"}
          </button>
        </div>

        {offen && ziele.length > 0 && (
          <ul
            id={`${id}-liste`}
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-card shadow-lg sm:w-2/3"
          >
            {ziele.map((z, i) => (
              <li key={`${z.typ}-${z.name}-${z.lat}`} role="option" aria-selected={i === aktiv}>
                <button
                  type="button"
                  onMouseEnter={() => setAktiv(i)}
                  onClick={() => waehle(z)}
                  className={`flex w-full items-baseline gap-2 px-3 py-2 text-left text-sm ${
                    i === aktiv ? "bg-accent-soft" : ""
                  }`}
                >
                  <span className="w-8 shrink-0 text-[11px] uppercase tracking-wide text-muted">
                    {z.typ === "plz" ? "PLZ" : "Ort"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{z.name}</span>
                    {z.zusatz && <span className="block truncate text-xs text-muted">{z.zusatz}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm text-muted">
        <span>Umkreis:</span>
        {RADIEN.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => radiusWechseln(r)}
            aria-pressed={r === radius}
            className={`rounded-md px-2 py-1 ${
              r === radius ? "bg-accent-soft font-medium text-accent" : "hover:text-foreground"
            }`}
          >
            {r} km
          </button>
        ))}
      </div>

      <p className="mt-2 text-sm text-muted">
        Der Standort wird nur für diese Abfrage verwendet und nicht gespeichert.
      </p>

      {status === "fehler" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {fehler}
        </p>
      )}

      {status === "sucht" && <p className="mt-4 text-sm text-muted">Suche läuft …</p>}

      {status === "fertig" && treffer.length === 0 && (
        <p className="mt-4 text-sm">
          Im Umkreis von {radius} km um {bezug} ist kein Wanderparkplatz verzeichnet.{" "}
          {radius < 50 && (
            <button type="button" onClick={() => radiusWechseln(50)} className="text-accent underline">
              Auf 50 km erweitern
            </button>
          )}
        </p>
      )}

      {status === "fertig" && treffer.length > 0 && (
        <>
          <p className="mt-5 text-sm text-muted">
            {treffer.length} Wanderparkplätze im Umkreis von {radius} km um {bezug}, nach
            Entfernung sortiert:
          </p>
          <ul className="mt-3 divide-y divide-line">
            {treffer.map((t) => (
              <li key={t.slug} className="flex items-baseline gap-3 py-2.5">
                <span className="w-16 shrink-0 tabular-nums text-sm text-muted">
                  {t.km.toLocaleString("de-DE", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{" "}
                  km
                </span>
                <span className="min-w-0">
                  <Link href={`/wanderparkplatz/${t.slug}`} className="font-medium hover:text-accent">
                    {t.name}
                  </Link>
                  <span className="block text-sm text-muted">
                    {[
                      t.ort,
                      t.stellplaetze ? `${t.stellplaetze} Stellplätze` : null,
                      t.gebuehr === false ? "kostenfrei" : t.gebuehr === true ? "gebührenpflichtig" : null,
                      t.oberflaeche,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
