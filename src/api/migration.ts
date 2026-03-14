// src/services/api/migration.ts

import { AxiosResponse } from "axios"
import { BaseClient } from "./base"

export class MigrationApi extends BaseClient {
  private readonly basePath = "/migration"

  /**
   * Start a migration (background task)
   */
  public startMigration(body: any): Promise<AxiosResponse<any>> {
    return this.client.post(`${this.basePath}/start`, body)
  }

  /**
   * Get global migration status
   */
  public getStatus(): Promise<AxiosResponse<any>> {
    return this.client.get(`${this.basePath}/status`)
  }

  /**
   * Get status for a specific migration ID
   */
  public getStatusById(id: string): Promise<AxiosResponse<any>> {
    return this.client.get(`${this.basePath}/status/${id}`)
  }

  /**
   * Poll migration status until finished
   */
  public async waitForCompletion(id: string, intervalMs: number = 1000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        try {
          const res = await this.getStatusById(id)
          const status = res.data

          if (status.state === "completed" || status.state === "failed") {
            clearInterval(timer)
            resolve(status)
          }
        } catch (err) {
          clearInterval(timer)
          reject(err)
        }
      }, intervalMs)
    })
  }
}

export const migrationApi = new MigrationApi()
