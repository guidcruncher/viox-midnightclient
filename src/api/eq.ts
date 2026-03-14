// src/clients/eqClient.ts
import { AxiosResponse } from "axios"
import { BaseClient } from "./base"

// Specifically for /eq/status
interface EqLevels {
  [band: string]: number
}

// Specifically for /eq/presets
interface PresetListResponse {
  presets: string[]
}

export class EqClient extends BaseClient {
  /**
   * Applies a named preset from the presets.json file.
   */
  public loadPreset(name: string): Promise<AxiosResponse> {
    return this.client.post(`/eq/preset/${name}`)
  }

  /**
   * Adjusts a specific frequency band (e.g., "31 Hz").
   */
  public setBand(band: string, level: number): Promise<AxiosResponse> {
    return this.client.post("/eq/band", { band, level })
  }

  public async setBands(eq: EqLevels) {
    for (const key in eq) {
      await this.setBand(key, eq[key])
    }
  }

  /**
   * Sets the global pre-amp gain multiplier.
   */
  public setGain(value: number): Promise<AxiosResponse> {
    return this.client.post("/eq/gain", { value })
  }

  /**
   * Retrieves the current live dB levels of all 10 bands from PipeWire.
   */
  public getStatus(): Promise<AxiosResponse<EqLevels>> {
    return this.client.get("/eq/status")
  }

  /**
   * Retrieves the list of available preset keys for UI menus.
   */
  public getPresets(): Promise<AxiosResponse<PresetListResponse>> {
    return this.client.get("/eq/presets")
  }

  public setPreset(value: string): Promise<AxiosResponse> {
    return this.client.post(`/eq/preset/${value}`, {})
  }
}
