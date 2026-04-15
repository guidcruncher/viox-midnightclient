// Re-export shared types from the canonical source
export type {
  AudioSource,
  AudioSourceItemType,
  MediaSourceRef,
  MediaItem,
} from '../types'

import type { MediaItem, MediaSourceRef } from '../types'

// API-specific types

export type SuccessResponse = { ok: boolean }

export type SuccessTrackResponse = { ok: boolean; track: MediaItem }

export interface Playlist {
  id: string // internal VIOX ID
  name: string
  description?: string
  imageUrl?: string

  source: 'local' | 'spotify'
  sourceId?: string // spotify playlist ID
  sourceUri?: string // spotify:playlist:xxx

  totalItems: number
  library?: boolean
}

export interface PlaylistMetadata {
  id: string
  sourceRef: MediaSourceRef
  name: string
  description?: string
  imageUrl?: string
  ownerName?: string
  totalItems: number
}

export type PlaybackErrorCode =
  | 'UNAVAILABLE'
  | 'NOT_AUTHORIZED'
  | 'NETWORK'
  | 'BACKEND_ERROR'
  | 'UNSUPPORTED_FORMAT'

export interface PlaybackError {
  code: PlaybackErrorCode
  message: string
  cause?: Record<string, unknown>
}

export type PlaybackState =
  | { type: 'idle' }
  | { type: 'loading'; item: MediaItem }
  | { type: 'playing'; item: MediaItem; positionMs: number }
  | { type: 'paused'; item: MediaItem; positionMs: number }
  | { type: 'ended'; item: MediaItem }
  | { type: 'error'; error: PlaybackError }

export interface ConfigFile {
  version: string
}
