import { App, inject, reactive } from "vue"
import { getBaseUrl } from "../utils/baseUrl"

function getEventBusUrl(): string {
  const urlBase = getBaseUrl().replace("https://", "wss://").replace("http://", "ws://")
  return `${urlBase}/api/events`
}

// The key used for provide/inject
const EventBusKey = Symbol("EventBus")

type EventSource = "spotify" | "mpd" | "system"

type EventType =
  | "track_change"
  | "track_stop"
  | "track_pause"
  | "track_start"
  | "volume_change"
  | "metadata"

interface UnifiedEvent {
  backend: EventSource
  type: EventType
  timestamp: number
  raw: any
  song?: any
}

export default {
  install(app: App) {
    const state = reactive({
      lastEvent: null as UnifiedEvent | null,
      isConnected: false,
      error: null as string | null,
    })

    let socket: WebSocket | null = null

    const connect = () => {
      socket = new WebSocket(getEventBusUrl())

      socket.onopen = () => {
        state.isConnected = true
        state.error = null
      }

      socket.onmessage = (event) => {
        try {
          state.lastEvent = JSON.parse(event.data)
        } catch (e) {
          console.error("WS Parse Error:", e)
        }
      }

      socket.onclose = () => {
        state.isConnected = false
        setTimeout(connect, 3000) // Auto-reconnect
      }

      socket.onerror = () => {
        state.error = "WebSocket connection error"
      }
    }

    connect()

    // 1. For Composition API (provide/inject)
    app.provide(EventBusKey, state)

    // 2. For Options API (this.$eventBus)
    app.config.globalProperties.$eventBus = state
  },
}

// Helper hook for Composition API
export function useEventBus() {
  const bus = inject<{
    lastEvent: UnifiedEvent | null
    isConnected: boolean
    error: string | null
  }>(EventBusKey)

  if (!bus) throw new Error("EventBus plugin not installed")
  return bus
}
