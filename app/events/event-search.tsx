"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { SearchIcon } from "../components/icons";

type EventSearchProps = {
  organizers: Array<{ id: number; name: string }>;
};

export function EventSearch({ organizers }: EventSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const query = searchParams.get("q") ?? "";
  const when = searchParams.get("when") ?? "all";
  const date = searchParams.get("date") ?? "";
  const location = searchParams.get("location") ?? "";
  const organizer = searchParams.get("organizer") ?? "";
  const organizerQ = searchParams.get("organizerQ") ?? "";
  const hasTime = searchParams.get("hasTime") === "1";
  const sort = searchParams.get("sort") ?? "soonest";
  const selectedOrganizer = organizers.find((item) => String(item.id) === organizer) ?? null;
  const [isOrganizerMenuOpen, setIsOrganizerMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const organizerInput = organizerQ || selectedOrganizer?.name || "";

  function updateParams(mutator: (params: URLSearchParams) => void) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      mutator(params);
      const nextQuery = params.toString();
      router.replace(nextQuery ? `/events?${nextQuery}` : "/events");
    });
  }

  const filteredOrganizers = useMemo(() => {
    const normalized = organizerInput.trim().toLowerCase();
    if (!normalized) return organizers.slice(0, 8);
    return organizers
      .filter((item) => item.name.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [organizerInput, organizers]);

  function handleChange(value: string) {
    updateParams((params) => {
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm md:p-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="h-8 rounded-md border border-input bg-background px-3 text-xs font-medium transition hover:bg-muted"
            >
              {isExpanded ? "Collapse filters" : "Expand filters"}
            </button>
          </div>
          <label
            className={`relative w-full text-sm transition-all duration-800 ${isExpanded ? "mx-auto max-w-xl" : "mr-auto max-w-xl"}`}
          >
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search events by name..."
              className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>
        </div>

        <div
          className={`overflow-hidden transition-all duration-800 ${isExpanded ? "max-h-[650px] opacity-100" : "max-h-0 opacity-0"}`}
          aria-hidden={!isExpanded}
        >
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">When</span>
                <select
                  value={when}
                  onChange={(e) =>
                    updateParams((params) => {
                      const value = e.target.value;
                      if (value === "all") {
                        params.delete("when");
                      } else {
                        params.set("when", value);
                      }
                      params.delete("date");
                    })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All upcoming</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Specific date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    updateParams((params) => {
                      const value = e.target.value;
                      if (value) {
                        params.set("date", value);
                        params.delete("when");
                      } else {
                        params.delete("date");
                      }
                    })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Location</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    updateParams((params) => {
                      const value = e.target.value.trim();
                      if (value) {
                        params.set("location", value);
                      } else {
                        params.delete("location");
                      }
                    })
                  }
                  placeholder="City or venue"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Organizer</span>
                <div className="relative">
                  <input
                    type="text"
                    value={organizerInput}
                    onFocus={() => setIsOrganizerMenuOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setIsOrganizerMenuOpen(false), 120);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setIsOrganizerMenuOpen(true);
                      updateParams((params) => {
                        if (value.trim()) {
                          params.set("organizerQ", value.trim());
                        } else {
                          params.delete("organizerQ");
                        }
                        params.delete("organizer");
                      });
                    }}
                    placeholder="Search organizer"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    role="combobox"
                    aria-expanded={isOrganizerMenuOpen}
                    aria-controls="organizer-filter-options"
                  />
                  {isOrganizerMenuOpen && (
                    <div
                      id="organizer-filter-options"
                      className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
                    >
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setIsOrganizerMenuOpen(false);
                          updateParams((params) => {
                            params.delete("organizer");
                            params.delete("organizerQ");
                          });
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        All organizers
                      </button>
                      {filteredOrganizers.length > 0 ? (
                        filteredOrganizers.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setIsOrganizerMenuOpen(false);
                              updateParams((params) => {
                                params.set("organizer", String(item.id));
                                params.set("organizerQ", item.name);
                              });
                            }}
                            className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            {item.name}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-muted-foreground">No organizers found.</p>
                      )}
                    </div>
                  )}
                </div>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Sort</span>
                <select
                  value={sort}
                  onChange={(e) =>
                    updateParams((params) => {
                      const value = e.target.value;
                      if (value === "soonest") {
                        params.delete("sort");
                      } else {
                        params.set("sort", value);
                      }
                    })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="soonest">Soonest first</option>
                  <option value="latest">Latest first</option>
                  <option value="az">A to Z</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm">
                <input
                  type="checkbox"
                  checked={hasTime}
                  onChange={(e) =>
                    updateParams((params) => {
                      if (e.target.checked) {
                        params.set("hasTime", "1");
                      } else {
                        params.delete("hasTime");
                      }
                    })
                  }
                  className="size-4 rounded border-input"
                />
                Has start time
              </label>
              <button
                type="button"
                onClick={() =>
                  updateParams((params) => {
                    params.delete("q");
                    params.delete("when");
                    params.delete("date");
                    params.delete("location");
                    params.delete("organizer");
                    params.delete("organizerQ");
                    params.delete("hasTime");
                    params.delete("sort");
                    params.delete("page");
                  })
                }
                className="h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium transition hover:bg-muted"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
