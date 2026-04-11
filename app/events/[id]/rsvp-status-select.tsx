"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@/app/components/icons";

const STATUSES = ["Pending", "Accepted", "Declined"] as const;

export function RsvpStatusSelect({
  guestId,
  currentStatus,
}: {
  guestId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const StatusIcon =
    status === "Accepted"
      ? CheckCircleIcon
      : status === "Declined"
        ? XCircleIcon
        : ClockIcon;

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, rsvp_status: newStatus }),
      });

      if (!res.ok) {
        setStatus(currentStatus);
      } else {
        router.refresh();
      }
    } catch {
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
      <StatusIcon className="size-3.5" />
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="rounded-full border-none bg-transparent py-0 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
