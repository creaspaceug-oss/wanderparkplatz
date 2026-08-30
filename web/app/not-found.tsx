import Link from "next/link";

export default function NichtGefunden() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Seite nicht gefunden</h1>
      <p className="mt-4 text-muted">
        Diese Seite gibt es nicht — vielleicht wurde ein Parkplatz aus OpenStreetMap entfernt.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-accent px-5 py-3 font-medium text-white"
      >
        Zur Wanderparkplatz-Suche
      </Link>
    </div>
  );
}
