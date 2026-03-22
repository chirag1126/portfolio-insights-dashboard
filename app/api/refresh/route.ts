import { NextRequest, NextResponse } from "next/server";
import { ParsedHolding } from "@/lib/types";
import { enrichHoldings } from "@/lib/market";
import { buildSectorSummaries, buildSummary } from "@/lib/calculations";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { holdings?: ParsedHolding[]; sourceFileName?: string };
    const holdings = Array.isArray(body.holdings) ? body.holdings : [];

    if (!holdings.length) {
      return NextResponse.json({ error: "Upload a workbook before refreshing the dashboard." }, { status: 400 });
    }

    const enriched = await enrichHoldings(holdings);

    return NextResponse.json({
      holdings: enriched.holdings,
      sectorSummaries: buildSectorSummaries(enriched.holdings),
      summary: buildSummary(enriched.holdings),
      warnings: enriched.warnings,
      sourceFileName: body.sourceFileName ?? "Uploaded workbook",
      lastUpdatedAt: new Date().toISOString(),
      refreshSeed: holdings,
    });
  } catch {
    return NextResponse.json({ error: "The latest market values could not be refreshed." }, { status: 500 });
  }
}
