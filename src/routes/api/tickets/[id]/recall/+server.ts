// src/routes/api/tickets/[id]/recall/+server.ts
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

        // Check if the ticket was served by the current user (if user is authenticated)
        if (userId && ticket.servedByUserId !== userId) {
            throw error(403, 'You are not authorized to recall this ticket');
        }

        // Update ticket status to CALLED (recalled)
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                status: 'CALLED',
                updatedAt: new Date()
            },
            include: { queue: true }
        });

        // Broadcast the ticket call event via WebSocket
        await broadcastTicketCall(updatedTicket, updatedTicket.queue);

        return json(updatedTicket);
    } catch (err: any) {
        console.error('Recall ticket error:', err);
        if (err.status === 403) {
            throw error(403, err.message);
        }
        throw error(500, 'Failed to recall ticket');
    }
};