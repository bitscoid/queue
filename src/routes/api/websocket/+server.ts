// src/routes/api/websocket/+server.ts
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { WebSocketServer } from 'ws';
import prisma from '$lib/server/prisma';

// This endpoint is just for documentation purposes
// The actual WebSocket server is started in hooks.server.ts

export const GET: RequestHandler = async () => {
    throw error(404, 'WebSocket endpoint - connect directly to ws://localhost:4000');
};