export const DRAG_FIELD_TYPE_MIME = 'application/x-form-builder-field-type'
export const DRAG_EXISTING_FIELD_MIME = 'application/x-form-builder-field-id'

export function setDragData(event, type, value) {
  event.dataTransfer.setData(type, value)
  event.dataTransfer.effectAllowed = 'move'
}

export function getDragData(event, type) {
  return event.dataTransfer.getData(type)
}
