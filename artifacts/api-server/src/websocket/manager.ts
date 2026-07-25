// ============================================
// WebSocket Presence Manager
// ============================================
// Manages real-time presence tracking for customers

import type { WebSocket } from "ws";

export interface PresenceClient {
  sessionId: string;
  ws: WebSocket;
  currentPage: string;
  customerName: string;
  orderId: number | null;
  lastSeenAt: Date;
}

type PresenceUpdateHandler = (clients: PresenceClient[]) => void;

class PresenceManager {
  private clients: Map<string, PresenceClient> = new Map();
  private updateHandlers: Set<PresenceUpdateHandler> = new Set();

  // Register a new client
  register(sessionId: string, ws: WebSocket): void {
    this.clients.set(sessionId, {
      sessionId,
      ws,
      currentPage: "غير متصل",
      customerName: "",
      orderId: null,
      lastSeenAt: new Date(),
    });
    this.notifyHandlers();
  }

  // Unregister a client (disconnect)
  unregister(sessionId: string): void {
    const client = this.clients.get(sessionId);
    if (client) {
      client.lastSeenAt = new Date(); // Update last seen before removing
    }
    this.clients.delete(sessionId);
    this.notifyHandlers();
  }

  // Update client presence info
  updatePresence(sessionId: string, data: { page?: string; customerName?: string; orderId?: number | null }): void {
    const client = this.clients.get(sessionId);
    if (client) {
      if (data.page !== undefined) {
        client.currentPage = data.page;
      }
      if (data.customerName !== undefined) {
        client.customerName = data.customerName;
      }
      if (data.orderId !== undefined) {
        client.orderId = data.orderId;
      }
      client.lastSeenAt = new Date();
      this.notifyHandlers();
    }
  }

  // Get all connected clients
  getClients(): PresenceClient[] {
    return Array.from(this.clients.values());
  }

  // Get a specific client
  getClient(sessionId: string): PresenceClient | undefined {
    return this.clients.get(sessionId);
  }

  // Subscribe to presence updates
  onUpdate(handler: PresenceUpdateHandler): () => void {
    this.updateHandlers.add(handler);
    return () => {
      this.updateHandlers.delete(handler);
    };
  }

  // Notify all handlers of updates
  private notifyHandlers(): void {
    const clients = this.getClients();
    this.updateHandlers.forEach((handler) => {
      try {
        handler(clients);
      } catch (error) {
        console.error("Error in presence update handler:", error);
      }
    });
  }

  // Broadcast to all clients
  broadcast(message: object): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(data);
      }
    });
  }

  // Broadcast to all admin clients
  broadcastPresenceUpdate(): void {
    const clients = this.getClients().map((c) => ({
      sessionId: c.sessionId,
      currentPage: c.currentPage,
      customerName: c.customerName,
      orderId: c.orderId,
      lastSeenAt: c.lastSeenAt.toISOString(),
      isOnline: true,
    }));

    this.broadcast({
      type: "presence_update",
      clients,
    });
  }

  // Send presence update to a specific client
  sendToClient(sessionId: string, message: object): void {
    const client = this.clients.get(sessionId);
    if (client && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  }
}

// Singleton instance
export const presenceManager = new PresenceManager();
