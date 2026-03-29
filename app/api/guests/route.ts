import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "eventhive_session";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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
  const eventId = searchParams.get("eventId");

  if (!eventId || isNaN(Number(eventId))) {
    return NextResponse.json(
      { error: "eventId query param is required" },
      { status: 400 }
    );
  }

  const event = await prisma.event.findUnique({ where: { id: Number(eventId) } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organizer_id !== payload.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const guests = await prisma.guest.findMany({
    where: { event_id: Number(eventId) },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json(guests);
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

  const event = await prisma.event.findUnique({ where: { id: Number(event_id) } });
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

  const guest = await prisma.guest.create({
    data: {
      event_id: Number(event_id),
      name: name.trim(),
      email: email.trim(),
    },
  });

  return NextResponse.json({ id: guest.id, rsvp_status: guest.rsvp_status }, { status: 201 });
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

  const guest = await prisma.guest.findUnique({ where: { id: Number(guestId) } });
  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  const event = await prisma.event.findUnique({ where: { id: guest.event_id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organizer_id !== payload.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.guest.delete({ where: { id: guest.id } });
  return NextResponse.json({ success: true });
}
