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
    wss = new WebSocketServer({ 
      server,
      path: "/ws", // Menentukan path WebSocket untuk production
      // Tambahkan konfigurasi untuk memastikan kompatibilitas dengan reverse proxy
      verifyClient: () => {
        // Izinkan semua koneksi dari domain yang sama
        return true;
      }
    });
    console.log("🚀 WS attached to existing server at /ws");
  } else {
    wss = new WebSocketServer({ 
      port: 4000,
      path: "/ws" // Menentukan path WebSocket juga untuk development
    });
    console.log("🚀 WS standalone at ws://localhost:4000/ws (for development)");
  }

  globalThis.wss = wss;
  globalThis.buildQueuesPayload = buildQueuesPayload;

  wss.on("connection", (ws: WebSocket) => {
    console.log("📡 Client connected");
    void sendQueues(ws);

    // Handle incoming messages from clients
    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "PING") {
          ws.send(JSON.stringify({ type: "PONG" }));
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    });

    // Log when client disconnects
    ws.on("close", () => {
      console.log("📡 Client disconnected");
    });
  });

  // ✅ Daftarkan middleware Prisma 6.x
  registerMiddleware(prisma);

  return wss;
}

// 🔹 Helper: ambil data antrian + format payload
async function buildQueuesPayload() {
  // Get all queues
  const queues = await prisma.queue.findMany({
    include: {
      users: {
        where: {
          role: "user", // Hanya ambil user dengan role 'user', bukan 'admin'
        },
      },
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
      const remaining = q.tickets.filter((t) => t.status === "PENDING").length;

      // Get all currently served tickets (SERVING or CALLED, but not SKIPPED or COMPLETED)
      const currentTickets = q.tickets.filter(
        (t) => t.status === "SERVING" || t.status === "CALLED",
      );

      // Group tickets by user (counter)
      const counterTickets: Record<string, string[]> = {};

      q.users.forEach((user) => {
        const userTickets = currentTickets
          .filter((t) => t.servedByUserId === user.id)
          .map((t) => t.fullNumber);

        if (userTickets.length > 0) {
          counterTickets[user.code || user.name] = userTickets;
        }
      });

      const counters = q.users.map((u) => {
        // Find tickets that are being served by this user
        const userTickets = q.tickets.filter((t) => t.servedByUserId === u.id);

        // Filter for active tickets (SERVING or CALLED, but not SKIPPED or COMPLETED)
        const activeTickets = userTickets.filter(
          (t) => t.status === "SERVING" || t.status === "CALLED",
        );

        // Get the first active ticket, or null if no active tickets
        const ticket = activeTickets.length > 0 ? activeTickets[0] : null;

        return {
          id: u.id,
          name: u.name,
          code: u.code,
          ticket: ticket?.fullNumber ?? "-",
          ticketStatus: ticket?.status ?? null,
        };
      });

      return {
        id: q.id,
        code: q.code,
        name: q.name,
        prefix: q.ticketPrefix,
        total,
        done,
        remaining,
        current: currentTickets.map((t) => t.fullNumber),
        counterTickets, // New field to show tickets per counter
        counters,
        tickets: q.tickets.map((t) => ({
          id: t.id,
          fullNumber: t.fullNumber,
          status: t.status,
          servedByUserId: t.servedByUserId,
          queueId: t.queueId,
          seqNumber: t.seqNumber,
          date: t.date,
        })),
      };
    }),
    time: new Date().toISOString(),
  };
}

// 🔹 Helper: kirim data sekali ke client tertentu
async function sendQueues(ws: WebSocket) {
  const payload = await buildQueuesPayload();
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

// 🔹 Helper: kirim update ke semua client
export async function broadcastUpdate() {
  if (globalThis.wss && globalThis.buildQueuesPayload) {
    try {
      const payload = await globalThis.buildQueuesPayload();
      let clientCount = 0;
      globalThis.wss.clients.forEach((client: any) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(payload));
          clientCount++;
        }
      });
      console.log(`📡 Broadcasted update to ${clientCount} clients`);
    } catch (error) {
      console.error("Error broadcasting update:", error);
    }
  } else {
    console.log(
      "📡 No clients to broadcast to or buildQueuesPayload not available",
    );
  }
}

// 🔹 Helper: kirim notifikasi panggilan tiket ke semua client
export async function broadcastTicketCall(ticket: any, queue: any) {
  if (globalThis.wss) {
    // Get operator information if ticket has servedByUserId
    let operator = null;
    if (ticket.servedByUserId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: ticket.servedByUserId },
          select: { name: true, code: true },
        });
        if (user) {
          operator = {
            name: user.name,
            code: user.code,
          };
        }
      } catch (err) {
        console.error("Failed to fetch operator info:", err);
      }
    }

    const payload = {
      type: "TICKET_CALL",
      ticket: {
        id: ticket.id,
        fullNumber: ticket.fullNumber,
        status: ticket.status,
        queueId: ticket.queueId,
        servedByUserId: ticket.servedByUserId,
      },
      queue: {
        id: queue.id,
        name: queue.name,
        code: queue.code,
      },
      operator, // Include operator info if available
      timestamp: new Date().toISOString(),
    };

    let clientCount = 0;
    globalThis.wss.clients.forEach((client: any) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(payload));
        clientCount++;
      }
    });
    console.log(`📢 Broadcasted ticket call to ${clientCount} clients`);
  }
}
