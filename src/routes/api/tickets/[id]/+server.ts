// src/routes/api/tickets/[id]/+server.ts
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const PUT: RequestHandler = async ({ params, request }) => {
    const id = Number(params.id);
    const data = await request.json();

    const ticket = await prisma.ticket.update({
        where: { id },
        data,
    });

    return new Response(JSON.stringify(ticket));
};
