export function getBaseUrl(): string {
  const url = `${window.location.protocol}//${window.location.host}`
  return url
}
