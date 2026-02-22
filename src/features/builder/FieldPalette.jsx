import Button from '../../components/ui/Button'
import { FIELD_TYPES } from '../schema/schemaModel'
import { DRAG_FIELD_TYPE_MIME, setDragData } from './dnd'

export default function FieldPalette({ onAddField }) {
  const handleDragStart = (event, fieldType) => {
    setDragData(event, DRAG_FIELD_TYPE_MIME, fieldType)
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Field Palette</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Tap to add or drag a field to the canvas.</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {FIELD_TYPES.map((fieldType) => (
          <Button
            key={fieldType.type}
            variant="secondary"
            className="w-full justify-start px-3 text-left"
            onClick={() => onAddField(fieldType.type)}
            draggable
            onDragStart={(event) => handleDragStart(event, fieldType.type)}
            aria-label={`Add ${fieldType.label} field`}
          >
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-100">
              {fieldType.label}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-300">{fieldType.description}</span>
          </Button>
        ))}
      </div>
    </section>
  )
}
