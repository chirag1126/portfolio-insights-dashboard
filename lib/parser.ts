import * as XLSX from "xlsx";
import { z } from "zod";
import { ParsedHolding } from "@/lib/types";
import { buildPortfolioPercentage, computeInvestment } from "@/lib/calculations";

const parsedRowSchema = z.object({
  stockName: z.string().min(1),
  purchasePrice: z.number().positive(),
  quantity: z.number().positive(),
  exchangeCode: z.string().min(1),
  sector: z.string().min(1),
  investment: z.number().nonnegative(),
  initialCmp: z.number().nullable(),
  initialPeRatio: z.number().nullable(),
  initialLatestEarnings: z.union([z.number(), z.string(), z.null()]),
});

function parseNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const value = String(raw).replace(/,/g, "").replace(/%/g, "").trim();
  if (!value || ["#N/A", "#VALUE!", "#DIV/0!"].includes(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSector(label: string) {
  return label.replace(/sector/i, "").trim() || label.trim();
}

export function parseRows(rows: unknown[][]) {
  const warnings: string[] = [];
  const parsed: ParsedHolding[] = [];
  let currentSector = "Unassigned";

  rows.forEach((row, rowIndex) => {
    const name = String(row[1] ?? "").trim();
    if (!name || name.toLowerCase() === "particulars") return;

    if (/sector/i.test(name) || ["Consumer", "Power", "Others"].includes(name)) {
      currentSector = normalizeSector(name);
      return;
    }

    const purchasePrice = parseNumber(row[2]);
    const quantity = parseNumber(row[3]);
    const exchangeCode = String(row[6] ?? "").trim();

    if (purchasePrice === null || quantity === null || !exchangeCode) {
      if (typeof row[0] === "number" || purchasePrice !== null || quantity !== null) {
        warnings.push(`Skipped row ${rowIndex + 1} for ${name} because a required field was missing.`);
      }
      return;
    }

    const candidate = {
      id: `${currentSector}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      stockName: name,
      purchasePrice,
      quantity,
      investment: computeInvestment(purchasePrice, quantity),
      exchangeCode,
      sector: currentSector,
      initialCmp: parseNumber(row[7]),
      initialPeRatio: parseNumber(row[12]),
      initialLatestEarnings: parseNumber(row[13]) ?? (row[13] ? String(row[13]) : null),
    };

    const result = parsedRowSchema.safeParse(candidate);
    if (!result.success) {
      warnings.push(`Skipped row ${rowIndex + 1} for ${name} because it could not be validated.`);
      return;
    }

    parsed.push(candidate);
  });

  return {
    holdings: buildPortfolioPercentage(parsed),
    warnings,
  };
}

export function parseWorkbook(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    blankrows: false,
    defval: null,
    raw: true,
  });
  return parseRows(rows);
}
