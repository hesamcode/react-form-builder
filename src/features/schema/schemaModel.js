import { createId } from '../../lib/ids'

export const SCHEMA_VERSION = 1

export const FIELD_TYPES = [
  { type: 'text', label: 'Text', description: 'Single-line text input' },
  { type: 'email', label: 'Email', description: 'Email address with format checks' },
  { type: 'number', label: 'Number', description: 'Numeric input with min/max' },
  { type: 'textarea', label: 'Textarea', description: 'Long-form text area' },
  { type: 'select', label: 'Select', description: 'Dropdown selection field' },
  { type: 'checkbox', label: 'Checkbox', description: 'Single yes/no toggle' },
  { type: 'date', label: 'Date', description: 'Date picker input' },
]

const DEFAULTS_BY_TYPE = {
  text: {
    label: 'Text Field',
    placeholder: 'Enter text',
    helpText: '',
    required: false,
    defaultValue: '',
    validations: { minLength: null, maxLength: null, min: null, max: null },
    options: [],
  },
  email: {
    label: 'Email Field',
    placeholder: 'name@example.com',
    helpText: '',
    required: false,
    defaultValue: '',
    validations: { minLength: null, maxLength: null, min: null, max: null },
    options: [],
  },
  number: {
    label: 'Number Field',
    placeholder: '0',
    helpText: '',
    required: false,
    defaultValue: '',
    validations: { minLength: null, maxLength: null, min: null, max: null },
    options: [],
  },
  textarea: {
    label: 'Textarea Field',
    placeholder: 'Write your answer',
    helpText: '',
    required: false,
    defaultValue: '',
    validations: { minLength: null, maxLength: null, min: null, max: null },
    options: [],
  },
  select: {
    label: 'Select Field',
    placeholder: '',
    helpText: '',
    required: false,
    defaultValue: '',
    validations: { minLength: null, maxLength: null, min: null, max: null },
    options: [
      { id: createId('opt'), label: 'Option 1', value: 'option_1' },
      { id: createId('opt'), label: 'Option 2', value: 'option_2' },
    ],
  },
  checkbox: {
    label: 'Checkbox Field',
    placeholder: '',
    helpText: '',
    required: false,
    defaultValue: false,
    validations: { minLength: null, maxLength: null, min: null, max: null },
    options: [],
  },
  date: {
    label: 'Date Field',
    placeholder: '',
    helpText: '',
    required: false,
    defaultValue: '',
    validations: { minLength: null, maxLength: null, min: null, max: null },
    options: [],
  },
}

export function createField(type) {
  const baseConfig = DEFAULTS_BY_TYPE[type] ?? DEFAULTS_BY_TYPE.text

  return {
    id: createId('fld'),
    type,
    label: baseConfig.label,
    placeholder: baseConfig.placeholder,
    helpText: baseConfig.helpText,
    required: baseConfig.required,
    defaultValue: baseConfig.defaultValue,
    validations: { ...baseConfig.validations },
    options: [...baseConfig.options.map((option) => ({ ...option }))],
  }
}

function normalizeNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function normalizeOption(option, index) {
  const label = typeof option?.label === 'string' && option.label.trim() ? option.label : `Option ${index + 1}`
  const value = typeof option?.value === 'string' && option.value.trim() ? option.value : label.toLowerCase().replace(/\s+/g, '_')

  return {
    id: option?.id || createId('opt'),
    label,
    value,
  }
}

export function normalizeField(field, index = 0) {
  const fallbackType = FIELD_TYPES[0].type
  const safeType = FIELD_TYPES.some((item) => item.type === field?.type) ? field.type : fallbackType
  const defaults = DEFAULTS_BY_TYPE[safeType]

  const rawOptions = Array.isArray(field?.options) ? field.options : []
  const normalizedOptions = safeType === 'select'
    ? (rawOptions.length ? rawOptions : defaults.options).map((option, optionIndex) => normalizeOption(option, optionIndex))
    : []

  return {
    id: field?.id || createId('fld'),
    type: safeType,
    label: typeof field?.label === 'string' && field.label.trim() ? field.label : `${defaults.label} ${index + 1}`,
    placeholder: typeof field?.placeholder === 'string' ? field.placeholder : defaults.placeholder,
    helpText: typeof field?.helpText === 'string' ? field.helpText : defaults.helpText,
    required: Boolean(field?.required),
    defaultValue: field?.defaultValue ?? defaults.defaultValue,
    validations: {
      minLength: normalizeNullableNumber(field?.validations?.minLength),
      maxLength: normalizeNullableNumber(field?.validations?.maxLength),
      min: normalizeNullableNumber(field?.validations?.min),
      max: normalizeNullableNumber(field?.validations?.max),
    },
    options: normalizedOptions,
  }
}

export function normalizeSchema(schema) {
  const fields = Array.isArray(schema?.fields) ? schema.fields : []

  return {
    version: SCHEMA_VERSION,
    title: typeof schema?.title === 'string' && schema.title.trim() ? schema.title : 'Untitled Form',
    description: typeof schema?.description === 'string' ? schema.description : '',
    fields: fields.map((field, index) => normalizeField(field, index)),
  }
}

export function createDemoSchema() {
  const nameField = createField('text')
  const emailField = createField('email')
  const roleField = createField('select')
  const updatesField = createField('checkbox')

  nameField.label = 'Full Name'
  nameField.placeholder = 'Jane Doe'
  nameField.required = true
  nameField.validations.minLength = 2

  emailField.label = 'Work Email'
  emailField.placeholder = 'jane@company.com'
  emailField.required = true

  roleField.label = 'Role'
  roleField.helpText = 'Choose the role that fits best.'
  roleField.required = true
  roleField.options = [
    { id: createId('opt'), label: 'Design', value: 'design' },
    { id: createId('opt'), label: 'Engineering', value: 'engineering' },
    { id: createId('opt'), label: 'Product', value: 'product' },
  ]

  updatesField.label = 'Receive weekly product updates'
  updatesField.defaultValue = true

  return {
    version: SCHEMA_VERSION,
    title: 'Team Intake Form',
    description: 'Collect core details before project kickoff.',
    fields: [nameField, emailField, roleField, updatesField],
  }
}

export function isLengthSupported(type) {
  return type === 'text' || type === 'email' || type === 'textarea'
}

export function isNumberRangeSupported(type) {
  return type === 'number'
}

export function isOptionsSupported(type) {
  return type === 'select'
}
