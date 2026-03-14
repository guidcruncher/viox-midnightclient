import { AxiosResponse } from "axios"
import { BaseClient } from "./base"
import { MediaItem } from "../types/"

interface RadioSearchQuery {
  name?: string
  countrycode?: string
  limit?: number
  offset?: number
}

class RadioApi extends BaseClient {
  private readonly basePath = "/radio"

  public async getProvider(): Promise<string> {
    const res = await this.client.get(`${this.basePath}/provider`)
    return res.data.provider
  }

  public async getCountries(): Promise<AxiosResponse<any[]>> {
    return this.client.get(`${this.basePath}/countries`)
  }

  /**
   * Search for stations using various filters
   */
  public search(query: RadioSearchQuery): Promise<AxiosResponse<MediaItem[]>> {
    return this.client.get(`${this.basePath}/search`, {
      params: query,
    })
  }

  /**
   * Get a specific station's details by its UUID
   */
  public getStation(uuid: string): Promise<AxiosResponse<MediaItem>> {
    return this.client.get(`${this.basePath}/station/${uuid}`)
  }

  public async getStations(
    offset: number,
    limit: number,
    opts?: { country?: string; name?: string },
  ): Promise<MediaItem[]> {
    let radioCountry = ""
    let radioName = ""
    if (opts && opts.country) {
      radioCountry = opts.country
    }

    if (opts && opts.name) {
      radioName = opts.name
    }

    const query: RadioSearchQuery = {
      offset,
      limit,
      name: radioName,
      countrycode: radioCountry,
    }

    const res = await this.client.get(`${this.basePath}/search`, {
      params: query,
    })

    return res.data
  }
}

export const radioApi = new RadioApi()
