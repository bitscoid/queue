// src/routes/api/tickets/[id]/+server.ts
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/prisma";

export const PUT: RequestHandler = async ({ params, request }) => {
  const id = Number(params.id);
  const data = await request.json();

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data,
    });
    return new Response(JSON.stringify(ticket), { status: 200 });
  } catch (err) {
    console.error("Update ticket error:", err);
    return new Response(
      JSON.stringify({ error: "Ticket not found or update failed" }),
      { status: 404 },
    );
  }
};

// DELETE handler
export const DELETE: RequestHandler = async ({ params }) => {
  const id = Number(params.id);

  try {
    await prisma.ticket.delete({
      where: { id },
    });
    return new Response(
      JSON.stringify({ message: "Ticket deleted successfully" }),
      { status: 200 },
    );
  } catch (err) {
    console.error("Delete ticket error:", err);
    return new Response(
      JSON.stringify({ error: "Ticket not found or delete failed" }),
      { status: 404 },
    );
  }
};
