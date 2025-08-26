// src/lib/server/services/ticket.service.ts
import prisma from "$lib/server/prisma";
import type { TicketStatus } from "@prisma/client";
import { generateTicketNumber } from "./ticket.helper";

export async function createNewTicket(queueId: number, servedByUserId?: number) {
    const ticketData = await generateTicketNumber(queueId);

    return prisma.ticket.create({
        data: {
            ...ticketData,
            servedByUserId: servedByUserId ?? null,
        },
        select: ticketSelect,
    });
}

const ticketSelect = {
    id: true,
    seqNumber: true,
    fullNumber: true,
    status: true,
    date: true,
    createdAt: true,
    updatedAt: true,
    queue: {
        select: { id: true, code: true, name: true, ticketPrefix: true },
    },
    servedByUser: {
        select: { id: true, name: true, role: true },
    },
};

export async function getAllTickets() {
    return prisma.ticket.findMany({
        select: ticketSelect,
        orderBy: { createdAt: "desc" },
    });
}

export async function getTicketById(id: number) {
    return prisma.ticket.findUnique({
        where: { id },
        select: ticketSelect,
    });
}

export async function createTicket(data: {
    queueId: number;
    seqNumber: number;
    fullNumber: string;
    date: Date;
    servedByUserId?: number;
}) {
    return prisma.ticket.create({
        data,
        select: ticketSelect,
    });
}

export async function updateTicket(
    id: number,
    data: Partial<{
        status: TicketStatus;
        servedByUserId: number | null;
    }>
) {
    return prisma.ticket.update({
        where: { id },
        data,
        select: ticketSelect,
    });
}

export async function deleteTicket(id: number) {
    return prisma.ticket.delete({
        where: { id },
    });
}
