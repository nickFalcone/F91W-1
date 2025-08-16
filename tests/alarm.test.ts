import { willTriggerNow, shouldHourlyChime } from "../src/logic/alarm";

it("alarm triggers at exact minute change", () => {
  const prev = new Date("2023-01-01T06:59:59.000Z");
  const now = new Date("2023-01-01T07:00:00.000Z");
  const cfg = { enabled: true, hour: 7, minute: 0 };
  expect(willTriggerNow(prev, now, cfg)).toBe(true);
});

it("hourly chime at hour boundary when enabled", () => {
  const prev = new Date("2023-01-01T05:59:59.000Z");
  const now = new Date("2023-01-01T06:00:00.000Z");
  expect(shouldHourlyChime(prev, now, true)).toBe(true);
});
