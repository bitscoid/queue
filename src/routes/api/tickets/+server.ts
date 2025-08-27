// src/routes/api/tickets/+server.ts
import type { RequestHandler } from "./$types";
import prisma from '$lib/server/prisma';
import { startOfDay } from '$lib/client/utils/date';

export const GET: RequestHandler = async () => {
    const tickets = await prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return new Response(JSON.stringify(tickets));
};

export const POST: RequestHandler = async ({ request }) => {
    const { queueId } = await request.json();
    const today = startOfDay(new Date());

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

    const fullNumber = `${queue.ticketPrefix}-${String(seqNumber).padStart(3, '0')}`;

    const ticket = await prisma.ticket.create({
        data: {
            queueId,
            seqNumber,
            fullNumber,
            date: today,
        },
    });

    return new Response(JSON.stringify(ticket), { status: 201 });
};
