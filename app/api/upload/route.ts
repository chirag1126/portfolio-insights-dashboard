import { NextRequest, NextResponse } from "next/server";
import { parseWorkbook } from "@/lib/parser";
import { enrichHoldings } from "@/lib/market";
import { buildSectorSummaries, buildSummary } from "@/lib/calculations";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a workbook file." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const parsed = parseWorkbook(buffer);

    if (!parsed.holdings.length) {
      return NextResponse.json({ error: "No valid holdings were found in the workbook." }, { status: 400 });
    }

    const enriched = await enrichHoldings(parsed.holdings);

    return NextResponse.json({
      holdings: enriched.holdings,
      sectorSummaries: buildSectorSummaries(enriched.holdings),
      summary: buildSummary(enriched.holdings),
      warnings: [...parsed.warnings, ...enriched.warnings],
      sourceFileName: file.name,
      lastUpdatedAt: new Date().toISOString(),
      refreshSeed: parsed.holdings,
    });
  } catch {
    return NextResponse.json({ error: "The workbook could not be processed." }, { status: 500 });
  }
}
