"use client";

import { useId, useState } from "react";

type Status = "formular" | "sendet" | "fertig" | "fehler";

export default function BewertungFormular({ slug }: { slug: string }) {
  const id = useId();
  const [status, setStatus] = useState<Status>("formular");
  const [meldung, setMeldung] = useState("");
  const [sterne, setSterne] = useState(0);
  const [schwebe, setSchwebe] = useState(0);

  async function absenden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!sterne) {
      setStatus("fehler");
      setMeldung("Bitte zuerst Sterne vergeben.");
      return;
    }
    setStatus("sendet");
    try {
      const res = await fetch("/api/bewertung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          sterne,
          text: f.get("text"),
          autor: f.get("autor"),
          besucht_am: f.get("besucht_am") || undefined,
          webseite: f.get("webseite"),
        }),
      });
      const daten = await res.json();
      if (!res.ok) {
        setStatus("fehler");
        setMeldung(daten.fehler ?? "Das hat nicht geklappt.");
        return;
      }
      setStatus("fertig");
      setMeldung(daten.hinweis);
    } catch {
      setStatus("fehler");
      setMeldung("Verbindung fehlgeschlagen. Bitte später erneut versuchen.");
    }
  }

  if (status === "fertig") {
    return (
      <p className="rounded-lg bg-accent-soft p-4 text-sm">{meldung}</p>
    );
  }

  const anzeige = schwebe || sterne;

  return (
    <form onSubmit={absenden} className="rounded-xl border border-line bg-card p-5">
      <fieldset>
        <legend className="font-medium">Wie war es auf diesem Parkplatz?</legend>
        <div
          className="mt-3 flex gap-1"
          role="radiogroup"
          aria-label="Bewertung in Sternen"
          onMouseLeave={() => setSchwebe(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={sterne === n}
              aria-label={`${n} von 5 Sternen`}
              onClick={() => setSterne(n)}
              onMouseEnter={() => setSchwebe(n)}
              onFocus={() => setSchwebe(n)}
              onBlur={() => setSchwebe(0)}
              className={`text-3xl leading-none transition ${
                n <= anzeige ? "text-amber-500" : "text-line hover:text-amber-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <label htmlFor={`${id}-text`} className="block text-sm font-medium">
          Dein Eindruck <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id={`${id}-text`}
          name="text"
          rows={4}
          maxLength={1500}
          placeholder="War Platz frei? Wie ist die Zufahrt? Stimmten die Angaben zu Gebühren?"
          className="mt-1 w-full rounded-lg border border-line bg-background p-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-autor`} className="block text-sm font-medium">
            Name <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id={`${id}-autor`}
            name="autor"
            maxLength={60}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor={`${id}-datum`} className="block text-sm font-medium">
            Besucht am <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id={`${id}-datum`}
            name="besucht_am"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Honigtopf: für Menschen unsichtbar, Bots füllen ihn aus. */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor={`${id}-web`}>Webseite nicht ausfüllen</label>
        <input id={`${id}-web`} name="webseite" tabIndex={-1} autoComplete="off" />
      </div>

      {status === "fehler" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {meldung}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "sendet"}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "sendet" ? "Wird gesendet …" : "Bewertung abschicken"}
        </button>
        <span className="text-sm text-muted">
          Ohne Anmeldung. Es wird keine IP-Adresse gespeichert.
        </span>
      </div>
    </form>
  );
}
