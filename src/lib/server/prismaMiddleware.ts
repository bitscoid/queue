/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/server/prismaMiddleware.ts
import { PrismaClient } from "@prisma/client";
import { broadcastUpdate } from "./websocket";

export function registerMiddleware(prisma: PrismaClient) {
    prisma.$extends({
        model: {
            $allModels: {
                $allOperations: async (params: any, next: (p: any) => Promise<any>) => {
                    const result = await next(params);

                    // Send updates for ticket changes and queue changes
                    if ((params.model === "Ticket" && ["create", "update"].includes(params.action)) || 
                        (params.model === "Queue" && ["create", "update"].includes(params.action))) {
                        // Use the broadcastUpdate function which handles the WebSocket communication
                        await broadcastUpdate();
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return result;
                }
            }
        }
    });
}
