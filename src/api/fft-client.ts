// src/sdk/fftClient.ts
import { getBaseUrl } from '../utils/baseUrl'

export type FftFrame = Float32Array

export interface FftClientOptions {
  url?: string
  /** Called when a new FFT frame arrives */
  onFrame?: (frame: FftFrame) => void
  /** Called when socket opens */
  onOpen?: () => void
  /** Called when socket closes */
  onClose?: (ev: CloseEvent) => void
  /** Called on error */
  onError?: (ev: Event) => void
}

export class FftClient {
  private ws: WebSocket | null = null
  private readonly url: string
  private readonly onFrame?: (frame: FftFrame) => void
  private readonly onOpen?: () => void
  private readonly onClose?: (ev: CloseEvent) => void
  private readonly onError?: (ev: Event) => void

  constructor(options: FftClientOptions) {
    this.url = options.url || `${getBaseUrl().replace(/^http/, 'ws')}/api/fft`
    this.onFrame = options.onFrame
    this.onOpen = options.onOpen
    this.onClose = options.onClose
    this.onError = options.onError
  }

  public connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    const ws = new WebSocket(this.url)
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      this.onOpen?.()
    }

    ws.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      const data = event.data
      // 64 bins, 4 bytes each → 256 bytes
      const frame = new Float32Array(data)
      this.onFrame?.(frame)
    }

    ws.onclose = (ev) => {
      this.onClose?.(ev)
      this.ws = null
    }

    ws.onerror = (ev) => {
      this.onError?.(ev)
    }

    this.ws = ws
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  public get readyState(): number | null {
    return this.ws?.readyState ?? null
  }
}
