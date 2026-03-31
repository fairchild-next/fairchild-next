"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMember } from "@/lib/memberContext";

const STORAGE_KEY = "fairchild-kids-mode";

type KidsModeContextValue = {
  isKidsMode: boolean;
  setKidsMode: (value: boolean) => void;
};

const KidsModeContext = createContext<KidsModeContextValue>({
  isKidsMode: false,
  setKidsMode: () => {},
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

function KidsModeSync({ children }: { children: React.ReactNode }) {
  const { hasSession, authReady } = useMember();
  const { isKidsMode, setKidsMode } = useKidsMode();

  useEffect(() => {
    // Clear when logged out only (guests and members can use Kids Mode when signed in).
    if (!authReady) return;
    if (!hasSession && isKidsMode) {
      setKidsMode(false);
    }
  }, [authReady, hasSession, isKidsMode, setKidsMode]);

  return <>{children}</>;
}

export function KidsModeProvider({ children }: { children: React.ReactNode }) {
  const [isKidsMode, setIsKidsModeState] = useState(() =>
    typeof window !== "undefined" ? getStored() : false
  );

  useEffect(() => {
    setIsKidsModeState(getStored());
  }, []);

  const setKidsMode = useCallback((value: boolean) => {
    setIsKidsModeState(value);
    setStored(value);
  }, []);

  return (
    <KidsModeContext.Provider value={{ isKidsMode, setKidsMode }}>
      <KidsModeSync>{children}</KidsModeSync>
    </KidsModeContext.Provider>
  );
}

export function useKidsMode() {
  return useContext(KidsModeContext);
}
