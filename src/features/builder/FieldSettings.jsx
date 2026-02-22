import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { createId } from '../../lib/ids'
import { buildValidationSummary } from './state/selectors'
import { isLengthSupported, isNumberRangeSupported, isOptionsSupported } from '../schema/schemaModel'

function parseNumberInput(value) {
  if (value === '') {
    return null
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

export default function FieldSettings({ selectedField, onUpdateField }) {
  if (!selectedField) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Field Settings</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Select a field on the canvas to configure labels, defaults, and validation.
        </p>
      </section>
    )
  }

  const supportsLength = isLengthSupported(selectedField.type)
  const supportsRange = isNumberRangeSupported(selectedField.type)
  const supportsOptions = isOptionsSupported(selectedField.type)
  const validationSummary = buildValidationSummary(selectedField)

  const applyFieldPatch = (changes) => {
    onUpdateField(selectedField.id, changes)
  }

  const updateValidation = (key, value) => {
    applyFieldPatch({
      validations: {
        [key]: parseNumberInput(value),
      },
    })
  }

  const updateOption = (optionId, changes) => {
    const updatedOptions = selectedField.options.map((option) =>
      option.id === optionId
        ? {
            ...option,
            ...changes,
          }
        : option,
    )

    applyFieldPatch({ options: updatedOptions })
  }

  const removeOption = (optionId) => {
    if (selectedField.options.length <= 1) {
      return
    }

    const updatedOptions = selectedField.options.filter((option) => option.id !== optionId)
    applyFieldPatch({ options: updatedOptions })
  }

  const moveOption = (optionId, direction) => {
    const sourceIndex = selectedField.options.findIndex((option) => option.id === optionId)
    const targetIndex = direction === 'up' ? sourceIndex - 1 : sourceIndex + 1

    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= selectedField.options.length) {
      return
    }

    const nextOptions = [...selectedField.options]
    const [movedOption] = nextOptions.splice(sourceIndex, 1)
    nextOptions.splice(targetIndex, 0, movedOption)

    applyFieldPatch({ options: nextOptions })
  }

  const addOption = () => {
    const nextIndex = selectedField.options.length + 1
    const label = `Option ${nextIndex}`

    applyFieldPatch({
      options: [
        ...selectedField.options,
        {
          id: createId('opt'),
          label,
          value: label.toLowerCase().replace(/\s+/g, '_'),
        },
      ],
    })
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Field Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Editing: {selectedField.label}</p>
      </div>

      <Input
        label="Label"
        value={selectedField.label}
        onChange={(event) => applyFieldPatch({ label: event.target.value })}
      />

      {selectedField.type !== 'checkbox' && (
        <Input
          label="Placeholder"
          value={selectedField.placeholder}
          onChange={(event) => applyFieldPatch({ placeholder: event.target.value })}
        />
      )}

      <Input
        label="Help text"
        value={selectedField.helpText}
        onChange={(event) => applyFieldPatch({ helpText: event.target.value })}
      />

      <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={selectedField.required}
          onChange={(event) => applyFieldPatch({ required: event.target.checked })}
          className="h-4 w-4"
        />
        Required field
      </label>

      <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Default Value</h3>

        {selectedField.type === 'checkbox' ? (
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={Boolean(selectedField.defaultValue)}
              onChange={(event) => applyFieldPatch({ defaultValue: event.target.checked })}
              className="h-4 w-4"
            />
            Checked by default
          </label>
        ) : selectedField.type === 'select' ? (
          <Input
            as="select"
            label="Choose default option"
            value={selectedField.defaultValue || ''}
            onChange={(event) => applyFieldPatch({ defaultValue: event.target.value })}
          >
            <option value="">No default</option>
            {selectedField.options.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        ) : (
          <Input
            label="Default value"
            type={selectedField.type === 'number' ? 'number' : selectedField.type === 'date' ? 'date' : 'text'}
            value={selectedField.defaultValue ?? ''}
            onChange={(event) =>
              applyFieldPatch({
                defaultValue:
                  selectedField.type === 'number' ? parseNumberInput(event.target.value) ?? '' : event.target.value,
              })
            }
          />
        )}
      </div>

      {(supportsLength || supportsRange) && (
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Validation Rules</h3>

          {supportsLength && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                label="Min length"
                type="number"
                value={selectedField.validations.minLength ?? ''}
                onChange={(event) => updateValidation('minLength', event.target.value)}
                min="0"
              />
              <Input
                label="Max length"
                type="number"
                value={selectedField.validations.maxLength ?? ''}
                onChange={(event) => updateValidation('maxLength', event.target.value)}
                min="0"
              />
            </div>
          )}

          {supportsRange && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                label="Minimum"
                type="number"
                value={selectedField.validations.min ?? ''}
                onChange={(event) => updateValidation('min', event.target.value)}
              />
              <Input
                label="Maximum"
                type="number"
                value={selectedField.validations.max ?? ''}
                onChange={(event) => updateValidation('max', event.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {supportsOptions && (
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Select Options</h3>
            <Button variant="secondary" onClick={addOption} aria-label="Add option">
              Add option
            </Button>
          </div>

          <div className="space-y-2">
            {selectedField.options.map((option, index) => (
              <div key={option.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    label={`Option ${index + 1} Label`}
                    value={option.label}
                    onChange={(event) => updateOption(option.id, { label: event.target.value })}
                  />
                  <Input
                    label={`Option ${index + 1} Value`}
                    value={option.value}
                    onChange={(event) => updateOption(option.id, { value: event.target.value })}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="min-h-11 min-w-11"
                    onClick={() => moveOption(option.id, 'up')}
                    disabled={index === 0}
                    aria-label={`Move ${option.label} option up`}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 min-w-11"
                    onClick={() => moveOption(option.id, 'down')}
                    disabled={index === selectedField.options.length - 1}
                    aria-label={`Move ${option.label} option down`}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 min-w-11 text-rose-600 dark:text-rose-300"
                    onClick={() => removeOption(option.id)}
                    disabled={selectedField.options.length <= 1}
                    aria-label={`Remove ${option.label} option`}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Validation Summary</h3>
        {validationSummary.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {validationSummary.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No active validation rules.</p>
        )}
      </div>
    </section>
  )
}
