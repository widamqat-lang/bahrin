import { createServer } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { presenceManager } from "./websocket/manager";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Create HTTP server from Express app
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: "/ws/presence" });

wss.on("connection", (ws: WebSocket, req) => {
  // Extract session ID from query string
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const sessionId = url.searchParams.get("sessionId") || `anon-${Date.now()}`;

  logger.info({ sessionId }, "WebSocket client connected");

  // Register client
  presenceManager.register(sessionId, ws);

  // Send initial presence data
  ws.send(JSON.stringify({
    type: "connected",
    sessionId,
    clients: presenceManager.getClients().map((c) => ({
      sessionId: c.sessionId,
      currentPage: c.currentPage,
      customerName: c.customerName,
      lastSeenAt: c.lastSeenAt.toISOString(),
      isOnline: true,
    })),
  }));

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case "presence_update":
          presenceManager.updatePresence(sessionId, {
            page: message.page,
            customerName: message.customerName,
            orderId: message.orderId ? Number(message.orderId) : null,
          });
          // Broadcast to all clients
          presenceManager.broadcastPresenceUpdate();
          break;

        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;
      }
    } catch (error) {
      logger.error({ error }, "Error parsing WebSocket message");
    }
  });

  // Handle disconnect
  ws.on("close", () => {
    logger.info({ sessionId }, "WebSocket client disconnected");
    presenceManager.unregister(sessionId);
    // Broadcast updated presence to remaining clients
    presenceManager.broadcastPresenceUpdate();
  });

  // Handle errors
  ws.on("error", (error) => {
    logger.error({ error, sessionId }, "WebSocket error");
    presenceManager.unregister(sessionId);
  });
});

// Subscribe to presence updates and broadcast
presenceManager.onUpdate(() => {
  presenceManager.broadcastPresenceUpdate();
});

server.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening on port");
});
