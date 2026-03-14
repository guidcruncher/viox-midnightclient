import { AxiosResponse } from "axios"
import { BaseClient } from "./base"

export class UtilityClient extends BaseClient {
  public async getServerVersion(): Promise<string> {
    const res = await this.client.get("/version")
    return res.data.version
  }

  public getQrCode(url: string): Promise<AxiosResponse<Blob>> {
    return this.client.get("/qr", {
      params: { url },
      responseType: "blob",
    })
  }
}

export const utilityClient = new UtilityClient()
