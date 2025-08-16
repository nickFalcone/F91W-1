export function to12h(hours24: number): {
  hour12: number;
  suffix: "AM" | "PM";
} {
  const suffix = hours24 >= 12 ? "PM" : "AM";
  let h = hours24 % 12;
  if (h === 0) h = 12;
  return { hour12: h, suffix };
}

export function formatTimeForDisplay(date: Date, is24h: boolean): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  if (is24h) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }
  const { hour12, suffix } = to12h(hours);
  return `${String(hour12)}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
export function getDayOfWeek(date: Date = new Date()): (typeof days)[number] {
  return days[date.getDay()];
}

export function computeNowString(is24h: boolean): string {
  return formatTimeForDisplay(new Date(), is24h);
}

export type DisplayParts = {
  hours: number;
  minutes: number;
  seconds: number;
  ampm: "AM" | "PM" | "";
  day: string; // SU..SA
  date: number; // 1..31
};

export function getDisplayParts(date: Date, is24h: boolean): DisplayParts {
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const { hour12, suffix } = to12h(hours24);
  return {
    hours: is24h ? hours24 : hour12,
    minutes,
    seconds,
    ampm: is24h ? ("" as const) : suffix,
    day: getDayOfWeek(date),
    date: date.getDate(),
  };
}
