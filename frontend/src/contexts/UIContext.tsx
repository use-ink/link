import { PropsWithChildren, createContext, useState } from "react";

export interface UIState {
  showConnectWallet: boolean; 
  setShowConnectWallet: (show: boolean) => void;
}

export const UIContext = createContext<UIState>({ showConnectWallet: false, setShowConnectWallet: () => null });

export function UIProvider({ children }: PropsWithChildren) {
  const [showConnectWallet, setShowConnectWallet] = useState(false);

  return (
    <UIContext.Provider value={{ showConnectWallet, setShowConnectWallet }}>
      {children}
    </UIContext.Provider>
  );
}