export default function SectionCard({ title, subtitle, actions, children, className = "" }) {
  return (
    <section
      className={`rounded-[30px] border border-slate-200/80 bg-white/88 p-6 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate/75 ${className}`}
    >
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-[1.15rem] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">{subtitle}</p>
            ) : null}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
