// src/routes/api/websocket/+server.ts
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

// This endpoint is just for documentation purposes
// The actual WebSocket server is started in hooks.server.ts

export const GET: RequestHandler = () => {
  throw error(
    404,
    "WebSocket endpoint - connect directly to ws://localhost:4000",
  );
};
