// src/lib/server/services/dailySequence.service.ts
import prisma from "$lib/server/prisma";

/**
 * Ambil daily sequence untuk queue tertentu di hari tertentu
 */
export async function getDailySequence(queueId: number, date: Date) {
  return prisma.dailySequence.findUnique({
    where: {
      queueId_date: { queueId, date },
    },
  });
}

/**
 * Increment nomor antrian harian dan kembalikan nextSeq terbaru
 */
export async function incrementDailySequence(queueId: number, date: Date) {
  return prisma.dailySequence.upsert({
    where: {
      queueId_date: { queueId, date },
    },
    update: { nextSeq: { increment: 1 } },
    create: { queueId, date, nextSeq: 1 },
  });
}
