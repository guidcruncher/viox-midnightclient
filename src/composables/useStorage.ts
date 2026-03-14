import { ref, watch, type Ref } from "vue"

type StorageType = "local" | "session"

export function useStorage<T>(key: string, defaultValue: T, type: StorageType = "local") {
  const storage = type === "local" ? localStorage : sessionStorage

  const load = (): T => {
    const raw = storage.getItem(key)
    if (!raw) return defaultValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }

  const state = ref<T>(load()) as Ref<T>

  watch(
    state,
    (newVal) => {
      storage.setItem(key, JSON.stringify(newVal))
    },
    { deep: true },
  )

  const set = (newVal: T) => {
    state.value = newVal
  }

  const remove = () => {
    storage.removeItem(key)
    state.value = defaultValue
  }

  // attach helpers to the ref
  ;(state as any).set = set
  ;(state as any).remove = remove

  return state
}
