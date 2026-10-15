const TZ = "Asia/Tokyo";

// "2026-10-15" を、日本時間の0時の Date にする
const toDate = (eventDate: string) => new Date(`${eventDate}T00:00:00+09:00`);

// 月を英語表記の3文字
export const formatMonthEn = (eventDate: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", timeZone: TZ }).format(toDate(eventDate));

// 日にち
export const formatDay = (eventDate: string) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: TZ }).format(toDate(eventDate));

// 曜日
export const formatWeekdayJa = (eventDate: string) =>
  new Intl.DateTimeFormat("ja-JP", { weekday: "long", timeZone: TZ }).format(toDate(eventDate));

// 時刻14:00:00で帰ってきても先頭5文字のみ表示
export const formatTimeRange = (start: string, end: string) =>
  `${start.slice(0, 5)} – ${end.slice(0, 5)}`;

// YYYY-MM-DD(Week)
export function formatDateJa(iso: string): string {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(new Date(iso));

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}年${get("month")}月${get("day")}日(${get("weekday")})`;
}