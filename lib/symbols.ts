import { ParsedHolding } from "@/lib/types";

const aliasMap: Record<string, { yahoo?: string; google?: string }> = {
  "hdfc bank": { yahoo: "HDFCBANK.NS", google: "NSE:HDFCBANK" },
  "bajaj finance": { yahoo: "BAJFINANCE.NS", google: "NSE:BAJFINANCE" },
  "icici bank": { yahoo: "ICICIBANK.NS", google: "NSE:ICICIBANK" },
  "bajaj housing": { yahoo: "BAJAJHFL.NS", google: "NSE:BAJAJHFL" },
  "savani financials": { yahoo: "511577.BO", google: "BOM:511577" },
  "affle india": { yahoo: "AFFLE.NS", google: "NSE:AFFLE" },
  "lti mindtree": { yahoo: "LTIM.NS", google: "NSE:LTIM" },
  "kpit tech": { yahoo: "KPITTECH.NS", google: "NSE:KPITTECH" },
  "tata tech": { yahoo: "TATATECH.NS", google: "NSE:TATATECH" },
  "bls e-services": { yahoo: "BLSE.NS", google: "NSE:BLSE" },
  tanla: { yahoo: "TANLA.NS", google: "NSE:TANLA" },
  dmart: { yahoo: "DMART.NS", google: "NSE:DMART" },
  "tata consumer": { yahoo: "TATACONSUM.NS", google: "NSE:TATACONSUM" },
  pidilite: { yahoo: "PIDILITIND.NS", google: "NSE:PIDILITIND" },
  "tata power": { yahoo: "TATAPOWER.NS", google: "NSE:TATAPOWER" },
  "kpi green": { yahoo: "KPIGREEN.NS", google: "NSE:KPIGREEN" },
  suzlon: { yahoo: "SUZLON.NS", google: "NSE:SUZLON" },
  gensol: { yahoo: "GENSOL.NS", google: "NSE:GENSOL" },
  "hariom pipes": { yahoo: "HARIOMPIPE.NS", google: "NSE:HARIOMPIPE" },
  astral: { yahoo: "ASTRAL.NS", google: "NSE:ASTRAL" },
  polycab: { yahoo: "POLYCAB.NS", google: "NSE:POLYCAB" },
  "clean science": { yahoo: "CLEAN.NS", google: "NSE:CLEAN" },
  "deepak nitrite": { yahoo: "DEEPAKNTR.NS", google: "NSE:DEEPAKNTR" },
  "fine organic": { yahoo: "FINEORG.NS", google: "NSE:FINEORG" },
  gravita: { yahoo: "GRAVITA.NS", google: "NSE:GRAVITA" },
  "sbi life": { yahoo: "SBILIFE.NS", google: "NSE:SBILIFE" },
  infy: { yahoo: "INFY.NS", google: "NSE:INFY" },
  "happeist mind": { yahoo: "HAPPSTMNDS.NS", google: "NSE:HAPPSTMNDS" },
  "happiest mind": { yahoo: "HAPPSTMNDS.NS", google: "NSE:HAPPSTMNDS" },
  easemytrip: { yahoo: "EASEMYTRIP.NS", google: "NSE:EASEMYTRIP" },
};

export function resolveSymbols(holding: ParsedHolding) {
  const key = holding.stockName.toLowerCase().trim();
  const aliases = aliasMap[key];
  const baseExchange = holding.exchangeCode.includes(".") ? "BO" : holding.exchangeCode.length > 5 ? "BO" : "NS";
  const fallbackYahoo = /\d+/.test(holding.exchangeCode) ? `${holding.exchangeCode}.${baseExchange}` : `${holding.exchangeCode}.${baseExchange}`;
  const fallbackGoogle = /\d+/.test(holding.exchangeCode)
    ? `${baseExchange === "BO" ? "BOM" : "NSE"}:${holding.exchangeCode}`
    : `${baseExchange === "BO" ? "BOM" : "NSE"}:${holding.exchangeCode}`;

  return {
    yahoo: aliases?.yahoo ?? fallbackYahoo,
    google: aliases?.google ?? fallbackGoogle,
  };
}
