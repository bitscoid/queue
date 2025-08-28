// src/routes/(app)/calls/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(302, '/login');

  if (!user.queueId) throw redirect(302, '/queues'); // user belum punya queue

  const queue = await prisma.queue.findUnique({
    where: { id: user.queueId },
    include: {
      tickets: {
        where: {
          status: { in: ['PENDING', 'SERVING'] },
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } // tiket hari ini
        },
        orderBy: { seqNumber: 'asc' }
      }
    }
  });

  if (!queue) throw redirect(302, '/queues');

  return {
    queue: {
      id: queue.id,
      code: queue.code,
      name: queue.name,
      ticketPrefix: queue.ticketPrefix,
      tickets: queue.tickets.map(t => ({
        id: t.id,
        fullNumber: t.fullNumber,
        status: t.status
      }))
    },
    currentUserId: user.id,
    isAdmin: user.role === 'admin'
  };
};
