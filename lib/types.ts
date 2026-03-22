export type ProviderSource = "yahoo" | "google" | "workbook";

export type ParsedHolding = {
  id: string;
  stockName: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage?: number;
  exchangeCode: string;
  sector: string;
  initialCmp: number | null;
  initialPeRatio: number | null;
  initialLatestEarnings: number | string | null;
};

export type Holding = ParsedHolding & {
  cmp: number | null;
  presentValue: number;
  gainLoss: number;
  peRatio: number | null;
  latestEarnings: number | string | null;
  cmpSource: ProviderSource;
  fundamentalsSource: ProviderSource | null;
};

export type SectorSummary = {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
};

export type DashboardPayload = {
  holdings: Holding[];
  sectorSummaries: SectorSummary[];
  summary: {
    totalInvestment: number;
    currentValue: number;
    totalGainLoss: number;
    holdingsCount: number;
  };
  warnings: string[];
  sourceFileName: string;
  lastUpdatedAt: string;
  refreshSeed: ParsedHolding[];
};
