// ============================================
// WebSocket Presence Hook
// ============================================
// Manages real-time presence tracking for the current user

import { useEffect, useRef, useCallback, useState } from "react";
import { useUser } from "@clerk/react";

export interface PresenceClient {
  sessionId: string;
  currentPage: string;
  customerName: string;
  lastSeenAt: string;
  isOnline: boolean;
}

interface UsePresenceOptions {
  onPresenceUpdate?: (clients: PresenceClient[]) => void;
  autoConnect?: boolean;
}

export function usePresence(options: UsePresenceOptions = {}) {
  const { onPresenceUpdate, autoConnect = true } = options;
  const { user, isLoaded } = useUser();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presenceClients, setPresenceClients] = useState<PresenceClient[]>([]);

  // Get session ID from Clerk
  const getSessionId = useCallback(() => {
    return user?.id || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, [user]);

  // Get API URL
  const getWsUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_API_URL?.replace(/^http/, "") || window.location.host;
    const sessionId = getSessionId();
    return `${protocol}//${host}/ws/presence?sessionId=${sessionId}`;
  }, [getSessionId]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[Presence] Connected to WebSocket");
      setIsConnected(true);

      // Send initial presence with user info
      sendPresenceUpdate({
        page: window.location.pathname,
        customerName: user?.fullName || user?.firstName || "",
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "connected":
          case "presence_update":
            setPresenceClients(message.clients || []);
            onPresenceUpdate?.(message.clients || []);
            break;

          case "pong":
            // Heartbeat response, ignore
            break;
        }
      } catch (error) {
        console.error("[Presence] Error parsing message:", error);
      }
    };

    ws.onclose = () => {
      console.log("[Presence] Disconnected from WebSocket");
      setIsConnected(false);
      wsRef.current = null;

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (autoConnect) {
          console.log("[Presence] Attempting to reconnect...");
          connect();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("[Presence] WebSocket error:", error);
    };

    wsRef.current = ws;
  }, [getWsUrl, user, onPresenceUpdate, autoConnect]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Send presence update
  const sendPresenceUpdate = useCallback(
    (data: { page?: string; customerName?: string }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "presence_update",
            ...data,
          })
        );
      }
    },
    []
  );

  // Update current page
  const updatePage = useCallback(
    (page: string) => {
      sendPresenceUpdate({ page });
    },
    [sendPresenceUpdate]
  );

  // Update customer name
  const updateCustomerName = useCallback(
    (name: string) => {
      sendPresenceUpdate({ customerName: name });
    },
    [sendPresenceUpdate]
  );

  // Track page changes
  useEffect(() => {
    if (!isConnected) return;

    // Update page on route change
    const handleRouteChange = () => {
      updatePage(window.location.pathname);
    };

    // Listen for navigation
    window.addEventListener("popstate", handleRouteChange);

    // For SPA navigation, we need to use a custom event
    const handleNavigate = () => {
      updatePage(window.location.pathname);
    };
    window.addEventListener("mawashi-navigate", handleNavigate);

    // Initial update
    updatePage(window.location.pathname);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("mawashi-navigate", handleNavigate);
    };
  }, [isConnected, updatePage]);

  // Auto-connect when user is loaded
  useEffect(() => {
    if (isLoaded && autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isLoaded, autoConnect, connect, disconnect]);

  // Update name when user changes
  useEffect(() => {
    if (user && isConnected) {
      updateCustomerName(user.fullName || user.firstName || "");
    }
  }, [user, isConnected, updateCustomerName]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    isConnected,
    presenceClients,
    connect,
    disconnect,
    updatePage,
    updateCustomerName,
    sendPresenceUpdate,
  };
}

// Hook to dispatch navigation events (call this when navigating)
export function usePresenceNavigation() {
  const dispatch = useCallback(() => {
    window.dispatchEvent(new CustomEvent("mawashi-navigate"));
  }, []);

  return dispatch;
}
