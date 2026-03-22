import { describe, expect, it } from "vitest";
import { buildHolding, buildSectorSummaries, buildSummary, computeInvestment } from "@/lib/calculations";

describe("calculations", () => {
  it("computes investment correctly", () => {
    expect(computeInvestment(1490, 50)).toBe(74500);
  });

  it("builds holding with gain/loss", () => {
    const holding = buildHolding({
      id: "hdfc-bank",
      stockName: "HDFC Bank",
      purchasePrice: 1490,
      quantity: 50,
      investment: 74500,
      exchangeCode: "HDFCBANK",
      sector: "Financial",
      initialCmp: 1700,
      initialPeRatio: 18,
      initialLatestEarnings: 91,
    }, {
      cmp: 1700,
      peRatio: 18,
      latestEarnings: 91,
      cmpSource: "yahoo",
      fundamentalsSource: "google",
    });

    expect(holding.presentValue).toBe(85000);
    expect(holding.gainLoss).toBe(10500);
  });

  it("builds summary and sector totals", () => {
    const holdings = [
      {
        id: "one",
        stockName: "A",
        purchasePrice: 100,
        quantity: 10,
        investment: 1000,
        exchangeCode: "A",
        sector: "Tech",
        initialCmp: null,
        initialPeRatio: null,
        initialLatestEarnings: null,
        cmp: 120,
        presentValue: 1200,
        gainLoss: 200,
        peRatio: 10,
        latestEarnings: 2,
        cmpSource: "yahoo" as const,
        fundamentalsSource: "google" as const,
      },
    ];

    expect(buildSummary(holdings).totalGainLoss).toBe(200);
    expect(buildSectorSummaries(holdings)[0].sector).toBe("Tech");
  });
});
