// src/services/api/ConsolidatedLibraryClient.ts

import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import { MediaItem } from "@/types"

interface SpotifyLibraryPage {
  items: MediaItem[]
  total: number
  offset: number
  limit: number
}

class SpotifyLibraryClient extends BaseClient {
  /**
   * Get consolidated Spotify library (playlists + albums + artists)
   * Supports paging + single-type filtering.
   */
  public getLibrary(opts?: {
    limit?: number
    offset?: number
    type?: string
  }): Promise<AxiosResponse<SpotifyLibraryPage>> {
    return this.client.get("/spotify/library/consolidated", {
      params: opts,
    })
  }

  /**
   * Force refresh of the cached consolidated library.
   */
  public refresh(): Promise<AxiosResponse<{ refreshed: boolean }>> {
    return this.client.post("/spotify/library/consolidated/refresh")
  }
}

export const spotifyLibraryClient = new SpotifyLibraryClient()
