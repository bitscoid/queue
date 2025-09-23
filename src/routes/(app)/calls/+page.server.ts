// src/routes/(app)/calls/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(302, '/login');

  if (!user.queueId) throw redirect(302, '/queues'); // user belum punya queue

  // Get the queue with tickets filtered for the current user (for calls)
  const queueForUser = await prisma.queue.findUnique({
    where: { id: user.queueId },
    include: {
      tickets: {
        where: {
          // Filter tickets by the current user (operator)
          servedByUserId: user.id,
          status: { in: ['PENDING', 'SERVING', 'CALLED'] },
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } // tiket hari ini
        },
        orderBy: { seqNumber: 'asc' }
      }
    }
  });

  // Get the queue with all tickets (for statistics and waiting queue)
  const queueForAll = await prisma.queue.findUnique({
    where: { id: user.queueId },
    include: {
      tickets: {
        where: {
          status: { in: ['PENDING', 'SERVING', 'CALLED'] },
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } // tiket hari ini
        },
        orderBy: { seqNumber: 'asc' }
      }
    }
  });

  if (!queueForUser || !queueForAll) throw redirect(302, '/queues');

  return {
    queue: {
      id: queueForUser.id,
      code: queueForUser.code,
      name: queueForUser.name,
      ticketPrefix: queueForUser.ticketPrefix,
      tickets: queueForUser.tickets.map(t => ({
        id: t.id,
        fullNumber: t.fullNumber,
        status: t.status,
        servedByUserId: t.servedByUserId // Include servedByUserId
      }))
    },
    allTickets: queueForAll.tickets.map(t => ({
      id: t.id,
      fullNumber: t.fullNumber,
      status: t.status
    })),
    currentUserId: user.id,
    userName: user.name,
    userCode: user.code,
    isAdmin: user.role === 'admin'
  };
};
