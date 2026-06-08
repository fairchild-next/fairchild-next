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
const CHILD_KEY = "fairchild-kids-active-child";

export type ChildProfile = {
  id: string;
  name: string;
  avatar_emoji: string;
};

type KidsModeContextValue = {
  isKidsMode: boolean;
  setKidsMode: (value: boolean) => void;
  /** The currently active child profile, or null if no child is selected (parent/legacy mode). */
  activeChild: ChildProfile | null;
  setActiveChild: (child: ChildProfile | null) => void;
};

const KidsModeContext = createContext<KidsModeContextValue>({
  isKidsMode: false,
  setKidsMode: () => {},
  activeChild: null,
  setActiveChild: () => {},
});

function getStoredBool(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setStoredBool(value: boolean) {
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

function getStoredChild(): ChildProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHILD_KEY);
    return raw ? (JSON.parse(raw) as ChildProfile) : null;
  } catch {
    return null;
  }
}

function setStoredChild(child: ChildProfile | null) {
  try {
    if (child) {
      localStorage.setItem(CHILD_KEY, JSON.stringify(child));
    } else {
      localStorage.removeItem(CHILD_KEY);
    }
  } catch {
    // ignore
  }
}

function KidsModeSync({ children }: { children: React.ReactNode }) {
  const { hasSession, authReady } = useMember();
  const { isKidsMode, setKidsMode, setActiveChild } = useKidsMode();

  useEffect(() => {
    if (!authReady) return;
    if (!hasSession && isKidsMode) {
      setKidsMode(false);
      setActiveChild(null);
    }
  }, [authReady, hasSession, isKidsMode, setKidsMode, setActiveChild]);

  return <>{children}</>;
}

export function KidsModeProvider({ children }: { children: React.ReactNode }) {
  const [isKidsMode, setIsKidsModeState] = useState(() =>
    typeof window !== "undefined" ? getStoredBool() : false
  );
  const [activeChild, setActiveChildState] = useState<ChildProfile | null>(() =>
    typeof window !== "undefined" ? getStoredChild() : null
  );

  useEffect(() => {
    setIsKidsModeState(getStoredBool());
    setActiveChildState(getStoredChild());
  }, []);

  const setKidsMode = useCallback((value: boolean) => {
    setIsKidsModeState(value);
    setStoredBool(value);
    // Clear active child when exiting Kids Mode
    if (!value) {
      setActiveChildState(null);
      setStoredChild(null);
    }
  }, []);

  const setActiveChild = useCallback((child: ChildProfile | null) => {
    setActiveChildState(child);
    setStoredChild(child);
  }, []);

  return (
    <KidsModeContext.Provider value={{ isKidsMode, setKidsMode, activeChild, setActiveChild }}>
      <KidsModeSync>{children}</KidsModeSync>
    </KidsModeContext.Provider>
  );
}

export function useKidsMode() {
  return useContext(KidsModeContext);
}
