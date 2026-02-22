const randomSegment = () => Math.random().toString(36).slice(2, 10)

export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${randomSegment()}`
}
