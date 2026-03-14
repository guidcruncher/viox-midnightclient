import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import { PVPodcast, PVEpisode, PVSubscriptionState } from "./types"
import { MediaItem } from "../types/index"

export class PodverseClient extends BaseClient {
  stripHtml = (html: string) => {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerText || ""
  }

  /* -------------------------------------------------------
   *  Indexer
   * ----------------------------------------------------- */

  public invokeIndexer(): Promise<AxiosResponse<any>> {
    return this.client.get("/podverse/indexer")
  }

  /* -------------------------------------------------------
   *  Podcasts
   * ----------------------------------------------------- */

  public getPodcasts(params?: {
    search?: string
    page?: number
  }): Promise<AxiosResponse<PVPodcast[]>> {
    return this.client.get("/podverse/podcasts", { params })
  }

  public async getPodcastsByCategory(category: string, page: number = 1): Promise<MediaItem[]> {
    const params = { page: page }
    const res = await this.client.get(`/podverse/podcasts/${category}`, { params })

    if (res.data) {
      const items = res.data.map((t: any) => {
        return {
          id: t.id,
          title: t.title,
          subtitle: this.stripHtml(t.description),
          img: t.imageUrl,
          type: "podcast",
          uri: t.linkUrl,
          isFolder: false,
          artist: t.authors ? t.authors.map((t: any) => t.name).join(", ") : "",
        }
      })
      return items
    }

    return []
  }

  public async getPodcast(id: string): Promise<MediaItem | undefined> {
    const res = await this.client.get(`/podverse/podcast/${id}`)
    if (!res.data) {
      return undefined
    }

    return {
      id: res.data.id,
      title: res.data.title,
      subtitle: this.stripHtml(res.data.description),
      img: res.data.imageUrl,
      type: "podcast",
      uri: res.data.linkUrl,
      isFolder: false,
      artist: res.data.authors ? res.data.authors.map((t: any) => t.name).join(", ") : "",
    }
  }

  /* -------------------------------------------------------
   *  Episodes
   * ----------------------------------------------------- */
  private proxyUrl(id: string, url: string): string {
    return `http://127.0.0.1:8080/api/proxy/podcast?id=${encodeURIComponent(id)}&url=${encodeURIComponent(url)}`
  }

  public async getEpisodes(params?: {
    podcastId?: string
    search?: string
    page?: number
  }): Promise<MediaItem[]> {
    const res = await this.client.get("/podverse/episodes", { params })
    if (!res.data) {
      return []
    }

    return res.data.map((t: any) => {
      return {
        id: t.id,
        title: t.title,
        subtitle: this.stripHtml(t.description),
        img: t.imageUrl,
        type: "episode",
        uri: this.proxyUrl(t.id, t.mediaUrl),
        format: "mpeg",
        isFolder: false,
        country: "",
      }
    })
  }

  public getEpisode(id: string): Promise<AxiosResponse<PVEpisode>> {
    return this.client.get(`/podverse/episodes/${id}`)
  }

  /* -------------------------------------------------------
   *  Categories
   * ----------------------------------------------------- */

  public async getCategories(): Promise<MediaItem[]> {
    const res = await this.client.get("/podverse/categories")
    if (res.data) {
      return res.data.map((t: any) => {
        return {
          id: t.slug,
          title: t.title,
          subtitle: "",
          img: "",
          type: "category",
          uri: t.id,
          isFolder: true,
        }
      })
    }
    return []
  }

  /* -------------------------------------------------------
   *  Subscriptions
   * ----------------------------------------------------- */

  public subscribe(id: string): Promise<AxiosResponse<PVSubscriptionState>> {
    return this.client.post(`/podverse/podcast/${id}/subscribe`)
  }

  public unsubscribe(id: string): Promise<AxiosResponse<PVSubscriptionState>> {
    return this.client.post(`/podverse/podcast/${id}/unsubscribe`)
  }

  public toggleSubscription(id: string): Promise<AxiosResponse<PVSubscriptionState>> {
    return this.client.post(`/podverse/podcast/${id}/toggle`)
  }

  public setEpisodeListened(id: string): Promise<AxiosResponse<any>> {
    return this.client.post(`/podverse/podcast/episode/${id}/listened`)
  }

  public getSubscriptionIds(): Promise<AxiosResponse<string[]>> {
    return this.client.get("/podverse/subscriptions")
  }

  public getSubscriptionDetails(): Promise<AxiosResponse<MediaItem[]>> {
    return this.client.get("/podverse/subscriptions/details")
  }

  public getSubscriptionEpisodes(id: string): Promise<AxiosResponse<MediaItem[]>> {
    return this.client.get(`/podverse/subscription/${id}/episodes`)
  }

  public async getSubscriptionState(id: string): Promise<boolean> {
    const res = await this.client.get(`/podverse/subscription/${id}`)
    if (!res.data) {
      return false
    }
    return res.data.subscribed
  }
}

export const podverseApi = new PodverseClient()
