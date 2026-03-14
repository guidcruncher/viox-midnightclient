import { AxiosResponse } from "axios"
import { BaseClient } from "./base"

export class ConfigClient extends BaseClient {
  public async get(): Promise<any | undefined> {
    const res = await this.client.get("/config")
    if (res.data) return res.data
    return undefined
  }

  public async save(config: any): Promise<AxiosResponse<any>> {
    return this.client.post("/config", { config })
  }
}
