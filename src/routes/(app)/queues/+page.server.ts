// src/routes/(app)/queues/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import type { Queue } from "$lib/client/stores/queue.store";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;

  if (!user) {
    throw redirect(302, "/login");
  }

  const isAdmin = user.role === "admin";
  let queuesList: Queue[] = [];

  if (isAdmin) {
    // Admin bisa lihat semua queue
    const allQueues = await prisma.queue.findMany({
      orderBy: { name: "asc" },
    });

    queuesList = allQueues.map((q) => ({
      id: q.id,
      code: q.code,
      name: q.name,
      ticketPrefix: q.ticketPrefix,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    }));
  } else {
    // User biasa hanya bisa lihat queue yang dilayaninya
    if (user.queueId) {
      const queue = await prisma.queue.findUnique({
        where: { id: user.queueId },
      });

      if (queue) {
        queuesList = [
          {
            id: queue.id,
            code: queue.code,
            name: queue.name,
            ticketPrefix: queue.ticketPrefix,
            createdAt: queue.createdAt.toISOString(),
            updatedAt: queue.updatedAt.toISOString(),
          },
        ];
      }
    }
  }

  return {
    queues: queuesList,
    isAdmin,
    currentUserId: user.id,
    userQueueId: user.queueId,
  };
};
