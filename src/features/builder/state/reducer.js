import { createDemoSchema, createField, normalizeSchema } from '../../schema/schemaModel'
import { BuilderActionTypes } from './actions'

const MAX_HISTORY_ITEMS = 60

const defaultUiState = {
  activeView: 'builder',
  mobilePaletteOpen: false,
  mobileSettingsOpen: false,
  aboutOpen: false,
  importOpen: false,
  exportOpen: false,
  confirmResetOpen: false,
  applyingImport: false,
  theme: 'light',
}

const defaultHistoryState = {
  past: [],
  future: [],
}

function ensureValidSelection(schema, selectedFieldId) {
  if (!schema.fields.length) {
    return null
  }

  if (selectedFieldId && schema.fields.some((field) => field.id === selectedFieldId)) {
    return selectedFieldId
  }

  return schema.fields[0].id
}

function withSchemaChange(state, nextSchema, nextSelectedFieldId = state.selectedFieldId) {
  const selectedFieldId = ensureValidSelection(nextSchema, nextSelectedFieldId)
  const past = [...state.history.past, state.schema].slice(-MAX_HISTORY_ITEMS)

  return {
    ...state,
    schema: nextSchema,
    selectedFieldId,
    history: {
      past,
      future: [],
    },
  }
}

function insertAtIndex(items, index, item) {
  if (index === null || index === undefined || index < 0 || index >= items.length) {
    return [...items, item]
  }

  return [...items.slice(0, index), item, ...items.slice(index)]
}

function reorderFields(fields, sourceFieldId, targetFieldId) {
  if (!sourceFieldId || !targetFieldId || sourceFieldId === targetFieldId) {
    return fields
  }

  const sourceIndex = fields.findIndex((field) => field.id === sourceFieldId)
  const targetIndex = fields.findIndex((field) => field.id === targetFieldId)

  if (sourceIndex < 0 || targetIndex < 0) {
    return fields
  }

  const nextFields = [...fields]
  const [movedField] = nextFields.splice(sourceIndex, 1)
  nextFields.splice(targetIndex, 0, movedField)

  return nextFields
}

function moveFieldByDirection(fields, fieldId, direction) {
  const fromIndex = fields.findIndex((field) => field.id === fieldId)

  if (fromIndex < 0) {
    return fields
  }

  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

  if (toIndex < 0 || toIndex >= fields.length) {
    return fields
  }

  const nextFields = [...fields]
  const [movedField] = nextFields.splice(fromIndex, 1)
  nextFields.splice(toIndex, 0, movedField)

  return nextFields
}

function patchField(field, changes) {
  const nextField = {
    ...field,
    ...changes,
  }

  if (changes.validations) {
    nextField.validations = {
      ...field.validations,
      ...changes.validations,
    }
  }

  if (Array.isArray(changes.options)) {
    nextField.options = changes.options.map((option) => ({ ...option }))
  }

  return nextField
}

export function createInitialBuilderState(persistedState = null) {
  const persistedSchema = persistedState?.schema || createDemoSchema()
  const normalizedSchema = normalizeSchema(persistedSchema)
  const persistedUi = persistedState?.uiPreferences || {}

  return {
    schema: normalizedSchema,
    selectedFieldId: normalizedSchema.fields[0]?.id || null,
    ui: {
      ...defaultUiState,
      activeView: persistedUi.activeView === 'preview' ? 'preview' : 'builder',
      theme: persistedUi.theme === 'dark' ? 'dark' : 'light',
    },
    history: {
      ...defaultHistoryState,
      past: [],
      future: [],
    },
  }
}

export function builderReducer(state, action) {
  switch (action.type) {
    case BuilderActionTypes.ADD_FIELD: {
      const newField = createField(action.payload.fieldType)
      const nextFields = insertAtIndex(state.schema.fields, action.payload.index, newField)
      const nextSchema = {
        ...state.schema,
        fields: nextFields,
      }

      return withSchemaChange(state, nextSchema, newField.id)
    }

    case BuilderActionTypes.UPDATE_FIELD: {
      const nextFields = state.schema.fields.map((field) => {
        if (field.id !== action.payload.fieldId) {
          return field
        }

        return patchField(field, action.payload.changes)
      })

      const nextSchema = {
        ...state.schema,
        fields: nextFields,
      }

      return withSchemaChange(state, nextSchema)
    }

    case BuilderActionTypes.DELETE_FIELD: {
      const nextFields = state.schema.fields.filter((field) => field.id !== action.payload.fieldId)
      const nextSchema = {
        ...state.schema,
        fields: nextFields,
      }

      return withSchemaChange(state, nextSchema)
    }

    case BuilderActionTypes.SELECT_FIELD:
      return {
        ...state,
        selectedFieldId: action.payload.fieldId,
      }

    case BuilderActionTypes.REORDER_FIELDS: {
      const nextFields = reorderFields(
        state.schema.fields,
        action.payload.sourceFieldId,
        action.payload.targetFieldId,
      )

      if (nextFields === state.schema.fields) {
        return state
      }

      const nextSchema = {
        ...state.schema,
        fields: nextFields,
      }

      return withSchemaChange(state, nextSchema)
    }

    case BuilderActionTypes.MOVE_FIELD: {
      const nextFields = moveFieldByDirection(
        state.schema.fields,
        action.payload.fieldId,
        action.payload.direction,
      )

      if (nextFields === state.schema.fields) {
        return state
      }

      const nextSchema = {
        ...state.schema,
        fields: nextFields,
      }

      return withSchemaChange(state, nextSchema)
    }

    case BuilderActionTypes.SET_SCHEMA: {
      const nextSchema = normalizeSchema(action.payload.schema)
      return withSchemaChange(state, nextSchema)
    }

    case BuilderActionTypes.RESET_TO_DEMO: {
      const nextSchema = createDemoSchema()
      return withSchemaChange(state, nextSchema)
    }

    case BuilderActionTypes.UNDO: {
      if (!state.history.past.length) {
        return state
      }

      const previousSchema = state.history.past[state.history.past.length - 1]
      const remainingPast = state.history.past.slice(0, -1)
      const future = [state.schema, ...state.history.future].slice(0, MAX_HISTORY_ITEMS)

      return {
        ...state,
        schema: previousSchema,
        selectedFieldId: ensureValidSelection(previousSchema, state.selectedFieldId),
        history: {
          past: remainingPast,
          future,
        },
      }
    }

    case BuilderActionTypes.REDO: {
      if (!state.history.future.length) {
        return state
      }

      const nextSchema = state.history.future[0]
      const remainingFuture = state.history.future.slice(1)
      const past = [...state.history.past, state.schema].slice(-MAX_HISTORY_ITEMS)

      return {
        ...state,
        schema: nextSchema,
        selectedFieldId: ensureValidSelection(nextSchema, state.selectedFieldId),
        history: {
          past,
          future: remainingFuture,
        },
      }
    }

    case BuilderActionTypes.SET_UI:
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload.changes,
        },
      }

    case BuilderActionTypes.TOGGLE_THEME:
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: state.ui.theme === 'dark' ? 'light' : 'dark',
        },
      }

    case BuilderActionTypes.SET_ACTIVE_VIEW:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeView: action.payload.view === 'preview' ? 'preview' : 'builder',
        },
      }

    default:
      return state
  }
}
