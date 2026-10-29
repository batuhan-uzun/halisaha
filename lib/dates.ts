const TZ = "Europe/Istanbul";
export const WINDOW_DAYS = 30;

export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function windowDays(): string[] {
  const start = todayIso();
  return Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(start, i));
}

// Tarihler gun olarak tutulur; ogle saati UTC kullanmak saat dilimi kaymasini onler.
function noon(iso: string) {
  return new Date(`${iso}T12:00:00Z`);
}

function part(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", ...opts }).format(noon(iso));
}

export const fmt = {
  weekdayShort: (iso: string) => part(iso, { weekday: "short" }),
  weekdayLong: (iso: string) => part(iso, { weekday: "long" }),
  monthShort: (iso: string) => part(iso, { month: "short" }),
  monthLong: (iso: string) => part(iso, { month: "long" }),
  day: (iso: string) => String(Number(iso.slice(8, 10))),
  full: (iso: string) => part(iso, { day: "numeric", month: "long", weekday: "long" }),
  short: (iso: string) => part(iso, { day: "numeric", month: "short", weekday: "short" }),
};

/** Pazartesi = 0 ... Pazar = 6 */
export function weekdayIndex(iso: string): number {
  return (noon(iso).getUTCDay() + 6) % 7;
}

export function hhmm(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : "";
}

export function daysUntil(iso: string): number {
  return Math.round((noon(iso).getTime() - noon(todayIso()).getTime()) / 86_400_000);
}
