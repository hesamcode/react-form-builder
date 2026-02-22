import Button from '../../components/ui/Button'
import DrawerOrSheet from '../../components/ui/DrawerOrSheet'
import FieldPalette from './FieldPalette'
import FieldSettings from './FieldSettings'
import FormCanvas from './FormCanvas'

export default function BuilderPage({
  schema,
  selectedField,
  selectedFieldId,
  ui,
  onAddField,
  onSelectField,
  onDeleteField,
  onMoveField,
  onReorderFields,
  onUpdateField,
  onToggleMobilePalette,
  onToggleMobileSettings,
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => onToggleMobilePalette(true)}
          aria-label="Open field palette"
        >
          Field Palette
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => onToggleMobileSettings(true)}
          disabled={!selectedFieldId}
          aria-label="Open field settings"
        >
          Field Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:block">
          <FieldPalette onAddField={onAddField} />
        </aside>

        <div className="min-w-0">
          <FormCanvas
            fields={schema.fields}
            selectedFieldId={selectedFieldId}
            isApplyingImport={ui.applyingImport}
            onSelectField={onSelectField}
            onDeleteField={onDeleteField}
            onMoveField={onMoveField}
            onReorderFields={onReorderFields}
            onAddField={onAddField}
          />
        </div>

        <aside className="hidden lg:block">
          <FieldSettings selectedField={selectedField} onUpdateField={onUpdateField} />
        </aside>
      </div>

      <DrawerOrSheet
        isOpen={ui.mobilePaletteOpen}
        onClose={() => onToggleMobilePalette(false)}
        title="Field Palette"
      >
        <FieldPalette onAddField={onAddField} />
      </DrawerOrSheet>

      <DrawerOrSheet
        isOpen={ui.mobileSettingsOpen}
        onClose={() => onToggleMobileSettings(false)}
        title="Field Settings"
      >
        <FieldSettings selectedField={selectedField} onUpdateField={onUpdateField} />
      </DrawerOrSheet>
    </section>
  )
}
