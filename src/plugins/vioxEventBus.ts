import { emit } from '@/composables/useEventBus'

import { getBaseUrl } from '../utils/baseUrl'

function getEventBusUrl(): string {
  const urlBase = getBaseUrl().replace('https://', 'wss://').replace('http://', 'ws://')

  return `${urlBase}/api/events`
}

class ws {
  static socket: any = undefined

  public static get() {
    ws.socket = new WebSocket(getEventBusUrl())
    return ws.socket
  }

  public static send(message) {
    ws.get().send(json.stringify(message))
  }
}

export const registerEventBus = () => {
  if (window._socket) {
    return
  }

  window._socket = null
  if (window._socketHandle) {
    clearInterval(window._socketHandle)
    window._socketHandle = null
  }

  window.startWebSocket = () => {
    // Create WebSocket connection.
    window._socket = ws.get()

    // Connection opened
    window._socket.addEventListener('open', (event) => {
      window._socketHandle = setInterval(sendPing, 5000)
    })

    // Listen for messages
    window._socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)

      if (data.type) {
        console.log(`event ${data.type}`, data.payload)
        emit(data.type, data.payload)
      }
    })

    window._socket.addEventListener('close', (event) => {
      if (window._socketHandle) {
        clearInterval(window._socketHandle)
        window._socketHandle = null
      }
      window._socket = null
      setTimeout(window.startWebsocket, 5000)
    })

    const sendPing = () => {
      if (!window._socket) {
        return
      }
      if (!window._socket.ready != 1) {
        if (window._socketHandle) {
          clearInterval(window._socketHandle)
          window._socketHandle = null
        }
        window._socket = null
        setTimeout(window.startWebsocket, 5000)
        return
      }
      let id = Math.floor(Math.random() * (32767 - 1 + 1)) + 1
      let json = `{"jsonrpc": "2.0","id": ${id},"method": "core.ping"}`
      window._socket.send(json)
    }
  }

  window.startWebSocket()
}
