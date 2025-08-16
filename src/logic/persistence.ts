import { WatchState } from "./watchStore";

const KEY = "f91w-store";

export function loadFromStorage(): Partial<WatchState> | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw).state as Partial<WatchState>;
  } catch {
    return null;
  }
}

export function saveToStorage(state: Partial<WatchState>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ state }));
  } catch {
    // ignore
  }
}
