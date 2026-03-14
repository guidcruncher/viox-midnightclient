import { BaseClient } from "./base"
import { useStorage } from "@/composables/useStorage"

class ArtistsClient extends BaseClient {
  // GET /spotify/artists/:id
  async getArtist(id: string) {
    const res = await this.client.get(`/spotify/artists/${id}`)
    return res.data
  }

  // GET /spotify/artists?ids=a,b,c
  async getArtists(ids: string[]): Promise<any> {
    const res = await this.client.get(`/spotify/artists`, {
      params: { ids: ids.join(",") },
    })
    return res.data
  }

  // GET /spotify/artists/:id/albums
  async getArtistAlbums(
    id: string,
    opts: {
      include_groups?: string
      market?: string
      limit?: number
      offset?: number
    } = {},
  ): Promise<any> {
    const user = useStorage<any>("user", {}, "local")
    const cfg = { ...opts }
    cfg.market = user.value?.country || opts.market || "US"

    const res = await this.client.get(`/spotify/artists/${id}/albums`, {
      params: { cfg },
    })
    return res.data
  }

  // GET /spotify/artists/:id/top-tracks
  async getArtistTopTracks(id: string, market: string): Promise<any> {
    const user = useStorage<any>("user", {}, "local")
    const res = await this.client.get(`/spotify/artists/${id}/top-tracks`, {
      params: { market: user.value?.country || market || "US" },
    })
    return res.data
  }

  // GET /spotify/artists/:id/related-artists
  async getRelatedArtists(id: string): Promise<any> {
    const res = await this.client.get(`/spotify/artists/${id}/related-artists`)
    return res.data
  }
}

export const artistsClient = new ArtistsClient()
