import { memo } from "react";
import { useWatchStore } from "../logic/watchStore";

export const StatusPanel = memo(function StatusPanel() {
  const mode = useWatchStore((s) => s.mode);
  const is24h = useWatchStore((s) => s.settings.is24h);
  const alarmEnabled = useWatchStore((s) => s.alarm.enabled);
  const signalEnabled = useWatchStore((s) => s.signalEnabled);
  const sw = useWatchStore((s) => s.stopwatch);

  return (
    <section aria-label="Status" style={{ fontSize: 14, lineHeight: 1.4 }}>
      <h3 style={{ marginTop: 0 }}>Status</h3>
      <div>
        Mode: <b>{mode}</b>
      </div>
      <div>
        Time format: <b>{is24h ? "24h" : "12h"}</b>
      </div>
      <div>
        Alarm: <b>{alarmEnabled ? "On" : "Off"}</b>
      </div>
      <div>
        Hourly signal: <b>{signalEnabled ? "On" : "Off"}</b>
      </div>
      <div>
        Stopwatch: <b>{sw.running ? "Running" : "Stopped"}</b> • {sw.display}
      </div>
    </section>
  );
});
