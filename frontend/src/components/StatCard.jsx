export default function StatCard({ label, value, helper, tone = "default" }) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-200/60 bg-emerald-50/90 dark:border-emerald-400/15 dark:bg-emerald-400/10"
      : tone === "warning"
        ? "border-amber-200/70 bg-amber-50/90 dark:border-amber-400/15 dark:bg-amber-400/10"
        : "border-slate-200/70 bg-white/90 dark:border-white/10 dark:bg-slate/70";

  return (
    <div className={`rounded-[28px] border p-5 shadow-panel ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
        <span className="rounded-full bg-slate-900/6 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-white/5 dark:text-slate-300">
          Live
        </span>
      </div>
      <div className="mt-5 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{helper}</p>
    </div>
  );
}
