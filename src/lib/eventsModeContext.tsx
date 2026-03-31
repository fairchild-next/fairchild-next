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
import { useWeddingMode } from "@/lib/weddingModeContext";

const STORAGE_KEY = "fairchild-events-mode";

type EventsModeContextValue = {
  isEventsMode: boolean;
  setEventsMode: (value: boolean) => void;
};

const EventsModeContext = createContext<EventsModeContextValue>({
  isEventsMode: false,
  setEventsMode: () => {},
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

/** Clears when logged out; clears when Kids or Wedding mode is active. */
function EventsModeSync({ children }: { children: React.ReactNode }) {
  const { hasSession, authReady } = useMember();
  const { isKidsMode } = useKidsMode();
  const { isWeddingMode } = useWeddingMode();
  const { isEventsMode, setEventsMode } = useEventsMode();

  useEffect(() => {
    if (!authReady) return;
    if (!hasSession && isEventsMode) {
      setEventsMode(false);
    }
  }, [authReady, hasSession, isEventsMode, setEventsMode]);

  useEffect(() => {
    if (isKidsMode && isEventsMode) {
      setEventsMode(false);
    }
  }, [isKidsMode, isEventsMode, setEventsMode]);

  useEffect(() => {
    if (isWeddingMode && isEventsMode) {
      setEventsMode(false);
    }
  }, [isWeddingMode, isEventsMode, setEventsMode]);

  return <>{children}</>;
}

/**
 * Must be rendered inside KidsModeProvider and WeddingModeProvider so setters can clear other modes.
 */
export function EventsModeProvider({ children }: { children: React.ReactNode }) {
  const { setKidsMode } = useKidsMode();
  const { setWeddingMode } = useWeddingMode();
  const [isEventsMode, setEventsState] = useState(() =>
    typeof window !== "undefined" ? getStored() : false
  );

  useEffect(() => {
    setEventsState(getStored());
  }, []);

  const setEventsMode = useCallback(
    (value: boolean) => {
      if (value) {
        setKidsMode(false);
        setWeddingMode(false);
      }
      setEventsState(value);
      setStored(value);
    },
    [setKidsMode, setWeddingMode]
  );

  return (
    <EventsModeContext.Provider value={{ isEventsMode, setEventsMode }}>
      <EventsModeSync>{children}</EventsModeSync>
    </EventsModeContext.Provider>
  );
}

export function useEventsMode() {
  return useContext(EventsModeContext);
}
