import { SectorSummary as SectorSummaryType } from "@/lib/types";

export function SectorSummary({ sectors }: { sectors: SectorSummaryType[] }) {
  return (
    <section className="card p-5 lg:p-6">
      <h2 className="text-lg font-semibold text-slate-950">Sector Summary</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {sectors.map((sector) => (
          <div key={sector.sector} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-900">{sector.sector}</p>
              <p className={`text-sm font-medium ${sector.gainLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                ₹{sector.gainLoss.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-1">
              <p>Investment: ₹{sector.investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
              <p>Present Value: ₹{sector.presentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
