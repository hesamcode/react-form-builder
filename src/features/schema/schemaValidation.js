import { FIELD_TYPES, normalizeSchema } from './schemaModel'

const VALID_FIELD_TYPES = new Set(FIELD_TYPES.map((fieldType) => fieldType.type))

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isPositiveNumberOrNull(value) {
  return value === null || value === undefined || (typeof value === 'number' && Number.isFinite(value))
}

export function validateSchema(candidate) {
  const errors = []

  if (!isObject(candidate)) {
    return {
      isValid: false,
      errors: ['Schema must be a JSON object.'],
      schema: null,
    }
  }

  if (!Array.isArray(candidate.fields)) {
    errors.push('Schema must include a "fields" array.')
  }

  if (candidate.title !== undefined && typeof candidate.title !== 'string') {
    errors.push('Schema "title" must be a string.')
  }

  if (candidate.description !== undefined && typeof candidate.description !== 'string') {
    errors.push('Schema "description" must be a string.')
  }

  const fields = Array.isArray(candidate.fields) ? candidate.fields : []

  fields.forEach((field, index) => {
    if (!isObject(field)) {
      errors.push(`Field ${index + 1} must be an object.`)
      return
    }

    if (!VALID_FIELD_TYPES.has(field.type)) {
      errors.push(`Field ${index + 1} has unsupported type "${field.type}".`)
    }

    if (field.label !== undefined && typeof field.label !== 'string') {
      errors.push(`Field ${index + 1}: "label" must be a string.`)
    }

    if (field.required !== undefined && typeof field.required !== 'boolean') {
      errors.push(`Field ${index + 1}: "required" must be true or false.`)
    }

    if (field.validations !== undefined && !isObject(field.validations)) {
      errors.push(`Field ${index + 1}: "validations" must be an object.`)
    }

    if (isObject(field.validations)) {
      const { minLength, maxLength, min, max } = field.validations

      if (!isPositiveNumberOrNull(minLength)) {
        errors.push(`Field ${index + 1}: "validations.minLength" must be a number or null.`)
      }

      if (!isPositiveNumberOrNull(maxLength)) {
        errors.push(`Field ${index + 1}: "validations.maxLength" must be a number or null.`)
      }

      if (!isPositiveNumberOrNull(min)) {
        errors.push(`Field ${index + 1}: "validations.min" must be a number or null.`)
      }

      if (!isPositiveNumberOrNull(max)) {
        errors.push(`Field ${index + 1}: "validations.max" must be a number or null.`)
      }
    }

    if (field.type === 'select') {
      if (!Array.isArray(field.options)) {
        errors.push(`Field ${index + 1}: select fields require an "options" array.`)
      } else if (!field.options.length) {
        errors.push(`Field ${index + 1}: select fields need at least one option.`)
      } else {
        field.options.forEach((option, optionIndex) => {
          if (!isObject(option)) {
            errors.push(`Field ${index + 1}, option ${optionIndex + 1} must be an object.`)
            return
          }

          if (typeof option.label !== 'string' || !option.label.trim()) {
            errors.push(`Field ${index + 1}, option ${optionIndex + 1} needs a non-empty label.`)
          }

          if (typeof option.value !== 'string' || !option.value.trim()) {
            errors.push(`Field ${index + 1}, option ${optionIndex + 1} needs a non-empty value.`)
          }
        })
      }
    }
  })

  if (errors.length) {
    return {
      isValid: false,
      errors,
      schema: null,
    }
  }

  return {
    isValid: true,
    errors: [],
    schema: normalizeSchema(candidate),
  }
}
