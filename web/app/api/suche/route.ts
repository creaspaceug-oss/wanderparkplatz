import { NextResponse } from "next/server";
import { suche, PFAD, type Suchtreffer } from "@/lib/db";
import { suchform } from "@/lib/suchform";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const roh = new URL(request.url).searchParams.get("q") ?? "";
  const q = suchform(roh).slice(0, 60);

  if (q.length < 2) return NextResponse.json({ treffer: [] });

  const treffer = await suche(q, 10);
  return NextResponse.json(
    {
      treffer: treffer.map((t: Suchtreffer) => ({
        titel: t.titel,
        untertitel: t.untertitel,
        typ: t.typ,
        url: `${PFAD[t.typ]}/${t.slug}`,
      })),
    },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
