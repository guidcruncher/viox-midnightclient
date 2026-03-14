import { BaseClient } from "./base"
import type { MediaItem } from "../types"

class LocalApi extends BaseClient {
  /**
   * Recursively scan a directory for audio files + folders.
   * GET /local/scan?dir=/path
   */
  public async scan(dir?: string): Promise<MediaItem[]> {
    const res = await this.client.get("/local/scan", {
      params: dir ? { dir } : undefined,
    })
    return res.data
  }

  /**
   * List only the direct children of a folder (non-recursive).
   * GET /local/folder?dir=/path
   */
  public async getFiles(dir?: string): Promise<MediaItem[]> {
    const res = await this.client.get("/local/folder", {
      params: dir ? { dir } : undefined,
    })
    return res.data
      .map((t: MediaItem) => {
        if (t.img && t.img == "") {
          t.img = undefined
        }
        return t
      })
      .sort((a: MediaItem, b: MediaItem) => {
        return a.title.localeCompare(b.title)
      })
  }
}

export const localApi = new LocalApi()
