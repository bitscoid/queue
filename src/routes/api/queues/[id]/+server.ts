// src/routes/api/queues/[id]/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const GET: RequestHandler = async ({ params }) => {
    const id = Number(params.id);

    try {
        const queue = await prisma.queue.findUnique({
            where: { id },
            include: {
                tickets: {
                    where: {
                        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                    },
                    orderBy: { seqNumber: 'asc' }
                }
            }
        });

        if (!queue) {
            throw error(404, 'Queue not found');
        }

        return json({
            id: queue.id,
            code: queue.code,
            name: queue.name,
            ticketPrefix: queue.ticketPrefix,
            tickets: queue.tickets.map(t => ({
                id: t.id,
                fullNumber: t.fullNumber,
                status: t.status
            }))
        });
    } catch (err) {
        console.error('Get queue error:', err);
        throw error(500, 'Failed to get queue');
    }
};