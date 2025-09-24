// src/routes/(app)/dashboard/+page.server.ts
import { getAllUsers } from "$lib/server/services/user.service";
import { getAllKeys } from "$lib/server/services/token.service";
import { getAllQueues } from "$lib/server/services/queue.service";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";

export async function load({ locals }) {
  if (!locals.user) throw redirect(302, "/login");

  // Get basic counts
  const [users, tokens, queues] = await Promise.all([
    getAllUsers(),
    getAllKeys(),
    getAllQueues(),
  ]);

  // Get count of operators (users with role 'user', not 'admin')
  const totalOperators = await prisma.user.count({
    where: {
      role: "user",
    },
  });

  // Get ticket statistics for today
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  // Get ticket statistics
  const [
    totalTicketsToday,
    pendingTickets,
    servingTickets,
    completedTickets,
    calledTickets,
    skippedTickets,
    cancelledTickets,
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.ticket.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "PENDING",
      },
    }),
    prisma.ticket.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "SERVING",
      },
    }),
    prisma.ticket.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "COMPLETED",
      },
    }),
    prisma.ticket.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "CALLED",
      },
    }),
    prisma.ticket.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "SKIPPED",
      },
    }),
    prisma.ticket.count({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "CANCELLED",
      },
    }),
  ]);

  // Get operator statistics (only users with role 'user', not 'admin')
  const operatorStats = await prisma.user.findMany({
    where: {
      role: "user", // Only include users with role 'user', exclude 'admin'
    },
    include: {
      _count: {
        select: {
          tickets: {
            where: {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Get queue statistics by queue
  const queueStats = await prisma.queue.findMany({
    include: {
      _count: {
        select: {
          tickets: {
            where: {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          },
        },
      },
    },
  });

  // Get most active queue today
  const mostActiveQueue = await prisma.queue.findFirst({
    where: {
      tickets: {
        some: {
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          tickets: {
            where: {
              date: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          },
        },
      },
    },
    orderBy: {
      tickets: {
        _count: "desc",
      },
    },
  });

  return {
    user: locals.user,
    users,
    tokens,
    queues,
    totalOperators,
    totalTicketsToday,
    pendingTickets,
    servingTickets,
    completedTickets,
    calledTickets,
    skippedTickets,
    cancelledTickets,
    operatorStats,
    queueStats,
    mostActiveQueue,
  };
}
