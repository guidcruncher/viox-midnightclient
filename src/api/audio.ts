import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import {
  StatusResponse,
  AudioBackend,
  PlaylistCreateRequest,
  PlaylistAddRequest,
  PlaylistRemoveRequest,
} from "./types"
import { MediaItem } from "@/types"

export class AudioClient extends BaseClient {
  // Playback Control
  public play(item: MediaItem, opts?: { podcastId?: string }): Promise<AxiosResponse<any>> {
    const value = { ...item }

    if (opts && opts.podcastId) {
      return this.client.post(`/play/${item.type}?podcastId=${opts.podcastId}`, value)
    }

    return this.client.post(`/play/${item.type}`, value)
  }

  public pause(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/pause")
  }

  public stop(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/stop")
  }

  public resume(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/resume")
  }

  public next(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/next")
  }

  public previous(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/previous")
  }

  public playNext(uri: string): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/play-next", { uri })
  }

  public addToQueue(uri: string): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/add", { uri })
  }

  public queueUri(uri: string): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/queue", { uri })
  }

  public seek(position: number): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/seek", { position })
  }

  public setVolume(volume: number): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/volume", { volume })
  }

  // Info & State
  public getState(): Promise<AxiosResponse<any>> {
    return this.client.get("/state")
  }

  public async getStatus(): Promise<any> {
    const state = await this.client.get("/state")
    if (!state.data) return null
    return state.data
  }

  public getHistory(): Promise<AxiosResponse<any>> {
    return this.client.get("/history")
  }

  public getQueueList(): Promise<AxiosResponse<any>> {
    return this.client.get("/list")
  }

  public getDevices(): Promise<AxiosResponse<any>> {
    return this.client.get("/devices")
  }

  // Backend Management
  public getBackend(): Promise<AxiosResponse<{ backend: string }>> {
    return this.client.get("/backend")
  }

  public setBackend(backend: AudioBackend): Promise<AxiosResponse<{ backend: string }>> {
    return this.client.post("/backend", { backend })
  }

  // Audio Playlists
  public getPlaylists(): Promise<AxiosResponse<any>> {
    return this.client.get("/audio/playlists")
  }

  public createPlaylist(data: PlaylistCreateRequest): Promise<AxiosResponse> {
    return this.client.post("/audio/playlists/create", data)
  }

  public playPlaylist(id: string): Promise<AxiosResponse> {
    return this.client.post("/audio/playlists/play", { id })
  }

  public addToPlaylist(data: PlaylistAddRequest): Promise<AxiosResponse> {
    return this.client.post("/audio/playlists/add", data)
  }

  public removeFromPlaylist(data: PlaylistRemoveRequest): Promise<AxiosResponse> {
    return this.client.post("/audio/playlists/remove", data)
  }
}
