export default function StatCard({ label, value, helper, tone = "default" }) {
  const toneClass =
    tone === "positive"
      ? "before:bg-emerald-500 border-emerald-200/60 bg-emerald-50/90 dark:border-emerald-400/20 dark:bg-emerald-950/35"
      : tone === "warning"
        ? "before:bg-amber-500 border-amber-200/70 bg-amber-50/90 dark:border-amber-400/25 dark:bg-amber-950/30"
        : "before:bg-slate-900 border-slate-200/70 bg-white/90 dark:border-slate-700/80 dark:bg-slate-900/70 dark:before:bg-sky-400";

  return (
    <div className={`relative overflow-hidden rounded-[28px] border p-5 shadow-panel before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
        <span className="rounded-full bg-slate-900/6 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-700/60 dark:text-slate-200">
          Signal
        </span>
      </div>
      <div className="mt-5 pl-1 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{helper}</p>
    </div>
  );
}
