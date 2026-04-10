import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sanitizeEmail,
  sanitizeInteger,
  sanitizeString,
  safeJsonObject,
} from "@/lib/sanitize";

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
  const eventId = sanitizeInteger(searchParams.get("eventId"));

  if (eventId === null) {
    return NextResponse.json(
      { error: "eventId query param is required" },
      { status: 400 }
    );
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organizer_id !== payload.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const guests = await prisma.guest.findMany({
    where: { event_id: eventId },
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

  const body = await safeJsonObject(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const eventId = sanitizeInteger(body.event_id);
  const name = sanitizeString(body.name, { maxLength: 120 });
  const email = sanitizeEmail(body.email);

  if (eventId === null || !name || !email) {
    return NextResponse.json(
      { error: "event_id, name, and email are required" },
      { status: 400 }
    );
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const guest = await prisma.guest.create({
    data: {
      event_id: eventId,
      name,
      email,
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
  const guestId = sanitizeInteger(searchParams.get("guestId"));

  if (guestId === null) {
    return NextResponse.json(
      { error: "guestId query param is required" },
      { status: 400 }
    );
  }

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
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

const VALID_RSVP_STATUSES = ["Accepted", "Declined", "Pending"];

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await safeJsonObject(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const guestId = sanitizeInteger(body.guestId);
  const rsvpStatus = sanitizeString(body.rsvp_status, { maxLength: 20 });

  if (guestId === null) {
    return NextResponse.json(
      { error: "guestId is required" },
      { status: 400 }
    );
  }

  if (!VALID_RSVP_STATUSES.includes(rsvpStatus)) {
    return NextResponse.json(
      { error: "rsvp_status must be Accepted, Declined, or Pending" },
      { status: 400 }
    );
  }

  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
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

  const updatedGuest = await prisma.guest.update({
    where: { id: guestId },
    data: { rsvp_status: rsvpStatus },
  });

  return NextResponse.json(updatedGuest);
}
