import { createPortal } from 'react-dom'
import Button from './Button'

const toneClasses = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100',
  error: 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100',
  info: 'border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
}

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null
  }

  return createPortal(
    <section
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-3 top-3 z-50 flex w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border p-3 shadow-lg ${toneClasses[toast.tone] || toneClasses.info}`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{toast.message}</p>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-10 min-w-10"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </Button>
          </div>
        </div>
      ))}
    </section>,
    document.body,
  )
}
