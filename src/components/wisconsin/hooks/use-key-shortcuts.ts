"use client";
import { useEffect } from "react";

export function useKeyShortcuts(enabled: boolean, onKey: (key: string) => void) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => onKey(e.key);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onKey]);
}
