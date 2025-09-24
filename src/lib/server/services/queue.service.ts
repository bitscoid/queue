// src/lib/server/services/queue.service.ts
import prisma from "$lib/server/prisma";

const queueSelect = {
  id: true,
  code: true,
  name: true,
  ticketPrefix: true,
  createdAt: true,
  updatedAt: true,
};

export async function getAllQueues() {
  return prisma.queue.findMany({
    select: queueSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getQueueById(id: number) {
  return prisma.queue.findUnique({
    where: { id },
    select: queueSelect,
  });
}

export async function createQueue(data: {
  code: string;
  name: string;
  ticketPrefix: string;
}) {
  return prisma.queue.create({
    data,
    select: queueSelect,
  });
}

export async function updateQueue(
  id: number,
  data: Partial<{
    code: string;
    name: string;
    ticketPrefix: string;
  }>,
) {
  return prisma.queue.update({
    where: { id },
    data,
    select: queueSelect,
  });
}

export async function deleteQueue(id: number) {
  return prisma.queue.delete({
    where: { id },
  });
}
