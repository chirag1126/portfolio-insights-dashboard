"use client";

type UploadProps = {
  loading: boolean;
  fileName?: string | null;
  onUpload: (file: File) => Promise<void>;
};

export function Upload({ loading, fileName, onUpload }: UploadProps) {
  return (
    <section className="card p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold text-slate-950">Upload workbook</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Upload the portfolio workbook to load the dashboard.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {fileName ? `Selected file: ${fileName}` : "No file uploaded yet."}
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
          {loading ? "Processing..." : "Choose file"}
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            disabled={loading}
            onChange={async (event) => {
              const input = event.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              try {
                await onUpload(file);
              } finally {
                input.value = "";
              }
            }}
          />
        </label>
      </div>
    </section>
  );
}
