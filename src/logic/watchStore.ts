import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeNowString, formatTimeForDisplay, getDayOfWeek } from "./time";

export type Mode = "time" | "alarm" | "stopwatch" | "set-time";

export type ButtonKey = "L" | "C" | "A";

export interface StopwatchState {
  running: boolean;
  startMs: number | null;
  elapsedMs: number; // accumulated
  display: string;
}

export interface AlarmState {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
}

export interface SettingsState {
  is24h: boolean;
}

export interface WatchState {
  mode: Mode;
  settings: SettingsState;
  alarm: AlarmState;
  signalEnabled: boolean;
  stopwatch: StopwatchState;
  renderedTime: string;
  lightOn: boolean;
  handleButton: (key: ButtonKey) => void;
}

const initialState: Omit<WatchState, "handleButton"> = {
  mode: "time",
  settings: { is24h: true },
  alarm: { enabled: false, hour: 7, minute: 0 },
  signalEnabled: false,
  stopwatch: {
    running: false,
    startMs: null,
    elapsedMs: 0,
    display: "00:00.00",
  },
  renderedTime: "",
  lightOn: false,
};

export const useWatchStore = create<WatchState>()(
  persist(
    (set, get) => ({
      ...initialState,
      handleButton: (key) => {
        const state = get();
        if (state.mode === "time") {
          if (key === "C") set({ mode: "stopwatch" });
          if (key === "A")
            set({
              settings: { ...state.settings, is24h: !state.settings.is24h },
            });
          if (key === "L") {
            // Turn light on while button is pressed (handled in UI)
            set({ lightOn: true });
          }
        } else if (state.mode === "stopwatch") {
          if (key === "A") {
            if (!state.stopwatch.running) {
              set({
                stopwatch: {
                  ...state.stopwatch,
                  running: true,
                  startMs: performance.now(),
                },
              });
            } else {
              const now = performance.now();
              const elapsed =
                state.stopwatch.elapsedMs +
                (state.stopwatch.startMs ? now - state.stopwatch.startMs : 0);
              set({
                stopwatch: {
                  running: false,
                  startMs: null,
                  elapsedMs: elapsed,
                  display: formatStopwatch(elapsed),
                },
              });
            }
          }
          if (key === "C") {
            set({
              stopwatch: {
                running: false,
                startMs: null,
                elapsedMs: 0,
                display: "00:00.00",
              },
              mode: "time",
            });
          }
          if (key === "L") {
            // Turn light on in stopwatch mode too
            set({ lightOn: true });
            // split not persisted yet
          }
        }
      },
    }),
    { name: "f91w-store" }
  )
);

export function initializeStore(saved: Partial<WatchState> | null) {
  if (!saved) return;
  useWatchStore.setState((s) => ({ ...s, ...saved }));
}

export function formatStopwatch(ms: number): string {
  const totalMs = Math.max(0, Math.floor(ms));
  const centi = Math.floor((totalMs % 1000) / 10);
  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}.${String(centi).padStart(2, "0")}`;
}

// tick for time display
let rafId = 0;
function tick() {
  const s = useWatchStore.getState();
  const now = new Date();
  const renderedTime = formatTimeForDisplay(now, s.settings.is24h);
  const sw = s.stopwatch;
  let display = sw.display;
  if (sw.running && sw.startMs != null) {
    const elapsed = sw.elapsedMs + (performance.now() - sw.startMs);
    display = formatStopwatch(elapsed);
  }
  useWatchStore.setState({ renderedTime, stopwatch: { ...sw, display } });
  rafId = requestAnimationFrame(tick);
}
if (typeof window !== "undefined") {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}
