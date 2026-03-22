import { DashboardPayload } from "@/lib/types";

export function Summary({ summary }: { summary: DashboardPayload["summary"] }) {
  const items = [
    { label: "Total Investment", value: summary.totalInvestment },
    { label: "Current Value", value: summary.currentValue },
    { label: "Total Gain/Loss", value: summary.totalGainLoss, gain: true },
    { label: "Holdings Count", value: summary.holdingsCount, integer: true },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card p-5 lg:p-6">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className={`mt-2 text-2xl font-semibold lg:text-[1.75rem] ${item.gain ? (Number(item.value) >= 0 ? "text-emerald-600" : "text-rose-600") : "text-slate-950"}`}>
            {item.integer ? item.value : `₹${Number(item.value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          </p>
        </div>
      ))}
    </section>
  );
}
