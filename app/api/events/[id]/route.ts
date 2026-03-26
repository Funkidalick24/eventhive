import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";

const SESSION_COOKIE = "eventhive_session";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await authenticate();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = Number(id);
  if (isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const event = getEventById(eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organizer_id !== payload.sub) {
    return NextResponse.json(
      { error: "Only the event owner can edit this event" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, date, location, description } = body as Record<string, string>;

  if (!name?.trim() || !date?.trim()) {
    return NextResponse.json(
      { error: "Name and date are required" },
      { status: 400 }
    );
  }

  updateEvent(eventId, {
    name: name.trim(),
    date: date.trim(),
    location: location?.trim() || undefined,
    description: description?.trim() || undefined,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await authenticate();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = Number(id);
  if (isNaN(eventId)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const event = getEventById(eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organizer_id !== payload.sub) {
    return NextResponse.json(
      { error: "Only the event owner can delete this event" },
      { status: 403 }
    );
  }

  deleteEvent(eventId);

  return NextResponse.json({ success: true });
}
