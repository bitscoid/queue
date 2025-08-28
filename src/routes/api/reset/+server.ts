// src/routes/api/tickets/reset-sequence/+server.ts
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/prisma";
import { startOfDay } from "$lib/client/utils/date";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { queueId } = await request.json();

    if (!queueId) {
      return new Response(
        JSON.stringify({ error: "queueId is required" }),
        { status: 400 }
      );
    }

    const today = startOfDay(new Date());

    // Reset atau buat sequence baru
    const existing = await prisma.dailySequence.findUnique({
      where: { queueId_date: { queueId, date: today } },
    });

    if (existing) {
      await prisma.dailySequence.update({
        where: { id: existing.id },
        data: { nextSeq: 1 },
      });
    } else {
      await prisma.dailySequence.create({
        data: {
          queueId,
          date: today,
          nextSeq: 1,
        },
      });
    }

    return new Response(
      JSON.stringify({ message: "Sequence reset berhasil", queueId, date: today }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset sequence error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to reset sequence" }),
      { status: 500 }
    );
  }
};
