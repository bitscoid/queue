// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import prisma from "$lib/server/prisma";
import { startWebSocket } from "$lib/server/websocket";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// ✅ Pastikan WS hanya start sekali
declare global {
  // biar tidak error TS7017
  var __wsStarted: boolean | undefined;
  var __server: import("http").Server | undefined;
}

if (!globalThis.__wsStarted) {
  const server = globalThis.__server;

  if (server) {
    // Production (adapter-node)
    startWebSocket(server);
    console.log("✅ WebSocket attached to adapter-node server");
  } else {
    // Development (vite dev)
    startWebSocket(); // otomatis buka port 4000
    console.log("✅ Dev WebSocket server running at ws://localhost:4000");
  }

  globalThis.__wsStarted = true;
}


export const handle: Handle = async ({ event, resolve }) => {
  // 🌡️ Prisma warm-up (optional di dev)
  if (process.env.NODE_ENV !== "production") {
    await prisma.$connect();
  }

  const authHeader = event.request.headers.get("authorization");
  const cookieToken = event.cookies.get("token");

  // 1. Bearer token (API eksternal)
  if (authHeader?.startsWith("Bearer ")) {
    const apiToken = authHeader.split(" ")[1];
    try {
      const tokenRecord = await prisma.apiToken.findUnique({
        where: { token: apiToken },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              photo: true,
            },
          },
        },
      });

      if (tokenRecord && !tokenRecord.revoked) {
        event.locals.token = {
          id: tokenRecord.id,
          name: tokenRecord.name,
          token: tokenRecord.token,
          revoked: tokenRecord.revoked,
          createdAt: tokenRecord.createdAt,
          creator: tokenRecord.creator,
        };
        event.locals.user = tokenRecord.creator;
        return resolve(event);
      } else {
        console.warn("Invalid or revoked API token");
      }
    } catch (err) {
      console.error("Error verifying API token:", err);
    }
  }

  // 2. JWT cookie (browser login)
  if (cookieToken) {
    try {
      const decoded = jwt.verify(cookieToken, JWT_SECRET) as { id: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          photo: true,
        },
      });

      if (user) {
        event.locals.user = user;
      } else {
        console.warn("User not found for decoded token ID");
        event.cookies.delete("token", { path: "/" });
      }
    } catch (err) {
      console.error("Invalid JWT cookie:", err);
      event.cookies.delete("token", { path: "/" });
      event.locals.user = undefined;
    }
  }

  return resolve(event);
};
