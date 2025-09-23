// src/routes/api/tickets/+server.ts
import type { RequestHandler } from "./$types";
import prisma from '$lib/server/prisma';
import { startOfDay } from '$lib/client/utils/date';
import { broadcastUpdate } from '$lib/server/websocket';

export const GET: RequestHandler = async () => {
    try {
        const tickets = await prisma.ticket.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return new Response(JSON.stringify(tickets), { status: 200 });
    } catch (err) {
        console.error("GET tickets error:", err);
        return new Response(JSON.stringify({ error: 'Failed to fetch tickets' }), { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { queueId } = await request.json();

        if (!queueId) {
            return new Response(JSON.stringify({ error: 'queueId is required' }), { status: 400 });
        }

        const today = startOfDay(new Date()); // sequence harian
        const now = new Date();               // timestamp ticket

        // Ambil sequence harian
        let sequence = await prisma.dailySequence.findUnique({
            where: {
                queueId_date: {
                    queueId,
                    date: today,
                },
            },
        });

        if (!sequence) {
            sequence = await prisma.dailySequence.create({
                data: {
                    queueId,
                    date: today,
                    nextSeq: 1,
                },
            });
        }

        const seqNumber = sequence.nextSeq;

        // Update nextSeq
        await prisma.dailySequence.update({
            where: { id: sequence.id },
            data: { nextSeq: { increment: 1 } },
        });

        const queue = await prisma.queue.findUniqueOrThrow({ where: { id: queueId } });
        const fullNumber = String(seqNumber);

        // Simpan ticket
        const ticket = await prisma.ticket.create({
            data: {
                queueId,
                seqNumber,
                fullNumber,
                date: now,
            },
        });

        // Broadcast update to all connected clients
        await broadcastUpdate();

        return new Response(JSON.stringify(ticket), { status: 201 });
    } catch (err) {
        console.error("POST ticket error:", err);
        return new Response(JSON.stringify({ error: 'Failed to create ticket' }), { status: 500 });
    }
};
