import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalDateYYYYMMDD, normalizeHHMM, normalizeYYYYMMDD } from "@/lib/date";
import {
  sanitizeInteger,
  sanitizeOptionalString,
  sanitizeString,
  safeJsonObject,
} from "@/lib/sanitize";

const SESSION_COOKIE = "eventhive_session";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizerId = sanitizeInteger(searchParams.get("organizerId"));
  const q = sanitizeOptionalString(searchParams.get("q"), { maxLength: 120 });
  const today = getLocalDateYYYYMMDD();

  await prisma.event.deleteMany({ where: { date: { lt: today } } });

  const nameFilter = q
    ? { name: { contains: q, mode: "insensitive" as const } }
    : {};

  if (organizerId !== null) {
    const events = await prisma.event.findMany({
      where: { organizer_id: organizerId, date: { gte: today }, ...nameFilter },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  }

  const events = await prisma.event.findMany({
    where: { date: { gte: today }, ...nameFilter },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
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

  const name = sanitizeString(body.name, { maxLength: 160 });
  const date = sanitizeString(body.date, { maxLength: 20 });
  const time = sanitizeOptionalString(body.time, { maxLength: 20 });
  const location = sanitizeOptionalString(body.location, { maxLength: 180 });
  const description = sanitizeOptionalString(body.description, { maxLength: 2000 });
  const schedule = sanitizeOptionalString(body.schedule, { maxLength: 12000 });

  const normalizedDate = date ? normalizeYYYYMMDD(date) : null;
  const normalizedTime = time ? normalizeHHMM(time) : null;

  if (!name || !normalizedDate) {
    return NextResponse.json(
      { error: "Name and valid date are required" },
      { status: 400 }
    );
  }

  const event = await prisma.event.create({
    data: {
      name,
      date: normalizedDate,
      time: normalizedTime,
      location,
      description,
      schedule,
      organizer_id: payload.sub,
    },
  });

  return NextResponse.json({ id: event.id }, { status: 201 });
}
