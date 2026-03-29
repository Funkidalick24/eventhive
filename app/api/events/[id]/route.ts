import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeHHMM, normalizeYYYYMMDD } from "@/lib/date";

const SESSION_COOKIE = "eventhive_session";
export const runtime = "nodejs";

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

  const event = await prisma.event.findUnique({ where: { id: eventId } });
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
  const { name, date, time, location, description, schedule } = body as Record<
    string,
    string
  >;

  const normalizedDate = date ? normalizeYYYYMMDD(date) : null;
  const normalizedTime = time ? normalizeHHMM(time) : null;

  if (!name?.trim() || !normalizedDate) {
    return NextResponse.json(
      { error: "Name and valid date are required" },
      { status: 400 }
    );
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: name.trim(),
      date: normalizedDate,
      time: normalizedTime,
      location: location?.trim() || null,
      description: description?.trim() || null,
      schedule: schedule?.trim() || null,
    },
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

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organizer_id !== payload.sub) {
    return NextResponse.json(
      { error: "Only the event owner can delete this event" },
      { status: 403 }
    );
  }

  await prisma.event.delete({ where: { id: eventId } });

  return NextResponse.json({ success: true });
}
