export const BuilderActionTypes = {
  ADD_FIELD: 'ADD_FIELD',
  UPDATE_FIELD: 'UPDATE_FIELD',
  DELETE_FIELD: 'DELETE_FIELD',
  SELECT_FIELD: 'SELECT_FIELD',
  REORDER_FIELDS: 'REORDER_FIELDS',
  MOVE_FIELD: 'MOVE_FIELD',
  SET_SCHEMA: 'SET_SCHEMA',
  RESET_TO_DEMO: 'RESET_TO_DEMO',
  UNDO: 'UNDO',
  REDO: 'REDO',
  SET_UI: 'SET_UI',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
}

export const builderActions = {
  addField: (fieldType, index = null) => ({
    type: BuilderActionTypes.ADD_FIELD,
    payload: { fieldType, index },
  }),

  updateField: (fieldId, changes) => ({
    type: BuilderActionTypes.UPDATE_FIELD,
    payload: { fieldId, changes },
  }),

  deleteField: (fieldId) => ({
    type: BuilderActionTypes.DELETE_FIELD,
    payload: { fieldId },
  }),

  selectField: (fieldId) => ({
    type: BuilderActionTypes.SELECT_FIELD,
    payload: { fieldId },
  }),

  reorderFields: (sourceFieldId, targetFieldId) => ({
    type: BuilderActionTypes.REORDER_FIELDS,
    payload: { sourceFieldId, targetFieldId },
  }),

  moveField: (fieldId, direction) => ({
    type: BuilderActionTypes.MOVE_FIELD,
    payload: { fieldId, direction },
  }),

  setSchema: (schema) => ({
    type: BuilderActionTypes.SET_SCHEMA,
    payload: { schema },
  }),

  resetToDemo: () => ({
    type: BuilderActionTypes.RESET_TO_DEMO,
  }),

  undo: () => ({
    type: BuilderActionTypes.UNDO,
  }),

  redo: () => ({
    type: BuilderActionTypes.REDO,
  }),

  setUi: (changes) => ({
    type: BuilderActionTypes.SET_UI,
    payload: { changes },
  }),

  toggleTheme: () => ({
    type: BuilderActionTypes.TOGGLE_THEME,
  }),

  setActiveView: (view) => ({
    type: BuilderActionTypes.SET_ACTIVE_VIEW,
    payload: { view },
  }),
}
