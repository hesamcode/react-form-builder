import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import BuilderPage from '../features/builder/BuilderPage'
import PreviewPage from '../features/preview/PreviewPage'
import {
  copySchemaToClipboard,
  downloadSchema,
  parseImportedSchema,
  serializeSchema,
} from '../features/schema/importExport'
import { builderActions } from '../features/builder/state/actions'
import { builderReducer, createInitialBuilderState } from '../features/builder/state/reducer'
import {
  selectCanRedo,
  selectCanUndo,
  selectSelectedField,
} from '../features/builder/state/selectors'
import {
  loadPersistedAppState,
  loadThemePreference,
  savePersistedAppState,
  saveThemePreference,
} from '../lib/storage'
import { createId } from '../lib/ids'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Tabs from '../components/ui/Tabs'
import Toast from '../components/ui/Toast'

const tabs = [
  { value: 'builder', label: 'Builder' },
  { value: 'preview', label: 'Preview' },
]

export default function AppShell() {
  const persistedState = useMemo(() => loadPersistedAppState(), [])
  const [state, dispatch] = useReducer(builderReducer, persistedState, (loadedState) => {
    const initialState = createInitialBuilderState(loadedState)
    const storedTheme = loadThemePreference()

    if (storedTheme) {
      initialState.ui.theme = storedTheme
    }

    return initialState
  })

  const [toasts, setToasts] = useState([])
  const [importText, setImportText] = useState('')
  const [importErrors, setImportErrors] = useState([])

  const selectedField = selectSelectedField(state)
  const canUndo = selectCanUndo(state)
  const canRedo = selectCanRedo(state)
  const serializedSchema = useMemo(() => serializeSchema(state.schema), [state.schema])

  const dismissToast = useCallback((toastId) => {
    setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== toastId))
  }, [])

  const addToast = useCallback((message, tone = 'info') => {
    const id = createId('toast')

    setToasts((previousToasts) => [...previousToasts, { id, message, tone }])

    window.setTimeout(() => {
      setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  useEffect(() => {
    savePersistedAppState({
      schema: state.schema,
      uiPreferences: {
        activeView: state.ui.activeView,
        theme: state.ui.theme,
      },
    })
  }, [state.schema, state.ui.activeView, state.ui.theme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.ui.theme === 'dark')
    saveThemePreference(state.ui.theme)
  }, [state.ui.theme])

  useEffect(() => {
    if (persistedState.seededDemo) {
      const timeoutId = window.setTimeout(() => {
        addToast('Demo schema was seeded for your first run.', 'info')
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    return undefined
  }, [addToast, persistedState.seededDemo])

  const openImportModal = () => {
    setImportText('')
    setImportErrors([])
    dispatch(
      builderActions.setUi({
        importOpen: true,
      }),
    )
  }

  const handleApplyImport = () => {
    const result = parseImportedSchema(importText)

    if (!result.isValid) {
      setImportErrors(result.errors)
      return
    }

    setImportErrors([])
    dispatch(
      builderActions.setUi({
        importOpen: false,
        applyingImport: true,
        activeView: 'builder',
        mobilePaletteOpen: false,
        mobileSettingsOpen: false,
      }),
    )

    window.setTimeout(() => {
      dispatch(builderActions.setSchema(result.schema))
      dispatch(
        builderActions.setUi({
          applyingImport: false,
        }),
      )
      addToast('Schema imported successfully.', 'success')
    }, 450)
  }

  const handleManualSave = () => {
    savePersistedAppState({
      schema: state.schema,
      uiPreferences: {
        activeView: state.ui.activeView,
        theme: state.ui.theme,
      },
    })

    addToast('Schema saved to localStorage.', 'success')
  }

  const handleCopyExport = async () => {
    try {
      await copySchemaToClipboard(state.schema)
      addToast('Schema copied to clipboard.', 'success')
    } catch (error) {
      addToast(error.message || 'Unable to copy schema to clipboard.', 'error')
    }
  }

  const handleDownloadExport = () => {
    downloadSchema(state.schema)
    addToast('Schema JSON downloaded.', 'success')
  }

  const handleConfirmReset = () => {
    dispatch(builderActions.resetToDemo())
    dispatch(
      builderActions.setUi({
        confirmResetOpen: false,
        activeView: 'builder',
      }),
    )
    addToast('Builder reset to demo schema.', 'success')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-primary-500)]">
                Form Builder Pro
              </p>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Schema-driven form workspace</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => dispatch(builderActions.toggleTheme())}
                aria-label="Toggle light and dark theme"
              >
                {state.ui.theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => dispatch(builderActions.setUi({ aboutOpen: true }))}
                aria-label="Open about dialog"
              >
                About
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <Tabs
              tabs={tabs}
              value={state.ui.activeView}
              onChange={(view) => dispatch(builderActions.setActiveView(view))}
              ariaLabel="Switch between builder and preview views"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => dispatch(builderActions.undo())}
                disabled={!canUndo}
                aria-label="Undo last schema change"
              >
                Undo
              </Button>
              <Button
                variant="secondary"
                onClick={() => dispatch(builderActions.redo())}
                disabled={!canRedo}
                aria-label="Redo schema change"
              >
                Redo
              </Button>
              <Button variant="secondary" onClick={handleManualSave} aria-label="Save schema to local storage">
                Save
              </Button>
              <Button variant="secondary" onClick={openImportModal} aria-label="Import schema from JSON">
                Import
              </Button>
              <Button
                variant="secondary"
                onClick={() => dispatch(builderActions.setUi({ exportOpen: true }))}
                aria-label="Open schema export options"
              >
                Export
              </Button>
              <Button
                variant="danger"
                onClick={() => dispatch(builderActions.setUi({ confirmResetOpen: true }))}
                aria-label="Reset schema to demo"
              >
                Reset to demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6">
        {state.ui.activeView === 'preview' ? (
          <PreviewPage schema={state.schema} />
        ) : (
          <BuilderPage
            schema={state.schema}
            selectedField={selectedField}
            selectedFieldId={state.selectedFieldId}
            ui={state.ui}
            onAddField={(fieldType, index) => {
              dispatch(builderActions.addField(fieldType, index))
              dispatch(builderActions.setUi({ mobilePaletteOpen: false }))
            }}
            onSelectField={(fieldId) => {
              dispatch(builderActions.selectField(fieldId))
            }}
            onDeleteField={(fieldId) => {
              dispatch(builderActions.deleteField(fieldId))
            }}
            onMoveField={(fieldId, direction) => {
              dispatch(builderActions.moveField(fieldId, direction))
            }}
            onReorderFields={(sourceFieldId, targetFieldId) => {
              dispatch(builderActions.reorderFields(sourceFieldId, targetFieldId))
            }}
            onUpdateField={(fieldId, changes) => {
              dispatch(builderActions.updateField(fieldId, changes))
            }}
            onToggleMobilePalette={(isOpen) => {
              dispatch(builderActions.setUi({ mobilePaletteOpen: isOpen }))
            }}
            onToggleMobileSettings={(isOpen) => {
              dispatch(builderActions.setUi({ mobileSettingsOpen: isOpen }))
            }}
          />
        )}

        <footer className="mt-10 pb-6 text-center text-base text-slate-600 dark:text-slate-300">
          Built by{" "}
          <a
            href="https://hesamcode.github.io"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit HesamCode portfolio website"
            className="underline underline-offset-4 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-500)]"
          >
            HesamCode
          </a>
        </footer>
      </main>

      <Modal
        isOpen={state.ui.importOpen}
        onClose={() => dispatch(builderActions.setUi({ importOpen: false }))}
        title="Import Schema"
        describedBy
        footer={(
          <>
            <Button
              variant="secondary"
              onClick={() => dispatch(builderActions.setUi({ importOpen: false }))}
              aria-label="Cancel schema import"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApplyImport} aria-label="Apply imported schema">
              Apply schema
            </Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Paste a JSON schema payload. Invalid JSON is safely handled with friendly messages.
        </p>
        <label htmlFor="import-schema-input" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          Schema JSON
        </label>
        <textarea
          id="import-schema-input"
          className="h-56 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder={`{\n  "title": "My Form",\n  "fields": []\n}`}
        />
        {importErrors.length > 0 && (
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">
            <p className="font-semibold">Import issues</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {importErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={state.ui.exportOpen}
        onClose={() => dispatch(builderActions.setUi({ exportOpen: false }))}
        title="Export Schema"
        describedBy
        footer={(
          <>
            <Button
              variant="secondary"
              onClick={() => dispatch(builderActions.setUi({ exportOpen: false }))}
              aria-label="Close schema export dialog"
            >
              Close
            </Button>
            <Button variant="secondary" onClick={handleCopyExport} aria-label="Copy schema JSON to clipboard">
              Copy JSON
            </Button>
            <Button variant="primary" onClick={handleDownloadExport} aria-label="Download schema as JSON file">
              Download JSON
            </Button>
          </>
        )}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Exported schema is versioned and ready for sharing.
        </p>
        <label htmlFor="export-schema-output" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          Export payload
        </label>
        <textarea
          id="export-schema-output"
          className="h-56 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary-500)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={serializedSchema}
          readOnly
        />
      </Modal>

      <Modal
        isOpen={state.ui.confirmResetOpen}
        onClose={() => dispatch(builderActions.setUi({ confirmResetOpen: false }))}
        title="Reset to Demo"
        describedBy
        footer={(
          <>
            <Button
              variant="secondary"
              onClick={() => dispatch(builderActions.setUi({ confirmResetOpen: false }))}
              aria-label="Cancel reset to demo"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReset} aria-label="Confirm reset to demo schema">
              Reset now
            </Button>
          </>
        )}
      >
        <p className="text-sm text-slate-700 dark:text-slate-200">
          This replaces the current schema with the demo schema. Your current state can still be restored using Undo.
        </p>
      </Modal>

      <Modal
        isOpen={state.ui.aboutOpen}
        onClose={() => dispatch(builderActions.setUi({ aboutOpen: false }))}
        title="About Form Builder Pro"
        describedBy
        footer={(
          <Button
            variant="secondary"
            onClick={() => dispatch(builderActions.setUi({ aboutOpen: false }))}
            aria-label="Close about dialog"
          >
            Close
          </Button>
        )}
      >
        <p className="text-sm text-slate-700 dark:text-slate-200">
          This project was designed and developed by HesamCode as part of a professional portfolio demonstrating advanced front-end engineering, product architecture, and UI/UX expertise.
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Built by{' '}
          <a
            href="https://hesamcode.github.io"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit HesamCode portfolio website"
            className="underline underline-offset-4 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-500)]"
          >
            HesamCode
          </a>
        </p>
      </Modal>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
