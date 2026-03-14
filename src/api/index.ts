import { AxiosRequestConfig, AxiosResponse } from "axios"
import { AudioClient } from "./audio"
import { MpdClient } from "./mpd"
import { SnapserverClient } from "./snapserver"
import { SpotifyClient } from "./spotify"
import { UtilityClient } from "./utility"
import { MediaStorageClient } from "./mediaStorage"
import { EqClient } from "./eq"
import { PodverseClient } from "./podverse"
import { ConfigClient } from "./config"

class AudioControlSdk {
  public audio: AudioClient
  public config: ConfigClient
  public mpd: MpdClient
  public snapserver: SnapserverClient
  public spotify: SpotifyClient
  public utility: UtilityClient
  public mediaStorage: MediaStorageClient
  public eq: EqClient
  public podcast: PodverseClient

  constructor(config?: AxiosRequestConfig) {
    this.podcast = new PodverseClient(config)
    this.audio = new AudioClient(config)
    this.mpd = new MpdClient(config)
    this.snapserver = new SnapserverClient(config)
    this.spotify = new SpotifyClient(config)
    this.utility = new UtilityClient(config)
    this.mediaStorage = new MediaStorageClient(config)
    this.eq = new EqClient(config)
    this.config = new ConfigClient(config)
  }

  public result(response: AxiosResponse): any {
    if (!response) {
      return null
    }
    if ([200, 201, 204].includes(response.status)) {
      return response.data
    }
    return null
  }
}

// Export all types and clients for consumers
export default new AudioControlSdk()
