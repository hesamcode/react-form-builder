import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'

function buildInitialValues(fields) {
  return fields.reduce((accumulator, field) => {
    if (field.type === 'checkbox') {
      accumulator[field.id] = Boolean(field.defaultValue)
      return accumulator
    }

    if (field.type === 'number') {
      accumulator[field.id] =
        field.defaultValue === null || field.defaultValue === undefined || field.defaultValue === ''
          ? ''
          : String(field.defaultValue)
      return accumulator
    }

    accumulator[field.id] = field.defaultValue ?? ''
    return accumulator
  }, {})
}

function validateField(field, value) {
  const valueAsString = typeof value === 'string' ? value : ''

  if (field.required) {
    if (field.type === 'checkbox') {
      if (!value) {
        return 'This checkbox must be checked.'
      }
    } else if (!valueAsString.trim()) {
      return 'This field is required.'
    }
  }

  if (!valueAsString && field.type !== 'checkbox') {
    return null
  }

  if (field.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(valueAsString)) {
      return 'Please enter a valid email address.'
    }
  }

  if (field.type === 'text' || field.type === 'email' || field.type === 'textarea') {
    if (field.validations.minLength !== null && valueAsString.length < field.validations.minLength) {
      return `Must be at least ${field.validations.minLength} characters.`
    }

    if (field.validations.maxLength !== null && valueAsString.length > field.validations.maxLength) {
      return `Must be at most ${field.validations.maxLength} characters.`
    }
  }

  if (field.type === 'number') {
    const numericValue = Number(value)

    if (!Number.isFinite(numericValue)) {
      return 'Please enter a valid number.'
    }

    if (field.validations.min !== null && numericValue < field.validations.min) {
      return `Must be at least ${field.validations.min}.`
    }

    if (field.validations.max !== null && numericValue > field.validations.max) {
      return `Must be at most ${field.validations.max}.`
    }
  }

  if (field.type === 'select') {
    if (value && !field.options.some((option) => option.value === value)) {
      return 'Please choose a valid option.'
    }
  }

  return null
}

function normalizeSubmissionValue(field, value) {
  if (field.type === 'checkbox') {
    return Boolean(value)
  }

  if (field.type === 'number') {
    if (value === '') {
      return null
    }

    return Number(value)
  }

  return value
}

export default function PreviewForm({ schema }) {
  const initialValues = useMemo(() => buildInitialValues(schema.fields), [schema])
  const [values, setValues] = useState(() => initialValues)
  const [errors, setErrors] = useState(() => ({}))
  const [touched, setTouched] = useState(() => ({}))
  const [submittedValues, setSubmittedValues] = useState(() => null)

  const handleChange = (field, nextValue) => {
    setValues((previousValues) => ({
      ...previousValues,
      [field.id]: nextValue,
    }))
    setSubmittedValues(null)
  }

  const handleBlur = (field) => {
    const fieldError = validateField(field, values[field.id])

    setTouched((previousTouched) => ({
      ...previousTouched,
      [field.id]: true,
    }))

    setErrors((previousErrors) => ({
      ...previousErrors,
      [field.id]: fieldError,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextTouched = {}
    const nextErrors = {}

    schema.fields.forEach((field) => {
      nextTouched[field.id] = true
      nextErrors[field.id] = validateField(field, values[field.id])
    })

    setTouched(nextTouched)
    setErrors(nextErrors)

    const firstError = Object.values(nextErrors).find(Boolean)

    if (firstError) {
      return
    }

    const normalizedValues = schema.fields.reduce((accumulator, field) => {
      accumulator[field.label] = normalizeSubmissionValue(field, values[field.id])
      return accumulator
    }, {})

    setSubmittedValues(normalizedValues)
  }

  const handleReset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setSubmittedValues(null)
  }

  const renderFieldInput = (field) => {
    const inputId = `preview-${field.id}`
    const fieldError = touched[field.id] ? errors[field.id] : null
    const sharedProps = {
      id: inputId,
      className:
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
      'aria-invalid': Boolean(fieldError),
      'aria-describedby': field.helpText || fieldError ? `${inputId}-meta` : undefined,
      onBlur: () => handleBlur(field),
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          {...sharedProps}
          rows={4}
          value={values[field.id]}
          placeholder={field.placeholder}
          onChange={(event) => handleChange(field, event.target.value)}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <select
          {...sharedProps}
          value={values[field.id]}
          onChange={(event) => handleChange(field, event.target.value)}
        >
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'checkbox') {
      return (
        <label className="inline-flex min-h-11 items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          <input
            {...sharedProps}
            type="checkbox"
            className="h-4 w-4"
            checked={Boolean(values[field.id])}
            onChange={(event) => handleChange(field, event.target.checked)}
          />
          {field.label}
        </label>
      )
    }

    return (
      <input
        {...sharedProps}
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type}
        value={values[field.id]}
        placeholder={field.placeholder}
        onChange={(event) => handleChange(field, event.target.value)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {schema.fields.map((field) => {
          const inputId = `preview-${field.id}`
          const fieldError = touched[field.id] ? errors[field.id] : null

          return (
            <div key={field.id} className="space-y-1">
              {field.type !== 'checkbox' && (
                <label htmlFor={inputId} className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  {field.label}
                  {field.required && <span className="ml-1 text-rose-600">*</span>}
                </label>
              )}
              {renderFieldInput(field)}
              {(field.helpText || fieldError) && (
                <p
                  id={`${inputId}-meta`}
                  className={`text-xs ${fieldError ? 'text-rose-600 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {fieldError || field.helpText}
                </p>
              )}
            </div>
          )
        })}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" variant="primary" aria-label="Submit preview form">
            Submit
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset} aria-label="Reset preview form">
            Reset
          </Button>
        </div>
      </form>

      {submittedValues && (
        <section className="space-y-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950">
          <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">Submission successful</h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            Values were validated and submitted successfully.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-100">
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
        </section>
      )}
    </div>
  )
}
