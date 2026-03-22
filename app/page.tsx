"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload } from "@/components/Upload";
import { Summary } from "@/components/Summary";
import { Table } from "@/components/Table";
import { SectorSummary } from "@/components/SectorSummary";
import { DashboardPayload } from "@/lib/types";

const REFRESH_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL_MS ?? 15000);

export default function HomePage() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    setSelectedFileName(file.name);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The workbook could not be processed.");
      setPayload(data);
    } catch (err) {
      setPayload(null);
      setSelectedFileName(null);
      setError(err instanceof Error ? err.message : "The workbook could not be processed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!payload?.refreshSeed?.length) return;

    const timer = setInterval(async () => {
      try {
        setRefreshing(true);
        const response = await fetch("/api/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ holdings: payload.refreshSeed, sourceFileName: payload.sourceFileName }),
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "The latest market values could not be refreshed.");
        setPayload(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "The latest market values could not be refreshed.");
      } finally {
        setRefreshing(false);
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [payload?.refreshSeed, payload?.sourceFileName]);

  const updatedAt = useMemo(() => {
    if (!payload?.lastUpdatedAt) return "—";
    return new Date(payload.lastUpdatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }, [payload?.lastUpdatedAt]);

  return (
    <main className="app-shell">
      <div className="space-y-5 lg:space-y-6">
        <section className="card p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">Portfolio Dashboard</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600 lg:text-base">
                Upload the workbook to review holdings, sector totals, and refreshed market values.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 xl:min-w-[240px]">
              <p className="font-medium">Auto refresh every 15 seconds</p>
              <p className="mt-1 text-xs text-slate-500">Last updated: {updatedAt}</p>
              {refreshing ? <p className="mt-1 text-xs text-slate-500">Refreshing latest market values...</p> : null}
            </div>
          </div>
        </section>

        <Upload loading={loading} fileName={payload?.sourceFileName ?? selectedFileName} onUpload={handleUpload} />

        {error ? (
          <section className="card border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">Please review this message</p>
            <p className="mt-1">{error}</p>
          </section>
        ) : null}

        {payload ? (
          <>
            <Summary summary={payload.summary} />
            <div className="dashboard-grid">
              <div className="min-w-0 space-y-5 lg:space-y-6">
                <Table holdings={payload.holdings} warnings={payload.warnings} />
              </div>
              <aside className="min-w-0">
                <div className="xl:sticky xl:top-6">
                  <SectorSummary sectors={payload.sectorSummaries} />
                </div>
              </aside>
            </div>
          </>
        ) : (
          <section className="card p-8 text-center">
            <p className="text-lg font-medium">No workbook uploaded yet</p>
            <p className="mt-2 text-sm text-slate-600">Once the workbook is uploaded, the summary cards, holdings table, and sector totals will appear here.</p>
          </section>
        )}
      </div>
    </main>
  );
}
