"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TaskItem = {
  id: number;
  title: string;
  is_completed: boolean;
};

type Props = {
  eventId: number;
  initialTasks: TaskItem[];
};

export function TaskManager({ eventId, initialTasks }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<number[]>([]);

  const pendingSet = useMemo(() => new Set(pendingTaskIds), [pendingTaskIds]);
  const completedCount = useMemo(
    () => tasks.filter((task) => task.is_completed).length,
    [tasks]
  );
  const totalCount = tasks.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, title }),
      });

      const data = (await res.json()) as {
        id?: number;
        title?: string;
        is_completed?: boolean;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Failed to create task.");
      } else if (
        typeof data.id === "number" &&
        typeof data.title === "string" &&
        typeof data.is_completed === "boolean"
      ) {
        const createdTask: TaskItem = {
          id: data.id,
          title: data.title,
          is_completed: data.is_completed,
        };
        setTasks((current) => [...current, createdTask]);
        setTitle("");
        router.refresh();
      } else {
        setError("Task created but response was invalid.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleTask(task: TaskItem, checked: boolean) {
    setError(null);
    setPendingTaskIds((current) => [...current, task.id]);
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, is_completed: checked } : item
      )
    );

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: checked }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setTasks((current) =>
          current.map((item) =>
            item.id === task.id
              ? { ...item, is_completed: task.is_completed }
              : item
          )
        );
        setError(data.error ?? "Failed to update task.");
      } else {
        router.refresh();
      }
    } catch {
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, is_completed: task.is_completed } : item
        )
      );
      setError("Something went wrong. Please try again.");
    } finally {
      setPendingTaskIds((current) => current.filter((id) => id !== task.id));
    }
  }

  async function deleteTask(taskId: number) {
    setError(null);
    setPendingTaskIds((current) => [...current, taskId]);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to delete task.");
      } else {
        setTasks((current) => current.filter((t) => t.id !== taskId));
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPendingTaskIds((current) => current.filter((id) => id !== taskId));
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Preparation tasks
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add and complete tasks to keep event prep on track.
      </p>
      <div className="mt-4 space-y-2 rounded-xl border border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            Progress: {completedCount}/{totalCount} tasks
          </p>
          <p className="text-sm font-semibold text-primary">{progressPercent}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <form onSubmit={handleCreateTask} className="mt-5 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task title"
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add task"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {tasks.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground">
          No tasks yet. Add your first preparation task above.
        </p>
      ) : (
        <div className="mt-4 grid gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2"
            >
              <input
                type="checkbox"
                checked={task.is_completed}
                disabled={pendingSet.has(task.id)}
                onChange={(e) => toggleTask(task, e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span
                className={`flex-1 text-sm ${
                  task.is_completed
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {task.title}
              </span>
              <button
                type="button"
                disabled={pendingSet.has(task.id)}
                onClick={() => deleteTask(task.id)}
                className="rounded-full p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                title="Delete task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
