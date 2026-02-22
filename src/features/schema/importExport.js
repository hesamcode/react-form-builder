import { validateSchema } from './schemaValidation'

export function serializeSchema(schema) {
  return JSON.stringify(schema, null, 2)
}

export async function copySchemaToClipboard(schema) {
  if (!navigator?.clipboard?.writeText) {
    throw new Error('Clipboard API is unavailable in this browser.')
  }

  await navigator.clipboard.writeText(serializeSchema(schema))
}

export function downloadSchema(schema, fileName = 'form-builder-pro-schema.json') {
  const blob = new Blob([serializeSchema(schema)], { type: 'application/json' })
  const downloadUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = downloadUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  URL.revokeObjectURL(downloadUrl)
}

export function parseImportedSchema(rawText) {
  const text = rawText?.trim()

  if (!text) {
    return {
      isValid: false,
      errors: ['Please paste a schema JSON payload before importing.'],
      schema: null,
    }
  }

  let parsedSchema

  try {
    parsedSchema = JSON.parse(text)
  } catch (error) {
    return {
      isValid: false,
      errors: [`Invalid JSON: ${error.message}`],
      schema: null,
    }
  }

  return validateSchema(parsedSchema)
}
