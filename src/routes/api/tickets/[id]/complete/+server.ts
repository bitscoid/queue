// src/routes/api/tickets/[id]/complete/+server.ts
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

    // Check if the ticket is being served by the current user (if user is authenticated)
    if (userId && ticket.servedByUserId !== userId) {
      throw error(403, "You are not authorized to complete this ticket");
    }

    // Update ticket status to COMPLETED
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
      include: { queue: true },
    });

    // Broadcast the ticket call event via WebSocket
    await broadcastTicketCall(updatedTicket, updatedTicket.queue);

    // Also broadcast the full queue update to ensure all clients have the latest data
    await broadcastUpdate();

    return json(updatedTicket);
  } catch (err: unknown) {
    console.error("Complete ticket error:", err);
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      err.status === 403
    ) {
      throw error(403, (err as Error).message);
    }
    throw error(500, "Failed to complete ticket");
  }
};
