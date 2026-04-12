import { shallowRef, watch, type ShallowRef } from "vue"

type StorageType = "local" | "session"

export function useStorage<T>(
  key: string,
  defaultValue: T,
  type: StorageType = "local"
) {
  const storage = type === "local" ? localStorage : sessionStorage

  const load = (): T => {
    const raw = storage.getItem(key)
    if (raw === null) return defaultValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }

  // FIX: cast through unknown before extending
  const state = shallowRef<T>(load()) as unknown as ShallowRef<T> & {
    set: (v: T) => void
    remove: () => void
  }

  watch(
    state,
    (newVal) => {
      storage.setItem(key, JSON.stringify(newVal))
    },
    { deep: false }
  )

  const set = (newVal: T) => {
    state.value = newVal
  }

  const remove = () => {
    storage.removeItem(key)
    state.value = defaultValue
  }

  state.set = set
  state.remove = remove

  return state
}
