import { Holding, ParsedHolding, SectorSummary } from "@/lib/types";

export function computeInvestment(price: number, quantity: number) {
  return Number((price * quantity).toFixed(2));
}

export function computePresentValue(cmp: number | null, quantity: number) {
  return Number((((cmp ?? 0) * quantity)).toFixed(2));
}

export function buildHolding(base: ParsedHolding, live: {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | string | null;
  cmpSource: Holding["cmpSource"];
  fundamentalsSource: Holding["fundamentalsSource"];
}): Holding {
  const cmp = live.cmp;
  const presentValue = computePresentValue(cmp, base.quantity);
  const gainLoss = Number((presentValue - base.investment).toFixed(2));

  return {
    ...base,
    cmp,
    presentValue,
    gainLoss,
    peRatio: live.peRatio,
    latestEarnings: live.latestEarnings,
    cmpSource: live.cmpSource,
    fundamentalsSource: live.fundamentalsSource,
  };
}

export function buildPortfolioPercentage(holdings: ParsedHolding[]) {
  const totalInvestment = holdings.reduce((sum, item) => sum + item.investment, 0);
  return holdings.map((holding) => ({
    ...holding,
    portfolioPercentage: totalInvestment > 0 ? Number(((holding.investment / totalInvestment) * 100).toFixed(2)) : 0,
  }));
}

export function buildSectorSummaries(holdings: Holding[]): SectorSummary[] {
  const grouped = new Map<string, SectorSummary>();
  for (const item of holdings) {
    const current = grouped.get(item.sector) ?? {
      sector: item.sector,
      investment: 0,
      presentValue: 0,
      gainLoss: 0,
    };

    current.investment = Number((current.investment + item.investment).toFixed(2));
    current.presentValue = Number((current.presentValue + item.presentValue).toFixed(2));
    current.gainLoss = Number((current.gainLoss + item.gainLoss).toFixed(2));
    grouped.set(item.sector, current);
  }

  return Array.from(grouped.values()).sort((a, b) => b.investment - a.investment);
}

export function buildSummary(holdings: Holding[]) {
  const totalInvestment = Number(holdings.reduce((sum, item) => sum + item.investment, 0).toFixed(2));
  const currentValue = Number(holdings.reduce((sum, item) => sum + item.presentValue, 0).toFixed(2));
  const totalGainLoss = Number((currentValue - totalInvestment).toFixed(2));

  return {
    totalInvestment,
    currentValue,
    totalGainLoss,
    holdingsCount: holdings.length,
  };
}
