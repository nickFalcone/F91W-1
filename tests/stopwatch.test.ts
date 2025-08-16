import {
  startStopwatch,
  stopStopwatch,
  resetStopwatch,
} from "../src/logic/stopwatch";
import { formatStopwatch } from "../src/logic/watchStore";

describe("stopwatch core", () => {
  it("drift under 10ms over 10s simulated", () => {
    let s = resetStopwatch();
    s = startStopwatch(s, 0);
    s = stopStopwatch(s, 10000);
    const display = formatStopwatch(s.elapsedMs);
    expect(display).toBe("00:10.00");
  });
});
