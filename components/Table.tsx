import { Holding } from "@/lib/types";

function SourceBadge({ label }: { label: string | null }) {
  if (!label) return null;
  const styles = label === "yahoo" || label === "google"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-600";
  return <span className={`badge ${styles}`}>{label}</span>;
}

export function Table({ holdings, warnings }: { holdings: Holding[]; warnings: string[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">Holdings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              {[
                "Stock Name",
                "Purchase Price",
                "Quantity",
                "Investment",
                "Portfolio %",
                "Exchange",
                "CMP",
                "Present Value",
                "Gain/Loss",
                "P/E Ratio",
                "Latest Earnings",
                "Sector",
              ].map((head) => (
                <th key={head} className="px-4 py-3 font-medium whitespace-nowrap">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const showGoogleBadge = holding.fundamentalsSource === "google" && holding.peRatio !== null;
              return (
                <tr key={holding.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 font-medium text-slate-900">{holding.stockName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">₹{holding.purchasePrice.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{holding.quantity}</td>
                  <td className="px-4 py-3 whitespace-nowrap">₹{holding.investment.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{holding.portfolioPercentage?.toFixed(2)}%</td>
                  <td className="px-4 py-3">{holding.exchangeCode}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="whitespace-nowrap">₹{(holding.cmp ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                      <SourceBadge label={holding.cmpSource} />
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">₹{holding.presentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td className={`px-4 py-3 whitespace-nowrap font-medium ${holding.gainLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ₹{holding.gainLoss.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span>{holding.peRatio ?? "—"}</span>
                      {showGoogleBadge ? <SourceBadge label="google" /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{holding.latestEarnings ?? "—"}</td>
                  <td className="px-4 py-3">{holding.sector}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
