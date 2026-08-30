import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE, SITE_NAME } from "@/lib/site";
import Suche from "@/components/Suche";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  // Kein "%s | Marke"-Template: der Zusatz kostet 29 Zeichen, und Google
  // schneidet Titel bei rund 60 ab. Jede Seite trägt ihren Titel selbst.
  title: "Wanderparkplatz in meiner Nähe – Verzeichnis für Deutschland",
  description:
    "Finde Wanderparkplätze in deiner Nähe: Stellplätze, Gebühren, Untergrund und Zufahrt für Wanderparkplätze in ganz Deutschland.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="text-xl">🥾</span>
              <span>
                Wander<span className="text-accent">parkplatz</span>
              </span>
            </Link>
            <div className="hidden flex-1 justify-center px-4 sm:flex">
              <Suche />
            </div>
            <nav className="flex gap-5 text-sm text-muted">
              <Link href="/suche" className="hover:text-foreground sm:hidden">
                Suche
              </Link>
              <Link href="/bundeslaender" className="hover:text-foreground">
                Bundesländer
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Beide cookielos — kein Einwilligungsbanner nötig, damit auch kein
            Layoutsprung, der die Web Vitals verschlechtert. */}
        <Analytics />
        <SpeedInsights />

        <footer className="mt-16 border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
            <p>
              Standortdaten aus{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                className="underline hover:text-foreground"
                rel="noopener"
              >
                OpenStreetMap
              </a>
              , lizenziert unter ODbL. Angaben zu Gebühren, Kapazität und Zufahrt können
              veralten — bitte vor Ort prüfen.
            </p>
            <p className="mt-3 flex gap-4">
              <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
