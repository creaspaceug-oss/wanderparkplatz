"use client";

import { useActionState } from "react";
import { anmeldenAktion } from "./aktionen";

/**
 * Anmeldeformular.
 *
 * Client-Komponente allein wegen der Fehlermeldung: Das Formular selbst
 * funktioniert auch ohne JavaScript, die Rückmeldung käme dann über einen
 * normalen Seitenaufbau.
 */
export default function Anmeldung() {
  const [fehler, absenden, laeuft] = useActionState(anmeldenAktion, null);

  return (
    <form action={absenden} className="mt-6 max-w-sm space-y-3">
      <label htmlFor="passwort" className="block text-sm font-medium text-muted">
        Passwort
      </label>
      <input
        id="passwort"
        name="passwort"
        type="password"
        autoComplete="current-password"
        required
        className="w-full rounded-lg border border-line bg-card px-3 py-2"
      />
      <button
        type="submit"
        disabled={laeuft}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-white disabled:opacity-60 dark:text-background"
      >
        {laeuft ? "Prüfe …" : "Anmelden"}
      </button>
      {fehler && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {fehler}
        </p>
      )}
    </form>
  );
}
