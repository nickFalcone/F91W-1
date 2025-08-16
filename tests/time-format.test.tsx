import { formatTimeForDisplay, to12h } from "../src/logic/time";

describe("time formatting", () => {
  it("24-hour format includes leading zeros", () => {
    // 4:05 AM in 24h format should be "04:05"
    const morning = new Date("2023-01-01T04:05:00");
    expect(formatTimeForDisplay(morning, true)).toBe("04:05");

    // 4:05 PM in 24h format should be "16:05"
    const afternoon = new Date("2023-01-01T16:05:00");
    expect(formatTimeForDisplay(afternoon, true)).toBe("16:05");
  });

  it("12-hour format omits leading zeros for hours", () => {
    // 4:05 AM in 12h format should be "4:05 AM" (no leading zero)
    const morning = new Date("2023-01-01T04:05:00");
    expect(formatTimeForDisplay(morning, false)).toBe("4:05 AM");

    // 4:05 PM in 12h format should be "4:05 PM" (no leading zero)
    const afternoon = new Date("2023-01-01T16:05:00");
    expect(formatTimeForDisplay(afternoon, false)).toBe("4:05 PM");

    // 12:05 AM/PM should still show as "12" (not "0")
    const noon = new Date("2023-01-01T12:05:00");
    const midnight = new Date("2023-01-01T00:05:00");
    expect(formatTimeForDisplay(noon, false)).toBe("12:05 PM");
    expect(formatTimeForDisplay(midnight, false)).toBe("12:05 AM");
  });

  it("12/24 hour conversion works correctly", () => {
    expect(to12h(0)).toEqual({ hour12: 12, suffix: "AM" });
    expect(to12h(12)).toEqual({ hour12: 12, suffix: "PM" });
    expect(to12h(13)).toEqual({ hour12: 1, suffix: "PM" });
    expect(to12h(23)).toEqual({ hour12: 11, suffix: "PM" });
  });
});
