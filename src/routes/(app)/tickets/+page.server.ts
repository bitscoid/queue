// src/routes/(app)/tickets/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma'; // pastikan import default prisma
import type { Ticket } from '$lib/client/stores/ticket.store';
import { startOfDay } from '$lib/client/utils/date';

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, '/login');
  }

  const isAdmin = user.role === 'admin';
  let tickets: Ticket[] = [];

  if (isAdmin) {
    const allTickets = await prisma.ticket.findMany({
      include: {
        queue: true,
        servedByUser: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    tickets = allTickets.map((t) => ({
      ...t,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      queueName: t.queue?.name ?? '',
      servedByName: t.servedByUser?.name ?? null,
      fullNumber: t.fullNumber ?? `${t.queue.ticketPrefix}-${String(t.seqNumber).padStart(3, '0')}`,
    }));
  } else {
    // untuk user biasa, ambil hanya ticket di queue yang dilayani
    const userWithQueue = await prisma.user.findUnique({
      where: { id: user.id },
      include: { queue: true },
    });

    if (userWithQueue?.queueId) {
      const today = startOfDay(new Date());
      const userTickets = await prisma.ticket.findMany({
        where: {
          queueId: userWithQueue.queueId,
          date: today,
        },
        include: { queue: true, servedByUser: true },
        orderBy: { seqNumber: 'asc' },
      });

      tickets = userTickets.map((t) => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        queueName: t.queue?.name ?? '',
        servedByName: t.servedByUser?.name ?? null,
        fullNumber: t.fullNumber ?? `${t.queue.ticketPrefix}-${String(t.seqNumber).padStart(3, '0')}`,
      }));
    }
  }

  return {
    tickets,
    isAdmin,
    currentUserId: user.id,
  };
};
