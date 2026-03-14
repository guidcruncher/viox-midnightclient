export interface MediaItem {
  id: number | string
  title: string
  subtitle: string
  img?: string
  type:
    | "spotify"
    | "radio"
    | "local"
    | "podcast"
    | "artist"
    | "album"
    | "playlist"
    | "episode"
    | string
  uri: string
  artist?: string
  format?: string
  isFolder?: boolean
  country?: string
  bitrate?: string
  duration?: number
  favourite?: boolean
}

export interface UnifiedSearchResult {
  id: string
  backend: "podverse" | "radio" | "spotify" | "local"
  title: string
  artist?: string
  album?: string
  duration?: number
  artworkUrl?: string
  uri: string
  type: string
  format?: string
  meta?: Record<string, unknown>
  score?: number
  favourite?: boolean
}

export interface UnifiedSearchResponse {
  page: number
  pageSize: number
  total: number
  totalPages: number
  results: UnifiedSearchResult[]
}
