import axios, { AxiosInstance, AxiosResponse } from 'axios'
import qs from 'qs'

import {
  Playlist,
  SuccessResponse,
  MediaItem,
  AudioSourceItemType,
  SuccessTrackResponse,
} from './types'

class VIOXApi {
  private http: AxiosInstance
  private readonly baseURL: string

  constructor() {
    this.baseURL = `${window.location.protocol}//${window.location.host}`
    this.http = axios.create({
      baseURL: this.baseURL,
      paramsSerializer: {
        serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
      },
    })
  }

  async getConfigKeyValue(key: string): Promise<any | undefined> {
    const res = await this.http.get(`/api/config/${key}`)
    if (res) return res.data.value

    return undefined
  }

  /* ---------------------- Status ---------------------- */
  async getCapabilities(): Promise<any | undefined> {
    const res = await this.http.get('/api/capabilities')
    if (!res) return undefined

    return res.data
  }

  async getStatus(): Promise<AxiosResponse<Record<string, any>>> {
    const res = await this.http.get('/api/status')
    if (res.data.capabilities && res.data.capabilities.metadataCap.includes('live')) {
      if (res.data.currentItem && res.data.nowPlaying) {
        res.data.currentItem.subtitle = res.data.nowPlaying.streamTitle
      }
    }
    return res
  }

  getBackends(): Promise<AxiosResponse<string[]>> {
    return this.http.get('/api/backends')
  }

  /* ---------------------- EQ ---------------------- */

  getReverbPresets(): Promise<AxiosResponse<any[]>> {
    return this.http.get('/api/eq/reverb/')
  }

  setReverb(filename: string, gain: number, delay: number): Promise<AxiosResponse<any>> {
    return this.http.post('/api/eq/reverb', { filename, gain, delay })
  }

  toggleReverb(state: boolean): Promise<AxiosResponse<any>> {
    return this.http.post(`/api/eq/reverb/${state ? 'on' : 'off'}`)
  }

  getEqLevels(): Promise<AxiosResponse<any>> {
    return this.http.get('/api/eq')
  }

  getEqPresets(): Promise<AxiosResponse<string[]>> {
    return this.http.get('/api/eq/presets')
  }

  setEqPreset(name: string): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post(`/api/eq/preset/${name}`)
  }

  setEqBand(band: string, gain: number): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post('/api/eq/set-band', { band, gain })
  }

  /* ---------------------- Import ---------------------- */

  importSpotify(itemType: AudioSourceItemType): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post(`/api/import/spotify/${encodeURIComponent(itemType)}`)
  }

  /* ---------------------- Library ---------------------- */
  async getQueue(): Promise<MediaItem[]> {
    const res = await this.http.get('/api/queue')
    if (!res.data) return []

    return res.data
  }

  async deleteTrackInQueue(id: string): Promise<AxiosResponse<any>> {
    return this.http.delete(`/api/queue/delete/${encodeURIComponent(id)}`)
  }

  async selectTrackInQueue(id: string): Promise<MediaItem | undefined> {
    const res = await this.http.post(`/api/queue/${encodeURIComponent(id)}`)
    if (!res.data) return undefined
    return res.data
  }

  async clearQueue(reset?: boolean): Promise<AxiosResponse<any>> {
    if (reset) {
      return this.http.delete('/api/queue/reset')
    }

    return this.http.delete('/api/queue')
  }

  getLibrary(
    type?: AudioSourceItemType | AudioSourceItemType[],
    offset?: number,
    limit?: number
  ): Promise<AxiosResponse<MediaItem[]>> {
    return this.http.get('/api/library', {
      params: { type, offset, limit },
    })
  }

  subscribe(id: string): Promise<AxiosResponse<any>> {
    return this.http.post(`/api/podcast/subscribe/${encodeURIComponent(id)}`)
  }

  unsubscribe(id: string): Promise<AxiosResponse<any>> {
    return this.http.post(`/api/podcast/unsubscribe/${encodeURIComponent(id)}`)
  }

  getLibraryItem(id: string): Promise<AxiosResponse<MediaItem>> {
    return this.http.get(`/api/library/${id}`)
  }

  addToLibrary(id: string): Promise<AxiosResponse<MediaItem | undefined>> {
    return this.http.post(`/api/library/${encodeURIComponent(id)}`)
  }

  removeFromLibrary(id: string): Promise<AxiosResponse<MediaItem | undefined>> {
    return this.http.delete(`/api/library/${encodeURIComponent(id)}`)
  }

  /* ---------------------- Playlists ---------------------- */
  getPlaylists(offset?: number, limit?: number): Promise<AxiosResponse<MediaItem[]>> {
    return this.http.get('/api/playlists', { params: { offset, limit } })
  }

  getPlaylist(id: string): Promise<AxiosResponse<Playlist>> {
    return this.http.get(`/api/playlist/${encodeURIComponent(id)}`)
  }

  getPlaylistItems(
    id: string,
    offset?: number,
    limit?: number
  ): Promise<AxiosResponse<MediaItem[]>> {
    return this.http.get(`/api/playlists/${encodeURIComponent(id)}/items`, {
      params: { offset, limit },
    })
  }

  /* ---------------------- Playback ---------------------- */

  play(id: string, parent?: string): Promise<AxiosResponse<SuccessTrackResponse>> {
    return this.http.post('/api/play', { id, parent })
  }

  pause(): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post('/api/pause')
  }

  resume(): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post('/api/resume')
  }

  stop(): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post('/api/stop')
  }

  next(): Promise<AxiosResponse<SuccessTrackResponse>> {
    return this.http.post('/api/next')
  }

  previous(): Promise<AxiosResponse<SuccessTrackResponse>> {
    return this.http.post('/api/previous')
  }

  seek(position: number): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post('/api/seek', { position })
  }

  /* ---------------------- Speakers ---------------------- */

  getSpeakers(): Promise<AxiosResponse<any>> {
    return this.http.get('/api/speakers')
  }

  setSpeakerVolume(id: string, volume: number): Promise<AxiosResponse<SuccessResponse>> {
    if (id && typeof volume === 'number') {
      return this.http.post(`/api/speaker/volume/${encodeURIComponent(id)}`, { volume: volume })
    }
    throw new Error('id or volume is undefined')
  }

  setAllSpeakerVolume(volume: number): Promise<AxiosResponse<SuccessResponse>> {
    if (typeof volume === 'number') {
      return this.http.post(`/api/speakers/volume`, { volume: volume })
    }
    throw new Error('volume is undefined')
  }

  muteAllSpeakers(): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post(`/api/speakers/mute`)
  }

  unmuteAllSpeakers(): Promise<AxiosResponse<SuccessResponse>> {
    return this.http.post(`/api/speakers/unmute`)
  }

  muteSpeaker(id: string): Promise<AxiosResponse<SuccessResponse>> {
    if (id) {
      return this.http.post(`/api/speaker/mute/${encodeURIComponent(id)}`)
    }
    throw new Error('id is undefined')
  }

  unmuteSpeaker(id: string): Promise<AxiosResponse<SuccessResponse>> {
    if (id) {
      return this.http.post(`/api/speaker/unmute/${encodeURIComponent(id)}`)
    }
    throw new Error('id is undefined')
  }

  /* ---------------------- Streaming ---------------------- */

  getStreamUrl(format?: 'aac' | 'mp3' | 'mp4'): string {
    if (format) {
      return `${this.baseURL}/api/stream?format=${encodeURIComponent(format)}`
    }
    return `${this.baseURL}/api/stream`
  }

  /* ---------------------- Version ---------------------- */

  getVersion(): Promise<AxiosResponse<any>> {
    return this.http.get('/api/version')
  }

  /* ---------------------- Media Sources  ---------------------- */

  getItems(id: string, offset?: number, limit?: number): Promise<AxiosResponse<MediaItem[]>> {
    return this.http.get(`/api/media/${encodeURIComponent(id)}/items`, {
      params: { offset, limit },
    })
  }

  getRadioSources(): Promise<AxiosResponse<any[]>> {
    return this.http.get('/api/radio')
  }

  getCatalogItems(
    source: string,
    id?: string,
    offset?: number,
    limit?: number
  ): Promise<AxiosResponse<MediaItem[]>> {
    return this.http.get(`/api/catalog/browse/${encodeURIComponent(source)}`, {
      params: { id, offset, limit },
    })
  }

  getCatalog(): Promise<AxiosResponse<any[]>> {
    return this.http.get(`/api/catalog`)
  }

  getRadioItems(
    source: string,
    id: string,
    offset?: number,
    limit?: number,
    query?: string
  ): Promise<AxiosResponse<MediaItem[]>> {
    if (query && query !== '') {
      return this.http.get(`/api/search/${source}`, {
        params: { query, offset, limit },
      })
    }

    return this.http.get(`/api/radio/browse/${source}/${encodeURIComponent(id)}`, {
      params: { offset, limit },
    })
  }

  getToken(): Promise<AxiosResponse<string>> {
    return this.http.get('/api/spotify/auth')
  }

  getLocalItems(
    id?: string,
    offset?: number,
    limit?: number,
    query?: string
  ): Promise<AxiosResponse<MediaItem[]>> {
    if (query && query !== '') {
      return this.http.get(`/api/search/local`, {
        params: { id, offset, limit, query },
      })
    }

    return this.http.get(`/api/local/browse`, {
      params: { id, offset, limit },
    })
  }

  getPodverseItems(
    id?: string,
    offset?: number,
    limit?: number,
    query?: string
  ): Promise<AxiosResponse<MediaItem[]>> {
    if (query && query !== '') {
      return this.http.get(`/api/search/podverse`, {
        params: { id, offset, limit, query },
      })
    }

    return this.http.get(`/api/podverse/browse`, {
      params: { id, offset, limit },
    })
  }

  playlistToMediaItem(playlist: Playlist): MediaItem | undefined {
    if (!playlist) return undefined

    return {
      id: playlist.id,
      sourceRef: {
        source: playlist.source,
        itemType: 'playlist',
        sourceId: playlist.sourceId || '',
        uri: playlist.sourceUri,
      },
      title: playlist.name,
      description: playlist.description,
      imageUrl: playlist.imageUrl,
      durationMs: undefined,
      library: playlist.library,
    }
  }
}

export const ApiClient = new VIOXApi()
