/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/server/websocket.ts
import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "http";
import prisma from "$lib/server/prisma";
import { registerMiddleware } from "./prismaMiddleware";

let wss: WebSocketServer | null = null;

// Simpan global reference supaya middleware bisa akses
declare global {
    var wss: WebSocketServer | null;
    var buildQueuesPayload: (() => Promise<any>) | undefined;
}

export function startWebSocket(server?: Server): WebSocketServer {
    if (wss) return wss;

    // ✅ Bedakan production vs development
    if (server) {
        wss = new WebSocketServer({ server });
        console.log("🚀 WS attached to existing server");
    } else {
        wss = new WebSocketServer({ port: 4000 });
        console.log("🚀 WS standalone at ws://localhost:4000");
    }

    globalThis.wss = wss;
    globalThis.buildQueuesPayload = buildQueuesPayload;

    wss.on("connection", (ws: WebSocket) => {
        console.log("📡 Client connected");
        void sendQueues(ws);
    });

    // ✅ Daftarkan middleware Prisma 6.x
    registerMiddleware(prisma);

    return wss;
}

// 🔹 Helper: ambil data antrian + format payload
async function buildQueuesPayload() {
    // Filter hanya layanan DESAINER
    const queues = await prisma.queue.findMany({
        where: {
            code: 'DESAINER'
        },
        include: {
            users: true,
            tickets: {
                where: {
                    date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                },
                orderBy: { seqNumber: "asc" },
            },
        },
    });

    return {
        queues: queues.map((q) => {
            const total = q.tickets.length;
            const done = q.tickets.filter((t) => t.status === "COMPLETED").length;
            const remaining = q.tickets.filter(
                (t) =>
                    t.status === "PENDING" ||
                    t.status === "CALLED" ||
                    t.status === "SERVING"
            ).length;

            const currentTickets = q.tickets.filter(
                (t) => t.status === "SERVING" || t.status === "CALLED"
            );

            return {
                id: q.id,
                code: q.code,
                name: q.name,
                prefix: q.ticketPrefix,
                total,
                done,
                remaining,
                current: currentTickets.map((t) => t.fullNumber),
                counters: q.users.map((u) => ({
                    id: u.id,
                    name: u.name,
                    ticket:
                        q.tickets.find(
                            (t) =>
                                t.servedByUserId === u.id &&
                                (t.status === "SERVING" || t.status === "CALLED")
                        )?.fullNumber ?? "-",
                })),
            };
        }),
    };
}

// 🔹 Helper: kirim data sekali ke client tertentu
async function sendQueues(ws: WebSocket) {
    const payload = await buildQueuesPayload();
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(payload));
    }
}
