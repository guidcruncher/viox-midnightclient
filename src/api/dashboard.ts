import type { MediaItem } from "../types"
import ApiClient from "./index"

export const dashboardApi = {
  async getPresets(): Promise<MediaItem[]> {
    return ApiClient.result(await ApiClient.mediaStorage.listPresets())
  },

  // Example of a future endpoint
  async getRecentActivity(limit: number): Promise<MediaItem[]> {
    return ApiClient.mediaStorage.listHistory(limit)
  },
}
