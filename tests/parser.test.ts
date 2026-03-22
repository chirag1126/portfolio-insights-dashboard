import { describe, expect, it } from "vitest";
import { parseRows } from "@/lib/parser";

describe("parser", () => {
  it("parses workbook style rows", () => {
    const rows = [
      ["No", "Particulars", "Purchase Price", "Qty", "Investment", "Portfolio (%)", "NSE/BSE", "CMP", null, null, null, null, "P/E (TTM)", "Latest Earnings"],
      [null, "Financial Sector"],
      [1, "HDFC Bank", 1490, 50, 74500, 5, "HDFCBANK", 1700, null, null, null, null, 18.69, 91.02],
    ];

    const parsed = parseRows(rows);
    expect(parsed.holdings).toHaveLength(1);
    expect(parsed.holdings[0].stockName).toBe("HDFC Bank");
    expect(parsed.holdings[0].sector).toBe("Financial");
  });
});
