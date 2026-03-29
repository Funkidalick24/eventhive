export function getLocalDateYYYYMMDD(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeYYYYMMDD(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed.slice(0, 10);
  return null;
}

export function parseYYYYMMDDToLocalDate(value: string): Date | null {
  const normalized = normalizeYYYYMMDD(value);
  if (!normalized) return null;
  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function normalizeHHMM(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  if (!/^\d{2}:\d{2}$/.test(trimmed)) return null;
  const [hours, minutes] = trimmed.split(":").map(Number);
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatHHMMToLocale(time: string, locale = "en-US"): string {
  const normalized = normalizeHHMM(time);
  if (!normalized) return time;
  const [hours, minutes] = normalized.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}
