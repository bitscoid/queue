// src/lib/server/services/ticket.helper.ts
import prisma from "$lib/server/prisma";
import { incrementDailySequence } from "./dailySequence.service";

/**
 * Generate nomor tiket baru untuk queue tertentu
 */
export async function generateTicketNumber(queueId: number) {
    // ambil queue
    const queue = await prisma.queue.findUnique({
        where: { id: queueId },
        select: { ticketPrefix: true },
    });

    if (!queue) {
        throw new Error("Queue tidak ditemukan");
    }

    // hitung tanggal hari ini (startOfDay)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // increment daily sequence
    const seq = await incrementDailySequence(queueId, today);

    // format nomor urut jadi 3 digit (001, 002, dst.)
    const padded = String(seq.nextSeq).padStart(3, "0");

    // gabungkan prefix + nomor
    const fullNumber = `${queue.ticketPrefix}-${padded}`;

    return {
        queueId,
        seqNumber: seq.nextSeq,
        fullNumber,
        date: today,
    };
}
