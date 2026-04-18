// Re-export shared types from the canonical source
export type { AudioSourceItemType, MediaItem } from '../types'

import type { MediaItem } from '../types'

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
