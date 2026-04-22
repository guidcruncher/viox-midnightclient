// src/sdk/fftClient.ts
import { getBaseUrl } from '../utils/baseUrl'

export type FftFrame = Float32Array

export interface FftClientOptions {
  url?: string
  onFrame?: (frame: FftFrame) => void
  onOpen?: () => void
  onClose?: (ev: CloseEvent) => void
  onError?: (ev: Event) => void
}

export class FftClient {
  private ws: WebSocket | null = null
  private readonly url: string
  private readonly onFrame?: (frame: FftFrame) => void
  private readonly onOpen?: () => void
  private readonly onClose?: (ev: CloseEvent) => void
  private readonly onError?: (ev: Event) => void

  // OPTIMIZATION: Persistent buffer to reduce GC pressure
  private frameBuffer = new Float32Array(64)

  constructor(options: FftClientOptions) {
    this.url = options.url || `${getBaseUrl().replace(/^http/, 'ws')}/api/fft`
    this.onFrame = options.onFrame
    this.onOpen = options.onOpen
    this.onClose = options.onClose
    this.onError = options.onError
  }

  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(this.url)
    ws.binaryType = 'arraybuffer'

    ws.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      // Use .set() to copy data into the existing buffer instead of allocating a new one
      this.frameBuffer.set(new Float32Array(event.data))
      this.onFrame?.(this.frameBuffer)
    }

    ws.onopen = () => this.onOpen?.()
    ws.onclose = (ev) => {
      this.onClose?.(ev)
      this.ws = null
    }
    ws.onerror = (ev) => this.onError?.(ev)
    this.ws = ws
  }

  public disconnect(): void {
    this.ws?.close()
    this.ws = null
  }
}
