"use client";

import { useState } from "react";

interface CreateEventFormProps{
  userId: string;
}

export default function CreateEventForm({ userId }: CreateEventFormProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({ ...form, userId }),
    });

    if (res.ok) {
      alert("Event created!");
      setForm({ title: "", description: "", location: "", date: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="title" placeholder="Title" onChange={handleChange} value={form.title} required />
      <input name="location" placeholder="Location" onChange={handleChange} value={form.location} />
      <input type="datetime-local" name="date" onChange={handleChange} value={form.date} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} value={form.description} />
      
      <button type="submit">Create Event</button>
    </form>
  );
}
