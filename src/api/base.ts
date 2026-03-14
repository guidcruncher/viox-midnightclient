import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
import { getBaseUrl } from "../utils/baseUrl"

export class BaseClient {
  protected client: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    const baseURL = `${getBaseUrl()}/api`

    this.client = axios.create({
      baseURL,
      ...config,
    })
  }
}
