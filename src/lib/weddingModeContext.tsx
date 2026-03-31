"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMember } from "@/lib/memberContext";
import { useKidsMode } from "@/lib/kidsModeContext";

const STORAGE_KEY = "fairchild-wedding-mode";

type WeddingModeContextValue = {
  isWeddingMode: boolean;
  setWeddingMode: (value: boolean) => void;
};

const WeddingModeContext = createContext<WeddingModeContextValue>({
  isWeddingMode: false,
  setWeddingMode: () => {},
});

function getStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setStored(value: boolean) {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/** Clears wedding mode when logged out; clears if both kids + wedding were ever set. */
function WeddingModeSync({ children }: { children: React.ReactNode }) {
  const { hasSession, authReady } = useMember();
  const { isKidsMode } = useKidsMode();
  const { isWeddingMode, setWeddingMode } = useWeddingMode();

  useEffect(() => {
    if (!authReady) return;
    if (!hasSession && isWeddingMode) {
      setWeddingMode(false);
    }
  }, [authReady, hasSession, isWeddingMode, setWeddingMode]);

  useEffect(() => {
    if (isKidsMode && isWeddingMode) {
      setWeddingMode(false);
    }
  }, [isKidsMode, isWeddingMode, setWeddingMode]);

  return <>{children}</>;
}

export function WeddingModeProvider({ children }: { children: React.ReactNode }) {
  const { setKidsMode } = useKidsMode();
  const [isWeddingMode, setWeddingState] = useState(() =>
    typeof window !== "undefined" ? getStored() : false
  );

  useEffect(() => {
    setWeddingState(getStored());
  }, []);

  const setWeddingMode = useCallback(
    (value: boolean) => {
      if (value) {
        setKidsMode(false);
      }
      setWeddingState(value);
      setStored(value);
    },
    [setKidsMode]
  );

  return (
    <WeddingModeContext.Provider value={{ isWeddingMode, setWeddingMode }}>
      <WeddingModeSync>{children}</WeddingModeSync>
    </WeddingModeContext.Provider>
  );
}

export function useWeddingMode() {
  return useContext(WeddingModeContext);
}
