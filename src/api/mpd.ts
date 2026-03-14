import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import { StatusResponse } from "./types"

export class MpdClient extends BaseClient {
  public add(uri: string): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/add", { uri })
  }

  public clear(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/clear")
  }

  public getCurrent(): Promise<AxiosResponse<Record<string, string>>> {
    return this.client.get("/mpd/current")
  }

  public getStatus(): Promise<AxiosResponse<Record<string, string>>> {
    return this.client.get("/mpd/status")
  }

  public next(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/next")
  }

  public previous(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/previous")
  }

  public pause(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/pause")
  }

  public play(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/play")
  }

  public resume(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/resume")
  }

  public stop(): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/stop")
  }

  public setVolume(volume: number): Promise<AxiosResponse<StatusResponse>> {
    return this.client.post("/mpd/volume", { volume })
  }
}
