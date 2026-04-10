export function getQueryString(value: any): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}
