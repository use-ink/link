import { useContext } from "react";
import { UIContext, UIState } from "../contexts";

export const useUI = (): UIState  => {
  const context = useContext(UIContext);

  if (context === undefined) {
    throw new Error(
      "useUI must be used within a UIProvider"
    );
  }

  return context;
}
