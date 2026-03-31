import { App, inject, reactive } from 'vue'

import { getBaseUrl } from '../utils/baseUrl'

function getEventBusUrl(): string {
  const urlBase = getBaseUrl().replace('https://', 'wss://').replace('http://', 'ws://')

  return `${urlBase}/api/events`
}

const EventBusKey = Symbol('EventBus')

export type VioxEventType =
  | 'track_start'
  | 'track_pause'
  | 'track_resume'
  | 'track_stop'
  | 'track_change'
  | 'seek'
  | 'volume_change'
  | 'shuffle_change'
  | 'repeat_change'
  | 'raw'
  | 'metadata'
  | 'active'
  | 'inactive'
  | 'eventbus_error'

export interface VioxEvent {
  type: VioxEventType
  payload: any
}

export default {
  install(app: App) {
    let connectCount = 0

    const state = reactive({
      lastEvent: null as VioxEvent | null,
      isConnected: false,
      error: null as string | null,
    })

    let socket: WebSocket | null = null

    // -----------------------------
    // PUB/SUB IMPLEMENTATION
    // -----------------------------
    const listeners = new Map<VioxEventType | '*', Set<(event: VioxEvent) => void>>()

    function on(type: VioxEventType | '*', handler: (event: VioxEvent) => void) {
      if (!listeners.has(type)) {
        listeners.set(type, new Set())
      }
      listeners.get(type)!.add(handler)

      // Return unsubscribe function
      return () => off(type, handler)
    }

    function off(type: VioxEventType | '*', handler: (event: VioxEvent) => void) {
      listeners.get(type)?.delete(handler)
    }

    function emit(event: VioxEvent) {
      // Notify type-specific listeners
      listeners.get(event.type)?.forEach((cb) => cb(event))

      // Notify wildcard listeners
      listeners.get('*')?.forEach((cb) => cb(event))
    }

    // -----------------------------
    // WEBSOCKET CONNECTION
    // -----------------------------
    const connect = () => {
      socket = new WebSocket(getEventBusUrl())
      connectCount += 1

      socket.onopen = () => {
        state.isConnected = true
        state.error = null
      }

      socket.onmessage = (event) => {
        try {
          const parsed: VioxEvent = JSON.parse(event.data)
          state.lastEvent = parsed
          emit(parsed)
        } catch (e) {
          console.error('WS Parse Error:', e)
        }
      }

      socket.onclose = () => {
        state.isConnected = false
        if (connectCount < 6) {
          setTimeout(connect, 3000)
        } else {
          emit({
            type: 'eventbus_error',
            payload: {
              code: 500,
              message: 'Eventbus connection attempt maximum exceeded. Viox API is unavailable.',
            },
          })
        }
      }

      socket.onerror = (err) => {
        state.error = `WebSocket connection error ${err}`
      }
    }

    if (!socket) connect()

    // Expose API
    const api = {
      ...state,
      on,
      off,
    }

    // Composition API
    app.provide(EventBusKey, api)

    // Options API
    app.config.globalProperties.$eventBus = api
  },
}

// Composition API helper
export function useEventBus() {
  const bus = inject<{
    lastEvent: VioxEvent | null
    isConnected: boolean
    error: string | null
    on: (type: VioxEventType | '*', handler: (event: VioxEvent) => void) => () => void
    off: (type: VioxEventType | '*', handler: (event: VioxEvent) => void) => void
  }>(EventBusKey)

  if (!bus) throw new Error('EventBus plugin not installed')
  return bus
}
