/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/server/prismaMiddleware.ts
import { PrismaClient } from "@prisma/client";

export function registerMiddleware(prisma: PrismaClient) {
    prisma.$extends({
        model: {
            $allModels: {
                $allOperations: async (params: any, next: (p: any) => Promise<any>) => {
                    const result = await next(params);

                    if (params.model === "Ticket" && ["create", "update"].includes(params.action)) {
                        if (globalThis.wss && globalThis.buildQueuesPayload) {
                            const payload = await globalThis.buildQueuesPayload();
                            globalThis.wss.clients.forEach((c: any) => {
                                if (c.readyState === c.OPEN) c.send(JSON.stringify(payload));
                            });
                        }
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return result;
                }
            }
        }
    });
}
