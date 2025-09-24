// src/routes/api/tickets/[id]/serve/+server.ts
import type { RequestHandler } from "./$types";
import { json, error } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { broadcastTicketCall, broadcastUpdate } from "$lib/server/websocket";

export const POST: RequestHandler = async ({ params, locals }) => {
  const id = Number(params.id);
  const userId = locals.user?.id;

  try {
    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { queue: true },
    });

    if (!ticket) {
      throw error(404, "Ticket not found");
    }

    // Check if ticket is in CALLED status
    if (ticket.status !== "CALLED") {
      throw error(400, "Ticket is not in CALLED status");
    }

    // Update ticket status to SERVING and associate with the user who is serving it
    const updateData: {
      status: "CALLED" | "SERVING" | "COMPLETED" | "SKIPPED" | "CANCELLED";
      updatedAt: Date;
      servedByUserId?: number;
    } = {
      status: "SERVING",
      updatedAt: new Date(),
    };

    // If user is authenticated, associate the ticket with them
    if (userId) {
      updateData.servedByUserId = userId;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: { queue: true },
    });

    // Broadcast the ticket call event via WebSocket
    await broadcastTicketCall(updatedTicket, updatedTicket.queue);

    // Also broadcast the full queue update to ensure all clients have the latest data
    await broadcastUpdate();

    return json(updatedTicket);
  } catch (err) {
    console.error("Serve ticket error:", err);
    if (err instanceof Error) {
      throw error(500, `Failed to serve ticket: ${err.message}`);
    }
    throw error(500, "Failed to serve ticket");
  }
};
