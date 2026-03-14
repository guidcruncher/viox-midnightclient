import type { MediaItem } from "../types"

import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import { LibraryQueryParams, RecommendationSeeds } from "./types"
import { useStorage } from "../composables/useStorage"

export class SpotifyClient extends BaseClient {
  // --- Resources ---
  public getAlbum(id: string): Promise<AxiosResponse> {
    return this.client.get(`/spotify/albums/${id}`)
  }

  public getEpisode(id: string): Promise<AxiosResponse> {
    return this.client.get(`/spotify/episodes/${id}`)
  }

  public getPlaylist(id: string): Promise<AxiosResponse> {
    return this.client.get(`/spotify/playlists/${id}`)
  }

  public async getShow(id: string): Promise<MediaItem | undefined> {
    const res = await this.client.get(`/spotify/shows/${id}`)
    return res.data
  }

  public async getShowEpisodes(
    id: string,
    params?: { offset?: number; limit?: number },
  ): Promise<MediaItem[]> {
    const res = await this.client.get(`/spotify/shows/${id}/episodes`, { params })
    return res.data ?? []
  }

  public getTrack(id: string): Promise<AxiosResponse> {
    return this.client.get(`/spotify/tracks/${id}`)
  }

  public getPlaylistTracks(id: string): Promise<AxiosResponse<any>> {
    return this.client.post("/spotify/playlist-tracks", { id })
  }

  public getRecommendations(seeds: RecommendationSeeds): Promise<AxiosResponse<any>> {
    return this.client.post("/spotify/recommendations", seeds)
  }

  public getDevices(): Promise<AxiosResponse<any>> {
    return this.client.get("/spotify/devices")
  }

  // --- Auth ---
  public login(): Promise<AxiosResponse> {
    return this.client.get("/spotify/login")
  }

  public authCallback(code: string): Promise<AxiosResponse> {
    return this.client.get("/spotify/auth/callback", { params: { code } })
  }

  public getMe(): Promise<AxiosResponse> {
    return this.client.get("/spotify/user/me")
  }

  // --- Library: Albums ---
  public getLibraryAlbums(params?: LibraryQueryParams): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/albums", { params })
  }

  public saveLibraryAlbums(ids: string[]): Promise<AxiosResponse> {
    return this.client.put("/spotify/library/albums", { ids })
  }

  public removeLibraryAlbums(ids: string[]): Promise<AxiosResponse> {
    return this.client.delete("/spotify/library/albums", { data: { ids } })
  }

  public checkLibraryAlbums(ids: string): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/albums/contains", { params: { ids } })
  }

  // --- Library: Audiobooks ---
  public getLibraryAudiobooks(params?: Omit<LibraryQueryParams, "market">): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/audiobooks", { params })
  }

  public saveLibraryAudiobooks(ids: string[]): Promise<AxiosResponse> {
    return this.client.put("/spotify/library/audiobooks", { ids })
  }

  public removeLibraryAudiobooks(ids: string[]): Promise<AxiosResponse> {
    return this.client.delete("/spotify/library/audiobooks", { data: { ids } })
  }

  public checkLibraryAudiobooks(ids: string): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/audiobooks/contains", { params: { ids } })
  }

  // --- Library: Shows ---
  public getLibraryShows(params?: Omit<LibraryQueryParams, "market">): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/shows", { params })
  }

  public saveLibraryShows(ids: string[]): Promise<AxiosResponse> {
    return this.client.put("/spotify/library/shows", { ids })
  }

  public removeLibraryShows(ids: string[]): Promise<AxiosResponse> {
    return this.client.delete("/spotify/library/shows", { data: { ids } })
  }

  public checkLibraryShows(ids: string): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/shows/contains", { params: { ids } })
  }

  // --- Library: Tracks ---
  public getLibraryTracks(params?: LibraryQueryParams): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/tracks", { params })
  }

  public saveLibraryTracks(ids: string[]): Promise<AxiosResponse> {
    return this.client.put("/spotify/library/tracks", { ids })
  }

  public removeLibraryTracks(ids: string[]): Promise<AxiosResponse> {
    return this.client.delete("/spotify/library/tracks", { data: { ids } })
  }

  public checkLibraryTracks(ids: string): Promise<AxiosResponse> {
    return this.client.get("/spotify/library/tracks/contains", { params: { ids } })
  }

  public async getCurrentUserProfile(): Promise<AxiosResponse> {
    const res = await this.client.get("/spotify/user/me")
    if (res.data) {
      const user = useStorage<any>("user", res.data, "local")
      user.value = res.data
    }
    return res
  }

  // --- Cache ---
  public purgeCache(key?: string, scope?: string): Promise<AxiosResponse> {
    return this.client.delete("/spotify/cache/purge", { params: { key, scope } })
  }

  // --- Codes ---
  public getCode(
    uri: string,
    background?: string,
    barColor?: string,
    size?: number,
  ): Promise<AxiosResponse> {
    return this.client.get("/spotify/code", {
      params: { uri, background, barColor, size },
      responseType: "blob",
    })
  }
}

export const spotifyApi = new SpotifyClient()
