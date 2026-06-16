import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "net-prep-theme";

function getInitial(): Theme {
  const saved = localStorage.getItem(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

let theme: Theme = typeof window !== "undefined" ? getInitial() : "light";
const listeners = new Set<() => void>();

function apply() {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

if (typeof window !== "undefined") apply();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function setTheme(next: Theme) {
  theme = next;
  localStorage.setItem(KEY, next);
  apply();
  for (const l of listeners) l();
}

export function toggleTheme() {
  setTheme(theme === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => theme,
    () => "light" as Theme
  );
}
