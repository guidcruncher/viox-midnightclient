export type AudioBackend = "Spotify" | "mpd"

export interface StatusResponse {
  status: string
}

export interface SnapVolumeRequest {
  percent: number
  muted?: boolean
}

export interface LibraryQueryParams {
  limit?: number
  offset?: number
  market?: string
}

// Playlist types
export interface PlaylistCreateRequest {
  name: string
  tracks?: string[]
}

export interface PlaylistAddRequest {
  id: string
  uri: string
}

export interface PlaylistRemoveRequest {
  id: string
  index: number
}

// Recommendation seeds
export interface RecommendationSeeds {
  seed_artists?: string[]
  seed_tracks?: string[]
  seed_genres?: string[]
}

export interface PVAuthor {
  id: string
  name?: string | null
  url?: string | null
  podcastId?: string | null
}

export interface PVPodcast {
  id: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  language?: string | null
  isExplicit?: boolean | null
  isPublic?: boolean | null
  lastEpisodePubDate?: string | null
  authors?: PVAuthor[] | null
}

export interface PVEpisode {
  id: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  mediaUrl: string
  pubDate?: string | null
  duration?: number | null
  podcast?: PVPodcast | null
}

export interface PVSubscriptionState {
  podcastId: string
  subscribed: boolean
}
