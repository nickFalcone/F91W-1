import { getDisplayParts } from "../src/logic/time";

describe("watch display parts", () => {
  it("provides correct display parts for 24-hour mode", () => {
    const date = new Date("2023-01-01T16:05:30");
    const parts = getDisplayParts(date, true);

    expect(parts.hours).toBe(16);
    expect(parts.minutes).toBe(5);
    expect(parts.seconds).toBe(30);
    expect(parts.ampm).toBe("");
    expect(parts.day).toBe("SU");
    expect(parts.date).toBe(1);
  });

  it("provides correct display parts for 12-hour mode", () => {
    const date = new Date("2023-01-01T16:05:30");
    const parts = getDisplayParts(date, false);

    expect(parts.hours).toBe(4);
    expect(parts.minutes).toBe(5);
    expect(parts.seconds).toBe(30);
    expect(parts.ampm).toBe("PM");
    expect(parts.day).toBe("SU");
    expect(parts.date).toBe(1);
  });

  it("handles midnight and noon correctly", () => {
    const midnight = new Date("2023-01-01T00:05:30");
    const noon = new Date("2023-01-01T12:05:30");

    const midnightParts = getDisplayParts(midnight, false);
    expect(midnightParts.hours).toBe(12);
    expect(midnightParts.ampm).toBe("AM");

    const noonParts = getDisplayParts(noon, false);
    expect(noonParts.hours).toBe(12);
    expect(noonParts.ampm).toBe("PM");
  });

  it("handles single-digit hours correctly in 12-hour mode", () => {
    const morning = new Date("2023-01-01T04:05:30");
    const evening = new Date("2023-01-01T16:05:30");

    const morningParts = getDisplayParts(morning, false);
    expect(morningParts.hours).toBe(4);
    expect(morningParts.ampm).toBe("AM");

    const eveningParts = getDisplayParts(evening, false);
    expect(eveningParts.hours).toBe(4);
    expect(eveningParts.ampm).toBe("PM");
  });
});
