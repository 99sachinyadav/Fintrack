export default function PageHeader({ eyebrow, title, description, actions, stats = [] }) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-slate-200/70 bg-white/85 p-6 shadow-panel backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/72 lg:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 lg:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      {stats.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 p-4 dark:border-slate-700/80 dark:bg-slate-800/65"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                {stat.label}
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">{stat.helper}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
