"use client";

import { useState } from "react";
interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
}

export default function EditEventForm({ event }: { event: Event }) {
  const [form, setForm] = useState(event);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch(`/api/events/${event.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Updated!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="title" value={form.title} onChange={handleChange} />
      <input name="location" value={form.location} onChange={handleChange} />
      <input type="datetime-local" name="date" value={form.date} onChange={handleChange} />
      <textarea name="description" value={form.description} onChange={handleChange} />
      
      <button type="submit">Save Changes</button>
    </form>
  );
}

"use client";

export function DeleteEventButton({ id }: { id: string }) {
  const handleDelete = async () => {
    const confirmed = confirm("Are you sure?");
    if (!confirmed) return;

    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Deleted");
      location.reload(); // quick UI update
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}

