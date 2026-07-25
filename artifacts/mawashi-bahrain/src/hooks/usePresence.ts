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
  orderId: number | null;
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

  // Get session ID (use Clerk user ID if available, otherwise generate one)
  const getSessionId = useCallback(() => {
    return user?.id || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }, [user]);

  // Get order ID from localStorage (set when placing an order)
  const getOrderId = useCallback(() => {
    try {
      const lastOrder = localStorage.getItem("mawashi-last-order");
      if (lastOrder) {
        const order = JSON.parse(lastOrder);
        return order.id || null;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }, []);

  // Get customer name from localStorage or Clerk
  const getCustomerName = useCallback(() => {
    try {
      const lastOrder = localStorage.getItem("mawashi-last-order");
      if (lastOrder) {
        const order = JSON.parse(lastOrder);
        if (order.customerName) return order.customerName;
      }
    } catch (e) {
      // Ignore
    }
    return user?.fullName || user?.firstName || "";
  }, [user]);

  // Get API URL
  const getWsUrl = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    let host;
    
    if (apiUrl && apiUrl.trim()) {
      // Remove trailing slash and protocol
      host = apiUrl.replace(/\/$/, "").replace(/^https?:\/\//, "");
    } else {
      // Use current window location
      host = window.location.host;
    }
    
    // Determine protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    const sessionId = getSessionId();
    return `${protocol}//${host}/ws/presence?sessionId=${encodeURIComponent(sessionId)}`;
  }, [getSessionId]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWsUrl();
    console.log("[Presence] Connecting to:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[Presence] Connected to WebSocket");
      setIsConnected(true);

      // Send initial presence with user and order info
      const customerName = getCustomerName();
      const orderId = getOrderId();
      
      console.log("[Presence] Sending initial presence:", { page: window.location.pathname, customerName, orderId });
      
      sendPresenceUpdate({
        page: window.location.pathname,
        customerName,
        orderId,
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[Presence] Message received:", message.type, message);

        switch (message.type) {
          case "connected":
          case "presence_update":
            const clients = message.clients || [];
            console.log("[Presence] Updating state with clients:", clients.length);
            console.log("[Presence] Client details:", clients.map(c => ({
              sessionId: c.sessionId,
              currentPage: c.currentPage,
              customerName: c.customerName,
              orderId: c.orderId,
              isOnline: c.isOnline,
            })));
            
            setPresenceClients(clients);
            onPresenceUpdate?.(clients);
            break;

          case "pong":
            console.log("[Presence] Pong received");
            break;
        }
      } catch (error) {
        console.error("[Presence] Error parsing message:", error);
      }
    };

    ws.onclose = () => {
      console.log("[Presence] Disconnected from WebSocket");
      setIsConnected(false);
      setPresenceClients([]); // Clear on disconnect
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
  }, [getWsUrl, getCustomerName, getOrderId, onPresenceUpdate, autoConnect]);

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
    (data: { page?: string; customerName?: string; orderId?: number | null }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log("[Presence] Sending presence update:", data);
        wsRef.current.send(
          JSON.stringify({
            type: "presence_update",
            ...data,
          })
        );
      } else {
        console.log("[Presence] Cannot send - WebSocket not connected");
      }
    },
    []
  );

  // Update current page
  const updatePage = useCallback(
    (page: string) => {
      const customerName = getCustomerName();
      const orderId = getOrderId();
      sendPresenceUpdate({ page, customerName, orderId });
    },
    [sendPresenceUpdate, getCustomerName, getOrderId]
  );

  // Update customer name
  const updateCustomerName = useCallback(
    (name: string) => {
      sendPresenceUpdate({ customerName: name });
    },
    [sendPresenceUpdate]
  );

  // Update order ID
  const updateOrderId = useCallback(
    (orderId: number | null) => {
      const customerName = getCustomerName();
      sendPresenceUpdate({ customerName, orderId });
    },
    [sendPresenceUpdate, getCustomerName]
  );

  // Track page changes
  useEffect(() => {
    if (!isConnected) return;

    // Update page on route change
    const handleRouteChange = () => {
      console.log("[Presence] Route changed to:", window.location.pathname);
      updatePage(window.location.pathname);
    };

    // Listen for navigation
    window.addEventListener("popstate", handleRouteChange);

    // For SPA navigation, we need to use a custom event
    const handleNavigate = () => {
      console.log("[Presence] Navigation event to:", window.location.pathname);
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

  // Update presence when order is placed
  useEffect(() => {
    if (isConnected) {
      const orderId = getOrderId();
      if (orderId) {
        console.log("[Presence] Order ID available, updating:", orderId);
        updateOrderId(orderId);
      }
    }
  }, [isConnected, getOrderId, updateOrderId]);

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
    updateOrderId,
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
