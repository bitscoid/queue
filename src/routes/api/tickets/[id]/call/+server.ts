// src/routes/api/tickets/[id]/call/+server.ts
import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { broadcastTicketCall } from '$lib/server/websocket';

export const POST: RequestHandler = async ({ params, locals }) => {
    const id = Number(params.id);
    const userId = locals.user?.id;

    try {
        // Find the ticket
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: { queue: true }
        });

        if (!ticket) {
            throw error(404, 'Ticket not found');
        }

        // Update ticket status to CALLED and associate with the user who called it
        const updateData: any = {
            status: 'CALLED',
            updatedAt: new Date()
        };

        // If user is authenticated, associate the ticket with them
        if (userId) {
            updateData.servedByUserId = userId;
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: updateData,
            include: { queue: true }
        });

        // Broadcast the ticket call event via WebSocket
        await broadcastTicketCall(updatedTicket, updatedTicket.queue);

        return json(updatedTicket);
    } catch (err) {
        console.error('Call ticket error:', err);
        throw error(500, 'Failed to call ticket');
    }
};