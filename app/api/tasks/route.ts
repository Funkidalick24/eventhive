import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "eventhive_session";
export const runtime = "nodejs";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export async function GET(request: NextRequest) {
  const payload = await authenticate();
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

  const tasks = await prisma.task.findMany({
    where: { event_id: Number(eventId) },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const payload = await authenticate();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { event_id, title } = body as Record<string, unknown>;
  const parsedEventId = Number(event_id);

  if (!event_id || isNaN(parsedEventId)) {
    return NextResponse.json({ error: "event_id is required" }, { status: 400 });
  }

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: parsedEventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.organizer_id !== payload.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const task = await prisma.task.create({
    data: {
      event_id: parsedEventId,
      title: title.trim(),
    },
  });

  return NextResponse.json(task, { status: 201 });
}
