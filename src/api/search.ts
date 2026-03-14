import { BaseClient } from "./base"
import type { UnifiedSearchResponse } from "../types"

class SearchClient extends BaseClient {
  public async search(
    q: string,
    opts?: { page?: number; pageSize?: number; field?: string },
  ): Promise<UnifiedSearchResponse> {
    const params = {
      q,
      page: opts?.page,
      pageSize: opts?.pageSize,
      field: opts?.field,
    }

    const res = await this.client.get<UnifiedSearchResponse>("/search", { params })
    return res.data
  }
}

export const searchApi = new SearchClient()
