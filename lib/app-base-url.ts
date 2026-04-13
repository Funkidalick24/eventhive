function getConfiguredBaseOrigin() {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw) return null;

  const normalized = raw.replace(/\/+$/, "");

  try {
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

export function getAppOrigin(requestUrl: string) {
  const fallbackOrigin = new URL(requestUrl).origin;
  return getConfiguredBaseOrigin() ?? fallbackOrigin;
}
