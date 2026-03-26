import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { createEvent, getAllEvents, getEventsByOrganizer } from "@/lib/db";

const SESSION_COOKIE = "eventhive_session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizerId = searchParams.get("organizerId");

  if (organizerId && !isNaN(Number(organizerId))) {
    return NextResponse.json(getEventsByOrganizer(Number(organizerId)));
  }

  return NextResponse.json(getAllEvents());
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
  const { name, date, location, description } = body as Record<string, string>;

  if (!name?.trim() || !date?.trim()) {
    return NextResponse.json(
      { error: "Name and date are required" },
      { status: 400 }
    );
  }

  const id = createEvent({
    name: name.trim(),
    date: date.trim(),
    location: location?.trim() || undefined,
    description: description?.trim() || undefined,
    organizer_id: payload.sub,
  });

  return NextResponse.json({ id }, { status: 201 });
}
