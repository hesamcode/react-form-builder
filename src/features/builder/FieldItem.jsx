import Button from '../../components/ui/Button'
import { DRAG_EXISTING_FIELD_MIME, DRAG_FIELD_TYPE_MIME, getDragData, setDragData } from './dnd'

function FieldPreview({ field }) {
  const commonClassName =
    'w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          className={commonClassName}
          placeholder={field.placeholder || 'Textarea'}
          rows={3}
          disabled
          aria-label={`${field.label} preview`}
        />
      )

    case 'select':
      return (
        <select className={commonClassName} disabled aria-label={`${field.label} preview`}>
          <option>{field.placeholder || 'Select an option'}</option>
          {field.options.map((option) => (
            <option key={option.id}>{option.label}</option>
          ))}
        </select>
      )

    case 'checkbox':
      return (
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={Boolean(field.defaultValue)} readOnly disabled />
          <span>{field.label}</span>
        </label>
      )

    default:
      return (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
          className={commonClassName}
          placeholder={field.placeholder || `${field.label}...`}
          disabled
          aria-label={`${field.label} preview`}
        />
      )
  }
}

export default function FieldItem({
  field,
  index,
  total,
  isSelected,
  onSelect,
  onDelete,
  onMove,
  onDropField,
  onDropFieldType,
}) {
  const handleDragStart = (event) => {
    setDragData(event, DRAG_EXISTING_FIELD_MIME, field.id)
  }

  const handleDrop = (event) => {
    event.preventDefault()

    const sourceFieldId = getDragData(event, DRAG_EXISTING_FIELD_MIME)

    if (sourceFieldId) {
      onDropField(sourceFieldId, field.id)
      return
    }

    const fieldType = getDragData(event, DRAG_FIELD_TYPE_MIME)

    if (fieldType) {
      onDropFieldType(fieldType, index)
    }
  }

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={`rounded-xl border p-3 shadow-sm transition motion-reduce:transition-none ${
        isSelected
          ? 'border-[color:var(--color-primary-500)] bg-sky-50 dark:bg-slate-800'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="min-h-11 flex-1 rounded-lg px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)]"
          aria-label={`Select ${field.label} field`}
        >
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{field.label}</p>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{field.type}</p>
        </button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11"
            onClick={() => onMove('up')}
            disabled={index === 0}
            aria-label={`Move ${field.label} up`}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11"
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            aria-label={`Move ${field.label} down`}
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11 text-rose-600 dark:text-rose-300"
            onClick={onDelete}
            aria-label={`Delete ${field.label} field`}
          >
            ✕
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <FieldPreview field={field} />
        {field.helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{field.helpText}</p>}
        {field.required && (
          <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Required
          </span>
        )}
      </div>
    </article>
  )
}
