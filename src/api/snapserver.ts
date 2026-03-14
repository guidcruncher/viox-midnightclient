import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import { SnapVolumeRequest } from "./types"

export class SnapserverClient extends BaseClient {
  public async getStatus(): Promise<AxiosResponse> {
    return this.client.get("/snapserver/status")
  }

  public async muteClients(): Promise<AxiosResponse> {
    return this.client.post("/snapserver/clients/mute")
  }

  public async unmuteClients(): Promise<AxiosResponse> {
    return this.client.post("/snapserver/clients/unmute")
  }

  public async setGlobalClientVolume(percent: number): Promise<AxiosResponse> {
    return this.client.post("/snapserver/clients/volume", { percent })
  }

  public async setClientLatency(id: string, latency: number): Promise<AxiosResponse> {
    return this.client.post(`/snapserver/clients/${id}/latency`, { latency })
  }

  public async setClientVolume(id: string, data: SnapVolumeRequest): Promise<AxiosResponse> {
    const postData: any = { ...data }
    postData.id = id
    return this.client.post(`/snapserver/client/volume`, postData)
  }

  public async setGroupStream(groupId: string, streamId: string): Promise<AxiosResponse> {
    return this.client.post(`/snapserver/groups/${groupId}/stream`, { streamId })
  }

  public async getSpeakers(): Promise<AxiosResponse> {
    return this.client.get("/snapserver/speakers")
  }
}
