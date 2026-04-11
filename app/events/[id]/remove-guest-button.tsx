"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon, XCircleIcon } from "@/app/components/icons";

export function RemoveGuestButton({ guestId }: { guestId: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/guests?guestId=${guestId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silent – row stays visible so user can retry
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground transition hover:brightness-95 disabled:opacity-50"
        >
          <TrashIcon className="size-3.5" />
          {loading ? "Removing…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
        >
          <XCircleIcon className="size-3.5" />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-3 py-1 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
      title="Remove guest"
    >
      <TrashIcon className="size-3.5" />
      Remove
    </button>
  );
}
