// src/routes/api/queues/+server.ts
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/prisma";

export const GET: RequestHandler = async () => {
  const queues = await prisma.queue.findMany({
    orderBy: { id: "asc" },
  });
  return new Response(JSON.stringify(queues));
};

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const queue = await prisma.queue.create({ data });
  return new Response(JSON.stringify(queue), { status: 201 });
};
