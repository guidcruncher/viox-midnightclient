import { emit } from '@/composables/useEventBus'
import { getBaseUrl } from '../utils/baseUrl'

/**
 * Transforms HTTP/S base URL to WS/S
 */
function getEventBusUrl(): string {
  const urlBase = getBaseUrl().replace(/^http/, 'ws');
  return `${urlBase}/api/events`;
}

class SocketManager {
  private static instance: WebSocket | null = null;

  public static get(): WebSocket {
    if (!this.instance || this.instance.readyState > 1) { // 2 = Closing, 3 = Closed
      this.instance = new WebSocket(getEventBusUrl());
    }
    return this.instance;
  }

  public static send(message: any) {
    const socket = this.get();
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Socket not open. Message queued or dropped.');
    }
  }
}

export const registerEventBus = () => {
  // Prevent duplicate registration
  if ((window as any)._socketInitialized) return;
  (window as any)._socketInitialized = true;

  let socketHandle: any = null;

  const startWebSocket = () => {
    const socket = SocketManager.get();

    socket.onopen = () => {
      console.log('WS Connected');
      socketHandle = setInterval(sendPing, 5000);
    };

    socket.onmessage = (event:any) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type) {
          emit(data.type, data.payload);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    socket.onclose = () => {
      console.log('WS Closed. Reconnecting in 5s...');
      if (socketHandle) clearInterval(socketHandle);
      setTimeout(startWebSocket, 5000);
    };

    const sendPing = () => {
      if (socket.readyState !== WebSocket.OPEN) return;
      
      const id = Math.floor(Math.random() * 32767) + 1;
      socket.send(JSON.stringify({
        jsonrpc: "2.0",
        id: id,
        method: "core.ping"
      }));
    };
  };

  startWebSocket();
};
