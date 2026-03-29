import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocalDateYYYYMMDD, normalizeHHMM, normalizeYYYYMMDD } from "@/lib/date";

const SESSION_COOKIE = "eventhive_session";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizerId = searchParams.get("organizerId");
  const today = getLocalDateYYYYMMDD();

  await prisma.event.deleteMany({ where: { date: { lt: today } } });

  if (organizerId && !isNaN(Number(organizerId))) {
    const events = await prisma.event.findMany({
      where: { organizer_id: Number(organizerId), date: { gte: today } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  }

  const events = await prisma.event.findMany({
    where: { date: { gte: today } },
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

  const event = await prisma.event.create({
    data: {
      name: name.trim(),
      date: normalizedDate,
      time: normalizedTime,
      location: location?.trim() || null,
      description: description?.trim() || null,
      schedule: schedule?.trim() || null,
      organizer_id: payload.sub,
    },
  });

  return NextResponse.json({ id: event.id }, { status: 201 });
}
