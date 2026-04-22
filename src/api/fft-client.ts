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

  // --- OPTIMIZATION STATE ---
  private processing = false
  // Pre-allocated buffer to prevent Garbage Collection thrashing
  private frameBuffer = new Float32Array(64)
  // ---------------------------

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
      /**
       * CLIENT LOCKING (Backpressure):
       * If we are still busy processing the previous frame, drop this one.
       * This prevents the browser task queue from being "swamped" if the
       * server outpaces the client's render speed.
       */
      if (this.processing) {
        return
      }

      this.processing = true

      try {
        // Use .set() to copy data into the existing buffer (zero-allocation)
        const incomingData = new Float32Array(event.data)
        this.frameBuffer.set(incomingData)

        // Execute the visualizer update
        if (this.onFrame) {
          this.onFrame(this.frameBuffer)
        }
      } finally {
        // Unlock so the next available message can be accepted
        this.processing = false
      }
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
}
