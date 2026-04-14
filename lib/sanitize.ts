type SanitizeStringOptions = {
  trim?: boolean;
  toLowerCase?: boolean;
  maxLength?: number;
};

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeString(
  value: unknown,
  options: SanitizeStringOptions = {},
) {
  const { trim = true, toLowerCase = false, maxLength } = options;

  let next = typeof value === "string" ? value : "";
  next = next.normalize("NFKC").replace(CONTROL_CHARS_REGEX, "");

  if (trim) {
    next = next.trim();
  }

  if (toLowerCase) {
    next = next.toLowerCase();
  }

  if (typeof maxLength === "number" && maxLength >= 0) {
    next = next.slice(0, maxLength);
  }

  return next;
}

export function sanitizeOptionalString(
  value: unknown,
  options: SanitizeStringOptions = {},
) {
  const sanitized = sanitizeString(value, options);
  return sanitized.length > 0 ? sanitized : null;
}

export function sanitizeEmail(value: unknown) {
  return sanitizeString(value, { trim: true, toLowerCase: true, maxLength: 254 });
}

export function sanitizeInteger(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : null;
  }

  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : null;
  }

  const normalized = sanitizeString(value, { trim: true, maxLength: 20 });
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export async function safeJsonObject(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
