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

import mitt, { type EventType } from 'mitt'

export interface GlobalEvents extends Record<EventType, unknown> {}

const emitter = mitt<GlobalEvents>()

export function useEventBus() {
  return emitter
}

export const { on, emit, off } = useEventBus()
