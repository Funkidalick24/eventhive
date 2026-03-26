import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { addGuest, getGuestsByEventId, getEventById, deleteGuest } from "@/lib/db";

const SESSION_COOKIE = "eventhive_session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId || isNaN(Number(eventId))) {
    return NextResponse.json(
      { error: "eventId query param is required" },
      { status: 400 }
    );
  }

  return NextResponse.json(getGuestsByEventId(Number(eventId)));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { event_id, name, email } = body as Record<string, string>;

  if (!event_id || !name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "event_id, name, and email are required" },
      { status: 400 }
    );
  }

  const event = getEventById(Number(event_id));
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const id = addGuest({
    event_id: Number(event_id),
    name: name.trim(),
    email: email.trim(),
  });

  return NextResponse.json({ id, rsvp_status: "Pending" }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get("guestId");

  if (!guestId || isNaN(Number(guestId))) {
    return NextResponse.json(
      { error: "guestId query param is required" },
      { status: 400 }
    );
  }

  deleteGuest(Number(guestId));
  return NextResponse.json({ success: true });
}
