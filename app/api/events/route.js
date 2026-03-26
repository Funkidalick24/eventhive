import { prisma } from "@/lib/prisma";

export async function Post(req){
    try {
        const body = await req.json();

        const { title, description, location, date, userId } = body;

        if (!title || !date) {
            return Response.json(
                {error: "Title and date are required"},
                {status: 400 }
            );
        }

        const event = await prisma.event.create({
            data:{
                title,
                description,
                location,
                date: new Date(date),
                userId,
            },
        });

        return Response.json(event);

    } catch (error) {
        return Response.json( { error: "Something went Wrong."}, { status: 500 });

    }

}

export async function POST(req) {
  try {
    const body = await req.json();

    const { title, description, location, date, userId } = body;

    if (!title || !date) {
      return Response.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        userId,
      },
    });

    return Response.json(event);
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}