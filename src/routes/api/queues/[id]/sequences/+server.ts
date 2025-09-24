// src/routes/api/queues/[id]/sequences/+server.ts
import type { RequestHandler } from "../$types";
import prisma from "$lib/server/prisma";

export const GET: RequestHandler = async ({ params }) => {
  const queueId = Number(params.id);

  const sequences = await prisma.dailySequence.findMany({
    where: { queueId },
    orderBy: { date: "desc" },
  });

  return new Response(JSON.stringify(sequences));
};
