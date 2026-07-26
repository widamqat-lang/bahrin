// ============================================
// Presence Provider
// ============================================
// Provides real-time presence context to the app

import { createContext, useContext, type ReactNode, type FC } from "react";
import { usePresence, usePagePresence, type PresenceClient } from "@/hooks/usePresence";

interface PresenceContextValue {
  isConnected: boolean;
  presenceClients: PresenceClient[];
  updatePage: (page: string) => void;
  updateCustomerName: (name: string) => void;
}

const PresenceContext = createContext<PresenceContextValue>({
  isConnected: false,
  presenceClients: [],
  updatePage: () => {},
  updateCustomerName: () => {},
});

export const usePresenceContext = () => useContext(PresenceContext);

interface PresenceProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export const PresenceProvider: FC<PresenceProviderProps> = ({
  children,
  autoConnect = true,
}) => {
  // This hook sends page view updates to server for accurate page tracking
  usePagePresence();

  const {
    isConnected,
    presenceClients,
    updatePage,
    updateCustomerName,
  } = usePresence({ autoConnect });

  return (
    <PresenceContext.Provider
      value={{
        isConnected,
        presenceClients,
        updatePage,
        updateCustomerName,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
};
