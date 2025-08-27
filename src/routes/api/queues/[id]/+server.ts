// src/routes/api/queues/[id]/+server.ts
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const PUT: RequestHandler = async ({ params, request }) => {
    const id = Number(params.id);
    const data = await request.json();

    // Validasi sederhana: pastikan hanya field yang boleh diupdate
    const updateData: {
        code?: string;
        name?: string;
        ticketPrefix?: string;
    } = {};

    if (data.code) updateData.code = data.code;
    if (data.name) updateData.name = data.name;
    if (data.ticketPrefix) updateData.ticketPrefix = data.ticketPrefix;

    try {
        const queue = await prisma.queue.update({
            where: { id },
            data: updateData,
        });

        return new Response(JSON.stringify(queue), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
        });
    }
};

// DELETE Queue
export const DELETE: RequestHandler = async ({ params }) => {
    const id = Number(params.id);

    try {
        const deletedQueue = await prisma.queue.delete({
            where: { id },
        });

        return new Response(JSON.stringify(deletedQueue), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
        });
    }
};