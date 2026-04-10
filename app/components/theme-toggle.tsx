"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";

type Theme = "light" | "dark";

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem("theme");
  return value === "light" || value === "dark" ? value : null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  window.localStorage.setItem("theme", theme);
}

function applyThemeWithoutPersist(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

function getResolvedTheme(): Theme {
  const stored = getStoredTheme();
  return stored ?? getSystemTheme();
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getResolvedTheme());

  useEffect(() => {
    const resolved = getResolvedTheme();
    applyThemeWithoutPersist(resolved);

    const stored = getStoredTheme();
    if (stored) return;

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const handler = () => {
      const next = getSystemTheme();
      applyThemeWithoutPersist(next);
      setTheme(next);
    };
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const next: Theme = isDark ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-muted"
    >
      {isDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
    </button>
  );
}

