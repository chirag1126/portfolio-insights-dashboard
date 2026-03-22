import { buildHolding } from "@/lib/calculations";
import { ParsedHolding } from "@/lib/types";
import { resolveSymbols } from "@/lib/symbols";

const CACHE_TTL_MS = Number(process.env.MARKET_CACHE_TTL_MS ?? 30000);
const cache = new Map<string, { expiresAt: number; value: Awaited<ReturnType<typeof getLiveSnapshot>> }>();

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isReasonableCmp(cmp: number | null, holding: ParsedHolding) {
  if (cmp === null || !Number.isFinite(cmp) || cmp <= 0) return false;
  const lowerBound = Math.max(0.1, holding.purchasePrice * 0.05);
  const upperBound = Math.max(holding.purchasePrice * 20, 20000);
  return cmp >= lowerBound && cmp <= upperBound;
}

async function fetchYahooCmp(symbol: string): Promise<number | null> {
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, {
    cache: "no-store",
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error("Yahoo request failed");
  const data = await safeJson(response);
  const value = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  return typeof value === "number" ? value : null;
}

async function fetchGoogleFundamentals(symbol: string): Promise<{ peRatio: number | null; latestEarnings: number | string | null }> {
  const response = await fetch(`https://www.google.com/finance/quote/${encodeURIComponent(symbol)}`, {
    cache: "no-store",
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error("Google request failed");
  const html = await response.text();

  const peMatch = html.match(/P\/E ratio[^\d-]*(-?\d+(?:\.\d+)?)/i);
  const earningsMatch = html.match(/Earnings per share[^\d-]*(-?\d+(?:\.\d+)?)/i)
    ?? html.match(/EPS[^\d-]*(-?\d+(?:\.\d+)?)/i);

  return {
    peRatio: peMatch ? Number(peMatch[1]) : null,
    latestEarnings: earningsMatch ? Number(earningsMatch[1]) : null,
  };
}

async function getLiveSnapshot(holding: ParsedHolding) {
  const symbols = resolveSymbols(holding);
  let cmp = holding.initialCmp ?? null;
  let peRatio = holding.initialPeRatio ?? null;
  let latestEarnings = holding.initialLatestEarnings ?? null;
  let cmpSource: "yahoo" | "workbook" = "workbook";
  let fundamentalsSource: "google" | "workbook" | null = null;
  const warnings: string[] = [];

  try {
    const yahooCmp = await fetchYahooCmp(symbols.yahoo);
    if (isReasonableCmp(yahooCmp, holding)) {
      cmp = yahooCmp;
      cmpSource = "yahoo";
    } else if (yahooCmp !== null) {
      warnings.push(`Ignored an outlier Yahoo CMP value for ${holding.stockName}. Workbook value was kept.`);
    }
  } catch {
    warnings.push(`Yahoo CMP fetch failed for ${holding.stockName}. Workbook value was used.`);
  }

  try {
    const google = await fetchGoogleFundamentals(symbols.google);
    const hasGooglePe = google.peRatio !== null && Number.isFinite(google.peRatio);
    const hasGoogleEarnings = google.latestEarnings !== null && google.latestEarnings !== "";

    if (hasGooglePe) {
      peRatio = google.peRatio;
      fundamentalsSource = "google";
    } else if (peRatio !== null) {
      fundamentalsSource = "workbook";
    }

    if (hasGoogleEarnings) {
      latestEarnings = google.latestEarnings;
    }
  } catch {
    if (peRatio !== null || latestEarnings !== null) {
      fundamentalsSource = peRatio !== null ? "workbook" : null;
    }
    warnings.push(`Google Finance fetch failed for ${holding.stockName}. Workbook values were used.`);
  }

  if (fundamentalsSource === null && peRatio !== null) {
    fundamentalsSource = "workbook";
  }

  return { cmp, peRatio, latestEarnings, cmpSource, fundamentalsSource, warnings };
}

export async function enrichHoldings(holdings: ParsedHolding[]) {
  const warnings: string[] = [];
  const result = [];

  for (const holding of holdings) {
    const symbols = resolveSymbols(holding);
    const key = `${symbols.yahoo}|${symbols.google}`;
    const cached = cache.get(key);
    const snapshot = cached && cached.expiresAt > Date.now() ? cached.value : await getLiveSnapshot(holding);
    cache.set(key, { value: snapshot, expiresAt: Date.now() + CACHE_TTL_MS });
    warnings.push(...snapshot.warnings);
    result.push(buildHolding(holding, snapshot));
  }

  return { holdings: result, warnings };
}
