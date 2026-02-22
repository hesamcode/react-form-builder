export const selectFields = (state) => state.schema.fields

export const selectSelectedField = (state) =>
  state.schema.fields.find((field) => field.id === state.selectedFieldId) || null

export const selectCanUndo = (state) => state.history.past.length > 0

export const selectCanRedo = (state) => state.history.future.length > 0

export function buildValidationSummary(field) {
  if (!field) {
    return []
  }

  const summary = []

  if (field.required) {
    summary.push('Required')
  }

  if (field.validations?.minLength !== null && field.validations?.minLength !== undefined) {
    summary.push(`Min length: ${field.validations.minLength}`)
  }

  if (field.validations?.maxLength !== null && field.validations?.maxLength !== undefined) {
    summary.push(`Max length: ${field.validations.maxLength}`)
  }

  if (field.validations?.min !== null && field.validations?.min !== undefined) {
    summary.push(`Min value: ${field.validations.min}`)
  }

  if (field.validations?.max !== null && field.validations?.max !== undefined) {
    summary.push(`Max value: ${field.validations.max}`)
  }

  return summary
}
