import { describe, expect, it, vi } from "vitest";
import { enrichHoldings } from "@/lib/market";

describe("market fallback", () => {
  it("keeps workbook values when provider calls fail", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error("network")) as unknown as typeof fetch;

    const result = await enrichHoldings([
      {
        id: "hdfc-bank",
        stockName: "HDFC Bank",
        purchasePrice: 1490,
        quantity: 50,
        investment: 74500,
        exchangeCode: "HDFCBANK",
        sector: "Financial",
        portfolioPercentage: 5,
        initialCmp: 1700,
        initialPeRatio: 18,
        initialLatestEarnings: 91,
      },
    ]);

    expect(result.holdings[0].cmp).toBe(1700);
    expect(result.holdings[0].peRatio).toBe(18);
    expect(result.holdings[0].latestEarnings).toBe(91);

    global.fetch = originalFetch;
  });
});
