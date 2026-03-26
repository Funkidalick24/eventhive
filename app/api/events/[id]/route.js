import prisma from "@/lib/prisma";

export async function Put(req, { params }) {
    try {
        const { id } = params;
        const body = await req.json(); 
        
        const updated =  await prisma.event.update({
            where: { id },
            data:{
                ...body,
                date: body.date ? new date(body.date) : undefined
            },
        });

        return Response.json(updated);
    } catch (error) {
        return Response.json({error: "Update failed"}, {status: 500});
    }
}

export async function Delete(req, { params}) {
    try {
        const { id } = params;

        await prisma.event.delete({
            where: { id},
        });

        return Response.json({ success: true});
    } catch ( error) {
        return Response.json({ error: "Delete Failed"}, { status: 500});
    }
}