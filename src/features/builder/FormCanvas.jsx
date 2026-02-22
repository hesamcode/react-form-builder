import Button from '../../components/ui/Button'
import { DRAG_EXISTING_FIELD_MIME, DRAG_FIELD_TYPE_MIME, getDragData } from './dnd'
import FieldItem from './FieldItem'

function CanvasSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 motion-reduce:animate-none"
        />
      ))}
    </div>
  )
}

export default function FormCanvas({
  fields,
  selectedFieldId,
  isApplyingImport,
  onSelectField,
  onDeleteField,
  onMoveField,
  onReorderFields,
  onAddField,
}) {
  const handleCanvasDrop = (event) => {
    event.preventDefault()

    const sourceFieldId = getDragData(event, DRAG_EXISTING_FIELD_MIME)
    const droppedFieldType = getDragData(event, DRAG_FIELD_TYPE_MIME)

    if (sourceFieldId && fields.length) {
      const lastField = fields[fields.length - 1]

      if (lastField.id !== sourceFieldId) {
        onReorderFields(sourceFieldId, lastField.id)
      }

      return
    }

    if (droppedFieldType) {
      onAddField(droppedFieldType)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Form Canvas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Drag fields here, reorder them, and tap a field to edit settings.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {fields.length} field{fields.length === 1 ? '' : 's'}
        </span>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleCanvasDrop}
        className="min-h-[16rem] rounded-xl border border-dashed border-slate-300 p-2 dark:border-slate-600 sm:p-3"
      >
        {isApplyingImport ? (
          <CanvasSkeleton />
        ) : fields.length === 0 ? (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No fields yet</h3>
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
              Start by adding a field from the palette. You can also drag a field into this area.
            </p>
            <Button variant="primary" onClick={() => onAddField('text')} aria-label="Add first text field">
              Add your first field
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <FieldItem
                key={field.id}
                field={field}
                index={index}
                total={fields.length}
                isSelected={selectedFieldId === field.id}
                onSelect={() => onSelectField(field.id)}
                onDelete={() => onDeleteField(field.id)}
                onMove={(direction) => onMoveField(field.id, direction)}
                onDropField={onReorderFields}
                onDropFieldType={(fieldType, insertIndex) => onAddField(fieldType, insertIndex)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
