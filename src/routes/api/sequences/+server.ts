// src/routes/api/sequences/+server.ts
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/prisma";

// GET /api/sequences?date=2025-08-26
export const GET: RequestHandler = async ({ url }) => {
    try {
        const dateStr = url.searchParams.get("date");
        const date = dateStr ? new Date(dateStr) : new Date();

        // startOfDay (jam 00:00)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const sequences = await prisma.dailySequence.findMany({
            where: { date: startOfDay },
            include: { queue: true },
        });

        return json({
            success: true,
            message: "Daftar daily sequence",
            data: sequences,
        });
    } catch (e: any) {
        return json(
            { success: false, message: e.message ?? "Gagal ambil data" },
            { status: 500 }
        );
    }
};
