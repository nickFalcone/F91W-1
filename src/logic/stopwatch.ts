export interface StopwatchCoreState {
  running: boolean;
  startMs: number | null;
  elapsedMs: number;
}

export function startStopwatch(
  state: StopwatchCoreState,
  now: number
): StopwatchCoreState {
  if (state.running) return state;
  return { ...state, running: true, startMs: now };
}

export function stopStopwatch(
  state: StopwatchCoreState,
  now: number
): StopwatchCoreState {
  if (!state.running) return state;
  const elapsed =
    state.elapsedMs + (state.startMs != null ? now - state.startMs : 0);
  return { running: false, startMs: null, elapsedMs: elapsed };
}

export function resetStopwatch(): StopwatchCoreState {
  return { running: false, startMs: null, elapsedMs: 0 };
}
