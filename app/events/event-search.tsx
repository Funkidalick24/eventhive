"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SearchIcon } from "../components/icons";

export function EventSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const query = searchParams.get("q") ?? "";

  function handleChange(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/events?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search events by name..."
        className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );
}
