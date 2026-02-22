export default function Tabs({ tabs, value, onChange, ariaLabel }) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-full rounded-xl border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800 sm:w-auto"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value

        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-medium transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)] sm:flex-none ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
            }`}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
