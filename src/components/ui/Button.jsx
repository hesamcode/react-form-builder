import { forwardRef } from 'react'

const baseClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary:
    'border-transparent bg-[color:var(--color-primary-500)] text-white hover:brightness-95 focus-visible:ring-[color:var(--color-primary-500)]',
  secondary:
    'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-[color:var(--color-primary-500)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost:
    'border-transparent bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-[color:var(--color-primary-500)] dark:text-slate-100 dark:hover:bg-slate-800',
  danger:
    'border-transparent bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
}

const sizes = {
  sm: 'min-h-10 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
}

const Button = forwardRef(function Button(
  {
    type = 'button',
    variant = 'secondary',
    size = 'md',
    className = '',
    children,
    ...props
  },
  ref,
) {
  const variantClassName = variants[variant] || variants.secondary
  const sizeClassName = sizes[size] || sizes.md

  return (
    <button
      ref={ref}
      type={type}
      className={`${baseClassName} ${variantClassName} ${sizeClassName} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
