export type ScheduleCard = {
  time: string;
  title: string;
  details: string;
};

const SCHEDULE_PREFIX = "eventhive:schedule:v1:";

function normalizeCard(input: Partial<ScheduleCard>): ScheduleCard | null {
  const time = String(input.time ?? "").trim();
  const title = String(input.title ?? "").trim();
  const details = String(input.details ?? "").trim();

  if (!time && !title && !details) return null;

  return { time, title, details };
}

function parsePlainTextSchedule(raw: string): ScheduleCard[] {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const withHyphen = line.match(/^(.+?)\s*[-–]\s+(.+)$/);
      if (withHyphen) {
        return normalizeCard({ time: withHyphen[1], title: withHyphen[2] });
      }

      const withTime = line.match(/^(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s+(.+)$/);
      if (withTime) {
        return normalizeCard({ time: withTime[1], title: withTime[2] });
      }

      return normalizeCard({ title: line });
    })
    .filter((card): card is ScheduleCard => card !== null);
}

function parseStructuredSchedule(value: string): ScheduleCard[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => (typeof item === "object" && item ? normalizeCard(item as Partial<ScheduleCard>) : null))
      .filter((card): card is ScheduleCard => card !== null);
  } catch {
    return [];
  }
}

export function serializeScheduleCards(cards: ScheduleCard[]): string | null {
  const normalized = cards
    .map((card) => normalizeCard(card))
    .filter((card): card is ScheduleCard => card !== null)
    .filter((card) => !!card.time || !!card.title);

  if (normalized.length === 0) return null;

  return `${SCHEDULE_PREFIX}${JSON.stringify(normalized)}`;
}

export function parseScheduleCardsForEditor(raw: string | null | undefined): ScheduleCard[] {
  if (!raw?.trim()) return [{ time: "", title: "", details: "" }];

  const trimmed = raw.trim();
  const structured = trimmed.startsWith(SCHEDULE_PREFIX)
    ? parseStructuredSchedule(trimmed.slice(SCHEDULE_PREFIX.length))
    : parseStructuredSchedule(trimmed);

  if (structured.length > 0) return structured;

  const plain = parsePlainTextSchedule(trimmed);
  return plain.length > 0 ? plain : [{ time: "", title: "", details: "" }];
}

export function parseScheduleCardsForDisplay(raw: string | null | undefined): {
  cards: ScheduleCard[];
  fallbackText: string | null;
} {
  if (!raw?.trim()) {
    return { cards: [], fallbackText: null };
  }

  const trimmed = raw.trim();
  const structured = trimmed.startsWith(SCHEDULE_PREFIX)
    ? parseStructuredSchedule(trimmed.slice(SCHEDULE_PREFIX.length))
    : parseStructuredSchedule(trimmed);

  if (structured.length > 0) {
    return { cards: structured, fallbackText: null };
  }

  return { cards: [], fallbackText: raw };
}
