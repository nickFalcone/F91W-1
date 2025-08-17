import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeNowString, formatTimeForDisplay, getDayOfWeek } from "./time";

export type Mode = "time" | "alarm" | "stopwatch";

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

        // Light button works in all modes
        if (key === "L") {
          // Turn light on while button is pressed (handled in UI)
          set({ lightOn: true });

          // In stopwatch mode, reset the stopwatch if it's stopped
          if (state.mode === "stopwatch" && !state.stopwatch.running) {
            set({
              stopwatch: {
                running: false,
                startMs: null,
                elapsedMs: 0,
                display: "00:00.00",
              },
            });
          }
          // Handle split if running (not implemented yet)
          else if (state.mode === "stopwatch" && state.stopwatch.running) {
            // split functionality would go here
          }
        }

        // Mode button cycles through modes
        if (key === "C") {
          // Cycle through modes: time -> alarm -> stopwatch -> time
          if (state.mode === "time") {
            set({ mode: "alarm" });
          } else if (state.mode === "alarm") {
            set({ mode: "stopwatch" });
          } else if (state.mode === "stopwatch") {
            // Reset stopwatch when exiting stopwatch mode
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
        }

        // A button functionality depends on mode
        if (key === "A") {
          if (state.mode === "time") {
            // Toggle 12/24 hour format in time mode
            set({
              settings: { ...state.settings, is24h: !state.settings.is24h },
            });
          } else if (state.mode === "alarm") {
            // Toggle alarm on/off in alarm mode
            set({
              alarm: { ...state.alarm, enabled: !state.alarm.enabled },
            });
          } else if (state.mode === "stopwatch") {
            // Start/stop stopwatch in stopwatch mode
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
