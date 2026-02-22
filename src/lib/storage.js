import { createDemoSchema, normalizeSchema, SCHEMA_VERSION } from '../features/schema/schemaModel'

export const STORAGE_VERSION = 1
export const STORAGE_KEY = `form_builder_pro_v${STORAGE_VERSION}`
export const THEME_STORAGE_KEY = 'form_builder_pro_theme'

const LEGACY_KEYS = ['form_builder_pro_v0', 'form_builder_pro']

const DEFAULT_UI_PREFERENCES = {
  theme: 'light',
  activeView: 'builder',
}

function safeParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function findLegacyPayload() {
  try {
    for (const key of LEGACY_KEYS) {
      const value = localStorage.getItem(key)

      if (!value) {
        continue
      }

      const parsed = safeParse(value)

      if (parsed) {
        return parsed
      }
    }
  } catch {
    return null
  }

  return null
}

function migratePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const sourceSchema = payload.schema || payload

  return {
    storageVersion: STORAGE_VERSION,
    schemaVersion: SCHEMA_VERSION,
    schema: normalizeSchema(sourceSchema),
    uiPreferences: {
      ...DEFAULT_UI_PREFERENCES,
      ...(payload.uiPreferences || {}),
    },
  }
}

export function loadPersistedAppState() {
  if (typeof window === 'undefined') {
    return {
      schema: createDemoSchema(),
      uiPreferences: DEFAULT_UI_PREFERENCES,
      seededDemo: true,
    }
  }

  let directPayload = null

  try {
    directPayload = safeParse(localStorage.getItem(STORAGE_KEY) || '')
  } catch {
    directPayload = null
  }

  const payload = directPayload || findLegacyPayload()

  if (!payload) {
    return {
      schema: createDemoSchema(),
      uiPreferences: DEFAULT_UI_PREFERENCES,
      seededDemo: true,
    }
  }

  const migrated = migratePayload(payload)

  if (!migrated) {
    return {
      schema: createDemoSchema(),
      uiPreferences: DEFAULT_UI_PREFERENCES,
      seededDemo: true,
    }
  }

  return {
    schema: migrated.schema,
    uiPreferences: migrated.uiPreferences,
    seededDemo: false,
  }
}

export function savePersistedAppState({ schema, uiPreferences }) {
  if (typeof window === 'undefined') {
    return
  }

  const payload = {
    storageVersion: STORAGE_VERSION,
    schemaVersion: SCHEMA_VERSION,
    schema: normalizeSchema(schema),
    uiPreferences: {
      ...DEFAULT_UI_PREFERENCES,
      ...(uiPreferences || {}),
    },
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore write failures to keep the app functional in restricted environments.
  }
}

export function loadThemePreference() {
  if (typeof window === 'undefined') {
    return null
  }

  let theme = null

  try {
    theme = localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    theme = null
  }

  if (theme === 'dark' || theme === 'light') {
    return theme
  }

  return null
}

export function saveThemePreference(theme) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme === 'dark' ? 'dark' : 'light')
  } catch {
    // Ignore write failures to keep the app functional in restricted environments.
  }
}

export function clearPersistedState() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore cleanup failures.
  }
}
