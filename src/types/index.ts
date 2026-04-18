export type AudioSource = 'spotify' | 'podverse' | 'radiobrowser' | 'tunein' | 'youtube' | 'local'

export type AudioSourceItemType =
  | 'playlist'
  | 'folder'
  | 'track'
  | 'album'
  | 'episode'
  | 'show'
  | 'podcast'
  | 'station'
  | 'metadata'

export interface MediaSourceRef {
  source: AudioSource // e.g. "spotify", "local", "podverse", "radio"
  itemType: AudioSourceItemType // e.g. "track", "album", "playlist", "episode"
  sourceId: string // the provider’s canonical ID
  parentSourceId?: string // Optional parent source id
  uri?: string // optional provider URI (spotify:track:..., file://..., etc.)
}

export interface MediaItem {
  id: string // internal VIOX ID (uuid or hash)
  sourceRef: MediaSourceRef

  title: string
  subtitle?: string
  artist?: string
  album?: string
  imageUrl?: string

  durationMs?: number // null for live
  isLive?: boolean // true for stations

  mbid?: string
  isrc?: string

  // Optional extended metadata
  description?: string
  releaseDate?: string
  explicit?: boolean
  library?: boolean
  subscribed?: boolean
}
