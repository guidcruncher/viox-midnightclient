// src/clients/MediaClient.ts
import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import { MediaItem } from "../types/"

export class MediaStorageClient extends BaseClient {
  /** List all items in a given storage */
  public listPresets(): Promise<AxiosResponse<MediaItem[]>> {
    return this.client.get(`/media/presets`)
  }

  public async listHistory(limit: number): Promise<MediaItem[]> {
    const res = await this.client.get(`/media/history?limit=${limit}`)
    return res.data
  }

  public async toggleFavourite(item: any): Promise<any> {
    const value = { ...item }
    if (item.favourite) {
      this.remove(item)
    } else {
      this.add(item)
    }

    value.favourite = !(item.favourite ?? false)
    return value
  }

  /** Add a new media item */
  public add(item: any): Promise<AxiosResponse<{ ok: true }>> {
    const value = { ...item }
    if (!value.subtitle) {
      value.subtitle = ""
    }
    return this.client.post(`/media/presets`, value)
  }

  /** Remove a media item */
  public remove(item: any): Promise<AxiosResponse<{ ok: true }>> {
    const id = item.type == "spotify" ? item.uri : item.id
    return this.client.delete(`/media/presets/${id}`)
  }
}
