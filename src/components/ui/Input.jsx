import { useId } from 'react'

export default function Input({
  label,
  id,
  as = 'input',
  hint,
  error,
  className = '',
  inputClassName = '',
  children,
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const Component = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input'

  return (
    <div className={`space-y-1 ${className}`.trim()}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-slate-100">
        {label}
      </label>
      <Component
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition motion-reduce:transition-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${inputClassName}`.trim()}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? `${inputId}-meta` : undefined}
        {...props}
      >
        {children}
      </Component>
      {(hint || error) && (
        <p
          id={`${inputId}-meta`}
          className={`text-xs ${error ? 'text-rose-600 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
