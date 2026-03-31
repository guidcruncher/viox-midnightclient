export function useStringUtils() {
  const capitalise = (s?: string | null) =>
    s && s.length > 0 ? s[0].toUpperCase() + s.slice(1) : (s ?? '')

  return { capitalise }
}
